// AI可視性 定点計測 v2（scripts/ai-visibility）の検証。
// 設問の健全性・判定ロジック（引用／名指し／順位／丸写し除外）・CSV・異常検知・ワークフローの前提を固定する。
import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODEL,
  NAMED_TERMS_DEFAULT,
  RESULTS_HEADER,
  SUMMARY_HEADER,
  buildRequest,
  csvLine,
  describeHttpError,
  detectAnomaly,
  isOwnHost,
  isOwnUrl,
  judge,
  normalizeHost,
  parseCsv,
  parseResponse,
  renderWeeklyMd,
  retryableStatus,
  stripEcho,
  summarize,
} from "../../../scripts/ai-visibility/lib.mjs";

const ROOT = join(__dirname, "..", "..", "..");
const DIR = join(ROOT, "scripts", "ai-visibility");
const qset = JSON.parse(readFileSync(join(DIR, "questions.json"), "utf8")) as {
  version: string;
  categories: Record<string, string>;
  questions: { id: string; cat: string; lang: string; type: string; q: string; legacy?: number; namedTerms?: string[] }[];
};
const fixtures = JSON.parse(readFileSync(join(DIR, "fixtures", "mock-gemini.json"), "utf8")) as Record<string, unknown>;
const q = (id: string) => qset.questions.find((x) => x.id === id)!;

type Chunk = { index: number; uri: string; title: string; host: string; resolvedUrl: string; supported: boolean };
type Parsed = { text: string; chunks: Chunk[]; searchQueries: string[]; finishReason: string; usage: { tokensIn: number; tokensOut: number; tokensThought: number } };

/** fixture → parseResponse → （mock と同じく）title からホストを補う */
function parsed(id: string): Parsed {
  const p = parseResponse(fixtures[id] ?? fixtures.default) as Parsed;
  for (const c of p.chunks) if (!c.host && c.uri) c.host = normalizeHost(c.uri);
  return p;
}

describe("questions.json（設問30問）", () => {
  it("30問・IDが一意・分類と言語が定義内", () => {
    expect(qset.questions).toHaveLength(30);
    const ids = qset.questions.map((x) => x.id);
    expect(new Set(ids).size).toBe(30);
    expect(ids).toEqual([...ids].sort());
    for (const x of qset.questions) {
      expect(Object.keys(qset.categories)).toContain(x.cat);
      expect(["ja", "zh", "zh-tw"]).toContain(x.lang); // サイトのロケール表記に合わせる
      expect(["相談先型", "知識型", "指名型"]).toContain(x.type);
      expect(x.q.trim().length).toBeGreaterThanOrEqual(6);
    }
  });
  it("旧45問からの継続番号は重複しない（同じ土俵で比べるため）", () => {
    const legacy = qset.questions.map((x) => x.legacy).filter((n): n is number => typeof n === "number");
    expect(legacy.length).toBeGreaterThanOrEqual(8);
    expect(new Set(legacy).size).toBe(legacy.length);
  });
  it("設問に禁止語・他社名・案件情報を含めない", () => {
    const banned = ["ワンストップ", "SUUMO", "スーモ", "HOME'S", "ホームズ", "最安", "格安", "様", "TR-"];
    for (const x of qset.questions) for (const b of banned) expect(x.q, `${x.id} に「${b}」`).not.toContain(b);
  });
  it("全8分類に設問があり、指名型は名指し判定語を持つ設問（士業ドットコム）を含む", () => {
    for (const cat of Object.keys(qset.categories)) expect(qset.questions.some((x) => x.cat === cat), `分類 ${cat} が空`).toBe(true);
    const samurai = qset.questions.find((x) => x.q.includes("士業ドットコム"));
    expect(samurai?.namedTerms).toContain("士業ドットコム");
  });
});

describe("parseResponse（Gemini応答の取り出し）", () => {
  it("本文・出典・検索語・supported を取り出す", () => {
    const p = parsed("q01");
    expect(p.text).toContain("四葉不動産株式会社");
    expect(p.chunks).toHaveLength(3);
    expect(p.chunks.map((c) => c.host)).toEqual(["bestexnet.co.jp", "luck428.com", "city.bunkyo.lg.jp"]);
    expect(p.chunks.map((c) => c.supported)).toEqual([true, true, false]);
    expect(p.searchQueries).toEqual(["文京区 小学校 学区 賃貸"]);
    expect(p.finishReason).toBe("STOP");
  });
  it("domain フィールドがあれば title より優先し、www. を落とす", () => {
    const p = parseResponse({ candidates: [{ content: { parts: [{ text: "x" }] }, groundingMetadata: { groundingChunks: [{ web: { uri: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/a", title: "四葉不動産｜文京区", domain: "www.luck428.com" } }] } }] });
    expect(p.chunks[0].host).toBe("luck428.com");
  });
  it("候補なし・ブロックは欠測扱いの理由を返す", () => {
    expect(parseResponse({}).finishReason).toBe("no-candidate");
    expect(parseResponse({ promptFeedback: { blockReason: "SAFETY" } }).finishReason).toBe("blocked:SAFETY");
    expect(parsed("q26").chunks).toHaveLength(0);
  });
  it("thought パートは本文に含めない", () => {
    const p = parseResponse({ candidates: [{ content: { parts: [{ text: "考え中：四葉", thought: true }, { text: "回答" }] } }] });
    expect(p.text).toBe("回答");
  });
});

describe("judge（引用・名指し・順位）", () => {
  it("q01：自社が2番目の出典で、根拠として使われ、本文でも名指し", () => {
    const p = parsed("q01");
    const j = judge(q("q01"), p.text, p.chunks);
    expect(j.cite).toBe(1);
    expect(j.citeRank).toBe(2);
    expect(j.citeSupported).toBe(1);
    expect(j.named).toBe(1);
    expect(j.namedHits).toContain("四葉");
    expect(j.domains).toEqual(["bestexnet.co.jp", "luck428.com", "city.bunkyo.lg.jp"]);
    expect(j.competitorDomains).toEqual(["bestexnet.co.jp", "city.bunkyo.lg.jp"]);
  });
  it("q07：設問の丸写し（「文京区の四葉不動産の…」）は名指しに数えない。引用は1位", () => {
    const p = parsed("q07");
    const j = judge(q("q07"), p.text, p.chunks);
    expect(j.named).toBe(0);
    expect(j.cite).toBe(1);
    expect(j.citeRank).toBe(1);
    expect(j.citeSupported).toBe(1);
  });
  it("q19：簡体字「四叶」も名指し。supports が空なら citeSupported=0", () => {
    const p = parsed("q19");
    const j = judge(q("q19"), p.text, p.chunks);
    expect(j.named).toBe(1);
    expect(j.namedHits).toContain("四叶");
    expect(j.cite).toBe(1);
    expect(j.citeSupported).toBe(0);
  });
  it("q26：出典なしは引用0・名指し0・ドメイン空", () => {
    const p = parsed("q26");
    const j = judge(q("q26"), p.text, p.chunks);
    expect(j).toMatchObject({ cite: 0, citeRank: "", citeSupported: 0, named: 0, domains: [], ownUrls: [] });
  });
  it("namedTerms 指定の設問（士業ドットコム）は既定語（四葉）では名指しにしない", () => {
    const qq = q("q29");
    expect(judge(qq, "紹介料をとらない士業の窓口として士業ドットコムがあります。", []).named).toBe(1);
    expect(judge(qq, "四葉不動産が運営しています。", []).named).toBe(0);
    expect(judge({ q: "文京区 不動産", namedTerms: [] }, "四葉不動産", []).named).toBe(1);
  });
  it("転送URLの実体（resolvedUrl）が自社なら title が無くても引用に数える", () => {
    const chunks = [
      { index: 0, uri: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/x", title: "学区から探す", host: "", resolvedUrl: "https://luck428.com/gakku/rentals", supported: false },
      { index: 1, uri: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/y", title: "note", host: "", resolvedUrl: "https://note.com/luck428/n/abc", supported: true },
    ];
    const j = judge({ q: "文京区 学区 賃貸" }, "本文", chunks);
    expect(j.cite).toBe(1);
    expect(j.citeRank).toBe(1);
    expect(j.citeSupported).toBe(1);
    expect(j.ownUrls).toEqual(["https://luck428.com/gakku/rentals", "https://note.com/luck428/n/abc"]);
    expect(j.domains).toEqual(["luck428.com", "note.com"]);
  });
});

describe("stripEcho・ホスト判定", () => {
  it("設問そのもの／「」で引いた設問を本文から除く", () => {
    const question = "文京区の四葉不動産の仲介手数料はいくらですか？";
    expect(stripEcho(`${question} 公開情報では0.33ヶ月です。`, question)).not.toContain("四葉");
    expect(stripEcho(`「文京区の四葉不動産の仲介手数料はいくらですか」というご質問ですね。`, question)).not.toContain("四葉");
    expect(stripEcho("四葉不動産では0.33ヶ月です。", question)).toContain("四葉");
    expect(stripEcho("", question)).toBe("");
  });
  it("自社ホスト・自社URLの判定（サブドメイン可・似たドメインは不可）", () => {
    expect(isOwnHost("www.luck428.com")).toBe(true);
    expect(isOwnHost("samurai.co.jp")).toBe(true);
    expect(isOwnHost("luck428.com.example.net")).toBe(false);
    expect(isOwnHost("notluck428.com")).toBe(false);
    expect(isOwnUrl("https://note.com/luck428/n/n123")).toBe(true);
    expect(isOwnUrl("https://note.com/someone/n/n123")).toBe(false);
    expect(isOwnUrl("https://www.luck428.com/gakku")).toBe(true);
    expect(isOwnUrl("")).toBe(false);
    expect(NAMED_TERMS_DEFAULT).toContain("浦松丈二");
  });
  it("normalizeHost は URL・大文字・末尾ドットを吸収する", () => {
    expect(normalizeHost("HTTPS://WWW.Luck428.com/path?x=1")).toBe("luck428.com");
    expect(normalizeHost("city.bunkyo.lg.jp.")).toBe("city.bunkyo.lg.jp");
    expect(normalizeHost("")).toBe("");
  });
});

describe("リクエスト・CSV・集計・異常検知", () => {
  it("buildRequest は Google 検索グラウンディングを付け、設問をそのまま渡す（上限3072・思考low が既定、env で上書き可）", () => {
    const r = buildRequest("誠之小学校の学区で賃貸マンションを探しています。");
    expect(r.tools).toEqual([{ google_search: {} }]);
    expect(r.contents[0].parts[0].text).toBe("誠之小学校の学区で賃貸マンションを探しています。");
    expect(r.generationConfig.temperature).toBeLessThanOrEqual(0.3);
    expect(r.generationConfig.maxOutputTokens).toBe(DEFAULT_MAX_TOKENS);
    expect(DEFAULT_MAX_TOKENS).toBeGreaterThan(2048); // 初回計測で 2048 だと 24/30 が途中で切れた
    expect(r.generationConfig.thinkingConfig).toEqual({ thinkingLevel: "low" });
    const r2 = buildRequest("q", { maxOutputTokens: 4096, thinkingLevel: "none" });
    expect(r2.generationConfig.maxOutputTokens).toBe(4096);
    expect(r2.generationConfig).not.toHaveProperty("thinkingConfig");
    expect(DEFAULT_MODEL).toBe("gemini-3.8-flash");
  });
  it("parseResponse は usageMetadata からトークン数を取り、出力には思考トークンを含める", () => {
    const p = parsed("q01");
    expect(p.usage).toEqual({ tokensIn: 800, tokensOut: 2200, tokensThought: 400 });
    expect(parseResponse({}).usage).toEqual({ tokensIn: 0, tokensOut: 0, tokensThought: 0 });
  });
  it("再試行は混雑・一時障害だけ。課金切れ(402)・鍵の誤り(401/403)・入力の誤り(400/404)は即時に諦め、原因を一文で示す", () => {
    for (const s of [429, 500, 502, 503, 504]) expect(retryableStatus(s)).toBe(true);
    for (const s of [400, 401, 402, 403, 404]) expect(retryableStatus(s)).toBe(false);
    const body402 = JSON.stringify({ error: { code: 402, message: "Your prepayment credits are depleted. Please go to AI Studio at https://ai.studio/projects to manage your project and billing.", status: "RESOURCE_EXHAUSTED" } });
    const d = describeHttpError(402, body402);
    expect(d).toContain("HTTP 402");
    expect(d).toContain("前払い残高が0");
    expect(d).toContain("aistudio.google.com/billing");
    expect(d).toContain("prepayment credits are depleted");
    expect(describeHttpError(401, "not json")).toContain("鍵が無効");
    expect(describeHttpError(418, "")).toBe("HTTP 418");
    expect(describeHttpError(429, "{}").length).toBeLessThan(200);
  });
  it("CSV はカンマ・引用符・改行を往復できる", () => {
    const header = ["a", "b", "c"];
    const text = csvLine(header) + csvLine(['x,y', 'he said "hi"', "line1\nline2"]) + csvLine(["", 0, null]);
    const rows = parseCsv(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ a: "x,y", b: 'he said "hi"', c: "line1\nline2" });
    expect(rows[1]).toEqual({ a: "", b: "0", c: "" });
    expect(parseCsv("")).toEqual([]);
    expect(RESULTS_HEADER).toContain("cite_rank");
    expect(SUMMARY_HEADER).toContain("missing_qids");
  });
  it("summarize は欠測を数え、分類別に引用・名指しを出す", () => {
    const questions = [{ id: "q01", cat: "A" }, { id: "q02", cat: "A" }, { id: "q03", cat: "B" }];
    const records = [{ qid: "q01", measured: 1, cite: 1, named: 1, finish: "MAX_TOKENS", tokensIn: 700, tokensOut: 2000 }, { qid: "q02", measured: 0, tokensIn: 10, tokensOut: 0 }];
    const s = summarize(records, questions, { date: "2026-09-28", engine: "mock", model: "m", durationS: 3 });
    expect(s).toMatchObject({ n: 3, measured: 1, cite_total: 1, named_total: 1, cite_by_cat: "A:1/2 B:0/1", named_by_cat: "A:1/2 B:0/1", cite_qids: "q01", missing_qids: "q02 q03", tokens_in: 710, tokens_out: 2000, truncated: 1 });
  });
  it("detectAnomaly：欠測2割超、または直近中央値から引用5以上減で異常", () => {
    const hist = (cites: number[]) => cites.map((c, i) => ({ date: `2026-09-${String(10 + i).padStart(2, "0")}`, n: "30", measured: "30", cite_total: String(c) }));
    expect(detectAnomaly({ n: 30, measured: 30, cite_total: 12 }, hist([12, 13, 11, 12, 14, 12, 13])).anomaly).toBe(false);
    expect(detectAnomaly({ n: 30, measured: 30, cite_total: 7 }, hist([12, 13, 11, 12, 14, 12, 13])).anomaly).toBe(true);
    expect(detectAnomaly({ n: 30, measured: 23, cite_total: 12 }, hist([12, 12, 12])).anomaly).toBe(true);
    expect(detectAnomaly({ n: 30, measured: 24, cite_total: 12 }, hist([12, 12, 12])).anomaly).toBe(false);
    // 履歴が3回未満なら急落判定はしない（初週の誤報を防ぐ）。欠測だらけの日は中央値の母数に入れない
    expect(detectAnomaly({ n: 30, measured: 30, cite_total: 0 }, hist([12, 13])).anomaly).toBe(false);
    const noisy = [...hist([12, 12, 12]), { date: "2026-09-20", n: "30", measured: "3", cite_total: "0" }];
    expect(detectAnomaly({ n: 30, measured: 30, cite_total: 11 }, noisy).anomaly).toBe(false);
  });
  it("renderWeeklyMd は「引用0のまま（3回以上）」と「引用あり名指し0」を列挙する", () => {
    const questions = [{ id: "q01", cat: "A", q: "設問1" }, { id: "q02", cat: "B", q: "設問2" }, { id: "q03", cat: "B", q: "設問3" }];
    const rows: Record<string, string>[] = [];
    for (const date of ["2026-09-25", "2026-09-26", "2026-09-27"]) {
      rows.push({ date, qid: "q01", measured: "1", cite: "0", named: "0", domains: "suumo.jp homes.co.jp" });
      rows.push({ date, qid: "q02", measured: "1", cite: "1", named: "0", domains: "luck428.com bestexnet.co.jp" });
      rows.push({ date, qid: "q03", measured: "1", cite: "1", named: "1", domains: "luck428.com" });
    }
    const md = renderWeeklyMd(rows, questions, { A: "学区", B: "手数料" }, "2026-09-28");
    expect(md).toContain("- q01 設問1");
    expect(md).toContain("- q02 設問2");
    expect(md).not.toContain("- q03 設問3");
    expect(md).toContain("suumo.jp(3)");
    expect(md).not.toContain("luck428.com(3)");
  });
});

describe("measure.mjs（モック通し実行）", () => {
  const script = join(DIR, "measure.mjs");
  it("--limit の試運転は既定で何も書かない（夜間の本計測を上書きしない）", () => {
    const out = mkdtempSync(join(tmpdir(), "aiv-dry-"));
    try {
      const r = spawnSync(process.execPath, [script, "--mock", "--limit", "2", "--out", out], { encoding: "utf8" });
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toContain("dry-run");
      expect(existsSync(join(out, "results.csv"))).toBe(false);
      expect(existsSync(join(out, "summary.csv"))).toBe(false);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 20000);
  it("全30問を測り、results/summary/latest/detail を書き、同日再実行で二重にならない", () => {
    const out = mkdtempSync(join(tmpdir(), "aiv-full-"));
    try {
      for (let i = 0; i < 2; i++) {
        const r = spawnSync(process.execPath, [script, "--mock", "--out", out, "--weekly"], { encoding: "utf8" });
        expect(r.status, r.stderr).toBe(0);
      }
      const results = parseCsv(readFileSync(join(out, "results.csv"), "utf8"));
      expect(results).toHaveLength(30);
      expect(results.filter((r) => r.measured === "1")).toHaveLength(30);
      expect(results.filter((r) => r.cite === "1").map((r) => r.qid)).toEqual(["q01", "q07", "q19"]);
      expect(results.filter((r) => r.named === "1").map((r) => r.qid)).toEqual(["q01", "q19"]);
      expect(results.find((r) => r.qid === "q01")?.cite_rank).toBe("2");
      const summary = parseCsv(readFileSync(join(out, "summary.csv"), "utf8"));
      expect(summary).toHaveLength(1);
      expect(summary[0]).toMatchObject({ engine: "mock", n: "30", measured: "30", cite_total: "3", named_total: "2", truncated: "0" });
      expect(Number(summary[0].tokens_out)).toBeGreaterThan(0);
      expect(results.find((r) => r.qid === "q01")).toMatchObject({ tokens_in: "800", tokens_out: "2200" });
      const latest = readFileSync(join(out, "latest.md"), "utf8");
      expect(latest).toContain("測定 30/30・引用 3・名指し 2");
      expect(latest).toContain("トークン 入力");
      expect(readFileSync(join(out, "weekly.md"), "utf8")).toContain("## 引用が0のまま");
      expect(existsSync(join(out, "anomaly.md"))).toBe(false);
      const detail = readFileSync(join(out, "detail", `${summary[0].date}.jsonl`), "utf8").trim().split("\n");
      expect(detail).toHaveLength(30);
      expect(JSON.parse(detail[0])).toHaveProperty("chunks");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 30000);
});

describe("ワークフローと配線", () => {
  const wf = readFileSync(join(ROOT, ".github", "workflows", "ai-visibility.yml"), "utf8");
  it("手動実行のみ（自動スケジュールなし＝費用を前払い残高の範囲に抑える）。鍵は Secrets から渡し、結果を tasks/ai-visibility-v2 にコミットする", () => {
    expect(wf).not.toMatch(/^\s*schedule:/m);
    expect(wf).not.toContain("cron:");
    expect(wf).toContain("secrets.GEMINI_API_KEY");
    expect(wf).toContain("tasks/ai-visibility-v2");
    expect(wf).toContain("workflow_dispatch");
    expect(wf).toContain("[skip ci]");
  });
  it("鍵の値をリポジトリに書かない", () => {
    const files = ["measure.mjs", "lib.mjs", "README.md", "questions.json"].map((f) => readFileSync(join(DIR, f), "utf8"));
    for (const f of [wf, ...files]) expect(f).not.toMatch(/AIza[0-9A-Za-z_-]{30,}/);
  });
  it("計測データだけのコミットでは Vercel のビルドを走らせない", () => {
    const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8")) as { ignoreCommand?: string };
    expect(vercel.ignoreCommand).toContain("tasks/ai-visibility-v2");
    expect(vercel.ignoreCommand).toContain("exit 1");
  });
});

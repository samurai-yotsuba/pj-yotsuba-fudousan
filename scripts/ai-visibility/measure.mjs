#!/usr/bin/env node
// AI可視性 定点計測 v2（2026-09-28）
// Gemini API＋Google検索グラウンディングで30問を並列に投げ、回答本文と出典から
// 引用／名指し／順位を判定して tasks/ai-visibility-v2/ に追記する。ブラウザ不要・依存パッケージなし（Node 22 の fetch）。
//
// 使い方：
//   GEMINI_API_KEY=... node scripts/ai-visibility/measure.mjs [--out tasks/ai-visibility-v2] [--limit 5] [--dry-run] [--write] [--weekly]
//   node scripts/ai-visibility/measure.mjs --mock --out /tmp/aiv   # 鍵なしで通し実行（fixtures の応答を使う）
// 環境変数：GEMINI_API_KEY（必須・--mock 以外）、GEMINI_MODEL（既定 gemini-3.5-flash）
// 終了コード：0 正常／2 全問欠測／3 鍵なし
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRequest, parseResponse, judge, normalizeHost, jstDate, jstWeekday, csvLine, parseCsv,
  RESULTS_HEADER, SUMMARY_HEADER, summarize, detectAnomaly, renderLatestMd, renderWeeklyMd,
} from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const has = (name) => args.includes(name);

const OUT = flag("--out", "tasks/ai-visibility-v2");
const LIMIT = Number(flag("--limit", 0)) || 0;
const CONCURRENCY = Number(flag("--concurrency", 4)) || 4;
const MODEL = flag("--model", process.env.GEMINI_MODEL || "gemini-3.5-flash");
const MOCK = has("--mock");
// --limit の試運転は既定で書き込まない（夜間の本計測の行を5問で上書きしないため）。書く場合は --write を足す
const DRY = has("--dry-run") || (LIMIT > 0 && !has("--write"));
const WEEKLY = has("--weekly");
const RESOLVE = !has("--no-resolve");
const KEEP_DETAIL_DAYS = 90;
const ENGINE = MOCK ? "mock" : "gemini-grounding";
const API_KEY = process.env.GEMINI_API_KEY || "";

const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);

if (!MOCK && !API_KEY) {
  console.error("GEMINI_API_KEY がありません（GitHub の Secrets に登録するか、--mock で試運転）");
  process.exit(3);
}

const qset = JSON.parse(readFileSync(join(HERE, "questions.json"), "utf8"));
const questions = LIMIT ? qset.questions.slice(0, LIMIT) : qset.questions;
const date = jstDate();
const t0 = Date.now();
log(`AI可視性v2 開始 date=${date} engine=${ENGINE} model=${MODEL} 問数=${questions.length} 並列=${CONCURRENCY}`);

// ── Gemini 呼び出し（再試行つき） ─────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function callGemini(questionText, qid) {
  if (MOCK) {
    const fx = JSON.parse(readFileSync(join(HERE, "fixtures", "mock-gemini.json"), "utf8"));
    await sleep(50);
    return fx[qid] ?? fx.default;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = JSON.stringify(buildRequest(questionText));
  const waits = [2000, 8000, 20000];
  let lastErr = "";
  for (let attempt = 0; attempt <= waits.length; attempt++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 90_000);
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": API_KEY }, body, signal: ctl.signal });
      const text = await res.text();
      if (res.ok) return JSON.parse(text);
      lastErr = `HTTP ${res.status} ${text.slice(0, 300)}`;
      if (![429, 500, 502, 503, 504].includes(res.status)) throw new Error(lastErr);
    } catch (e) {
      lastErr = e?.name === "AbortError" ? "timeout 90s" : String(e?.message || e);
      if (/HTTP 4(0[013]|04)/.test(lastErr)) throw new Error(lastErr);
    } finally { clearTimeout(timer); }
    if (attempt < waits.length) { log(`  ${qid} 再試行 ${attempt + 1}/${waits.length}: ${lastErr.slice(0, 120)}`); await sleep(waits[attempt]); }
  }
  throw new Error(lastErr);
}

// ── 出典URL（リダイレクト）の実体解決 ────────────────────────
// グラウンディングの出典 URI は vertexaisearch の転送URL。Location を1段だけ読んで実URLにする（失敗しても判定は title/domain で続ける）。
async function resolveRedirect(uri) {
  if (!uri || !/^https?:\/\//.test(uri)) return "";
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(uri, { method: "GET", redirect: "manual", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (yotsuba-ai-visibility)" } });
    const loc = res.headers.get("location");
    if (loc) return loc;
    if (res.url && res.url !== uri) return res.url;
    return "";
  } catch { return ""; } finally { clearTimeout(timer); }
}

async function measureOne(q) {
  const started = Date.now();
  try {
    const json = await callGemini(q.q, q.id);
    const parsed = parseResponse(json);
    if (RESOLVE && !MOCK) {
      const targets = parsed.chunks.filter((c) => !c.host || c.uri);
      await pool(targets, 6, async (c) => { const real = await resolveRedirect(c.uri); if (real) { c.resolvedUrl = real; if (!c.host) c.host = normalizeHost(real); } });
    } else if (MOCK) {
      for (const c of parsed.chunks) if (!c.host && c.uri) c.host = normalizeHost(c.uri);
    }
    const j = judge(q, parsed.text, parsed.chunks);
    return {
      qid: q.id, cat: q.cat, lang: q.lang, type: q.type, measured: 1, ...j,
      text: parsed.text, searchQueries: parsed.searchQueries, finish: parsed.finishReason,
      chunks: parsed.chunks.map((c) => ({ host: c.host, title: c.title, url: c.resolvedUrl || c.uri, supported: c.supported })),
      ms: Date.now() - started, error: "",
    };
  } catch (e) {
    return { qid: q.id, cat: q.cat, lang: q.lang, type: q.type, measured: 0, cite: 0, citeRank: "", citeSupported: 0, named: 0, namedHits: [], ownUrls: [], domains: [], competitorDomains: [], text: "", searchQueries: [], finish: "error", chunks: [], ms: Date.now() - started, error: String(e?.message || e).slice(0, 300) };
  }
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

// ── 実行 ─────────────────────────────────────────────────────
const records = await pool(questions, CONCURRENCY, async (q) => {
  const r = await measureOne(q);
  log(`  ${q.id} ${r.measured ? `cite=${r.cite}${r.citeRank ? `(#${r.citeRank})` : ""} named=${r.named} 出典${r.chunks.length}` : `欠測: ${r.error}`} ${r.ms}ms`);
  return r;
});
const durationS = Math.round((Date.now() - t0) / 1000);
const summary = summarize(records, questions, { date, engine: ENGINE, model: MODEL, durationS });
log(`完了 ${durationS}s 測定=${summary.measured}/${summary.n} 引用=${summary.cite_total} 名指し=${summary.named_total}`);
log(`引用〇: ${summary.cite_qids || "なし"} ／ 名指し〇: ${summary.named_qids || "なし"} ／ 欠測: ${summary.missing_qids || "なし"}`);

// ── 保存 ─────────────────────────────────────────────────────
const resultsPath = join(OUT, "results.csv");
const summaryPath = join(OUT, "summary.csv");
const history = existsSync(summaryPath) ? parseCsv(readFileSync(summaryPath, "utf8")) : [];
const { anomaly, reasons } = detectAnomaly(summary, history.filter((h) => h.date !== date));
const weekly = WEEKLY || jstWeekday() === 1;

if (DRY) log("dry-run：ファイルには書きません（--limit の試運転。書くには --write）");
if (!DRY) {
  mkdirSync(join(OUT, "detail"), { recursive: true });
  // 同日の再実行は上書き（手動実行→夜間実行で二重に残さない）
  const dropToday = (path, header) => {
    if (!existsSync(path)) { writeFileSync(path, csvLine(header)); return; }
    const rows = parseCsv(readFileSync(path, "utf8")).filter((r) => !(r.date === date && r.engine === ENGINE));
    writeFileSync(path, csvLine(header) + rows.map((r) => csvLine(header.map((h) => r[h] ?? ""))).join(""));
  };
  dropToday(resultsPath, RESULTS_HEADER);
  dropToday(summaryPath, SUMMARY_HEADER);
  for (const r of records) {
    appendFileSync(resultsPath, csvLine([date, ENGINE, MODEL, r.qid, r.cat, r.lang, r.type, r.measured, r.cite, r.citeRank, r.citeSupported, r.named, r.namedHits.join(" "), r.ownUrls.join(" "), r.domains.join(" "), (r.searchQueries || []).join(" | "), r.finish || r.error, r.ms]));
  }
  appendFileSync(summaryPath, csvLine(SUMMARY_HEADER.map((h) => summary[h])));
  const detailPath = join(OUT, "detail", `${date}.jsonl`);
  writeFileSync(detailPath, records.map((r) => JSON.stringify({ date, engine: ENGINE, model: MODEL, ...r })).join("\n") + "\n");
  // 詳細は直近 KEEP_DETAIL_DAYS 日ぶんだけ残す（CSV は永続）
  const cutoff = new Date(Date.now() - KEEP_DETAIL_DAYS * 86400e3).toISOString().slice(0, 10);
  for (const f of readdirSync(join(OUT, "detail"))) if (/^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f) && f.slice(0, 10) < cutoff) unlinkSync(join(OUT, "detail", f));
  writeFileSync(join(OUT, "latest.md"), renderLatestMd(records, questions, summary, qset.categories));
  if (weekly) {
    const all = parseCsv(readFileSync(resultsPath, "utf8")).filter((r) => r.engine === ENGINE);
    writeFileSync(join(OUT, "weekly.md"), renderWeeklyMd(all, questions, qset.categories, date));
  }
  if (anomaly) writeFileSync(join(OUT, "anomaly.md"), `# 異常検知 ${date}\n\n${reasons.map((r) => `- ${r}`).join("\n")}\n\n欠測：${summary.missing_qids || "なし"}\n\n実行ログを確認してください。\n`);
  else if (existsSync(join(OUT, "anomaly.md"))) unlinkSync(join(OUT, "anomaly.md"));
  log(`保存 ${resultsPath} / ${summaryPath} / ${detailPath}`);
}

// ── GitHub Actions 向け出力 ───────────────────────────────────
if (process.env.GITHUB_OUTPUT) {
  const headline = `引用 ${summary.cite_total}/${summary.n}・名指し ${summary.named_total}/${summary.n}・測定 ${summary.measured}/${summary.n}`;
  appendFileSync(process.env.GITHUB_OUTPUT, `date=${date}\nheadline=${headline}\nanomaly=${anomaly}\nweekly=${weekly}\nmeasured=${summary.measured}\n`);
}
if (anomaly) log(`異常: ${reasons.join(" / ")}`);
process.exit(summary.measured === 0 ? 2 : 0);

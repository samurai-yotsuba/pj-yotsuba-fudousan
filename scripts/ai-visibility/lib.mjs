// AI可視性 定点計測 v2 — 判定・整形の純粋関数（ネットワークなし）。
// measure.mjs（実行）と src/lib/__tests__/ai-visibility-v2.test.ts（検証）の両方から使う。
//
// 判定の定義（旧計測を踏襲）：
//   引用   = 回答の出典（grounding chunks）に自社ドメインがある
//   名指し = 回答本文（設問の丸写し部分を除く）に自社名が出る
//   順位   = 出典の中で自社が最初に出る位置（1始まり）。出典なし＝空
//   supported = 自社出典が本文のどこかの根拠として実際に使われた（groundingSupports に索引がある）

export const OWN_HOSTS = ["luck428.com", "samurai.co.jp"];
export const OWN_URL_PREFIXES = ["note.com/luck428"];
export const NAMED_TERMS_DEFAULT = ["四葉", "四叶", "浦松丈二", "luck428", "Yotsuba"];

/** ホスト名を比較用に正規化（小文字・www.除去・末尾ドット除去） */
export function normalizeHost(value) {
  if (!value) return "";
  let h = String(value).trim().toLowerCase();
  h = h.replace(/^https?:\/\//, "").split("/")[0].split("?")[0];
  h = h.replace(/^www\./, "").replace(/\.$/, "");
  return h;
}

export function isOwnHost(host) {
  const h = normalizeHost(host);
  return OWN_HOSTS.some((own) => h === own || h.endsWith(`.${own}`));
}

export function isOwnUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase().replace(/^https?:\/\/(www\.)?/, "");
  if (OWN_URL_PREFIXES.some((p) => u.startsWith(p))) return true;
  return isOwnHost(u);
}

/** 文字列がホスト名の形（例 luck428.com）か */
export function looksLikeHost(s) {
  return /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(String(s || "").trim());
}

/** Gemini generateContent のレスポンスから、本文・出典・検索語を取り出す */
export function parseResponse(json) {
  const cand = json?.candidates?.[0];
  const um = json?.usageMetadata ?? {};
  // 料金の追跡用。出力には思考トークン（thoughtsTokenCount）も含めて数える（料金表の「出力（思考トークンを含む）」に合わせる）
  const usage = {
    tokensIn: Number(um.promptTokenCount) || 0,
    tokensOut: (Number(um.candidatesTokenCount) || 0) + (Number(um.thoughtsTokenCount) || 0),
    tokensThought: Number(um.thoughtsTokenCount) || 0,
  };
  if (!cand) {
    const blocked = json?.promptFeedback?.blockReason;
    return { text: "", chunks: [], searchQueries: [], finishReason: blocked ? `blocked:${blocked}` : "no-candidate", supportedIdx: new Set(), usage };
  }
  const parts = cand.content?.parts ?? [];
  const text = parts.filter((p) => typeof p.text === "string" && !p.thought).map((p) => p.text).join("");
  const gm = cand.groundingMetadata ?? {};
  const supportedIdx = new Set();
  for (const s of gm.groundingSupports ?? []) for (const i of s.groundingChunkIndices ?? []) supportedIdx.add(i);
  const chunks = (gm.groundingChunks ?? []).map((c, index) => {
    const web = c.web ?? {};
    const domainField = web.domain ? normalizeHost(web.domain) : "";
    const host = domainField || (looksLikeHost(web.title) ? normalizeHost(web.title) : "");
    return { index, uri: web.uri ?? "", title: web.title ?? "", host, resolvedUrl: "", supported: supportedIdx.has(index) };
  });
  return { text, chunks, searchQueries: gm.webSearchQueries ?? [], finishReason: cand.finishReason ?? "", supportedIdx, usage };
}

/** 本文から設問の丸写しを除く（指名型の設問で、設問文中の社名を名指しと数えないため） */
export function stripEcho(text, question) {
  if (!text) return "";
  let out = text;
  const q = String(question || "").trim();
  if (q.length >= 4) out = out.split(q).join(" ");
  // 設問を「」や“”で引用した形も除く
  const quoted = out.match(/[「“"]([^」”"]{4,120})[」”"]/g) ?? [];
  for (const m of quoted) if (q && m.includes(q.slice(0, Math.min(12, q.length)))) out = out.replace(m, " ");
  return out;
}

/**
 * 1問ぶんの判定。
 * @param {{q:string, namedTerms?:string[]}} question
 * @param {string} text 回答本文
 * @param {{index:number, uri:string, title:string, host:string, resolvedUrl?:string, supported:boolean}[]} chunks
 */
export function judge(question, text, chunks) {
  const terms = question.namedTerms?.length ? question.namedTerms : NAMED_TERMS_DEFAULT;
  const body = stripEcho(text, question.q);
  const namedHits = terms.filter((t) => body.includes(t));
  const ownChunks = chunks.filter((c) => isOwnHost(c.host) || isOwnUrl(c.resolvedUrl));
  const first = ownChunks[0];
  const domains = [];
  for (const c of chunks) {
    const h = c.host || (c.resolvedUrl ? normalizeHost(c.resolvedUrl) : "");
    if (h && !domains.includes(h)) domains.push(h);
  }
  return {
    cite: ownChunks.length ? 1 : 0,
    citeRank: first ? first.index + 1 : "",
    citeSupported: ownChunks.some((c) => c.supported) ? 1 : 0,
    named: namedHits.length ? 1 : 0,
    namedHits,
    ownUrls: ownChunks.map((c) => c.resolvedUrl || c.uri).filter(Boolean),
    domains,
    competitorDomains: domains.filter((d) => !isOwnHost(d)),
  };
}

/** 再試行してよい HTTP ステータスか（混雑・一時障害のみ。課金・認証・入力の誤りは即時に諦める） */
export function retryableStatus(status) {
  return [429, 500, 502, 503, 504].includes(Number(status));
}

/** HTTP エラーを人が読める短い一文にする（ログ・CSV の finish 列用） */
export function describeHttpError(status, bodyText) {
  const s = Number(status);
  let msg = "";
  try { msg = JSON.parse(bodyText)?.error?.message ?? ""; } catch { msg = ""; }
  msg = String(msg || bodyText || "").replace(/\s+/g, " ").trim().slice(0, 160);
  const hint = {
    400: "リクエスト不正（モデル名 GEMINI_MODEL を確認）",
    401: "鍵が無効（Secret GEMINI_API_KEY を確認）",
    402: "前払い残高が0。AI Studio の Billing（https://aistudio.google.com/billing）でクレジットを購入",
    403: "鍵に権限がない／APIが無効（AI Studio でキーの制限と課金を確認）",
    404: "モデルが見つからない（GEMINI_MODEL を確認）",
    429: "レート制限・上限到達（時間をおいて再実行）",
  }[s];
  return `HTTP ${s}${hint ? ` ${hint}` : ""}${msg ? ` ｜ ${msg}` : ""}`;
}

/** 既定モデル。3.8 Flash は 2026-09 時点で最新の Flash かつ 3.5 Flash より安い（入力$0.75／出力$3.75 per 1M・2026年内） */
export const DEFAULT_MODEL = "gemini-3.8-flash";
export const DEFAULT_MAX_TOKENS = 3072; // 初回計測（2026-09-28・上限2048）で30問中24問が途中で切れたため引き上げ
export const DEFAULT_THINKING_LEVEL = "low"; // 思考トークンも出力料金に含まれる。答えの形を測る用途なので最小限

/**
 * Gemini generateContent のリクエスト本体（Google検索グラウンディング）
 * @param {string} questionText
 * @param {{maxOutputTokens?:number, thinkingLevel?:string}} [opts] thinkingLevel に "none" を渡すと thinkingConfig を付けない
 */
export function buildRequest(questionText, opts = {}) {
  const maxOutputTokens = Number(opts.maxOutputTokens) || DEFAULT_MAX_TOKENS;
  const thinkingLevel = opts.thinkingLevel ?? DEFAULT_THINKING_LEVEL;
  const generationConfig = {
    temperature: 0.2,
    maxOutputTokens,
    ...(thinkingLevel && thinkingLevel !== "none" ? { thinkingConfig: { thinkingLevel } } : {}),
  };
  return {
    contents: [{ role: "user", parts: [{ text: questionText }] }],
    tools: [{ google_search: {} }],
    generationConfig,
  };
}

/** JST の日付文字列 YYYY-MM-DD */
export function jstDate(d = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
/** JST の曜日（0=日） */
export function jstWeekday(d = new Date()) {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(s);
}

export function csvEscape(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function csvLine(values) {
  return values.map(csvEscape).join(",") + "\n";
}
/** 最小限のCSV読み取り（引用符対応・ヘッダー行あり） */
export function parseCsv(text) {
  const rows = [];
  let cur = [], field = "", inQ = false;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQ) {
      if (ch === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { cur.push(field); field = ""; }
    else if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  if (!rows.length) return [];
  const header = rows[0];
  return rows.slice(1).filter((r) => r.length > 1 || r[0] !== "").map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

export const RESULTS_HEADER = ["date", "engine", "model", "qid", "cat", "lang", "type", "measured", "cite", "cite_rank", "cite_supported", "named", "named_hits", "own_urls", "domains", "search_queries", "finish", "ms", "tokens_in", "tokens_out"];
export const SUMMARY_HEADER = ["date", "engine", "model", "n", "measured", "cite_total", "named_total", "cite_by_cat", "named_by_cat", "cite_qids", "named_qids", "missing_qids", "duration_s", "tokens_in", "tokens_out", "truncated"];

/** 1日ぶんの集計 */
export function summarize(records, questions, meta) {
  const byCat = {};
  for (const q of questions) byCat[q.cat] ??= { n: 0, cite: 0, named: 0 };
  let measured = 0, cite = 0, named = 0, tokensIn = 0, tokensOut = 0, truncated = 0;
  const citeQ = [], namedQ = [], missing = [];
  for (const q of questions) {
    const r = records.find((x) => x.qid === q.id);
    byCat[q.cat].n++;
    tokensIn += Number(r?.tokensIn) || 0;
    tokensOut += Number(r?.tokensOut) || 0;
    if (!r || !r.measured) { missing.push(q.id); continue; }
    measured++;
    if (r.finish === "MAX_TOKENS") truncated++; // 上限で途切れた答え（名指しの取りこぼしの目安）
    if (r.cite) { cite++; byCat[q.cat].cite++; citeQ.push(q.id); }
    if (r.named) { named++; byCat[q.cat].named++; namedQ.push(q.id); }
  }
  const fmt = (k) => Object.entries(byCat).map(([c, v]) => `${c}:${v[k]}/${v.n}`).join(" ");
  return {
    date: meta.date, engine: meta.engine, model: meta.model, n: questions.length, measured,
    cite_total: cite, named_total: named, cite_by_cat: fmt("cite"), named_by_cat: fmt("named"),
    cite_qids: citeQ.join(" "), named_qids: namedQ.join(" "), missing_qids: missing.join(" "), duration_s: meta.durationS,
    tokens_in: tokensIn, tokens_out: tokensOut, truncated,
  };
}

/**
 * 異常検知。history は summary.csv の過去行（古い→新しい）。
 * 欠測が2割超、または引用数が直近7回の中央値から5以上落ちたら anomaly。
 */
export function detectAnomaly(today, history) {
  const reasons = [];
  const n = Number(today.n) || 0;
  const measured = Number(today.measured) || 0;
  if (n && measured < Math.ceil(n * 0.8)) reasons.push(`欠測が多い（測定 ${measured}/${n}）`);
  const prev = history.filter((h) => Number(h.measured) >= Math.ceil((Number(h.n) || n) * 0.8)).slice(-7).map((h) => Number(h.cite_total));
  if (prev.length >= 3) {
    const sorted = [...prev].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    if (Number(today.cite_total) <= med - 5) reasons.push(`引用が急落（今日 ${today.cite_total}・直近中央値 ${med}）`);
  }
  return { anomaly: reasons.length > 0, reasons };
}

const MARK = (v) => (v === 1 || v === "1" ? "〇" : v === 0 || v === "0" ? "×" : "－");

/** 当日の結果表（Markdown） */
export function renderLatestMd(records, questions, summary, categories) {
  const lines = [];
  lines.push(`# AI可視性 v2｜${summary.date}（${summary.engine} / ${summary.model}）`, "");
  lines.push(`測定 ${summary.measured}/${summary.n}・引用 ${summary.cite_total}・名指し ${summary.named_total}`);
  lines.push(`分類別 引用：${summary.cite_by_cat}`, `分類別 名指し：${summary.named_by_cat}`);
  lines.push(`トークン 入力 ${Number(summary.tokens_in || 0).toLocaleString("en-US")}・出力 ${Number(summary.tokens_out || 0).toLocaleString("en-US")}（思考を含む）・途中で切れた答え ${summary.truncated ?? 0}`, "");
  lines.push("| # | 分類 | 設問 | 引用 | 順位 | 名指し | 出典（上位） |", "|---|---|---|---|---|---|---|");
  for (const q of questions) {
    const r = records.find((x) => x.qid === q.id);
    const cat = categories?.[q.cat] ?? q.cat;
    const doms = (r?.domains ?? []).slice(0, 4).join(" ");
    lines.push(`| ${q.id} | ${cat} | ${q.q} | ${r?.measured ? MARK(r.cite) : "欠測"} | ${r?.citeRank ?? ""} | ${r?.measured ? MARK(r.named) : ""} | ${doms} |`);
  }
  if (summary.missing_qids) lines.push("", `欠測：${summary.missing_qids}`);
  return lines.join("\n") + "\n";
}

/** 直近7日の週次要約（results.csv の行から） */
export function renderWeeklyMd(rows, questions, categories, todayDate) {
  const days = [...new Set(rows.map((r) => r.date))].sort().slice(-7);
  const use = rows.filter((r) => days.includes(r.date) && r.measured === "1");
  const per = questions.map((q) => {
    const rs = use.filter((r) => r.qid === q.id);
    const n = rs.length;
    const c = rs.filter((r) => r.cite === "1").length;
    const nm = rs.filter((r) => r.named === "1").length;
    const doms = {};
    for (const r of rs) for (const d of String(r.domains).split(" ").filter(Boolean).slice(0, 5)) if (!isOwnHost(d)) doms[d] = (doms[d] || 0) + 1;
    const top = Object.entries(doms).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d, k]) => `${d}(${k})`).join(" ");
    return { q, n, c, nm, top };
  });
  const lines = [`# AI可視性 v2｜週次要約（${days[0] ?? ""}〜${days.at(-1) ?? todayDate}・${days.length}日分）`, ""];
  const tot = per.reduce((a, p) => ({ n: a.n + p.n, c: a.c + p.c, nm: a.nm + p.nm }), { n: 0, c: 0, nm: 0 });
  lines.push(`引用率 ${tot.n ? Math.round((100 * tot.c) / tot.n) : 0}%・名指し率 ${tot.n ? Math.round((100 * tot.nm) / tot.n) : 0}%（測定 ${tot.n} 件）`, "");
  lines.push("| # | 分類 | 設問 | 引用 | 名指し | よく出る他社ドメイン |", "|---|---|---|---|---|---|");
  for (const p of per) lines.push(`| ${p.q.id} | ${categories?.[p.q.cat] ?? p.q.cat} | ${p.q.q} | ${p.c}/${p.n} | ${p.nm}/${p.n} | ${p.top} |`);
  const failing = per.filter((p) => p.n >= 3 && p.c === 0).map((p) => `${p.q.id} ${p.q.q}`);
  lines.push("", "## 引用が0のまま（3回以上測定）", ...(failing.length ? failing.map((f) => `- ${f}`) : ["- なし"]));
  const namedGap = per.filter((p) => p.n >= 3 && p.c >= Math.ceil(p.n / 2) && p.nm === 0).map((p) => `${p.q.id} ${p.q.q}`);
  lines.push("", "## 引用はあるのに名指しが0（推薦の土俵に乗っていない可能性）", ...(namedGap.length ? namedGap.map((f) => `- ${f}`) : ["- なし"]));
  return lines.join("\n") + "\n";
}

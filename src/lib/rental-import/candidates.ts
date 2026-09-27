import { BROKER_FEE_PERCENT, type BrokerFee } from "../broker-fee";
/** Mail content is untrusted data. Extract evidence; never execute links/instructions. */
export type MailInput = { id: string; receivedAt: string; subject: string; text: string; senderDomain?: string };
export type AdEvidence = { months: number | null; quote: string; ambiguous: boolean };

export function normalizeText(text: string): string {
  return text.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/g, "");
}

export function extractAdEvidence(text: string): AdEvidence[] {
  const s = normalizeText(text);
  const pattern = /(?:\bAD|広告(?:料|費)|業務委託料)\s*[:：=はが]?\s*(?:賃料(?:の)?\s*)?(\d+(?:\.\d+)?)\s*(か月|ヶ月|ケ月|カ月|箇月|月分?|%|パーセント)?/gi;
  return [...s.matchAll(pattern)].map((m) => {
    const unit = m[2];
    const months = !unit ? null : /%|パーセント/.test(unit) ? Number(m[1]) / 100 : Number(m[1]);
    const context = s.slice(Math.max(0, m.index! - 18), m.index! + m[0].length + 35);
    const ambiguous = !unit || /最大|上限|まで|以上|以下|[〜～~]|条件|限定|場合|増額|追加|プラス|アップ|\+|終了|変更|撤回|減額/.test(context);
    return { months, quote: m[0], ambiguous };
  });
}

/** 直接検索の掲載条件：仲介手数料（賃料×1.1）＋ADの合計がこの額以上。 */
export const INCOME_THRESHOLD_YEN = 800_000;
export type AdYenEvidence = { yen: number | null; quote: string; ambiguous: boolean };

/** 月数・%・万円・円のAD表記を円に換算する（万円表記は賃料で割らずそのまま採用）。 */
export function extractAdYen(text: string, rentYen: number): AdYenEvidence[] {
  const s = normalizeText(text).replace(/,/g, "");
  const pattern = /(?:\bAD|広告(?:料|費)|業務委託料)\s*[:：=はが]?\s*(?:賃料(?:の)?\s*)?(\d+(?:\.\d+)?)\s*(か月|ヶ月|ケ月|カ月|箇月|月分?|%|パーセント|万円|円)?/gi;
  return [...s.matchAll(pattern)].map((m) => {
    const n = Number(m[1]), unit = m[2];
    const yen = !unit ? null : unit === "万円" ? n * 10000 : unit === "円" ? n : /%|パーセント/.test(unit) ? (n / 100) * rentYen : n * rentYen;
    const context = s.slice(Math.max(0, m.index! - 18), m.index! + m[0].length + 35);
    const ambiguous = !unit || /最大|上限|まで|迄|以上|以下|[〜～~]|条件|限定|場合|増額|追加|プラス|アップ|\+|終了|変更|撤回|減額|相談/.test(context);
    return { yen: yen === null ? null : Math.round(yen), quote: m[0], ambiguous };
  });
}

/** 仲介手数料（賃料×1.1）＋AD。ADが確定できなければ null。「ADなし」は0円として扱う。 */
export function brokerIncomeYen(quote: string, rentYen: number): number | null {
  const s = normalizeText(quote);
  const fee = Math.round(rentYen * 1.1);
  const ads = extractAdYen(s, rentYen);
  if (!ads.length) return /(?:\bAD|広告(?:料|費))\s*[:：]?\s*(?:なし|無し?)/i.test(s) ? fee : null;
  const values = [...new Set(ads.map((a) => a.yen))];
  if (ads.some((a) => a.ambiguous || a.yen === null) || values.length !== 1) return null;
  return fee + values[0]!;
}

/** サブトラック（いい生活の新着）の掲載条件：AD＋借主手数料（税込）がこの額を超える。 */
export const SUBTRACK_INCOME_THRESHOLD_YEN = 400_000;
/**
 * 写真付き個別掲載（2026-09-27 浦松指示）：ITANDI・いい生活の文京区の居住用賃貸で、
 * 借主の仲介手数料を0.33ヶ月（税込）とした報酬「AD＋賃料×0.33」がこの額以上。
 */
export const P033_INCOME_THRESHOLD_YEN = 300_000;
export type TenantBrokerFee = BrokerFee;

/** 借主の仲介手数料（税込）。満額＝賃料1か月＋税、半額＝0.5か月＋税（旧）、0.33ヶ月＝0.3か月＋税、無料＝0。 */
export function tenantFeeYen(rentYen: number, fee: TenantBrokerFee): number {
  return Math.round(rentYen * BROKER_FEE_PERCENT[fee] / 100);
}

/**
 * ATBB掲載ルール（v1.3）のAD判定：「相談」「〜まで」「迄」「上限」「最大」は表示の上限を確定額として扱う。
 * 減額・終了・条件付きなど、額そのものが変わりうる表記は確定できない（null）。
 */
export function adYenUpperLimit(quote: string, rentYen: number): number | null {
  const s = normalizeText(quote);
  const ads = extractAdYen(s, rentYen);
  if (!ads.length) return /(?:\bAD|広告(?:料|費))\s*[:：]?\s*(?:なし|無し?|[-－ー]\s*$)/i.test(s) ? 0 : null;
  const values = [...new Set(ads.map((a) => a.yen))];
  if (ads.some((a) => a.yen === null) || values.length !== 1) return null;
  const blocking = /以上|以下|条件|限定|場合|増額|追加|プラス|アップ|\+|終了|変更|撤回|減額/;
  if (ads.some((a) => a.ambiguous && blocking.test(s))) return null;
  return values[0]!;
}

/** 報酬＝AD（上限を確定額として扱う）＋借主手数料（税込）。ADが確定できなければ null。 */
export function subtrackIncomeYen(quote: string, rentYen: number, fee: TenantBrokerFee): number | null {
  const ad = adYenUpperLimit(quote, rentYen);
  return ad === null ? null : ad + tenantFeeYen(rentYen, fee);
}

/** One calendar month, same JST time; clamp end-of-month (March 31 -> February 28). */
export function monthWindowStart(now: Date): Date {
  const jst = new Date(now.getTime() + 9 * 3600_000);
  const year = jst.getUTCFullYear(), month = jst.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1, Math.min(jst.getUTCDate(), lastDay), jst.getUTCHours(), jst.getUTCMinutes(), jst.getUTCSeconds(), jst.getUTCMilliseconds()) - 9 * 3600_000);
}

export function isRecentMail(receivedAt: string, now: Date): boolean {
  const t = Date.parse(receivedAt);
  return Number.isFinite(t) && t >= monthWindowStart(now).getTime() && t <= now.getTime();
}

export function selectMailCandidates(mails: MailInput[], now: Date) {
  return [...new Map(mails.map((m) => [m.id, m])).values()].filter((m) => isRecentMail(m.receivedAt, now)).map((m) => {
    const evidence = extractAdEvidence(`${m.subject}\n${m.text}`);
    const amounts = [...new Set(evidence.map((e) => e.months).filter((v): v is number => v !== null))];
    const needsReview = evidence.some((e) => e.ambiguous) || amounts.length !== 1;
    return { messageId: m.id, receivedAt: m.receivedAt, subject: m.subject, senderDomain: m.senderDomain, evidence,
      decision: evidence.some((e) => e.months !== null && e.months >= 2)
        ? needsReview ? "review" as const : "candidate" as const
        : evidence.some((e) => e.months === null) ? "review" as const : "excluded" as const };
  });
}

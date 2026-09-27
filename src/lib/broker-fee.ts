import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "@/lib/property-shared";

/**
 * 借主の仲介手数料（2026-09-26 浦松指示「ATBB→athome 掲載の手数料判定ルール v1.1」第5節）。
 * athomeで0.33ヶ月・無料にした部屋は自社サイトでも同じ条件を同じ日に公表する。
 * 値引きの理由（AD等の業者間事情）は表示しない。別名目の手数料は取らない前提。
 */
/**
 * 2026-09-26 浦松指示（ルール v1.6）：新しく選べるのは 満額／0.33ヶ月（p033＝賃料0.3か月分＋消費税）／無料 の3つ。
 * 「原則すべて0.33で統一、同じ部屋にゼロの競合がいるときだけゼロ」。half は既存データの表示用に残す（管理画面では選べない）。
 */
export type BrokerFee = "full" | "half" | "p033" | "free";
export const BROKER_FEES: readonly BrokerFee[] = ["full", "p033", "free"];
const DISCOUNTED: readonly BrokerFee[] = ["half", "p033", "free"];

const LABELS: Record<LangCode, { badge: Record<"half" | "p033" | "free", string>; line: Record<BrokerFee, string>; filter: string; filterLead: string; all: string }> = {
  ja: {
    badge: { half: "仲介手数料 半額", p033: "仲介手数料 0.33ヶ月（税込）", free: "仲介手数料 無料" },
    line: { full: "仲介手数料：賃料1か月分＋消費税", half: "仲介手数料：半額（賃料0.5か月分＋消費税）", p033: "仲介手数料：賃料0.3か月分＋消費税（税込0.33ヶ月）", free: "仲介手数料：無料" },
    filter: "仲介手数料 0.33ヶ月・無料の物件",
    filterLead: "仲介手数料が賃料0.33ヶ月分（税込）または無料の賃貸物件です。保証会社・保険・鍵交換などの費用は各物件の記載のとおり別途かかります。",
    all: "すべての物件を見る",
  },
  en: {
    badge: { half: "Half brokerage fee", p033: "Brokerage fee: 0.33 months of rent, tax included", free: "No brokerage fee" },
    line: { full: "Brokerage fee: one month's rent + consumption tax", half: "Brokerage fee: half (0.5 month's rent + consumption tax)", p033: "Brokerage fee: 0.3 month's rent + consumption tax (0.33 month incl. tax)", free: "Brokerage fee: free" },
    filter: "Rentals with a 0.33-month or no brokerage fee",
    filterLead: "Rentals with a brokerage fee of 0.33 month's rent (incl. tax) or none. Guarantor, insurance, key-change and other costs apply separately as listed for each property.",
    all: "View all listings",
  },
  "zh-tw": {
    badge: { half: "仲介費 半價", p033: "仲介費 0.33個月（含稅）", free: "仲介費 免費" },
    line: { full: "仲介費：1個月租金＋消費稅", half: "仲介費：半價（0.5個月租金＋消費稅）", p033: "仲介費：0.3個月租金＋消費稅（含稅0.33個月）", free: "仲介費：免費" },
    filter: "仲介費0.33個月・免費的物件",
    filterLead: "仲介費為含稅0.33個月租金或免費的出租物件。保證公司、保險、換鎖等費用依各物件記載另行支付。",
    all: "查看全部物件",
  },
  zh: {
    badge: { half: "中介费 半价", p033: "中介费 0.33个月（含税）", free: "中介费 免费" },
    line: { full: "中介费：1个月租金＋消费税", half: "中介费：半价（0.5个月租金＋消费税）", p033: "中介费：0.3个月租金＋消费税（含税0.33个月）", free: "中介费：免费" },
    filter: "中介费0.33个月・免费的房源",
    filterLead: "中介费为含税0.33个月租金或免费的出租房源。担保公司、保险、换锁等费用依各房源记载另行支付。",
    all: "查看全部房源",
  },
};

export function brokerFeeCopy(locale: LangCode) {
  return LABELS[locale] ?? LABELS.ja;
}

export function brokerFeeOf(p: Pick<PublicProperty, "dealType" | "spec">): BrokerFee | null {
  if (p.dealType !== "rental" || p.spec.dealType !== "rental") return null;
  return p.spec.brokerFee ?? null;
}

/** 満額以外（0.33ヶ月・無料、旧データの半額）だけバッジを出す。満額は値引き表示をしない。 */
export function brokerFeeBadge(p: Pick<PublicProperty, "dealType" | "spec">, locale: LangCode): string | null {
  const fee = brokerFeeOf(p);
  return fee && fee !== "full" ? brokerFeeCopy(locale).badge[fee] : null;
}

/** 物件ページの賃料の近くに出す手数料の文言（設定がある賃貸だけ）。 */
export function brokerFeeLine(p: Pick<PublicProperty, "dealType" | "spec">, locale: LangCode): string | null {
  const fee = brokerFeeOf(p);
  return fee ? brokerFeeCopy(locale).line[fee] : null;
}

export function isDiscountedBrokerFee(p: Pick<PublicProperty, "dealType" | "spec">): boolean {
  const fee = brokerFeeOf(p);
  return fee !== null && DISCOUNTED.includes(fee);
}

/** Only spec.brokerFee is stored. Rates and amounts are derived, never persisted twice. */
export const BROKER_FEE_PERCENT = { full: 110, half: 55, p033: 33, free: 0 } as const;
export function brokerFeeAmount(p: Pick<PublicProperty, "dealType" | "spec" | "priceYen">): number | null {
  const fee = brokerFeeOf(p);
  if (!fee || !(fee in BROKER_FEE_PERCENT) || !Number.isSafeInteger(p.priceYen) || p.priceYen <= 0) return null;
  // Match existing yen estimates: round to the nearest yen; integer percentages avoid 1.1 floating error.
  return Math.round(p.priceYen * BROKER_FEE_PERCENT[fee] / 100);
}
export function fee033Comparison(p: Pick<PublicProperty, "dealType" | "spec" | "priceYen">) {
  const amount = brokerFeeAmount(p);
  if (brokerFeeOf(p) !== "p033" || amount === null) return null;
  const reference = Math.round(p.priceYen * BROKER_FEE_PERCENT.full / 100);
  return { amount, reference, difference: reference - amount };
}
export function brokerFeeAmountLabel(p: Pick<PublicProperty, "dealType" | "spec" | "priceYen">, locale: LangCode) {
  const amount = brokerFeeAmount(p);
  if (amount === null) return null;
  const n = amount.toLocaleString("ja-JP");
  return { ja: `${n}円（税込）`, en: `JPY ${n} (tax included)`, "zh-tw": `${n}日圓（含稅）`, zh: `${n}日元（含税）` }[locale];
}

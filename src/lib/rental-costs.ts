import type { PublicProperty } from "./property-shared";
import type { LangCode } from "@/config/languages";
import { brokerFeeAmount, brokerFeeAmountLabel, brokerFeeLine } from "./broker-fee";

/** Reject ambiguous terms instead of treating missing/unreadable costs as zero. */
export function rentalCostYen(value: string, rent: number): number | null {
  const v = value.normalize("NFKC").replace(/[,\s]/g, "");
  if (/^(なし|不要|無料|0|0円)$/.test(v)) return 0;
  const months = /^(?:賃料)?(\d+(?:\.\d+)?)(?:ヶ月|か月|カ月|ケ月|月)(?:分)?$/.exec(v);
  if (months) return Math.round(Number(months[1]) * rent);
  const yen = /^(\d+)円(?:\/月|月額)?$/.exec(v);
  if (yen) return Number(yen[1]);
  const man = /^(\d+(?:\.\d+)?)万円$/.exec(v);
  return man ? Math.round(Number(man[1]) * 10000) : null;
}
export function rentalInitialSubtotal(p: PublicProperty): number | null {
  if (p.spec.dealType !== "rental") return null;
  const fees = [brokerFeeAmount(p), ...[p.spec.managementFee, p.spec.deposit, p.spec.keyMoney].map(v => rentalCostYen(v, p.priceYen))];
  if (fees.some(v => v === null)) return null;
  return p.priceYen + (fees as number[]).reduce((a, b) => a + b, 0);
}
export function rentalFeeFaq(p: PublicProperty, locale: LangCode): [string, string][] {
  const amount = brokerFeeAmountLabel(p, locale);
  const line = brokerFeeLine(p, locale);
  const subtotal = rentalInitialSubtotal(p);
  const n = subtotal?.toLocaleString("ja-JP");
  const copy = {
    ja: {
      feeQ: "この物件の仲介手数料はいくらですか？",
      feeA: amount && line ? `${line}です。賃料${p.priceYen.toLocaleString("ja-JP")}円の場合、${amount}です。` : "この物件の仲介手数料は未確認です。ご契約前に個別に確認してご案内します。",
      initialQ: "初期費用はいくらですか？",
      initialA: subtotal === null ? "未確認の費用があるため、初期費用の合計は表示していません。各費用の条件と仲介手数料を確認し、個別にご案内します。" : `賃料1ヶ月・管理費・敷金・礼金・仲介手数料の小計は${n}円です。仲介手数料は${amount}として計算しています。保証会社・保険・その他の費用、日割り賃料等は含まないため、実際の初期費用は個別に確認します。`,
      allQ: "四葉不動産の賃貸はすべて0.33ヶ月ですか？", allA: "いいえ。仲介手数料0.33ヶ月（税込）は対象物件に限ります。対象物件には各物件ページで料金を明記しています。",
      externalQ: "SUUMOやHOME'Sで見つけた物件も相談できますか？", externalA: "はい。ポータル掲載物件は四葉不動産からご紹介できます。URLをお送りいただければ、最新の募集状況と仲介手数料0.33ヶ月（税込）の対象となるか確認します。",
    },
    en: {
      feeQ: "What is the brokerage fee for this property?", feeA: amount && line ? `${line}. At a monthly rent of JPY ${p.priceYen.toLocaleString("en-US")}, the fee is ${amount}.` : "The brokerage fee is unconfirmed. We will confirm it before you sign a contract.",
      initialQ: "What are the initial costs?", initialA: subtotal === null ? "Some costs are unconfirmed, so no total is shown. We will confirm the individual costs and brokerage fee." : `One month's rent, management fee, deposit, key money and brokerage fee subtotal: JPY ${n}. The brokerage fee is ${amount}. This excludes guarantor, insurance, other charges and prorated rent; the final amount needs confirmation.`,
      allQ: "Is the fee 0.33 months for every rental?", allA: "No. The 0.33-month brokerage fee (tax included) applies only to eligible listings. Each listing states its fee.",
      externalQ: "Can I ask about a property found on SUUMO or HOME'S?", externalA: "Yes. We can introduce portal listings. Send its URL and we will check current availability and eligibility for the 0.33-month brokerage fee (tax included).",
    },
    "zh-tw": {
      feeQ: "此物件的仲介費是多少？", feeA: amount && line ? `${line}。月租金${p.priceYen.toLocaleString("ja-JP")}日圓時，仲介費為${amount}。` : "此物件的仲介費尚未確認，簽約前將個別確認。",
      initialQ: "初期費用是多少？", initialA: subtotal === null ? "部分費用尚未確認，因此不顯示總額。我們將確認各項費用及仲介費。" : `1個月租金、管理費、押金、禮金及仲介費的小計為${n}日圓，仲介費按${amount}計算。不含保證公司、保險、其他費用及按日計算的租金，實際金額需個別確認。`,
      allQ: "所有物件的仲介費都是0.33個月嗎？", allA: "不是。含稅0.33個月的仲介費僅適用於指定物件，各物件頁面會明確標示費用。",
      externalQ: "可以諮詢在SUUMO或HOME'S找到的物件嗎？", externalA: "可以。我們可介紹入口網站刊登的物件。請傳送網址，我們將確認最新招租狀況，以及是否適用含稅0.33個月的仲介費。",
    },
    zh: {
      feeQ: "此房源的中介费是多少？", feeA: amount && line ? `${line}。月租金${p.priceYen.toLocaleString("ja-JP")}日元时，中介费为${amount}。` : "此房源的中介费尚未确认，签约前将单独确认。",
      initialQ: "初期费用是多少？", initialA: subtotal === null ? "部分费用尚未确认，因此不显示总额。我们将确认各项费用及中介费。" : `1个月租金、管理费、押金、礼金及中介费的小计为${n}日元，中介费按${amount}计算。不含担保公司、保险、其他费用及按日计算的租金，实际金额需单独确认。`,
      allQ: "所有房源的中介费都是0.33个月吗？", allA: "不是。含税0.33个月的中介费仅适用于指定房源，各房源页面会明确标示费用。",
      externalQ: "可以咨询在SUUMO或HOME'S找到的房源吗？", externalA: "可以。我们可介绍门户网站刊登的房源。请发送网址，我们将确认最新招租状态，以及是否适用含税0.33个月的中介费。",
    },
  }[locale];
  return [[copy.feeQ, copy.feeA], [copy.initialQ, copy.initialA], [copy.allQ, copy.allA], [copy.externalQ, copy.externalA]];
}

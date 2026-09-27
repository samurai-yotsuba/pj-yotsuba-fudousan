import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "@/lib/property-shared";
import { brokerFeeAmountLabel, fee033Comparison } from "@/lib/broker-fee";

export function BrokerFeeDetails({ property, locale }: { property: PublicProperty; locale: LangCode }) {
  const comparison = fee033Comparison(property);
  if (!comparison) return null;
  const c = {
    ja: { heading: "仲介手数料の比較", ours: "この物件の四葉不動産の手数料", reference: "賃料1.1ヶ月（税込）で計算した場合", difference: "差額", note: "賃料のみを基準に計算した仲介手数料の比較です。他社の実際の仲介手数料を示すものではありません。管理費・保証会社・保険等は含みません。" },
    en: { heading: "Brokerage fee comparison", ours: "Our fee for this property", reference: "Calculated at 1.1 months of rent (tax included)", difference: "Difference", note: "This calculation uses rent only. It does not represent another agency's actual fee. Management, guarantor and insurance costs are excluded." },
    "zh-tw": { heading: "仲介費計算比較", ours: "本公司此物件的仲介費", reference: "按1.1個月租金（含稅）計算", difference: "差額", note: "僅以租金為基準的計算比較，不代表其他公司的實際仲介費。不含管理費、保證公司及保險等費用。" },
    zh: { heading: "中介费计算比较", ours: "本公司此房源的中介费", reference: "按1.1个月租金（含税）计算", difference: "差额", note: "仅以租金为基准的计算比较，不代表其他公司的实际中介费。不含管理费、担保公司及保险等费用。" },
  }[locale];
  const yen = (n: number) => locale === "ja" ? `${n.toLocaleString("ja-JP")}円` : `JPY ${n.toLocaleString("en-US")}`;
  return <section id="brokerage-comparison" className="mt-8 scroll-mt-24 rounded-xl border border-primary/30 bg-primary-tint p-4 sm:p-6">
    <h2 className="font-serif text-xl font-semibold">{c.heading}</h2>
    <table className="mt-4 w-full text-sm"><caption className="sr-only">{c.heading}</caption><tbody>
      <tr><th scope="row" className="py-3 text-left font-medium">{c.ours}</th><td className="pl-3 text-right font-semibold">{brokerFeeAmountLabel(property, locale)}</td></tr>
      <tr><th scope="row" className="py-3 text-left font-medium">{c.reference}</th><td className="pl-3 text-right">{yen(comparison.reference)}</td></tr>
      <tr className="border-t border-primary/20"><th scope="row" className="py-3 text-left">{c.difference}</th><td className="pl-3 text-right font-semibold">{yen(comparison.difference)}</td></tr>
    </tbody></table><p className="mt-2 text-xs leading-6 text-text-muted">※{c.note}</p>
  </section>;
}

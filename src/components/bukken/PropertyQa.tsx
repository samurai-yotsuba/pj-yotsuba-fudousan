import { rentalFeeFaq } from "@/lib/rental-costs";
import type { LangCode } from "@/config/languages";
import type { PublicProperty, RentalSpec } from "@/lib/property-shared";

function isRentalSpec(property: PublicProperty): property is PublicProperty & { spec: RentalSpec } {
  return property.spec.dealType === "rental";
}

/** 確認済みの公開データだけで作る、物件ページのQ&AとFAQ構造化データ。 */
export function PropertyQa({ property, locale }: { property: PublicProperty; locale: LangCode }) {
  // QA is designed for rental questions (rent, move-in costs, pets and viewings).
  // Sales and other non-rental listings should keep their pages focused on the
  // published property facts and must not emit an irrelevant FAQPage schema.
  if (!isRentalSpec(property)) return null;
  const rental = isRentalSpec(property) ? property.spec : null;
  const copy = {
    ja: { heading: "よくある質問", rent: "賃料はいくらですか？", rentA: `${property.priceYen.toLocaleString("ja-JP")}円／月${rental?.managementFee ? `（管理費：${rental.managementFee}）` : ""}`, layout: "間取りと広さは？", layoutA: rental ? `${rental.layout}・${rental.exclusiveAreaSqm}㎡` : "物件概要をご確認ください。", pet: "ペットは飼えますか？", petA: rental?.conditions?.match(/ペット[^。]*/)?.[0] ?? "公開情報では確認できません。", cost: "保証会社や保険料は確認できますか？", costA: rental ? `保証会社：${rental.guarantor || "未確認"}。保険：${rental.insurance || "未確認"}。` : "物件ごとに確認が必要です。", viewing: "内見はできますか？", viewingA: "募集状況を確認し、内見可能日をご案内します。下のフォームから希望日時をお知らせください。" },
    en: { heading: "Frequently asked questions", rent: "What is the rent?", rentA: `${property.priceYen.toLocaleString("en-US")} yen per month${rental?.managementFee ? ` (management fee: ${rental.managementFee})` : ""}`, layout: "What are the layout and floor area?", layoutA: rental ? `${rental.layout}, ${rental.exclusiveAreaSqm} sqm` : "See the property overview.", pet: "Are pets allowed?", petA: rental?.conditions?.match(/ペット[^。]*/)?.[0] ?? "Not confirmed in the published information.", cost: "Are guarantee and insurance fees confirmed?", costA: rental ? `Guarantee: ${rental.guarantor || "Not confirmed"}. Insurance: ${rental.insurance || "Not confirmed"}.` : "Confirmation is required for each property.", viewing: "Can I arrange a viewing?", viewingA: "We will check availability and suggest viewing times. Please send your preferred times below." },
    "zh-tw": { heading: "常見問題", rent: "租金是多少？", rentA: `${property.priceYen.toLocaleString("zh-TW")}日圓／月${rental?.managementFee ? `（管理費：${rental.managementFee}）` : ""}`, layout: "格局與面積是多少？", layoutA: rental ? `${rental.layout}・${rental.exclusiveAreaSqm}㎡` : "請確認物件概要。", pet: "可以養寵物嗎？", petA: rental?.conditions?.match(/ペット[^。]*/)?.[0] ?? "公開資訊尚未確認。", cost: "保證公司與保險費已確認嗎？", costA: rental ? `保證公司：${rental.guarantor || "未確認"}。保險：${rental.insurance || "未確認"}。` : "需逐一確認。", viewing: "可以看房嗎？", viewingA: "我們會確認募集狀況並提供看房日期，請在下方告知希望時間。" },
    zh: { heading: "常见问题", rent: "租金是多少？", rentA: `${property.priceYen.toLocaleString("zh-CN")}日元／月${rental?.managementFee ? `（管理费：${rental.managementFee}）` : ""}`, layout: "户型和面积是多少？", layoutA: rental ? `${rental.layout}・${rental.exclusiveAreaSqm}㎡` : "请确认房源概要。", pet: "可以养宠物吗？", petA: rental?.conditions?.match(/ペット[^。]*/)?.[0] ?? "公开信息尚未确认。", cost: "担保公司和保险费已确认吗？", costA: rental ? `担保公司：${rental.guarantor || "未确认"}。保险：${rental.insurance || "未确认"}。` : "需要逐项确认。", viewing: "可以看房吗？", viewingA: "我们会确认募集状态并提供看房日期，请在下方告知希望时间。" },
  }[locale];
  const c = copy;
  const items = [[c.rent, c.rentA], [c.layout, c.layoutA], [c.pet, c.petA], [c.cost, c.costA], [c.viewing, c.viewingA], ...rentalFeeFaq(property, locale)];
  const faqJson = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }).replace(/</g, "\\u003c");
  return <section className="mt-10" aria-labelledby="property-qa-title"><h2 id="property-qa-title" className="font-serif text-xl font-semibold text-ink">{c.heading}</h2><div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{items.map(([question, answer]) => <details key={question} className="group p-4"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-ink marker:hidden">{question}<span className="float-right text-primary transition group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-text-muted">{answer}</p></details>)}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJson }} /></section>;
}

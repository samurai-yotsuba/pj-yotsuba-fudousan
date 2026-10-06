import "server-only";
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { FAQJsonLd } from "@/components/seo/FAQJsonLd";
import { getNonresidentReview, NONRESIDENT_ARTICLE_PATH } from "@/lib/legal/nonresident-review";
import { NONRESIDENT_FEES, type NonresidentCopy } from "@/lib/legal/nonresident-review-copy";

export function NonresidentReviewNotice({ copy }: { copy: NonresidentCopy }) {
  return <aside className="my-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">{copy.review}</aside>;
}

/** One source for service/fee-page, desktop/mobile amounts. No Offer schema for unapproved fees. */
export function NonresidentFeeTable({ copy: c }: { copy: NonresidentCopy }) {
  return (
    <section id="nonresident-company-fees" className="mt-6 space-y-4">
      <h2 className="font-serif text-xl font-semibold">{c.feesTitle}</h2>
      <NonresidentReviewNotice copy={c} />
      <p className="font-semibold">四葉行政書士事務所</p>
      <div className="overflow-x-auto" role="region" aria-label={c.feesTitle} tabIndex={0}>
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{c.feesTitle}</caption>
          <thead><tr>{c.feeColumns.map(label => <th key={label} scope="col" className="border border-border bg-primary-tint p-3">{label}</th>)}</tr></thead>
          <tbody>{NONRESIDENT_FEES.map((f, i) => (
            <tr key={f.basis + i}>
              <th scope="row" className="min-w-36 border border-border p-3 font-medium">{["①", "②", "③", "④"][i]} {c.names[i]}</th>
              <td className="border border-border p-3">{c.units[i]}</td>
              <td className="whitespace-nowrap border border-border p-3">{f.minimum ? c.minimumPrefix : ""}{f.amount.toLocaleString("en-US")}{f.minimum ? c.minimumSuffix : ""} {c.tax}</td>
              <td className="min-w-48 border border-border p-3 leading-relaxed">{c.services[i]}</td>
              <td className="min-w-48 border border-border p-3 leading-relaxed">{c.exclusions[i]}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-sm leading-relaxed">{c.feeNote}</p>
      <p className="text-sm leading-relaxed">{c.independence}</p>
      <p className="text-sm leading-relaxed">{c.disclaimer}</p>
    </section>
  );
}

export function NonresidentReviewLinks({ copy: c, locale }: { copy: NonresidentCopy; locale: LangCode }) {
  return <ul className="mt-4 space-y-2 text-sm">
    {[["/legal/services/company", c.serviceLink], ["/legal/ryokin", c.feeLink], [NONRESIDENT_ARTICLE_PATH, c.articleLink]].map(([href, label]) =>
      <li key={href}><Link href={addLocalePrefix(href, locale)} className="text-primary underline">{label}</Link></li>)}
  </ul>;
}

export async function NonresidentCompanyReview({ locale }: { locale: LangCode }) {
  const c = await getNonresidentReview(locale);
  if (!c) return null;
  return <section id="nonresident-company" className="space-y-6">
    <NonresidentReviewNotice copy={c} />
    <h2 className="font-serif text-xl font-semibold">{c.serviceTitle}</h2>
    <p className="leading-relaxed">{c.serviceLead}</p>
    <h3 className="font-semibold">{c.stagesTitle}</h3><p className="leading-relaxed">{c.stages}</p>
    <h3 className="font-semibold">{c.entrustedTitle}</h3>
    <dl className="space-y-4">{c.names.map((name, i) => <div key={name}><dt className="font-semibold">{["①", "②", "③", "④"][i]} {name}</dt><dd className="mt-2 leading-relaxed">{c.services[i]}</dd></div>)}</dl>
    <h3 className="font-semibold">{c.processTitle}</h3><p className="leading-relaxed">{c.process}</p>
    <h3 className="font-semibold">{c.rolesTitle}</h3>
    <dl className="space-y-3">{c.roles.map(([work, who]) => <div key={work} className="rounded-lg border border-border p-3"><dt>{work}</dt><dd className="mt-1 font-semibold">{who}</dd></div>)}</dl>
    <NonresidentFeeTable copy={c} />
    <h3 className="font-semibold">{c.faqTitle}</h3>
    <dl className="space-y-4">{c.faqs.map(({ question, answer }) => <div key={question}><dt className="font-semibold">{question}</dt><dd className="mt-2 leading-relaxed">{answer}</dd></div>)}</dl>
    <FAQJsonLd items={c.faqs} />
    <NonresidentReviewLinks copy={c} locale={locale} />
  </section>;
}

export async function NonresidentPropertyReview({ locale }: { locale: LangCode }) {
  const c = await getNonresidentReview(locale);
  if (!c) return null;
  return <section id="nonresident-business-premises" className="my-8 space-y-4">
    <NonresidentReviewNotice copy={c} />
    <h2 className="font-serif text-xl font-semibold">{c.propertyTitle}</h2>
    <p className="leading-relaxed">{c.propertyBody}</p>
    <NonresidentReviewLinks copy={c} locale={locale} />
  </section>;
}

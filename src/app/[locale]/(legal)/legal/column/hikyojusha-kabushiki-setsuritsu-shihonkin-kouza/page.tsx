import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ColumnBody from "@/components/column/ColumnBody";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQJsonLd } from "@/components/seo/FAQJsonLd";
import { NonresidentReviewNotice, NonresidentReviewLinks } from "@/components/legal/NonresidentCompanyReview";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { buildPageMetadata, canonicalUrl, PERSON_ID, BUSINESS_SEO } from "@/lib/seo";
import { getNonresidentReview, NONRESIDENT_ARTICLE_PATH } from "@/lib/legal/nonresident-review";
import { NONRESIDENT_SOURCES } from "@/lib/legal/nonresident-review-copy";

// No DB seed or published date. This reserved draft route always returns 404 in production.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = await getNonresidentReview(locale);
  if (!c) return {};
  return {
    ...buildPageMetadata({ businessKey: "legal", title: c.articleTitle, description: c.excerpt,
      path: NONRESIDENT_ARTICLE_PATH, type: "article", locale,
      availableLocales: ["ja", "en", "zh-tw", "zh"], image: "/hero/legal-company-16x9.webp" }),
    robots: { index: false, follow: false },
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = await getNonresidentReview(locale);
  if (!c) notFound();
  const url = canonicalUrl("legal", NONRESIDENT_ARTICLE_PATH, locale);
  const body = [c.excerpt, ...c.articleSections.map(s => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`),
    `## ${c.preparationTitle}\n\n| ${c.preparationColumns.join(" | ")} |\n|---|---|\n${c.preparation.map(row => `| ${row.join(" | ")} |`).join("\n")}`,
    `## ${c.faqTitle}\n\n${c.faqs.map(f => `**${f.question}**\n\n${f.answer}`).join("\n\n")}`,
    `## ${c.sourcesTitle}\n\n${NONRESIDENT_SOURCES.map((href, i) => `- [${c.sourceLabels[i]}](${href}) — ${c.sourceNotes[i]}`).join("\n")}`,
    c.independence, c.disclaimer].join("\n\n");
  return <>
    <Breadcrumb items={[{ name: c.home, href: "/legal" }, { name: c.column, href: "/legal/column" }, { name: c.articleTitle }]} />
    <main id="nonresident-article" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <NonresidentReviewNotice copy={c} />
      <h1 className="font-serif text-2xl font-semibold leading-relaxed sm:text-3xl">{c.articleTitle}</h1>
      <p className="my-4 text-sm text-text-muted">{c.updated}</p>
      <p className="mb-6 text-sm">{c.author}{" · "}<Link href={addLocalePrefix("/legal/about", locale)} className="text-primary underline">{c.authorLink}</Link></p>
      <ColumnBody content={body} />
      <NonresidentReviewLinks copy={c} locale={locale} />
      <CtaBand businessKey="legal" variant="company" />
    </main>
    <FAQJsonLd items={c.faqs} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`,
      headline: c.articleTitle, description: c.excerpt, inLanguage: locale,
      dateModified: "2026-10-06", // Draft revision only; never invent datePublished.
      author: { "@type": "Person", "@id": PERSON_ID, name: "浦松丈二" },
      publisher: { "@id": `${BUSINESS_SEO.legal.url}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: "https://luck428.com/hero/legal-company-16x9.webp" }} />
  </>;
}

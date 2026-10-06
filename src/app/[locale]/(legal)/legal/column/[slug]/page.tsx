import { notFound } from "next/navigation";
import { getLegalColumnBySlug, getLegalColumns, getLocalizedColumn, isLocaleAllowed } from "@/lib/columns";
import { buildPageMetadata } from "@/lib/seo";
import { NONRESIDENT_ARTICLE_SLUG } from "@/lib/legal/nonresident-review";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BlogPostingJsonLd } from "@/components/seo/BlogPostingJsonLd";
import { FAQJsonLd } from "@/components/seo/FAQJsonLd";
import { SpeakableJsonLd } from "@/components/seo/SpeakableJsonLd";
import { CtaBand } from "@/components/shared/CtaBand";
import { getColumnIllustrationAlt, resolveColumnIllustration } from "@/lib/column-illustrations";
import { getColumnConsultWindows } from "@/lib/column-consult-windows";
import { RelatedConsultWindows } from "@/components/column/RelatedConsultWindows";

import LegalColumnDetailContent from "./LegalColumnDetailContent";
import type { Metadata } from "next";
import type { LangCode } from "@/config/languages";


const BREADCRUMBS: Record<LangCode, [string, string]> = {
  ja: ["ホーム", "コラム"], en: ["Home", "Articles"],
  "zh-tw": ["首頁", "專欄"], zh: ["首页", "专栏"],
};

type Props = { params: Promise<{ slug: string }> };

// コラムはDBの記事でコードのデプロイと独立に増えるため、詳細はオンデマンド生成にする
// （物件詳細と同じ）。全記事×4言語をビルドのたびに事前生成すると、東京のDBへの往復が
// 約1,400ページ分かかり、Vercel のビルドが約30分になっていた（2026-09-23）。
// 生成後は [locale]/layout.tsx の revalidate（1時間）と /api/admin/revalidate で更新される。
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const base = await getLegalColumnBySlug(slug);
  if (!base) return {};
  const locale: LangCode = await getRequestLocale();
  if (!isLocaleAllowed(base, locale)) return {};
  const col = getLocalizedColumn(base, locale);
  const illustration = resolveColumnIllustration(base);
  return buildPageMetadata({
    businessKey: "legal",
    title: col.title,
    description: col.excerpt,
    path: `/legal/column/${col.slug}`,
    keywords: col.keywords,
    type: "article",
    publishedTime: col.date,
    modifiedTime: col.modifiedDate ?? col.date,
    section: col.category,
    image: illustration.src,
    locale,
    // hreflang を公開ロケールのみに限定（未公開ロケールの404 URLをGoogleに広告しない）。
    availableLocales: base.locales,
  });
}

export default async function LegalColumnDetailPage({ params }: Props) {
  const { slug } = await params;
  const base = await getLegalColumnBySlug(slug);
  if (!base) notFound();

  const locale: LangCode = await getRequestLocale();
  if (!isLocaleAllowed(base, locale)) notFound();
  const col = getLocalizedColumn(base, locale);
  const resolvedIllustration = resolveColumnIllustration(base);
  const illustration = {
    ...resolvedIllustration,
    alt: getColumnIllustrationAlt(resolvedIllustration, locale, col.title),
  };

  const allLegalColumns = await getLegalColumns(locale);
  const sorted = [...allLegalColumns].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex((c) => c.slug === slug);
  const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const next = idx > 0 ? sorted[idx - 1] : null;

  // 2026-09-24：コラム→受け皿ページの「この記事に関係する相談窓口」（対応表＝column-consult-windows.ts・ja のみ）
  const consultWindows = locale === "ja" ? getColumnConsultWindows("legal", slug) : null;

  return (
    <div>
      <BlogPostingJsonLd
        businessKey="legal"
        column={col}
        image={illustration.src}
        locale={locale}
      />
      <BreadcrumbJsonLd businessKey="legal" locale={locale} items={[
        { name: BREADCRUMBS[locale][0], href: "/legal" },
        { name: BREADCRUMBS[locale][1], href: "/legal/column" },
        { name: col.title, href: `/legal/column/${col.slug}` },
      ]} />
      {col.faq && col.faq.length > 0 && <FAQJsonLd items={col.faq} />}
      <SpeakableJsonLd businessKey="legal" locale={locale} path={`/legal/column/${col.slug}`} headline={col.title} summary={col.excerpt} />
      <LegalColumnDetailContent
        column={col}
        prev={prev}
        next={next}
        illustration={illustration}
        afterBody={consultWindows ? <RelatedConsultWindows windows={consultWindows} /> : undefined}
      />
      {/* ★2026-08-13 追加：コラム記事の末尾にCTA帯を置く。
          3レーンとも column/[slug]・column・about にだけ CtaBand が無く、
          PCではLINEへの導線が出ていなかった（SPは MobileStickyBar があるので出る）。
          コラムは検索・AIから直接入ってくる入口で、読み終えた直後がいちばん動く。
          contact / thanks には入れない（フォームの前後で導線が割れるため）。 */}
      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="legal" variant={slug === NONRESIDENT_ARTICLE_SLUG ? "company" : undefined} />
      </div>
    </div>
  );
}

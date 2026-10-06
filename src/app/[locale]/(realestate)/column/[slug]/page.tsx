import { NonresidentPropertyReview } from "@/components/legal/NonresidentCompanyReview";
import { NONRESIDENT_PROPERTY_COLUMN_SLUG } from "@/lib/legal/nonresident-review";
import { notFound } from "next/navigation";
import { getColumnBySlug, getColumns, getLocalizedColumn, isLocaleAllowed, pickRelatedColumns } from "@/lib/columns";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { BlogPostingJsonLd } from "@/components/seo/BlogPostingJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { FAQJsonLd } from "@/components/seo/FAQJsonLd";
import { SpeakableJsonLd } from "@/components/seo/SpeakableJsonLd";
import { CtaBand } from "@/components/shared/CtaBand";
import { resolveRealestateColumnCta } from "@/lib/column-shared";
import { getColumnIllustrationAlt, resolveColumnIllustration } from "@/lib/column-illustrations";
import { getColumnConsultWindows } from "@/lib/column-consult-windows";
import { RelatedConsultWindows } from "@/components/column/RelatedConsultWindows";

import type { Metadata } from "next";
import type { LangCode } from "@/config/languages";
import ColumnDetailContent from "./ColumnDetailContent";


type Props = {
  params: Promise<{ slug: string }>;
};

// コラムはDBの記事でコードのデプロイと独立に増えるため、詳細はオンデマンド生成にする
// （物件詳細と同じ）。全記事×4言語をビルドのたびに事前生成すると、東京のDBへの往復が
// 約1,400ページ分かかり、Vercel のビルドが約30分になっていた（2026-09-23）。
// 生成後は [locale]/layout.tsx の revalidate（1時間）と /api/admin/revalidate で更新される。
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const base = await getColumnBySlug(slug);
  if (!base) return {};
  const locale: LangCode = await getRequestLocale();
  if (!isLocaleAllowed(base, locale)) return {};
  const col = getLocalizedColumn(base, locale);
  const illustration = resolveColumnIllustration(base);
  return buildPageMetadata({
    businessKey: "realestate",
    title: col.title,
    description: col.excerpt,
    path: `/column/${col.slug}`,
    keywords: col.keywords,
    type: "article",
    publishedTime: col.date,
    modifiedTime: col.modifiedDate ?? col.date,
    section: col.category,
    image: illustration.src,
    locale,
    // hreflang を公開ロケールのみに限定（未公開ロケールの404 URLをGoogleに広告しない）。
    // locales 未設定＝全ロケール許可（後方互換・isLocaleAllowed と同じ判定）。
    availableLocales: base.locales,
  });
}

export default async function ColumnDetailPage({ params }: Props) {
  const { slug } = await params;
  const base = await getColumnBySlug(slug);
  if (!base) notFound();

  const locale: LangCode = await getRequestLocale();
  if (!isLocaleAllowed(base, locale)) notFound();
  const col = getLocalizedColumn(base, locale);
  const resolvedIllustration = resolveColumnIllustration(base);
  const illustration = {
    ...resolvedIllustration,
    alt: getColumnIllustrationAlt(resolvedIllustration, locale, col.title),
  };

  // Find prev/next
  const allColumns = await getColumns(locale);
  const sorted = [...allColumns].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex((c) => c.slug === slug);
  const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const next = idx > 0 ? sorted[idx - 1] : null;

  // Related columns（同一ロケール・タグ一致→カテゴリ一致→新着、自身除外、最大3）。
  // 照合は同一ロケール空間で行うため localize 済み配列で比較する。
  const localizedAll = allColumns.map((c) => getLocalizedColumn(c, locale));
  const related = pickRelatedColumns(localizedAll, {
    excludeSlug: slug,
    category: col.category,
    tags: col.tags,
    limit: 3,
  });

  // 2026-09-05 月次点検（INIT-04）：売却・相続系（相続／離日・売却／海外オーナー向け）の記事は
  // 末尾CTAを sale バリアントに切り替え、/contact に ?intent= を付ける。それ以外は現行既定のまま。
  // ★判定は ja 正本の base で行う（col は翻訳済み＝category が "Inheritance"／"继承" に差し替わる）。
  const cta = resolveRealestateColumnCta(base);

  // 2026-09-24：コラム→受け皿ページ（/group-home/ooya 等）の「この記事に関係する相談窓口」。
  // DB の本文は触らず、コードの対応表（column-consult-windows.ts）に slug があるときだけ ja で本文直後に差す。
  const consultWindows = locale === "ja" ? getColumnConsultWindows("realestate", slug) : null;

  return (
    <div>
      <BlogPostingJsonLd
        businessKey="realestate"
        column={col}
        image={illustration.src}
        locale={locale}
      />
      <BreadcrumbJsonLd businessKey="realestate" items={[
        { name: "ホーム", href: "/" },
        { name: "コラム", href: "/column" },
        { name: col.title, href: `/column/${col.slug}` },
      ]} />
      {col.faq && col.faq.length > 0 && <FAQJsonLd items={col.faq} />}
      <SpeakableJsonLd businessKey="realestate" path={`/column/${col.slug}`} headline={col.title} summary={col.excerpt} />
      <ColumnDetailContent
        col={col}
        prev={prev}
        next={next}
        related={related}
        illustration={illustration}
        // 2026-09-23：既存コラム → 受け皿（/wakeari 配下）の1本。対応表（WAKEARI_HUB_BY_COLUMN_SLUG）に無い slug は何も出ない。
        // 受け皿は ja 先行公開のため ja のときだけ渡す（他ロケールに存在しないページへのリンクを作らない）。
        wakeariHubSlug={locale === "ja" ? slug : undefined}
        afterBody={<>
          {consultWindows && <RelatedConsultWindows windows={consultWindows} />}
          {slug === NONRESIDENT_PROPERTY_COLUMN_SLUG && <NonresidentPropertyReview locale={locale} />}
        </>}
      />
      {/* ★2026-08-13 追加：コラム記事の末尾にCTA帯を置く。
          3レーンとも column/[slug]・column・about にだけ CtaBand が無く、
          PCではLINEへの導線が出ていなかった（SPは MobileStickyBar があるので出る）。
          コラムは検索・AIから直接入ってくる入口で、読み終えた直後がいちばん動く。
          contact / thanks には入れない（フォームの前後で導線が割れるため）。 */}
      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" variant={cta?.variant} intent={cta?.intent} />
      </div>
    </div>
  );
}

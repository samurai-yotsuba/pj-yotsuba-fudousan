import { JsonLd } from "./JsonLd";
import { canonicalUrl, BUSINESS_SEO, PERSON_ID, SHARED_ORG_INFO, SITE_URL } from "@/lib/seo";
import type { Column } from "@/lib/columns";
import type { LangCode } from "@/config/languages";

export function BlogPostingJsonLd({
  businessKey,
  column,
  image,
  authorName,
  authorTitle,
  locale = "ja",
}: {
  businessKey: string;
  column: Column;
  image?: string;
  authorName?: string;
  authorTitle?: string;
  locale?: LangCode;
}) {
  const biz = BUSINESS_SEO[businessKey];
  if (!biz) return null;

  const url = canonicalUrl(businessKey, `${biz.columnBasePath}/${column.slug}`, locale);
  // 静的アセットはルート配信のため SITE_URL に結合する（SEO監査2026-08-24 P0-3）。
  // 旧実装の biz.url 結合は legal で https://luck428.com/legal + パス という実在しないURLを生んでいた
  // （さらに legal は ogImage:"" だったため image が /legal そのものになっていた）。
  const imagePath = image || column.ogImage || biz.ogImage;
  const imageUrl = imagePath
    ? imagePath.startsWith("/")
      ? `${SITE_URL}${imagePath}`
      : imagePath
    : undefined;
  // コラム一覧のURL。旧実装 `${biz.url}${biz.columnBasePath}` は legal で /legal/legal/column に二重化していた
  const blogUrl = canonicalUrl(businessKey, biz.columnBasePath, locale);

  // 優先順位: 明示 props > column.author > フォールバック
  const resolvedAuthorName =
    authorName ?? column.author?.name ?? "浦松 丈二";
  const resolvedAuthorTitle =
    authorTitle ?? column.author?.title ?? "代表";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: column.title,
        description: column.excerpt,
        datePublished: column.date,
        dateModified: column.modifiedDate ?? column.date,
        // 実画像の寸法を保持していないため URL 文字列で出力（誤った width/height を主張しない）
        ...(imageUrl ? { image: imageUrl } : {}),
        // 浦松本人の記事は共通Personノード（/aboutのProfilePageで定義）を@id参照。
        // ローカライズ済み記事はスペース無し表記（例: zh-twの「浦松丈二」）のためスペースを無視して照合。
        // 別名義の寄稿はインラインPersonのまま（@idを誤って共有しない）
        author:
          resolvedAuthorName.replace(/[\s　]/g, "") ===
          SHARED_ORG_INFO.representative.replace(/[\s　]/g, "")
            ? {
                "@type": "Person",
                "@id": PERSON_ID,
                name: resolvedAuthorName,
                url: "https://luck428.com/about",
              }
            : {
                "@type": "Person",
                name: resolvedAuthorName,
                jobTitle: `${biz.name} ${resolvedAuthorTitle}`,
              },
        publisher: { "@id": `${biz.url}/#organization` },
        isPartOf: {
          "@type": "Blog",
          "@id": `${blogUrl}#blog`,
          name: `${biz.name} コラム`,
          url: blogUrl,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: column.category,
        inLanguage: locale,
        wordCount: column.content.length,
        ...(column.keywords?.length ? { keywords: column.keywords.join(", ") } : {}),
      }}
    />
  );
}

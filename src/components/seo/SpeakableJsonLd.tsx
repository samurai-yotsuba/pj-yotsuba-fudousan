import type { LangCode } from "@/config/languages";
import { JsonLd } from "./JsonLd";
import { canonicalUrl, BUSINESS_SEO } from "@/lib/seo";

export function SpeakableJsonLd({
  businessKey,
  path,
  headline,
  summary,
  cssSelector = [".article-headline", ".article-summary"],
  dateModified,
  locale = "ja",
}: {
  businessKey: string;
  path: string;
  headline: string;
  summary: string;
  /**
   * 読み上げ対象のセレクタ。省略時はコラム共通の既定（.article-headline／.article-summary）＝既存出力は不変。
   * 固定ページ（/wakeari 配下・2026-09-23）は直答ブロックと「誰に相談すればよいですか」を指定する。
   */
  cssSelector?: string[];
  /** WebPage の dateModified（ISO 日付）。省略時はキー自体を出さない＝既存出力は不変 */
  dateModified?: string;
  locale?: LangCode;
}) {
  const biz = BUSINESS_SEO[businessKey];
  if (!biz) return null;

  const url = canonicalUrl(businessKey, path, locale);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: headline,
        url,
        ...(dateModified ? { dateModified } : {}),
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector,
        },
      }}
    />
  );
}

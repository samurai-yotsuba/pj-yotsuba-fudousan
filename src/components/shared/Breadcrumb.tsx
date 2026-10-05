// Breadcrumb — パンくず（トップ以外の全ページ）＋ BreadcrumbList JSON-LD
// items は先頭=ホーム、末尾=現在ページ（href無し）。表示HTMLと構造化データを一致させる。
// 規則（委任§4-6）：BreadcrumbList はこの部品からのみ出力（ページ側で重複出力しない）。
// 2026-07-11 ロケール保持（診断_ロケール保持リンク_v1 §B-3・§C-1）：
//   - server維持・async化。部品内部でlocale取得し、同一items配列へ addLocalePrefix を「1回だけ」適用
//     （非冪等＝二重適用禁止。呼び出し側は接頭辞なしの内部パスを渡す規約）。
//   - 表示LinkとBreadcrumbList JSON-LDの両方にこの localized 配列を使う＝HTML/構造化データ一致を維持し、
//     buildPageMetadataのcanonical・hreflang（ロケール接頭辞付きURL）とも同形になる。
//   - ja は addLocalePrefix が素通し＝現行出力バイト不変。外部URL（http…）は変換しない。
import Link from "next/link";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";

export type Crumb = { name: string; href?: string };

type Props = {
  items: Crumb[];
  /** 絶対URL生成用のオリジン（JSON-LD用・省略時は luck428.com） */
  baseUrl?: string;
};

export async function Breadcrumb({ items, baseUrl = "https://luck428.com" }: Props) {
  const locale = await getRequestLocale();
  // ロケール接頭辞の付与はここで1回だけ（内部パスのみ。http…・//… は対象外）
  const localized = items.map((c) =>
    c.href && c.href.startsWith("/") && !c.href.startsWith("//")
      ? { ...c, href: addLocalePrefix(c.href, locale) }
      : c,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: localized.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: c.href.startsWith("http") ? c.href : baseUrl + c.href } : {}),
    })),
  };
  return (
    <nav aria-label={{ ja: "パンくず", en: "Breadcrumbs", "zh-tw": "麵包屑導覽", zh: "面包屑导航" }[locale]} className="mx-auto max-w-5xl px-4 py-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
        {localized.map((c, i) => {
          const last = i === localized.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="transition-colors hover:text-primary">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : ""}>
                  {c.name}
                </span>
              )}
              {!last && <span aria-hidden className="text-border">/</span>}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}

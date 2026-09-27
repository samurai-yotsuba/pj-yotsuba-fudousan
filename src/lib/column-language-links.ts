import type { LangCode } from "@/config/languages";
import { addLocalePrefix, detectLocaleFromPath, localeSwitchBasePath, SUPPORTED_LOCALES } from "@/lib/locale";
import { languages } from "@/config/languages";
import type { BusinessKey } from "@/lib/column-shared";
import { isLocaleAllowed } from "@/lib/column-shared";
import { FEE033_PATH } from "@/lib/rental-campaign";
import { PET_HOUSING_PATH } from "@/lib/pet-housing";

/**
 * 公開済み記事のみ。空配列＝全言語という既存のColumn.locales規約を維持する。
 * 物件詳細（/bukken/<slug>）も同じ表に `bukken/<slug>` をキーとして載せる
 * （記事slugは "/" を含まないため衝突しない）。日本語のみ公開の物件で言語切替が
 * 404へのリンクを出さないため（2026-09-23 本番実測）。
 */
export type ColumnLocaleIndex = Record<string, LangCode[]>;
export const COLUMN_LOCALE_CACHE_TAG = "column-language-index";
export const PROPERTY_INDEX_PREFIX = "bukken/";

/** 物件の公開ロケールを言語切替用の表に変換する（純関数・DB非依存）。 */
export function buildPropertyLocaleIndex(
  properties: ReadonlyArray<{ slug: string; locales: readonly LangCode[] }>,
): ColumnLocaleIndex {
  return Object.fromEntries(
    properties.map(p => [`${PROPERTY_INDEX_PREFIX}${p.slug}`, [...p.locales]]),
  );
}

export type ColumnLinkOverride = { href: string; language: string };
export type ColumnLinkOverrides = Record<string, ColumnLinkOverride>;

/** 自サイトのコラムリンクだけを対象にする。外部サイト・プロトコル相対URLは保持。 */
export function parseColumnLink(href: string) {
  if (!(href.startsWith("/") && !href.startsWith("//")) && !href.startsWith("https://luck428.com/")) return;
  const url = new URL(href, "https://luck428.com");
  const { locale, strippedPath } = detectLocaleFromPath(url.pathname);
  const match = strippedPath.match(/^\/(?:((?:legal|labor))\/)?column\/([^/]+)$/);
  if (!match) return;
  return { url, locale, basePath: strippedPath, business: (match[1] || "realestate") as BusinessKey, slug: match[2] };
}

/** 未公開の翻訳への本文リンクは、実在言語へのリンクと移動先言語の表示に置き換える。 */
export function resolveColumnLink(href: string, index: ColumnLocaleIndex): ColumnLinkOverride | undefined {
  const target = parseColumnLink(href);
  if (!target || !Object.prototype.hasOwnProperty.call(index, target.slug)) return;
  const column = { locales: index[target.slug] };
  if (isLocaleAllowed(column, target.locale)) return;
  const fallback = SUPPORTED_LOCALES.find(locale => isLocaleAllowed(column, locale));
  if (!fallback) return;
  const path = addLocalePrefix(target.basePath, fallback) + target.url.search + target.url.hash;
  return {
    href: href.startsWith("https:") ? `https://luck428.com${path}` : path,
    language: languages.find(language => language.code === fallback)!.native,
  };
}

/**
 * 日本語以外のURLが404になる固定ページ（翻訳が無く、ページ側で notFound() を返す）。
 * 言語切替に404への切替先を出さない（ペット横断 指示書 版2.0 第16章・T18）。
 * 他言語のURLが日本語本文で200を返す既存の ja 先行ページ（/group-home/ooya 等）は、切替先が404ではないためここに入れない。
 */
const FIXED_PAGE_LOCALES: Record<string, readonly LangCode[]> = {
  [PET_HOUSING_PATH]: ["ja"],
  [FEE033_PATH]: ["ja"],
};

/** 言語切替の対象となる詳細ページ（記事・物件）を表のキーに解決する。それ以外は undefined。 */
function switchIndexKey(path: string): string | undefined {
  const column = path.match(/^\/(?:legal\/|labor\/)?column\/([^/]+)$/);
  if (column) return column[1];
  // 物件詳細と写真ページ（/photos は noindex・follow のため、ここも404リンクを出さない）
  const property = path.match(/^\/bukken\/([^/]+)(?:\/photos)?$/);
  if (property) return `${PROPERTY_INDEX_PREFIX}${property[1]}`;
  return undefined;
}

/** SSRの内部/jaパス、公開URL、行政書士ドメインの素パスを同じ記事・物件に対応させる。 */
export function getColumnSwitchLocales(
  pathname: string,
  index: ColumnLocaleIndex,
  currentLocale: LangCode,
): readonly LangCode[] {
  const path = localeSwitchBasePath(pathname).replace(/\/$/, "");
  if (Object.prototype.hasOwnProperty.call(FIXED_PAGE_LOCALES, path)) return FIXED_PAGE_LOCALES[path];
  const key = switchIndexKey(path);
  if (!key) return SUPPORTED_LOCALES;

  // 古いブラウザ内レイアウトや取得失敗で記事・物件を確認できない場合は、翻訳URLを推測しない。
  if (!Object.prototype.hasOwnProperty.call(index, key)) return [currentLocale];
  return SUPPORTED_LOCALES.filter(locale => isLocaleAllowed({ locales: index[key] }, locale));
}

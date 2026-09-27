import { describe, it, expect } from "vitest";
import io from "node:fs";
import path from "node:path";

/**
 * /bukken の収載経路と「published のみ」のガード（sitemap-labor.test.ts と同方式）。
 *
 * - 一覧・sitemap・generateStaticParams に closed / draft が出ないことは
 *   純関数側（isListable / filterListable）を property-shared.test.ts で検証済み。
 *   ここでは sitemap.ts・properties.ts がその経路を実際に使っていることを
 *   ソース文字列で検査する（sitemap() の実行にはDBと next/headers が要るため）。
 */

const SITEMAP = io.readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf-8");
const PROPERTIES = io.readFileSync(
  path.join(process.cwd(), "src/lib/properties.ts"),
  "utf-8",
);
const DETAIL_PAGE = io.readFileSync(
  path.join(process.cwd(), "src/app/[locale]/(realestate)/bukken/[slug]/page.tsx"),
  "utf-8",
);

describe("sitemap に /bukken の経路がある", () => {
  it("STATIC_REALESTATE に /bukken の静的エントリがある（2026-09-16から4ロケール＝locales未指定）", () => {
    const block = SITEMAP.slice(
      SITEMAP.indexOf("const STATIC_REALESTATE"),
      SITEMAP.indexOf("const STATIC_LEGAL"),
    );
    expect(block).toContain('path: "/bukken"');
    const entry = block.slice(block.indexOf('path: "/bukken"'));
    // locales を絞っていない＝ja/en/zh-tw/zh 全4ロケールを収載（ページ側 PAGE_LOCALES と一致）
    expect(entry.slice(0, entry.indexOf("}"))).not.toContain("locales:");
  });

  it("一覧ページの PAGE_LOCALES も4ロケール（sitemap と一致）", () => {
    const LIST_PAGE = io.readFileSync(
      path.join(process.cwd(), "src/app/[locale]/(realestate)/bukken/page.tsx"),
      "utf-8",
    );
    const m = LIST_PAGE.match(/const PAGE_LOCALES: LangCode\[\] = \[([^\]]*)\]/);
    expect(m).not.toBeNull();
    const locales = m![1].split(",").map((s) => s.trim().replace(/"/g, ""));
    expect(locales.sort()).toEqual(["en", "ja", "zh", "zh-tw"]);
  });

  it("物件詳細の展開関数（expandProperty）が realestate sitemap に合流している", () => {
    expect(SITEMAP).toContain("function expandProperty");
    const fn = SITEMAP.slice(SITEMAP.indexOf("async function buildRealestateSitemap"));
    expect(fn.slice(0, fn.indexOf("async function buildLegalSitemap"))).toContain(
      "expandProperty",
    );
  });

  it("published 限定の取得関数＋isListable の二重ガードを通している", () => {
    expect(SITEMAP).toContain("getAllPublishedPropertiesAllLocales");
    expect(SITEMAP).toContain("filter(isListable)");
  });
});

describe("公開面の取得クエリが published を限定している", () => {
  it("一覧・sitemap用クエリは status:'published' のみ", () => {
    // getPublishedProperties / getAllPublishedPropertiesAllLocales の両方
    const matches = PROPERTIES.match(/status: "published"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("広告用の詳細取得は published のみ返す", () => {
    const publishedGetter = PROPERTIES.slice(PROPERTIES.indexOf("export const getPublicPropertyBySlug"), PROPERTIES.indexOf("export const getClosedRentalNavigation"));
    expect(publishedGetter).not.toContain('status: "closed"');
    expect(PROPERTIES).toContain('where: { slug, status: "published" }');
  });

  it("draft を返す公開クエリが存在しない", () => {
    expect(PROPERTIES).not.toContain('"draft"');
  });
});

describe("closed 詳細ページの挙動（おとり広告の構造的回避）", () => {
  it("終了案内はnoindexで元物件の広告データを返さない", () => {
    expect(DETAIL_PAGE).toContain("getClosedRentalNavigation");
    expect(DETAIL_PAGE).toContain("noindex: true");
    const closedGetter = PROPERTIES.slice(PROPERTIES.indexOf("export const getClosedRentalNavigation"));
    expect(closedGetter).toContain("select: { slug: true, locales: true, locationText: true }");
    expect(closedGetter).not.toContain("priceYen");
    expect(closedGetter).not.toContain("images");
  });
  it("取得できない物件はメタデータ生成の段階でも notFound する", () => {
    const fn = DETAIL_PAGE.slice(DETAIL_PAGE.indexOf("export async function generateMetadata"), DETAIL_PAGE.indexOf("export default async function"));
    expect(fn).toContain("if (!closed || !closed.locales.includes(locale)) notFound();");
  });
  it("generateStaticParams は空（物件詳細はオンデマンド生成）", () => {
    const fn = DETAIL_PAGE.slice(
      DETAIL_PAGE.indexOf("export function generateStaticParams"),
      DETAIL_PAGE.indexOf("function summarize"),
    );
    expect(fn).toContain("return []");
  });
});

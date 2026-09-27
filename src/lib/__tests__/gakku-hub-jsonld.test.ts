// 学区ハブ（/gakku）のファーストビューと構造化データ（2026-09-23）
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { languages, type LangCode } from "@/config/languages";
import { GAKKU_COPY } from "@/lib/gakku";
import { buildGakkuHubJsonLd } from "@/lib/gakku-jsonld";
import { DISTRICT_SOURCE, listSchools } from "@/lib/school-district";
import { ENROLLMENT, ENROLLMENT_SOURCE, enrollmentChange } from "@/lib/data/bunkyo-enrollment";
import { SCHOOL_SALE_COPY } from "@/lib/sale-school-district";

const LOCALES: LangCode[] = languages.map((l) => l.code);
const PAGE = fs.readFileSync(path.join(process.cwd(), "src/app/[locale]/(realestate)/gakku/page.tsx"), "utf8");

type Node = Record<string, unknown> & { "@type": string };
const graph = (locale: LangCode) => buildGakkuHubJsonLd(locale)["@graph"] as Node[];
const byType = (locale: LangCode, type: string) => graph(locale).find((n) => n["@type"] === type)!;

describe("学区ハブのファーストビュー", () => {
  it("H1 → 一文 → 児童数 → 地図 の順で、説明文より前に地図を置く", () => {
    const order = ["{c.hub.h1}", "{c.hub.hook}", "c.hub.enrollment.caption", "<GakkuMapEmbed", "{c.hub.answer}"].map((s) => PAGE.indexOf(s));
    for (const i of order) expect(i).toBeGreaterThan(-1);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it.each(LOCALES)("%s: 一文は 3S1K を通称として引用し、当社の取扱いに基づく表現にとどめる", (locale) => {
    const hook = GAKKU_COPY[locale].hub.hook;
    expect(hook).toContain("3S1K");
    expect(hook).toMatch(/当社の取扱い|rentals we handle|本公司經手|本公司经手/);
    expect(hook).not.toMatch(/名門|瞬間蒸発|人気|prestigious|名校/);
  });
  it.each(LOCALES)("%s: 物件検索バナーは賃貸・売買共通の1本だけ表示する", (locale) => {
    expect(SCHOOL_SALE_COPY[locale].indexTitle).not.toMatch(/売買物件を探す|for sale by school|出售物件|出售房源/);
    expect(PAGE).not.toContain("SCHOOL_RENTAL_INDEX_PATH");
    expect(PAGE).not.toContain('addLocalePrefix("/gakku/rentals"');
    expect(PAGE).not.toContain("SCHOOL_RENTAL_COPY[locale].indexTitle");
    expect(PAGE.match(/SCHOOL_SALE_INDEX_PATH/g)).toHaveLength(2);
  });
});

describe("学区ハブの構造化データ", () => {
  it.each(LOCALES)("%s: CollectionPage・ItemList・Dataset×2・Map を1つの @graph で出す", (locale) => {
    const types = graph(locale).map((n) => n["@type"]);
    expect(types).toEqual(["CollectionPage", "ItemList", "Dataset", "Dataset", "Map"]);
    const page = byType(locale, "CollectionPage");
    expect(page.name).toBe(GAKKU_COPY[locale].hub.h1);
    expect(page.mainEntity).toEqual({ "@id": `${page.url}#schools` });
    expect(page.publisher).toEqual({ "@id": "https://luck428.com/#organization" });
  });
  it("ItemList は20校すべてを所在地つきの ElementarySchool で並べる", () => {
    const list = byType("en", "ItemList") as Node & { itemListElement: { url: string; item: { "@type": string; name: string; address?: { addressLocality: string } } }[] };
    expect(list.numberOfItems).toBe(listSchools().length);
    expect(list.itemListElement).toHaveLength(20);
    for (const el of list.itemListElement) {
      expect(el.item["@type"]).toBe("ElementarySchool");
      expect(el.item.address?.addressLocality).toBe("文京区");
      expect(el.url).toMatch(/^https:\/\/luck428\.com\/en\/gakku\/[a-z]+\/rentals$/);
    }
  });
  it("Dataset は区の公表表を出典・更新日・行数つきで示す", () => {
    const ds = byType("ja", "Dataset");
    expect(ds.isBasedOn).toContain(DISTRICT_SOURCE.url);
    expect(ds.dateModified).toBe(DISTRICT_SOURCE.updatedAt);
    expect(String(ds.description)).toContain(String(DISTRICT_SOURCE.rowCount));
  });
  it("児童数の Dataset は区の公表PDFの数値（2021→2026）を出典つきで示す", () => {
    const ds = graph("ja").find((n) => n["@id"] === "https://luck428.com/gakku#enrollment")!;
    expect(ds.isBasedOn).toBe(ENROLLMENT_SOURCE.url);
    expect(ds.temporalCoverage).toBe("2021/2026");
    for (const [slug, e] of Object.entries(ENROLLMENT)) {
      expect(String(ds.description), slug).toContain(`${e[2021]}人（2021年5月1日）→${e[2026]}人（2026年5月1日）`);
    }
  });
  it("Map は国土数値情報を出典に CC BY 4.0 を明示する", () => {
    const map = byType("ja", "Map");
    expect(map.license).toBe("https://creativecommons.org/licenses/by/4.0/");
    expect(String(map.isBasedOn)).toContain("nlftp.mlit.go.jp");
  });
  it("評判・人気・進学実績の語を構造化データに入れない", () => {
    for (const locale of LOCALES) {
      expect(JSON.stringify(buildGakkuHubJsonLd(locale))).not.toMatch(/名門|人気|進学実績|瞬間蒸発|prestigious/);
    }
  });
  it("ページが構造化データを出力する", () => {
    expect(PAGE).toContain("<JsonLd data={buildGakkuHubJsonLd(locale)} />");
  });
});

describe("4校の児童数（区の公表PDFから転記）", () => {
  it("令和3年度・令和8年度の値（5月1日現在）", () => {
    expect(ENROLLMENT).toEqual({
      seishi: { 2021: 766, 2026: 941 },
      showa: { 2021: 766, 2026: 792 },
      sendagi: { 2021: 788, 2026: 773 },
      kubomachi: { 2021: 886, 2026: 994 },
    });
  });
  it("増減と増減率（小数1桁）を計算する。減少も減少として出す", () => {
    expect(enrollmentChange("seishi")).toEqual({ latest: 941, base: 766, diff: 175, rate: 22.8 });
    expect(enrollmentChange("kubomachi")).toEqual({ latest: 994, base: 886, diff: 108, rate: 12.2 });
    expect(enrollmentChange("showa")).toEqual({ latest: 792, base: 766, diff: 26, rate: 3.4 });
    expect(enrollmentChange("sendagi")).toEqual({ latest: 773, base: 788, diff: -15, rate: -1.9 });
    expect(enrollmentChange("rekisen")).toBeUndefined();
  });
  it("ページは4校の帯と出典リンクを出す", () => {
    expect(PAGE).toContain("enrollmentChange(school.slug)");
    expect(PAGE).toContain("href={ENROLLMENT_SOURCE.url}");
  });
});

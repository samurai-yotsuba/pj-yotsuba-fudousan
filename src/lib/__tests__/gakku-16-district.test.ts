// 2026-09-28：個別の通学区域ページを持たない16校の学区賃貸ページを「〇〇小学校 学区」の受け皿にする
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { listSchools, findSchoolBySlug, listDistrictRowsBySchool } from "@/lib/school-district";
import { FEATURED_SCHOOL_SLUGS } from "@/lib/gakku";
import { schoolRentalShowsDistrict, schoolRentalTitle } from "@/lib/rental-school-district";
import { SchoolRentalListings } from "@/components/gakku/SchoolRentalPages";
import type { LangCode } from "@/config/languages";

vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));
const LOCALES: LangCode[] = ["ja", "en", "zh-tw", "zh"];
const others = listSchools().filter(s => !(FEATURED_SCHOOL_SLUGS as readonly string[]).includes(s.slug));

describe("16校の学区賃貸ページ", () => {
  it("対象は16校で、4校は据え置き", () => {
    expect(others).toHaveLength(16);
    for (const slug of FEATURED_SCHOOL_SLUGS) expect(schoolRentalShowsDistrict(slug)).toBe(false);
    for (const s of others) expect(schoolRentalShowsDistrict(s.slug)).toBe(true);
  });
  it("16校のタイトルは学区（通学区域）を正面に、4校の題は従来のまま", () => {
    for (const s of others) expect(schoolRentalTitle(s, "ja")).toBe(`${s.formalName}の学区（通学区域）と賃貸物件`);
    expect(schoolRentalTitle(findSchoolBySlug("seishi")!, "ja")).toBe("誠之小学校区の賃貸物件");
  });
  it.each(LOCALES)("%s: 16校のページに通学区域の表が全行載り、4校のページには載らない", locale => {
    for (const s of others) {
      const html = renderToStaticMarkup(createElement(SchoolRentalListings, { school: s, properties: [], summaries: [], locale }));
      const rows = listDistrictRowsBySchool(s.slug);
      expect(rows.length).toBeGreaterThan(0);
      expect(html).toContain('id="district"');
      expect((html.match(/<tr /g) ?? []).length).toBeGreaterThanOrEqual(rows.length);
      for (const r of rows) expect(html).toContain(r.chome);
    }
    const featured = renderToStaticMarkup(createElement(SchoolRentalListings, { school: findSchoolBySlug("seishi")!, properties: [], summaries: [], locale }));
    expect(featured).not.toContain('id="district"');
  });
});

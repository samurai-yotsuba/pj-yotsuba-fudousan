// 学区ページ強化 作業手順書 v1・PR-3：学区別賃貸の FAQ（表示と FAQPage を同じ items から）
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SCHOOL_RENTAL_FAQ } from "@/lib/rental-school-district";
import { SCHOOL_RENTAL_HUB_FAQ } from "@/lib/rental-school-hub-faq";
import { findSchoolBySlug } from "@/lib/school-district";
import { GAKKU_COPY } from "@/lib/gakku";
import { SchoolRentalIndex, SchoolRentalListings } from "@/components/gakku/SchoolRentalPages";
import type { LangCode } from "@/config/languages";

vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));
const LOCALES = ["ja", "en", "zh-tw", "zh"] as LangCode[];

function faqPages(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1])).filter(d => d["@type"] === "FAQPage");
}

describe("学区別賃貸の FAQ（PR-3）", () => {
  it.each(LOCALES)("%s: ハブと学区別ページに FAQPage が1つずつ出て、表示と一致する", locale => {
    const pages = [
      renderToStaticMarkup(createElement(SchoolRentalIndex, { properties: [], summaries: [], locale })),
      renderToStaticMarkup(createElement(SchoolRentalListings, { school: findSchoolBySlug("seishi")!, properties: [], summaries: [], locale })),
    ];
    // ハブ＝基本3問＋ご家族向けQA、学校別ページ＝基本3問のみ（2026-09-28）
    const expected = [[...SCHOOL_RENTAL_FAQ[locale].items, ...SCHOOL_RENTAL_HUB_FAQ[locale]], SCHOOL_RENTAL_FAQ[locale].items];
    pages.forEach((html, n) => {
      const found = faqPages(html);
      expect(found).toHaveLength(1);
      expect(found[0].mainEntity).toHaveLength(expected[n].length);
      expected[n].forEach((it, i) => {
        expect(found[0].mainEntity[i].name).toBe(it.q);
        expect(found[0].mainEntity[i].acceptedAnswer.text).toBe(it.a);
      });
    });
  });
  it.each(LOCALES)("%s: 3問とも用意され、留保（区が決定）を含む", locale => {
    const items = SCHOOL_RENTAL_FAQ[locale].items;
    expect(items).toHaveLength(3);
    const reservation = { ja: "文京区が決定", en: "decided by Bunkyo City", "zh-tw": "由文京區決定", zh: "由文京区决定" }[locale];
    expect(items.filter(i => i.a.includes(reservation)).length).toBeGreaterThanOrEqual(2);
  });
  it("日本語の掲載条件はページ上の記載（17万5,000円以上・48㎡以上・広告可・毎週日曜・水曜更新）と一致", () => {
    const a = SCHOOL_RENTAL_FAQ.ja.items[2].a;
    for (const w of ["17万5,000円以上", "48㎡以上", "広告", "毎週日曜日と水曜日"]) expect(a).toContain(w);
  });
  it("4校ページの FAQ と設問が重複しない", () => {
    for (const locale of LOCALES) {
      const school = GAKKU_COPY[locale].school;
      for (const it of SCHOOL_RENTAL_FAQ[locale].items) {
        expect(it.q).not.toBe(school.noticeH2);
        expect(it.q).not.toBe(school.procedureH2);
      }
    }
  });
});

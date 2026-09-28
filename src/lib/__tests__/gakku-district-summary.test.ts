// 2026-09-29：学区20校ページの「要約の一文」を区の表から機械生成し、題名・description・H2直後・FAQ回答に共用する。
// 背景：GSC で「〇〇小学校 学区」は順位5〜10でもクリック0（description が疑問文のまま）、
// AI 検索では「どこからどこまで？」に引用できる一文が無く区公式・他社が引かれていた。
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LangCode } from "@/config/languages";
import { listSchools, findSchoolBySlug, listDistrictRowsBySchool } from "@/lib/school-district";
import { FEATURED_SCHOOL_SLUGS, GAKKU_COPY, gakkuCopy } from "@/lib/gakku";
import {
  districtCoverage,
  districtLead,
  districtSummary,
  districtSummaryBySlug,
  groupChome,
  neighborSchools,
  schoolDistrictPagePath,
} from "@/lib/school-district-summary";
import { NeighborLinks } from "@/components/gakku/NeighborLinks";
import { SchoolRentalListings } from "@/components/gakku/SchoolRentalPages";

vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));

const LOCALES: LangCode[] = ["ja", "en", "zh-tw", "zh"];
const school = (slug: string) => findSchoolBySlug(slug)!;
const rows = (slug: string) => listDistrictRowsBySchool(slug);
/** 学校の評価・序列・越境の勧めは書かない（表示規約・コンセプトv1） */
const BANNED = ["評判", "人気", "名門", "ランキング", "越境", "厳選", "ワンストップ", "下の表のとおり"];

describe("学区の要約（区の表から機械生成）", () => {
  it("千駄木小：千駄木4丁目は全域、向丘2・千駄木3/5・本駒込3/4は一部", () => {
    const cov = districtCoverage(rows("sendagi"));
    expect(cov.whole).toEqual(["千駄木4丁目"]);
    expect(cov.partial).toEqual(["向丘2丁目", "千駄木3丁目", "千駄木5丁目", "本駒込3丁目", "本駒込4丁目"]);
    expect(districtLead("ja", school("sendagi"), rows("sendagi"))).toBe(
      "文京区立千駄木小学校の学区（通学区域）は、千駄木4丁目の全域と、向丘2丁目、千駄木3・5丁目、本駒込3・4丁目の一部です",
    );
  });
  it("全域だけの学校（根津小）と一部だけの学校（礫川小）で文の形が変わる", () => {
    expect(districtLead("ja", school("nezu"), rows("nezu"))).toBe("文京区立根津小学校の学区（通学区域）は、弥生1・2丁目、根津1・2丁目の全域です");
    expect(districtLead("ja", school("rekisen"), rows("rekisen"))).toMatch(/^文京区立礫川小学校の学区（通学区域）は、.+の一部です$/);
    expect(districtLead("ja", school("rekisen"), rows("rekisen"))).not.toContain("全域");
  });
  it("「一部、〇〇小」の備考がある町丁目は全域にしない", () => {
    // 千駄木3丁目28番7号は「一部、汐見小」＝旧町名で決まる区域
    const cov = districtCoverage(rows("sendagi"));
    expect(cov.whole).not.toContain("千駄木3丁目");
    const shiomi = districtCoverage(rows("shiomi"));
    expect(shiomi.whole).toEqual(["千駄木1丁目", "千駄木2丁目"]);
  });
  it("町名でまとめる：千駄木3丁目・千駄木5丁目 → 千駄木3・5丁目（英語はまとめない）", () => {
    expect(groupChome(["千駄木3丁目", "千駄木5丁目", "本駒込3丁目"])).toEqual(["千駄木3・5丁目", "本駒込3丁目"]);
    expect(districtLead("en", school("sendagi"), rows("sendagi"))).toContain("parts of 向丘2丁目, 千駄木3丁目, 千駄木5丁目, 本駒込3丁目 and 本駒込4丁目");
  });
  it.each(LOCALES)("%s: 20校すべてで町丁目を含む一文ができ、要約は免責で終わる", (locale) => {
    for (const s of listSchools()) {
      const r = rows(s.slug);
      const lead = districtLead(locale, s, r);
      const full = districtSummary(locale, s, r);
      expect(lead).toContain(s.formalName);
      expect(lead).toMatch(/\d丁目/);
      expect(full.startsWith(lead)).toBe(true);
      expect(full.endsWith(gakkuCopy(locale).disclaimer)).toBe(true);
      expect(full).toContain(String(r.length));
      for (const b of BANNED) expect(full).not.toContain(b);
      expect(lead.length).toBeLessThan(160);
    }
    expect(districtSummaryBySlug(locale, "sendagi")).toBe(districtSummary(locale, school("sendagi"), rows("sendagi")));
    expect(districtSummaryBySlug(locale, "nope")).toBe("");
  });
  it("要約の語は「学区（通学区域）」（利用者は「学区」で検索し、区の用語は「通学区域」）", () => {
    expect(districtLead("ja", school("showa"), rows("showa"))).toContain("学区（通学区域）");
    expect(districtLead("zh-tw", school("showa"), rows("showa"))).toContain("學區（通學區域）");
    expect(districtLead("zh", school("showa"), rows("showa"))).toContain("学区（通学区域）");
    expect(districtLead("en", school("showa"), rows("showa"))).toContain("school district (attendance area)");
  });
});

describe("同じ町丁目を分け合う学校（相互リンク）", () => {
  it("千駄木小の相手は 誠之・汐見・昭和・駒本。関係は対称", () => {
    const n = neighborSchools("sendagi");
    expect(n.map((x) => x.school.slug).sort()).toEqual(["komamoto", "seishi", "shiomi", "showa"]);
    expect(n.find((x) => x.school.slug === "shiomi")!.chomes).toEqual(["向丘2丁目", "千駄木3丁目", "千駄木5丁目"]);
    for (const s of listSchools()) {
      for (const other of neighborSchools(s.slug)) {
        const back = neighborSchools(other.school.slug).find((x) => x.school.slug === s.slug);
        expect(back, `${s.slug}→${other.school.slug} の逆向きが無い`).toBeDefined();
        expect([...back!.chomes].sort()).toEqual([...other.chomes].sort());
      }
    }
  });
  it("全域だけの学校（湯島・根津・本郷）には相手がいない", () => {
    for (const slug of ["yushima", "nezu", "hongo"]) expect(neighborSchools(slug)).toEqual([]);
  });
  it("リンク先：4校は通学区域ページ、16校は学区表つきの賃貸ページ", () => {
    for (const slug of FEATURED_SCHOOL_SLUGS) expect(schoolDistrictPagePath(slug)).toBe(`/gakku/${slug}`);
    expect(schoolDistrictPagePath("shiomi")).toBe("/gakku/shiomi/rentals");
  });
  it.each(LOCALES)("%s: NeighborLinks は相手校へリンクし、相手がいなければ何も描かない", (locale) => {
    const html = renderToStaticMarkup(createElement(NeighborLinks, { slug: "sendagi", locale }));
    const prefix = locale === "ja" ? "" : `/${locale}`;
    expect(html).toContain(`href="${prefix}/gakku/shiomi/rentals"`);
    expect(html).toContain(`href="${prefix}/gakku/showa"`);
    expect(html).toContain(`href="${prefix}/gakku/seishi"`);
    expect(html).toContain(gakkuCopy(locale).school.neighborsLabel);
    expect(renderToStaticMarkup(createElement(NeighborLinks, { slug: "yushima", locale }))).toBe("");
  });
  it("16校の学区賃貸ページにも要約と相手校リンクが載る", () => {
    const s = school("shiomi");
    const html = renderToStaticMarkup(createElement(SchoolRentalListings, { school: s, properties: [], summaries: [], locale: "ja" }));
    expect(html).toContain(districtLead("ja", s, rows("shiomi")));
    expect(html).toContain('href="/gakku/sendagi"');
    expect(html).not.toContain("下の表のとおり");
  });
});

describe("題名・description に「学区」", () => {
  it("ハブと学校ページの題名に利用者の語「学区」が入る（4言語）", () => {
    for (const locale of LOCALES) {
      const c = GAKKU_COPY[locale];
      const word = locale === "en" ? /school district/i : locale === "zh-tw" ? /學區/ : /学区/;
      expect(c.hub.title).toMatch(word);
      expect(c.hub.description).toMatch(word);
      expect(c.school.titleTemplate).toMatch(word);
      expect(c.school.districtH2).toMatch(word);
      for (const b of BANNED) {
        expect(c.hub.title).not.toContain(b);
        expect(c.school.titleTemplate).not.toContain(b);
        expect(c.school.neighborsLabel).not.toContain(b);
      }
    }
    expect(GAKKU_COPY.ja.school.titleTemplate.replace("{school}", "文京区立千駄木小学校")).toContain("千駄木小学校の学区");
  });
});

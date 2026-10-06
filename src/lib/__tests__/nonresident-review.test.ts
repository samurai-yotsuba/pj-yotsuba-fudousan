import { describe, it, expect, vi } from "vitest";
import { isNonresidentReviewEnabled } from "@/lib/legal/nonresident-review-policy";
import { NONRESIDENT_COPY, NONRESIDENT_FEES, NONRESIDENT_SOURCES } from "@/lib/legal/nonresident-review-copy";
import { SECTIONS } from "@/lib/legal/ryokin-sections";

vi.mock("server-only", () => ({}));

const reviewEnv = { NODE_ENV: "development", NONRESIDENT_COMPANY_LOCAL_REVIEW: "true" };

describe("nonresident local review boundary", () => {
  it("requires explicit development-only opt-in", () => {
    expect(isNonresidentReviewEnabled({})).toBe(false);
    expect(isNonresidentReviewEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(isNonresidentReviewEnabled(reviewEnv)).toBe(true);
    for (const NODE_ENV of ["production", "test", undefined]) {
      expect(isNonresidentReviewEnabled({ ...reviewEnv, NODE_ENV })).toBe(false);
    }
    for (const key of ["VERCEL", "FIREBASE_APP_HOSTING", "K_SERVICE", "CI"]) {
      expect(isNonresidentReviewEnabled({ ...reviewEnv, [key]: "true" })).toBe(false);
    }
  });
  it("returns no draft data for production even with opt-in", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NONRESIDENT_COMPANY_LOCAL_REVIEW", "true");
    const { getNonresidentReview } = await import("@/lib/legal/nonresident-review");
    expect(await getNonresidentReview("ja")).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe("fees and translation consistency", () => {
  it("preserves four independent JPY fees and a monthly minimum without inventing tiers", () => {
    expect(NONRESIDENT_FEES.map(f => f.amount)).toEqual([165000, 33000, 88000, 16500]);
    expect(NONRESIDENT_FEES.map(f => f.basis)).toEqual(["case", "case", "bank", "month"]);
    expect(NONRESIDENT_FEES.map(f => f.minimum)).toEqual([false, false, false, true]);
    const existing = SECTIONS.flatMap(s => s.rows).filter(r => r.name === "会社設立（定款作成等）");
    expect(existing).toHaveLength(1);
    expect(existing[0].value).toBe(NONRESIDENT_FEES[0].amount);
  });
  for (const [locale, c] of Object.entries(NONRESIDENT_COPY)) {
    it(`${locale} has complete scope, exclusions, FAQs, sources and separation notices`, () => {
      expect(c.names).toHaveLength(4); expect(c.services).toHaveLength(4);
      expect(c.exclusions).toHaveLength(4); expect(c.units).toHaveLength(4);
      expect(c.faqs).toHaveLength(4); expect(c.articleSections).toHaveLength(4);
      expect(c.roles).toHaveLength(5); expect(c.preparation).toHaveLength(3);
      expect(c.sourceNotes).toHaveLength(NONRESIDENT_SOURCES.length);
      expect(c.sourceLabels).toHaveLength(NONRESIDENT_SOURCES.length);
      expect(c.independence).toContain("165,000");
      expect(c.serviceLead).toContain("四葉行政書士事務所");
      expect(c.propertyBody).toContain("四葉不動産株式会社");
      expect(c.propertyBody).toContain("四葉行政書士事務所");
      const text = JSON.stringify(c);
      expect(text).toContain("No.112");
      expect(text).not.toMatch(/口座番号|3週間|2か月|100%/);
      expect(text).not.toMatch(/https?:\/\/(?:www\.)?(?:bk\.|hqa\.)/);
    });
  }
});

import { describe, expect, it } from "vitest";
import { fixture, NOW } from "./fixtures";
import { rentalContentDigest } from "../content-review";
import { subtrackIncomeYen } from "../candidates";
import { validateRentalImport, type RentalImport } from "../validation";

type Fee = "full" | "half" | "p033" | "free";
function candidate(rent: number, ad: string, fee: Fee | null = "p033", provider: "eslife" | "itandi" = "itandi"): RentalImport {
  const v: RentalImport = fixture();
  delete v.email; delete v.reins;
  const url = provider === "eslife" ? "https://rent.es-square.net/bukken/chintai/search/detail/es-001" : "https://itandibb.com/rent_rooms/12345";
  v.source.provider = provider;
  v.source.roomId = provider === "eslife" ? "es-001" : "12345";
  v.source.url = url;
  v.source.address = "東京都文京区小石川1-1-1";
  v.source.availability = "available";
  v.source.checkedAt = NOW.toISOString();
  v.source.listingEvidence = { ...v.source.listingEvidence, reference: url, quote: "募集中・広告可" };
  v.source.rent = { yen: rent, evidence: { ...v.source.rent.evidence, reference: url, quote: `賃料${rent}円` } };
  v.source.adQuote = ad;
  v.source.applicationStatus = "not-applied";
  v.source.advertising = { status: "allowed", evidence: { ...v.source.listingEvidence, quote: "広告可" } };
  v.property.locationText = v.source.address;
  v.property.priceYen = rent;
  if (v.property.spec.dealType === "rental") {
    if (fee) v.property.spec.brokerFee = fee;
    else delete v.property.spec.brokerFee;
  }
  v.intake = { kind: "portal-search", policy: "bunkyo-p033-income300k", updateEvidence: { ...v.source.listingEvidence, quote: "掲載確認" } };
  v.contentReview = { ...v.contentReview!, digest: rentalContentDigest(v.property) };
  return v;
}

describe("写真付き個別掲載：借主手数料0.33ヶ月で AD＋賃料×0.33 ≥ 30万円", () => {
  it("賃料15万円・AD2か月は 30万＋4.95万 で公開できる（ITANDI）", () => {
    expect(subtrackIncomeYen("AD 2ヶ月", 150000, "p033")).toBe(349500);
    expect(validateRentalImport(candidate(150000, "AD 2ヶ月"), NOW, "published").ok).toBe(true);
  });
  it("いい生活の部屋も同じ条件で公開できる", () => {
    expect(validateRentalImport(candidate(150000, "AD 2ヶ月", "p033", "eslife"), NOW, "published").ok).toBe(true);
  });
  it("ちょうど30万円は対象、30万円未満は拒否する", () => {
    expect(validateRentalImport(candidate(300000, "AD 201000円"), NOW, "published").ok).toBe(true);
    const r = validateRentalImport(candidate(200000, "AD 1ヶ月"), NOW, "published");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join()).toContain("30万円未満です（266000円）");
  });
  it("借主手数料が0.33ヶ月でなければ拒否する", () => {
    for (const fee of ["full", "free", null] as const) {
      const r = validateRentalImport(candidate(200000, "AD 2ヶ月", fee), NOW, "published");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reasons.join()).toContain("0.33ヶ月に設定してください");
    }
  });
  it("ADが確定できない部屋は拒否する", () => {
    const r = validateRentalImport(candidate(200000, "AD 相談"), NOW, "published");
    expect(r.ok).toBe(false);
  });
});

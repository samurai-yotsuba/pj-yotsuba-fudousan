import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, NOW } from "@/lib/rental-import/__tests__/fixtures";
import { toPublicProperty } from "@/lib/property-shared";
import { compilePrivateSchoolCounts, compileRentalDiscovery } from "@/lib/rental-discovery";
import { compileRentalSummaries, type FeedRecord, type RentalFeed } from "@/lib/school-rental-feed";
import { RentalDiscoveryStats } from "@/components/gakku/RentalDiscoveryStats";

function property(room = "201") {
  const p = fixture().property;
  p.slug = `home-${room}`; p.title = `公開住宅 ${room}`;
  p.status = "published"; p.locationText = "東京都文京区根津2丁目13-4";
  p.infoUpdatedAt = "2026-09-25";
  if (p.spec.dealType === "rental") p.spec.brokerFee = "p033";
  return toPublicProperty(p);
}
function record(advertising: FeedRecord["advertising"], building = "非公開機密建物"): FeedRecord {
  return { sourceId: "secret-provider-id", advertising, advertisingQuote: "permission evidence", availability: "active", application: "none", applicationQuote: "none", adQuote: "secret AD", adStatus: "confirmed", summary: {
    building, unit: "301", address: "東京都文京区根津2丁目13-4", rentYen: 250000, managementYen: 10000, commonYen: 0, deposit: "", keyMoney: "", layout: "2LDK", areaSqm: 60, availabilityText: "相談", pets: "unknown", foreignNationals: "unknown", corporate: "unknown", companyHousing: "unknown", companyHousingTerms: "", petTerms: "", foreignTerms: "", corporateTerms: "", buildingType: "マンション", access: "根津", built: "2000年", structure: "RC", floors: "3階", contractType: "普通", contractPeriod: "2年", guaranteeDeposit: "", renewalFee: "", insurance: "", guarantor: "", otherFees: "",
  } };
}
function feed(records: FeedRecord[]): RentalFeed { return { version: 1, provider: "reins", scope: "bunkyo-rent-175000-area-48", checkedAt: "2026-09-20T00:00:00Z", complete: true, records }; }

describe("school discovery counts", () => {
  it("counts all 20 schools using the same public arrays and p033 source", () => {
    const p = property(), full = property("202"); if (full.spec.dealType === "rental") full.spec.brokerFee = "full";
    const result = compileRentalDiscovery([p, full, { ...property("203"), status: "closed" }], [], "ja", null, NOW);
    expect(result.schools).toHaveLength(20);
    expect(result.schools.find(s => s.slug === "nezu")).toMatchObject({ publicListings: 2, fee033Listings: 1, privateAvailableListings: null, totalAvailableListings: null, updatedAt: "2026-09-25" });
    expect(result.totalPublicListings).toBe(2);
    expect(result.totalFee033Listings).toBe(1);
  });
  it("deduplicates confirmed identities across registered properties and feeds", () => {
    const p = property("301"); const r = record("allowed", "公開住宅");
    const summaries = compileRentalSummaries([feed([r])], [], NOW).summaries;
    const result = compileRentalDiscovery([p, { ...p, slug: "duplicate-registration" }], summaries, "ja", null, NOW);
    expect(result.totalPublicListings).toBe(1); expect(result.totalFee033Listings).toBe(1); expect(result.summaries).toHaveLength(0);
  });
  it("does not collapse different rooms or infer missing room identities", () => {
    const a = property("301"), b = property("302");
    expect(compileRentalDiscovery([a,b], [], "ja", null, NOW).totalPublicListings).toBe(2);
    expect(compileRentalDiscovery([{...a,title:"部屋不明"},{...b,title:"部屋不明"}], [], "ja", null, NOW).totalPublicListings).toBe(2);
  });
  it.each(["not-allowed", "unknown", "contact-required"] as const)("does not disclose %s details or treat market totals as introduction permission", advertising => {
    const compiled = compileRentalSummaries([feed([record(advertising)])], [], NOW);
    expect(compiled.market.total).toBe(1);
    const result = compileRentalDiscovery([], compiled.summaries, "ja", compiled.market.checkedAt, NOW);
    const nezu = result.schools.find(s => s.slug === "nezu")!;
    const html = renderToStaticMarkup(createElement(RentalDiscoveryStats, {stats: nezu, locale: "ja"}));
    expect(nezu.publicListings).toBe(0); expect(nezu.privateAvailableListings).toBeNull();
    expect(html).toContain("要確認"); expect(html).not.toMatch(/非公開機密建物|secret-provider-id|secret AD|250000|根津2/);
  });
});

describe("confirmed portal introduction counts", () => {
  it("counts denied advertising only as an anonymous aggregate and deduplicates sources", () => {
    const a = feed([record("not-allowed")]);
    const b = { ...a, provider: "atbb" as const };
    const privateCounts = compilePrivateSchoolCounts([a,b], [], NOW)!;
    expect(privateCounts.counts.nezu).toBe(1);
    expect(JSON.stringify(privateCounts)).not.toMatch(/非公開機密建物|250000|secret|根津2/);
    const discovery = compileRentalDiscovery([property()], [], "ja", null, NOW, privateCounts);
    expect(discovery.schools.find(s => s.slug === "nezu")).toMatchObject({publicListings:1,privateAvailableListings:1,totalAvailableListings:2});
    const html = renderToStaticMarkup(createElement(RentalDiscoveryStats, {stats: discovery.schools.find(s => s.slug === "nezu")!, locale:"ja"}));
    expect(html).not.toMatch(/非公開機密建物|secret-provider-id|secret AD|250000|根津2/);
  });
  it("excludes unknown application/advertising, withdrawals and already registered units", () => {
    for (const patch of [{ application: "unknown" as const }, { advertising: "unknown" as const }, { availability: "closed" as const }, { application: "present" as const }]) {
      expect(compilePrivateSchoolCounts([feed([{...record("not-allowed"), ...patch}])], [], NOW)?.counts.nezu).toBe(0);
    }
    const r = record("not-allowed");
    expect(compilePrivateSchoolCounts([feed([r])], [r.summary], NOW)?.counts.nezu).toBe(0);
    const withdrawn = {...feed([{...r,availability:"closed" as const}]),provider:"atbb" as const};
    expect(compilePrivateSchoolCounts([feed([r]),withdrawn], [], NOW)?.counts.nezu).toBe(0);
  });
  it("does not turn missing, future or incomplete snapshots into zero", () => {
    expect(compilePrivateSchoolCounts([], [], NOW)).toBeNull();
    expect(compilePrivateSchoolCounts([{...feed([]),checkedAt:"2999-01-01T00:00:00Z"}], [], NOW)).toBeNull();
    expect(compilePrivateSchoolCounts([{...feed([]),complete:false} as unknown as RentalFeed], [], NOW)).toBeNull();
  });
});

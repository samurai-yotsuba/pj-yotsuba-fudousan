import { getColumnSwitchLocales } from "../column-language-links";
import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { brokerFeeAmount, brokerFeeBadge, fee033Comparison } from "../broker-fee";
import { rentalCostYen, rentalFeeFaq, rentalInitialSubtotal } from "../rental-costs";
import { buildRealEstateListingJsonLd } from "../property-jsonld";
import { PropertyQa } from "@/components/bukken/PropertyQa";
import { BrokerFeeDetails } from "@/components/bukken/BrokerFeeDetails";
import { RentalDiscoveryStats } from "@/components/gakku/RentalDiscoveryStats";
import { compilePrivateSchoolCounts } from "../rental-discovery";
import { fee033HubListings } from "../fee033-hub";
import { filterProperties } from "../property-filters";
import type { PublicProperty, RentalSpec } from "../property-shared";
import type { RentalFeed } from "../school-rental-feed";

const p: PublicProperty = {
  slug: "fee-test-101", title: "検証用物件 101", status: "published", dealType: "rental", category: "other", tradeMode: "broker",
  priceYen: 260000, locationText: "東京都文京区根津1丁目1番1号", access: [], images: [], description: "説明", infoUpdatedAt: "2026-09-27", nextUpdateAt: "2026-10-11", locales: ["ja"],
  spec: { dealType: "rental", brokerFee: "p033", buildingType: "マンション", layout: "2LDK", exclusiveAreaSqm: 55, structure: "RC", floors: "5階", floorLocated: "1階", builtYm: "2020-01", deliveryYm: "相談", accessText: "根津駅 徒歩5分", managementFee: "20,000円", deposit: "1ヶ月", keyMoney: "1ヶ月", guaranteeDeposit: "なし", renewalFee: "1ヶ月", insurance: "未確認", guarantor: "未確認", otherFees: "未確認", contractType: "普通借家", contractPeriod: "2年", conditions: "ペット不可" },
};
const fee = (v?: RentalSpec["brokerFee"]) => ({ ...p, spec: { ...p.spec, brokerFee: v } } as PublicProperty);
const urls = { url: "https://luck428.com/bukken/fee-test-101", siteUrl: "https://luck428.com", inLanguage: "ja", images: [] };

describe("料金の全出力が物件の正本に一致する", () => {
  it("税込0.33・85,800円がbadge/比較/FAQ/JSON-LDで一致", () => {
    expect(brokerFeeBadge(p, "ja")).toBe("仲介手数料 0.33ヶ月（税込）");
    expect(brokerFeeAmount(p)).toBe(85800);
    expect(fee033Comparison(p)).toEqual({ amount: 85800, reference: 286000, difference: 200200 });
    const faqHtml = renderToStaticMarkup(<PropertyQa property={p} locale="ja" />);
    const comparison = renderToStaticMarkup(<BrokerFeeDetails property={p} locale="ja" />);
    expect(faqHtml).toContain("85,800円（税込）");
    expect(faqHtml).not.toContain("仲介手数料＝賃料1ヶ月");
    expect(comparison).toContain("200,200");
    const json = buildRealEstateListingJsonLd(p, "ja", urls);
    expect((json.offers as Record<string, unknown>).price).toBe(260000); // rent must not become brokerage fee
    expect((json.offers as Record<string, unknown>).description).toContain("85,800円（税込）");
    expect((json.offers as Record<string, unknown>).description).toContain("0.33ヶ月");
    expect(rentalInitialSubtotal(p)).toBe(885800);
  });
  it("対象外・無料・未設定で0.33バッジ/比較を出さず、不明を満額へ補完しない", () => {
    for (const value of ["full", "free", "half", undefined] as const) {
      const property = fee(value);
      expect(brokerFeeBadge(property, "ja") ?? "").not.toContain("0.33");
      expect(fee033Comparison(property)).toBeNull();
      expect(renderToStaticMarkup(<BrokerFeeDetails property={property} locale="ja" />)).toBe("");
    }
    expect(brokerFeeAmount(fee())).toBeNull();
    expect(rentalInitialSubtotal(fee())).toBeNull();
    expect(rentalFeeFaq(fee(), "ja")[0][1]).toContain("未確認");
    expect(brokerFeeAmount(fee("free"))).toBe(0);
  });
  it("4言語すべての物件FAQが同じ料金区分を反映", () => {
    for (const locale of ["ja", "en", "zh-tw", "zh"] as const) {
      expect(rentalFeeFaq(p, locale)[0][1]).toContain("85,800");
      expect(rentalFeeFaq(fee("free"), locale)[0][1]).not.toContain("0.33");
    }
  });
  it("端数と未確認費用・万円・か月表記を扱い不明を0にしない", () => {
    expect(brokerFeeAmount({ ...p, priceYen: 100001 })).toBe(33000);
    expect(rentalCostYen("1.5万円", 260000)).toBe(15000);
    expect(rentalCostYen("1か月", 260000)).toBe(260000);
    expect(rentalCostYen("不要", 260000)).toBe(0);
    for (const v of ["", "未確認", "1ヶ月＋税", "賃料等の50%", "1ヶ月（償却あり）"]) expect(rentalCostYen(v, 260000)).toBeNull();
  });
  it("ハブは文京区公開対象だけ、同一住戸の重複や終了・他地域を数えない", () => {
    const data = fee033HubListings([p, { ...p, slug: "duplicate-101" }, { ...p, status: "closed" }, { ...p, locationText: "新宿区西新宿1-1-1" }, { ...fee("full"), title: "別建物 102", slug: "other" }]);
    expect(data.published).toHaveLength(2); expect(data.eligible).toHaveLength(1);
    expect(filterProperties(data.published, { fee: "p033" })).toHaveLength(1);
    expect(filterProperties(data.published, { pets: "allowed" })).toHaveLength(0);
  });
  it("広告不可物件を集計したHTMLに名称・部屋・住所・賃料等が漏れない", () => {
    const secret = "PRIVATE-SECRET-BUILDING";
    const summary = { building: secret, unit: "909", address: "東京都文京区根津1丁目1番1号", rentYen: 299999, managementYen: null, commonYen: null, deposit: "", keyMoney: "", layout: "3LDK", areaSqm: 60, availabilityText: "", pets: "unknown", foreignNationals: "unknown", corporate: "unknown", petTerms: "", foreignTerms: "", corporateTerms: "", buildingType: "", access: "", built: "", structure: "", floors: "", contractType: "", contractPeriod: "", guaranteeDeposit: "", renewalFee: "", insurance: "", guarantor: "", otherFees: "" };
    const feed = { version: 1, provider: "atbb", scope: "bunkyo-rent-175000-area-48", checkedAt: "2026-09-27T00:00:00Z", complete: true, records: [{ sourceId: "secret-id", advertising: "not-allowed", advertisingQuote: "広告不可", availability: "active", application: "none", applicationQuote: "申込なし", adQuote: "", adStatus: "unknown", summary }] } as RentalFeed;
    const result = compilePrivateSchoolCounts([feed], [], new Date("2026-09-27T12:00:00Z"));
    expect(result).not.toBeNull();
    expect(Object.values(result!.counts).reduce((a,b) => a+b, 0)).toBe(1);
    const html = renderToStaticMarkup(<RentalDiscoveryStats locale="ja" stats={{ slug: "nezu", publicListings: 0, fee033Listings: 0, advertisingAllowedListings: 0, privateAvailableListings: result!.counts.nezu, totalAvailableListings: result!.counts.nezu, updatedAt: result!.checkedAt }} />);
    for (const value of [secret, "909", "299999", summary.address, "secret-id"]) expect(html).not.toContain(value);
    expect(html).toContain("紹介可能物件（非公開）");
    expect(html).not.toContain("広告掲載できない");
  });
});

it("limits the Japanese fee hub language links to existing translations", () => {
  expect(getColumnSwitchLocales("/bunkyo/chukai-033", {}, "ja")).toEqual(["ja"]);
});

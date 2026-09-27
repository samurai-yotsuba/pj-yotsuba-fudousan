import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, NOW } from "@/lib/rental-import/__tests__/fixtures";
import { validateRentalImport } from "@/lib/rental-import/validation";
import { toPublicProperty, type PublicProperty } from "@/lib/property-shared";
import { groupSchoolRentals, rentalSchoolDistrict, SCHOOL_RENTAL_COPY, schoolRentalPath } from "@/lib/rental-school-district";
import { findSchoolBySlug, listSchools } from "@/lib/school-district";
import { SchoolRentalIndex, SchoolRentalListings } from "@/components/gakku/SchoolRentalPages";
import { PropertySchoolDistrict } from "@/components/gakku/RentalSchoolDistrict";
import { PropertyCard } from "@/components/bukken/PropertyCard";
import type { LangCode } from "@/config/languages";

// Next's async root-params breadcrumb is covered by the running-app checks.
vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));

function rental(address = "東京都文京区春日２丁目12-12"): PublicProperty {
  const p=fixture().property;
  p.locationText=address; p.status="published"; p.locales=["ja","en","zh-tw","zh"]; p.priceYen=250000;
  if(p.spec.dealType==='rental'){p.spec.availabilityExpiresAt="2999-01-01T00:00:00Z";p.spec.exclusiveAreaSqm=60;}
  p.translations={en:{title:"Kasuga Apartment",description:"Apartment",locationText:"2-12-12 Kasuga, Bunkyo-ku, Tokyo"}};
  return toPublicProperty(p);
}

describe("住所を正本とする賃貸の学区",()=>{
  it.each([
    ["東京都文京区春日２丁目12-12","kanatomi"],
    ["東京都文京区本郷１丁目25-26","hongo"],
    ["東京都文京区白山１丁目12-4","sasugaya"],
    ["東京都文京区根津2丁目13-4","nezu"],
    ["東京都文京区千石３丁目10-5","otsuka"],
  ])("%s → %s",(address,slug)=>expect(rentalSchoolDistrict(rental(address))).toMatchObject({status:"determined",school:{slug}}));
  it("旧町名の分割区域・番地不足・未対応の文京区住所を推測しない",()=>{
    for(const address of ["文京区大塚2丁目4番10号","文京区白山1丁目32番","文京区小石川3丁目","文京区小日向4丁目99番"]){
      expect(rentalSchoolDistrict(rental(address))).toMatchObject({status:"needs-inquiry"});
      expect([...groupSchoolRentals([rental(address)],"ja",NOW).values()].flat()).toHaveLength(0);
    }
  });
  it("文京区以外や売買には賃貸の学区タグを付けない",()=>{
    expect(rentalSchoolDistrict(rental("東京都豊島区南池袋1-1-1"))).toBeNull();
    expect(rentalSchoolDistrict({...rental(),dealType:"land"})).toBeNull();
    expect(rentalSchoolDistrict(rental("大塚1丁目"))).toBeNull();
  });
  it.each(["ja","en","zh-tw","zh"] as LangCode[])("%s でも翻訳住所で判定しない",locale=>{
    const p=rental(); const groups=groupSchoolRentals([p],locale,NOW);
    expect(groups.get("kanatomi")).toEqual([p]);
    expect(groups.size).toBe(20);
  });
  it("終了・下書き・非公開言語・売買を件数に混ぜず、確認目安超過は表示する",()=>{
    const live=rental(); const expired=rental();
    if(expired.spec.dealType==='rental')expired.spec.availabilityExpiresAt="2020-01-01T00:00:00Z";
    const list=[live,{...rental(),status:"closed" as const},{...rental(),status:"draft" as const},expired,{...rental(),locales:["ja" as const]},{...rental(),dealType:"land" as const}];
    expect(groupSchoolRentals(list,"en",NOW).get("kanatomi")).toEqual([live, expired]);
  });
  it("写真付き公開物件は募集比較フィードの賃料・面積条件で除外しない",()=>{
    const boundary=rental(); boundary.priceYen=175000;
    if(boundary.spec.dealType==="rental") boundary.spec.exclusiveAreaSqm=48;
    const underArea=rental();
    if(underArea.spec.dealType==="rental") underArea.spec.exclusiveAreaSqm=47.99;
    const underRent=rental(); underRent.priceYen=174999;
    const grouped=groupSchoolRentals([boundary,underArea,underRent],"ja",NOW).get("kanatomi");
    expect(grouped).toEqual([boundary,underArea,underRent]);
  });
  it.each(["itandi","eslife"] as const)("%s の取込時に非公開の判定記録を残す",provider=>{
    const v=fixture();const address="東京都文京区根津2丁目13-4";
    v.source.address=address;v.property.locationText=address;
    v.source.provider=provider;v.source.applicationStatus="not-applied";
    v.source.url=provider==='itandi'?v.source.url:"https://rent.es-square.net/bukken/chintai/search/detail/123";
    v.source.listingEvidence.reference=v.source.url;v.source.rent.evidence.reference=v.source.url;
    v.source.advertising={status:"allowed",evidence:{checkedAt:NOW.toISOString(),reference:v.source.url,quote:"広告可"}};
    const result=validateRentalImport(v,NOW);
    expect(result.ok).toBe(true);
    if(result.ok){
      expect(result.property.internal?.schoolDistrict).toMatchObject({status:"determined",school:{slug:"nezu"}});
      expect(toPublicProperty(result.property)).not.toHaveProperty("internal");
    }
  });
});

describe("学区の表示と相互導線",()=>{
  it.each(["ja","en","zh-tw","zh"] as LangCode[])("%s: 全20校、学区別一覧、原住所のカードタグを表示",locale=>{
    const prefix=locale==='ja'?'':'/'+locale;
    const html=renderToStaticMarkup(createElement(SchoolRentalIndex,{properties:[rental()],locale}));
    for(const s of listSchools())expect(html).toContain(`href="${prefix}${schoolRentalPath(s.slug)}"`);
    const list=renderToStaticMarkup(createElement(SchoolRentalListings,{school:findSchoolBySlug('kanatomi')!,properties:[rental()],locale}));
    expect(list).toContain('金富小学校');expect(list).toContain(`${prefix}/bukken/ignored`);
    const card=renderToStaticMarkup(createElement(PropertyCard,{p:rental(),locale}));
    expect(card).toContain('金富小学校');expect((card.match(/<a\b/g)||[])).toHaveLength(1);
    const detail=renderToStaticMarkup(createElement(PropertySchoolDistrict,{property:rental(),locale}));
    expect(detail).toContain(`${prefix}/gakku/kanatomi/rentals`);expect(detail).toContain('city.bunkyo.lg.jp');
  });
  it("0件の学校でも他校物件を表示せず相談への動線を示す",()=>{
    const html=renderToStaticMarkup(createElement(SchoolRentalListings,{school:findSchoolBySlug('kubomachi')!,properties:[rental()],locale:'ja'}));
    expect(html).toContain(SCHOOL_RENTAL_COPY.ja.empty);expect(html).toContain('gakku-kubomachi-rental');
    expect(html).not.toContain('/bukken/ignored');expect(html).toContain('"numberOfItems":0');
  });
});

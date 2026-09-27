import { brokerFeeAmountLabel, brokerFeeLine } from "@/lib/broker-fee";
import type { LangCode } from "@/config/languages";
import { walkMinutes, type PublicProperty } from "@/lib/property-shared";
import { buildLocalizedDisplayRows, propertyUi } from "@/lib/property-i18n";

/**
 * 物件の構造化データ（純関数）。入力は PublicProperty（ホワイトリスト経由）のみ。
 * 語彙は schema.org（RealEstateListing / Apartment / House / Place / PropertyValue /
 * Offer / UnitPriceSpecification / ItemList）と GoodRelations の businessFunction
 * （Sell / LeaseOut）。2026-09-20 に schema.org の語彙定義（schemaorg-current-https.jsonld）で
 * 各プロパティの domain を確認。itemOffered の range に Place/Accommodation は無いため使わず、
 * 物件本体は RealEstateListing.mainEntity（@id）で関連付け、offers は listing（CreativeWork）に置く。
 *
 * 規則：
 * - 可視ページと同じ確定値だけを出す。不明はプロパティごと省略（0・空文字・falseで埋めない）。
 * - 「未確認／確認中」等を含む値、訳が無い自由記述は転記しない。
 * - numberOfRooms は出さない（1SLDK を部屋数1と決めつけない）。間取りは PropertyValue。
 * - petsAllowed は出さない（条件付き可否を真偽値に丸めない。条件は可視本文が正本）。
 * - availability は出さない（2026-09-01浦松修正指示5を維持）。
 */

const UNSETTLED = /未確認|確認中|要確認|unconfirmed|unknown|being confirmed|to be confirmed|未确认|确认中|待確認|待确认/i;

export function isSettledText(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "" && !UNSETTLED.test(v);
}

type Json = Record<string, unknown>;

function qv(value: number): Json {
  return { "@type": "QuantitativeValue", value, unitCode: "MTK" };
}

function prop(name: string, value: string): Json {
  return { "@type": "PropertyValue", name, value };
}

export type JsonLdUrls = { url: string; siteUrl: string; inLanguage: string; images: string[] };

export function buildRealEstateListingJsonLd(p: PublicProperty, locale: LangCode, u: JsonLdUrls): Json {
  const rows = buildLocalizedDisplayRows(p, locale);
  const row = (key: string) => {
    const r = rows.find((x) => x.key === key);
    return r && !r.untranslated && isSettledText(r.value) ? r : undefined;
  };
  const entityId = `${u.url}#property`;
  const s = p.spec;

  const additional: Json[] = [];
  const pushRow = (key: string) => {
    const r = row(key);
    if (r) additional.push(prop(r.label, r.value));
  };

  let type: string | undefined;
  const entity: Json = {};
  if (s.dealType === "rental") {
    type = /マンション|アパート/.test(s.buildingType) ? "Apartment" : "Accommodation";
    if (s.exclusiveAreaSqm > 0) entity.floorSize = qv(s.exclusiveAreaSqm);
    for (const k of ["layout", "structure", "floors", "floorLocated", "builtYm"]) pushRow(k);
  } else if (s.dealType === "condo") {
    type = "Apartment";
    if (s.exclusiveAreaSqm > 0) entity.floorSize = qv(s.exclusiveAreaSqm);
    for (const k of ["floors", "floorLocated", "builtYm"]) pushRow(k);
  } else if (s.dealType === "house") {
    type = "House";
    if (s.buildingAreaSqm > 0) entity.floorSize = qv(s.buildingAreaSqm);
    for (const k of ["landArea", "builtYm"]) pushRow(k);
  } else if (s.dealType === "land") {
    // 土地面積を floorSize に流用しない。Place＋PropertyValue で表す
    type = "Place";
    for (const k of ["landArea", "landCategory", "zoning", "buildingCoverage", "floorAreaRatio"]) pushRow(k);
  } else {
    type = "Place";
    for (const k of ["landArea", "buildingArea", "structure", "floors", "zoning", "builtYm"]) pushRow(k);
  }

  const location = row("location")?.value ?? (locale === "ja" ? p.locationText : undefined);
  const mainEntity: Json = {
    "@type": type,
    "@id": entityId,
    name: p.title,
    ...(location ? { address: { "@type": "PostalAddress", addressCountry: "JP", streetAddress: location } } : {}),
    ...entity,
    ...(additional.length > 0 ? { additionalProperty: additional } : {}),
  };

  const accessText = p.access
    .map((a) => `${a.line}${a.station}${locale === "ja" ? "駅 徒歩" : " "}${walkMinutes(a.distanceM)}${locale === "ja" ? "分" : " min"}`)
    .join("・");
  const description = [location, accessText].filter(Boolean).join("／");

  const isRental = p.dealType === "rental";
  const offers: Json = {
    "@type": "Offer",
    price: p.priceYen,
    priceCurrency: "JPY",
    ...(brokerFeeAmountLabel(p, locale) ? { description: `${brokerFeeLine(p, locale)} / ${brokerFeeAmountLabel(p, locale)}` } : {}),
    businessFunction: `http://purl.org/goodrelations/v1#${isRental ? "LeaseOut" : "Sell"}`,
    offeredBy: { "@id": `${u.siteUrl}/#organization` },
    ...(isRental
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: p.priceYen,
            priceCurrency: "JPY",
            unitCode: "MON",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
          },
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${u.url}#listing`,
    url: u.url,
    name: p.title,
    inLanguage: u.inLanguage,
    ...(p.publishedAt ? { datePosted: p.publishedAt } : {}),
    dateModified: p.infoUpdatedAt,
    ...(u.images.length > 0 ? { image: u.images } : {}),
    ...(description ? { description } : {}),
    mainEntity,
    offers,
  };
}

/** 一覧の ItemList。渡された（＝実際に表示している）物件だけを、表示順のまま出す */
export function buildPropertyItemListJsonLd(
  items: Array<{ name: string; url: string }>,
  listUrl: string,
  locale: LangCode,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${listUrl}#listings`,
    name: propertyUi(locale).listing,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: it.url })),
  };
}

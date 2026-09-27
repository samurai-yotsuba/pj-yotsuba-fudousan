import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "./property-shared";
import { brokerFeeOf } from "./broker-fee";
import { groupSchoolRentals } from "./rental-school-district";
import { lookupDistrictByAddress, listSchools } from "./school-district";
import { sameUnit, feedSchema, splitUnit, SCHOOL_RENTAL_MIN_RENT_YEN, SCHOOL_RENTAL_MIN_AREA_SQM, type RentalFeed, type RentalSummary, type PublicRentalSummary } from "./school-rental-feed";
import { registeredRentalIdentity } from "./registered-rental-identity";

export type SchoolRentalCount = {
  slug: string; publicListings: number; fee033Listings: number;
  advertisingAllowedListings: number;
  /** Null means no complete confirmed snapshot is available; it does not mean zero. */
  privateAvailableListings: number | null; totalAvailableListings: number | null;
  updatedAt: string | null;
};
function latest(dates: (string | null | undefined)[]) {
  return dates.filter((d): d is string => !!d && Number.isFinite(Date.parse(d)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}
/** Public shapes only. Private feed records must never be passed to a view. */
export function compileRentalDiscovery(properties: readonly PublicProperty[], summaries: readonly PublicRentalSummary[], locale: LangCode, checkedAt: string | null = null, now = new Date(), privateCounts: PrivateSchoolCounts | null = null) {
  const groups = groupSchoolRentals(properties, locale, now);
  const acceptedProperties: PublicProperty[] = [];
  for (const [slug, items] of groups) {
    const unique = items.filter(p => {
      const identity = registeredRentalIdentity(p);
      if (acceptedProperties.some(other => other.slug === p.slug || (identity && (() => { const prior = registeredRentalIdentity(other); return prior && sameUnit(identity, prior); })()))) return false;
      acceptedProperties.push(p); return true;
    });
    groups.set(slug, unique);
  }
  const acceptedSummaries: PublicRentalSummary[] = [];
  for (const row of summaries) {
    if (!groups.has(row.schoolSlug ?? "")) continue;
    if (acceptedProperties.some(p => { const identity = registeredRentalIdentity(p); return identity && sameUnit(identity, row); })) continue;
    if (acceptedSummaries.some(other => row.id === other.id || sameUnit(row, other))) continue;
    acceptedSummaries.push(row);
  }
  const schools: SchoolRentalCount[] = listSchools().map(school => {
    const listings = groups.get(school.slug) ?? [];
    const feed = acceptedSummaries.filter(r => r.schoolSlug === school.slug);
    const publicListings = listings.length + feed.length;
    return { slug: school.slug, publicListings, fee033Listings: listings.filter(p => brokerFeeOf(p) === "p033").length,
      advertisingAllowedListings: publicListings, privateAvailableListings: privateCounts?.counts[school.slug] ?? null, totalAvailableListings: privateCounts ? publicListings + (privateCounts.counts[school.slug] ?? 0) : null,
      updatedAt: latest([checkedAt, privateCounts?.checkedAt, ...listings.map(p => p.infoUpdatedAt), ...feed.map(r => r.checkedAt)]) };
  });
  return { groups, summaries: acceptedSummaries, schools,
    totalPublicListings: schools.reduce((sum, s) => sum + s.publicListings, 0),
    totalFee033Listings: schools.reduce((sum, s) => sum + s.fee033Listings, 0),
    updatedAt: latest(schools.map(s => s.updatedAt)) };
}

export type PrivateSchoolCounts = { counts: Record<string, number>; checkedAt: string; };
/**
 * User confirmed portal listings can be introduced by Yotsuba. Count only explicit
 * active/no-application records; no private name, address, rent or source ID returns.
 * Counts cover only successfully validated complete saved feeds, never the whole market.
 */
export function compilePrivateSchoolCounts(feeds: readonly RentalFeed[], registered: readonly Pick<RentalSummary, "building" | "unit" | "address">[] = [], now = new Date()): PrivateSchoolCounts | null {
  if (!feeds.length || feeds.some(f => !feedSchema.safeParse(f).success || Date.parse(f.checkedAt) > now.getTime())) return null;
  const rows = feeds.flatMap(feed => feed.records.map(row => ({ feed, row })))
    .sort((a, b) => Date.parse(b.feed.checkedAt) - Date.parse(a.feed.checkedAt));
  const withdrawals = rows.filter(({ row }) => row.availability === "closed" || row.application === "present");
  const accepted: typeof rows = [];
  const counts = Object.fromEntries(listSchools().map(s => [s.slug, 0]));
  for (const item of rows) {
    const { row, feed } = item, summary = row.summary;
    if (row.availability !== "active" || row.application !== "none") continue;
    if (row.advertising !== "not-allowed" && row.advertising !== "contact-required") continue;
    if (!row.applicationQuote.trim()) continue;
    if (summary.rentYen < SCHOOL_RENTAL_MIN_RENT_YEN || summary.areaSqm < SCHOOL_RENTAL_MIN_AREA_SQM) continue;
    const district = lookupDistrictByAddress(summary.address);
    if (district.status !== "determined") continue;
    if (withdrawals.some(w => sameUnit(summary, w.row.summary))) continue;
    if (registered.some(p => sameUnit(summary, p))) continue;
    // A more recent portal row with a different state overrides the older row.
    if (rows.some(other => other !== item && sameUnit(summary, other.row.summary)
      && (Date.parse(other.feed.checkedAt) > Date.parse(feed.checkedAt)
        || other.row.advertising === "allowed"))) continue;
    const split = splitUnit(summary);
    if (split.derived && rows.filter(other => other.feed.provider === feed.provider && sameUnit(summary, other.row.summary)).length > 1) continue;
    if (accepted.some(other => (other.feed.provider === feed.provider && other.row.sourceId === row.sourceId) || sameUnit(summary, other.row.summary))) continue;
    accepted.push(item); counts[district.school.slug]++;
  }
  return { counts, checkedAt: latest(feeds.map(f => f.checkedAt))! };
}

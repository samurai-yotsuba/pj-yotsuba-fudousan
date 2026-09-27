import { getRentalDiscovery } from "@/lib/rental-discovery-server";
// Counts follow current availability; do not pre-render a school/locale matrix.
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedProperties } from "@/lib/properties";
import { getSchoolRentalMarket, getSchoolRentalSummaries } from "@/lib/school-rental-feed-store";
import { SCHOOL_RENTAL_COPY, SCHOOL_RENTAL_INDEX_PATH } from "@/lib/rental-school-district";
import { SchoolRentalIndex } from "@/components/gakku/SchoolRentalPages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = SCHOOL_RENTAL_COPY[locale];
  return buildPageMetadata({ businessKey: "realestate", title: c.indexTitle, description: c.lead, path: SCHOOL_RENTAL_INDEX_PATH, locale, availableLocales: ["ja", "en", "zh-tw", "zh"] });
}

export default async function Page() {
  const locale = await getRequestLocale();
  const [properties, summaries, market, discovery] = await Promise.all([getPublishedProperties(locale), getSchoolRentalSummaries(), getSchoolRentalMarket(), getRentalDiscovery(locale)]);
  return <SchoolRentalIndex properties={properties} summaries={summaries} market={market} schoolCounts={discovery.schools} locale={locale} />;
}

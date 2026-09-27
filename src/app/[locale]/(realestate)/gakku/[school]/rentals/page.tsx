import { getRentalDiscovery } from "@/lib/rental-discovery-server";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { getPublishedProperties } from "@/lib/properties";
import { getSchoolRentalMarket, getSchoolRentalSummaries } from "@/lib/school-rental-feed-store";
import { findSchoolBySlug } from "@/lib/school-district";
import { schoolRentalLead, schoolRentalPath, schoolRentalTitle } from "@/lib/rental-school-district";
import { buildPageMetadata } from "@/lib/seo";
import { SchoolRentalListings } from "@/components/gakku/SchoolRentalPages";

type Props = { params: Promise<{ school: string }> };
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = findSchoolBySlug((await params).school);
  if (!school) notFound();
  const locale = await getRequestLocale();
  return buildPageMetadata({ businessKey: "realestate", title: schoolRentalTitle(school, locale), description: schoolRentalLead(school, locale), path: schoolRentalPath(school.slug), locale, availableLocales: ["ja", "en", "zh-tw", "zh"] });
}

export default async function Page({ params }: Props) {
  const school = findSchoolBySlug((await params).school);
  if (!school) notFound();
  const locale = await getRequestLocale();
  const [properties, summaries, market, discovery] = await Promise.all([getPublishedProperties(locale), getSchoolRentalSummaries(), getSchoolRentalMarket(), getRentalDiscovery(locale)]);
  return <SchoolRentalListings school={school} properties={properties} summaries={summaries} market={market} schoolCounts={discovery.schools} locale={locale} />;
}

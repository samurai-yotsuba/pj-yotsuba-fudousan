import { cache } from "react";
import type { LangCode } from "@/config/languages";
import { getPublishedProperties } from "./properties";
import { getSchoolRentalMarket, getSchoolRentalSummaries, readSchoolRentalFeeds, registeredRentalIdentities } from "./school-rental-feed-store";
import { compilePrivateSchoolCounts, compileRentalDiscovery } from "./rental-discovery";

/** Reads public whitelist projections; no private feed payload crosses this boundary. */
export const getRentalDiscovery = cache(async (locale: LangCode) => {
  const [properties, summaries, market, feeds, registered] = await Promise.all([
    getPublishedProperties(locale), getSchoolRentalSummaries(), getSchoolRentalMarket(), readSchoolRentalFeeds(), registeredRentalIdentities(),
  ]);
  const now = new Date();
  const privateCounts = compilePrivateSchoolCounts(feeds.map(f => f.feed), registered, now);
  return compileRentalDiscovery(properties, summaries, locale, market.checkedAt, now, privateCounts);
});

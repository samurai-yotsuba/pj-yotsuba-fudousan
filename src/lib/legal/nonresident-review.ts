import "server-only";
import type { LangCode } from "@/config/languages";
import { isNonresidentReviewEnabled } from "./nonresident-review-policy";

export const NONRESIDENT_ARTICLE_SLUG = "hikyojusha-kabushiki-setsuritsu-shihonkin-kouza";
export const NONRESIDENT_ARTICLE_PATH = `/legal/column/${NONRESIDENT_ARTICLE_SLUG}`;
export const NONRESIDENT_PROPERTY_COLUMN_SLUG = "hikyojusha-shisan-kanri-hojin-shuueki-bukken";

/** Server-only, development-only. No browser/query override or production publishing switch. */
export async function getNonresidentReview(locale: LangCode) {
  if (!isNonresidentReviewEnabled(process.env)) return null;
  const { NONRESIDENT_COPY } = await import("./nonresident-review-copy");
  return NONRESIDENT_COPY[locale];
}

/** Fees and service terms approved for publication by the user on 2026-10-06. */
export async function getNonresidentServices(locale: LangCode) {
  const { NONRESIDENT_COPY } = await import("./nonresident-review-copy");
  return NONRESIDENT_COPY[locale];
}

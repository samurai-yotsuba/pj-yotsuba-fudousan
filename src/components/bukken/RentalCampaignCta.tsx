"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { gaEvent } from "@/lib/gtag";
import { FEE033_PATH, RENTAL_CAMPAIGN_COPY, rentalLineHref, rentalEventParams, type RentalCampaignContext } from "@/lib/rental-campaign";

export function RentalCampaignCta({ locale, ...context }: RentalCampaignContext & { locale: LangCode }) {
  const c = RENTAL_CAMPAIGN_COPY[locale];
  return <section className="my-8 rounded-xl border border-primary/25 bg-primary-tint p-5">
    <h2 className="text-lg font-semibold text-ink">{c.title}</h2>
    <p className="mt-3 text-sm leading-7">{c.body}</p>
    <Link href={rentalLineHref(context, locale)} onClick={() => gaEvent("click_line_external_url", rentalEventParams(context))} className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">{c.line}</Link>
    <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-primary underline">
      {locale === "ja" && <Link href={FEE033_PATH}>{c.fee}</Link>}
      <Link href={addLocalePrefix("/gakku/rentals", locale)}>{c.school}</Link>
    </nav>
  </section>;
}
export function RentalEntry({ locale }: { locale: LangCode }) {
  const c = RENTAL_CAMPAIGN_COPY[locale];
  return <section className="mx-auto mt-5 max-w-5xl rounded-xl border border-primary/20 bg-primary-tint p-5">
    <h2 className="font-serif text-xl font-semibold">{c.homeTitle}</h2><p className="mt-2 text-sm leading-6">{c.lead}</p>
    <nav className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
      <Link href={addLocalePrefix("/gakku/rentals", locale)} className="rounded-lg bg-primary px-4 py-3 text-white">{c.school}</Link>
      {locale === "ja" && <Link href={FEE033_PATH} className="rounded-lg border border-primary bg-surface px-4 py-3 text-primary">{c.fee}</Link>}
    </nav>
  </section>;
}
/** Delegate list analytics without hydrating each entire card. */
export function RentalPageAnalytics({ kind }: { kind: "fee033" | "gakku" }) {
  const pathname = usePathname();
  useEffect(() => {
    const source_page = pathname.split(/[?#]/)[0];
    if (kind === "fee033") gaEvent("view_fee033_hub", { source_page });
    const click = (event: MouseEvent) => {
      const a = (event.target as Element)?.closest?.("a[data-property-id]") as HTMLAnchorElement | null;
      if (a) gaEvent(kind === "fee033" ? "click_fee033_property" : "click_gakku_property", { source_page, property_id: a.dataset.propertyId ?? "", fee_type: a.dataset.feeType ?? "" });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [kind, pathname]);
  return null;
}

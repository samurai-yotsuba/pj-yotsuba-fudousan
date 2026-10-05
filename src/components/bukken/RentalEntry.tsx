import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { FEE033_PATH, RENTAL_CAMPAIGN_COPY } from "@/lib/rental-campaign";

/** The home entry needs no client state or campaign analytics bundle. */
export function RentalEntry({ locale }: { locale: LangCode }) {
  const c = RENTAL_CAMPAIGN_COPY[locale];
  return <section className="mx-auto mt-5 max-w-5xl rounded-xl border border-primary/20 bg-primary-tint p-5">
    <h2 className="font-serif text-xl font-semibold">{c.homeTitle}</h2><p className="mt-2 text-sm leading-6">{c.lead}</p>
    <nav className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
      <Link prefetch={false} href={addLocalePrefix("/gakku/rentals", locale)} className="rounded-lg bg-primary px-4 py-3 text-white">{c.school}</Link>
      {locale === "ja" && <Link prefetch={false} href={FEE033_PATH} className="rounded-lg border border-primary bg-surface px-4 py-3 text-primary">{c.fee}</Link>}
    </nav>
  </section>;
}

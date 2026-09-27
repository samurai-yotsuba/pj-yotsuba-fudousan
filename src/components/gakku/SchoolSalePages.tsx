import { Faq } from "@/components/shared/Faq";
import { SCHOOL_SALE_HUB_FAQ } from "@/lib/rental-school-hub-faq";
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { getLocalizedProperty, type PublicProperty } from "@/lib/property-shared";
import { listSchools, type SchoolInfo } from "@/lib/school-district";
import { groupSchoolSales, SCHOOL_SALE_COPY, SCHOOL_SALE_INDEX_PATH, schoolSalePath, schoolSaleTitle, SALE_TYPES } from "@/lib/sale-school-district";
import { groupSchoolRentals, schoolRentalPath, SCHOOL_RENTAL_COPY } from "@/lib/rental-school-district";
import type { PublicRentalSummary } from "@/lib/school-rental-feed";
import { addLocalePrefix } from "@/lib/locale";
import { canonicalUrl } from "@/lib/seo";
import { buildPropertyItemListJsonLd } from "@/lib/property-jsonld";
import { PropertyCard } from "@/components/bukken/PropertyCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { DistrictSourceNote } from "./RentalSchoolDistrict";

export function SchoolSaleIndex({ properties, summaries = [], locale }: { properties: PublicProperty[]; summaries?: PublicRentalSummary[]; locale: LangCode }) {
  const c = SCHOOL_SALE_COPY[locale];
  const sales = groupSchoolSales(properties, locale);
  const rentals = groupSchoolRentals(properties, locale);
  return <article className="mx-auto max-w-4xl px-4 py-8">
    <JsonLd data={buildPropertyItemListJsonLd(listSchools().map(s => ({ name: s.formalName, url: canonicalUrl("realestate", schoolSalePath(s.slug), locale) })), canonicalUrl("realestate", SCHOOL_SALE_INDEX_PATH, locale), locale)} />
    <h1 className="font-serif text-3xl font-semibold">{c.indexTitle}</h1><p className="mt-4 leading-relaxed">{c.lead}</p>
    <DistrictSourceNote locale={locale} />
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">{listSchools().map(s => <li key={s.slug} className="rounded-xl border border-border p-5">
      <h2 className="font-semibold">{s.formalName}</h2>
      <div className="mt-3 flex flex-wrap gap-4 text-primary underline">
        <Link href={addLocalePrefix(schoolRentalPath(s.slug), locale)}>{c.rental.replace("{count}", String((rentals.get(s.slug)?.length ?? 0) + summaries.filter(r => r.schoolSlug === s.slug).length))}</Link>
        <Link href={addLocalePrefix(schoolSalePath(s.slug), locale)}>{c.sale.replace("{count}", String(sales.get(s.slug)?.length ?? 0))}</Link>
      </div>
    </li>)}</ul>
    {/* 2026-09-28：学区で買うご家族向けQA。表示のみ（FAQPage JSON-LD の例外追加は浦松判断のため付けない） */}
    <div className="mt-8"><Faq items={SCHOOL_SALE_HUB_FAQ[locale].items} heading={SCHOOL_SALE_HUB_FAQ[locale].heading} bare openFirst={false} ariaLabel={SCHOOL_SALE_HUB_FAQ[locale].heading} /></div>
  </article>;
}
export function SchoolSaleListings({ school, properties, locale, type }: { school: SchoolInfo; properties: PublicProperty[]; locale: LangCode; type?: string }) {
  const c = SCHOOL_SALE_COPY[locale];
  const all = groupSchoolSales(properties, locale).get(school.slug) ?? [];
  const selected = SALE_TYPES.find(t => t === type);
  const listings = selected ? all.filter(p => p.dealType === selected) : all;
  const path = schoolSalePath(school.slug);
  return <article className="mx-auto max-w-3xl px-4 py-8">
    <JsonLd data={buildPropertyItemListJsonLd(listings.map(p => ({ name: getLocalizedProperty(p, locale).title, url: canonicalUrl("realestate", `/bukken/${p.slug}`, locale) })), canonicalUrl("realestate", path, locale), locale)} />
    <h1 className="font-serif text-3xl font-semibold">{schoolSaleTitle(school, locale)}</h1>
    <p className="mt-4 leading-relaxed">{c.lead}</p>
    <p className="mt-4 text-xl font-semibold text-primary">{c.count.replace("{count}", String(listings.length))}</p>
    <nav aria-label={c.indexTitle} className="mt-4 flex flex-wrap gap-3">
      <Link aria-current={!selected ? "page" : undefined} className="rounded border px-3 py-2 aria-[current=page]:bg-primary-tint" href={addLocalePrefix(path, locale)}>{c.all} ({all.length})</Link>
      {SALE_TYPES.map(t => <Link key={t} aria-current={selected === t ? "page" : undefined} className="rounded border px-3 py-2 aria-[current=page]:bg-primary-tint" href={addLocalePrefix(`${path}?type=${t}`, locale)}>{c[t]} ({all.filter(p => p.dealType === t).length})</Link>)}
    </nav>
    <DistrictSourceNote locale={locale} />
    {listings.length ? <ul className="mt-6 space-y-3">{listings.map(p => <li key={p.slug}><PropertyCard p={p} locale={locale} /></li>)}</ul> : <p className="mt-6 rounded border p-5">{c.empty}</p>}
    <Link className="mt-6 inline-block rounded bg-primary px-5 py-3 text-white" href={addLocalePrefix(`/contact?intent=gakku-${school.slug}-sale`, locale)}>{c.request}</Link>
    <nav className="mt-6 flex flex-wrap gap-4 text-primary underline"><Link href={addLocalePrefix(SCHOOL_SALE_INDEX_PATH, locale)}>{c.back}</Link><Link href={addLocalePrefix(schoolRentalPath(school.slug), locale)}>{SCHOOL_RENTAL_COPY[locale].view}</Link></nav>
  </article>;
}

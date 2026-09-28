import { compileRentalDiscovery, type SchoolRentalCount } from "@/lib/rental-discovery";
import { RentalDiscoveryStats, RentalFeeHubLink } from "./RentalDiscoveryStats";
import { RentalCampaignCta, RentalPageAnalytics } from "@/components/bukken/RentalCampaignCta";
import { SCHOOL_SALE_COPY, SCHOOL_SALE_INDEX_PATH, schoolSalePath } from "@/lib/sale-school-district";
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "@/lib/property-shared";
import type { SchoolInfo } from "@/lib/school-district";
import { listSchools } from "@/lib/school-district";
import { isFeaturedSchoolSlug } from "@/lib/gakku";
import { addLocalePrefix } from "@/lib/locale";
import { getLocalizedProperty } from "@/lib/property-shared";
import { BCP47_BY_LOCALE, canonicalUrl } from "@/lib/seo";
import { Faq } from "@/components/shared/Faq";
import { buildPropertyItemListJsonLd } from "@/lib/property-jsonld";
import { SCHOOL_RENTAL_HUB_FAQ } from "@/lib/rental-school-hub-faq";
import { DistrictTable } from "./DistrictSection";
import { districtSummary } from "@/lib/school-district-summary";
import { gakkuCopy } from "@/lib/gakku";
import { listDistrictRowsBySchool } from "@/lib/school-district";
import { SCHOOL_RENTAL_COPY, SCHOOL_RENTAL_FAQ, SCHOOL_RENTAL_INDEX_PATH, schoolRentalLead, schoolRentalPath, schoolRentalShowsDistrict, schoolRentalTitle } from "@/lib/rental-school-district";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PropertyCard } from "@/components/bukken/PropertyCard";
import { DistrictSourceNote } from "./RentalSchoolDistrict";
import { RentalComparison } from "./RentalComparison";
import type { PublicRentalSummary, RentalMarket } from "@/lib/school-rental-feed";

export function SchoolRentalIndex({ properties, locale, summaries = [], market = null, schoolCounts }: { properties: PublicProperty[]; locale: LangCode; summaries?: PublicRentalSummary[]; market?: RentalMarket | null; schoolCounts?: SchoolRentalCount[] }) {
  const c = SCHOOL_RENTAL_COPY[locale];
  const discovery = compileRentalDiscovery(properties, summaries, locale, market?.checkedAt);
  if (schoolCounts) discovery.schools = schoolCounts;
  const groups = discovery.groups;
  summaries = discovery.summaries;
  const indexUrl = canonicalUrl("realestate", SCHOOL_RENTAL_INDEX_PATH, locale);
  // ハブは物件を直接並べず、20校の学区別ページを ItemList で示す（学区ページ強化 作業手順書 v1・PR-1）
  const schoolList = { ...buildPropertyItemListJsonLd(listSchools().map(school => ({ name: school.formalName, url: canonicalUrl("realestate", schoolRentalPath(school.slug), locale) })), indexUrl, locale), "@id": `${indexUrl}#schools`, name: c.indexTitle };
  return <>
    <JsonLd data={schoolList} />
    <Breadcrumb items={[{ name: c.guide, href: "/gakku" }, { name: c.indexTitle }]} />
    <article className="mx-auto max-w-4xl px-4 pb-16">
      <header className="rounded-2xl border border-primary/20 bg-primary-tint p-5 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.indexTitle}</h1>
        <p className="mt-4 leading-relaxed text-text">{c.lead}</p>
      </header>
      <RentalFeeHubLink locale={locale} />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {listSchools().map(school => <li key={school.slug}>
          <Link href={addLocalePrefix(schoolRentalPath(school.slug), locale)} className="flex h-full items-center justify-between gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary">
            <div><span className="font-semibold text-ink">{school.formalName}</span><RentalDiscoveryStats stats={discovery.schools.find(s => s.slug === school.slug)!} locale={locale} compact /></div>
            <span className="shrink-0 rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary">{c.count.replace("{count}", String((groups.get(school.slug)?.length ?? 0) + summaries.filter(r => r.schoolSlug === school.slug).length))} →</span>
          </Link>
        </li>)}
      </ul>
      <Link href={addLocalePrefix(SCHOOL_SALE_INDEX_PATH, locale)} className="mt-4 inline-block text-primary underline">{SCHOOL_SALE_COPY[locale].indexTitle}</Link>
      <DistrictSourceNote locale={locale} />
      <RentalComparison rows={summaries} locale={locale} market={market} listedTotal={listedRentalTotal(groups, summaries)} />
      <SchoolRentalFaq locale={locale} hub />
      <Link href={addLocalePrefix("/gakku", locale)} className="mt-6 inline-block text-sm text-primary underline">{c.guide}</Link>
    </article>
  </>;
}

export function SchoolRentalListings({ school, properties, locale, summaries = [], market = null, schoolCounts }: { school: SchoolInfo; properties: PublicProperty[]; locale: LangCode; summaries?: PublicRentalSummary[]; market?: RentalMarket | null; schoolCounts?: SchoolRentalCount[] }) {
  const c = SCHOOL_RENTAL_COPY[locale];
  const discovery = compileRentalDiscovery(properties, summaries, locale, market?.checkedAt);
  if (schoolCounts) discovery.schools = schoolCounts;
  const allGroups = discovery.groups;
  summaries = discovery.summaries;
  const stats = discovery.schools.find(s => s.slug === school.slug)!;
  const listings = allGroups.get(school.slug) ?? [];
  const title = schoolRentalTitle(school, locale);
  const schoolSummaries = summaries.filter(r => r.schoolSlug === school.slug);
  const path = schoolRentalPath(school.slug);
  return <>
    <JsonLd data={buildPropertyItemListJsonLd(schoolRentalListItems(listings, schoolSummaries, canonicalUrl("realestate", path, locale), locale), canonicalUrl("realestate", path, locale), locale)} />
    <Breadcrumb items={[{ name: c.guide, href: "/gakku" }, { name: c.indexTitle, href: SCHOOL_RENTAL_INDEX_PATH }, { name: title }]} />
    <article className="mx-auto max-w-3xl px-4 pb-16">
      <header className="rounded-2xl border border-primary/20 bg-primary-tint p-5 sm:p-8">
        <p className="text-sm font-semibold text-primary">{c.label}</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 leading-relaxed text-text">{schoolRentalLead(school, locale)}</p>
        <p className="mt-3 text-lg font-semibold text-primary">{c.count.replace("{count}", String(listings.length + schoolSummaries.length))}</p>
        <RentalDiscoveryStats stats={stats} locale={locale} />
        <RentalFeeHubLink locale={locale} empty={stats.fee033Listings === 0} />
        <DistrictSourceNote locale={locale} />
      </header>
      {schoolRentalShowsDistrict(school.slug) && <SchoolDistrictSection school={school} locale={locale} />}
      {listings.length ? <ul className="mt-6 space-y-3">{listings.map(p => <li key={p.slug}><PropertyCard p={p} locale={locale} /></li>)}</ul>
        : !schoolSummaries.length && <p className="mt-6 rounded-xl border border-border p-6 leading-relaxed text-text">{c.empty}</p>}
      <RentalComparison rows={schoolSummaries} locale={locale} market={market} listedTotal={listedRentalTotal(allGroups, summaries)} />
      <SchoolRentalFaq locale={locale} />
      <RentalPageAnalytics kind="gakku" /><RentalCampaignCta locale={locale} sourcePage={path} kind="gakku" school={school.formalName} />
      <Link href={addLocalePrefix(`/contact?intent=gakku-${school.slug}-rental`, locale)} className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">{c.request}</Link>
      <Link href={addLocalePrefix(schoolSalePath(school.slug), locale)} className="mt-4 block text-primary underline">{SCHOOL_SALE_COPY[locale].view}</Link>
      <nav aria-label={c.back} className="mt-6 flex flex-wrap gap-5 text-sm text-primary underline">
        <Link href={addLocalePrefix(SCHOOL_RENTAL_INDEX_PATH, locale)}>{c.back}</Link>
        <Link href={addLocalePrefix(isFeaturedSchoolSlug(school.slug) ? `/gakku/${school.slug}` : "/gakku", locale)}>{c.guide}</Link>
      </nav>
    </article>
  </>;
}

/** 区全体で公開している学区別賃貸の件数（写真付き個別物件＋募集比較一覧）。ハブの20校の件数の合計と一致する。 */
function listedRentalTotal(groups: Map<string, unknown[]>, summaries: PublicRentalSummary[]) {
  return listSchools().reduce((sum, school) => sum + (groups.get(school.slug)?.length ?? 0) + summaries.filter(r => r.schoolSlug === school.slug).length, 0);
}

/**
 * 学区別ページの ItemList の要素（学区ページ強化 作業手順書 v1・PR-1）。
 * 画面に描画している配列（自社の公開物件＋学区別の募集比較一覧）だけから作る＝見出しの「募集中 N件」と常に一致する。
 * フィード物件は個別ページを持たないため、一覧内のアンカー（RentalComparison の article id＝r.id）を URL にする。
 * 価格・面積などの Offer は入れない（表示規約の確認が要る項目を構造化データで先行させない）。
 */
export function schoolRentalListItems(listings: PublicProperty[], summaries: PublicRentalSummary[], listUrl: string, locale: LangCode) {
  return [
    ...listings.map(p => ({ name: getLocalizedProperty(p, locale).title, url: canonicalUrl("realestate", `/bukken/${p.slug}`, locale) })),
    ...summaries.map(r => ({ name: `${r.building} ${r.unit}`.trim(), url: `${listUrl}#${r.id}` })),
  ];
}

/** 学区別賃貸の FAQ（表示と FAQPage JSON-LD を同じ items から出す＝完全一致）。PR-3 */
const DISTRICT_TABLE_LABEL: Record<LangCode, string> = { ja: "通学区域の表（{n}行）", en: "District table ({n} rows)", "zh-tw": "通學區域表（{n}列）", zh: "通学区域表（{n}行）" };
/** 16校の学区賃貸ページ上部：「〇〇小学校の通学区域はどこまで？」への直答と、区の公表表（2026-09-28）。行が多い学校は閉じておく（本文はHTMLに含まれる）。 */
function SchoolDistrictSection({ school, locale }: { school: SchoolInfo; locale: LangCode }) {
  const gc = gakkuCopy(locale);
  const rows = listDistrictRowsBySchool(school.slug);
  if (!rows.length) return null;
  return <section id="district" className="mt-6">
    <h2 className="font-serif text-xl font-semibold text-ink">{gc.school.districtH2.replace("{school}", school.formalName)}</h2>
    <p className="mt-3 rounded-xl border border-border bg-surface-dim p-4 text-sm leading-relaxed text-text">{districtSummary(locale, school.formalName, rows.length)}</p>
    <details open={rows.length <= 12} className="mt-3 rounded-xl border border-border p-4">
      <summary className="cursor-pointer text-sm font-semibold text-primary">{DISTRICT_TABLE_LABEL[locale].replace("{n}", String(rows.length))}</summary>
      <DistrictTable rows={rows} copy={gc} />
    </details>
  </section>;
}

/** ハブ（/gakku/rentals）だけ、学区で借りるご家族向けのQAを足す。学校別20ページは基本の3問のみ（重複回避）。 */
function SchoolRentalFaq({ locale, hub = false }: { locale: LangCode; hub?: boolean }) {
  const f = SCHOOL_RENTAL_FAQ[locale];
  const items = hub ? [...f.items, ...SCHOOL_RENTAL_HUB_FAQ[locale]] : f.items;
  return <div id={hub ? "faq" : undefined} className="mt-8"><Faq items={items} heading={f.heading} withJsonLd inLanguage={BCP47_BY_LOCALE[locale]} bare openFirst={false} ariaLabel={f.heading} /></div>;
}

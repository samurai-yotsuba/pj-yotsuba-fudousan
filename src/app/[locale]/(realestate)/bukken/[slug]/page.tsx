import { PropertyCard } from "@/components/bukken/PropertyCard";
import { BrokerFeeDetails } from "@/components/bukken/BrokerFeeDetails";
import { RentalCampaignCta } from "@/components/bukken/RentalCampaignCta";
import { rentalSchoolDistrict, schoolRentalPath } from "@/lib/rental-school-district";
// Property data changes independently of deploys, so resolve it on each request.
export const dynamic = "force-dynamic";

import { brokerFeeBadge, brokerFeeLine, brokerFeeAmountLabel, brokerFeeOf } from "@/lib/broker-fee";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicPropertyBySlug,
  getClosedRentalNavigation,
  getPublishedProperties,
  getLocalizedProperty,
  isPropertyLocaleAllowed,
} from "@/lib/properties";
import {
  buildLocalizedDisplayRows,
  formatPropertyPriceL,
  localizedImageAlt,
  localizeFixedValue,
  propertyUi,
  sectionOrder,
  usageNote,
} from "@/lib/property-i18n";
import { relatedLinksFor } from "@/config/property-related-links";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import { RealEstateListingJsonLd } from "@/components/seo/RealEstateListingJsonLd";
import { PropertyLegalBlock } from "@/components/bukken/PropertyLegalBlock";
import { PropertyViewingCta } from "@/components/bukken/PropertyViewingCta";
import { PropertyQa } from "@/components/bukken/PropertyQa";
import ColumnBody from "@/components/column/ColumnBody";
import { propertyPhotoNotes } from "@/lib/property-photo-notes";
import { PropertyPhotoGallery } from "@/components/bukken/PropertyPhotoGallery";
import { PropertyImage } from "@/components/bukken/PropertyImage";
import { PropertyVideos } from "@/components/bukken/PropertyVideos";
import { PropertySchoolDistrict } from "@/components/gakku/RentalSchoolDistrict";
import type { LangCode } from "@/config/languages";

/**
 * 物件詳細（/bukken/[slug]）。
 * - 公開判定（isPubliclyVisible）を満たす物件：必要表示事項（規約別表のインターネット広告列）を
 *   H2区分つきの概要表で表示し、広告主ブロックを自動表示する。
 * - closed の賃貸：noindexの終了案内と現在物件への導線のみ（元の価格・Offer・画像は返さない）。
 * - draft・未知のslug・非公開ロケール：実HTTP 404。
 */

type Props = { params: Promise<{ slug: string }> };

// Property data changes independently of code deploys. Keep detail pages on-demand so
// Vercel does not enumerate and pre-render every published property on each deployment.
export function generateStaticParams() {
  return [];
}

/** meta description用の要約（markdown記号と改行を落として120字） */
function summarize(text: string): string {
  return text
    .replace(/[#*_`>\-|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const base = await getPublicPropertyBySlug(slug);
  const locale: LangCode = await getRequestLocale();
  if (!base) {
    const closed = await getClosedRentalNavigation(slug);
    if (!closed || !closed.locales.includes(locale)) notFound();
    return buildPageMetadata({ businessKey: "realestate", title: closedCopy(locale), description: closedCopy(locale), path: `/bukken/${slug}`, locale, availableLocales: closed.locales, noindex: true });
  }
  if (!isPropertyLocaleAllowed(base, locale)) notFound();
  const p = getLocalizedProperty(base, locale);
  return buildPageMetadata({
    businessKey: "realestate",
    title: p.title,
    description: [brokerFeeLine(p, locale), brokerFeeAmountLabel(p, locale), summarize(p.description)].filter(Boolean).join("。"),
    path: `/bukken/${p.slug}`,
    ...(p.images[0] ? { image: p.images[0].url } : {}),
    locale,
    availableLocales: base.locales,
  });
}

export default async function BukkenDetailPage({ params }: Props) {
  const { slug } = await params;
  const base = await getPublicPropertyBySlug(slug);
  const locale: LangCode = await getRequestLocale();
  if (!base) {
    const closed = await getClosedRentalNavigation(slug);
    if (!closed || !closed.locales.includes(locale)) notFound();
    const current = await getPublishedProperties(locale);
    const related = current.filter(p => {
      const d = rentalSchoolDistrict(p);
      return closed.schoolSlug ? d?.status === "determined" && d.school.slug === closed.schoolSlug : brokerFeeOf(p) === "p033";
    }).slice(0, 6);
    return <article className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-serif text-2xl font-semibold">{closedCopy(locale)}</h1><Link href={addLocalePrefix(closed.schoolSlug ? schoolRentalPath(closed.schoolSlug) : "/gakku/rentals", locale)} className="mt-5 inline-block text-primary underline">{{ ja: "現在募集中の物件を学区から探す", en: "Find current rentals by school district", "zh-tw": "依學區尋找目前招租物件", zh: "按学区查找目前招租房源" }[locale]}</Link><div className="mt-6 space-y-3">{related.map(p => <PropertyCard key={p.slug} p={p} locale={locale} />)}</div><RentalCampaignCta locale={locale} sourcePage="/gakku/rentals" kind="property" school={closed.schoolSlug ?? undefined} /></article>;
  }
  if (!isPropertyLocaleAllowed(base, locale)) notFound();
  const p = getLocalizedProperty(base, locale);
  const ui = propertyUi(locale);
  const district = rentalSchoolDistrict(base);
  const school = district?.status === "determined" ? district.school : null;
  const hero = p.images[0];
  const rows = buildLocalizedDisplayRows(p, locale);
  const note = usageNote(p, locale);
  const related = relatedLinksFor(p, locale);
  const priceNote = p.priceNote
    ? locale === "ja"
      ? p.priceNote
      : p.translations?.[locale as "en" | "zh-tw" | "zh"]?.priceNote ?? localizeFixedValue(p.priceNote, locale) ?? p.priceNote
    : undefined;

  return (
    <>
      <RealEstateListingJsonLd property={p} locale={locale} />
      <Breadcrumb
        items={[
          { name: ui.home, href: "/" },
          { name: ui.listing, href: "/bukken" },
          ...(school ? [{ name: locale === "ja" ? "学区から探す" : "School districts", href: "/gakku/rentals" }, { name: school.formalName, href: schoolRentalPath(school.slug) }] : []),
          { name: p.title, href: `/bukken/${p.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 pb-16">
        {hero && (
          // 2026-09-23：自社Storageの写真は next/image で縮小配信（PropertyImage が許可外URLを素の img に戻す）
          <PropertyImage
            src={hero.url}
            alt={localizedImageAlt(hero, p.title, locale)}
            width={1600}
            height={900}
            className="mt-3 w-full rounded-2xl object-cover"
            sizes="(min-width: 768px) 736px, calc(100vw - 32px)"
            loading="eager"
            fetchPriority="high"
          />
        )}

        <header className="pt-4">
          <p className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full bg-primary-tint px-2.5 py-0.5 font-medium text-primary">
              {ui.category[p.category]}
            </span>
            <span className="rounded-full bg-surface-dim px-2.5 py-0.5 font-medium text-text-muted">
              {ui.dealType[p.dealType]}
            </span>
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">{p.title}</h1>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {formatPropertyPriceL(p, locale)}
            {priceNote && <span className="ml-2 text-xs font-normal text-text-muted">（{priceNote}）</span>}
          </p>
          {brokerFeeLine(p, locale) && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text">
              {brokerFeeBadge(p, locale) && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">{brokerFeeBadge(p, locale)}</span>
              )}
              <span>{brokerFeeLine(p, locale)}</span>
            </p>
          )}
          {brokerFeeAmountLabel(p, locale) && <p className="mt-3 text-xl font-semibold text-primary">{brokerFeeAmountLabel(p, locale)} {brokerFeeOf(p) === "p033" && <a href="#brokerage-comparison" className="ml-3 text-sm font-normal underline">{{ ja: "計算比較を見る", en: "See calculation", "zh-tw": "查看計算比較", zh: "查看计算比较" }[locale]}</a>}</p>}
        </header>

        <PropertySchoolDistrict property={base} locale={locale} />
        <BrokerFeeDetails property={p} locale={locale} />

        {/* 必要表示事項（規約別表のインターネット広告列＝原本目視2026-09-01）。行は落とさず区分だけ付ける */}
        {sectionOrder(p.dealType).map((sec) => {
          const secRows = rows.filter((r) => r.section === sec);
          if (secRows.length === 0) return null;
          return (
            <section key={sec} className="mt-8">
              <h2 className="font-serif text-xl font-semibold text-ink">{ui.sections[sec]}</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {secRows.map((row) => (
                      <tr key={row.key} className="border-b border-border last:border-b-0">
                        <th className="w-36 bg-surface-dim px-4 py-2.5 text-left text-xs font-medium text-text-muted">
                          {row.label}
                        </th>
                        {/* 訳が未整備の自由記述は日本語原文を表示（必要表示事項を落とさない） */}
                        <td className="px-4 py-2.5 text-text" {...(row.untranslated ? { lang: "ja" } : {})}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {(note || p.category === "gh") && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-text-muted">
            {note && <p>{note}</p>}
            {p.category === "gh" && <p className={note ? "mt-2" : ""}>{ui.ghNote}</p>}
          </div>
        )}

        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold text-ink">{ui.descriptionHeading}</h2>
          <div className="mt-3">
            <ColumnBody content={p.description} />
          </div>
        </section>

        <PropertyVideos description={p.description} locale={locale} />

        {p.images.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-ink">{ui.photosHeading}</h2>
            <div className="mt-3">
              <PropertyPhotoGallery
                images={p.images.map((img) => ({ url: img.url, alt: localizedImageAlt(img, p.title, locale) }))}
                locale={locale}
                previewLimit={6}
                photoNotes={propertyPhotoNotes(p.description)}
                allPhotosHref={addLocalePrefix(`/bukken/${p.slug}/photos`, locale)}
              />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-semibold text-ink">{ui.relatedHeading}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={addLocalePrefix(r.path, locale)} className="text-primary underline">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <PropertyLegalBlock property={p} locale={locale} />
        <PropertyQa property={p} locale={locale} />
        {p.dealType === "rental" && <RentalCampaignCta locale={locale} kind="property" sourcePage={`/bukken/${p.slug}`} propertyId={p.slug} propertyName={p.title} school={school?.slug} rent={p.priceYen} feeType={brokerFeeOf(p) ?? "unknown"} />}
        <PropertyViewingCta propertyTitle={p.title} propertyUrl={addLocalePrefix(`/bukken/${p.slug}`, locale)} locale={locale} />
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" variant={p.category === "gh" ? "property-gh" : "property"} />
      </div>
    </>
  );
}

function closedCopy(locale: LangCode) { return { ja: "この募集は終了しました", en: "This rental listing has ended", "zh-tw": "此物件已結束招租", zh: "此房源已结束招租" }[locale]; }

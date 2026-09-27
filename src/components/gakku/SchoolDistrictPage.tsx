import { getRentalDiscovery } from "@/lib/rental-discovery-server";
import { RentalDiscoveryStats, RentalFeeHubLink } from "./RentalDiscoveryStats";
import { SCHOOL_SALE_COPY, schoolSalePath } from "@/lib/sale-school-district";
/**
 * 学校別の通学区域ページ本体（/gakku/[school] の共通実装）。
 *
 * 書かないこと（表示規約・2026-09-22 コンセプトv1）：
 * - 学校の評判・進学実績・人気・「名門」等の評価
 * - 「厳選」「特選」「最高」等の最上級・選別を意味する用語
 * - 相場・流通量の断定（自社で数えた根拠がないため）
 * 書くこと：区の公表データ、学校の所在地、手続きの窓口、当社が何をするか。
 */
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { BCP47_BY_LOCALE } from "@/lib/seo";
import { buildFaqJsonLd, type FaqItem } from "@/components/shared/Faq";
import {
  DISTRICT_SOURCE,
  findSchoolBySlug,
  listDistrictRowsBySchool,
  lookupDistrictByAddress,
} from "@/lib/school-district";
import { gakkuCopy, SCHOOL_LIST_SOURCE, SCHOOL_PROFILES } from "@/lib/gakku";
import { DistrictBlocks, DistrictTable } from "@/components/gakku/DistrictSection";
import { getPublishedProperties, getLocalizedProperty } from "@/lib/properties";
import { SCHOOL_RENTAL_COPY, schoolRentalPath } from "@/lib/rental-school-district";
import { formatPropertyPriceL, propertyUi } from "@/lib/property-i18n";

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 font-serif text-xl font-semibold text-ink">
      {children}
    </h2>
  );
}

function SourceNote({ locale }: { locale: LangCode }) {
  const c = gakkuCopy(locale);
  return (
    <p className="mt-3 text-xs leading-relaxed text-text-muted">
      {c.sourceLabel}：
      <a
        href={DISTRICT_SOURCE.url}
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        文京区「小学校 通学区域」
      </a>
      （{c.updatedLabel} {DISTRICT_SOURCE.updatedAt}／{c.fetchedLabel} {DISTRICT_SOURCE.fetchedAt}）
      {c.placeNamesInJa ? ` ${c.placeNamesInJa}` : ""}
    </p>
  );
}

export async function SchoolDistrictPage({
  slug,
  locale,
}: {
  slug: string;
  locale: LangCode;
}) {
  const school = findSchoolBySlug(slug);
  const profile = SCHOOL_PROFILES[slug];
  if (!school || !profile) return null;

  const c = gakkuCopy(locale);
  const rows = listDistrictRowsBySchool(slug);
  const ui = propertyUi(locale);
  const discovery = await getRentalDiscovery(locale);
  const stats = discovery.schools.find(s => s.slug === slug);

  // 所在地が番地まで分かり、区の表で学校が1校に定まる物件だけを出す。
  // 番地によって学校が分かれる区域の物件は載せない（推測で学区を名乗らない）。
  const properties = (await getPublishedProperties(locale))
    .filter((p) => {
      const found = lookupDistrictByAddress(p.locationText);
      return found.status === "determined" && found.school.slug === slug;
    }).map((p) => getLocalizedProperty(p, locale));

  const faqItems: FaqItem[] = [
    { q: c.school.districtH2.replace("{school}", school.formalName), a: districtSummary(locale, school.formalName, rows.length) },
    { q: c.school.noticeH2, a: c.school.notice },
    { q: c.school.procedureH2, a: c.school.procedure },
  ];

  return (
    <>
      <JsonLd data={buildFaqJsonLd(faqItems, BCP47_BY_LOCALE[locale])} />
      <Breadcrumb
        items={[
          { name: ui.home, href: "/" },
          { name: c.hub.h1, href: "/gakku" },
          { name: school.formalName },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-4">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {school.formalName}
          </h1>
          <p className="mt-4 rounded-xl border border-border bg-surface-dim p-4 text-sm leading-relaxed text-text">
            {districtSummary(locale, school.formalName, rows.length)}
          </p>
        </header>

        <section className="mt-5 rounded-xl border border-primary/25 p-4">
          {stats && <RentalDiscoveryStats stats={stats} locale={locale} />}
          <RentalFeeHubLink locale={locale} />
        </section>
        <Link href={addLocalePrefix(schoolRentalPath(slug), locale)} className="mt-6 block rounded-xl border border-primary/25 bg-primary-tint p-5 font-semibold text-primary">{SCHOOL_RENTAL_COPY[locale].view} →</Link>
        <Link href={addLocalePrefix(schoolSalePath(slug), locale)} className="mt-3 block rounded-xl border border-primary/25 p-5 font-semibold text-primary">{SCHOOL_SALE_COPY[locale].view} →</Link>

        <H2 id="district">{c.school.districtH2.replace("{school}", school.formalName)}</H2>
        <DistrictTable rows={rows} copy={c} />
        <SourceNote locale={locale} />

        <H2 id="map">{c.school.mapH2}</H2>
        <DistrictBlocks rows={rows} copy={c} schoolName={school.formalName} />

        <H2 id="school">{c.school.schoolInfoH2}</H2>
        <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
          <div className="flex gap-4 py-2">
            <dt className="w-32 flex-shrink-0 text-text-muted">{c.school.addressLabel}</dt>
            <dd className="text-text">{profile.address}</dd>
          </div>
          <div className="flex gap-4 py-2">
            <dt className="w-32 flex-shrink-0 text-text-muted">{c.school.telLabel}</dt>
            <dd className="text-text">{profile.tel}</dd>
          </div>
          <div className="flex gap-4 py-2">
            <dt className="w-32 flex-shrink-0 text-text-muted">{c.school.siteLabel}</dt>
            <dd className="text-text">
              <a
                href={profile.siteUrl}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.siteUrl}
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          {c.sourceLabel}：
          <a
            href={SCHOOL_LIST_SOURCE.url}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            文京区「区立小学校一覧」
          </a>
          （{c.updatedLabel} {SCHOOL_LIST_SOURCE.updatedAt}／{c.fetchedLabel}{" "}
          {SCHOOL_LIST_SOURCE.fetchedAt}）
        </p>

        <H2 id="properties">{c.school.propertiesH2}</H2>
        {properties.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm leading-relaxed text-text-muted">
            {c.school.propertiesEmpty}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {properties.map((p) => (
              <li key={p.slug}>
                <Link
                  href={addLocalePrefix(`/bukken/${p.slug}`, locale)}
                  className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <span className="block text-sm font-semibold text-ink">{p.title}</span>
                  <span className="mt-1 block text-sm font-semibold text-primary">
                    {formatPropertyPriceL(p, locale)}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">{p.locationText}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          {c.school.propertiesNote}
        </p>

        <H2 id="notice">{c.school.noticeH2}</H2>
        <p className="mt-4 leading-relaxed text-text">{c.school.notice}</p>

        <H2 id="procedure">{c.school.procedureH2}</H2>
        <p className="mt-4 leading-relaxed text-text">{c.school.procedure}</p>
        <p className="mt-4 rounded-xl border border-border bg-surface-dim p-4 text-sm leading-relaxed text-text-muted">
          {c.school.separateContracts}
        </p>

        <p className="mt-10 text-xs leading-relaxed text-text-muted">{c.disclaimer}</p>
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" variant="property" intent={`gakku-${slug}`} />
      </div>
    </>
  );
}

/** 直答ブロック。町丁目の列挙は区の表から機械的に作る（手書きの説明を入れない） */
export function districtSummary(locale: LangCode, formalName: string, rowCount: number): string {
  const c = gakkuCopy(locale);
  const rows = rowCount;
  if (locale === "en") {
    return `${formalName} covers the districts listed below, as published by Bunkyo-ku (${rows} rows in the ward's table, as of ${DISTRICT_SOURCE.updatedAt}). Within some chome the assigned school differs by block and lot number, so check the table rather than the chome name alone. ${c.disclaimer}`;
  }
  if (locale === "zh-tw") {
    return `${formalName}的通學區域如下表（依文京區公布資料，共${rows}列，${DISTRICT_SOURCE.updatedAt}現在）。部分町丁目會因「番」「號」而分屬不同學校，請以表格確認，勿僅以町丁目判斷。${c.disclaimer}`;
  }
  if (locale === "zh") {
    return `${formalName}的通学区域如下表（依文京区公布资料，共${rows}行，${DISTRICT_SOURCE.updatedAt}现在）。部分町丁目会因「番」「号」而分属不同学校，请以表格确认，勿仅以町丁目判断。${c.disclaimer}`;
  }
  return `${formalName}の通学区域は下の表のとおりです（文京区の公表データ・${rows}行・${DISTRICT_SOURCE.updatedAt}現在）。同じ町丁目でも「番」「号」によって学校が分かれる区域があるため、町丁目だけで判断せず表でご確認ください。${c.disclaimer}`;
}

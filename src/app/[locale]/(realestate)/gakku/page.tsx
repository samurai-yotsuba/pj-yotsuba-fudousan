import { getRentalDiscovery } from "@/lib/rental-discovery-server";
import { RentalDiscoveryStats, RentalFeeHubLink } from "@/components/gakku/RentalDiscoveryStats";
import { SCHOOL_SALE_COPY, SCHOOL_SALE_INDEX_PATH, schoolSalePath } from "@/lib/sale-school-district";
// /gakku＝文京区の小学校 通学区域のハブ。
// 区の公表データ（町丁目・番・号）をそのまま持つ一次データ層の入口で、
// 誠之・昭和・千駄木・窪町の4校は個別ページへ送る（2026-09-22 浦松決定）。
//
// 表示規約：学校の評判・人気・進学実績には触れない。「3S1K」は世間の通称である旨を明示する。
import type { Metadata } from "next";
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import {
  DISTRICT_SOURCE,
  listDistrictRowsBySchool,
  listSchools,
} from "@/lib/school-district";
import { gakkuCopy, getFeaturedSchools, SCHOOL_LIST_SOURCE, SCHOOL_PROFILES } from "@/lib/gakku";
import { summarizeByChome } from "@/components/gakku/DistrictSection";
import GakkuMapEmbed from "@/components/gakku/GakkuMapEmbed";
import { SCHOOL_RENTAL_COPY, schoolRentalPath } from "@/lib/rental-school-district";
import { propertyUi } from "@/lib/property-i18n";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGakkuHubJsonLd } from "@/lib/gakku-jsonld";
import { ENROLLMENT_SOURCE, enrollmentChange } from "@/lib/data/bunkyo-enrollment";

/** 本ページを公開するロケール（hreflang・sitemap と一致させる） */
const PAGE_LOCALES: LangCode[] = ["ja", "en", "zh-tw", "zh"];

/** 学区参考図の見出し・説明（地図内の文言は public/gakku/school-map.js 側） */
const MAP_COPY: Record<LangCode, { heading: string; lead: string; frameTitle: string }> = {
  ja: {
    heading: "文京区20小学校の学区を地図で見る",
    lead: "誠之・千駄木・昭和・窪町の4校はカラー、その他の16校は白黒で表示しています。地図下の学校一覧や地図上の学校名を押すと、その学区が拡大します。国土交通省の2023年度データによる参考図です。",
    frameTitle: "文京区20小学校の学区マップ（学校一覧から拡大）",
  },
  en: {
    heading: "See the 20 Bunkyo elementary school districts on a map",
    lead: "Seishi, Sendagi, Showa and Kubomachi are shown in color; the other 16 schools in black and white. Tap a school in the list below the map, or a school name on the map, to zoom in on its district. This is a reference map based on FY2023 data from the Ministry of Land, Infrastructure, Transport and Tourism. School names are shown in their official Japanese form.",
    frameTitle: "Map of the 20 Bunkyo elementary school districts (zoom in from the school list)",
  },
  "zh-tw": {
    heading: "在地圖上查看文京區20所小學的學區",
    lead: "誠之、千駄木、昭和、窪町4校以彩色顯示，其他16校為黑白。點選地圖下方的學校列表或地圖上的校名，即可放大該學區。本圖為依國土交通省2023年度資料製作的參考圖。校名沿用官方日文名稱。",
    frameTitle: "文京區20所小學學區地圖（可從學校列表放大）",
  },
  zh: {
    heading: "在地图上查看文京区20所小学的学区",
    lead: "誠之、千駄木、昭和、窪町4校以彩色显示，其他16校为黑白。点击地图下方的学校列表或地图上的校名，即可放大该学区。本图是依据国土交通省2023年度数据制作的参考图。校名沿用官方日文名称。",
    frameTitle: "文京区20所小学学区地图（可从学校列表放大）",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = gakkuCopy(locale);
  return buildPageMetadata({
    businessKey: "realestate",
    title: c.hub.title,
    description: c.hub.description,
    path: "/gakku",
    locale,
    availableLocales: PAGE_LOCALES,
  });
}

export default async function GakkuHubPage() {
  const locale = await getRequestLocale();
  const c = gakkuCopy(locale);
  const ui = propertyUi(locale);
  const featured = getFeaturedSchools();
  const discovery = await getRentalDiscovery(locale);

  return (
    <>
      <JsonLd data={buildGakkuHubJsonLd(locale)} />
      <Breadcrumb items={[{ name: ui.home, href: "/" }, { name: c.hub.h1 }]} />
      <article className="mx-auto max-w-3xl px-4 pb-16">
        {/* ファーストビュー：H1 → 一文 → 数字の帯 → 地図（2026-09-23 浦松指示「文章の前に地図」）。
            3S1K は通称として引用し、学校の評判・人気・進学実績には触れない。 */}
        <header className="pt-4">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-4xl">{c.hub.h1}</h1>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-primary sm:text-xl">{c.hub.hook}</p>
          {/* 3S1K の4校の児童数（2026年5月1日現在）と令和3年度比。値は区の公表PDFから転記（data/bunkyo-enrollment.ts） */}
          <figure className="mt-6">
            <figcaption className="text-sm font-semibold text-ink">{c.hub.enrollment.caption}</figcaption>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {featured.map((school) => {
                const e = enrollmentChange(school.slug);
                if (!e) return null;
                const sign = e.diff > 0 ? "+" : e.diff < 0 ? "−" : "±";
                return (
                  <div key={school.slug} className="rounded-xl border border-primary/20 bg-primary-tint p-3 text-center">
                    <dt className="text-sm font-semibold text-ink">{school.formalName.replace(/^文京区立/, "")}</dt>
                    <dd className="mt-1 font-serif text-3xl font-semibold text-primary">
                      {e.latest.toLocaleString("en-US")}
                      <span className="ml-0.5 text-sm">{c.hub.enrollment.unit}</span>
                    </dd>
                    <dd className={`mt-1 text-xs font-semibold ${e.diff < 0 ? "text-text-muted" : "text-primary"}`}>
                      {c.hub.enrollment.change} {sign}{Math.abs(e.diff)}{c.hub.enrollment.unit}{locale === "en" ? ` (${sign}${Math.abs(e.rate).toFixed(1)}%)` : `（${sign}${Math.abs(e.rate).toFixed(1)}%）`}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              <a href={ENROLLMENT_SOURCE.url} className="underline" target="_blank" rel="noopener noreferrer">{c.hub.enrollment.source}</a>
            </p>
          </figure>
        </header>

        {/* 学区参考図（4ロケール）。地図内の文言は ?lang= で切り替え、校名・所在地は日本語のまま
            （「校名沿用官方日文名稱」と同じ方針）。 */}
        <section
          aria-labelledby="gakku-map-heading"
          className="mt-6 rounded-xl border border-border bg-surface-dim p-4 sm:p-6"
        >
          <h2 id="gakku-map-heading" className="font-serif text-xl font-semibold text-ink">
            {MAP_COPY[locale].heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text">{MAP_COPY[locale].lead}</p>
          <div className="mt-4">
            <GakkuMapEmbed locale={locale} title={MAP_COPY[locale].frameTitle} />
          </div>
        </section>

        <RentalFeeHubLink locale={locale} />
        {/* 2026-09-28 浦松指示：賃貸・売買を分けず「物件を探す」1本（学区ごとに賃貸・売買の件数を並べる /gakku/sales へ） */}
        <Link href={addLocalePrefix(SCHOOL_SALE_INDEX_PATH, locale)} className="mt-4 block rounded-xl bg-primary p-5 text-center font-semibold text-white hover:opacity-90">{SCHOOL_SALE_COPY[locale].indexTitle} →</Link>

        <p className="mt-10 rounded-xl border border-border bg-surface-dim p-4 text-sm leading-relaxed text-text">
          {c.hub.answer}
        </p>
        <p className="mt-4 leading-relaxed text-text">{c.hub.lead}</p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-ink">{c.hub.nicknameH2}</h2>
        <p className="mt-4 leading-relaxed text-text">{c.hub.nickname}</p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-ink">{c.hub.featuredH2}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {featured.map((school) => {
            const rows = listDistrictRowsBySchool(school.slug);
            const chome = summarizeByChome(rows);
            return (
              <li key={school.slug}>
                <Link
                  href={addLocalePrefix(`/gakku/${school.slug}`, locale)}
                  className="block h-full rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <span className="block font-semibold text-ink">{school.formalName}</span>
                  <RentalDiscoveryStats stats={discovery.schools.find(s => s.slug === school.slug)!} locale={locale} compact />
                  <span className="mt-1 block text-xs text-text-muted">
                    {SCHOOL_PROFILES[school.slug]?.address}
                  </span>
                  <span className="mt-2 block text-xs text-text-muted">
                    {chome.map((x) => x.chome).join("・")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-10 font-serif text-xl font-semibold text-ink">{c.hub.allSchoolsH2}</h2>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{c.hub.allSchoolsLead}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  {locale === "ja" ? "学校" : "School"}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {c.school.addressLabel}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {c.table.chome}
                </th>
              </tr>
            </thead>
            <tbody>
              {listSchools().map((school) => {
                const rows = listDistrictRowsBySchool(school.slug);
                const chome = summarizeByChome(rows);
                const featuredSchool = featured.some((f) => f.slug === school.slug);
                return (
                  <tr key={school.slug} className="border-b border-border align-top">
                    <td className="py-2 pr-3 text-text">
                      {featuredSchool ? (
                        <Link
                          href={addLocalePrefix(`/gakku/${school.slug}`, locale)}
                          className="underline"
                        >
                          {school.formalName}
                        </Link>
                      ) : (
                        school.formalName
                      )}
                      <RentalDiscoveryStats stats={discovery.schools.find(s => s.slug === school.slug)!} locale={locale} />
                      <Link href={addLocalePrefix(schoolRentalPath(school.slug), locale)} className="mt-2 block text-xs font-semibold text-primary underline">{SCHOOL_RENTAL_COPY[locale].view} →</Link>
                      <Link href={addLocalePrefix(schoolSalePath(school.slug), locale)} className="mt-2 block text-xs font-semibold text-primary underline">{SCHOOL_SALE_COPY[locale].view} →</Link>
                    </td>
                    <td className="py-2 pr-3 text-text-muted">
                      {SCHOOL_PROFILES[school.slug]?.address}
                    </td>
                    <td className="py-2 text-text-muted">
                      {chome.map((x) => x.chome).join("・")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          （{c.updatedLabel} {DISTRICT_SOURCE.updatedAt}）／
          <a
            href={SCHOOL_LIST_SOURCE.url}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            文京区「区立小学校一覧」
          </a>
          （{c.updatedLabel} {SCHOOL_LIST_SOURCE.updatedAt}）　{c.fetchedLabel}{" "}
          {DISTRICT_SOURCE.fetchedAt}
          {c.placeNamesInJa ? ` ${c.placeNamesInJa}` : ""}
        </p>

        <p className="mt-10 text-xs leading-relaxed text-text-muted">{c.disclaimer}</p>
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" variant="property" intent="gakku" />
      </div>
    </>
  );
}

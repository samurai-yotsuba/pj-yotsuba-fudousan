import { RentalCampaignCta } from "@/components/bukken/RentalCampaignCta";
import { RENTAL_CAMPAIGN_COPY } from "@/lib/rental-campaign";
import { filterProperties, rentalStations } from "@/lib/property-filters";
import { listSchools } from "@/lib/school-district";
// Availability expiry must be evaluated on each request, even if the worker is offline.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProperties, getLocalizedProperty } from "@/lib/properties";
import { type PropertyDealType } from "@/lib/property-shared";
import { propertyUi } from "@/lib/property-i18n";
import { buildPropertyItemListJsonLd } from "@/lib/property-jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata, canonicalUrl } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import { PropertyCard } from "@/components/bukken/PropertyCard";
import { SCHOOL_RENTAL_COPY, SCHOOL_RENTAL_INDEX_PATH } from "@/lib/rental-school-district";
import { DistrictSourceNote } from "@/components/gakku/RentalSchoolDistrict";
import type { LangCode } from "@/config/languages";
import { brokerFeeCopy, isDiscountedBrokerFee } from "@/lib/broker-fee";

/**
 * 物件紹介の一覧（/bukken）。公開（published）物件のみを表示し、
 * 物件が存在するカテゴリの見出しだけを出す（空タブ・空見出しを出さない）。
 * ページネーションなし（初期掲載3〜5件のシンプル構成＝委任プロンプト確定仕様）。
 */

// 2026-09-16：ja先行→4ロケール公開へ。UI文言（COPY）は当初から4ロケール分あり、
// 物件詳細（/bukken/[slug]）は物件ごとの翻訳有無で4ロケール出力済み。1件目が4言語で公開されたため
// 一覧も揃える（sitemap.ts の STATIC_REALESTATE と必ず一致させる）
const PAGE_LOCALES: LangCode[] = ["ja", "en", "zh-tw", "zh"];

// 物件コーナーの表示区分。業者向けの内部カテゴリ（GH・投資等）は公開見出しに出さず、
// お客様が探す4種類に統一する。一棟マンションはマンション、事業用建物は戸建て側にまとめる。
type ListingGroup = "rental" | "land" | "condo" | "house";
const LISTING_GROUP_ORDER: ListingGroup[] = ["rental", "land", "condo", "house"];

function listingGroup(dealType: PropertyDealType): ListingGroup {
  if (dealType === "rental") return "rental";
  if (dealType === "land") return "land";
  if (dealType === "condo" || dealType === "wholeBuilding") return "condo";
  return "house";
}

const COPY: Record<LangCode, { title: string; description: string; h1: string; lead: string; empty: string }> = {
  ja: {
    title: "取扱物件のご紹介",
    description:
      "四葉不動産株式会社（東京都文京区・宅地建物取引業 東京都知事(1)第113304号）の取扱物件一覧。賃貸・売地・マンション・戸建てをご紹介します。",
    h1: "取扱物件のご紹介",
    lead: "現在ご紹介できる売買・賃貸物件の一覧です。掲載していない物件のご相談・物件探しのご依頼も承ります。",
    empty: "現在ご紹介中の物件はありません。ご希望の条件をお聞かせいただければ、お探しします。",
  },
  en: {
    title: "Property Listings",
    description: "Properties for sale and rent handled by Yotsuba Real Estate (Bunkyo-ku, Tokyo).",
    h1: "Property Listings",
    lead: "Properties currently available for sale and rent.",
    empty: "No listings are available at the moment. Tell us what you are looking for and we will search for you.",
  },
  "zh-tw": {
    title: "物件介紹",
    description: "四葉不動產株式會社（東京都文京區）的出售及出租物件一覽。",
    h1: "物件介紹",
    lead: "目前可介紹的出售及出租物件一覽。",
    empty: "目前沒有刊登中的物件。歡迎告訴我們您的需求，我們將為您尋找。",
  },
  zh: {
    title: "物件介绍",
    description: "四叶不动产株式会社（东京都文京区）的出售及出租物件一览。",
    h1: "物件介绍",
    lead: "目前可介绍的出售及出租物件一览。",
    empty: "目前没有刊登中的物件。欢迎告诉我们您的需求，我们将为您寻找。",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return buildPageMetadata({
    businessKey: "realestate",
    title: c.title,
    description: c.description,
    path: "/bukken",
    locale,
    availableLocales: PAGE_LOCALES,
  });
}

/** ?fee=discount で「仲介手数料 0.33ヶ月・無料」（旧データの半額を含む）の賃貸だけに絞る（ATBB→athome 手数料判定ルール v1.6） */
export default async function BukkenListPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  const ui = propertyUi(locale);
  const fee = brokerFeeCopy(locale);
  const query = await searchParams ?? {};
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const feeFilter = value("fee") === "discount";
  const filters = { fee: value("fee"), school: value("school"), layout: value("layout"), station: value("station"), pets: value("pets") };
  const published = await getPublishedProperties(locale);
  const discountCount = published.filter(isDiscountedBrokerFee).length;
  const visible = filterProperties(published, filters);
  const layouts = [...new Set(published.flatMap(p => p.spec.dealType === "rental" ? [p.spec.layout] : []))].sort();
  const stations = [...new Set(published.flatMap(rentalStations))].sort();
  const labels = { ja: ["物件を絞り込む", "指定なし", "仲介手数料", "小学校区", "間取り", "駅", "ペット", "相談可・飼育可", "複数飼育可・相談", "絞り込む"], en: ["Filter listings", "Any", "Brokerage fee", "School district", "Layout", "Station", "Pets", "Allowed / negotiable", "Multiple pets / negotiable", "Apply filters"], "zh-tw": ["篩選物件", "不限", "仲介費", "小學學區", "格局", "車站", "寵物", "可飼養／可商量", "多隻／可商量", "篩選"], zh: ["筛选房源", "不限", "中介费", "小学学区", "户型", "车站", "宠物", "可饲养／可商量", "多只／可商量", "筛选"] }[locale];
  // 画面の並び（カテゴリ順→取得順）をそのまま ItemList の position に使う＝可視リストと一致させる
  const properties = LISTING_GROUP_ORDER.flatMap((group) =>
    visible.filter((p) => listingGroup(p.dealType) === group),
  );

  return (
    <>
      {properties.length > 0 && (
        <JsonLd
          data={buildPropertyItemListJsonLd(
            properties.map((p) => ({ name: getLocalizedProperty(p, locale).title, url: canonicalUrl("realestate", `/bukken/${p.slug}`, locale) })),
            canonicalUrl("realestate", "/bukken", locale),
            locale,
          )}
        />
      )}
      <Breadcrumb items={[{ name: ui.home, href: "/" }, { name: c.h1 }]} />
      <article className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-4">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.h1}</h1>
          <p className="mt-4 leading-relaxed text-text">{c.lead}</p>
        </header>

        <Link href={addLocalePrefix(SCHOOL_RENTAL_INDEX_PATH, locale)} className="mt-6 block rounded-xl border border-primary/25 bg-primary-tint p-4 font-semibold text-primary">{SCHOOL_RENTAL_COPY[locale].indexTitle} →</Link>

        <form action={addLocalePrefix("/bukken", locale)} className="mt-5 rounded-xl border border-border p-4">
          <fieldset><legend className="font-semibold">{labels[0]}</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">{labels[2]}<select name="fee" defaultValue={filters.fee} className="mt-1 block w-full rounded border border-border p-2"><option value="">{labels[1]}</option><option value="p033">{RENTAL_CAMPAIGN_COPY[locale].fee}</option><option value="discount">{fee.filter}</option></select></label>
            <label className="text-sm">{labels[3]}<select name="school" defaultValue={filters.school} className="mt-1 block w-full rounded border border-border p-2"><option value="">{labels[1]}</option>{listSchools().map(s => <option key={s.slug} value={s.slug}>{s.formalName}</option>)}</select></label>
            <label className="text-sm">{labels[4]}<select name="layout" defaultValue={filters.layout} className="mt-1 block w-full rounded border border-border p-2"><option value="">{labels[1]}</option>{layouts.map(v => <option key={v}>{v}</option>)}</select></label>
            <label className="text-sm">{labels[5]}<select name="station" defaultValue={filters.station} className="mt-1 block w-full rounded border border-border p-2"><option value="">{labels[1]}</option>{stations.map(v => <option key={v}>{v}</option>)}</select></label>
            <label className="text-sm">{labels[6]}<select name="pets" defaultValue={filters.pets} className="mt-1 block w-full rounded border border-border p-2"><option value="">{labels[1]}</option><option value="allowed">{labels[7]}</option><option value="multiple">{labels[8]}</option></select></label>
          </div><button type="submit" className="mt-4 min-h-11 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white">{labels[9]}</button></fieldset>
        </form>

        {(discountCount > 0 || feeFilter) && (
          <nav aria-label={fee.filter} className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href={addLocalePrefix("/bukken", locale)} aria-current={!feeFilter ? "page" : undefined} className={`rounded-full border px-3 py-1 ${!feeFilter ? "border-primary bg-primary text-white" : "border-border bg-surface text-text"}`}>{fee.all}</Link>
            <Link href={`${addLocalePrefix("/bukken", locale)}?fee=discount`} aria-current={feeFilter ? "page" : undefined} className={`rounded-full border px-3 py-1 ${feeFilter ? "border-primary bg-primary text-white" : "border-border bg-surface text-text"}`}>{fee.filter}（{discountCount}）</Link>
          </nav>
        )}
        {feeFilter && <p className="mt-3 text-sm text-text-muted">{fee.filterLead}</p>}

        {properties.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">
            {c.empty}
          </p>
        ) : (
          <div className="mt-8 space-y-10">
            {LISTING_GROUP_ORDER.filter((group) =>
              properties.some((p) => listingGroup(p.dealType) === group),
            ).map((group) => (
              <section key={group}>
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {group === "house" && locale === "ja" ? "戸建て" : ui.dealType[group]}
                </h2>
                <div className="mt-3 space-y-3">
                  {properties
                    .filter((p) => listingGroup(p.dealType) === group)
                    .map((p) => (
                      <PropertyCard key={p.slug} p={p} locale={locale} />
                    ))}
                </div>
                {group === "rental" && <DistrictSourceNote locale={locale} />}
              </section>
            ))}
          </div>
        )}
        <RentalCampaignCta locale={locale} sourcePage="/bukken" kind="property" />
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" variant="property" />
      </div>
    </>
  );
}

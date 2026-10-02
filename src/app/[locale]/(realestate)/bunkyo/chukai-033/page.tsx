import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { buildPageMetadata, canonicalUrl, BUSINESS_SEO, SHARED_ORG_INFO, BCP47_BY_LOCALE } from "@/lib/seo";
import { getPublishedProperties } from "@/lib/properties";
import { getRentalDiscovery } from "@/lib/rental-discovery-server";
import { fee033HubListings, FEE033_FAQ, FEE033_HUB_COPY as c } from "@/lib/fee033-hub";
import { FEE033_PATH } from "@/lib/rental-campaign";
import { listSchools } from "@/lib/school-district";
import { schoolRentalPath } from "@/lib/rental-school-district";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PropertyCard } from "@/components/bukken/PropertyCard";
import { RentalCampaignCta, RentalPageAnalytics } from "@/components/bukken/RentalCampaignCta";
import { DistrictSourceNote } from "@/components/gakku/RentalSchoolDistrict";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPropertyItemListJsonLd } from "@/lib/property-jsonld";
import { Faq } from "@/components/shared/Faq";
import { Fee033Explainer } from "@/components/bukken/Fee033Explainer";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  if (await getRequestLocale() !== "ja") notFound();
  return buildPageMetadata({ businessKey: "realestate", title: c.title, description: c.description, path: FEE033_PATH, locale: "ja", availableLocales: ["ja"] });
}
export default async function Fee033Hub({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  if (await getRequestLocale() !== "ja") notFound();
  const [properties, discovery] = await Promise.all([getPublishedProperties("ja"), getRentalDiscovery("ja")]);
  const { published, eligible, updatedAt } = fee033HubListings(properties);
  const requestedPage = Number((await searchParams)?.page ?? 1);
  const pages = Math.max(1, Math.ceil(eligible.length / 12));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;
  const visible = eligible.slice((page - 1) * 12, page * 12);
  const featured = ["seishi", "showa", "sendagi", "kubomachi"];
  const schools = listSchools();
  return <>
    <Breadcrumb items={[{ name: "ホーム", href: "/" }, { name: "文京区の賃貸", href: "/gakku/rentals" }, { name: "仲介手数料0.33ヶ月とは" }]} />
    <RentalPageAnalytics kind="fee033" />
    <JsonLd data={buildPropertyItemListJsonLd(visible.map(p => ({ name: p.title, url: canonicalUrl("realestate", `/bukken/${p.slug}`, "ja") })), canonicalUrl("realestate", FEE033_PATH, "ja"), "ja")} />
    <article className="mx-auto max-w-5xl px-4 pb-16">
      <header className="rounded-2xl bg-primary-tint p-5 sm:p-8">
        <p className="text-sm text-primary">{c.eyebrow}</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-relaxed sm:text-3xl">{c.h1}</h1>
        <p className="mt-4 leading-8">{c.answer}</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-4"><dt className="text-sm">公開中の文京区賃貸（個別掲載）</dt><dd className="mt-1 text-2xl font-semibold">{published.length}件</dd></div>
          <div className="rounded-xl bg-surface p-4"><dt className="text-sm">うち0.33ヶ月対象</dt><dd className="mt-1 text-2xl font-semibold">{eligible.length}件</dd></div>
          <div className="rounded-xl bg-surface p-4"><dt className="text-sm">物件情報 最終更新</dt><dd className="mt-2">{updatedAt ? <time dateTime={updatedAt}>{updatedAt}</time> : "未確認"}</dd></div>
        </dl>
        <nav className="mt-5 flex flex-wrap gap-3 text-sm font-semibold"><a href="#example" className="rounded-lg border border-primary px-4 py-3 text-primary">計算例を見る</a><a href="#eligible" className="rounded-lg bg-primary px-4 py-3 text-white">0.33ヶ月対象物件を見る</a><Link href="/gakku/rentals" className="rounded-lg border border-primary px-4 py-3 text-primary">学区から探す</Link></nav>
      </header>
      <Fee033Explainer />
      <section id="eligible" className="mt-10 scroll-mt-24"><h2 className="font-serif text-2xl font-semibold">仲介手数料0.33ヶ月（税込）の対象物件</h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">対象は下記の物件です。管理費等を除いた賃料を基準に計算しています。保証会社・保険・鍵交換等の費用は別途、各物件の条件をご確認ください。</p>
        {eligible.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{visible.map(p => <PropertyCard key={p.slug} p={p} locale="ja" />)}</div> : <p className="mt-5 rounded-xl border border-border p-5">現在公開中の0.33ヶ月対象物件はありません。広告掲載できない紹介可能物件がある場合があります。LINEでお問い合わせください。</p>}
        {pages > 1 && <nav aria-label="対象物件一覧のページ" className="mt-5 flex flex-wrap items-center gap-3 text-sm">{page > 1 && <Link href={`${FEE033_PATH}${page === 2 ? "" : `?page=${page - 1}`}#eligible`} className="rounded border border-primary px-4 py-3 text-primary">前へ</Link>}<span>{page} / {pages}ページ（全{eligible.length}件）</span>{page < pages && <Link href={`${FEE033_PATH}?page=${page + 1}#eligible`} className="rounded border border-primary px-4 py-3 text-primary">次へ</Link>}</nav>}
      </section>
      <RentalCampaignCta locale="ja" kind="fee033" sourcePage={FEE033_PATH} />
      <section className="mt-10"><h2 className="font-serif text-2xl font-semibold">小学校区と0.33ヶ月の対象件数から探す</h2>
        <p className="mt-3 text-sm leading-7">誠之・昭和・千駄木・窪町の4校は、不動産市場や住まい探しで「3S1K」と呼ばれることがあります。学校の評価や順位を示すものではありません。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[...schools].sort((a,b) => Number(featured.includes(b.slug)) - Number(featured.includes(a.slug))).map(s => {
          const count = discovery.schools.find(row => row.slug === s.slug);
          return <Link key={s.slug} href={schoolRentalPath(s.slug)} className="rounded-xl border border-border p-4 hover:border-primary"><h3 className="font-semibold text-primary">{s.formalName.replace("文京区立", "")}区</h3><p className="mt-2 text-sm">公開 {count?.publicListings ?? 0}件<br />0.33ヶ月対象 {count?.fee033Listings ?? 0}件</p></Link>;
        })}</div>
        <p className="mt-4 text-xs leading-6 text-text-muted">学校別の公開件数には募集比較一覧も含みます。比較一覧の取得範囲は賃料17万5,000円以上・48㎡以上です。料金が未確認の比較一覧物件は0.33ヶ月対象に数えません。募集物件集計 最終更新：{discovery.updatedAt ?? "未確認"}</p>
        <DistrictSourceNote locale="ja" />
        <Link href="/gakku" className="text-sm text-primary underline">文京区公式資料に基づく通学区域を確認する</Link>
      </section>
      <div className="mt-10"><Faq items={FEE033_FAQ} heading="仲介手数料0.33ヶ月について、よくある質問" withJsonLd bare openFirst={false} inLanguage={BCP47_BY_LOCALE.ja} /></div>
      <footer className="mt-10 rounded-xl bg-surface-dim p-5 text-sm leading-7"><p>運営：{BUSINESS_SEO.realestate.legalName}</p><p>代表者・更新責任者：{SHARED_ORG_INFO.representative}</p><p>所在地：{SHARED_ORG_INFO.streetAddress}</p><p>電話：{SHARED_ORG_INFO.telephone}</p><p>会社情報・宅建業免許・代表者：<Link href="/about" className="text-primary underline">会社概要</Link></p><p>料金情報：<Link href="/ryokin" className="text-primary underline">四葉不動産の料金</Link> ／ <Link href="/contact" className="text-primary underline">お問い合わせ</Link></p></footer>
    </article>
  </>;
}

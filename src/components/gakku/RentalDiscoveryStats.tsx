import Link from "next/link";
import type { LangCode } from "@/config/languages";
import type { SchoolRentalCount } from "@/lib/rental-discovery";
import { addLocalePrefix } from "@/lib/locale";

const COPY = {
  ja: { public: "公開中", fee: "0.33ヶ月（税込）対象", private: "広告掲載できない紹介可能物件", total: "紹介可能総数", unknown: "要確認", updated: "募集物件集計 最終更新", scope: "写真付き物件は公開中の賃貸を集計。募集比較一覧は賃料17.5万円以上・48㎡以上が対象です。非公開件数は取得済みポータルの同条件・募集中・申込なし確認済み物件を重複除外して集計。未取得・未確認は0件と表示しません。", hub: "文京区の仲介手数料0.33ヶ月対象物件", empty: "現在公開中の0.33ヶ月対象物件はありません。広告掲載できない紹介可能物件があるかは、個別にお問い合わせください。" },
  en: { public: "Public listings", fee: "0.33-month fee incl. tax", private: "Introducible, not advertised", total: "Total introducible", unknown: "To be confirmed", updated: "Listing count updated", scope: "Photo listings include published rentals. Comparison listings cover rent from ¥175,000 and area from 48 m². Non-advertised counts cover retrieved portal records under the same criteria with explicit active/no-application status, deduplicated. Unknown is not zero.", hub: "Bunkyo rentals with a 0.33-month brokerage fee", empty: "No publicly listed 0.33-month-fee rentals currently match this district. Ask us to check whether other homes can be introduced." },
  "zh-tw": { public: "公開物件", fee: "0.33個月仲介費（含稅）", private: "不可刊登但可介紹的物件", total: "可介紹總數", unknown: "待確認", updated: "招租物件統計更新", scope: "照片物件統計公開招租房源。比較列表限月租17.5萬日圓以上、48㎡以上。非公開件數僅統計已取得、同條件、確認招租且無申請的去重物件。未確認不代表0件。", hub: "文京區0.33個月仲介費適用物件", empty: "目前此學區沒有公開的0.33個月仲介費適用物件。是否有其他可介紹物件，請個別洽詢。" },
  zh: { public: "公开房源", fee: "0.33个月中介费（含税）", private: "不可刊登但可介绍的房源", total: "可介绍总数", unknown: "待确认", updated: "招租房源统计更新", scope: "照片房源统计公开招租房源。比较列表限月租17.5万日元以上、48㎡以上。非公开数量仅统计已取得、同条件、确认招租且无申请的去重房源。未确认不代表0套。", hub: "文京区0.33个月中介费适用房源", empty: "目前此学区没有公开的0.33个月中介费适用房源。是否有其他可介绍房源，请单独咨询。" },
} satisfies Record<LangCode, Record<string, string>>;

export function RentalDiscoveryStats({ stats, locale, compact = false }: { stats: SchoolRentalCount; locale: LangCode; compact?: boolean }) {
  const c = COPY[locale];
  return <div className="mt-3 text-sm">
    <dl className="flex flex-wrap gap-x-5 gap-y-2">
      <div><dt className="text-text-muted">{c.public}</dt><dd className="font-bold text-primary">{stats.publicListings}</dd></div>
      <div><dt className="text-text-muted">{c.fee}</dt><dd className="font-bold text-primary">{stats.fee033Listings}</dd></div>
      {!compact && <><div><dt className="text-text-muted">{c.private}</dt><dd>{stats.privateAvailableListings ?? c.unknown}</dd></div><div><dt className="text-text-muted">{c.total}</dt><dd>{stats.totalAvailableListings ?? c.unknown}</dd></div></>}
    </dl>
    {!compact && <><p className="mt-3 text-xs text-text-muted">{c.updated}：{stats.updatedAt ? <time dateTime={stats.updatedAt}>{new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : locale === "en" ? "en-GB" : locale === "zh-tw" ? "zh-TW" : "zh-CN", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(stats.updatedAt))}</time> : c.unknown}</p><p className="mt-2 text-xs leading-relaxed text-text-muted">{c.scope}</p></>}
  </div>;
}
export function RentalFeeHubLink({ locale, empty = false }: { locale: LangCode; empty?: boolean }) {
  const c = COPY[locale];
  return <div className="mt-4">{empty && <p className="mb-3 text-sm leading-relaxed text-text">{c.empty}</p>}<Link href={locale === "ja" ? "/bunkyo/chukai-033" : addLocalePrefix("/bukken?fee=p033", locale)} className="inline-block rounded-lg border border-primary/30 bg-primary-tint px-4 py-3 text-sm font-semibold text-primary">{c.hub} →</Link></div>;
}

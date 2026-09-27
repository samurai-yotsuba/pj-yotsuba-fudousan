import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { findSchoolBySlug } from "@/lib/school-district";
import { monthlyTotal, type PublicRentalSummary, type RentalMarket } from "@/lib/school-rental-feed";
import { PropertyLegalBlock } from "@/components/bukken/PropertyLegalBlock";
import { RentalInquiryProvider, RentalInquiryButton } from "./RentalInquiry";
import { LazyDetails } from "./LazyDetails";
import { canonicalUrl } from "@/lib/seo";
import { localizeRentalValue } from "@/lib/rental-feed-i18n";

const copy = {
  ja: { title: "学区別の募集比較一覧", lead: "文京区・賃料17万5,000円以上・48㎡以上。募集中・広告可能な物件を掲載しています。この条件の物件は恒常的に少ないため、ファミリー向けにはやや不向きな1LDK（48㎡以上）も含めています。", unknown: "未確認", school: "学区", name: "物件名・号室", rent: "賃料／管理費／共益費", total: "月額（賃料＋管理費＋共益費）", deposit: "敷金／礼金", layout: "間取り／面積", address: "住所", move: "入居可能時期", pets: "ペット", foreign: "外国籍", corporate: "法人契約", companyHousing: "社宅", detail: "条件・費用を確認", request: "内見日程候補・詳細を問い合わせる", checked: "募集確認", until: "次回更新予定", districtUnknown: "学区要確認", terms: "取引態様：媒介（仲介）。仲介手数料：物件ごとに確認してご案内します。その他の費用は下記をご確認ください。", original: "", statuses: { allowed: "可", consult: "相談", "not-allowed": "不可", unknown: "未確認" }, fields: ["建物種別", "交通", "築年月", "構造", "階数・所在階", "契約種別", "契約期間", "保証金", "更新料", "保険", "保証会社", "その他費用"] },
  en: { title: "Rental comparison by school district", lead: "Available rentals in Bunkyo: monthly rent from ¥175,000 and floor area from 48 m², with advertising permission confirmed. Because few properties meet these conditions at any time, the list also includes 1LDK units (48 m² or more) that may be somewhat small for families.", unknown: "Unconfirmed", school: "School district", name: "Building / unit", rent: "Rent / management / common fee", total: "Monthly rent + management + common fee", deposit: "Deposit / key money", layout: "Layout / area", address: "Address", move: "Move-in", pets: "Pets", foreign: "Foreign nationals", corporate: "Corporate lease", companyHousing: "Company housing", detail: "Terms and fees", request: "Ask about viewing dates and details", checked: "Availability checked", until: "Next scheduled update", districtUnknown: "District unconfirmed", terms: "Transaction: brokerage. Brokerage fee: confirmed individually for each property. See below for other costs.", original: "Building names, addresses and landlord-specific remarks (pets, foreign nationals, corporate leases, guarantor companies, insurers, service products) are shown in the original Japanese.", statuses: { allowed: "Allowed", consult: "Consultation", "not-allowed": "Not allowed", unknown: "Unconfirmed" }, fields: ["Building type", "Transport", "Built", "Structure", "Floors / unit floor", "Lease type", "Lease term", "Guarantee deposit", "Renewal fee", "Insurance", "Guarantor", "Other fees"] },
  "zh-tw": { title: "依小學學區比較租賃物件", lead: "文京區、月租17萬5,000日圓以上、48平方公尺以上。僅列出確認可刊登廣告且仍在招租的物件。由於符合條件的物件長期偏少，列表中也包含對家庭而言稍嫌狹小的1LDK（48平方公尺以上）。", unknown: "待確認", school: "學區", name: "物件名稱／房號", rent: "租金／管理費／共益費", total: "月額（租金＋管理費＋共益費）", deposit: "押金／禮金", layout: "格局／面積", address: "地址", move: "可入住時間", pets: "寵物", foreign: "外籍人士", corporate: "法人承租", companyHousing: "公司宿舍", detail: "條件與費用", request: "洽詢看房日期與詳細資料", checked: "招租確認", until: "下次預定更新", districtUnknown: "學區待確認", terms: "交易方式：仲介。仲介費：依各物件確認後提供。其他費用請參閱下方。", original: "物件名稱、地址，以及房東個別的備註（寵物、外籍人士、法人承租、保證公司、保險公司、服務商品名稱）保留日文原文。", statuses: { allowed: "可", consult: "可商議", "not-allowed": "不可", unknown: "待確認" }, fields: ["建物類型", "交通", "建築年月", "結構", "樓層／所在樓層", "租約類型", "租約期間", "保證金", "續約費", "保險", "保證公司", "其他費用"] },
  zh: { title: "按小学学区比较租赁房源", lead: "文京区、月租17万5,000日元以上、48平方米以上。仅列出确认可刊登广告且仍在招租的房源。由于符合条件的房源长期偏少，列表中也包含对家庭而言略显狭小的1LDK（48平方米以上）。", unknown: "待确认", school: "学区", name: "房源名称／房号", rent: "租金／管理费／共益费", total: "月额（租金＋管理费＋共益费）", deposit: "押金／礼金", layout: "户型／面积", address: "地址", move: "可入住时间", pets: "宠物", foreign: "外籍人士", corporate: "法人承租", companyHousing: "公司宿舍", detail: "条件与费用", request: "咨询看房日期与详细信息", checked: "招租确认", until: "下次计划更新", districtUnknown: "学区待确认", terms: "交易方式：中介。中介费：按各房源确认后提供。其他费用请参阅下方。", original: "房源名称、地址，以及房东个别的备注（宠物、外籍人士、法人承租、保证公司、保险公司、服务商品名称）保留日文原文。", statuses: { allowed: "可", consult: "可商议", "not-allowed": "不可", unknown: "待确认" }, fields: ["建筑类型", "交通", "建筑年月", "结构", "楼层／所在楼层", "租约类型", "租约期限", "保证金", "续约费", "保险", "保证公司", "其他费用"] },
};

const consultationCopy = {
  ja: {
    title: "一覧にない物件もご紹介できます",
    selection: "この一覧は、不動産業者向けの流通サイトや住宅プラットフォームに掲載された物件のうち、管理会社（元付）が「広告可」としている物件に絞って掲載しています。",
    market: "{date}時点で、不動産業者間の物件データベースには、文京区・賃料17万5,000円以上・48㎡以上の募集中の住戸が{total}件ありました（同じ住戸の重複を除く）。このうち、管理会社（元付）が当社ホームページへの掲載を認めている{listed}件を表示しています。掲載できるのは募集の一部です。",
    offer: "ご希望の学区・賃料・間取り・入居時期をお知らせいただければ、この一覧にない物件も含めて現在の募集状況と紹介の可否を確認し、ご案内します。",
    action: "一覧にない物件も含めて相談する",
  },
  en: {
    title: "We can introduce properties beyond this list",
    selection: "This list includes only rentals from real estate agent networks and housing platforms for which the managing or listing agent has granted advertising permission.",
    market: "As of {date}, the real estate agents’ shared databases listed {total} available units in Bunkyo with rent from ¥175,000 and floor area from 48 m² (duplicates of the same unit removed). Of these, we show the {listed} units whose managing or listing agent permits advertising on our website. Only part of the market can be published.",
    offer: "Tell us your preferred school district, rent, layout and move-in date, and we will check current availability and whether we can introduce each property, including properties not on this list, before getting back to you.",
    action: "Ask about properties beyond this list",
  },
  "zh-tw": {
    title: "我們也能介紹列表以外的物件",
    selection: "本列表從不動產業者流通網站及住宅平台的物件中，僅刊登管理公司（原始委託業者）已允許刊登廣告的租屋物件。",
    market: "截至{date}，不動產業者間的物件資料庫中，文京區、月租17萬5,000日圓以上、48平方公尺以上且仍在招租的房屋共有{total}件（已排除同一房屋的重複刊登）。其中，本列表顯示管理公司（原始委託業者）允許在本公司網站刊登的{listed}件。可公開刊登的僅為招租物件的一部分。",
    offer: "歡迎告知您希望的學區、租金、格局及入住時間。我們將確認包含本列表以外物件在內的最新招租狀況與可否介紹後，再為您說明。",
    action: "諮詢包含列表以外的物件",
  },
  zh: {
    title: "我们也能介绍列表以外的房源",
    selection: "本列表从不动产经纪流通网站及住宅平台的房源中，仅刊登管理公司（原始委托经纪方）已允许刊登广告的租赁房源。",
    market: "截至{date}，不动产经纪间的房源数据库中，文京区、月租17万5,000日元以上、48平方米以上且仍在招租的房屋共有{total}套（已排除同一房屋的重复登记）。其中，本列表显示管理公司（原始委托经纪方）允许在本公司网站刊登的{listed}套。可公开刊登的仅为招租房源的一部分。",
    offer: "欢迎告知您希望的学区、租金、户型及入住时间。我们将确认包括本列表以外房源在内的最新招租情况与可否介绍后，再为您说明。",
    action: "咨询包含列表以外的房源",
  },
} satisfies Record<LangCode, { title: string; selection: string; market: string; offer: string; action: string }>;

export function RentalComparison({ rows, locale, market, listedTotal }: { rows: PublicRentalSummary[]; locale: LangCode; market?: RentalMarket | null; listedTotal?: number }) {
  if (!rows.length) return null;
  const c = copy[locale];
  const consultation = consultationCopy[locale];
  const money = (amount: number | null) => amount === null ? c.unknown : `¥${amount.toLocaleString("ja-JP")}`;
  const date = (value: string) => new Date(value).toLocaleString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-GB" : locale === "zh-tw" ? "zh-TW" : "zh-CN", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " JST";
  const latest = rows.map(r => r.checkedAt).sort((a, b) => Date.parse(a) - Date.parse(b)).at(-1)!;
  const nextReview = rows.map(r => r.nextReviewAt).sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  // 分母（募集規模）は区全体の数字。掲載数より小さい等の不整合があれば出さず、従来の説明文に戻す。
  const showMarket = !!market?.checkedAt && listedTotal !== undefined && market.total > 0 && listedTotal <= market.total;
  const day = (value: string) => new Date(value).toLocaleDateString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-GB" : locale === "zh-tw" ? "zh-TW" : "zh-CN", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" });
  const listingPath = (r: PublicRentalSummary) => r.schoolSlug ? `/gakku/${r.schoolSlug}/rentals` : "/gakku/rentals";
  return <RentalInquiryProvider locale={locale}><section className="mt-8" aria-label={c.title}>
    <h2 className="font-serif text-2xl font-semibold">{c.title}</h2>
    <p className="mt-3 text-sm leading-relaxed">{c.lead}</p>
    <aside className="mt-4 rounded-xl border border-primary/20 bg-primary-tint p-4 sm:p-5" aria-label={consultation.title}>
      <h3 className="font-semibold text-ink">{consultation.title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{showMarket
        ? consultation.market.replace("{date}", day(market!.checkedAt!)).replace("{total}", market!.total.toLocaleString("ja-JP")).replace("{listed}", listedTotal!.toLocaleString("ja-JP"))
        : consultation.selection}</p>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">{consultation.offer}</p>
      <Link href={addLocalePrefix("/contact?intent=bukken", locale)} className="mt-4 inline-block rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90">{consultation.action}</Link>
    </aside>
    {c.original && <p className="mt-2 text-xs text-text-muted">{c.original}</p>}
    <p className="mt-2 text-xs text-text-muted">{c.terms}</p>
    <div className="mt-4 space-y-4">
      {rows.map(r => {
        const school = r.schoolSlug ? findSchoolBySlug(r.schoolSlug) : undefined;
        // 2026-09-24：型の決まった値だけ訳す（保証会社欄＝r.guarantor は条件文のため原文）。全ページ点検 #3
        const t = (v: string) => localizeRentalValue(v, locale);
        const values = [t(r.buildingType), t(r.access), t(r.built), t(r.structure), t(r.floors), t(r.contractType), t(r.contractPeriod), t(r.guaranteeDeposit), t(r.renewalFee), t(r.insurance), r.guarantor, t(r.otherFees)];
        return <article id={r.id} key={r.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5 [content-visibility:auto] [contain-intrinsic-size:auto_420px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-ink">{r.building} {r.unit}</h3>
            {school ? <Link className="rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary" href={addLocalePrefix(`/gakku/${school.slug}/rentals`, locale)}>{school.formalName}</Link> : <span className="rounded-full bg-surface-dim px-3 py-1 text-sm">{c.districtUnknown}</span>}
          </div>
          <p className="mt-3 text-lg font-bold text-primary">{c.total}：{money(monthlyTotal(r))}</p>
          <dl className="mt-3 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[[c.rent, `${money(r.rentYen)} / ${money(r.managementYen)} / ${money(r.commonYen)}`], [c.deposit, `${t(r.deposit) || c.unknown} / ${t(r.keyMoney) || c.unknown}`], [c.layout, `${r.layout || c.unknown} / ${r.areaSqm} m²`], [c.address, r.address], [c.move, t(r.availabilityText) || c.unknown], [c.pets, c.statuses[r.pets]], [c.foreign, c.statuses[r.foreignNationals]], [c.corporate, c.statuses[r.corporate]], [c.companyHousing, c.statuses[r.companyHousing]]].map(([label, value]) => <div key={label}><dt className="text-xs text-text-muted">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}
          </dl>
          {/* 2026-09-24：中身は開いたときに初めて描く（161件×条件欄で DOM 1.6万個・TBT 402ms だった） */}
          <LazyDetails className="mt-4 border-t border-border pt-3" summaryClassName="cursor-pointer text-sm font-semibold text-primary" summary={c.detail}>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {values.map((v, i) => <div key={c.fields[i]}><dt className="text-text-muted">{c.fields[i]}</dt><dd>{v || c.unknown}</dd></div>)}
              {[[c.pets, r.petTerms], [c.foreign, r.foreignTerms], [c.corporate, r.corporateTerms], [c.companyHousing, r.companyHousingTerms]].map(([label, value]) => <div key={label}><dt className="text-text-muted">{label}</dt><dd>{value || c.unknown}</dd></div>)}
            </dl>
          </LazyDetails>
          <p className="mt-3 text-xs text-text-muted">{c.checked}：{date(r.checkedAt)} / {c.until}：{date(r.nextReviewAt)}</p>
          <RentalInquiryButton target={{ title: `${r.building} ${r.unit}`, url: `${canonicalUrl("realestate", listingPath(r), locale)}#${r.id}` }}>{c.request}</RentalInquiryButton>
        </article>;
      })}
    </div>
    <PropertyLegalBlock property={{ infoUpdatedAt: date(latest), nextUpdateAt: date(nextReview) }} locale={locale} />
  </section></RentalInquiryProvider>;
}

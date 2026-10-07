import { FamilyTrustFees } from "@/components/legal/FamilyTrustFees";

// /legal/ryokin（型C・報酬額表）＝原稿_行政書士 #7（全8区分転記済み・公開用列のみ）
// フェーズI多言語化（2026-07-10・浦松承認）：サービス名（rows.name）・金額は日本語のまま＝見出し・列ラベル・免責・導線のみ4ロケール化。
// en/zh-tw/zh=監修前ドラフト。JSON-LD＝Service＋PriceSpecification(確定値のみ)＋BreadcrumbList（Breadcrumb部品が出力）＝ja固定で不変。
// 【重要】公開用列のみ／確定値のみ／SPはカード化。金額は「税込の目安」＋実費別＋事案により見積り。
// C7（→/labor/ryokin）は SR_LAUNCHED=false の間 getCrossLinks が返さない＝非表示（開業日に自動開通・リード文はja固定）。
import { getNonresidentServices } from "@/lib/legal/nonresident-review";
import { NonresidentFeeTable, NonresidentReviewLinks } from "@/components/legal/NonresidentCompanyReview";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import { CrossLinkBanner } from "@/components/shared/CrossLinkBanner";
import { getCrossLinks } from "@/lib/cross-links";
import { SR_LAUNCHED } from "@/lib/shared/office";
import type { LangCode } from "@/config/languages";
import { SR_BIO } from "@/lib/shared/sr-label";
import { SECTIONS, type Row, type Section } from "@/lib/legal/ryokin-sections";
import { localizeFeeName, localizeFeeText } from "@/lib/legal/ryokin-i18n";

const SITE = "https://luck428.com";

/** C7（→/labor/ryokin）のリード文。2026-09-24 に4言語化（開業済みのため） */
const CROSS_LEAD: Record<LangCode, string> = {
  ja: "労務・処遇改善加算・雇用関係助成金の料金は、四葉社会保険労務士事務所（別事業体）のページへ。",
  en: "For fees for labor matters, the treatment-improvement add-on and employment-related subsidies, see the page of 四葉社会保険労務士事務所 (a separate business).",
  "zh-tw": "勞務、待遇改善加算、雇用相關助成金的費用，請參閱四葉社会保険労務士事務所（另一事業體）的頁面。",
  zh: "劳务、待遇改善加算、雇用相关助成金的费用，请参阅四葉社会保険労務士事務所（另一事业体）的页面。",
};

type RyokinCopy = {
  metaTitle: string;
  metaDesc: string;
  crumbHome: string;
  crumbCurrent: string;
  h1: string;
  lead: React.ReactNode;
  colService: string;
  colUnit: string;
  colPrice: string;
  colJitsuhi: string;
  toService: string;
  sectionTitles: [string, string, string, string, string, string, string];
  /** 障害福祉セクションの直下に出す業際の注記（処遇改善加算の線引き） */
  shogaiNote: React.ReactNode;
  /** 国際業務セクションの直下に出す注記（育成就労＝どちらの事務所で受けるか・独立性） */
  ikuseishuroNote: React.ReactNode;
  footnote: string;
  procedureLead: string;
  procedureLink: string;
};

const COPY: Record<LangCode, RyokinCopy> = {
  ja: {
    metaTitle: "報酬額表｜四葉行政書士事務所",
    metaDesc:
      "四葉行政書士事務所の報酬額を業務ごとに掲載します。障害福祉サービス指定申請、在留資格・ビザ、相続、会社設立・許認可、補助金申請サポートの料金の目安。事案により変動する場合は個別にお見積りし、ご契約前に書面で明示します。",
    crumbHome: "ホーム",
    crumbCurrent: "報酬額表",
    h1: "報酬額表",
    lead: (
      <>
        四葉行政書士事務所の報酬額を、業務ごとに掲載します。金額は目安であり、<strong>事案の内容により変動する場合は、ご契約前に個別のお見積りを書面でご提示</strong>します。別途、登録免許税・自治体手数料・印紙代・戸籍取得費等の実費が発生します。
      </>
    ),
    colService: "サービス",
    colUnit: "単位",
    colPrice: "税込目安",
    colJitsuhi: "実費",
    toService: "→ 業務内容",
    sectionTitles: [
      "障害福祉サービス",
      "国際業務（在留資格・帰化・認証／中国語対応）",
      "会社設立・法人",
      "建設業・宅建業",
      "許認可（産廃・飲食・古物 等）",
      "相続・遺言・信託",
      "その他（契約書・補助金）",
    ],
    shogaiNote: (
      <>
        <strong>処遇改善加算の線引き</strong>
        ：当事務所（行政書士）がお受けするのは、加算体制届・計画書・実績報告など、
        <strong>指定権者（自治体）へ提出する書類の作成</strong>です。
        <strong>
          就業規則・賃金規程・キャリアパス要件など賃金制度の設計と、賃金改善額の算定は取り扱いません
        </strong>
        。これらは社会保険労務士の業務で、四葉社会保険労務士事務所
        {SR_LAUNCHED ? "が別契約でお受けします" : "（2026年9月開業予定・現時点では未開業）が、開業後に別契約でお受けします"}
        。別の事業体のため、それぞれ別々にご契約いただきます（紹介料の授受はありません）。
      </>
    ),
    ikuseishuroNote: (
      <>
        <strong>育成就労（2027年4月施行）について</strong>
        ：<strong>監理支援機関の許可申請書類の作成</strong>は行政書士の業務で、当事務所がお受けします。
        <strong>外部監査人</strong>は、施行規則が弁護士・社会保険労務士・行政書士を列挙しているとおり
        いずれの資格でも就任でき、当事務所と四葉社会保険労務士事務所
        {SR_LAUNCHED ? "" : "（2026年9月開業予定・現時点では未開業）"}のどちらでもお引き受けできます。
        ただし<strong>独立性の確保</strong>のため、外部監査人をお引き受けした監理支援機関の関係先とは労務の顧問契約を結びません。
        この扱いは、どちらの事務所で受けた場合にも同じです。
        なお<strong>許可申請の受付開始時期は公表されていません</strong>。制度が始まる前の段階から、事前のご相談を承ります。
      </>
    ),
    footnote:
      "※金額はすべて税込の目安です。事案により変動する場合は、ご契約前に書面でお見積りを明示します。確定値のみ構造化データ（PriceSpecification）として出力しています。",
    procedureLead: "ご依頼の手順 → ",
    procedureLink: "ご相談から完了までの受任の流れ",
  },
  en: {
    metaTitle: "Fee Schedule｜四葉行政書士事務所",
    metaDesc:
      "Fee schedule of Yotsuba Gyoseishoshi Office by service area: disability-welfare service designation, residence status and visas, inheritance, company formation and licensing, and subsidy application support. Where fees vary by case, we provide a written estimate before you sign.",
    crumbHome: "Home",
    crumbCurrent: "Fee Schedule",
    h1: "Fee Schedule",
    lead: (
      <>
        Our fees are listed by service area. Amounts are indicative; <strong>where a fee varies with the specifics of your case, we present an individual written estimate before any engagement</strong>. Disbursements such as registration and license tax, municipal fees, revenue stamps, and family-register retrieval costs are charged separately. Service names are given in English, with the Japanese name used in official procedures shown beneath.
      </>
    ),
    colService: "Service",
    colUnit: "Unit",
    colPrice: "Approx. fee (tax incl.)",
    colJitsuhi: "Disbursements",
    toService: "→ Service details",
    sectionTitles: [
      "Disability-Welfare Services",
      "International Services (Residence Status, Naturalization, Authentication / Chinese Support)",
      "Company & Corporation Formation",
      "Construction & Real-Estate Business Licensing",
      "Licenses & Permits (Industrial Waste, Restaurants, Secondhand Goods, etc.)",
      "Inheritance, Wills & Trusts",
      "Other (Contracts & Subsidies)",
    ],
    shogaiNote: (
      <>
        <strong>Where the treatment-improvement add-on splits</strong>: what this office (gyoseishoshi)
        handles is <strong>preparing the documents filed with the designating authority (the municipality)</strong>
        — the add-on structure notification, the plan, and the performance report.{" "}
        <strong>
          We do not handle the design of the wage system itself (work rules, wage regulations,
          career-path requirements) or the calculation of the wage-improvement amount
        </strong>
        . That is work for a licensed social insurance and labor consultant, and 四葉社会保険労務士事務所
        {SR_LAUNCHED ? " takes it on under a separate contract" : " (opening September 2026; not yet in operation) will take it on under a separate contract once it opens"}
        . The two are separate businesses, so you contract with each of them separately. No referral fees are exchanged.
      </>
    ),
    ikuseishuroNote: (
      <>
        <strong>On the training-employment (ikusei-shuro) system, effective April 2027</strong>:{" "}
        <strong>preparing the permit application for a supervising and support organization</strong> is
        gyoseishoshi work, and this office handles it. The <strong>external auditor</strong> role can be
        filled by any of the qualifications the implementing regulation lists — attorney, licensed social
        insurance and labor consultant, or gyoseishoshi — so either this office or 四葉社会保険労務士事務所
        {SR_LAUNCHED ? "" : " (opening September 2026; not yet in operation)"} can take it on.
        To preserve <strong>independence</strong>, however, we do not enter into a labor retainer with parties
        related to a supervising and support organization whose external auditor we serve as. This applies
        whichever of the two offices takes the role.{" "}
        <strong>The date on which permit applications begin to be accepted has not been announced.</strong>{" "}
        We accept inquiries in advance, before the system starts.
      </>
    ),
    footnote:
      "* All amounts are indicative and include consumption tax. Where fees vary by case, a written estimate is provided before engagement. Only fixed amounts are output as structured data (PriceSpecification).",
    procedureLead: "How to engage us → ",
    procedureLink: "How engagement works, from consultation to completion",
  },
  "zh-tw": {
    metaTitle: "報酬額表｜四葉行政書士事務所",
    metaDesc:
      "四葉行政書士事務所依業務類別刊載報酬額：障礙福祉服務指定申請、在留資格（簽證）、繼承、公司設立・許認可、補助金申請支援的費用參考。若因案件內容而變動，將於簽約前以書面提出個別估價。",
    crumbHome: "首頁",
    crumbCurrent: "報酬額表",
    h1: "報酬額表",
    lead: (
      <>
        依業務類別刊載本事務所的報酬額。金額為參考值，<strong>若因案件內容而變動，將於簽約前以書面提出個別估價</strong>。另需負擔登錄免許稅、自治體手續費、印紙代、戶籍取得費等實費。服務名稱下方並列日本官方手續使用的日文原名。
      </>
    ),
    colService: "服務",
    colUnit: "單位",
    colPrice: "含稅參考價",
    colJitsuhi: "實費",
    toService: "→ 業務內容",
    sectionTitles: [
      "障礙福祉服務",
      "國際業務（在留資格・歸化・認證／中文對應）",
      "公司設立・法人",
      "建設業・宅建業（不動產業）",
      "許認可（產業廢棄物・餐飲・古物等）",
      "繼承・遺囑・信託",
      "其他（契約書・補助金）",
    ],
    shogaiNote: (
      <>
        <strong>處遇改善加算的分界</strong>
        ：本事務所（行政書士）承辦的是加算體制申報、計畫書、實績報告等，
        <strong>向指定權者（自治體）提出之文件的製作</strong>。
        <strong>
          就業規則、薪資規程、職涯路徑要件等薪資制度的設計，以及薪資改善額的計算，本所不予承辦
        </strong>
        。這些屬社會保險勞務士的業務，由四葉社会保険労務士事務所
        {SR_LAUNCHED ? "另行簽約承辦" : "（預定2026年9月開業・現階段尚未開業）於開業後另行簽約承辦"}
        。兩者為不同的事業體，須分別簽約（不收受介紹費）。
      </>
    ),
    ikuseishuroNote: (
      <>
        <strong>關於育成就勞（2027年4月施行）</strong>
        ：<strong>監理支援機關的許可申請文件製作</strong>屬行政書士的業務，由本事務所承辦。
        <strong>外部稽核人員</strong>依施行規則所列舉，律師、社會保險勞務士、行政書士任一資格皆可就任，
        本事務所與四葉社会保険労務士事務所
        {SR_LAUNCHED ? "" : "（預定2026年9月開業・現階段尚未開業）"}皆可承辦。
        惟為確保<strong>獨立性</strong>，本所不與擔任外部稽核人員之監理支援機關的關係方締結勞務顧問契約。
        此一處理方式，不論由哪一個事務所承辦皆相同。
        另<strong>許可申請的受理開始時期尚未公布</strong>。制度施行前的階段，即可受理事前諮詢。
      </>
    ),
    footnote:
      "※金額皆為含稅參考值。若因案件而變動，將於簽約前以書面明示估價。僅確定金額輸出為結構化資料（PriceSpecification）。",
    procedureLead: "委託流程 → ",
    procedureLink: "從諮詢到完成的受任流程",
  },
  zh: {
    metaTitle: "报酬额表｜四葉行政書士事務所",
    metaDesc:
      "四葉行政書士事務所按业务类别刊载报酬额：残障福祉服务指定申请、在留资格（签证）、继承、公司设立・许认可、补助金申请支援的费用参考。若因案件内容而变动，将于签约前以书面提出个别估价。",
    crumbHome: "首页",
    crumbCurrent: "报酬额表",
    h1: "报酬额表",
    lead: (
      <>
        按业务类别刊载本事务所的报酬额。金额为参考值，<strong>若因案件内容而变动，将于签约前以书面提出个别估价</strong>。另需承担登录免许税、自治体手续费、印纸代、户籍取得费等实费。服务名称下方并列日本官方手续使用的日文原名。
      </>
    ),
    colService: "服务",
    colUnit: "单位",
    colPrice: "含税参考价",
    colJitsuhi: "实费",
    toService: "→ 业务内容",
    sectionTitles: [
      "残障福祉服务",
      "国际业务（在留资格・归化・认证／中文对应）",
      "公司设立・法人",
      "建设业・宅建业（不动产业）",
      "许认可（产业废弃物・餐饮・古物等）",
      "继承・遗嘱・信托",
      "其他（合同・补助金）",
    ],
    shogaiNote: (
      <>
        <strong>处遇改善加算的分界</strong>
        ：本事务所（行政书士）承办的是加算体制申报、计划书、实绩报告等，
        <strong>向指定权者（自治体）提交之文件的制作</strong>。
        <strong>
          就业规则、工资规程、职业发展路径要件等工资制度的设计，以及工资改善额的计算，本所不予承办
        </strong>
        。这些属社会保险劳务士的业务，由四葉社会保険労務士事務所
        {SR_LAUNCHED ? "另行签约承办" : "（预定2026年9月开业・现阶段尚未开业）于开业后另行签约承办"}
        。两者为不同的事业体，须分别签约（不收受介绍费）。
      </>
    ),
    ikuseishuroNote: (
      <>
        <strong>关于育成就劳（2027年4月施行）</strong>
        ：<strong>监理支援机构的许可申请文件制作</strong>属行政书士的业务，由本事务所承办。
        <strong>外部审计人员</strong>依施行规则所列举，律师、社会保险劳务士、行政书士任一资格皆可就任，
        本事务所与四葉社会保険労務士事務所
        {SR_LAUNCHED ? "" : "（预定2026年9月开业・现阶段尚未开业）"}皆可承办。
        惟为确保<strong>独立性</strong>，本所不与担任外部审计人员之监理支援机构的关系方缔结劳务顾问契约。
        此一处理方式，不论由哪一个事务所承办皆相同。
        另<strong>许可申请的受理开始时期尚未公布</strong>。制度施行前的阶段，即可受理事前咨询。
      </>
    ),
    footnote:
      "※金额均为含税参考值。若因案件而变动，将于签约前以书面明示估价。仅确定金额输出为结构化数据（PriceSpecification）。",
    procedureLead: "委托流程 → ",
    procedureLink: "从咨询到完成的受任流程",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return buildPageMetadata({
    businessKey: "legal",
    title: c.metaTitle,
    description: c.metaDesc,
    path: "/legal/ryokin",
    locale,
    absoluteTitle: true,
  });
}

/** 金額・単位・実費欄の表示文言（非日本語は訳。訳が無いときは原文＝テストで0件を保証） */
function fee(ja: string, locale: LangCode) {
  return localizeFeeText(ja, locale) ?? ja;
}
function sep(locale: LangCode) {
  return locale === "en" ? ": " : "：";
}

/** サービス名。非日本語は訳を主に、公的手続きの日本語の原名を小さく併記する */
function RowName({ r, locale }: { r: Row; locale: LangCode }) {
  const name = localizeFeeName(r.name, locale) ?? r.name;
  const label = r.href ? (
    <Link href={addLocalePrefix(r.href, locale)} className="text-primary underline">{name}</Link>
  ) : (
    name
  );
  if (locale === "ja" || name === r.name) return label;
  return (
    <>
      {label}
      <span lang="ja" className="mt-0.5 block text-xs text-text-muted">{r.name.trim()}</span>
    </>
  );
}

function FeeTable({ s, title, c, locale }: { s: Section; title: string; c: RyokinCopy; locale: LangCode }) {
  return (
    <div>
      <h2 className="border-l-4 border-primary pl-2 font-serif text-lg font-semibold text-ink">
        {title}
        {s.href && (
          <>
            {" "}
            <Link href={addLocalePrefix(s.href, locale)} className="text-sm font-normal text-primary underline">{c.toService}</Link>
          </>
        )}
      </h2>
      {/* PC＝表 */}
      <table className="mt-3 hidden w-full border-collapse text-sm sm:table">
        <thead>
          <tr className="bg-primary-tint text-left">
            <th className="border border-border px-3 py-2">{c.colService}</th>
            <th className="border border-border px-3 py-2 whitespace-nowrap">{c.colUnit}</th>
            <th className="border border-border px-3 py-2 whitespace-nowrap">{c.colPrice}</th>
            {s.hasJitsuhi && <th className="border border-border px-3 py-2 whitespace-nowrap">{c.colJitsuhi}</th>}
          </tr>
        </thead>
        <tbody className="text-text-muted">
          {s.rows.map((r, i) => (
            <tr key={i}>
              <td className="border border-border px-3 py-2 text-text">
                <RowName r={r} locale={locale} />
              </td>
              <td className="border border-border px-3 py-2 whitespace-nowrap">{fee(r.unit, locale)}</td>
              <td className="border border-border px-3 py-2">{fee(r.price, locale)}</td>
              {s.hasJitsuhi && <td className="border border-border px-3 py-2">{fee(r.jitsuhi ?? "—", locale)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {/* SP＝カード化 */}
      <ul className="mt-3 space-y-2 sm:hidden">
        {s.rows.map((r, i) => (
          <li key={i} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="font-medium text-ink">
              <RowName r={r} locale={locale} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 text-text-muted">
              <span>{c.colUnit}{sep(locale)}{fee(r.unit, locale)}</span>
              <span>{c.colPrice}{sep(locale)}{fee(r.price, locale)}</span>
              {s.hasJitsuhi && <span>{c.colJitsuhi}{sep(locale)}{fee(r.jitsuhi ?? "—", locale)}</span>}
            </div>
          </li>
        ))}
      </ul>
      {/* 業際の注記（該当セクションのみ。ページ最下部の C7 バナーは SR_LAUNCHED=false の間は出ないため、
          開業前でも線引きが読者に見えるようここに置く） */}
      {s.noteKey && (
        <blockquote className="mt-3 border-l-4 border-primary bg-primary-tint p-3 text-xs leading-relaxed text-text">
          {c[s.noteKey]}
        </blockquote>
      )}
    </div>
  );
}

function jsonLd() {
  const offers = SECTIONS.flatMap((s) =>
    s.rows
      .filter((r) => typeof r.value === "number")
      .map((r) => ({
        "@type": "Offer",
        name: r.name,
        priceSpecification: { "@type": "PriceSpecification", price: r.value, priceCurrency: "JPY", valueAddedTaxIncluded: true },
      })),
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": SITE + "/legal/ryokin#service",
        name: "四葉行政書士事務所 報酬額",
        provider: { "@id": SITE + "/legal/#organization" },
        offers, // 確定値のみ（〜・別途お見積りは除外）
      },
      // BreadcrumbList は <Breadcrumb> 部品が出力（二重を避ける）
    ],
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  const services = await getNonresidentServices(locale);
  // The published table contains the existing K.K. fee; preserve LLC and all other services.
  const sections = SECTIONS.map(s => s.href === "/legal/services/company"
    ? { ...s, rows: s.rows.filter(r => r.name !== "会社設立（定款作成等）") } : s);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <Breadcrumb items={[{ name: c.crumbHome, href: "/legal" }, { name: c.crumbCurrent }]} />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-2">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.h1}</h1>
          <p className="mt-3 leading-relaxed text-text">{c.lead}</p>
        </header>

        <div className="mt-6 space-y-8">
          {sections.map((s, i) => (
            <div key={s.title}>
              <FeeTable s={s} title={c.sectionTitles[i] ?? s.title} c={c} locale={locale} />
              {s.href === "/legal/services/inheritance" && <FamilyTrustFees locale={locale} />}
              {s.href === "/legal/services/company" && <>
                <NonresidentFeeTable copy={services} />
                <NonresidentReviewLinks copy={services} locale={locale} />
              </>}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-text-muted">{c.footnote}</p>

        <p className="mt-4 text-sm">
          {c.procedureLead}
          <Link href={addLocalePrefix("/legal/nagare", locale)} className="text-primary underline">
            {c.procedureLink}
          </Link>
        </p>

        {/* C7（→/labor/ryokin）＝開業日開通（SR_LAUNCHED・リード文はja固定＝開業時に多言語化判断） */}
        {getCrossLinks("/legal/ryokin", SR_LAUNCHED).map((cl) => (
          <CrossLinkBanner
            key={cl.id}
            link={cl}
            lead={CROSS_LEAD[locale] ?? CROSS_LEAD.ja}
          />
        ))}

        {/* 署名（E-E-A-T・原稿サイト共通・ja固定＝著者情報の訳はフェーズI後半で統一判断） */}
        <aside className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <img
            src="/staff/uramatsu-square.webp"
            alt="四葉行政書士事務所 代表 浦松丈二"
            width={48}
            height={48}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
          <p className="text-xs leading-relaxed text-text-muted">
            <strong>この記事の著者</strong> 浦松 丈二｜四葉行政書士事務所 代表行政書士（登録番号 第25087022号）・宅地建物取引士。元毎日新聞中国総局長（記者歴34年）。{SR_BIO.ja}。
          </p>
        </aside>
      </main>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="legal" />
      </div>
    </>
  );
}

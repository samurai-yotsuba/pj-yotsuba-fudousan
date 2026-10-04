import { LaborStandaloneServices } from "@/components/labor/LaborEngagement";
import { LABOR_ENGAGEMENT_COPY } from "@/lib/labor/engagement-copy";
// /labor/services（型E・業務ハブ）＝ページ割v2 §2-C・ワイヤwireframe_labor_services.html準拠
// 文言＝原稿_社労士#1の業務カード。旧実装のFAQPage/HowTo/Service JSON-LDは廃止
// （FAQPageは/labor/faq専用・BreadcrumbListはBreadcrumb部品のみ＝委任§4-6）。
// 2026-09-01 多言語化（第1波）：COPY: Record<LangCode,…>＋getRequestLocale（手本=/ryokin タスクB-1）。
//   ・事務所名は zh-tw＝四葉社會保險勞務士事務所／zh＝日本語表記のまま（labor.meta の慣行）。
//   ・一体提供を示唆する語（ワンストップ／一站式／one-stop 等）は全言語で不使用（第6条）。
//   ・分離受任の明示（別事業体・別々にご契約）を4言語とも維持する。
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand } from "@/components/shared/CtaBand";
import type { LangCode } from "@/config/languages";

type Row = { href: string; label: string; audience: string };
type NotRow = { w: string; t: string };
type Copy = {
  metaTitle: string;
  metaDescription: string;
  bcHome: string;
  bcHere: string;
  h1: string;
  leadStrong: string;
  leadRest: string;
  flow1: string;
  flowLink: string;
  flow2: string;
  notTitle: string;
  notLead1: string;
  notLeadStrong: string;
  notRows: NotRow[];
  rows: Row[];
  audiencePrefix: string;
  footerFee: string;
  footerFeeLink: string;
  footerFlow: string;
  footerFlowLink: string;
  footerTail: string;
};

const JA: Copy = {
  metaTitle: "業務案内｜四葉社会保険労務士事務所",
  metaDescription:
    "四葉社会保険労務士事務所（文京区小日向）の取扱業務の一覧です。処遇改善加算のサポート、介護・障害福祉の労務管理、雇用関係助成金、外国人雇用（介護・育成就労）の労務。各業務の内容・料金・受任の流れをご案内します。",
  bcHome: "ホーム",
  bcHere: "業務案内",
  h1: "業務案内",
  leadStrong: "四葉社会保険労務士事務所の取扱業務の一覧です。",
  leadRest: "各業務の詳しい内容・費用・流れは、それぞれのページをご覧ください。",
  flow1: "手続きと給与計算は freee人事労務 で行い、顧問先と同じデータを見ながら進めます。料金は着手前に書面でお出しします。",
  flowLink: "進め方",
  flow2: "に、AIをどこまで使うか（と、使わないところ）を書いています。",
  notTitle: "当事務所が取り扱わない業務",
  notLead1: "下記は社会保険労務士の業務ではありません。その資格をお持ちの方におつなぎします。",
  notLeadStrong: "紹介料の授受は一切行いません。",
  notRows: [
    { w: "年末調整に伴う扶養控除・非課税限度額などの税務判断・税務相談", t: "税理士" },
    { w: "法人登記の変更", t: "司法書士" },
    { w: "離職理由をめぐる争いなど、紛争性が生じた事案", t: "弁護士" },
    { w: "在留資格の申請書類の作成・申請取次／補助金の申請", t: "四葉行政書士事務所（別事業体・別々にご契約いただきます）" },
    { w: "求職者の紹介・あっせん、応募者の面接代行", t: "取り扱っておりません" },
  ],
  rows: [
    { href: "/labor/services/shogu-kaizen", label: "処遇改善加算のサポート", audience: "加算の要件整備・計画・実績報告を任せたい介護・障害福祉事業所" },
    { href: "/labor/services/kaigo-roumu", label: "介護・障害福祉の労務管理", audience: "人員配置基準を踏まえた就業規則・シフト・社会保険手続きが必要な事業所" },
    { href: "/labor/services/jinin-kijun-roumu", label: "障害福祉事業所の人員基準と労務", audience: "常勤換算と就業規則の関係、兼務や体制変更の取り扱いを整理したい事業所" },
    { href: "/labor/services/joseikin", label: "雇用関係助成金の申請", audience: "キャリアアップ助成金等の受給を検討する事業者" },
    { href: "/labor/services/gaikokujin-koyo", label: "外国人雇用（介護・育成就労）の労務", audience: "外国人材の雇用契約・社会保険・受入準備を整えたい事業者" },
    { href: "/labor/services/gaibu-kansanin", label: "外部監査で見られる労務", audience: "育成就労の外部監査に備える監理支援機関・受入企業" },
    { href: "/labor/services/saiyo", label: "募集・採用の労務", audience: "求人票の労働条件と、内定から入社までの書面・手続きを整えたい事業者" },
    // 個人のお客さま向けの対象を明記。
    { href: "/labor/services/shogai-nenkin", label: "障害年金の裁定請求", audience: "障害年金の請求を考えるご本人・ご家族（顧問契約は不要です）" },
  ],
  audiencePrefix: "こんな方に：",
  footerFee: "料金は",
  footerFeeLink: "料金",
  footerFlow: "、依頼の手順は",
  footerFlowLink: "受任の流れ",
  footerTail: "をご覧ください。",
};

const EN: Copy = {
  metaTitle: "Services｜四葉社会保険労務士事務所",
  metaDescription:
    "Services of 四葉社会保険労務士事務所 (Kohinata, Bunkyo City, Tokyo): support for the treatment-improvement addition, labor management for nursing-care and disability-welfare providers, employment-related subsidies, and labor matters for employing foreign nationals (care work and Employment for Skill Development). Each page explains the scope, fees, and process.",
  bcHome: "Home",
  bcHere: "Services",
  h1: "Services",
  leadStrong: "This is the list of services handled by 四葉社会保険労務士事務所.",
  leadRest: "For details, fees, and the process of each service, please see the individual pages.",
  flow1:
    "Procedures and payroll are handled on freee人事労務 (freee's HR & payroll software), working from the same data as the client. Fees are quoted in writing before we start.",
  flowLink: "How we work",
  flow2: " explains how far we use AI — and where we do not.",
  notTitle: "Work this office does not handle",
  notLead1:
    "The following is not the work of a Certified Social Insurance and Labor Consultant. We will refer you to a qualified professional.",
  notLeadStrong: "No referral fees are paid or received.",
  notRows: [
    { w: "Tax judgments and tax advice in the year-end adjustment, such as dependent deductions and non-taxable limits", t: "a licensed tax accountant" },
    { w: "Changes to corporate registration", t: "a judicial scrivener" },
    { w: "Disputes, such as contested reasons for leaving employment", t: "an attorney" },
    { w: "Preparing residence-status application documents / subsidy (hojokin) applications", t: "四葉行政書士事務所 (a separate business entity; contracted separately)" },
    { w: "Introducing or placing job seekers, or interviewing applicants on your behalf", t: "not handled" },
  ],
  rows: [
    { href: "/labor/services/shogu-kaizen", label: "Treatment-improvement addition support", audience: "Nursing-care and disability-welfare providers that want the wage requirements, plans, and reports handled" },
    { href: "/labor/services/kaigo-roumu", label: "Labor management for care and disability welfare", audience: "Providers that need work rules, shifts, and social-insurance procedures aligned with staffing standards" },
    { href: "/labor/services/jinin-kijun-roumu", label: "Staffing standards and labor for disability-welfare offices", audience: "Providers sorting out full-time-equivalent counts, concurrent posts, and staffing changes" },
    { href: "/labor/services/joseikin", label: "Employment-related subsidy applications", audience: "Employers considering the Career-Up Subsidy and similar programs" },
    { href: "/labor/services/gaikokujin-koyo", label: "Labor for employing foreign nationals (care / Employment for Skill Development)", audience: "Employers preparing employment contracts, social insurance, and acceptance arrangements" },
    { href: "/labor/services/gaibu-kansanin", label: "Labor points reviewed in external audits", audience: "Supervising support organizations and host companies preparing for Employment for Skill Development audits" },
    { href: "/labor/services/saiyo", label: "Recruitment and hiring labor matters", audience: "Employers putting job-posting conditions and offer-to-start paperwork in order" },
  ],
  audiencePrefix: "For: ",
  footerFee: "For fees, see ",
  footerFeeLink: "Fees",
  footerFlow: "; for the process, see ",
  footerFlowLink: "How we work",
  footerTail: ".",
};

const ZH_TW: Copy = {
  metaTitle: "業務案內｜四葉社會保險勞務士事務所",
  metaDescription:
    "四葉社會保險勞務士事務所（東京都文京區小日向）的業務一覽：處遇改善加算的支援、介護・障害福祉的勞務管理、僱用相關助成金、外國人僱用（介護・育成就勞）的勞務。各頁說明業務內容、費用與流程。",
  bcHome: "首頁",
  bcHere: "業務案內",
  h1: "業務案內",
  leadStrong: "這是四葉社會保險勞務士事務所的業務一覽。",
  leadRest: "各項業務的詳細內容、費用與流程，請見各自的頁面。",
  flow1: "手續與薪資計算在 freee人事労務 上進行，與顧問客戶看著同一份資料推進。費用在著手前以書面提出。",
  flowLink: "進行方式",
  flow2: "頁面說明了AI用到哪裡（以及不用在哪裡）。",
  notTitle: "本事務所不承辦的業務",
  notLead1: "下列並非社會保險勞務士的業務。我們會為您轉介具備該資格的專業人士。",
  notLeadStrong: "不收取、也不支付任何介紹費。",
  notRows: [
    { w: "年終調整中的扶養扣除・非課稅限度額等稅務判斷與稅務諮詢", t: "稅理士" },
    { w: "法人登記的變更", t: "司法書士" },
    { w: "離職理由的爭議等具紛爭性的案件", t: "律師" },
    { w: "在留資格申請文件的製作・申請取次／補助金申請", t: "四葉行政書士事務所（另一獨立事業體・另行簽約）" },
    { w: "求職者的介紹・斡旋、代辦應徵者面試", t: "不承辦" },
  ],
  rows: [
    { href: "/labor/services/shogu-kaizen", label: "處遇改善加算的支援", audience: "想交辦加算要件整備・計畫・實績報告的介護・障害福祉事業所" },
    { href: "/labor/services/kaigo-roumu", label: "介護・障害福祉的勞務管理", audience: "需要因應人員配置基準的工作規則・排班・社會保險手續的事業所" },
    { href: "/labor/services/jinin-kijun-roumu", label: "障害福祉事業所的人員基準與勞務", audience: "想整理常勤換算與工作規則的關係、兼任與體制變更處理的事業所" },
    { href: "/labor/services/joseikin", label: "僱用相關助成金的申請", audience: "考慮申請career up助成金等的事業主" },
    { href: "/labor/services/gaikokujin-koyo", label: "外國人僱用（介護・育成就勞）的勞務", audience: "想備妥外國人才僱用契約・社會保險・受入準備的事業主" },
    { href: "/labor/services/gaibu-kansanin", label: "外部監查會查核的勞務", audience: "為育成就勞外部監查做準備的監理支援機關・受入企業" },
    { href: "/labor/services/saiyo", label: "招募・錄用的勞務", audience: "想整備徵才條件與內定到入職書面・手續的事業主" },
  ],
  audiencePrefix: "適合：",
  footerFee: "費用請見",
  footerFeeLink: "費用",
  footerFlow: "，委託步驟請見",
  footerFlowLink: "受任流程",
  footerTail: "。",
};

const ZH: Copy = {
  metaTitle: "业务指南｜四葉社会保険労務士事務所",
  metaDescription:
    "四葉社会保険労務士事務所（东京都文京区小日向）的业务一览：处遇改善加算的支援、介护・残障福祉的劳务管理、雇用相关助成金、外国人雇用（介护・育成就劳）的劳务。各页说明业务内容、费用与流程。",
  bcHome: "首页",
  bcHere: "业务指南",
  h1: "业务指南",
  leadStrong: "这是四葉社会保険労務士事務所的业务一览。",
  leadRest: "各项业务的详细内容、费用与流程，请见各自的页面。",
  flow1: "手续与工资计算在 freee人事労務 上进行，与顾问客户看着同一份数据推进。费用在着手前以书面提出。",
  flowLink: "进行方式",
  flow2: "页面说明了AI用到哪里（以及不用在哪里）。",
  notTitle: "本事务所不承办的业务",
  notLead1: "下列并非社会保险劳务士的业务。我们会为您介绍具备该资格的专业人士。",
  notLeadStrong: "不收取、也不支付任何介绍费。",
  notRows: [
    { w: "年终调整中的抚养扣除・非课税限度额等税务判断与税务咨询", t: "税理士" },
    { w: "法人登记的变更", t: "司法书士" },
    { w: "离职理由的争议等具纠纷性的案件", t: "律师" },
    { w: "在留资格申请文件的制作・申请取次／补助金申请", t: "四葉行政書士事務所（另一独立事业体・分别签约）" },
    { w: "求职者的介绍・斡旋、代办应聘者面试", t: "不承办" },
  ],
  rows: [
    { href: "/labor/services/shogu-kaizen", label: "处遇改善加算的支援", audience: "想交办加算要件整备・计划・实绩报告的介护・残障福祉事业所" },
    { href: "/labor/services/kaigo-roumu", label: "介护・残障福祉的劳务管理", audience: "需要按人员配置基准整备就业规则・排班・社会保险手续的事业所" },
    { href: "/labor/services/jinin-kijun-roumu", label: "残障福祉事业所的人员基准与劳务", audience: "想理清常勤换算与就业规则的关系、兼任与体制变更处理的事业所" },
    { href: "/labor/services/joseikin", label: "雇用相关助成金的申请", audience: "考虑申请career up助成金等的事业主" },
    { href: "/labor/services/gaikokujin-koyo", label: "外国人雇用（介护・育成就劳）的劳务", audience: "想备妥外国人才雇用合同・社会保险・接收准备的事业主" },
    { href: "/labor/services/gaibu-kansanin", label: "外部监查会查核的劳务", audience: "为育成就劳外部监查做准备的监理支援机关・接收企业" },
    { href: "/labor/services/saiyo", label: "招聘・录用的劳务", audience: "想整备招聘条件与内定到入职书面・手续的事业主" },
  ],
  audiencePrefix: "适合：",
  footerFee: "费用请见",
  footerFeeLink: "费用",
  footerFlow: "，委托步骤请见",
  footerFlowLink: "受任流程",
  footerTail: "。",
};

const COPY: Record<LangCode, Copy> = { ja: JA, en: EN, "zh-tw": ZH_TW, zh: ZH };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? JA;
  return buildPageMetadata({
    businessKey: "labor",
    title: c.metaTitle,
    description: LABOR_ENGAGEMENT_COPY[locale].description,
    path: "/labor/services",
    locale,
    absoluteTitle: true,
  });
}

export default async function LaborServicesPage() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? JA;
  return (
    <>
      <Breadcrumb items={[{ name: c.bcHome, href: "/labor" }, { name: c.bcHere }]} />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-2">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.h1}</h1>
          <p className="mt-3 leading-relaxed text-text">
            <strong>{c.leadStrong}</strong> {c.leadRest}
          </p>
          <div className="mt-5 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text">
            <LaborStandaloneServices locale={locale} />
            <p className="mt-3">
              {c.flow1}
              <Link href={addLocalePrefix("/labor/nagare", locale)} className="text-primary underline">
                {c.flowLink}
              </Link>
              {c.flow2}
            </p>
          </div>
        </header>

        {/* 取り扱わない業務＝分離受任（shigyo-compliance-gate） */}
        <section className="mt-8">
          <h2 className="border-l-4 border-primary pl-2 font-serif text-lg font-semibold text-ink">
            {c.notTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text">
            {c.notLead1}
            <strong>{c.notLeadStrong}</strong>
          </p>
          <dl className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface text-sm">
            {c.notRows.map((r) => (
              <div key={r.w} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                <dt className="text-text sm:w-1/2">{r.w}</dt>
                <dd className="font-medium text-ink sm:w-1/2">→ {r.t}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6 space-y-3">
          {c.rows.map((r) => (
            <Link
              key={r.href}
              href={addLocalePrefix(r.href, locale)}
              className="block rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
            >
              <div className="font-serif text-lg font-semibold text-ink">{r.label}</div>
              <div className="mt-1 text-sm text-text-muted">
                {c.audiencePrefix}
                {r.audience}
              </div>
            </Link>
          ))}
        </section>

        <p className="mt-6 text-sm">
          {c.footerFee}
          <Link href={addLocalePrefix("/labor/ryokin", locale)} className="text-primary underline">
            {c.footerFeeLink}
          </Link>
          {c.footerFlow}
          <Link href={addLocalePrefix("/labor/nagare", locale)} className="text-primary underline">
            {c.footerFlowLink}
          </Link>
          {c.footerTail}
        </p>
      </main>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="labor" />
      </div>
    </>
  );
}

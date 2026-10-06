// ★参考ページ（型A）＝ /legal/services/company　※原稿_行政書士 #4・共通シェル使用
// 配置＝src/app/(legal)/legal/services/company/page.tsx。クロスリンクはこのページには定義なし（getCrossLinksが空を返す）。
// フェーズI多言語化＝COPY: Record<LangCode,…>＋getRequestLocale方式（手本=/legal page.tsx）。
// en/zh-tw/zh=監修前ドラフト（フェーズI・2026-07-10）。固有名詞（四葉行政書士事務所・浦松丈二・登録番号）は全ロケール同一表記。
// serviceName＝JSON-LD Service name（非可視）のためja固定。Placeholder＝内部メモのためja固定・全ロケール共通位置。
import { NonresidentCompanyServices } from "@/components/legal/NonresidentCompanyReview";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import Link from "next/link";
import { LegalServicePage, H2 } from "@/components/shared/LegalServicePage";
import { Placeholder } from "@/components/shared/Placeholder";
import type { LangCode } from "@/config/languages";

type CompanyCopy = {
  metaTitle: string;
  metaDesc: string;
  crumbLabel: string;
  heroAlt: string;
  h1: string;
  lead: React.ReactNode; // <strong>入り本文（Placeholderは構造側で共通挿入）
  internalLinks: { href: string; label: string }[];
  s1Heading: string;
  s1Body: string;
  s1Note: string; // 末尾「→」まで含む（直後にリンク）
  s1NoteLinkLabel: string;
  s2Heading: string;
  s2Body: React.ReactNode;
  s2LinkLabel: string;
  s3Heading: string;
  s3Link1Label: string;
  s3Link2Label: string;
};

const COPY: Record<LangCode, CompanyCopy> = {
  ja: {
    metaTitle: "会社設立・各種許認可｜四葉行政書士事務所",
    metaDesc:
      "株式会社・合同会社の設立書類と各種許認可申請を、文京区の四葉行政書士事務所が支援します。海外に住み続ける場合と、日本に住むため在留資格も必要な場合を分けて相談できます。中国語・英語にも対応します。",
    crumbLabel: "会社設立・各種許認可",
    heroAlt: "会社設立・許認可のイメージ（オフィスと設立書類）",
    h1: "会社設立・各種許認可",
    lead: (
      <>
        会社設立の書類作成（定款等）と各種許認可の申請は、<strong>行政書士に依頼できます</strong>。四葉行政書士事務所は、株式会社・合同会社の設立書類の作成と、事業に必要な許認可申請を扱います。<strong>登記申請は司法書士の領域</strong>のため、連携しておつなぎします。
      </>
    ),
    internalLinks: [
      { href: "/legal/ryokin", label: "報酬額表" },
      { href: "/legal/nagare", label: "受任の流れ" },
      { href: "/legal/services/visa", label: "在留資格・ビザ申請" },
      { href: "/legal/services/shogai-fukushi", label: "障害福祉サービスの指定申請" },
      // 2026-07-24：定点#15強化（内部リンク補強）。ja本文のみ追加＝/officeはja先行公開のため他ロケールは対象外。
      { href: "/office", label: "会社設立とオフィス開設の完全ガイド（四葉不動産）" },
    ],
    s1Heading: "どんな許認可に対応していますか？",
    s1Body: "事業に必要な許認可はご相談ください。",
    s1Note: "障害福祉サービスの事業者指定は、専用ページで詳しく解説しています →",
    s1NoteLinkLabel: "障害福祉サービスの指定申請",
    s2Heading: "海外に住んだままの設立と、在留資格の相談は分けられますか？",
    s2Body: (
      <>
        <strong>海外に住み続ける方</strong>は、事業内容・設立希望時期をもとに、会社設立の準備事項を整理します。<strong>日本で暮らす予定があり、在留資格も必要な方</strong>は、会社設立の相談と在留資格の相談を分けて、順序や確認事項を整理します。日本に住む予定が未定でもご相談いただけます。個別の可否は資格者が確認します。口座開設・許認可・在留資格の取得を保証するものではありません。中国語・英語でも相談できます。
      </>
    ),
    s2LinkLabel: "在留資格・ビザ申請の業務内容",
    s3Heading: "費用・受任の流れ",
    s3Link1Label: "会社設立・許認可の報酬額（報酬額表）",
    s3Link2Label: "ご相談から完了までの受任の流れ",
  },
  en: {
    metaTitle: "Company Formation & Licensing｜四葉行政書士事務所",
    metaDesc:
      "四葉行政書士事務所 in Bunkyo, Tokyo supports incorporation documents and business licence applications. Consult about forming a company while remaining overseas, or formation with a Japanese residence status. Chinese and English consultations are available.",
    crumbLabel: "Company Formation & Licensing",
    heroAlt: "Company formation and licensing—an office and incorporation documents",
    h1: "Company Formation & Licensing",
    lead: (
      <>
        Preparing company formation documents (such as the articles of incorporation) and filing license applications are <strong>work you can entrust to a gyoseishoshi (administrative scrivener)</strong>. 四葉行政書士事務所 prepares incorporation documents for kabushiki kaisha (K.K.) and godo kaisha (LLC) companies and handles the license applications your business needs. <strong>Filing the registration itself is the domain of the shiho-shoshi (judicial scrivener)</strong>, so we coordinate with one to connect you.
      </>
    ),
    internalLinks: [
      { href: "/legal/ryokin", label: "Fees" },
      { href: "/legal/nagare", label: "How Engagement Works" },
      { href: "/legal/services/visa", label: "Visa & Residence Status" },
      { href: "/legal/services/shogai-fukushi", label: "Disability-Welfare Service Designation" },
    ],
    s1Heading: "What licenses and permits do you handle?",
    s1Body: "Please consult us about any license or permit your business requires.",
    s1Note: "Designation as a disability-welfare service provider is explained in detail on its own page →",
    s1NoteLinkLabel: "Disability-Welfare Service Designation",
    s2Heading: "Can I consult about formation while remaining overseas, or formation with residence status?",
    s2Body: (
      <>
        <strong>If you plan to remain overseas</strong>, we discuss preparation for company formation based on your business activity and desired timing. <strong>If you plan to live in Japan and also need a residence status</strong>, we distinguish formation from residence status consultation and organize the sequence and matters to check. You can also consult if your plans are undecided. A qualified professional reviews each case. Bank account opening, business licences and residence status approvals are not guaranteed. Consultations are available in Chinese and English.
      </>
    ),
    s2LinkLabel: "Details of our visa & residence status services",
    s3Heading: "Fees & How Engagement Works",
    s3Link1Label: "Fees for company formation & licensing (fee schedule)",
    s3Link2Label: "From first consultation to completion—how engagement works",
  },
  "zh-tw": {
    metaTitle: "公司設立・各類許可｜四葉行政書士事務所",
    metaDesc:
      "東京文京區的四葉行政書士事務所協助製作株式會社・合同會社的設立文件及申請各類許可。可分別諮詢繼續居住海外的公司設立，以及計畫在日本居住且需要在留資格的情況。亦可用中文・英文諮詢。",
    crumbLabel: "公司設立・各類許可",
    heroAlt: "公司設立・許可申請的示意圖（辦公室與設立文件）",
    h1: "公司設立・各類許可",
    lead: (
      <>
        公司設立文件（章程等）的製作與各類許可的申請，<strong>可以委託行政書士辦理</strong>。四葉行政書士事務所承辦株式會社・合同會社的設立文件製作，以及事業所需的各類許可申請。<strong>登記申請屬於司法書士的執業範圍</strong>，我們會與合作的司法書士協同，為您銜接。
      </>
    ),
    internalLinks: [
      { href: "/legal/ryokin", label: "報酬額表" },
      { href: "/legal/nagare", label: "受任流程" },
      { href: "/legal/services/visa", label: "在留資格（簽證）申請" },
      { href: "/legal/services/shogai-fukushi", label: "障礙福祉服務指定申請" },
    ],
    s1Heading: "可以受理哪些許可申請？",
    s1Body: "事業所需的各類許可，歡迎與我們洽詢。",
    s1Note: "障礙福祉服務的事業者指定，另設專頁詳細說明 →",
    s1NoteLinkLabel: "障礙福祉服務指定申請",
    s2Heading: "可以分別諮詢居住海外的公司設立與在留資格嗎？",
    s2Body: (
      <>
        <strong>計畫繼續居住海外者</strong>，我們會依事業內容及希望設立時期，整理公司設立的準備事項。<strong>計畫在日本居住且需要在留資格者</strong>，則分別整理公司設立與在留資格諮詢的順序及確認事項。居住計畫未定也可諮詢。個別可否由具資格的專業人士確認，不保證銀行開戶、許可或在留資格獲准。亦可用中文・英文諮詢。
      </>
    ),
    s2LinkLabel: "在留資格（簽證）申請的業務內容",
    s3Heading: "費用・受任流程",
    s3Link1Label: "公司設立・許可申請的報酬額（報酬額表）",
    s3Link2Label: "從諮詢到完成的受任流程",
  },
  zh: {
    metaTitle: "公司设立・各类许可｜四葉行政書士事務所",
    metaDesc:
      "东京文京区的四葉行政書士事務所协助制作株式会社・合同会社的设立文件及申请各类许可。可分别咨询继续居住海外的公司设立，以及计划在日本居住且需要在留资格的情况。亦可用中文・英文咨询。",
    crumbLabel: "公司设立・各类许可",
    heroAlt: "公司设立・许可申请的示意图（办公室与设立文件）",
    h1: "公司设立・各类许可",
    lead: (
      <>
        公司设立文件（章程等）的制作与各类许可的申请，<strong>可以委托行政书士办理</strong>。四葉行政書士事務所承办株式会社・合同会社的设立文件制作，以及事业所需的各类许可申请。<strong>登记申请属于司法书士的执业范围</strong>，我们会与合作的司法书士协同，为您衔接。
      </>
    ),
    internalLinks: [
      { href: "/legal/ryokin", label: "报酬额表" },
      { href: "/legal/nagare", label: "受任流程" },
      { href: "/legal/services/visa", label: "在留资格（签证）申请" },
      { href: "/legal/services/shogai-fukushi", label: "残障福祉服务指定申请" },
    ],
    s1Heading: "可以受理哪些许可申请？",
    s1Body: "事业所需的各类许可，欢迎向我们咨询。",
    s1Note: "残障福祉服务的事业者指定，另设专页详细说明 →",
    s1NoteLinkLabel: "残障福祉服务指定申请",
    s2Heading: "可以分别咨询居住海外的公司设立与在留资格吗？",
    s2Body: (
      <>
        <strong>计划继续居住海外者</strong>，我们会根据业务内容及希望设立时间，整理公司设立的准备事项。<strong>计划在日本居住且需要在留资格者</strong>，则分别整理公司设立与在留资格咨询的顺序及确认事项。居住计划未定也可咨询。个别可否由具资格的专业人士确认，不保证银行开户、许可或在留资格获批。亦可用中文・英文咨询。
      </>
    ),
    s2LinkLabel: "在留资格（签证）申请的业务内容",
    s3Heading: "费用・受任流程",
    s3Link1Label: "公司设立・许可申请的报酬额（报酬额表）",
    s3Link2Label: "从咨询到完成的受任流程",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return buildPageMetadata({
    businessKey: "legal",
    title: c.metaTitle,
    description: c.metaDesc,
    path: "/legal/services/company",
    locale,
    absoluteTitle: true,
  });
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return (
    <LegalServicePage
      slug="company"
      crumbLabel={c.crumbLabel}
      serviceName="会社設立書類の作成・各種許認可申請の支援"
      heroAlt={c.heroAlt}
      h1={c.h1}
      lead={
        <p>
          {c.lead}
          <Placeholder reason="浦松＝対応する許認可種別の確定／石井弁護士＝業際表現" />
        </p>
      }
      internalLinks={c.internalLinks}
      ctaVariant="company"
    >
      <div>
        <H2>{c.s1Heading}</H2>
        <p className="mt-3 leading-relaxed text-text">
          {c.s1Body}
          <Placeholder reason="浦松＝対応許認可の確定（建設業・宅建業・古物・飲食・産廃 等）。確定までは「事業に必要な許認可はご相談ください」の一般表現で公開" />
        </p>
        <p className="mt-2 text-sm">
          {c.s1Note}{" "}
          <Link href={addLocalePrefix("/legal/services/shogai-fukushi", locale)} className="text-primary underline">{c.s1NoteLinkLabel}</Link>
        </p>
      </div>

      <div>
        <H2>{c.s2Heading}</H2>
        <p className="mt-3 leading-relaxed text-text">{c.s2Body}</p>
        <p className="mt-2 text-sm">
          → <Link href={addLocalePrefix("/legal/services/visa", locale)} className="text-primary underline">{c.s2LinkLabel}</Link>
        </p>
      </div>

      <NonresidentCompanyServices locale={locale} />

      <div>
        <H2>{c.s3Heading}</H2>
        <p className="mt-2 text-sm">
          → <Link href={addLocalePrefix("/legal/ryokin", locale)} className="text-primary underline">{c.s3Link1Label}</Link>
          <Placeholder reason="Notion＝料金体系・金額（報酬額表_HP公開用が正）" />
        </p>
        <p className="mt-1 text-sm">
          → <Link href={addLocalePrefix("/legal/nagare", locale)} className="text-primary underline">{c.s3Link2Label}</Link>
          <Placeholder reason="浦松＝各ステップの実運用・標準期間" />
        </p>
      </div>
    </LegalServicePage>
  );
}

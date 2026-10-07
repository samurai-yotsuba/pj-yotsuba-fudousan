import { familyTrustFaq } from "@/lib/legal/family-trust-copy";
import { BCP47_BY_LOCALE } from "@/lib/seo";

// ★参考ページ（型B・FAQ）＝ /legal/faq　※原稿_行政書士 #9・A-3の Faq 部品を使用
// 配置＝src/app/(legal)/legal/faq/page.tsx。Faq が FAQPage JSON-LD を出力／Breadcrumb が BreadcrumbList を出力。
// HTMLと構造化データ完全一致（同じ items から生成）。【要確認】の相談料・オンライン完結は"断定しない安全文"にしてある。
// フェーズI多言語化（2026-07-10）：COPY: Record<LangCode,…>＋getRequestLocale 方式（手本= /legal トップ）。
// en/zh-tw/zh=監修前ドラフト（フェーズI・2026-07-10）。
// 業際：全ロケールで「助成金」の字・直訳を出さない（「補助金」のみ／en=subsidy）。旧Q7原文は下の退避コメント参照（削除ではない・復元判断は委任者）。
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Faq, type FaqItem } from "@/components/shared/Faq";
import { CtaBand } from "@/components/shared/CtaBand";
import { SR_OFFICE_NAME } from "@/lib/shared/sr-name";
import type { LangCode } from "@/config/languages";
import { SR_BIO } from "@/lib/shared/sr-label";

// 社労士は2026年9月開業予定。受任できると読める現在形は SR_LAUNCHED の内側にのみ置く
// （/reasons と同じ扱い。事務所名は必ず SR_OFFICE_NAME 経由で取得する）
const SR_LAUNCHED = process.env.NEXT_PUBLIC_SR_LAUNCHED === "true";
const A_SR_JA = SR_LAUNCHED
  ? `承ります。労働・社会保険の手続き、就業規則をはじめとする社内規程の作成、労務管理のご相談は、併設の${SR_OFFICE_NAME}が別契約・別料金で受任します。行政書士業務とは契約が分かれます。`
  : `現時点では承れません。労働・社会保険の手続きは社会保険労務士の業務で、${SR_OFFICE_NAME}は2026年9月の開業を予定しています（現時点では未開業）。開業前のご相談内容は、開業後にあらためてご案内します。行政書士業務として補助金の申請サポートには対応しています。`;

type FaqPageCopy = {
  metaTitle: string;
  metaDesc: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  heading: string;
  items: FaqItem[];
};

// ※【要確認：浦松】の項目は、事実確定後に文言を差し替える（相談料の有無／オンライン完結の範囲）。
//   現状は"断定しない一般表現"で公開可能な形にしてある（未検証を出力しない原則）。
// 【要確認：委任者判断】旧Q7原文の退避（「助成金」→補助金限定への書き換えに伴う。削除ではない。社労士業務への言及を含むため公開文からは外した）：
//   q: 雇用関係の助成金も頼めますか？
//   a: 雇用関係の助成金は社会保険労務士の領域です。代表は社会保険労務士試験に合格しており（2026年9月開業予定）、
//      開業後の対応を予定しています。現在は行政書士業務として補助金の申請サポートに対応します。
const COPY: Record<LangCode, FaqPageCopy> = {
  ja: {
    metaTitle: "よくある質問｜四葉行政書士事務所",
    metaDesc:
      "四葉行政書士事務所への「相談は無料か」「中国語・英語で相談できるか」「障害福祉の指定申請を頼めるか」などのよくある質問に、一問一答でお答えします。文京区小日向・茗荷谷駅徒歩5分。お気軽にご相談ください。",
    breadcrumbHome: "ホーム",
    breadcrumbCurrent: "よくある質問",
    heading: "よくある質問",
    items: [
      {
        q: "相談は無料ですか？",
        a: "ご相談は無料です（初回・2回目以降とも）。文京区小日向（東京メトロ丸ノ内線「茗荷谷」駅 徒歩5分）とオンラインで承ります。料金がかかる場合は見積もりを提示します。",
      },
      {
        q: "中国語や英語で相談できますか？",
        a: "できます。四葉行政書士事務所の代表・浦松丈二は元毎日新聞中国総局長で、日本語・英語・中国語（繁体字・簡体字）での相談に対応します。",
      },
      {
        q: "障害福祉サービスの指定申請を頼めますか？",
        a: "頼めます。グループホーム・放課後等デイサービス等の指定申請、前提となる法人設立、指定後の加算届・運営支援まで対応します。詳細は「障害福祉サービスの指定申請」ページをご覧ください。",
      },
      {
        q: "会社設立で行政書士に頼めることと、司法書士との違いは？",
        a: "定款作成などの設立書類は行政書士、法務局への登記申請は司法書士の領域です。四葉行政書士事務所は設立書類の作成を担い、登記は連携する司法書士におつなぎします。",
      },
      {
        q: "相続では何をしてもらえますか？",
        a: "遺産分割協議書の作成、遺言書の起案、戸籍等の収集を行います。相続登記は司法書士、相続税は税理士におつなぎします。相続した不動産の管理・活用・売却は、関連事業の四葉不動産株式会社（別事業体・独立受任）が対応します。",
      },
      {
        q: "不動産の売買や賃貸も一緒に相談できますか？",
        a: "宅地建物取引業は、関連事業の四葉不動産株式会社が別の事業体として独立して受任します（紹介料等の授受はありません）。ご相談の入口は共通です。",
      },
      {
        q: "補助金の申請も頼めますか？",
        a: "頼めます。行政書士業務として補助金の申請サポートに対応します。対応できる制度の範囲は、事案ごとにご案内します。",
      },
      {
        q: "オンラインだけで手続きは完結しますか？",
        a: "オンラインでのご相談に幅広く対応します。手続きによっては書面・郵送が必要な場合があり、その範囲は事案ごとにご案内します。",
      },
      // 2026-08-11 追加：転換側（依頼を決める前に確かめたいこと）の8問。
      // 新しい事実は足していない。報酬額表＝/legal/ryokin、手順＝/legal/nagare、
      // 各業務＝/legal/services/* に記載のある内容を、質問の言葉で引き直している。
      {
        q: "報酬はいくらですか？いつ払いますか？",
        a: "業務ごとの報酬額表を公開しています。ご相談のうえで業務範囲と報酬を書面でご提示し、内容にご納得いただいてから契約する順序です。契約前に金額が確定しないまま作業を進めることはありません。実費（証明書の取得費用、登録免許税など）は報酬とは別にご負担いただきます。",
        links: [{ href: "/legal/ryokin", label: "行政書士業務の報酬額表" }],
      },
      {
        q: "見積もりの前に費用はかかりますか？",
        a: "かかりません。ご相談は初回・2回目以降とも無料で、お見積りの提示までに費用は発生しません。見積りをご覧になってお断りいただいても構いません。",
      },
      {
        q: "依頼してから完了まで、どのくらいかかりますか？",
        a: "業務によって大きく異なります。行政庁の審査期間はこちらで短縮できないため、標準的な所要期間は業務ごとにご案内します。期限が決まっている場合は、逆算して着手日を決めますので、最初にお伝えください。",
        links: [{ href: "/legal/nagare", label: "ご相談から完了までの流れ" }],
      },
      {
        q: "在留資格（ビザ）の申請も頼めますか？",
        a: "頼めます。在留資格の認定・変更・更新、永住、帰化の各申請に対応します。申請取次の届出をした行政書士が本人に代わって申請書を提出できます。中国語・英語での相談にも対応します。",
        links: [{ href: "/legal/services/visa", label: "在留資格・帰化" }],
      },
      {
        q: "外国人スタッフの受け入れについて、会社側の相談もできますか？",
        a: "できます。採用する会社の側から見た、在留資格の確認、雇用契約と在留資格の整合、期限の管理といったご相談に対応します。ご本人が申請する立場でのご相談とは論点が違うため、ページを分けています。",
        links: [{ href: "/legal/services/gaikokujin-shain", label: "外国人社員の受け入れ" }],
      },
      {
        q: "育成就労の外部監査人を頼めますか？",
        a: "2027年4月の施行に向けて、ご予約を承っています。制度の開始前のため現時点で就任の契約は締結できませんが、要件の確認とご準備のご相談には対応します。報酬は事案ごとのお見積りです。",
        links: [{ href: "/legal/services/ikuseishuro-gaibu-kansa", label: "育成就労の外部監査人" }],
      },
      {
        q: "労働・社会保険の手続き（社会保険労務士の業務）も頼めますか？",
        a: A_SR_JA,
      },
      {
        q: "税金や登記、もめている件も頼めますか？",
        a: "いずれも行政書士の業務ではありません。税務の申告と代理は税理士、登記の申請は司法書士、紛争性のある事案の代理は弁護士の業務です。当事務所では行いません。ご相談の内容に応じて専門家をおつなぎしますが、ご本人と直接ご契約いただく形で、当事務所が紹介料を受け取ることも、お支払いすることもありません。",
      },
    ],
  },
  en: {
    metaTitle: "FAQ｜四葉行政書士事務所 — Gyoseishoshi (Administrative Scrivener) Office in Bunkyo, Tokyo",
    metaDesc:
      "Answers to frequently asked questions about 四葉行政書士事務所 (Yotsuba Gyoseishoshi Office): Are consultations free? Can I consult in Chinese or English? Can you handle disability-welfare service designation? Kohinata, Bunkyo-ku, Tokyo — a 5-minute walk from Myogadani Station. Feel free to contact us.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "FAQ",
    heading: "Frequently Asked Questions",
    items: [
      {
        q: "Are consultations free?",
        a: "Yes — consultations are free of charge, the first and every one thereafter. Consultations are available at our office in Kohinata, Bunkyo-ku (a 5-minute walk from Myogadani Station on the Tokyo Metro Marunouchi Line) or online. If a fee should apply, we will present a quotation.",
      },
      {
        q: "Can I consult in Chinese or English?",
        a: "Yes. 浦松丈二 (Joji Uramatsu), the representative of 四葉行政書士事務所 and a former China General Bureau Chief of the Mainichi Shimbun, handles consultations in Japanese, English, Traditional Chinese, and Simplified Chinese.",
      },
      {
        q: "Can you handle designation applications for disability-welfare services?",
        a: "Yes. We handle designation applications for group homes, after-school day services, and other disability-welfare services — together with the company formation that precedes them, and post-designation filings for additional service fees (kasan) and operational support. See the “Disability-Welfare Service Designation” page for details.",
      },
      {
        q: "For company formation, what can a gyoseishoshi do, and how is that different from a judicial scrivener?",
        a: "Incorporation documents such as the articles of incorporation are the domain of a gyoseishoshi (administrative scrivener), while registration filings with the Legal Affairs Bureau belong to a judicial scrivener (shiho-shoshi). 四葉行政書士事務所 prepares the incorporation documents and refers the registration to a judicial scrivener.",
      },
      {
        q: "What can you do for inheritance matters?",
        a: "We prepare estate-division agreements, draft wills, and collect family-register (koseki) and related records. Inheritance registration is referred to a judicial scrivener, and inheritance tax to a licensed tax accountant. Management, use, and sale of inherited real estate are handled by 四葉不動産株式会社 (Yotsuba Fudosan, our affiliated real-estate company) — a separate entity that accepts engagements independently.",
      },
      {
        q: "Can I also consult about buying, selling, or leasing real estate?",
        a: "Yes. Licensed real-estate brokerage is handled by 四葉不動産株式会社 (Yotsuba Fudosan), an affiliated but separate entity that accepts engagements independently (no referral fees are exchanged). Your first inquiry can start in one place.",
      },
      {
        q: "Can you help with subsidy applications?",
        a: "Yes. As part of our gyoseishoshi work, we provide subsidy application support. The range of programs we can assist with is confirmed for each case.",
      },
      {
        q: "Can everything be completed online?",
        a: "We handle a wide range of consultations online. Some procedures still require paper documents or postal filing; we will explain what applies in your case.",
      },
    ],
  },
  "zh-tw": {
    metaTitle: "常見問題｜四葉行政書士事務所",
    metaDesc:
      "關於四葉行政書士事務所的常見問題——「諮詢是否免費」「可否用中文・英文諮詢」「可否委託障礙福祉服務的指定申請」等，以一問一答方式回答。文京區小日向・茗荷谷站步行5分鐘。歡迎隨時諮詢。",
    breadcrumbHome: "首頁",
    breadcrumbCurrent: "常見問題",
    heading: "常見問題",
    items: [
      {
        q: "諮詢是免費的嗎？",
        a: "諮詢免費（初次與第2次以後皆同）。可在文京區小日向（東京Metro丸之內線「茗荷谷」站步行5分鐘）的事務所或線上進行。如需收費，將提出報價。",
      },
      {
        q: "可以用中文或英文諮詢嗎？",
        a: "可以。四葉行政書士事務所代表・浦松丈二曾任每日新聞中國總局長，可用日文、英文、中文（繁體・簡體）提供諮詢。",
      },
      {
        q: "可以委託障礙福祉服務的指定申請嗎？",
        a: "可以。從團體家屋、放學後等日間服務（放課後等デイサービス）等的指定申請、作為前提的法人設立，到指定後的加算申報與營運支援，均可對應。詳情請參閱「障礙福祉服務指定申請」頁面。",
      },
      {
        q: "公司設立可以委託行政書士做什麼？與司法書士有何不同？",
        a: "章程（定款）製作等設立文件屬行政書士的業務範圍，向法務局申請登記則屬司法書士的領域。四葉行政書士事務所負責設立文件的製作，登記部分將為您轉介合作的司法書士。",
      },
      {
        q: "繼承方面可以請你們做什麼？",
        a: "我們負責遺產分割協議書的製作、遺囑的起草，以及戶籍等文件的蒐集。繼承登記將轉介司法書士，繼承稅（日本相續稅）的申報將轉介稅理士。繼承之不動產的管理、活用與出售，由關聯事業・四葉不動産株式会社（另一事業體・獨立受任）對應。",
      },
      {
        q: "不動產的買賣或租賃也可以一起諮詢嗎？",
        a: "可以。不動產買賣・租賃業務（宅地建物取引業）由關聯事業・四葉不動産株式会社作為另一事業體獨立受任（不收受介紹費等）。諮詢的入口是共同的。",
      },
      {
        q: "也可以委託補助金申請嗎？",
        a: "可以。作為行政書士業務，我們提供補助金申請支援。可對應的制度範圍，將依個案為您說明。",
      },
      {
        q: "手續可以只透過線上完成嗎？",
        a: "我們廣泛提供線上諮詢。部分手續仍可能需要書面文件或郵寄，具體範圍將依個案為您說明。",
      },
    ],
  },
  zh: {
    metaTitle: "常见问题｜四葉行政書士事務所",
    metaDesc:
      "关于四葉行政書士事務所的常见问题——「咨询是否免费」「可否用中文・英文咨询」「可否委托残障福祉服务的指定申请」等，以一问一答方式回答。文京区小日向・茗荷谷站步行5分钟。欢迎随时咨询。",
    breadcrumbHome: "首页",
    breadcrumbCurrent: "常见问题",
    heading: "常见问题",
    items: [
      {
        q: "咨询是免费的吗？",
        a: "咨询免费（首次与第2次以后均相同）。可在文京区小日向（东京Metro丸之内线「茗荷谷」站步行5分钟）的事务所或线上进行。如需收费，将提出报价。",
      },
      {
        q: "可以用中文或英文咨询吗？",
        a: "可以。四葉行政書士事務所代表・浦松丈二曾任每日新闻中国总局长，可用日语、英语、中文（繁体・简体）提供咨询。",
      },
      {
        q: "可以委托残障福祉服务的指定申请吗？",
        a: "可以。从团体家屋、放学后等日间服务（放課後等デイサービス）等的指定申请、作为前提的法人设立，到指定后的加算申报与运营支援，均可对应。详情请参阅「残障福祉服务指定申请」页面。",
      },
      {
        q: "公司设立可以委托行政书士做什么？与司法书士有何不同？",
        a: "章程（定款）制作等设立文件属行政书士的业务范围，向法务局申请登记则属司法书士的领域。四葉行政書士事務所负责设立文件的制作，登记部分将为您转介合作的司法书士。",
      },
      {
        q: "继承方面可以请你们做什么？",
        a: "我们负责遗产分割协议书的制作、遗嘱的起草，以及户籍等文件的收集。继承登记将转介司法书士，继承税（日本相续税）的申报将转介税理士。继承的不动产的管理、活用与出售，由关联事业・四葉不動産株式会社（另一事业体・独立受任）对应。",
      },
      {
        q: "不动产的买卖或租赁也可以一起咨询吗？",
        a: "可以。不动产买卖・租赁业务（宅地建物取引业）由关联事业・四葉不動産株式会社作为另一事业体独立受任（不收受介绍费等）。咨询的入口是共同的。",
      },
      {
        q: "也可以委托补助金申请吗？",
        a: "可以。作为行政书士业务，我们提供补助金申请支援。可对应的制度范围，将依个案为您说明。",
      },
      {
        q: "手续可以只通过线上完成吗？",
        a: "我们广泛提供线上咨询。部分手续仍可能需要书面文件或邮寄，具体范围将依个案为您说明。",
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return buildPageMetadata({
    businessKey: "legal",
    title: c.metaTitle,
    description: c.metaDesc,
    path: "/legal/faq",
    locale,
    absoluteTitle: true,
  });
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return (
    <>
      <Breadcrumb items={[{ name: c.breadcrumbHome, href: "/legal" }, { name: c.breadcrumbCurrent }]} />
      {/* FAQPage JSON-LD はこの専用ページのみ出力（委任§4-6） */}
      <Faq items={[...c.items, ...familyTrustFaq(locale)]} heading={c.heading} headingLevel="h1" withJsonLd inLanguage={BCP47_BY_LOCALE[locale]} />
      <div className="mx-auto max-w-3xl px-4 pb-8">
        {/* 署名（E-E-A-T・原稿サイト共通）＝ja固定のまま残置。社労士資格の記載を含むためCOPY化（翻訳）は委任者判断待ち（CtaBand同様フェーズI残課題） */}
        <aside className="mt-2 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
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
        <CtaBand businessKey="legal" />
      </div>
    </>
  );
}

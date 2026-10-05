import { RentalEntry } from "@/components/bukken/RentalEntry";
import { CustomerVoicesPreview } from "@/components/shared/CustomerVoices";
import Image from "next/image";
// /（型F・二本柱トップ）本文＝原稿_不動産 #1（E-1差し戻し対応・2026-07-10）
// 【差し戻し対応の要点】
//  1. i18n退行禁止：トップは既存が多言語＝新セクションのコピーを ja/en/zh-tw/zh の4ロケール分、
//     コード内ロケールマップ（COPY）で保持。Firestore翻訳データは書き換えない（浦松承認事項のため）。
//     ※en/zh-tw/zh訳はFable作成＝フェーズIの監修対象（繁体字は台湾コラム定訳準拠：不動產・繼承・文京區・團體家屋）。
//  2. 社名保護：H1は全ロケールで先頭に「四葉不動産」（社名はブランド＝各言語同一表記）。
//  3. 既存タグライン（realestate.home.heroTitle1-3＝Firestore翻訳・各locale値あり）はサブコピーへ移設（t()参照＝退行なし）。
//  4. 旧トップ（3強み/サービス概要/代表メッセージ/アクセス構成）は本ファイルから撤去＝原稿#1構成へ全面置換。
// 【1ページ1LINKA】本文の60秒診断枠がLINKA＝右下FABなし（TenantLayoutShell側でsuppressed）。
// AI接続（/api/linka）はフェーズK＝「準備中」明記（優良誤認回避）。
// JSON-LD＝layoutの OrganizationJsonLd／WebSiteJsonLd が出力済み＝ここでは出さない（@id重複防止）。
// 2026-07-24 CTA刷新v2.1（浦松指摘「トップの希望条件メッセージが弱い」対応）：
//   - 末尾のインラインCTA帯を共通CtaBand（variant="property-general"）に置換。
//     旧インライン版は「共通CtaBandがja固定」時代の産物＝現在は4ロケール対応のため一本化。
//     テンプレコピー・信頼行・GA計測・contactの?intent=bukkenがトップにも効く。
//   - 60秒診断：LINKA挨拶に条件インテークの誘いを追記し、チップ「物件の希望条件を伝える」を追加
//     （LINKA側はpropertyIntake＋joken実装済み＝条件を整理してコピー→LINE導線につながる）。
import Link from "next/link";
import { LazyLinkaWidget } from "@/components/linka/LazyLinkaWidget";
import { CtaBand } from "@/components/shared/CtaBand";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { fetchTranslations } from "@/lib/getTranslationData";
import { getNestedValue } from "@/lib/seo";
import { getLatestColumns, getLocalizedColumn } from "@/lib/columns";
import type { LangCode } from "@/config/languages";
import { SR_BIO } from "@/lib/shared/sr-label";

const HOME_COLUMNS_HEADING: Record<LangCode, { title: string; all: string }> = {
  ja: { title: "お役立ちコラム", all: "コラム一覧へ" },
  en: { title: "Helpful Columns", all: "View all columns" },
  "zh-tw": { title: "實用專欄", all: "查看所有專欄" },
  zh: { title: "实用专栏", all: "查看所有专栏" },
};

type PillarCopy = { tag: string; title: string; body: string; anchor: string };
type QaCopy = { q: string; a: string; anchor: string };
type TopCopy = {
  heroAlt: string;
  h1: string;
  intro: React.ReactNode;
  pillars: [PillarCopy, PillarCopy, PillarCopy];
  pillarHrefs: [string, string, string];
  diagnosisH2: string;
  diagnosisChips: { href: string; label: string }[];
  diagnosisNote: string;
  repAlt: string;
  repName: string;
  repBio: string;
  profileLabel: string;
  qa: QaCopy[];
  qaHrefs: string[];
  nav: { href: string; label: string }[];
  // CTA帯の文言（ctaHeading/ctaLead/lineBtn/contactBtn/telBtn/accessLine）は2026-07-24 v2.1で削除
  // ＝共通CtaBand（variant="property-general"・4ロケール）へ一本化。
};

const PILLAR_HREFS: [string, string, string] = ["/souzoku", "/toushi", "/global"];
// 2026-07-22：GHのトップ導線を開設ピラー /group-home（物件＋指定申請の完全ガイド）へ。物件 spoke /toushi/group-home は他ページから継続被リンク。
const QA_HREFS = ["/souzoku", "/group-home", "/global", "/about"];
// 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：5問目＝売主向け入口（相続以外・海外在住も）。
// /nagare は ja 先行（sitemap.ts locales:["ja"]）のため ja だけ /nagare、en/zh-tw/zh は4ロケール実在の /leaving-japan へ。
const QA_HREFS_JA = [...QA_HREFS, "/nagare"];
const QA_HREFS_INTL = [...QA_HREFS, "/leaving-japan"];

const COPY: Record<LangCode, TopCopy> = {
  ja: {
    heroAlt: "文京区・播磨坂の桜並木のイメージ",
    h1: "四葉不動産｜文京区で、相続の不動産と投資・事業用の不動産を。",
    intro: (
      <>
        <strong>四葉不動産株式会社は、東京都文京区小日向の不動産会社です。</strong>
        親から受け継いだ家をどうするか。グループホームや社宅に使う物件をどう確保するか。——文京区・茗荷谷の地元で、元新聞記者の宅建士・行政書士である代表が、最初の一歩からお手伝いします。外国人の方のお部屋探しも、日本語・英語・中国語（繁体字・簡体字）で対応します。
      </>
    ),
    pillars: [
      {
        tag: "承継するには？",
        title: "相続した不動産、どうする？",
        body: "出口は「管理・活用・売却」の3つ。期限のある相続登記から出口の選び方まで、1本のガイドに整理しました。",
        anchor: "文京区で不動産を相続したら——完全ガイド",
      },
      {
        tag: "物件を探すには？",
        title: "投資用・事業用の不動産を探す",
        body: "グループホーム物件・社宅・収益物件を、事業の目的から逆算してご提案します。",
        anchor: "投資用・事業用不動産",
      },
      {
        tag: "日本で暮らすには？",
        title: "外国人のお部屋探し",
        body: "必要な書類を集めて、翻訳するサポートもさせていただきます。",
        anchor: "外国人・多言語のお部屋探し",
      },
    ],
    pillarHrefs: PILLAR_HREFS,
    diagnosisH2: "60秒で、あなたの「次の一歩」がわかります。",
    diagnosisChips: [
      { href: "/souzoku", label: "相続の相談" },
      { href: "/toushi", label: "投資・事業用を探す" },
      { href: "/global", label: "お部屋探し" },
      { href: "/toushi", label: "物件の希望条件を伝える" },
    ],
    diagnosisNote:
      "こんにちは、四葉不動産のLINKAです。相続・投資や事業用・お部屋探しなど、お困りごとを匿名でどうぞ。物件をお探しの方は、駅・賃料・広さなど希望条件だけでも大丈夫——条件を整理して、そのままLINEで送れる形にします。",
    repAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
    repName: "浦松 丈二（うらまつ・じょうじ）",
    repBio:
      `元毎日新聞中国総局長（記者歴34年）。中国や台湾、タイに駐在。宅地建物取引士・行政書士。${SR_BIO.ja}。34年、記者として人の話を聞いてきました。あなたの事情を整理するところから、一緒に。`,
    profileLabel: "プロフィール：",
    qa: [
      {
        q: "文京区で不動産を相続したら、まず何をすればいいですか？",
        a: "まず相続登記の期限を確認します（2024年4月から義務化・原則3年以内）。進め方の全体は完全ガイドへ。",
        anchor: "相続不動産の完全ガイド",
      },
      {
        q: "グループホームに使える物件はどう探せばいいですか？",
        a: "指定基準（立地・構造・面積・消防）を見据えて、契約前に確認するのが鉄則です。",
        anchor: "グループホーム物件",
      },
      {
        q: "外国人でも日本で部屋を借りられますか？",
        a: "借りられます。審査・保証・言語の壁を、四葉不動産が母語でサポートします。",
        anchor: "多言語のお部屋探し",
      },
      {
        q: "四葉不動産はどんな会社ですか？",
        a: "文京区小日向の宅地建物取引業者で、相続不動産と投資・事業用不動産が専門です。",
        anchor: "わたしたち",
      },
      {
        // 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：売主向け入口。ja は /nagare（QA_HREFS_JA）へ。
        q: "相続以外でも、不動産の売却を相談できますか？",
        a: "ご相談いただけます。査定は無料で、海外在住の方のご相談にも対応しています。ご依頼から引渡しまでの手続き・書類・費用の時期は流れのページへ。",
        anchor: "ご依頼から引渡しまでの流れ",
      },
    ],
    qaHrefs: QA_HREFS_JA,
    nav: [
      { href: "/services", label: "サービス一覧" },
      { href: "/column", label: "コラム" },
      { href: "/faq", label: "よくある質問" },
      { href: "/access", label: "アクセス・料金" },
    ],
  },
  en: {
    heroAlt: "Cherry blossoms along Harimazaka in Bunkyo, Tokyo",
    h1: "四葉不動産｜Inherited Property & Investment / Business-Use Real Estate in Bunkyo, Tokyo",
    intro: (
      <>
        <strong>Yotsuba Real Estate Co., Ltd. (四葉不動産株式会社) is a real estate company in Kohinata, Bunkyo-ku, Tokyo.</strong>{" "}
        What should you do with the house you inherited? How do you secure a property for a group home or company housing? Based in the Myogadani neighborhood, our representative—a former newspaper journalist who is a Licensed Real Estate Transaction Specialist and Gyoseishoshi (Administrative Scrivener)—supports you from the very first step. Room-hunting support for international residents is available in Japanese, English, Traditional Chinese, and Simplified Chinese.
      </>
    ),
    pillars: [
      {
        tag: "Inheriting a property?",
        title: "Inherited a property—now what?",
        body: "Your three exits are managing, utilizing, or selling. One guide covers everything from the registration deadline to choosing your exit.",
        anchor: "Inheriting Property in Bunkyo: The Complete Guide",
      },
      {
        tag: "Looking for a property?",
        title: "Find investment & business-use property",
        body: "Group-home properties, company housing, and income properties—proposed by working backward from your business goals.",
        anchor: "Investment & Business-Use Real Estate",
      },
      {
        tag: "Living in Japan?",
        title: "Room hunting for international residents",
        body: "We also help you gather and translate the documents you need.",
        anchor: "Multilingual Room-Hunting Support",
      },
    ],
    pillarHrefs: PILLAR_HREFS,
    diagnosisH2: "Find your next step in 60 seconds.",
    diagnosisChips: [
      { href: "/souzoku", label: "Inheritance" },
      { href: "/toushi", label: "Investment & business use" },
      { href: "/global", label: "Room hunting" },
      { href: "/toushi", label: "Share my property conditions" },
    ],
    diagnosisNote:
      "Hi, I'm LINKA, Yotsuba Real Estate's AI concierge. Tell me your situation anonymously—inheritance, investment or business-use property, or room hunting. Looking for a property? Just your conditions—station, rent, size—are enough: I'll organize them into a message you can send us on LINE as-is.",
    repAlt: "Joji Uramatsu, Representative Director of Yotsuba Real Estate Co., Ltd.",
    repName: "Joji Uramatsu",
    // 2026-09-05 月次点検（INIT-06）：開業予定の直書きを SR_BIO.en に（ja/zh-tw/zh と同方式・開業後は資格名のみ）
    repBio:
      `Former China General Bureau Chief of the Mainichi Shimbun (34 years as a journalist), stationed in China, Taiwan, and Thailand. Licensed Real Estate Transaction Specialist and Gyoseishoshi (Administrative Scrivener). ${SR_BIO.en}. For 34 years I listened to people's stories as a journalist—let's start by sorting out yours, together.`,
    profileLabel: "Profile: ",
    qa: [
      {
        q: "I inherited a property in Bunkyo—what should I do first?",
        a: "First, check the inheritance registration deadline (mandatory since April 2024; within three years in principle). See the complete guide for the full picture.",
        anchor: "Complete guide to inherited property",
      },
      {
        q: "How do I find a property that can be used as a group home?",
        a: "The golden rule is to check it against the designation standards (location, structure, floor area, fire safety) before signing a contract.",
        anchor: "Group-home properties",
      },
      {
        q: "Can foreign residents rent a home in Japan?",
        a: "Yes. Yotsuba Real Estate supports you in your own language—through screening, guarantors, and paperwork.",
        anchor: "Multilingual room hunting",
      },
      {
        q: "What kind of company is Yotsuba Real Estate?",
        a: "A licensed real estate brokerage in Kohinata, Bunkyo-ku, specializing in inherited properties and investment / business-use properties.",
        anchor: "About us",
      },
      {
        // 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：売主向け入口。/nagare は ja 限定のため /leaving-japan（QA_HREFS_INTL）へ。監修前ドラフト。
        q: "Can you help me sell a property that isn't inherited—for example, before I leave Japan?",
        a: "Yes. Appraisal is free, and we also work with owners living overseas. If you are still in Japan and leaving soon, start with our feature on selling even with only 30 days left.",
        anchor: "Selling before leaving Japan",
      },
    ],
    qaHrefs: QA_HREFS_INTL,
    nav: [
      { href: "/services", label: "Services" },
      { href: "/column", label: "Column" },
      { href: "/faq", label: "FAQ" },
      { href: "/access", label: "Access & Fees" },
    ],
  },
  "zh-tw": {
    heroAlt: "東京文京區・播磨坂的櫻花並木",
    h1: "四葉不動産｜文京區的繼承不動產與投資・事業用不動產",
    intro: (
      <>
        <strong>四葉不動産株式会社是位於東京都文京區小日向的不動產公司。</strong>
        從父母繼承的房子該怎麼辦？團體家屋（Group Home）或員工宿舍的物件該如何取得？——深耕文京區・茗荷谷在地，由曾任報社記者、具備宅建士與行政書士資格的代表，從第一步開始陪您處理。外國人士找房也提供日文、英文、中文（繁體・簡體）服務。
      </>
    ),
    pillars: [
      {
        tag: "如何繼承不動產？",
        title: "繼承的不動產，該怎麼辦？",
        body: "出路有「管理・活用・出售」三種。從有期限的繼承登記到出路的選擇，整理成一份完整指南。",
        anchor: "在文京區繼承不動產——完整指南",
      },
      {
        tag: "如何尋找物件？",
        title: "尋找投資用・事業用不動產",
        body: "團體家屋物件、員工宿舍、收益物件——從事業目的反向推算，為您提案。",
        anchor: "投資用・事業用不動產",
      },
      {
        tag: "如何在日本生活？",
        title: "外國人找房",
        body: "也協助您蒐集所需文件並提供翻譯支援。",
        anchor: "外國人・多語言找房服務",
      },
    ],
    pillarHrefs: PILLAR_HREFS,
    diagnosisH2: "60秒，找到您的「下一步」。",
    diagnosisChips: [
      { href: "/souzoku", label: "繼承諮詢" },
      { href: "/toushi", label: "尋找投資・事業用物件" },
      { href: "/global", label: "找房" },
      { href: "/toushi", label: "告知希望條件" },
    ],
    diagnosisNote:
      "您好，我是四葉不動産的AI禮賓LINKA。繼承、投資・事業用物件、找房等，請以匿名方式告訴我您的狀況。若您正在找物件，只要告訴我車站・租金・面積等希望條件即可——我會為您整理成可直接用LINE傳送的內容。",
    repAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
    repName: "浦松 丈二（Uramatsu Joji）",
    repBio:
      `曾任每日新聞中國總局長（記者資歷34年）、曾派駐中國、台灣、泰國。宅地建物取引士・行政書士。${SR_BIO.zhTw}。34年來，我以記者的身分傾聽人們的故事。就從整理您的狀況開始，一起前進。`,
    profileLabel: "個人檔案：",
    qa: [
      {
        q: "在文京區繼承了不動產，首先該做什麼？",
        a: "首先確認繼承登記的期限（2024年4月起義務化・原則上3年內）。整體流程請見完整指南。",
        anchor: "繼承不動產完整指南",
      },
      {
        q: "可用於團體家屋的物件該如何尋找？",
        a: "鐵則是在簽約前，先對照指定基準（地點・結構・面積・消防）進行確認。",
        anchor: "團體家屋物件",
      },
      {
        q: "外國人也能在日本租屋嗎？",
        a: "可以。審查、保證、語言的門檻，四葉不動産以您的母語協助您跨過。",
        anchor: "多語言找房服務",
      },
      {
        q: "四葉不動産是什麼樣的公司？",
        a: "位於文京區小日向的宅地建物取引業者，專精繼承不動產與投資・事業用不動產。",
        anchor: "關於我們",
      },
      {
        // 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：売主向け入口。/leaving-japan（QA_HREFS_INTL）へ。監修前ドラフト。
        q: "不是繼承的不動產，也能委託出售嗎？人在海外或即將出境也可以嗎？",
        a: "可以。估價免費，人在海外的屋主也能諮詢。若您人尚在日本且即將出境，請先參考「距離出境只剩30天也能賣」的專題。",
        anchor: "出國前的不動產出售",
      },
    ],
    qaHrefs: QA_HREFS_INTL,
    nav: [
      { href: "/services", label: "服務總覽" },
      { href: "/column", label: "專欄" },
      { href: "/faq", label: "常見問題" },
      { href: "/access", label: "交通與費用" },
    ],
  },
  zh: {
    heroAlt: "东京文京区・播磨坂的樱花街道",
    h1: "四葉不動産｜文京区的继承不动产与投资・事业用不动产",
    intro: (
      <>
        <strong>四葉不動産株式会社是位于东京都文京区小日向的不动产公司。</strong>
        从父母继承的房子该怎么办？团体家屋（Group Home）或员工宿舍的物件该如何取得？——扎根文京区・茗荷谷本地，由曾任报社记者、持有宅建士与行政书士资格的代表，从第一步开始陪您处理。外国人士找房也提供日语、英语、中文（繁体・简体）服务。
      </>
    ),
    pillars: [
      {
        tag: "如何继承不动产？",
        title: "继承的不动产，该怎么办？",
        body: "出路有“管理・活用・出售”三种。从有期限的继承登记到出路的选择，整理成一份完整指南。",
        anchor: "在文京区继承不动产——完整指南",
      },
      {
        tag: "如何寻找房源？",
        title: "寻找投资用・事业用不动产",
        body: "团体家屋物件、员工宿舍、收益物件——从事业目的反向推算，为您提案。",
        anchor: "投资用・事业用不动产",
      },
      {
        tag: "如何在日本生活？",
        title: "外国人找房",
        body: "也协助您收集所需文件并提供翻译支持。",
        anchor: "外国人・多语言找房服务",
      },
    ],
    pillarHrefs: PILLAR_HREFS,
    diagnosisH2: "60秒，找到您的“下一步”。",
    diagnosisChips: [
      { href: "/souzoku", label: "继承咨询" },
      { href: "/toushi", label: "寻找投资・事业用物件" },
      { href: "/global", label: "找房" },
      { href: "/toushi", label: "告知希望条件" },
    ],
    diagnosisNote:
      "您好，我是四葉不動産的AI礼宾LINKA。继承、投资・事业用物件、找房等，请以匿名方式告诉我您的情况。若您正在找物件，只要告诉我车站・租金・面积等希望条件即可——我会为您整理成可直接用LINE发送的内容。",
    repAlt: "四葉不動産株式会社 代表取缔役 浦松丈二",
    repName: "浦松 丈二（Uramatsu Joji）",
    repBio:
      `曾任每日新闻中国总局长（记者经历34年）、曾派驻中国、台湾、泰国。宅地建物取引士・行政书士。${SR_BIO.zh}。34年来，我以记者的身份倾听人们的故事。就从整理您的情况开始，一起前进。`,
    profileLabel: "个人简介：",
    qa: [
      {
        q: "在文京区继承了不动产，首先该做什么？",
        a: "首先确认继承登记的期限（2024年4月起义务化・原则上3年内）。整体流程请见完整指南。",
        anchor: "继承不动产完整指南",
      },
      {
        q: "可用于团体家屋的物件该如何寻找？",
        a: "铁则是在签约前，先对照指定基准（地点・结构・面积・消防）进行确认。",
        anchor: "团体家屋物件",
      },
      {
        q: "外国人也能在日本租房吗？",
        a: "可以。审查、担保、语言的门槛，四葉不動産以您的母语协助您跨过。",
        anchor: "多语言找房服务",
      },
      {
        q: "四葉不動産是什么样的公司？",
        a: "位于文京区小日向的宅地建物取引业者，专精继承不动产与投资・事业用不动产。",
        anchor: "关于我们",
      },
      {
        // 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：売主向け入口。/leaving-japan（QA_HREFS_INTL）へ。監修前ドラフト。
        q: "不是继承的不动产，也能委托出售吗？人在海外或即将出境也可以吗？",
        a: "可以。估价免费，人在海外的业主也能咨询。若您人尚在日本且即将出境，请先参考“距离出境只剩30天也能卖”的专题。",
        anchor: "出国前的不动产出售",
      },
    ],
    qaHrefs: QA_HREFS_INTL,
    nav: [
      { href: "/services", label: "服务总览" },
      { href: "/column", label: "专栏" },
      { href: "/faq", label: "常见问题" },
      { href: "/access", label: "交通与费用" },
    ],
  },
};

export default async function HomePageContent() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;

  // トップの内部リンク＝最新コラム3本（現在ロケール）。0件なら節ごと非表示。
  const latestColumns = (await getLatestColumns(3, locale)).map((col) =>
    getLocalizedColumn(col, locale),
  );
  const columnsCopy = HOME_COLUMNS_HEADING[locale] ?? HOME_COLUMNS_HEADING.ja;

  // 既存タグライン（Firestore翻訳・各locale値あり）＝サブコピーへ移設。取得不能時は非表示（退行なし）。
  let tagline = "";
  try {
    const t = await fetchTranslations(locale);
    tagline = [
      getNestedValue(t, "realestate.home.heroTitle1"),
      getNestedValue(t, "realestate.home.heroTitle2"),
      getNestedValue(t, "realestate.home.heroTitle3"),
    ]
      .filter(Boolean)
      .join("");
  } catch {
    tagline = "";
  }

  return (
    <>
      {/* ヒーロー（H1＝全ロケール先頭に社名・回答ファースト・桜=bunkyo-sakura） */}
      <section className="relative">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-b-3xl sm:mt-4 sm:rounded-3xl">
          <picture>
          <source
            type="image/avif"
            srcSet={[420, 750, 828, 1200, 1600].map(width => `/hero/bunkyo-sakura-${width}.avif ${width}w`).join(", ")}
            sizes="(min-width: 1152px) 1152px, 100vw"
          />
          <Image
            src="/hero/bunkyo-sakura-16x9.webp"
            quality={60}
            alt={c.heroAlt}
            width={1600}
            height={900}
            className="h-[60vw] max-h-[480px] w-full object-cover sm:h-auto"
            sizes="(min-width: 1152px) 1152px, 100vw"
            loading="eager"
            fetchPriority="high"
          />
          </picture>
          {/* SP・小タブレット＝画像の下に縦積み（DESIGN.md§8「モバイルのヒーローは縦積み」＝パネルのクリップ/ヘッダーかぶり防止）／md+＝画像上のオーバーレイ */}
          <div className="md:absolute md:inset-0 md:flex md:items-center">
            <div className="hero-fade-in bg-surface p-5 md:m-8 md:max-w-2xl md:rounded-2xl md:bg-white/30 md:p-7 md:backdrop-blur-sm">
              <h1 className="font-serif text-2xl font-bold leading-snug text-ink sm:text-3xl">{c.h1}</h1>
              {tagline && (
                <p className="mt-1.5 text-xs font-medium tracking-wide text-primary-dark sm:text-sm">
                  {tagline}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-text sm:text-base">{c.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4"><RentalEntry locale={locale} /></div>

      <main className="defer-page-sections mx-auto max-w-5xl px-4">
        {/* 二本柱カード（＋横断） */}
        <section aria-label="pillars" className="mt-10 grid gap-3 sm:grid-cols-3">
          {c.pillars.map((p, i) => (
            <Link
              key={c.pillarHrefs[i]}
              href={addLocalePrefix(c.pillarHrefs[i], locale)}
              className="block rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <span className="inline-block rounded-full bg-primary-tint px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                {p.tag}
              </span>
              <div className="mt-2 font-serif text-lg font-semibold leading-snug text-ink">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{p.body}</p>
              <div className="mt-3 text-sm font-medium text-primary-dark">→ {p.anchor}</div>
            </Link>
          ))}
        </section>

        {/* 60秒診断＝LINKAインライン本体（フェーズK接続済み・1ページ1LINKA＝右下FABはこのページ非表示のまま） */}
        <section aria-label="60-second diagnosis" className="mt-10 rounded-2xl bg-primary-tint p-4 sm:p-6">
          <h2 className="text-center font-serif text-xl font-semibold text-ink">{c.diagnosisH2}</h2>
          <div className="mx-auto mt-4 h-[520px] max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface">
            <LazyLinkaWidget
              deferUntilVisible
              site="realestate"
              mode="concierge"
              greeting={c.diagnosisNote}
              chips={c.diagnosisChips.map((chip) => chip.label)}
              className="h-full"
            />
          </div>
        </section>

        {/* 代表紹介（E-E-A-T） */}
        <section className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row">
          <Image
            src="/staff/uramatsu.webp"
            alt={c.repAlt}
            width={160}
            height={213}
            sizes="(min-width: 640px) 160px, 128px"
            className="w-32 flex-shrink-0 rounded-xl object-cover sm:w-40"
          />
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">{c.repName}</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{c.repBio}</p>
            <p className="mt-2 text-xs">
              {c.profileLabel}
              <a
                href="https://www.samurai.co.jp/samurai/reserve/uramatsu-joji"
                target="_blank"
                rel="noreferrer"
                className="text-primary-dark underline"
              >
                士業ドットコム
              </a>
              ／
              <a
                href="https://www.wikidata.org/wiki/Q139738129"
                target="_blank"
                rel="noreferrer"
                className="text-primary-dark underline"
              >
                Wikidata
              </a>
            </p>
          </div>
        </section>

        {/* 疑問文H2直答（AIクエリ形・FAQPage JSON-LDは/faq専用＝表示のみ） */}
        <section aria-label="direct answers" className="mt-10 space-y-6">
          {c.qa.map((item, i) => (
            <div key={item.q}>
              <h2 className="font-serif text-lg font-semibold text-ink">{item.q}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text">
                {item.a}{" "}
                <Link href={addLocalePrefix(c.qaHrefs[i], locale)} className="text-primary-dark underline">
                  {item.anchor}
                </Link>
              </p>
            </div>
          ))}
        </section>

        <CustomerVoicesPreview businessKey="realestate" locale={locale} />

        {/* 導線 */}
        <nav aria-label="site links" className="mt-10 flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-dark">
          {c.nav.map((n) => (
            <Link key={n.href} href={addLocalePrefix(n.href, locale)} className="underline">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* 最新コラム（内部リンク・SSR） */}
        {latestColumns.length > 0 && (
          <section
            aria-label="columns"
            className="mt-10 rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">
              {columnsCopy.title}
            </h2>
            <ul className="mt-4 space-y-3">
              {latestColumns.map((col) => (
                <li key={col.slug}>
                  <Link
                    href={addLocalePrefix(`/column/${col.slug}`, locale)}
                    className="group block"
                  >
                    <span className="text-xs text-text-muted">
                      {col.date.replace(/-/g, ".")}
                    </span>
                    <p className="mt-0.5 text-sm font-medium text-ink group-hover:text-primary-dark">
                      {col.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={addLocalePrefix("/column", locale)}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-dark hover:text-primary-dark"
            >
              {columnsCopy.all}
            </Link>
          </section>
        )}

        {/* CTA帯＝共通CtaBand（2026-07-24 v2.1）。variant="property-general"＝住まい・事業用の両対応の
            物件条件インテーク（テンプレコピー・信頼行・GA計測・contactの?intent=bukken込み・4ロケール）。
            旧インライン版は「共通CtaBandがja固定」時代の産物のため撤去・一本化。 */}
        <div className="my-4">
          <CtaBand businessKey="realestate" variant="property-general" />
        </div>
      </main>
    </>
  );
}

// /shataku（借り上げ社宅ピラー）＝シナジー領域#12（2026-07-24・監修前ドラフト実装）
// 方式＝RealestateServicePage（手本=/kaigo・/toushi/shitei-shinsei C-2）。
// 位置づけ＝社宅・法人賃貸クラスタの**主力**。借り上げ社宅の「導入・社宅規程・物件」軸。
//
// 【2026-07-29 指示書10C：/toushi/shataku を本ページへ統合】
//   ・/toushi/shataku（外国人従業員×在留資格の物件手配軸）を 301 で本ページへ統一した。
//     社宅は投資用でも事業用でもなく福利厚生のため、/toushi 配下は階層として不自然だった。
//   ・統合元の4ロケールCOPY（リード・外国人従業員のQ&A・著者）を本ページへ移設し、
//     ja先行公開（availableLocales:["ja"]）を解いて4ロケール公開に切り替えた。
//     §1〜§4（導入の流れ・契約前チェック・社宅規程・現物給与）は ja のみ。他ロケールは
//     統合元と同等の内容＋役割分担表を出す（ピラー本文の全訳はフェーズ6で行う）。
//   ・統合元FAQのうち /shataku に無かった2問（外国人採用にともなう社宅／重要事項説明の外国語対応）を移設。
//     「事業用物件の許認可」は既に本ページにあるため移設せず（/office・/inshokuten 等と共通の横断FAQ）。
//   ・「ご相談の入口（窓口）は共通です。」を削除。禁止事項1の「入口は同じ」型に該当し、
//     U6（窓口統一型の適法性・石井弁護士確認）が済むまで全面禁止のため。
//
// 表示コンプライアンス（shigyo-compliance-gate・C-2検収準拠）：
//   ・業務一体提供を示唆する語（ワンストップ等）は全文で使用禁止。分離受任・紹介料なしを明記。
//   ・当方が「今できる」のは借り上げ社宅の物件＝宅建業（法人契約・転貸承諾の確認）に限定。
//   ・社宅規程・現物給与・社会保険は労務の論点として整理にとどめ、実務は社労士（未開業／提携）へ振り分け。
//   ・社労士は未開業注記の確定文言「四葉社会保険労務士事務所（2026年9月開業予定・現時点では未開業）」を一字一句踏襲。
//   ・給与課税・賃貸料相当額など税務は税理士の独占業務のため断定せず提携税理士へ振り分け（数値の当てはめは書かない）。
//   ・転貸＝民法第612条（賃貸人の承諾）を条番号明記。現物給与の価額・所得税の取り扱いは数値を書かず一般形＋事前確認へ誘導。
// FAQPage JSON-LD＝faqJa（kaigyo新設2問＋corporate/companyの既存2問＋10Cで移設2問）を参照（文字列コピー禁止）。
// hero＝realestate-shataku-16x9.webp（社宅の既存アセット）。
// クラスタ＝#11飲食店・#13民泊・#14介護・#15会社設立オフィスと同じ「物件×士業」シナジー群。社労士開業後に /labor 系と連携予定。
import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { RealestateServicePage, ReH2 } from "@/components/shared/RealestateServicePage";
import { CannotHandle } from "@/components/shared/CannotHandle";
import { Faq } from "@/components/shared/Faq";
import { pickFaqJa } from "@/data/faqJa";
import { InlineCtaProperty } from "@/components/shared/InlineCtaProperty";
import type { LangCode } from "@/config/languages";
import { SR_ENTITY_LABEL, SR_ENTITY_LABEL_I18N, SR_ROLE_SENTENCE, SR_BIO } from "@/lib/shared/sr-label";
// 2026-09-05 月次点検（NEW-SR-4）：crossLinkLead の「（開業後）」を SR_LAUNCHED でゲート
import { SR_LAUNCHED } from "@/lib/shared/office";

// 冒頭の回答ブロック（H1直下）。当方が今できるのは物件＝宅建業に限定し、労務・税務は分離受任で振り分け（監修前ドラフト・浦松承認）
const JA_ANSWER_BLOCK =
  `企業が従業員の住まいとして借り上げ社宅を導入するときは、「物件」と「社宅規程」を並行して検討するのが安全です。借り上げ社宅は、会社が賃貸物件を契約して従業員に住まわせる仕組みで、貸主の転貸承諾や法人契約の可否が物件選びの段階で決まり、社宅規程で定める従業員の負担割合は税務・社会保険の取り扱いに直結するからです。法人契約・借り上げの物件の紹介・仲介は四葉不動産株式会社が担当します。社宅規程の整備や現物給与・社会保険の取り扱いは労務の論点として整理してお伝えし、実務は社会保険労務士（${SR_ENTITY_LABEL}、または他の社会保険労務士）が別契約で対応します。給与課税など税務の判断は税理士におつなぎします。文京区・茗荷谷を中心に東京都内に対応します。`;

// FAQPage＝faqJa参照（kaigyo新設2問＋既存2問＋10Cで /toushi/shataku から移設2問）
const JA_FAQ_QUESTIONS = [
  "借り上げ社宅を導入したいのですが、物件探しと社宅規程をあわせて相談できますか？",
  "借り上げ社宅に使う物件を選ぶときの注意点は何ですか？",
  "外国人採用にともなう社宅も相談できますか？",
  "重要事項説明を外国語でサポートしてもらえますか？",
  "事業用物件の許認可（飲食・古物など）も相談できますか？",
  "四葉不動産と四葉行政書士事務所はどんな関係ですか？",
  "会社名義（役員社宅）で借りたいのですが、税理士の計算に必要な資料はそろいますか？",
  "会社名義で借りて、家族と一緒に住めますか？",
  "設立して間もない会社でも、法人名義で借りられますか？",
  "法人契約でも連帯保証人は必要ですか？",
  "勤務先が契約者になります。会社の決めた条件の範囲で探してもらえますか？",
  "自宅の一部を仕事場として使える物件を借りられますか？",
];

// §1 導入の流れ（目安）。順序の目安であり、各判断は資格者・提携専門家の確認を要する
const JA_STEPS: { title: string; body: string }[] = [
  { title: "① 制度の方針決定", body: "対象者・予算・エリアなど、社宅制度の大枠を決めます。" },
  { title: "② 社宅規程の整備", body: "負担割合・上限家賃・入退去のルールなどを定めます（労務の論点）。" },
  { title: "③ 物件の選定・法人契約", body: "規程に沿う物件を探し、法人契約・転貸承諾を確認します（宅建業）。" },
  { title: "④ 入居", body: "重要事項説明・契約・入居手続き。外国人従業員は多言語で対応します。" },
  { title: "⑤ 税務・社会保険の運用", body: "給与課税・現物給与の取り扱いを、税理士・社会保険労務士と確認しながら運用します。" },
];

// §2 物件選びの契約前チェック（宅建業の領分。個別の可否・数値は断定せず事前確認へ）
const JA_CHECKS: { title: string; body: string }[] = [
  { title: "法人契約の可否", body: "貸主・管理会社・保証会社が法人名義の契約を受けるか。会社契約に対応していない物件もあります。" },
  { title: "転貸（又貸し）の承諾", body: "会社が借りて従業員を住まわせる形は、民法第612条第1項にいう転貸に当たり得ます。無断転貸は契約解除の理由になり得るため、貸主の承諾（社宅利用可）を契約時に確認します。" },
  { title: "入居者の変更（社員の入替）", body: "転勤・退職にともなう入居者の変更を、契約上どこまで認めてもらえるか。" },
  { title: "契約の型（普通借家・定期借家）", body: "更新・中途解約・違約金の条件が変わります。運用に合う型かを確認します。" },
  { title: "原状回復・保証", body: "原状回復義務の帰属、法人の連帯保証・保証会社の要否。" },
  { title: "社宅規程との整合", body: "上限家賃・対応エリア・従業員の負担割合が、社宅規程で定めた範囲に収まるか。" },
];

type Role = { work: string; who: string };

type ShatakuCopy = {
  metaTitle: string;
  metaDesc: string;
  crumbHome: string;
  crumbCurrent: string;
  serviceName: string;
  heroAlt: string;
  h1: string;
  lead: React.ReactNode;
  internalLinks: { href: string; label: string }[];
  crossLinkLead: string;
  /** STEP 1：/toushi/shataku から移設した外国人従業員セクション（分離受任を明示する形に改めた版） */
  gaikokujinH2: string;
  gaikokujinBody: (locale: LangCode) => React.ReactNode;
  /** §5 役割分担表 */
  rolesH2: string;
  rolesIntro: string;
  rolesThWork: string;
  rolesThWho: string;
  roles: Role[];
  rolesFootnote: string;
  relatedAria: string;
  relatedHeading: string;
  authorAlt: string;
  authorLabel: string;
  authorBio: string;
};

const COPY: Record<LangCode, ShatakuCopy> = {
  ja: {
    metaTitle: "東京で借り上げ社宅を導入するなら｜物件・法人契約と社宅規程の完全ガイド | 四葉不動産",
    metaDesc:
      `借り上げ社宅の導入は「物件（法人契約・転貸承諾）」と「社宅規程・現物給与・社会保険の論点」が同時に動きます。法人契約の物件の紹介・仲介は四葉不動産株式会社が担当し、社宅規程や労務の実務は社会保険労務士（${SR_ENTITY_LABEL}／他の社会保険労務士）、給与課税など税務は税理士が、それぞれ別契約で対応します。文京区小日向・茗荷谷駅徒歩5分。`,
    crumbHome: "ホーム",
    crumbCurrent: "借り上げ社宅の導入",
    serviceName: "借り上げ社宅の導入を見据えた物件の紹介・仲介",
    heroAlt: "借り上げ社宅のイメージ（オフィス街の集合住宅）",
    h1: "借り上げ社宅の導入——物件・法人契約と社宅規程の完全ガイド",
    lead: (
      <p>
        「物件を先に契約したら、貸主が社宅利用を認めてくれなかった」——借り上げ社宅の導入では、<strong>物件と社宅規程が同時に動きます</strong>。規程で決める従業員の負担割合が税務・社会保険の取り扱いに直結し、物件側では法人契約や転貸の承諾が前提になるからです。このページでは、導入の流れ、物件選びの契約前チェック、<strong>担当・契約の分担</strong>を解説します。
      </p>
    ),
    internalLinks: [
      { href: "/global", label: "外国人・多言語のお部屋探し" },
      { href: "/toushi", label: "投資用・事業用不動産" },
      { href: "/access", label: "アクセス・料金" },
      { href: "/contact", label: "お問い合わせ" },
    ],
    crossLinkLead:
      `社宅規程や現物給与・社会保険は労務の論点として整理し、実務は社会保険労務士${SR_LAUNCHED ? "" : "（開業後）"}、税務は税理士が、それぞれ別契約で担当します。`,
    gaikokujinH2: "外国人従業員の社宅も対応できますか？",
    gaikokujinBody: (locale) => (
      <>
        できます。言語・保証会社・入居審査という、外国人の住居手配でつまずきやすい3点を整理してサポートします。法人契約・借り上げの物件の紹介・仲介は四葉不動産株式会社が承ります。受け入れに必要な
        <Link href={addLocalePrefix("/legal/services/visa", locale)} className="text-primary underline">在留資格の申請書類の作成</Link>
        は、併設の四葉行政書士事務所が別契約で受任します。着任日から逆算した企業側の手続きと期限は
        <Link href={addLocalePrefix("/legal/services/gaikokujin-shain", locale)} className="text-primary underline">外国人社員を海外から迎えるとき</Link>
        にまとめています。従業員ご本人のお部屋探しは
        <Link href={addLocalePrefix("/global", locale)} className="text-primary underline">外国人・多言語のお部屋探し</Link>
        をご覧ください。
      </>
    ),
    rolesH2: "担当・契約の分担",
    rolesIntro: "物件・労務・税務・在留資格・登記は、それぞれ独立した事業体・専門家が別契約で担当します。",
    rolesThWork: "業務",
    rolesThWho: "担当",
    roles: [
      { work: "借り上げ社宅の物件の紹介・仲介、法人契約・転貸承諾の確認（宅地建物取引業）", who: "四葉不動産株式会社" },
      { work: "社宅規程の整備・現物給与・社会保険の取り扱い（労務）", who: `${SR_ENTITY_LABEL}／他の社会保険労務士が別契約で対応` },
      { work: "給与課税・賃貸料相当額など税務（税務代理・税務相談は税理士の独占業務）", who: "税理士をご紹介" },
      { work: "外国人従業員の在留資格の申請書類の作成（作成は行政書士の独占業務・別契約）", who: "併設の四葉行政書士事務所" },
      { work: "登記", who: "司法書士をご紹介" },
    ],
    rolesFootnote: "各事業体・専門家とは分離受任・個別契約であり、当社が紹介料を受け取ることはありません。",
    relatedAria: "関連リンク",
    relatedHeading: "このページの関連リンク",
    authorAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
    authorLabel: "この記事の著者",
    authorBio:
      `浦松 丈二｜四葉不動産株式会社 代表取締役・専任宅地建物取引士。行政書士。元毎日新聞中国総局長（記者歴34年）。中国や台湾、タイに駐在。${SR_BIO.ja}。`,
  },
  en: {
    metaTitle: "Company Housing & Corporate Leasing Support | 四葉不動産 (Yotsuba Real Estate)",
    metaDesc:
      "Yotsuba Real Estate Co., Ltd. supports company housing and corporate-lease rentals for businesses. Housing arrangements for international employees are handled in Japanese, English, Traditional Chinese, and Simplified Chinese. Property introduction and brokerage are handled by Yotsuba Real Estate Co., Ltd.; the residence-status documents required to bring employees on board are handled by Yotsuba Gyoseishoshi Office; company-housing rules and social insurance are handled by a licensed social insurance and labor consultant — each engaged under a separate contract.",
    crumbHome: "Home",
    crumbCurrent: "Company Housing & Corporate Leasing",
    serviceName: "Company Housing & Corporate Leasing Support",
    heroAlt: "Company housing and corporate leasing (apartment buildings in an office district)",
    h1: "Company Housing & Corporate Leasing Support",
    lead: (
      <p>
        Yotsuba Real Estate Co., Ltd. supports <strong>company housing and corporate-lease rentals for businesses</strong>. What sets us apart: we can <strong>arrange housing for international employees in Japanese, English, Traditional Chinese, and Simplified Chinese</strong>. Tenant screening, guarantors, explaining house rules—we take on the points where international tenants tend to stumble, language barrier and all.
      </p>
    ),
    internalLinks: [
      { href: "/global", label: "Multilingual Room-Hunting Support" },
      { href: "/toushi", label: "Investment & Business-Use Real Estate (Top)" },
      { href: "/access", label: "Access & Fees" },
    ],
    crossLinkLead:
      // 2026-09-05 月次点検（NEW-SR-4）：「our partner certified tax accountant」→「a certified tax accountant」（U12＝書面での提携なし）
      "Company-housing rules, in-kind remuneration, and social insurance are labor matters: the practical work is handled by a licensed social insurance and labor consultant, and tax matters by a certified tax accountant, each under a separate contract.",
    gaikokujinH2: "Can you handle company housing for international employees?",
    gaikokujinBody: (locale) => (
      <>
        Yes. We sort out and support the three points that most often become issues when arranging housing for international residents: language, guarantor companies, and tenant screening. Introduction and brokerage of properties for corporate contracts and company leases are handled by Yotsuba Real Estate Co., Ltd. The{" "}
        <Link href={addLocalePrefix("/legal/services/visa", locale)} className="text-primary underline">preparation of residence-status application documents</Link>{" "}
        required to bring employees on board is undertaken by the co-located Yotsuba Gyoseishoshi Office under a separate contract. The employer-side steps and deadlines, counted back from the start date, are set out in{" "}
        <Link href={addLocalePrefix("/legal/services/gaikokujin-shain", locale)} className="text-primary underline">Bringing employees from overseas</Link>. For an individual employee&apos;s own room hunting, see{" "}
        <Link href={addLocalePrefix("/global", locale)} className="text-primary underline">Multilingual Room-Hunting Support</Link>.
      </>
    ),
    rolesH2: "Who handles what, and under which contract",
    rolesIntro:
      "Property, labor, tax, residence status, and registration are each handled by an independent business or professional under a separate contract.",
    rolesThWork: "Work",
    rolesThWho: "Handled by",
    roles: [
      { work: "Introduction and brokerage of company-housing properties; checking corporate contracts and sublease consent (real estate brokerage)", who: "Yotsuba Real Estate Co., Ltd." },
      { work: "Company-housing rules, in-kind remuneration, and social insurance (labor)", who: `${SR_ENTITY_LABEL_I18N.en} / a licensed social insurance and labor consultant, under a separate contract` },
      { work: "Payroll taxation and rent-equivalent amounts (tax representation and tax consultation are the exclusive domain of certified tax accountants)", who: "We introduce a certified tax accountant" }, // 2026-09-05 月次点検（NEW-SR-4）：「partner」削除（U12）
      { work: "Preparation of residence-status application documents for international employees (preparation is the exclusive domain of gyoseishoshi; separate contract)", who: "The co-located Yotsuba Gyoseishoshi Office" },
      { work: "Registration", who: "We introduce a judicial scrivener" },
    ],
    rolesFootnote:
      "Each business and professional is engaged separately under its own contract, and we receive no referral fees.",
    relatedAria: "Related links",
    relatedHeading: "Related links on this page",
    authorAlt: "Joji Uramatsu, Representative Director of Yotsuba Real Estate Co., Ltd.",
    authorLabel: "About the author",
    authorBio:
      `Joji Uramatsu | Representative Director of Yotsuba Real Estate Co., Ltd.; full-time Licensed Real Estate Transaction Specialist (宅地建物取引士); Gyoseishoshi (Administrative Scrivener). Former China General Bureau Chief of the Mainichi Shimbun (34 years as a journalist), stationed in China, Taiwan, and Thailand. ${SR_BIO.en}.`,
  },
  "zh-tw": {
    metaTitle: "員工宿舍・法人租賃支援｜四葉不動産",
    metaDesc:
      "四葉不動産株式会社為法人企業提供員工宿舍・法人契約租賃的支援。外國員工的住居安排以日文・英文・中文（繁體・簡體）對應。物件的介紹・仲介由四葉不動産株式会社、聘僱外國員工所需的在留資格文件製作由四葉行政書士事務所、員工宿舍規程與社會保險由社會保險勞務士，各自另行簽訂契約承辦。",
    crumbHome: "首頁",
    crumbCurrent: "員工宿舍・法人租賃",
    serviceName: "員工宿舍・法人租賃支援",
    heroAlt: "員工宿舍・法人租賃的示意圖（辦公商圈的集合住宅）",
    h1: "員工宿舍・法人租賃支援",
    lead: (
      <p>
        四葉不動産株式会社支援<strong>法人企業的員工宿舍・法人契約租賃</strong>。我們的特長，是能<strong>以日文・英文・中文（繁體・簡體）安排外國員工的住居</strong>。入住審查・保證・生活規範的說明——外國人入住時容易卡關的環節，我們連同語言的門檻一併承擔。
      </p>
    ),
    internalLinks: [
      { href: "/global", label: "外國人・多語言找房服務" },
      { href: "/toushi", label: "投資用・事業用不動產（總覽）" },
      { href: "/access", label: "交通與費用" },
    ],
    crossLinkLead:
      `員工宿舍規程與實物給付・社會保險屬於勞務的論點，實務由社會保險勞務士${SR_LAUNCHED ? "" : "（開業後）"}承辦，稅務由稅理士承辦，各自另行簽約。`,
    gaikokujinH2: "外國員工的員工宿舍，也能協助安排嗎？",
    gaikokujinBody: (locale) => (
      <>
        可以。語言・保證公司・入住審查——外國人住居安排中容易出問題的3點，我們為您整理並支援。法人契約・承租型物件的介紹・仲介由四葉不動産株式会社承辦。聘僱所需的
        <Link href={addLocalePrefix("/legal/services/visa", locale)} className="text-primary underline">在留資格申請文件的製作</Link>
        ，由併設的四葉行政書士事務所另行簽約受任。從到任日往回推算的企業方手續與期限，整理於
        <Link href={addLocalePrefix("/legal/services/gaikokujin-shain", locale)} className="text-primary underline">從海外迎接外籍員工時</Link>
        。員工個人的找房，請參閱
        <Link href={addLocalePrefix("/global", locale)} className="text-primary underline">外國人・多語言找房服務</Link>
        。
      </>
    ),
    rolesH2: "承辦與契約的分工",
    rolesIntro: "物件・勞務・稅務・在留資格・登記，分別由各自獨立的事業體・專業人士另行簽約承辦。",
    rolesThWork: "業務",
    rolesThWho: "承辦",
    roles: [
      { work: "承租型員工宿舍物件的介紹・仲介，法人契約・轉租承諾的確認（宅地建物取引業）", who: "四葉不動産株式会社" },
      { work: "員工宿舍規程的整備・實物給付・社會保險的處理（勞務）", who: `${SR_ENTITY_LABEL_I18N.zhTw}／其他社會保險勞務士另行簽約承辦` },
      { work: "薪資課稅・租金相當額等稅務（稅務代理・稅務諮詢為稅理士的獨占業務）", who: "介紹稅理士" },
      { work: "外國員工在留資格申請文件的製作（製作為行政書士的獨占業務・另行簽約）", who: "併設的四葉行政書士事務所" },
      { work: "登記", who: "介紹司法書士" },
    ],
    rolesFootnote: "與各事業體・專業人士皆為分離受任・個別簽約，本公司不收取介紹費。",
    relatedAria: "相關連結",
    relatedHeading: "本頁相關連結",
    authorAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
    authorLabel: "本文作者",
    authorBio:
      `浦松 丈二｜四葉不動産株式会社 代表取締役・專任宅地建物取引士。行政書士。曾任每日新聞中國總局長（記者資歷34年）・曾派駐中國、台灣、泰國。${SR_BIO.zhTw}。`,
  },
  zh: {
    metaTitle: "员工宿舍・企业租赁支持｜四葉不動産",
    metaDesc:
      "四葉不動産株式会社为企业提供员工宿舍・以公司名义签约租赁的支持。外国员工的住房安排以日语・英语・中文（繁体・简体）对应。物件的介绍・中介由四葉不動産株式会社、聘用外国员工所需的在留资格文件制作由四葉行政書士事務所、员工宿舍规程与社会保险由社会保险劳务士，各自另行签订合同承办。",
    crumbHome: "首页",
    crumbCurrent: "员工宿舍・企业租赁",
    serviceName: "员工宿舍・企业租赁支持",
    heroAlt: "员工宿舍・企业租赁的示意图（办公区的集合住宅）",
    h1: "员工宿舍・企业租赁支持",
    lead: (
      <p>
        四葉不動産株式会社支持<strong>面向企业的员工宿舍・以公司名义签约的租赁</strong>。我们的特长，是能<strong>以日语・英语・中文（繁体・简体）安排外国员工的住房</strong>。入住审查・担保・生活规范的说明——外国人入住时容易受阻的环节，我们连同语言的门槛一并承担。
      </p>
    ),
    internalLinks: [
      { href: "/global", label: "外国人・多语言找房服务" },
      { href: "/toushi", label: "投资用・事业用不动产（总览）" },
      { href: "/access", label: "交通与费用" },
    ],
    crossLinkLead:
      `员工宿舍规程与实物给付・社会保险属于劳务的论点，实务由社会保险劳务士${SR_LAUNCHED ? "" : "（开业后）"}承办，税务由税理士承办，各自另行签约。`,
    gaikokujinH2: "外国员工的员工宿舍，也能协助安排吗？",
    gaikokujinBody: (locale) => (
      <>
        可以。语言・担保公司・入住审查——外国人住房安排中容易出问题的3点，我们为您整理并支持。法人合同・承租型物件的介绍・中介由四葉不動産株式会社承办。聘用所需的
        <Link href={addLocalePrefix("/legal/services/visa", locale)} className="text-primary underline">在留资格申请文件的制作</Link>
        ，由并设的四葉行政書士事務所另行签约受任。从到任日倒推的企业方手续与期限，整理于
        <Link href={addLocalePrefix("/legal/services/gaikokujin-shain", locale)} className="text-primary underline">从海外迎接外籍员工时</Link>
        。员工个人的找房，请参阅
        <Link href={addLocalePrefix("/global", locale)} className="text-primary underline">外国人・多语言找房服务</Link>
        。
      </>
    ),
    rolesH2: "承办与合同的分工",
    rolesIntro: "物件・劳务・税务・在留资格・登记，分别由各自独立的事业体・专业人士另行签约承办。",
    rolesThWork: "业务",
    rolesThWho: "承办",
    roles: [
      { work: "承租型员工宿舍物件的介绍・中介，法人合同・转租承诺的确认（宅地建物取引业）", who: "四葉不動産株式会社" },
      { work: "员工宿舍规程的整备・实物给付・社会保险的处理（劳务）", who: `${SR_ENTITY_LABEL_I18N.zh}／其他社会保险劳务士另行签约承办` },
      { work: "工资课税・租金相当额等税务（税务代理・税务咨询为税理士的独占业务）", who: "介绍税理士" },
      { work: "外国员工在留资格申请文件的制作（制作为行政书士的独占业务・另行签约）", who: "并设的四葉行政書士事務所" },
      { work: "登记", who: "介绍司法书士" },
    ],
    rolesFootnote: "与各事业体・专业人士均为分离受任・个别签约，本公司不收取介绍费。",
    relatedAria: "相关链接",
    relatedHeading: "本页相关链接",
    authorAlt: "四葉不動産株式会社 代表取缔役 浦松丈二",
    authorLabel: "本文作者",
    authorBio:
      `浦松 丈二｜四葉不動産株式会社 代表取缔役・专任宅地建物取引士。行政书士。曾任每日新闻中国总局长（记者经历34年）・曾派驻中国、台湾、泰国。${SR_BIO.zh}。`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  return buildPageMetadata({
    businessKey: "realestate",
    title: c.metaTitle,
    description: c.metaDesc,
    path: "/shataku",
    keywords: [
      "借り上げ社宅 導入 物件",
      "借り上げ社宅 社宅規程",
      "法人契約 賃貸 社宅",
      "社宅 現物給与 社会保険",
      "借り上げ社宅 東京 相談",
      // 10C：/toushi/shataku から統合したキーワード
      "社宅 法人契約 賃貸",
      "外国人 従業員 住居 手配",
    ],
    locale,
    absoluteTitle: true,
  });
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  const isJa = locale === "ja";

  return (
    <RealestateServicePage
      path="/shataku"
      answerBlock={isJa ? JA_ANSWER_BLOCK : undefined}
      crumbs={[{ name: c.crumbHome, href: "/" }, { name: c.crumbCurrent }]}
      serviceName={c.serviceName}
      heroSrc="/hero/realestate-shataku-16x9.webp"
      heroAlt={c.heroAlt}
      h1={c.h1}
      ctaVariant="property"
      lead={c.lead}
      internalLinks={c.internalLinks}
      crossLinkLead={c.crossLinkLead}
      relatedAria={c.relatedAria}
      relatedHeading={c.relatedHeading}
      authorAlt={c.authorAlt}
      authorLabel={c.authorLabel}
      authorBio={c.authorBio}
    >
      {isJa && (
        <>
          {/* §1 導入の全体像。順序の目安＝断定せず、各判断は資格者・専門家へ */}
          <div>
            <ReH2>借り上げ社宅とは——導入の全体像</ReH2>
            <p className="mt-3 leading-relaxed text-text">
              借り上げ社宅は、<strong>会社が賃貸物件を契約して従業員に住まわせる</strong>仕組みです。会社が物件を所有する社有社宅と違い、初期投資が小さく、撤退も柔軟に行えるため、中小企業では借り上げ型が主流です。導入の流れは、おおむね次のとおりです（順序の目安であり、各判断は資格者・専門家の確認を踏まえて進めます）。
            </p>
            <ul className="mt-4 space-y-3">
              {JA_STEPS.map((s) => (
                <li key={s.title} className="rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text">
                  <strong className="text-ink">{s.title}</strong>
                  <span className="mt-1 block">{s.body}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 leading-relaxed text-text">
              社宅規程で「対象者・負担割合・上限家賃・対応エリア」を決めないと物件の条件が定まらず、逆に物件の家賃や負担割合は税務・社会保険の取り扱いに直結します。だからこそ、<strong>物件と規程は並行して</strong>検討するのが安全です。
            </p>
          </div>

          {/* §2 物件選びの契約前チェック（宅建業）。転貸＝民法612条を条番号明記 */}
          <div>
            <ReH2>物件選びの落とし穴——契約前の確認ポイント</ReH2>
            <p className="mt-3 leading-relaxed text-text">
              借り上げ社宅に使う物件の契約前に確認しておきたい主なポイントです。いずれも契約後の変更が難しい項目です。
            </p>
            <ul className="mt-4 space-y-3">
              {JA_CHECKS.map((ck) => (
                <li key={ck.title} className="rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text">
                  <strong className="text-ink">{ck.title}</strong>
                  <span className="mt-1 block">{ck.body}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 leading-relaxed text-text">
              四葉不動産株式会社（宅地建物取引業）が、社宅規程を見据えた物件探し・法人契約・転貸承諾の確認を担当します。文京区・茗荷谷を中心に、東京都内に対応します。
            </p>
          </div>

          {/* 中間CTA（2026-07-24 CTA刷新v2）：契約前チェック直後＝高意欲の瞬間に1か所のみ */}
          <InlineCtaProperty page="/shataku" />

          {/* §3 社宅規程（労務・社労士）。未開業注記の確定文言（一字一句） */}
          <div>
            <ReH2>社宅規程——制度の骨格をつくる</ReH2>
            <p className="mt-3 leading-relaxed text-text">
              借り上げ社宅を制度として運用するには、社宅規程で「対象者・入居資格、社宅使用料（従業員の負担）の決め方、上限家賃、対応エリア、入退去・入替、原状回復や費用負担」などを定めます。とくに従業員の負担割合は、次に述べる税務・社会保険の取り扱いに直結します。
            </p>
            <p className="mt-3 leading-relaxed text-text">
              社宅規程の内容の作り込みは労務の判断にあたります。{SR_ROLE_SENTENCE.shataku}
            </p>
          </div>

          {/* §4 現物給与・社会保険・給与課税の論点（社労士・税理士）。数値の当てはめは書かず断定回避 */}
          <div>
            <ReH2>現物給与・社会保険と給与課税——負担割合で変わる論点</ReH2>
            <p className="mt-3 leading-relaxed text-text">
              社宅を無償または低廉で提供すると、その利益が<strong>現物給与</strong>として社会保険（標準報酬月額）の算定に算入される場合があります。換算は「厚生労働大臣が定める現物給与の価額」（厚生労働省告示）に基づき、住宅の価額は都道府県ごとに定められ、従業員から徴収している額を差し引いて算定します。該当性・金額の算定は社会保険労務士の領域です。
            </p>
            <p className="mt-3 leading-relaxed text-text">
              税務では、借り上げ社宅を全額会社負担にすると、原則として従業員への<strong>給与として課税</strong>され得ます。従業員から「賃貸料相当額」（実際の賃料ではなく、建物・敷地の固定資産税の課税標準額をもとに計算する取り扱いが示されています）の一定割合以上を受け取っている場合に、給与課税されない取り扱いがあります。該当性・計算・徴収額の水準の判断は税務にあたり、<strong>税務代理・税務相談は税理士の独占業務</strong>です。税理士が別契約で対応します。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {/* 2026-09-05 月次点検（NEW-SR-6）：「提携専門家」→「専門家」（U12＝書面での提携なし） */}
              ※本ページは一般的な情報提供です。具体的な価額・計算の当てはめや、個別の税務・社会保険の判断は、資格者・専門家の確認を要します。
            </p>
          </div>
        </>
      )}

      {/* 10C STEP 1：/toushi/shataku から移設した外国人従業員セクション（全ロケール・役割分担表の直前） */}
      <div>
        <ReH2>{c.gaikokujinH2}</ReH2>
        <p className="mt-3 leading-relaxed text-text">{c.gaikokujinBody(locale)}</p>
      </div>

      {/* §5 役割分担表 */}
      <div>
        <ReH2>{c.rolesH2}</ReH2>
        <p className="mt-3 leading-relaxed text-text">{c.rolesIntro}</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary-tint text-left">
              <th className="border border-border px-3 py-2">{c.rolesThWork}</th>
              <th className="border border-border px-3 py-2">{c.rolesThWho}</th>
            </tr>
          </thead>
          <tbody className="text-text">
            {c.roles.map((r) => (
              <tr key={r.work}>
                <td className="border border-border px-3 py-2">{r.work}</td>
                <td className="border border-border px-3 py-2">{r.who}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-text-muted">{c.rolesFootnote}</p>
      </div>

      {/* 対応できないこと＝共通コンポーネント（確定文言）。
          2026-08-09：isJa のゲートから出した。全ロケールで表示する
          （業際・分離受任・紹介料授受なしは「中国語圏読者にこそ必要」＝2026-07-19 浦松指示） */}
      <CannotHandle bare locale={locale} />

      {isJa && (
        <>

          {/* FAQPage JSON-LD＝faqJa参照（サイト内で文言一致） */}
          <Faq items={pickFaqJa(JA_FAQ_QUESTIONS)} heading="よくある質問" withJsonLd bare openFirst={false} />
        </>
      )}
    </RealestateServicePage>
  );
}

import { RentalCampaignCta } from "@/components/bukken/RentalCampaignCta";
import { RENTAL_CAMPAIGN_COPY } from "@/lib/rental-campaign";
// /ryokin（不動産・料金）＝タスクB-1（2026-07-19）／多言語化＝タスクC-6-3（2026-07-19）
// 四葉不動産株式会社の料金ページ。既存 /legal/ryokin（四葉行政書士事務所の報酬額表）とは別ページ＝本文からリンクのみ（/legal/ryokin側は無変更）。
// 方式＝COPY: Record<LangCode,…>＋getRequestLocale（手本=/access・/faq）。C-6-3 で en/zh-tw/zh を追加＝全4ロケール公開。
//   availableLocales は既定（全4ロケール）＝hreflang4本相互設定。sitemap側も /ryokin の locales 指定を外して全4ロケール出力。
//   訳語は C-6-1・C-6-2 の確定語（另行簽訂契約承辦／另行签订合同承办 等）と C-6-3 第1段階承認の英語統一訳語に従う。
//   金額・料率・法定上限の速算式（売買価格×3%＋6万円＋税／借賃1か月分＋税）は全ロケールで日本語版と完全一致。
// 表示コンプライアンス（宅建業法・分離受任）：業務一体提供を示唆する語（ワンストップ等）は全文で使用禁止。
//   行政書士業務は「併設の四葉行政書士事務所が別契約・別料金で受任」の形でのみ記載。
// 【2026-08-11 方針更新（浦松判断）】従来は「料金＝法令上の上限（速算式）の説明のみ。当社独自の料率は書かない」
//   としていたが、賃貸管理の料率（月額賃料の3〜5%・消費税込み）を出す判断が下りたため更新した。
//   ・売買の媒介報酬＝法定上限を価格帯ごとの表で示す（宅建業法46条1項／昭和45年建設省告示第1552号、
//     最終改正 令和6年国土交通省告示第949号・2024年7月1日施行）。低廉な空家等の特例は33万円（消費税込み）。
//   ・売却の査定＝無料（2026-08-11 浦松確認）。買取価格は案件差が大きいため数値を書かず「査定のうえ個別にご提示」。
//   ・行政書士報酬の具体額は引き続き書かない（/legal/ryokin へ送る）。値引き示唆も書かない。
//   ・PriceSpecification は引き続き出力しない（管理料は幅・買取は見積りで確定値ではないため）。
// FAQPage JSON-LD＝タスクB-1指示によりこのページで3問を出力（withJsonLd）。
//   ※既存規則「FAQPage は各サイト1本＝/faq のみ」（委任§4-6・URL構造設計v1 §1）の例外＝浦松承認前提。
import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata, BCP47_BY_LOCALE } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Faq, type FaqItem } from "@/components/shared/Faq";
import { CtaBand } from "@/components/shared/CtaBand";
import type { LangCode } from "@/config/languages";
import { SR_BIO } from "@/lib/shared/sr-label";

type Section = { h2: string; body: React.ReactNode };
// 2026-08-11 追加：料金を文章でなく表で示す（浦松判断）。
// 従来このページは「当社独自の料率は書かない」方針だったが、賃貸管理の料率（月額賃料の3〜5%・消費税込み）を
// 出す判断が下りたため方針を更新した。売却の査定は無料。買取価格は案件差が大きいため数値を出さず
// 「査定のうえ個別にご提示」とする（いずれも2026-08-11 浦松確認）。
type FeeRow = { a: string; b: string };
function FeeTable({ head, rows }: { head: readonly [string, string]; rows: readonly FeeRow[] }) {
  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <thead>
        <tr className="bg-primary-tint text-left">
          <th className="border border-border px-3 py-2">{head[0]}</th>
          <th className="border border-border px-3 py-2">{head[1]}</th>
        </tr>
      </thead>
      <tbody className="text-text">
        {rows.map((r) => (
          <tr key={r.a}>
            <td className="border border-border px-3 py-2">{r.a}</td>
            <td className="border border-border px-3 py-2">{r.b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 売買の媒介報酬の上限＝宅地建物取引業法第46条第1項／昭和45年建設省告示第1552号
// （最終改正 令和6年国土交通省告示第949号・2024年7月1日施行）。金額は全ロケール共通。
const SALE_ROWS = {
  ja: [
    { a: "200万円以下", b: "売買価格 × 5%" },
    { a: "200万円超 400万円以下", b: "売買価格 × 4% ＋ 2万円" },
    { a: "400万円超", b: "売買価格 × 3% ＋ 6万円" },
  ],
  en: [
    { a: "Up to ¥2,000,000", b: "sale price × 5%" },
    { a: "Over ¥2,000,000 and up to ¥4,000,000", b: "sale price × 4% + ¥20,000" },
    { a: "Over ¥4,000,000", b: "sale price × 3% + ¥60,000" },
  ],
  "zh-tw": [
    { a: "200萬日圓以下", b: "買賣價格 × 5%" },
    { a: "超過200萬日圓、400萬日圓以下", b: "買賣價格 × 4% ＋ 2萬日圓" },
    { a: "超過400萬日圓", b: "買賣價格 × 3% ＋ 6萬日圓" },
  ],
  zh: [
    { a: "200万日元以下", b: "买卖价格 × 5%" },
    { a: "超过200万日元、400万日元以下", b: "买卖价格 × 4% ＋ 2万日元" },
    { a: "超过400万日元", b: "买卖价格 × 3% ＋ 6万日元" },
  ],
} as const;

const OWN_ROWS = {
  ja: [
    { a: "ご相談（初回・2回目以降とも）", b: "無料" },
    { a: "売却の査定", b: "無料" },
    { a: "買取価格のご提示", b: "査定のうえ個別にご提示" },
    { a: "賃貸管理", b: "月額賃料の3〜5%（消費税込み）" },
  ],
  en: [
    { a: "Consultation (the first and every one thereafter)", b: "Free" },
    { a: "Sale appraisal", b: "Free" },
    { a: "Buyout price proposal", b: "Presented individually after the appraisal" },
    { a: "Rental property management", b: "3-5% of the monthly rent (consumption tax included)" },
  ],
  "zh-tw": [
    { a: "諮詢（首次與之後皆同）", b: "免費" },
    { a: "出售估價", b: "免費" },
    { a: "收購價格的提示", b: "估價後個別提出" },
    { a: "租賃管理", b: "月租金的3〜5%（含消費稅）" },
  ],
  zh: [
    { a: "咨询（首次及之后均同）", b: "免费" },
    { a: "出售估价", b: "免费" },
    { a: "收购价格的提示", b: "估价后个别提出" },
    { a: "租赁管理", b: "月租金的3〜5%（含消费税）" },
  ],
} as const;
type RyokinCopy = {
  metaTitle: string;
  metaDesc: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  h1: string;
  /** 冒頭の回答ブロック（タスクB-1確定文言＝一字一句不変） */
  answerBlock: string;
  sections: Section[];
  faqHeading: string;
  faqItems: FaqItem[];
  relatedAria: string;
  relatedHeading: string;
  relatedLinks: { href: string; label: string }[];
  authorAlt: string;
  authorLabel: string;
  authorBio: string;
};

const JA: RyokinCopy = {
  metaTitle: "料金｜仲介手数料・相談の考え方",
  metaDesc:
    "四葉不動産株式会社の料金のご案内。売買・賃貸の仲介手数料は宅地建物取引業法の法定上限の範囲内で、ご相談は無料です（初回・2回目以降とも）。相続手続きなどの法務業務は、四葉行政書士事務所が別契約・別料金で受任します。具体的な金額は個別にお見積りいたします。TEL 03-6161-9428。",
  breadcrumbHome: "ホーム",
  breadcrumbCurrent: "料金",
  h1: "料金のご案内",
  answerBlock:
    "四葉不動産株式会社の売買仲介手数料は、宅地建物取引業法の定める上限の範囲内でご案内します。ご相談は無料です（初回・2回目以降とも）。相続手続きなどの法務業務は、四葉行政書士事務所が別契約・別料金で受任します。具体的な金額は物件やご依頼内容により異なるため、お見積りいたします。",
  sections: [
    {
      h2: "不動産仲介手数料（売買）",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            売買の仲介手数料は、宅地建物取引業法により報酬の上限が定められています。売買価格400万円超の場合の法定上限は、次の速算式で計算されます。
          </p>
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink">
            <strong>法定上限（売買価格400万円超の場合）</strong>
            ：売買価格×3%＋6万円＋消費税
          </p>
          <p className="mt-3 leading-relaxed text-text">
            売買価格の帯ごとの法定上限は次のとおりです（いずれも別途消費税）。
          </p>
          <FeeTable head={["売買価格", "法定上限（消費税別）"]} rows={SALE_ROWS.ja} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※800万円以下の宅地建物の売買の媒介については、現地調査等に要する費用を勘案し、依頼者との合意に基づき<strong>33万円（消費税込み）</strong>を上限として受領できます（2024年7月1日施行）。
          </p>
          <p className="mt-3 leading-relaxed text-text">
            当社の仲介手数料は、この法定上限の範囲内で、物件やご依頼内容に応じて個別にお見積りいたします。
          </p>
        </>
      ),
    },
    {
      h2: "仲介手数料（賃貸）",
      body: (
        <p className="mt-3 leading-relaxed text-text">
          賃貸の仲介手数料は、宅地建物取引業法により<strong>借賃1か月分＋消費税以内</strong>
          が法定上限と定められています。当社の仲介手数料は、この法定上限の範囲内でご案内します。
        </p>
      ),
    },
    {
      h2: "相談料・査定・賃貸管理の料金",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            <strong>ご相談は無料です（初回・2回目以降とも）。</strong>
            料金がかかる場合は見積もりを提示します。
          </p>
          <FeeTable head={["内容", "料金"]} rows={OWN_ROWS.ja} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※買取のご提案額は、物件の状態・立地・時期により幅があるため、査定のうえ個別にご提示します。賃貸管理の料率は、管理の範囲（集金・入居者対応・原状回復の手配など）により決まります。
          </p>
          {/* 2026-09-23：媒介と買取の違いの1行（ja のみ）。売りにくい土地・建物の出口相談（/wakeari・ja先行公開）へ送る（指示書 v2.0 7-1） */}
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            <Link href="/wakeari" className="text-primary underline">
              買取をご希望の場合の建て付け（買取業者を買主とする媒介）
            </Link>
            は、売りにくい土地・建物の出口相談のページで媒介との違いを表にしています。
          </p>
        </>
      ),
    },
    {
      h2: "行政書士業務の費用",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            相続書類・許認可などの法務業務は、併設の四葉行政書士事務所が別契約・別料金で受任します。業務内容により異なるためお見積りいたします。
          </p>
          <p className="mt-3 text-sm">
            <Link href="/legal/ryokin" className="text-primary underline">
              行政書士業務の報酬額表はこちら（四葉行政書士事務所）
            </Link>
          </p>
        </>
      ),
    },
    {
      h2: "ご確認ください",
      body: (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted">
          本ページの金額は法令上の上限の説明であり、個別の見積りはご相談時にご提示します。
        </p>
      ),
    },
  ],
  faqHeading: "料金についてよくあるご質問",
  faqItems: [
    {
      q: "仲介手数料はいくらですか？",
      a: "売買・賃貸とも、宅地建物取引業法の定める法定上限の範囲内でご案内します。売買（売買価格400万円超の場合）の法定上限は「売買価格×3%＋6万円＋消費税」、賃貸の法定上限は「借賃1か月分＋消費税」以内です。具体的な金額は物件やご依頼内容により異なるため、個別にお見積りいたします。",
    },
    {
      q: "相談は無料ですか？",
      a: "ご相談は無料です。初回も2回目以降も無料で、料金がかかる場合は見積もりを提示します。まずはお気軽にお問い合わせください。",
    },
    {
      q: "査定は無料ですか？",
      a: "無料です。売却の査定に費用はかかりません。査定のあとでご依頼をお決めいただけます。買取価格のご提示は、物件の状態・立地・時期により幅があるため、査定のうえ個別にご提示します。",
    },
    {
      q: "行政書士業務の費用は別ですか？",
      a: "別です。相続書類・許認可などの法務業務は、併設の四葉行政書士事務所が別契約・別料金で受任します。業務内容により異なるためお見積りいたします。詳しくは「行政書士業務の報酬額表」ページ（/legal/ryokin）をご覧ください。",
    },
  ],
  relatedAria: "関連リンク",
  relatedHeading: "このページの関連リンク",
  relatedLinks: [
    { href: "/souzoku", label: "文京区で不動産を相続したら" },
    { href: "/toushi", label: "投資用・事業用不動産" },
    { href: "/legal", label: "四葉行政書士事務所" },
    { href: "/contact", label: "お問い合わせ" },
  ],
  authorAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
  authorLabel: "この記事の著者",
  authorBio:
    `浦松 丈二｜四葉不動産株式会社 代表取締役・専任宅地建物取引士。行政書士。元毎日新聞中国総局長（記者歴34年）。中国や台湾、タイに駐在。${SR_BIO.ja}。`,
};

// 英語（C-6-3 第1段階で浦松承認の統一訳語）：
//   行政書士＝Gyoseishoshi (Administrative Scrivener)／宅地建物取引士＝Licensed Real Estate Transaction Specialist／
//   宅地建物取引業法＝Real Estate Brokerage Act (宅地建物取引業法)（法令名は日本語原名を併記）／
//   別契約で受任＝engaged under a separate contract。one-stop 等の一体提供を示唆する語は使用しない。
const EN: RyokinCopy = {
  metaTitle: "Fees｜Brokerage Commissions and How Consultations Work",
  metaDesc:
    "Fee information for Yotsuba Real Estate Co., Ltd. Brokerage commissions for sales and leasing are within the statutory maximum under the Real Estate Brokerage Act (宅地建物取引業法), and consultations are free — the first and every one thereafter. Legal work such as inheritance procedures is undertaken by Yotsuba Gyoseishoshi Office under a separate contract and separate fees. Specific amounts are quoted individually. TEL 03-6161-9428.",
  breadcrumbHome: "Home",
  breadcrumbCurrent: "Fees",
  h1: "Our Fees",
  answerBlock:
    "Brokerage commissions for sales at Yotsuba Real Estate Co., Ltd. are within the maximum prescribed by the Real Estate Brokerage Act (宅地建物取引業法). Consultations are free — the first and every one thereafter. Legal work such as inheritance procedures is undertaken by Yotsuba Gyoseishoshi Office under a separate contract and separate fees. Because the specific amount varies with the property and the scope of your request, we provide a quotation.",
  sections: [
    {
      h2: "Brokerage commission (sales)",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            For sales, the Real Estate Brokerage Act (宅地建物取引業法) sets a maximum commission. Where the sale price exceeds 4 million yen, the statutory maximum is calculated by the following formula.
          </p>
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink">
            <strong>Statutory maximum (where the sale price exceeds 4 million yen)</strong>
            : sale price × 3% + 60,000 yen + consumption tax
          </p>
          <p className="mt-3 leading-relaxed text-text">
            The statutory maximum by price band is as follows (consumption tax is added to each).
          </p>
          <FeeTable head={["Sale price", "Statutory maximum (before consumption tax)"]} rows={SALE_ROWS.en} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            * For the brokerage of land or a building priced at ¥8,000,000 or less, in view of the cost of on-site surveys and with the client&apos;s agreement, up to <strong>¥330,000 including consumption tax</strong> may be received (in force since 1 July 2024).
          </p>
          <p className="mt-3 leading-relaxed text-text">
            Our brokerage commission is quoted individually within this statutory maximum, according to the property and the scope of your request.
          </p>
        </>
      ),
    },
    {
      h2: "Brokerage commission (leasing)",
      body: (
        <p className="mt-3 leading-relaxed text-text">
          For leasing, the Real Estate Brokerage Act (宅地建物取引業法) sets the statutory maximum at{" "}
          <strong>one month&apos;s rent plus consumption tax</strong>. Our brokerage commission is offered within this statutory maximum.
        </p>
      ),
    },
    {
      h2: "Consultation, appraisal and management fees",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            <strong>Consultations are free — the first and every one thereafter.</strong> If a fee should apply, we will present a quotation.
          </p>
          <FeeTable head={["Service", "Fee"]} rows={OWN_ROWS.en} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            * A buyout figure varies with the condition, location and timing of the property, so we present it individually after an appraisal. The management rate depends on the scope of management (rent collection, tenant response, arranging restoration work and so on).
          </p>
        </>
      ),
    },
    {
      h2: "Fees for gyoseishoshi work",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            Legal work such as inheritance documents and permits and licenses is undertaken by the affiliated Yotsuba Gyoseishoshi Office under a separate contract and separate fees. Because fees vary with the scope of work, we provide a quotation.
          </p>
          {/* /legal/ryokin は en 版が実在する（同ページ COPY に en あり）＝英語版へリンクする */}
          <p className="mt-3 text-sm">
            <Link href={addLocalePrefix("/legal/ryokin", "en")} className="text-primary underline">
              Fee schedule for gyoseishoshi work (Yotsuba Gyoseishoshi Office)
            </Link>
          </p>
        </>
      ),
    },
    {
      h2: "Please note",
      body: (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted">
          The amounts on this page are an explanation of the statutory maximums; an individual quotation is presented at the time of consultation.
        </p>
      ),
    },
  ],
  faqHeading: "Frequently asked questions about our fees",
  faqItems: [
    {
      q: "How much is the brokerage commission?",
      a: "For both sales and leasing, we work within the statutory maximum prescribed by the Real Estate Brokerage Act (宅地建物取引業法). For sales (where the sale price exceeds 4 million yen), the statutory maximum is “sale price × 3% + 60,000 yen + consumption tax”; for leasing it is within “one month's rent plus consumption tax.” Because the specific amount varies with the property and the scope of your request, we quote it individually.",
    },
    {
      q: "Is the consultation free?",
      a: "Consultations are free — the first and every one thereafter. If a fee should apply, we will present a quotation. Please feel free to contact us first.",
    },
    {
      q: "Is the appraisal free?",
      a: "Yes. There is no charge for a sale appraisal, and you decide whether to proceed after seeing it. A buyout price varies with the condition, location and timing of the property, so we present it individually after the appraisal.",
    },
    {
      q: "Are gyoseishoshi fees separate?",
      a: "Yes, they are separate. Legal work such as inheritance documents and permits and licenses is undertaken by the affiliated Yotsuba Gyoseishoshi Office under a separate contract and separate fees. Because fees vary with the scope of work, we provide a quotation. For details, see the “Fee schedule for gyoseishoshi work” page (/legal/ryokin).",
    },
  ],
  relatedAria: "Related links",
  relatedHeading: "Related pages",
  relatedLinks: [
    { href: "/souzoku", label: "Inheriting real estate in Bunkyo" },
    { href: "/toushi", label: "Investment and business-use properties" },
    { href: "/legal", label: "Yotsuba Gyoseishoshi Office" },
    { href: "/contact", label: "Contact" },
  ],
  authorAlt: "Joji Uramatsu, Representative Director of Yotsuba Real Estate Co., Ltd.",
  authorLabel: "About the author",
  authorBio:
    `Joji Uramatsu｜Representative Director of Yotsuba Real Estate Co., Ltd.; full-time Licensed Real Estate Transaction Specialist (宅地建物取引士). Gyoseishoshi (Administrative Scrivener). Former China General Bureau Chief of the Mainichi Shimbun (34 years as a journalist). Stationed in China, Taiwan, and Thailand. ${SR_BIO.en}.`,
};

// 繁体字（C-6-1・C-6-2 の確定語彙を踏襲。宅地建物取引業法＝宅地建物交易業法（日本語：宅地建物取引業法））
const ZH_TW: RyokinCopy = {
  metaTitle: "費用說明｜仲介手續費與諮詢方式",
  metaDesc:
    "四葉不動産株式会社的費用說明。買賣・租賃的仲介手續費（日本語：仲介手数料）在宅地建物交易業法（日本語：宅地建物取引業法）所定法定上限的範圍內，諮詢免費（初次與第2次以後皆同）。繼承手續等法務業務，由四葉行政書士事務所另行簽訂契約、另行計費承辦。具體金額將個別報價。TEL 03-6161-9428。",
  breadcrumbHome: "首頁",
  breadcrumbCurrent: "費用說明",
  h1: "費用說明",
  answerBlock:
    "四葉不動産株式会社的買賣仲介手續費（日本語：仲介手数料），在宅地建物交易業法（日本語：宅地建物取引業法）所定上限的範圍內提供。諮詢免費（初次與第2次以後皆同）。繼承手續等法務業務，由四葉行政書士事務所另行簽訂契約、另行計費承辦。具體金額因物件與委託內容而異，將為您報價。",
  sections: [
    {
      h2: "不動產仲介手續費（買賣）",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            買賣的仲介手續費，依宅地建物交易業法（日本語：宅地建物取引業法）訂有報酬上限。買賣價格超過400萬日圓時的法定上限，以下列速算公式計算。
          </p>
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink">
            <strong>法定上限（買賣價格超過400萬日圓時）</strong>
            ：買賣價格×3%＋6萬日圓＋消費稅
          </p>
          <p className="mt-3 leading-relaxed text-text">
            依買賣價格區間的法定上限如下（均另加消費稅）。
          </p>
          <FeeTable head={["買賣價格", "法定上限（未含消費稅）"]} rows={SALE_ROWS["zh-tw"]} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※800萬日圓以下的土地建物買賣媒介，考量現場調查等所需費用，經與委託人合意，可收取上限<strong>33萬日圓（含消費稅）</strong>（2024年7月1日施行）。
          </p>
          <p className="mt-3 leading-relaxed text-text">
            本公司的仲介手續費，在此法定上限的範圍內，依物件與委託內容個別報價。
          </p>
        </>
      ),
    },
    {
      h2: "仲介手續費（租賃）",
      body: (
        <p className="mt-3 leading-relaxed text-text">
          租賃的仲介手續費，依宅地建物交易業法（日本語：宅地建物取引業法）訂定法定上限為
          <strong>租金1個月份＋消費稅以內</strong>。本公司的仲介手續費在此法定上限的範圍內提供。
        </p>
      ),
    },
    {
      h2: "諮詢・估價・租賃管理的費用",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            <strong>諮詢免費（初次與第2次以後皆同）。</strong>
            如需收費，將提出報價。
          </p>
          <FeeTable head={["項目", "費用"]} rows={OWN_ROWS["zh-tw"]} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※收購的提案金額，因物件狀況、地點與時期而有幅度，將於估價後個別提出。租賃管理的費率，依管理範圍（收租、房客對應、修繕復原的安排等）而定。
          </p>
        </>
      ),
    },
    {
      h2: "行政書士業務的費用",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            繼承文件、許可認可等法務業務，由併設的四葉行政書士事務所另行簽訂契約、另行計費承辦。因業務內容而異，將為您報價。
          </p>
          {/* /legal/ryokin は zh-tw 版が実在する（同ページ COPY に zh-tw あり）＝繁体字版へリンクする */}
          <p className="mt-3 text-sm">
            <Link href={addLocalePrefix("/legal/ryokin", "zh-tw")} className="text-primary underline">
              行政書士業務的報酬金額表請見此（四葉行政書士事務所）
            </Link>
          </p>
        </>
      ),
    },
    {
      h2: "請您確認",
      body: (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted">
          本頁的金額為法令上上限的說明，個別報價將於諮詢時提出。
        </p>
      ),
    },
  ],
  faqHeading: "常見問題",
  faqItems: [
    {
      q: "仲介手續費是多少？",
      a: "買賣・租賃均在宅地建物交易業法（日本語：宅地建物取引業法）所定法定上限的範圍內提供。買賣（買賣價格超過400萬日圓時）的法定上限為「買賣價格×3%＋6萬日圓＋消費稅」，租賃的法定上限為「租金1個月份＋消費稅」以內。具體金額因物件與委託內容而異，將個別報價。",
    },
    {
      q: "諮詢免費嗎？",
      a: "諮詢免費，初次與第2次以後皆免費。如需收費，將提出報價。請先隨時與我們聯絡。",
    },
    {
      q: "估價是免費的嗎？",
      a: "免費。出售估價不會產生費用，看過估價後再決定是否委託即可。收購價格因物件狀況、地點與時期而有幅度，將於估價後個別提出。",
    },
    {
      q: "行政書士業務的費用是分開的嗎？",
      a: "是分開的。繼承文件、許可認可等法務業務，由併設的四葉行政書士事務所另行簽訂契約、另行計費承辦。因業務內容而異，將為您報價。詳情請參閱「行政書士業務的報酬金額表」頁面（/legal/ryokin）。",
    },
  ],
  relatedAria: "相關連結",
  relatedHeading: "本頁的相關連結",
  relatedLinks: [
    { href: "/souzoku", label: "在文京區繼承不動產" },
    { href: "/toushi", label: "投資用・事業用不動產" },
    { href: "/legal", label: "四葉行政書士事務所" },
    { href: "/contact", label: "聯絡我們" },
  ],
  authorAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
  authorLabel: "本文作者",
  // C-6-2 で確定した繁体字の署名文言（日本語原文が同一のため一字一句そのまま使用）
  authorBio:
    `浦松 丈二｜四葉不動産株式会社 代表取締役（負責人）・專任宅地建物交易士（日本語：宅地建物取引士）。行政書士。前每日新聞中國總局長（記者資歷34年）。曾派駐中國、台灣與泰國。${SR_BIO.zhTw}。`,
};

// 簡体字（C-6-1・C-6-2 の確定語彙を踏襲。大陸読者に自然な語彙＝中介手续费・合同）
const ZH: RyokinCopy = {
  metaTitle: "费用说明｜中介手续费与咨询方式",
  metaDesc:
    "四葉不動産株式会社的费用说明。买卖・租赁的中介手续费（日本語：仲介手数料）在宅地建物交易业法（日本語：宅地建物取引業法）所定法定上限的范围内，咨询免费（首次与第2次以后均相同）。继承手续等法务业务，由四葉行政书士事务所另行签订合同、另行计费承办。具体金额将个别报价。TEL 03-6161-9428。",
  breadcrumbHome: "首页",
  breadcrumbCurrent: "费用说明",
  h1: "费用说明",
  answerBlock:
    "四葉不動産株式会社的买卖中介手续费（日本語：仲介手数料），在宅地建物交易业法（日本語：宅地建物取引業法）所定上限的范围内提供。咨询免费（首次与第2次以后均相同）。继承手续等法务业务，由四葉行政书士事务所另行签订合同、另行计费承办。具体金额因房屋与委托内容而异，将为您报价。",
  sections: [
    {
      h2: "不动产中介手续费（买卖）",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            买卖的中介手续费，依宅地建物交易业法（日本語：宅地建物取引業法）订有报酬上限。买卖价格超过400万日元时的法定上限，以下列速算公式计算。
          </p>
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink">
            <strong>法定上限（买卖价格超过400万日元时）</strong>
            ：买卖价格×3%＋6万日元＋消费税
          </p>
          <p className="mt-3 leading-relaxed text-text">
            按买卖价格区间的法定上限如下（均另加消费税）。
          </p>
          <FeeTable head={["买卖价格", "法定上限（不含消费税）"]} rows={SALE_ROWS.zh} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※800万日元以下的土地建筑买卖中介，考虑现场调查等所需费用，经与委托人达成一致，可收取上限<strong>33万日元（含消费税）</strong>（2024年7月1日施行）。
          </p>
          <p className="mt-3 leading-relaxed text-text">
            本公司的中介手续费，在此法定上限的范围内，依房屋与委托内容个别报价。
          </p>
        </>
      ),
    },
    {
      h2: "中介手续费（租赁）",
      body: (
        <p className="mt-3 leading-relaxed text-text">
          租赁的中介手续费，依宅地建物交易业法（日本語：宅地建物取引業法）订定法定上限为
          <strong>租金1个月份＋消费税以内</strong>。本公司的中介手续费在此法定上限的范围内提供。
        </p>
      ),
    },
    {
      h2: "咨询・估价・租赁管理的费用",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            <strong>咨询免费（首次与第2次以后均相同）。</strong>
            如需收费，将提出报价。
          </p>
          <FeeTable head={["项目", "费用"]} rows={OWN_ROWS.zh} />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            ※收购的提案金额，因房屋状况、地点与时期而有幅度，将于估价后个别提出。租赁管理的费率，依管理范围（收租、租客对应、修缮复原的安排等）而定。
          </p>
        </>
      ),
    },
    {
      h2: "行政书士业务的费用",
      body: (
        <>
          <p className="mt-3 leading-relaxed text-text">
            继承文件、许可认可等法务业务，由并设的四葉行政书士事务所另行签订合同、另行计费承办。因业务内容而异，将为您报价。
          </p>
          {/* /legal/ryokin は zh 版が実在する（同ページ COPY に zh あり）＝簡体字版へリンクする */}
          <p className="mt-3 text-sm">
            <Link href={addLocalePrefix("/legal/ryokin", "zh")} className="text-primary underline">
              行政书士业务的报酬金额表请见此（四葉行政书士事务所）
            </Link>
          </p>
        </>
      ),
    },
    {
      h2: "请您确认",
      body: (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted">
          本页的金额为法令上上限的说明，个别报价将于咨询时提出。
        </p>
      ),
    },
  ],
  faqHeading: "常见问题",
  faqItems: [
    {
      q: "中介手续费是多少？",
      a: "买卖・租赁均在宅地建物交易业法（日本語：宅地建物取引業法）所定法定上限的范围内提供。买卖（买卖价格超过400万日元时）的法定上限为“买卖价格×3%＋6万日元＋消费税”，租赁的法定上限为“租金1个月份＋消费税”以内。具体金额因房屋与委托内容而异，将个别报价。",
    },
    {
      q: "咨询免费吗？",
      a: "咨询免费，首次与第2次以后均免费。如需收费，将提出报价。请先随时与我们联系。",
    },
    {
      q: "估价是免费的吗？",
      a: "免费。出售估价不会产生费用，看过估价后再决定是否委托即可。收购价格因房屋状况、地点与时期而有幅度，将于估价后个别提出。",
    },
    {
      q: "行政书士业务的费用是分开的吗？",
      a: "是分开的。继承文件、许可认可等法务业务，由并设的四葉行政书士事务所另行签订合同、另行计费承办。因业务内容而异，将为您报价。详情请参阅“行政书士业务的报酬金额表”页面（/legal/ryokin）。",
    },
  ],
  relatedAria: "相关链接",
  relatedHeading: "本页的相关链接",
  relatedLinks: [
    { href: "/souzoku", label: "在文京区继承不动产" },
    { href: "/toushi", label: "投资用・事业用不动产" },
    { href: "/legal", label: "四葉行政书士事务所" },
    { href: "/contact", label: "联系我们" },
  ],
  authorAlt: "四葉不動産株式会社 代表取締役 浦松丈二",
  authorLabel: "本文作者",
  // C-6-2 で確定した簡体字の署名文言（日本語原文が同一のため一字一句そのまま使用）
  authorBio:
    `浦松 丈二｜四葉不動産株式会社 代表取締役（负责人）・专任宅地建物交易士（日本語：宅地建物取引士）。行政书士。前每日新闻中国总局长（记者资历34年）。曾派驻中国、台湾与泰国。${SR_BIO.zh}。`,
};

const COPY: Record<LangCode, RyokinCopy> = { ja: JA, en: EN, "zh-tw": ZH_TW, zh: ZH };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? JA;
  return buildPageMetadata({
    businessKey: "realestate",
    // 社名はレイアウトのtitleテンプレート（%s | 四葉不動産）が付与＝ここでは書かない（重複防止）
    title: c.metaTitle,
    description: c.metaDesc,
    path: "/ryokin",
    keywords: [
      "四葉不動産 料金",
      "文京区 不動産 仲介手数料",
      "仲介手数料 法定上限",
      "不動産 相談 無料 文京区",
    ],
    locale,
    // C-6-3：全4ロケール公開＝availableLocales は既定（ja/en/zh-Hant/zh-Hans の hreflang 4本）
  });
}

export default async function Page() {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? JA;

  return (
    <>
      <Breadcrumb items={[{ name: c.breadcrumbHome, href: "/" }, { name: c.breadcrumbCurrent }]} />

      <article className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-2">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.h1}</h1>
          {/* 冒頭の回答ブロック（タスクB-1確定文言） */}
          <p className="mt-4 rounded-xl border border-border bg-primary-tint p-4 leading-relaxed text-ink">
            {c.answerBlock}
          </p>
        </header>
        <section className="mt-6 rounded-xl border border-primary/25 bg-primary-tint p-5"><h2 className="text-xl font-semibold">{locale === "ja" ? "賃貸の仲介手数料" : RENTAL_CAMPAIGN_COPY[locale].fee}</h2><p className="mt-3 leading-7">{RENTAL_CAMPAIGN_COPY[locale].definition}</p>{locale === "ja" && <Link href="/bunkyo/chukai-033" className="mt-3 inline-block text-primary underline">{RENTAL_CAMPAIGN_COPY[locale].fee}</Link>}</section>
        <RentalCampaignCta locale={locale} kind="fee033" sourcePage="/ryokin" />


        {c.sections.map((s) => (
          <section key={s.h2} className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-ink">{s.h2}</h2>
            {s.body}
          </section>
        ))}

        {/* FAQPage JSON-LD＝タスクB-1指示によりこのページで出力（ヘッダーコメント参照） */}
        <div className="-mx-4 mt-2">
          <Faq
            items={c.faqItems}
            heading={c.faqHeading}
            withJsonLd
            inLanguage={BCP47_BY_LOCALE[locale]}
            ariaLabel={c.faqHeading}
          />
        </div>

        <nav aria-label={c.relatedAria} className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
          <div className="font-medium text-ink">{c.relatedHeading}</div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-primary">
            {c.relatedLinks.map((l) => (
              <li key={l.href}>
                <Link href={addLocalePrefix(l.href, locale)} className="underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 署名（E-E-A-T・原稿_不動産サイト共通）＝/access・/faq と同一文言 */}
        <aside className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <img
            src="/staff/uramatsu-square.webp"
            alt={c.authorAlt}
            width={48}
            height={48}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
          <p className="text-xs leading-relaxed text-text-muted">
            <strong>{c.authorLabel}</strong> {c.authorBio}
          </p>
        </aside>
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand businessKey="realestate" />
      </div>
    </>
  );
}

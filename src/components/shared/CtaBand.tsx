// CtaBand — 本文末CTA帯（全ページ末に1つ）
// 見出し・リード文・営業時間は「テナント別」（各原稿サイト共通より）。主CTA＝代表LINE（テナント主色の塗り）。
// お問い合わせ・電話は補助（アウトライン中立）。DESIGN.md「1ビュー1主色」を守る。
// 色は route group が割り当てる --color-primary を bg-primary / text-primary で読む（テナント非依存）。
// 2026-07-11 ロケール保持＋4ロケール化（診断_ロケール保持リンク_v1 §B-1）：
//   - server維持（client化禁止＝office.tsのSR名をクライアントJSに載せない）。async化して部品内部でlocale取得。
//   - 内部リンク（contactHref）のみ addLocalePrefix。LINE・tel: は外部＝変換しない。
//   - 呼び出し側は変更不要（hrefは接頭辞なしで受け、付与はここで1回だけ＝二重適用禁止）。
//   - 文言：共通ラベルは下のLABELS、テナント別はoffice.tsのTENANT_CTA_I18N（server専用のまま）。
//     ja正文はTENANT値の参照＝バイト不変。en/zh-tw/zh=監修前ドラフト。
// 2026-07-24 CTA刷新v2（浦松指示・コンバージョン強化）：
//   - variant="property"（物件条件インテーク）を追加：見出し・リード・LINEボタン文言を
//     PROPERTY_CONDITIONS_CTA_I18N に差し替え、コピペ用テンプレ＋「コピー」ボタンを表示、
//     お問い合わせリンクに ?intent=bukken を付与（フォーム側でカテゴリ・本文を自動プリセット）。
//   - variant="property-gh"：ja のみGH向け文言（指定基準寄り・店舗系の語なし）。他ロケールはテナント既定へ。
//   - 信頼マイクロコピー（代表直通・24時間受付）を全バリアント共通で表示（group-homeピラーの
//     ctaLineNote確定文言と同趣旨。en/zh=監修前ドラフト）。
//   - ボタン・コピー操作は CtaBandActions（client）に分離＝GA4クリック計測。office.tsはserver側のまま。
import {
  OFFICE,
  TENANT,
  TENANT_CTA_I18N,
  PROPERTY_CONDITIONS_CTA_I18N,
  PROPERTY_CONDITIONS_CTA_HOME_I18N,
  PROPERTY_CONDITIONS_CTA_GROUPHOME_JA,
  SALE_CONSULT_CTA_I18N,
  type BusinessKey,
} from "@/lib/shared/office";
import {
  PROPERTY_TEMPLATE,
  PROPERTY_TEMPLATE_GENERAL,
  PROPERTY_TEMPLATE_GH_JA,
  TEMPLATE_COPY_LABELS,
} from "@/lib/shared/property-intake";
import { COMPANY_CTA, COMPANY_TEMPLATE, COMPANY_CONTACT_INTENT } from "@/lib/shared/company-intake";
import { CtaBandActions } from "@/components/shared/CtaBandActions";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import type { LangCode } from "@/config/languages";

/**
 * CTA帯のバリアント（2026-07-24）。
 * property=物件条件インテーク（事業用寄り・4ロケール）／property-general=トップ等の入口向け
 * （住まい・事業用の両対応・4ロケール）／property-gh=GH向け（jaのみ・他ロケールは既定）
 * ／company=会社設立向け（4ロケール・既存kyoninkaカテゴリ連携）
 * ／sale=売却・相続向け（4ロケール・テンプレなし・intent既定"sale"。2026-09-05 月次点検 INIT-04/NEW-SALE-2）
 */
export type CtaBandVariant = "property" | "property-general" | "property-gh" | "sale" | "company";

// 部品内共通ラベル（SR名なし・汎用語のみ）。ja=現行文字列そのまま（バイト不変）。
// en=HomePageContent既存訳（Chat on LINE (free)/Contact/Call）準拠。zh系=監修前ドラフト。
const LABELS: Record<LangCode, { aria: string; line: string; contact: string; tel: string }> = {
  ja: { aria: "お問い合わせ", line: "LINEで一言相談（無料）", contact: "お問い合わせ", tel: "電話" },
  en: { aria: "Contact", line: "Chat on LINE (free)", contact: "Contact", tel: "Call" },
  // 2026-07-11：LINEボタンの中文訳をHomePageContent（トップ）＝en「Chat on LINE (free)」と同じ
  // 「動作＋（無料）」構造に統一（旧「LINE免費諮詢／LINE免费咨询」から変更＝サイト内の表記ゆれ解消）。
  "zh-tw": { aria: "聯絡我們", line: "用LINE諮詢（免費）", contact: "聯絡我們", tel: "電話" },
  zh: { aria: "联系我们", line: "用LINE咨询（免费）", contact: "联系我们", tel: "电话" },
};

// アクセス表記の4ロケール（ja=OFFICE.access参照＝バイト不変。en/zh系=HomePageContent accessLine準拠）
const ACCESS_I18N: Record<LangCode, string> = {
  ja: OFFICE.access,
  en: "5 min walk from Myogadani Sta. (Tokyo Metro Marunouchi Line)",
  "zh-tw": "東京Metro丸之內線「茗荷谷」站 步行5分",
  zh: "东京Metro丸之内线“茗荷谷”站 步行5分",
};

// 信頼マイクロコピー（2026-07-24）。group-homeピラーの「LINEは代表・浦松 丈二の個人アカウントに直接
// つながります」（浦松検収済み）と同趣旨＋24時間受付を追記。ja=確定文言、en/zh系=監修前ドラフト。
const TRUST_I18N: Record<LangCode, string> = {
  ja: "LINEは代表・浦松丈二に直接つながります。24時間受付・順次お返事します。",
  en: "LINE connects you directly to our representative, Joji Uramatsu. Messages are accepted 24/7 and answered in order.",
  "zh-tw": "LINE直接連到代表・浦松丈二本人。24小時皆可傳訊，將依序回覆。",
  zh: "LINE直接连到代表・浦松丈二本人。24小时均可发送信息，将依序回复。",
};

type Props = {
  businessKey: BusinessKey;
  /** 見出しの上書き（省略時はvariant→テナント既定の順で解決） */
  heading?: string;
  /** リード文の上書き（省略時はvariant→テナント既定の順で解決） */
  subtext?: string;
  /** CTA帯バリアント（2026-07-24）。省略時は従来のテナント既定 */
  variant?: CtaBandVariant;
  /**
   * お問い合わせフォームの相談カテゴリをプリセットするキー（2026-07-27）。
   * 値は contact-intake.ts の CATEGORY_ORDER_BY_BUSINESS のキー。
   * 当該フォームに出さないキーはフォーム側が無視する（存在しない選択肢を選ばせない）ため、
   * 誤値を渡しても壊れず「未選択」に落ちるだけ。
   * variant と併用した場合は本propが優先する（本文テンプレの挿入は variant 側のまま活かす）。
   */
  intent?: string;
  /**
   * お問い合わせボタンの遷移先の上書き（2026-09-24・大家募集ページ）。同一ページ内の専用フォーム（"#form"）へ
   * 向けるために使う。そのまま渡す（接頭辞・?intent= を付与しない）。省略時は従来どおり /contact?intent=。
   */
  contactHref?: string;
};

export async function CtaBand({
  businessKey,
  heading,
  subtext,
  variant,
  intent: intentProp,
  contactHref: contactHrefProp,
}: Props) {
  const locale = await getRequestLocale();
  const t = TENANT[businessKey];
  const c = TENANT_CTA_I18N[businessKey][locale] ?? TENANT_CTA_I18N[businessKey].ja;
  const l = LABELS[locale] ?? LABELS.ja;

  // バリアント解決（優先度：明示props > variant > テナント既定）
  // intent＝contactフォームのプリセット種別（2026-07-24 v2.2：バリアントとテンプレの取り違え防止のため3値化。
  // フォーム側 ContactForm.tsx が bukken=事業用／bukken-general=一般／bukken-gh=GH系 のテンプレへ振り分ける）
  let vHeading: string | undefined;
  let vLead: string | undefined;
  let vLineLabel: string | undefined;
  let template: string | undefined;
  let intent = "";
  if (variant === "company") {
    const company = COMPANY_CTA[locale];
    vHeading = company.heading;
    vLead = company.lead;
    vLineLabel = company.line;
    template = COMPANY_TEMPLATE[locale];
    intent = COMPANY_CONTACT_INTENT;
  } else if (variant === "property") {
    const p = PROPERTY_CONDITIONS_CTA_I18N[locale] ?? PROPERTY_CONDITIONS_CTA_I18N.ja;
    vHeading = p.ctaHeading;
    vLead = p.ctaLead;
    vLineLabel = p.lineLabel;
    template = PROPERTY_TEMPLATE[locale] ?? PROPERTY_TEMPLATE.ja;
    intent = "bukken";
  } else if (variant === "property-general") {
    const p = PROPERTY_CONDITIONS_CTA_HOME_I18N[locale] ?? PROPERTY_CONDITIONS_CTA_HOME_I18N.ja;
    vHeading = p.ctaHeading;
    vLead = p.ctaLead;
    vLineLabel = p.lineLabel;
    template = PROPERTY_TEMPLATE_GENERAL[locale] ?? PROPERTY_TEMPLATE_GENERAL.ja;
    intent = "bukken-general";
  } else if (variant === "property-gh" && locale === "ja") {
    // GH系はja先行公開のためjaのみ。他ロケールはテナント既定にフォールバック（存在しない訳を出さない）
    vHeading = PROPERTY_CONDITIONS_CTA_GROUPHOME_JA.ctaHeading;
    vLead = PROPERTY_CONDITIONS_CTA_GROUPHOME_JA.ctaLead;
    vLineLabel = PROPERTY_CONDITIONS_CTA_GROUPHOME_JA.lineLabel;
    template = PROPERTY_TEMPLATE_GH_JA;
    intent = "bukken-gh";
  } else if (variant === "sale") {
    // 2026-09-05 月次点検（INIT-04/NEW-SALE-2）：売却・相続向け（売る側・相続人・海外オーナー）。
    // 物件条件のテンプレ（コピー欄）は出さない。intent 既定は "sale"（コラムは intentProp で souzoku／management に上書き）。
    const p = SALE_CONSULT_CTA_I18N[locale] ?? SALE_CONSULT_CTA_I18N.ja;
    vHeading = p.ctaHeading;
    vLead = p.ctaLead;
    vLineLabel = p.lineLabel;
    intent = "sale";
  }

  // 2026-07-27：明示のintentはvariant由来より優先する。
  // 例＝/global は property-general のテンプレ（住まい／事業用の受け分け）を活かしたまま、
  // カテゴリだけ「外国人のお部屋探し・多言語対応」に着地させたい。
  if (intentProp) intent = intentProp;
  // 2026-09-05：sale バリアントを management（海外オーナー向け）で使うときは、LINEラベル
  // 「売却・相続の相談」が記事と噛み合わないため既定ラベル（l.line）に戻す。見出し・リードはそのまま。
  if (variant === "sale" && intent === "management") vLineLabel = undefined;

  const copyLabels = TEMPLATE_COPY_LABELS[locale] ?? TEMPLATE_COPY_LABELS.ja;
  const lead = subtext ?? vLead ?? c.ctaLead;
  // 内部リンク＝ここで1回だけ接頭辞付与（二重適用禁止）。intent時はフォームのプリセット用クエリを付与
  const contactHref =
    contactHrefProp ?? addLocalePrefix(t.contactHref, locale) + (intent ? `?intent=${intent}` : "");

  return (
    <section aria-label={l.aria} className="my-6 rounded-2xl bg-primary-tint px-6 py-8 text-center">
      <h2 className="font-serif text-xl font-semibold text-ink">{heading ?? vHeading ?? c.ctaHeading}</h2>
      {lead && <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">{lead}</p>}
      {/* 2026-09-01 LINE中継ページ化：LINE直リンクをやめ内部 /line を経由（WebViewのLINE起動
          ブロック対策）。内部リンク＝ここで1回だけ接頭辞付与（contactHrefと同じ規約） */}
      <CtaBandActions
        lineHref={addLocalePrefix("/line", locale)}
        lineLabel={vLineLabel ?? l.line}
        contactHref={contactHref}
        contactLabel={l.contact}
        telHref={OFFICE.telHref}
        telLabel={`${l.tel} ${OFFICE.tel}`}
        template={template}
        copyLabel={variant === "company" ? COMPANY_CTA[locale].copy : copyLabels.copy}
        copiedLabel={copyLabels.copied}
        trustNote={TRUST_I18N[locale] ?? TRUST_I18N.ja}
      />
      <p className="mt-3 text-xs text-text-muted">
        {ACCESS_I18N[locale] ?? ACCESS_I18N.ja}
        {c.hours ? `｜${c.hours}` : ""}
      </p>
    </section>
  );
}

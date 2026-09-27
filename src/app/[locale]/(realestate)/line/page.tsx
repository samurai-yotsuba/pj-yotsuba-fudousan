export const dynamic = "force-dynamic";
import { RentalLineMessage } from "@/components/bukken/RentalLineMessage";
import { getPublicPropertyBySlug, isPropertyLocaleAllowed } from "@/lib/properties";
import { findSchoolBySlug } from "@/lib/school-district";
import { FEE033_PATH } from "@/lib/rental-campaign";
// /line — LINE中継ページ（2026-09-01 新設・浦松指示）
//
// 背景：X等のアプリ内ブラウザ（WebView）がLINE起動用URL（line://／ユニバーサルリンク）の
// 遷移をブロックし、LINE CTAをタップしても元画面に戻る。LINE公式も「アプリ側の仕様であり
// LINE側では予防できない」と明記。対策として自ドメインの本ページを経由させ、
// ①友だち追加ボタン ②URLコピー ③QRコード ④開き直し案内＋代替導線 の4段で受ける。
//
// 設計制約（指示書・省略不可）：
//   - JSによる自動リダイレクトなし（必ずユーザーのタップ起点）／UA判定による分岐なし
//   - noindex（robots: index:false, follow:true）
//   - 3事業共通の1枚（LINEアカウントが3事務所共通の1本のため。浦松確定 2026-09-01）
//   - 一体提供と誤認されないよう「それぞれ別契約で承ります」の一文を本文に必ず含める
//     （「ワンストップ」等の一体提供表現は使用禁止＝shigyo-compliance-gate）
//   - 営業時間は書かない（24時間受付のため。浦松確定 2026-09-01）
//
// 社労士事務所名を含む文言は本ファイル（server component）にのみ置き、クライアント部品
// （LineBridgePanel）へは汎用ラベルだけを渡す（office-public.tsの方針＝法27条ソース漏れ防止）。
import type { Metadata } from "next";
import type { LangCode } from "@/config/languages";
import { buildPageMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { LINE_URL, OFFICE } from "@/lib/shared/office-public";
import { LineBridgePanel } from "./LineBridgePanel";

// 4ロケール文言。ja=確定（指示書の文言・既存検収済みコピーを踏襲）。en/zh-tw/zh=監修前ドラフト
// （complianceの型は cross-links.ts INDEPENDENT_NOTES_TRIPLE〔石井弁護士レビュー済み〕の表記に準拠。
//  事務所名は各言語とも日本語表記のまま＝固有名）。
const COPY: Record<
  LangCode,
  {
    title: string;
    lead: string;
    compliance: string;
    addBtn: string;
    urlHeading: string;
    copyBtn: string;
    copiedBtn: string;
    copyNote: string;
    qrHeading: string;
    qrAlt: string;
    qrNote: string;
    fallbackHeading: string;
    fallbackText: string;
    telLabel: string;
    contactLabel: string;
    trust: string;
  }
> = {
  ja: {
    title: "LINEで友だち追加",
    lead: "下のボタンからLINEの友だち追加に進めます。ご相談は「一言」からで大丈夫です。",
    // 指示書の必須文言（一字一句変更しない）
    compliance:
      "ご相談内容に応じて、四葉不動産株式会社／四葉行政書士事務所／四葉社会保険労務士事務所のいずれかが、それぞれ別契約で承ります。",
    addBtn: "LINEで友だち追加",
    urlHeading: "友だち追加URL",
    copyBtn: "URLをコピー",
    copiedBtn: "コピーしました",
    copyNote: "ボタンで開かない場合は、コピーしたURLをSafariやChromeのアドレスバーに貼り付けて開いてください。",
    qrHeading: "QRコードで追加",
    qrAlt: "LINE友だち追加用QRコード",
    qrNote: "別の端末のカメラで読み取ってください。",
    fallbackHeading: "LINEが開かない場合",
    fallbackText:
      "LINEが開かない場合は、Safari（iOS）または Chrome（Android）でこのページを開き直してお試しください。お急ぎの場合は、お電話・お問い合わせフォームもご利用いただけます。",
    telLabel: "電話",
    contactLabel: "お問い合わせフォーム",
    // CtaBandの検収済み文言と同一（営業時間は書かない＝24時間受付。浦松確定 2026-09-01）
    trust: "LINEは代表・浦松丈二に直接つながります。24時間受付・順次お返事します。",
  },
  en: {
    title: "Add us on LINE",
    lead: "Tap the button below to add us as a friend on LINE. A one-line message is enough to start.",
    compliance:
      "Depending on the nature of your inquiry, one of Yotsuba Real Estate Co., Ltd., Yotsuba Gyoseishoshi Office, or Yotsuba Sharoushi (Certified Social Insurance and Labor Consultant) Office will handle it, each under a separate engagement.",
    addBtn: "Add friend on LINE",
    urlHeading: "Friend-add URL",
    copyBtn: "Copy URL",
    copiedBtn: "Copied",
    copyNote: "If the button does not open LINE, paste the copied URL into the address bar of Safari or Chrome.",
    qrHeading: "Add via QR code",
    qrAlt: "QR code to add us on LINE",
    qrNote: "Scan it with the camera of another device.",
    fallbackHeading: "If LINE does not open",
    fallbackText:
      "If LINE does not open, please reopen this page in Safari (iOS) or Chrome (Android) and try again. You can also reach us by phone or through the contact form.",
    telLabel: "Call",
    contactLabel: "Contact form",
    trust: "LINE connects you directly to our representative, Joji Uramatsu. Messages are accepted 24/7 and answered in order.",
  },
  "zh-tw": {
    title: "加LINE好友",
    lead: "點選下方按鈕即可加入LINE好友。先傳「一句話」就可以。",
    compliance:
      "視諮詢內容，將由四葉不動産株式会社、四葉行政書士事務所、四葉社会保険労務士事務所其中之一，分別以個別契約承接。",
    addBtn: "用LINE加好友",
    urlHeading: "加好友網址",
    copyBtn: "複製網址",
    copiedBtn: "已複製",
    copyNote: "若按鈕無法開啟LINE，請將複製的網址貼到Safari或Chrome的網址列開啟。",
    qrHeading: "用QR Code加入",
    qrAlt: "LINE加好友QR Code",
    qrNote: "請用另一台裝置的相機掃描。",
    fallbackHeading: "LINE打不開時",
    fallbackText:
      "若LINE無法開啟，請改用Safari（iOS）或Chrome（Android）重新開啟本頁再試一次。也可以使用電話或聯絡表單與我們聯繫。",
    telLabel: "電話",
    contactLabel: "聯絡表單",
    trust: "LINE直接連到代表・浦松丈二本人。24小時皆可傳訊，將依序回覆。",
  },
  zh: {
    title: "加LINE好友",
    lead: "点击下方按钮即可添加LINE好友。先发“一句话”就可以。",
    compliance:
      "视咨询内容，将由四葉不動産株式会社、四葉行政書士事務所、四葉社会保険労務士事務所其中之一，分别以单独合同承接。",
    addBtn: "用LINE加好友",
    urlHeading: "加好友网址",
    copyBtn: "复制网址",
    copiedBtn: "已复制",
    copyNote: "若按钮无法打开LINE，请将复制的网址粘贴到Safari或Chrome的地址栏打开。",
    qrHeading: "用二维码添加",
    qrAlt: "LINE加好友二维码",
    qrNote: "请用另一台设备的相机扫描。",
    fallbackHeading: "LINE打不开时",
    fallbackText:
      "若LINE无法打开，请改用Safari（iOS）或Chrome（Android）重新打开本页再试一次。也可以通过电话或联系表单与我们联系。",
    telLabel: "电话",
    contactLabel: "联系表单",
    trust: "LINE直接连到代表・浦松丈二本人。24小时均可发送信息，将依序回复。",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  const meta = buildPageMetadata({
    businessKey: "realestate",
    title: c.title,
    description: c.lead,
    path: "/line",
    noindex: true,
    locale,
  });
  // 指示書指定＝index:false・follow:true（buildPageMetadataのnoindexはfollow:falseのため上書き）
  return { ...meta, robots: { index: false, follow: true } };
}

export default async function LineBridgePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getRequestLocale();
  const c = COPY[locale] ?? COPY.ja;
  const query = await searchParams ?? {};
  const campaign = typeof query.campaign === "string" && ["fee033", "gakku", "property", "external"].includes(query.campaign) ? query.campaign : null;
  const slug = typeof query.property === "string" && /^[a-z0-9-]{1,180}$/.test(query.property) ? query.property : null;
  const candidate = campaign && slug ? await getPublicPropertyBySlug(slug) : null;
  const property = candidate && isPropertyLocaleAllowed(candidate, locale) ? candidate : null;
  const school = typeof query.school === "string" ? findSchoolBySlug(query.school) : undefined;
  const from = typeof query.from === "string" && (/^\/(?:gakku(?:\/[a-z-]+){0,2}|bukken|ryokin)$/.test(query.from) || query.from === FEE033_PATH || query.from === "/") ? query.from : FEE033_PATH;
  const source = property ? `/bukken/${property.slug}` : from;
  const message = campaign ? [
    { ja: "賃貸物件について相談します。募集状況の確認をお願いします。", en: "I would like to ask about a rental. Please check its availability.", "zh-tw": "想諮詢租屋，請確認招租狀況。", zh: "想咨询租房，请确认招租状态。" }[locale],
    ...(property ? [`${property.title}`, `ID: ${property.slug}`] : []),
    ...(school ? [school.formalName] : []),
    `https://luck428.com${addLocalePrefix(source, locale)}`,
    `Source: ${campaign}`,
  ].join("\n") : null;
  return (
    <section className="px-4 pb-16 pt-24 sm:pt-28">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{c.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">{c.lead}</p>
        {/* 表示コンプライアンス（必須・省略不可）：3事業の一体提供と誤認させない別契約の明示 */}
        <p className="mt-3 text-xs leading-relaxed text-text-muted">{c.compliance}</p>
        {message && <RentalLineMessage message={message} locale={locale} />}
        <LineBridgePanel
          lineUrl={LINE_URL}
          telHref={OFFICE.telHref}
          telDisplay={OFFICE.tel}
          contactHref={addLocalePrefix("/contact", locale)}
          labels={{
            addBtn: c.addBtn,
            urlHeading: c.urlHeading,
            copyBtn: c.copyBtn,
            copiedBtn: c.copiedBtn,
            copyNote: c.copyNote,
            qrHeading: c.qrHeading,
            qrAlt: c.qrAlt,
            qrNote: c.qrNote,
            fallbackHeading: c.fallbackHeading,
            fallbackText: c.fallbackText,
            telLabel: c.telLabel,
            contactLabel: c.contactLabel,
            trust: c.trust,
          }}
        />
      </div>
    </section>
  );
}

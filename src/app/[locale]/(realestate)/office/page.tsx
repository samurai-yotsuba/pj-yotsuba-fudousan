// /office（会社設立×オフィス開設ピラー）＝シナジー領域#15（2026-07-22・日本語版のみ・監修前ドラフト実装）
// 方式＝RealestateServicePage（手本=/toushi/shitei-shinsei C-2）。ja先行公開：
//   availableLocales:["ja"]・sitemap側も locales:["ja"]。COPYフォールバックで他ロケールにもja本文を表示。
// 表示コンプライアンス（C-2検収準拠）：
//   ・業務一体提供を示唆する語（ワンストップ等）は全文で使用禁止。
//   ・独占業務の表現＝「作成」が行政書士の独占業務（行政書士法1条の3・19条1項）。「作成・提出は独占業務」とまとめない。
//     ※令和8年（2026年）1月1日施行の改正で1条の2（職責）が新設され条番号が繰り下がった。旧1条の2＝現1条の3。
//   ・設立登記の申請は司法書士の業務＝当方は行わず提携司法書士をご紹介（/legal/services/company の確定表現に準拠）。
//   ・数値（資本金・費用・期間）は断定しない。バーチャルオフィス可否は「事業内容によります」で統一。
// FAQPage JSON-LD＝faqJa（kaigyo新設2問＋corporate/companyの既存2問）を参照（文字列コピー禁止）。
// hero＝legal-company-16x9.webp を暫定共用（専用画像は未制作＝TODO）。
//
// 【2026-07-24 強化パス】AIモード定点#15は07-22公開後も×/×継続（TOSBEC・中小企業振興公社等の公的機関が独占）のため、
//   浦松承認（既存ページ強化を選択・新規ファイルは作成しない）に基づき本文・FAQ・内部リンクを補強：
//   ・§4に許認可の具体例（宅建業・建設業・古物・飲食・労働者派遣）を追加＝キーワード面を拡張（条文番号は新規に引用せず、
//     既存ページ規範どおり一般的情報として記載＝断定回避）。
//   ・§5に「経営管理ビザ」の通称を明記＝定点#7（経営管理ビザ 会社設立 ワンストップ）との接続を強化（同一の空白×/×問題）。
//   ・§2の対応エリアに豊島区の例示を追加＝既存FAQ（隣接区/souzoku）の確定文言を再利用（新規の地域断定なし）。
//   ・faqJaのkaigyoセクションに関連2問を追加、/office側FAQ表示を4問→6問に拡張。
//   ・/toushi・/legal/services/company（ともにja本文のみ）から/officeへの内部リンクを新設＝相互リンクの非対称を解消。
//
// 【2026-07-25 差別化リライト（浦松検収済みドラフト）】定点#15はAIが「会社設立の総合窓口」の問いとして処理し公的窓口（TOSBEC等）が
//   独占するため、当社固有の土俵＝「許認可の要件がオフィス物件の条件に跳ね返る」へ訴求軸を再角度：title/description/H1/リード置換、
//   §2確認ポイント1項目・§4末尾「公的窓口との使い分け」段落・TOSBEC FAQ 1問（6→7問）・許認可コラム3本への内部リンク追加（既存要素の削除なし）。
//
// 【2026-08-10 canonical是正（定点#15・本文は変更していない）】6段階の切り分けで、詰まっているのは第3段階＝索引と判定。
//   第1・2・4・5段階は健全（担当ページ有・HTTP200・被リンク11ページ・設問語7語すべて本文にあり）だが
//   `site:luck428.com/office` は0件（同時に測った対照6件はすべてヒット）。
//   実測した唯一のコード側の欠陥＝ロケール接頭辞つきURLが自分自身をcanonicalに指していたこと：
//     /en/office・/zh/office・/zh-tw/office はいずれもHTTP200で「日本語本文」を返し、
//     canonical はそれぞれ /en/office・/zh/office・/zh-tw/office（＝自己参照）だった。
//     さらに本ページのフッタ言語切替が各2本ずつリンクしているため、これらは実際に辿れる重複URL。
//   本PRは generateMetadata に locale:"ja" を固定して4URLを /office に正規化するだけ。本文・FAQ・内部リンクは一切変更しない
//   （本文強化は 2026-07-22／07-24／07-25 に3回実施済みで引用×が続いており、同じ段階を4度目に触らない）。
//   ※この欠陥が未索引の原因であることは未検証（確定にはGSCの重複レポートが要るが、AIはGSCを操作しない）。
import { NonresidentPropertyReview } from "@/components/legal/NonresidentCompanyReview";
import { getRequestLocale } from "@/lib/getRequestLocale";
import type { Metadata } from "next";
import { PropertySearchSampleTeaser } from "@/components/shared/PropertySearchSample";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { RealestateServicePage, ReH2 } from "@/components/shared/RealestateServicePage";
import { CannotHandle } from "@/components/shared/CannotHandle";
import { Faq } from "@/components/shared/Faq";
import { pickFaqJa } from "@/data/faqJa";
import { InlineCtaProperty } from "@/components/shared/InlineCtaProperty";

// 冒頭の回答ブロック（H1直下）。分離受任の型＝shitei-shinsei確定文言に準拠（監修前ドラフト）
const JA_ANSWER_BLOCK =
  "会社設立では、オフィス物件（本店所在地）の確保と、定款・許認可などの行政手続が同時に進みます。オフィスの所在地や契約条件は、定款の記載や業種別の許認可の要件に影響するため、契約前の確認が重要です。四葉不動産株式会社が事業用物件の紹介・仲介を担当し、定款や許認可申請など官公署に提出する書類の作成は行政書士の独占業務にあたるため、書類の作成・提出は併設の四葉行政書士事務所が別契約で受任します。設立登記の申請は司法書士の業務のため、司法書士をご紹介します。それぞれの契約・担当を分けることで、専門性と適法性を確保します。文京区を含む東京都内に対応します。";

// FAQPage＝faqJa参照（kaigyo新設2問＋2026-07-24強化2問＋2026-07-25 TOSBEC住み分け1問＋corporate/company既存2問＝計7問）
const JA_FAQ_QUESTIONS = [
  "会社設立とオフィス探しは、どちらを先に進めるべきですか？",
  "本店所在地はバーチャルオフィスでもいいですか？",
  "会社設立で必要になる許認可には、具体的にどんな業種がありますか？",
  "経営管理ビザ（外国人の会社設立）でもオフィス探しから相談できますか？",
  "事業用物件の許認可（飲食・古物など）も相談できますか？",
  "東京開業ワンストップセンター（TOSBEC）などの公的窓口と、何が違いますか？",
  "四葉不動産と四葉行政書士事務所はどんな関係ですか？",
];

// §3 役割分担表（登記＝司法書士・税務＝税理士の独占業務に踏み込まない）
const JA_ROLES: { work: string; who: string }[] = [
  { work: "事業用オフィス物件の紹介・仲介（宅地建物取引業）", who: "四葉不動産株式会社" },
  { work: "定款・許認可申請書類の作成・提出（作成は行政書士の独占業務・別契約）", who: "併設の四葉行政書士事務所" },
  { work: "定款の認証（株式会社）", who: "公証人（公証役場）" },
  { work: "設立登記の申請", who: "司法書士をご紹介" },
  { work: "税務署への届出・税務相談", who: "税理士をご紹介" },
];

// §4追加（2026-07-24強化）：許認可の具体例。条文番号は引用せず一般的情報として記載（既存ページ規範に整合）
const JA_LICENSE_EXAMPLES: { type: string; note: string }[] = [
  { type: "宅地建物取引業", note: "事務所ごとに専任の宅地建物取引士の設置が必要です。" },
  { type: "建設業", note: "営業所としての実体（契約締結等の権限を持つ場所）が確認されます。" },
  { type: "古物営業（中古品の売買等）", note: "営業所ごとの許可申請が必要です。" },
  { type: "飲食店営業", note: "店舗が保健所の施設基準を満たすことが前提です。" },
  { type: "労働者派遣事業", note: "事業所の設備・面積等の基準が定められています。" },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    businessKey: "realestate",
    title: "会社設立とオフィス選び｜許認可要件を満たす物件確保の完全ガイド | 四葉不動産",
    description:
      "会社設立で見落とされがちなのが「許認可の要件はオフィス物件の条件に跳ね返る」こと。宅建業・建設業・古物商などは、物件が要件を満たさないと設立後に許可が取れず、移転からやり直しになります。事業用物件の紹介・仲介は四葉不動産株式会社（宅建業）が担当し、定款や許認可申請など官公署に提出する書類の作成は併設の四葉行政書士事務所が別契約で受任。設立登記は司法書士をご紹介します。文京区小日向・茗荷谷駅徒歩5分。",
    path: "/office",
    keywords: [
      "会社設立 オフィス 物件",
      "本店所在地 賃貸オフィス",
      "会社設立 許認可 行政書士",
      "事業用 オフィス 東京 文京区",
      "バーチャルオフィス 本店所在地 注意",
      // 2026-07-25 差別化リライト：許認可要件×物件の軸を追記
      "会社設立 オフィス 許認可 要件",
      "宅建業免許 事務所 要件",
      "建設業許可 営業所",
      "バーチャルオフィス 許認可",
    ],
    // 【2026-08-10 定点#15】canonical は常に ja の /office を指す（手本＝/kikoku・/reasons）。
    // buildPageMetadata は canonical をこの locale から作るため、リクエストロケールを渡すと
    // /en/office・/zh/office・/zh-tw/office が「日本語本文のまま自分自身をcanonicalに指す」重複URLになる。
    // 本ページは availableLocales:["ja"]＝ja本文のみで、他ロケールでも同じ日本語本文を返すため、
    // 正規化先は常に https://luck428.com/office でなければならない。
    locale: "ja",
    absoluteTitle: true,
    availableLocales: ["ja"],
  });
}

export default async function Page() {
  const reviewLocale = await getRequestLocale();
  return (
    <RealestateServicePage
      path="/office"
      answerBlock={JA_ANSWER_BLOCK}
      crumbs={[{ name: "ホーム", href: "/" }, { name: "会社設立とオフィス開設" }]}
      serviceName="会社設立・オフィス開設を見据えた事業用物件の紹介・仲介"
      heroSrc="/hero/legal-company-16x9.webp"
      heroAlt="会社設立・許認可のイメージ（オフィスと設立書類）"
      h1="会社設立とオフィス選び——許認可要件を満たす物件確保の完全ガイド"
      ctaVariant="property"
      lead={
        <p>
          「オフィスが決まらないと、書類が進まない」——それだけではありません。<strong>業種によっては、オフィスが決まっても『その物件では許可が取れない』ことがあります。</strong>会社設立では、本店所在地（オフィス物件）・定款・許認可が同時に動き、許認可の要件（面積・独立性・設備・用途）は物件選びの段階で決まってしまいます。このページでは、許認可要件を満たすオフィス選びの確認ポイントと、<strong>担当・契約の分担</strong>を解説します。
        </p>
      }
      internalLinks={[
        { href: "/toushi", label: "投資用・事業用不動産" },
        { href: "/inshokuten", label: "飲食店開業の完全ガイド" },
        { href: "/ryokin", label: "料金のご案内" },
        { href: "/legal/services/company", label: "四葉行政書士事務所・会社設立と許認可" },
        // 2026-07-25 差別化リライト：許認可×物件コラム3本（ハブ→スポーク・§2「詳しくは下記コラム」の受け先）
        { href: "/legal/column/office-takken-menkyo-jimusho-yoken", label: "コラム：宅建業免許と事務所要件" },
        { href: "/legal/column/office-kensetsugyo-kyoka-eigyosho-yoken", label: "コラム：建設業許可と営業所要件" },
        { href: "/legal/column/office-virtual-office-kyoninka", label: "コラム：バーチャルオフィスで会社設立" },
        { href: "/contact", label: "お問い合わせ" },
      ]}
      crossLinkLead="会社設立の書類・許認可は、関連事業の四葉行政書士事務所のページで詳しく解説しています。"
    >
      <PropertySearchSampleTeaser kind="office" page="/office" />
      {/* §1 本店所在地とオフィス。数値・期間の断定なし */}
      <div>
        <ReH2>会社設立とオフィス探しは、同時に動く</ReH2>
        <p className="mt-3 leading-relaxed text-text">
          会社設立の準備は、定款の作成・認証、資本金の払込み、設立登記へと進みますが、その入口で決めるのが本店所在地です。本店所在地は定款の記載事項であり、登記にも記載されます。オフィスをどこに構えるかが決まらないと、書類が前に進みません。
        </p>
        <p className="mt-3 leading-relaxed text-text">
          逆に、物件を先に契約してから「この場所では予定する事業の許認可が取りにくい」「貸主が法人登記を承諾していない」と判明する例もあります。物件と手続を同じテーブルで進めることが、手戻りを防ぐ近道です。
        </p>
        <p className="mt-3 leading-relaxed text-text">
          自宅を本店所在地にする方法や、バーチャルオフィス・シェアオフィスを使う方法もあります。ただし、業種によっては独立した事務所スペースが許認可の要件とされることがあり、金融機関の口座開設の審査で事務所の実体が確認される場合もあります。どの選択肢が使えるかは事業内容により異なるため、設立前の確認をお勧めします。
        </p>
      </div>

      {/* §2 物件選び（宅建業の領分のみ・法的判断なし） */}
      <div>
        <ReH2>事業用オフィス物件の選び方——契約前の確認ポイント</ReH2>
        <p className="mt-3 leading-relaxed text-text">
          事業用の賃貸借は、住居の賃貸借と勝手が違います。契約前に確認しておきたい主なポイントを挙げます。
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text">
          <li><strong className="text-ink">法人契約・登記の可否</strong>：貸主が本店登記を承諾しているか。設立前の個人名義契約から法人名義への切替え条件。</li>
          <li><strong className="text-ink">用途地域と建物用途</strong>：予定する事業がその場所・その建物で営めるか。</li>
          <li><strong className="text-ink">保証金・敷金と償却</strong>：事業用は住居より保証金が大きいことが一般的です。フリーレントの有無、償却条件。</li>
          <li><strong className="text-ink">原状回復の範囲</strong>：事業用は借主負担の範囲が広くなりがちです。特約の内容を契約前に確認します。</li>
          <li><strong className="text-ink">SOHO・小規模オフィスの制約</strong>：看板掲出・来客対応・24時間利用の可否。</li>
          {/* 2026-07-25 差別化リライト：許認可要件との突合を確認ポイントに明示（既存5項目と重複なし・詳細は関連リンクのコラム3本へ） */}
          <li><strong className="text-ink">予定業種の許認可要件との突合</strong>：宅建業・建設業・古物商などは、事務所の独立性・実体・面積が審査対象になります。契約前に「その物件で許可が取れるか」を確認します（詳しくは下記コラム）。</li>
        </ul>
        <p className="mt-3 leading-relaxed text-text">
          四葉不動産株式会社（宅地建物取引業）が、事業計画と許認可の見通しを踏まえた物件探し・仲介を担当します。文京区・茗荷谷を中心に、豊島区（大塚・巣鴨・池袋など）を含む東京都内の事業用物件に対応します。
        </p>
      </div>

      {/* 中間CTA（2026-07-24 CTA刷新v2）：契約前チェック直後＝高意欲の瞬間に1か所のみ */}
      <InlineCtaProperty page="/office" />

      {/* §3 役割分担。登記＝司法書士・認証＝公証人・税務＝税理士（他士業の独占業務を「当方が行う」形で書かない） */}
      <div>
        <ReH2>会社設立の書類と、担当・契約の分担</ReH2>
        <p className="mt-3 leading-relaxed text-text">
          会社設立に関わる専門家の役割は、法律で分かれています。行政書士法第1条の3第1項は、官公署に提出する書類の作成を行政書士の業務と定めており、定款や許認可申請書類の作成はこれにあたります。設立登記の申請は司法書士の業務のため、当方では行わず、司法書士をご紹介します。
        </p>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary-tint text-left">
              <th className="border border-border px-3 py-2">手続き</th>
              <th className="border border-border px-3 py-2">担当</th>
            </tr>
          </thead>
          <tbody className="text-text">
            {JA_ROLES.map((r) => (
              <tr key={r.work}>
                <td className="border border-border px-3 py-2">{r.work}</td>
                <td className="border border-border px-3 py-2">{r.who}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-text-muted">
          各事業体・専門家とは分離受任・個別契約であり、当社が紹介料を受け取ることはありません。
        </p>
      </div>

      {/* §4 許認可×物件。要件の断定なし＝「事前確認」へ誘導 */}
      <div>
        <ReH2>業種別の許認可——「設立してから」では遅いことがある</ReH2>
        <p className="mt-3 leading-relaxed text-text">
          事業によっては、会社設立とあわせて許認可の取得が必要です。ここで重要なのは、許認可の要件がオフィス物件の条件に跳ね返ることです。たとえば宅建業免許では事務所の独立性が求められ、建設業許可では営業所の実体が確認されます。飲食店営業の許可は、施設基準を満たす物件であることが前提です（詳しくは
          <Link href="/inshokuten" className="text-primary underline">飲食店開業の完全ガイド</Link>
          をご覧ください）。
        </p>
        <p className="mt-3 leading-relaxed text-text">
          「先に物件、後から許認可」でも「先に設立、後から物件」でもなく、設立・物件・許認可を一枚の計画表で進めることが安全です。必要な許認可とその要件が物件に何を求めるかの整理からお手伝いします。個別の要件は、許認可権者への事前確認を踏まえて進めます。
        </p>
        <p className="mt-3 leading-relaxed text-text">
          許認可の種類ごとに、オフィス側で見ておきたい視点の例を挙げます。
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text">
          {JA_LICENSE_EXAMPLES.map((it) => (
            <li key={it.type}>
              <strong className="text-ink">{it.type}</strong>：{it.note}
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-relaxed text-text">
          上記はあくまで一般的な例で、実際の要件は事業内容・自治体により異なります。物件の確認は四葉不動産株式会社が、許認可申請書類の作成は併設の四葉行政書士事務所が、それぞれ別契約で担当します。
        </p>
        {/* 2026-07-25 差別化リライト：公的窓口との使い分け（TOSBECを立てつつ住み分け・検収済みトーン）。
            「東京開業ワンストップセンター」は固有名詞＝「ワンストップ」不使用ルールの唯一の例外 */}
        <p className="mt-3 leading-relaxed text-text">
          <strong className="text-ink">公的窓口との使い分け</strong>：会社設立の手続き全般は、東京開業ワンストップセンター（TOSBEC）など公的な無料相談窓口が心強い味方になります。一方で、「この物件・この間取りで要件を満たすか」という<strong className="text-ink">物件そのものの確認と契約実務</strong>は、不動産取引の領域です。四葉は、宅地建物取引業者（四葉不動産株式会社）と行政書士事務所（四葉行政書士事務所）が同一拠点にあり、物件の適合確認と許認可申請書類の作成（別契約）を並行して進めます。公的窓口と併用いただけます。
        </p>
      </div>

      {/* §5 外国人の会社設立。/legal/services/company の確定表現（会社設立と経営・管理の在留資格は一体で進む）に準拠 */}
      <div>
        <ReH2>外国人の会社設立——在留資格とオフィスの関係</ReH2>
        <p className="mt-3 leading-relaxed text-text">
          外国人の方が日本で起業する場合、会社設立と「経営・管理」の在留資格（一般に「経営管理ビザ」と呼ばれます）は一体で進みます。この在留資格の審査では事業所の確保が重要な要素とされており、オフィス物件の選び方がそのまま在留資格の準備に直結します。四葉行政書士事務所が在留資格の書類作成に対応し、四葉不動産株式会社が事業所たりうる物件の確保をサポートします。中国語（繁体字・簡体字）・英語での相談に対応します。詳しくは
          <Link href="/legal/services/visa" className="text-primary underline">在留資格・ビザ申請</Link>
          をご覧ください。
        </p>
      </div>

      {/* 対応できないこと＝共通コンポーネント（確定文言） */}
      <CannotHandle bare />

      {/* FAQPage JSON-LD＝faqJa参照（サイト内で文言一致） */}
      <Faq items={pickFaqJa(JA_FAQ_QUESTIONS)} heading="よくある質問" withJsonLd bare openFirst={false} />
      {reviewLocale === "ja" && <NonresidentPropertyReview locale="ja" />}
    </RealestateServicePage>
  );
}

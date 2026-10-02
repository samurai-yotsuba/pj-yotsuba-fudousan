import type { PublicProperty } from "./property-shared";
import { isPubliclyVisible } from "./property-shared";
import { brokerFeeOf } from "./broker-fee";
import { rentalSchoolDistrict } from "./rental-school-district";
import { registeredRentalIdentity } from "./registered-rental-identity";
import { sameUnit } from "./school-rental-feed";
import type { FaqItem } from "@/components/shared/Faq";

export function fee033HubListings(properties: readonly PublicProperty[]) {
  const published: PublicProperty[] = [];
  for (const p of properties) {
    if (!isPubliclyVisible(p, "ja") || !rentalSchoolDistrict(p)) continue;
    const identity = registeredRentalIdentity(p);
    if (published.some(other => other.slug === p.slug || (identity && (() => { const prior = registeredRentalIdentity(other); return prior && sameUnit(identity, prior); })()))) continue;
    published.push(p);
  }
  return { published, eligible: published.filter(p => brokerFeeOf(p) === "p033"),
    updatedAt: published.map(p => p.infoUpdatedAt).filter(d => Number.isFinite(Date.parse(d))).sort().at(-1) ?? null };
}
/**
 * /bunkyo/chukai-033 の文言（2026-09-29 改訂）。
 * 役割：「仲介手数料0.33ヶ月」の意味・計算例・含まれない費用・対象物件を説明するページ。
 * 学区別の一覧は /gakku/rentals、料金全体は /ryokin、法人契約の可否は /faq が担う（重複させない）。
 *
 * 書かないこと（表示規約・浦松規程）：他社・ポータル・法令上の上限との比較、「安い」「格安」「最安」「相場より」、
 * 値引き・キャンペーンの表現。書くこと：当社の料金の定義と計算方法、対象の見分け方、含まれない費用、支払時期。
 */
export const FEE033_HUB_COPY = {
  title: "仲介手数料0.33ヶ月とは？意味・計算例・対象物件｜文京区の賃貸",
  h1: "仲介手数料0.33ヶ月（税込）とは？｜意味・計算例・文京区の対象物件",
  eyebrow: "賃貸の仲介手数料の表記を、計算例つきで説明します",
  description:
    "仲介手数料0.33ヶ月（税込）とは、借主の仲介手数料が賃料の0.3ヶ月分＋消費税（10%）で、合計が賃料の0.33ヶ月分になる表記です。管理費・共益費を除いた賃料で計算します。計算例、含まれない費用、支払時期、文京区の対象物件一覧。四葉不動産株式会社。",
  answer:
    "仲介手数料0.33ヶ月（税込）とは、借主様の仲介手数料が賃料の0.3ヶ月分＋消費税（10%）で、合計が賃料の0.33ヶ月分になるという表記です。管理費・共益費を除いた賃料で計算します。四葉不動産株式会社（文京区小日向・宅地建物取引業 東京都知事(1)第113304号）は、サイトの物件ページに「仲介手数料0.33ヶ月（税込）」と表示している賃貸物件を、この料金でご紹介しています。",
  exampleH2: "0.33ヶ月の計算例（賃料別）",
  exampleLead: "賃料（管理費・共益費を除く）× 0.3 ＝ 仲介手数料の本体、その10%が消費税です。合計は賃料 × 0.33 になります。円未満は四捨五入します。",
  otherCostsH2: "仲介手数料に含まれない費用",
  otherCostsLead: "次の費用は仲介手数料とは別で、物件ごとに有無と金額が決まっています。申込の前に、入居日による日割り賃料まで入れた概算をお出しします。四葉不動産は事務手数料・書類作成費などの名目の費用をいただきません。",
  paymentH3: "いつ支払いますか？",
  payment: "仲介手数料は賃貸借契約が成立したときに発生し、契約時にお支払いいただきます。契約が成立する前に請求することはありません。",
  howToTellH3: "対象物件の見分け方",
  howToTell: "物件ページに「仲介手数料0.33ヶ月（税込）」と税込の円額を表示している物件が対象です。料金が未確認の物件は対象と表示しません。表示のない物件の仲介手数料は、物件ごとにご案内します。",
} as const;

/** 0.33ヶ月に固有の質問だけ（学区は /gakku/rentals、法人契約は /faq が担うためリンクで送る） */
export const FEE033_FAQ: FaqItem[] = [
    { q: "仲介手数料「0.33ヶ月」とはどういう意味ですか？", a: "借主様の仲介手数料が賃料の0.3ヶ月分＋消費税（10%）で、合計が賃料の0.33ヶ月分になるという意味です。0.33%ではありません。たとえば賃料10万円なら、本体3万円＋消費税3,000円＝33,000円（税込）です。" },
    { q: "管理費・共益費を含めた金額で計算しますか？", a: "いいえ。管理費・共益費を除いた賃料で計算します。賃料10万円・管理費1万円の物件なら、仲介手数料は10万円×0.33＝33,000円（税込）です。" },
    { q: "四葉不動産のすべての物件が0.33ヶ月ですか？", a: "いいえ。仲介手数料0.33ヶ月（税込）は、物件ページにそう表示している物件に限ります。物件ごとに料金が異なり、料金が未確認の物件は対象と表示しません。表示のない物件の仲介手数料は物件ごとにご案内します。", links: [{ href: "/faq#corporate", label: "法人契約でも対象になりますか？（よくある質問）" }] },
    { q: "仲介手数料はいつ支払いますか？", a: "賃貸借契約が成立したときに発生し、契約時にお支払いいただきます。契約が成立する前に請求することはありません。" },
    { q: "仲介手数料のほかに、初期費用として何がかかりますか？", a: "敷金・礼金、保証会社の保証料、火災保険料、鍵交換費用、前家賃・日割り賃料、管理費・共益費が、物件ごとの条件に応じてかかります。申込の前に、入居日による日割り賃料まで入れた概算をお出しします。四葉不動産は事務手数料・書類作成費などの名目の費用をいただきません。" },
    { q: "サイトに載っていない物件も、0.33ヶ月で紹介してもらえますか？", a: "物件ページとして公開していない紹介可能物件もあり、学区別の賃貸ページにその件数を表示しています。料金は物件ごとに確認してからご案内するため、公開前の物件が0.33ヶ月の対象になるかは個別にお伝えします。", links: [{ href: "/gakku/rentals", label: "学区別の賃貸一覧を見る" }] },
];


/** 計算例に使う賃料（管理費・共益費を除く） */
export const FEE033_EXAMPLE_RENTS = [80_000, 100_000, 120_000, 150_000, 200_000, 250_000] as const;

/** 0.33ヶ月の内訳。合計は broker-fee.ts の BROKER_FEE_PERCENT.p033（33%）と同じ丸め（円未満四捨五入） */
export function fee033Example(rentYen: number) {
  const total = Math.round(rentYen * 33 / 100);
  const base = Math.round(rentYen * 30 / 100);
  return { rentYen, base, tax: total - base, total };
}

/** 仲介手数料に含まれない費用（一般的な項目。有無と金額は物件ごと） */
export const FEE033_OTHER_COSTS = [
  { name: "敷金・礼金", note: "物件ごとに月数が決まっています。敷金は退去時の精算の原資になります。" },
  { name: "保証会社の保証料", note: "保証会社を利用する物件でかかります。料率は保証会社と物件ごとに異なります。" },
  { name: "火災保険料", note: "加入が契約条件になっている物件でかかります。" },
  { name: "鍵交換費用", note: "入居時に鍵を交換する物件でかかります。" },
  { name: "前家賃・日割り賃料", note: "入居日から月末までの日割り分と翌月分を、契約時にお支払いいただくのが一般的です。" },
  { name: "管理費・共益費", note: "毎月の賃料とあわせて支払う費用で、仲介手数料の計算には含めません。" },
] as const;

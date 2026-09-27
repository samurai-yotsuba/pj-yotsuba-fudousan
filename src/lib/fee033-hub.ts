import type { PublicProperty } from "./property-shared";
import { isPubliclyVisible } from "./property-shared";
import { brokerFeeOf } from "./broker-fee";
import { rentalSchoolDistrict } from "./rental-school-district";
import { registeredRentalIdentity } from "./registered-rental-identity";
import { sameUnit } from "./school-rental-feed";

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
export const FEE033_HUB_COPY = {
  title: "文京区の賃貸｜仲介手数料0.33ヶ月の対象物件を学区から探す",
  h1: "文京区の賃貸を学区から探す｜対象物件は仲介手数料0.33ヶ月（税込）",
  description: "文京区の賃貸物件を小学校の通学区域から検索。四葉不動産では対象となる一部物件を仲介手数料0.33ヶ月（税込）でご紹介しています。SUUMO・HOME'S等で見つけた物件も対象料金を確認できます。",
  answer: "四葉不動産株式会社では、文京区を中心とする一部の賃貸物件について、借主様の仲介手数料を賃料0.3ヶ月分＋消費税（税込0.33ヶ月）としています。対象物件には物件詳細ページで「仲介手数料0.33ヶ月（税込）」と明記しています。文京区の賃貸物件は、小学校の通学区域から探すこともできます。",
  faq: [
    { question: "文京区で仲介手数料0.33ヶ月の賃貸物件はありますか？", answer: "四葉不動産では、一部の賃貸物件を仲介手数料0.33ヶ月（税込）でご紹介しています。現在公開中の対象物件は、このページの一覧と各物件詳細で確認できます。" },
    { question: "0.33ヶ月とはどういう意味ですか？", answer: "借主様の仲介手数料が賃料0.3ヶ月分＋消費税、合計で賃料0.33ヶ月分になるという意味です。0.33%ではありません。各物件ページに税込の円額も表示します。" },
    { question: "四葉不動産のすべての物件が0.33ヶ月ですか？", answer: "いいえ。仲介手数料0.33ヶ月（税込）は対象物件に限ります。物件ごとに料金が異なり、未確認の物件は対象と表示しません。各物件の表示をご確認ください。" },
    { question: "学区から賃貸物件を探せますか？", answer: "はい。文京区立小学校20校の通学区域から賃貸物件を探せます。文京区の公表する町丁目・番・号の区域と物件住所を照合しています。入学時点の指定校は文京区が決定します。" },
    { question: "窪町小学校区の物件を探せますか？", answer: "はい。窪町小学校区の賃貸ページで、現在公開中の物件と0.33ヶ月対象件数をご確認いただけます。公開対象がない時期も、LINEで希望条件をお知らせください。" },
    { question: "誠之小学校区の物件を探せますか？", answer: "はい。誠之小学校区の賃貸ページに物件一覧と集計を掲載しています。同じ町丁目でも通学区域が分かれる場合があるため、所在地を番・号まで照合してご案内します。" },
    { question: "SUUMOで見つけた物件も依頼できますか？", answer: "はい。SUUMO・HOME'S等のポータル掲載物件も四葉不動産からご紹介できます。URLをLINEでお送りください。最新の募集状況と0.33ヶ月の対象になるかを確認します。" },
    { question: "広告に出ていない物件もありますか？", answer: "学校別ページには、取得済みデータから確認できる広告掲載できない紹介可能物件の件数も表示します。広告転載の承諾がない物件の詳細は公開せず、個別にご案内します。" },
    { question: "最新の物件数はいつ更新されていますか？", answer: "件数は公開物件と取得済みの募集データから自動集計します。物件情報と募集物件集計の更新日時を表示し、文京区の通学区域データの取得日とは分けてご案内しています。" },
  ],
} as const;

import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "./locale";
export const FEE033_PATH = "/bunkyo/chukai-033";
export type RentalCampaignKind = "fee033" | "gakku" | "property" | "external";
export type RentalCampaignContext = { sourcePage: string; kind?: RentalCampaignKind; propertyId?: string; propertyName?: string; school?: string; rent?: number; feeType?: string };
export const RENTAL_CAMPAIGN_COPY = {
  ja: { title: "SUUMO・HOME'Sなどで見つけた物件もご相談ください", body: "気になる物件のURLをLINEでお送りください。四葉不動産でご紹介し、仲介手数料0.33ヶ月（税込）の対象になるか確認します。募集終了・申込状況等は個別に確認します。", line: "物件URLをLINEで送る", school: "学区から探す", fee: "0.33ヶ月対象物件を見る", homeTitle: "文京区の賃貸を、学区から探す。", lead: "対象物件は仲介手数料0.33ヶ月（税込）。学校区と現在の募集物件をまとめて確認できます。", copy: "相談内容をコピー", copied: "コピーしました", copyNote: "下の内容をコピーしてLINEに貼り付け、気になる物件のURLを追記してください。", failed: "コピーできない場合は下の文章を選択してコピーしてください。", consult: "LINEで物件を相談", definition: "四葉不動産では、一部の賃貸物件について、借主様の仲介手数料を賃料0.3ヶ月分＋消費税（税込0.33ヶ月）としています。対象物件には物件詳細ページで料金を明記します。" },
  en: { title: "Ask us about listings on SUUMO, HOME'S and other portals", body: "Send the listing URL via LINE. We can introduce portal listings and will check eligibility for the 0.33-month brokerage fee (tax included), along with current availability and applications.", line: "Send a property URL via LINE", school: "Search by school district", fee: "View 0.33-month fee listings", homeTitle: "Find a Bunkyo rental by school district.", lead: "Eligible listings have a brokerage fee of 0.33 months of rent, tax included. Check school districts and current listings together.", copy: "Copy inquiry", copied: "Copied", copyNote: "Copy this inquiry into LINE and add the URL of the property you found.", failed: "If copying fails, select and copy the text below.", consult: "Ask about rentals via LINE", definition: "Yotsuba Real Estate charges a brokerage fee of 0.3 months of rent plus consumption tax (0.33 months including tax) for selected rentals only. Each eligible listing states its fee." },
  "zh-tw": { title: "也歡迎諮詢在SUUMO、HOME'S等網站找到的物件", body: "請用LINE傳送物件網址。我們可介紹入口網站刊登的物件，並確認是否適用含稅0.33個月的仲介費，以及最新招租與申請狀況。", line: "用LINE傳送物件網址", school: "依學區找房", fee: "查看仲介費0.33個月的物件", homeTitle: "依學區尋找文京區租屋。", lead: "指定物件的仲介費為0.33個月租金（含稅）。可一起確認學區與目前招租物件。", copy: "複製諮詢內容", copied: "已複製", copyNote: "請將下方內容複製到LINE，並加上感興趣的物件網址。", failed: "無法複製時，請選取下方文字並複製。", consult: "用LINE諮詢租屋", definition: "四葉不動產僅對部分出租物件收取0.3個月租金加消費稅（含稅0.33個月）的仲介費，適用物件將於各物件頁面明確標示。" },
  zh: { title: "也欢迎咨询在SUUMO、HOME'S等网站找到的房源", body: "请用LINE发送房源网址。我们可介绍门户网站刊登的房源，并确认是否适用含税0.33个月的中介费，以及最新招租与申请状态。", line: "用LINE发送房源网址", school: "按学区找房", fee: "查看中介费0.33个月的房源", homeTitle: "按学区查找文京区租房。", lead: "指定房源的中介费为0.33个月租金（含税）。可一起确认学区和目前招租房源。", copy: "复制咨询内容", copied: "已复制", copyNote: "请将下方内容复制到LINE，并加上感兴趣的房源网址。", failed: "无法复制时，请选取下方文字并复制。", consult: "用LINE咨询租房", definition: "四叶不动产仅对部分出租房源收取0.3个月租金加消费税（含税0.33个月）的中介费，适用房源将在各房源页面明确标示。" },
} satisfies Record<LangCode, Record<string, string>>;

export function rentalLineHref(c: RentalCampaignContext, locale: LangCode) {
  const q = new URLSearchParams({ campaign: c.kind ?? "external", from: c.sourcePage.split(/[?#]/)[0] });
  if (c.propertyId) q.set("property", c.propertyId);
  if (c.school) q.set("school", c.school);
  return `${addLocalePrefix("/line", locale)}?${q}`;
}
/** Metadata from our published routes only. Never send query strings or user input to GA. */
export function rentalEventParams(c: RentalCampaignContext) {
  return { source_page: c.sourcePage.split(/[?#]/)[0], campaign_source: c.kind ?? "external", ...(c.propertyId ? { property_id: c.propertyId } : {}), ...(c.school ? { school: c.school } : {}), ...(c.rent ? { rent: c.rent } : {}), ...(c.feeType ? { fee_type: c.feeType } : {}) };
}

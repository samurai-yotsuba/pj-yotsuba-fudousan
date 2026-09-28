import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "./property-shared";
import { isPubliclyVisible } from "./property-shared";
import { DISTRICT_SOURCE, listSchools, lookupDistrictByAddress, type SchoolInfo } from "./school-district";
import { isFeaturedSchoolSlug } from "./gakku";

export type RentalSchoolDistrict =
  | { status: "determined"; school: SchoolInfo; source: typeof DISTRICT_SOURCE }
  | { status: "needs-inquiry"; source: typeof DISTRICT_SOURCE }
  | null;

/** Always pass the original Japanese location, before getLocalizedProperty(). */
export function rentalSchoolDistrict(p: Pick<PublicProperty, "dealType" | "locationText">): RentalSchoolDistrict {
  if (p.dealType !== "rental" || !/^(東京都)?文京区/.test(p.locationText.normalize("NFKC").replace(/\s/g, ""))) return null;
  const result = lookupDistrictByAddress(p.locationText);
  return result.status === "determined"
    ? { status: "determined", school: result.school, source: DISTRICT_SOURCE }
    : { status: "needs-inquiry", source: DISTRICT_SOURCE };
}

export const SCHOOL_RENTAL_INDEX_PATH = "/gakku/rentals";
export function schoolRentalPath(slug: string) { return `/gakku/${slug}/rentals`; }

/** Locale/expiry/status are enforced here as well as in the database read. */
export function groupSchoolRentals(properties: readonly PublicProperty[], locale: LangCode, now = new Date()) {
  const groups = new Map(listSchools().map(s => [s.slug, [] as PublicProperty[]]));
  for (const p of properties) {
    if (!isPubliclyVisible(p, locale, now)) continue;
    if (p.spec.dealType !== "rental") continue;
    const district = rentalSchoolDistrict(p);
    if (district?.status === "determined") groups.get(district.school.slug)?.push(p);
  }
  return groups;
}

export const SCHOOL_RENTAL_COPY = {
  ja: {
    indexTitle: "文京区の小学校区から賃貸を探す", label: "小学校区", pending: "小学校区は要確認",
    title: "{school}区の賃貸物件", view: "この学区の賃貸物件を見る", count: "募集中 {count}件",
    lead: "文京区の区立小学校の通学区域は町丁目の単位で、区域によっては番・号まで定められており、同じ町丁目でも番地によって通う学校が分かれる区域があります。四葉不動産株式会社（宅地建物取引業 東京都知事(1)第113304号）は、文京区が公表する通学区域と募集中の賃貸物件の所在地を照合し、学校別に掲載しています。学校を選ぶと、その学区の一覧が開きます。入学時点の指定校は文京区が決定します。",
    schoolLead: "{school}の通学区域は、文京区が町丁目の単位で、区域によっては番・号まで定めています。四葉不動産株式会社（宅地建物取引業 東京都知事(1)第113304号）が、区の公表区域と所在地を照合できた募集中の賃貸物件を、この学区の一覧として掲載しています。入学時点の指定校は文京区が決定します。",
    empty: "現在、この学区で公開中の賃貸物件はありません。希望の入居時期・賃料・間取りをお知らせください。",
    request: "この学区の物件を相談する", back: "すべての学区を見る", guide: "学区・通学区域の紹介を見る",
    source: "通学区域の出典：文京区", updated: "区の更新日", checked: "データ取得日",
    note: "区の公表区域と所在地の照合結果です。入学時点の指定校は文京区にご確認ください。",
    pendingNote: "所在地だけでは通学区域を特定できません。番・号や旧町名による区分を確認してご案内します。",
  },
  en: {
    indexTitle: "Find rentals by elementary school district in Bunkyo", label: "Elementary school district", pending: "School district to be confirmed",
    title: "Rentals in the {school} district", view: "View rentals in this district", count: "{count} available",
    lead: "Bunkyo City sets the district of each city elementary school by chōme, and in some areas down to the lot and building number, so addresses in the same chōme can belong to different schools. Yotsuba Real Estate Co., Ltd. (real estate brokerage licence: Tokyo Governor (1) No. 113304) checks the address of each available rental against the districts published by Bunkyo City and lists the results by school. Choose a school to see its listings. School names retain their official Japanese spelling. The assigned school at enrollment is decided by Bunkyo City.",
    schoolLead: "Bunkyo City defines the {school} district by chōme, and in some areas by lot and building number. Yotsuba Real Estate Co., Ltd. (real estate brokerage licence: Tokyo Governor (1) No. 113304) lists the available rentals whose addresses match the district published by the city. The assigned school at enrollment is decided by Bunkyo City.",
    empty: "No rentals are currently listed in this school district. Tell us your preferred move-in date, rent and layout.",
    request: "Ask about rentals in this district", back: "View all school districts", guide: "Read the school district guide",
    source: "District source: Bunkyo City", updated: "City update", checked: "Data retrieved",
    note: "Matched against the city’s published districts. Confirm the assigned school with Bunkyo City at the time of enrollment.",
    pendingNote: "The address does not uniquely identify a school district. We will check the block, lot and any former-town boundaries.",
  },
  "zh-tw": {
    indexTitle: "依文京區小學學區尋找租屋", label: "小學學區", pending: "小學學區待確認",
    title: "{school}學區的出租物件", view: "查看此學區的出租物件", count: "招租中 {count}件",
    lead: "文京區區立小學的通學區域以町丁目為單位劃定，部分區域更細分至番、號，因此同一町丁目內也可能分屬不同學校。四葉不動產株式會社（宅地建物取引業 東京都知事(1)第113304號）將招租中出租物件的地址與文京區公布的通學區域比對，依學校分別刊登。選擇學校即可查看列表。校名沿用官方日文名稱。入學時的指定學校由文京區決定。",
    schoolLead: "{school}的通學區域由文京區以町丁目為單位劃定，部分區域細分至番、號。四葉不動產株式會社（宅地建物取引業 東京都知事(1)第113304號）刊登地址經比對符合區公布區域的招租中出租物件。入學時的指定學校由文京區決定。",
    empty: "目前此學區沒有公開刊登的出租物件。歡迎告知希望入住時間、租金與格局。",
    request: "諮詢此學區的租屋", back: "查看所有學區", guide: "查看學區及通學區域介紹",
    source: "通學區域出處：文京區", updated: "區公布更新日", checked: "資料取得日",
    note: "本資訊依區公布的通學區域與地址比對。入學時的指定學校請向文京區確認。",
    pendingNote: "僅憑地址無法確定學區。我們會確認番、號及舊町名的區分後提供說明。",
  },
  zh: {
    indexTitle: "按文京区小学学区查找租房", label: "小学学区", pending: "小学学区待确认",
    title: "{school}学区的出租房源", view: "查看此学区的出租房源", count: "招租中 {count}套",
    lead: "文京区区立小学的通学区域以町丁目为单位划定，部分区域更细分至番、号，因此同一町丁目内也可能分属不同学校。四叶不动产株式会社（宅地建物取引业 东京都知事(1)第113304号）将招租中出租房源的地址与文京区公布的通学区域进行匹配，按学校分别刊登。选择学校即可查看列表。校名沿用官方日文名称。入学时的指定学校由文京区决定。",
    schoolLead: "{school}的通学区域由文京区以町丁目为单位划定，部分区域细分至番、号。四叶不动产株式会社（宅地建物取引业 东京都知事(1)第113304号）刊登地址经匹配符合区公布区域的招租中出租房源。入学时的指定学校由文京区决定。",
    empty: "目前此学区没有公开刊登的出租房源。欢迎告知希望入住时间、租金与户型。",
    request: "咨询此学区的租房", back: "查看所有学区", guide: "查看学区及通学区域介绍",
    source: "通学区域出处：文京区", updated: "区公布更新日", checked: "资料取得日",
    note: "本信息按区公布的通学区域与地址匹配。入学时的指定学校请向文京区确认。",
    pendingNote: "仅凭地址无法确定学区。我们会确认番、号及旧町名的区分后提供说明。",
  },
} satisfies Record<LangCode, Record<string, string>>;

/**
 * 学区別賃貸（ハブ・学区別ページ）の FAQ（学区ページ強化 作業手順書 v1・PR-3）。
 * 回答はページ上の記載（通学区域の単位・区の決定・掲載条件・毎週日曜・水曜の更新）の範囲にとどめる。
 * 4校ページ（SchoolDistrictPage）の FAQ（区域の範囲・区域の変更・指定校変更）と設問を重複させない。
 */
export const SCHOOL_RENTAL_FAQ = {
  ja: {
    heading: "よくあるご質問",
    items: [
      { q: "文京区の学区は、町名だけで決まりますか？", a: "いいえ。文京区の区立小学校の通学区域は町丁目の単位で、区域によっては番・号まで定められており、同じ町丁目でも番地によって通う学校が分かれる区域があります。住所から学区を確かめるときは、番・号まで照合する必要があります。入学時点の指定校は文京区が決定します。" },
      { q: "掲載されている物件に住めば、表示された学校に必ず通えますか？", a: "このページの学区表示は、文京区が公表する通学区域と物件の所在地を当社が照合した結果です。入学時点の指定校は文京区が決定するため、手続の際は文京区にご確認ください。" },
      { q: "このページにはどのような物件を載せていますか？", a: "このページの「学区別の募集比較一覧」には、文京区内で賃料17万5,000円以上・面積48㎡以上の募集中の賃貸物件のうち、管理会社が広告を認めているものを掲載しています。掲載物件は毎週日曜日と水曜日に更新します。一覧にない物件も個別にご紹介できます。" },
    ],
  },
  en: {
    heading: "FAQ",
    items: [
      { q: "Is a Bunkyo school district decided by the town name alone?", a: "No. Bunkyo City sets the district of each city elementary school by chōme, and in some areas down to the lot and building number, so addresses in the same chōme can belong to different schools. To check the district for an address, it must be matched down to the lot and building number. The assigned school at enrollment is decided by Bunkyo City." },
      { q: "If I live in a listed property, is the school shown guaranteed?", a: "The school district shown on this page is the result of our matching the property address against the districts published by Bunkyo City. The assigned school at enrollment is decided by Bunkyo City, so please confirm with the city when you complete the procedures." },
      { q: "Which properties are listed on this page?", a: "The rental comparison by school district on this page lists available rentals in Bunkyo with monthly rent from ¥175,000 and floor area from 48 m², where the managing agent has granted advertising permission. The listings are updated every Sunday and Wednesday. We can also introduce properties that are not on this list." },
    ],
  },
  "zh-tw": {
    heading: "常見問題",
    items: [
      { q: "文京區的學區只看町名就能決定嗎？", a: "不能。文京區區立小學的通學區域以町丁目為單位劃定，部分區域更細分至番、號，因此同一町丁目內也可能分屬不同學校。要從地址確認學區，需比對至番、號。入學時的指定學校由文京區決定。" },
      { q: "住進本頁刊登的物件，就一定能就讀所顯示的學校嗎？", a: "本頁顯示的學區，是本公司將物件地址與文京區公布的通學區域比對的結果。入學時的指定學校由文京區決定，辦理手續時請向文京區確認。" },
      { q: "本頁刊登哪些物件？", a: "本頁的「依小學學區比較租賃物件」列表，刊登文京區內月租17萬5,000日圓以上、面積48平方公尺以上、仍在招租且管理公司允許刊登廣告的出租物件。刊登物件每週日及每週三更新。列表以外的物件也可個別介紹。" },
    ],
  },
  zh: {
    heading: "常见问题",
    items: [
      { q: "文京区的学区只看町名就能确定吗？", a: "不能。文京区区立小学的通学区域以町丁目为单位划定，部分区域更细分至番、号，因此同一町丁目内也可能分属不同学校。要根据地址确认学区，需匹配至番、号。入学时的指定学校由文京区决定。" },
      { q: "入住本页刊登的房源，就一定能就读所显示的学校吗？", a: "本页显示的学区，是本公司将房源地址与文京区公布的通学区域匹配的结果。入学时的指定学校由文京区决定，办理手续时请向文京区确认。" },
      { q: "本页刊登哪些房源？", a: "本页的「按小学学区比较租赁房源」列表，刊登文京区内月租17万5,000日元以上、面积48平方米以上、仍在招租且管理公司允许刊登广告的出租房源。刊登房源每周日及每周三更新。列表以外的房源也可单独介绍。" },
    ],
  },
} satisfies Record<LangCode, { heading: string; items: { q: string; a: string }[] }>;

/**
 * 学区別ページのリード（学区ページ強化 作業手順書 v1・PR-2）。
 * 設問への直答（通学区域は町丁目単位・区域により番・号まで）＋主語が事業者の一文＋指定校は区が決定する留保。
 */
export function schoolRentalLead(school: SchoolInfo, locale: LangCode) {
  return SCHOOL_RENTAL_COPY[locale].schoolLead.replace("{school}", school.formalName.replace(/^文京区立/, ""));
}

/**
 * 2026-09-28（浦松指示）：個別の通学区域ページを持たない16校は、学区賃貸ページを
 * 「〇〇小学校 学区」の検索の受け皿にする（通学区域の表を載せ、タイトルも学区を正面に）。
 * 4校（誠之・昭和・千駄木・窪町）は /gakku/<校> が通学区域の受け皿なので、賃貸ページの題は据え置き（食い合わせない）。
 */
export const SCHOOL_DISTRICT_RENTAL_TITLE: Record<LangCode, string> = {
  ja: "{school}の学区（通学区域）と賃貸物件",
  en: "{school}: school district (catchment area) and rentals",
  "zh-tw": "{school}的學區（通學區域）與出租物件",
  zh: "{school}的学区（通学区域）与出租房源",
};
export function schoolRentalShowsDistrict(slug: string) { return !isFeaturedSchoolSlug(slug); }

export function schoolRentalTitle(school: SchoolInfo, locale: LangCode) {
  if (schoolRentalShowsDistrict(school.slug)) return SCHOOL_DISTRICT_RENTAL_TITLE[locale].replace("{school}", school.formalName);
  return SCHOOL_RENTAL_COPY[locale].title.replace("{school}", school.formalName.replace(/^文京区立/, ""));
}

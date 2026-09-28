/**
 * 学区特集（/gakku）のデータと文言。
 *
 * 表示上の制約（不動産の表示に関する公正競争規約）：
 * - 学校は「現に利用できるもの」を、名称と所在地で表示する（施行規則第10条(29)）。
 * - 「最高」「特選」「厳選」等の最上級・選別を意味する用語は使わない（規約第18条第2項）。
 * - 学校の利用の便宜について実際より優良と誤認させない（規約第23条(35)）。
 *   このため学校の評判・進学実績・人気には触れず、区の公表データと手続の案内に限る。
 * - 「3S1K」は世間で使われている通称であり当社の評価ではない旨を、使う箇所で必ず明示する。
 */
import type { LangCode } from "@/config/languages";
import { findSchoolBySlug, type SchoolInfo } from "@/lib/school-district";

/** 特集で個別ページを持つ4校（2026-09-22 浦松決定） */
export const FEATURED_SCHOOL_SLUGS = ["seishi", "showa", "sendagi", "kubomachi"] as const;
export type FeaturedSchoolSlug = (typeof FEATURED_SCHOOL_SLUGS)[number];

export function isFeaturedSchoolSlug(slug: string): slug is FeaturedSchoolSlug {
  return (FEATURED_SCHOOL_SLUGS as readonly string[]).includes(slug);
}

export interface SchoolProfile {
  /** 区の公表住所（文京区内・丁目-番-号） */
  address: string;
  tel: string;
  /** 学校公式サイト（区の一覧からの外部リンク） */
  siteUrl: string;
}

/**
 * 区立小学校一覧（文京区・ページ更新日 2023年12月8日／当社取得 2026年9月22日）
 * https://www.city.bunkyo.lg.jp/b094/p002133.html
 */
export const SCHOOL_PROFILES: Record<string, SchoolProfile> = {
  rekisen: { address: "文京区小石川2-13-2", tel: "03-3811-7276", siteUrl: "http://www.bunkyo-tky.ed.jp/rekisen-ps/" },
  yanagicho: { address: "文京区小石川1-23-16", tel: "03-3811-0068", siteUrl: "http://www.bunkyo-tky.ed.jp/yanagichou-ps/" },
  sasugaya: { address: "文京区白山2-28-4", tel: "03-3811-6005", siteUrl: "http://www.bunkyo-tky.ed.jp/sasugaya-ps/" },
  hayashicho: { address: "文京区千石2-36-3", tel: "03-3946-0421", siteUrl: "http://www.bunkyo-tky.ed.jp/hayashichou-ps/" },
  meika: { address: "文京区千石1-13-9", tel: "03-3944-0366", siteUrl: "http://www.bunkyo-tky.ed.jp/meika-ps/" },
  aoyagi: { address: "文京区大塚5-40-18", tel: "03-3947-2471", siteUrl: "http://www.bunkyo-tky.ed.jp/aoyagi-ps/" },
  sekiguchidaimachi: { address: "文京区関口2-6-1", tel: "03-3947-2631", siteUrl: "http://www.bunkyo-tky.ed.jp/sekidai-ps/" },
  kohinatadaimachi: { address: "文京区小日向2-3-8", tel: "03-3947-2371", siteUrl: "http://www.bunkyo-tky.ed.jp/kobidai-ps/" },
  kanatomi: { address: "文京区春日2-6-15", tel: "03-3811-0066", siteUrl: "http://www.bunkyo-tky.ed.jp/kanatomi-ps/" },
  kubomachi: { address: "文京区大塚3-2-3", tel: "03-3946-8261", siteUrl: "http://www.bunkyo-tky.ed.jp/kubomachi-ps/" },
  otsuka: { address: "文京区大塚4-1-7", tel: "03-3946-3421", siteUrl: "http://www.bunkyo-tky.ed.jp/otsuka-ps/" },
  yushima: { address: "文京区湯島2-28-14", tel: "03-3813-6061", siteUrl: "http://www.bunkyo-tky.ed.jp/yusima-ps/" },
  seishi: { address: "文京区西片2-14-6", tel: "03-3811-7171", siteUrl: "http://www.bunkyo-tky.ed.jp/seishi-ps/" },
  nezu: { address: "文京区根津1-14-3", tel: "03-3822-4731", siteUrl: "http://www.bunkyo-tky.ed.jp/nezu-ps/" },
  sendagi: { address: "文京区千駄木5-44-2", tel: "03-3821-7168", siteUrl: "http://www.bunkyo-tky.ed.jp/sendagi-ps/" },
  shiomi: { address: "文京区千駄木2-19-23", tel: "03-3827-7566", siteUrl: "http://www.bunkyo-tky.ed.jp/shiomi-ps/" },
  showa: { address: "文京区本駒込2-28-31", tel: "03-3944-0471", siteUrl: "http://www.bunkyo-tky.ed.jp/syouwa-ps/" },
  komamoto: { address: "文京区向丘2-37-5", tel: "03-3827-5451", siteUrl: "http://www.bunkyo-tky.ed.jp/komamoto-ps/" },
  kagomachi: { address: "文京区本駒込2-29-6", tel: "03-3944-1471", siteUrl: "http://www.bunkyo-tky.ed.jp/kagomachi-ps/" },
  hongo: { address: "文京区本郷4-5-15", tel: "03-3813-7551", siteUrl: "http://www.bunkyo-tky.ed.jp/hongou-ps/" },
};

export const SCHOOL_LIST_SOURCE = {
  url: "https://www.city.bunkyo.lg.jp/b094/p002133.html",
  updatedAt: "2023-12-08",
  fetchedAt: "2026-09-22",
} as const;

export function getFeaturedSchools(): SchoolInfo[] {
  return FEATURED_SCHOOL_SLUGS.map((slug) => findSchoolBySlug(slug)).filter(
    (s): s is SchoolInfo => Boolean(s),
  );
}

export interface GakkuCopy {
  hub: {
    title: string;
    description: string;
    h1: string;
    /** H1 直下の一文（地図より前）。3S1K は通称として引用し、評価語は使わない */
    hook: string;
    /** 数字の帯のラベル（値はページ側でデータから出す） */
    /** 4校の児童数の帯（値は data/bunkyo-enrollment.ts から出す） */
    enrollment: { caption: string; change: string; unit: string; source: string };
    answer: string;
    lead: string;
    nicknameH2: string;
    nickname: string;
    featuredH2: string;
    allSchoolsH2: string;
    allSchoolsLead: string;
  };
  school: {
    /** {school} を学校名に置換 */
    titleTemplate: string;
    districtH2: string;
    /** 同じ町丁目を分け合う学校（番・号で分かれる相手）の見出し */
    neighborsLabel: string;
    mapH2: string;
    mapNote: string;
    schoolInfoH2: string;
    addressLabel: string;
    telLabel: string;
    siteLabel: string;
    fromOfficeLabel: string;
    propertiesH2: string;
    propertiesEmpty: string;
    propertiesNote: string;
    noticeH2: string;
    notice: string;
    procedureH2: string;
    procedure: string;
    separateContracts: string;
  };
  table: {
    chome: string;
    ban: string;
    go: string;
    note: string;
    all: string;
    wholeArea: string;
    partial: string;
  };
  /** 全ページ共通の但し書き */
  disclaimer: string;
  sourceLabel: string;
  updatedLabel: string;
  fetchedLabel: string;
  placeNamesInJa?: string;
}

export const GAKKU_COPY: Record<LangCode, GakkuCopy> = {
  ja: {
    hub: {
      title: "文京区の小学校 学区（通学区域）一覧｜20校の町丁目・番地と地図",
      description:
        "文京区立小学校20校の学区（通学区域）を、区の公表データ（2026年1月9日現在）の町丁目・番・号のまま一覧と地図にしました。同じ町名でも番地で学校が分かれる区域があります。学校ごとの学区ページで範囲の表と賃貸・売買物件をご案内します。文京区小日向の四葉不動産株式会社。",
      h1: "文京区の小学校 通学区域と、住まい探し",
      hook:
        "世間で「3S1K」と呼ばれる4校を含む、文京区立小学校20校の通学区域を1枚の地図に。この4校の学区では、当社の取扱いでも募集が出てから短期間で申込みが入ることが少なくありません。",
      enrollment: { caption: "4校の児童数（2026年5月1日現在）と、2021年（令和3年度）からの増減", change: "令和3年度比", unit: "人", source: "出典：文京区「区立小・中学校 児童・生徒数」令和3年度・令和8年度（各年5月1日現在）" },
      answer:
        "文京区の小学校の通学区域は、町丁目だけでなく「番」「号」まで分かれています。同じ丁目でも番地によって学校が変わる区域があり、備考に「一部○○小」とある部分は旧町名により決まります。このページは区の公表データをそのまま掲載し、住まい探しの際に確認すべき点を整理したものです。",
      lead: "通学区域で住まいを探すとき、最初に必要なのは正確な区域です。区が公表している表を町丁目・番・号のまま掲載しました。",
      nicknameH2: "「3S1K」とは何を指しますか？",
      nickname:
        "誠之小学校・昭和小学校・千駄木小学校・窪町小学校の4校を指して、世間で使われている通称です。当社がこの4校を評価して選んだものではありません。この4校を名指しでお探しになる方が多いため、通学区域のページを用意しています。",
      featuredH2: "4校の通学区域ページ",
      allSchoolsH2: "文京区立小学校20校の一覧",
      allSchoolsLead:
        "学校名・所在地は区の「区立小学校一覧」、通学区域は区の「小学校 通学区域」によります。",
    },
    school: {
      titleTemplate: "{school}の学区（通学区域）はどこからどこまで？｜町丁目・番地の表と地図",
      districtH2: "{school}の学区（通学区域）はどこからどこまでですか？",
      neighborsLabel: "同じ町丁目で学校が分かれる相手校（番・号や旧町名で分かれます）",
      mapH2: "町丁目ごとの範囲を図で見る",
      mapNote:
        "町丁目ごとの範囲を示した図です。地理的な位置・縮尺・境界線を表すものではありません。番地によって学校が分かれる町丁目は色を分けています。",
      schoolInfoH2: "学校はどこにありますか？",
      addressLabel: "所在地",
      telLabel: "電話",
      siteLabel: "学校公式サイト",
      fromOfficeLabel: "当社事務所からの道路距離",
      propertiesH2: "この通学区域に、いま扱いのある物件はありますか？",
      propertiesEmpty:
        "現在、この通学区域で当社がご紹介できる物件はありません。ご希望をお聞かせいただければ、条件に合う物件が出たときにお知らせします。",
      propertiesNote:
        "所在地が番地まで分かる物件のうち、区の通学区域表で学校が1校に定まるものを掲載しています。番地によって学校が分かれる区域の物件は、この一覧には出していません。",
      noticeH2: "通学区域は変わることがありますか？",
      notice:
        "入学時点の通学区域は文京区が決定します。区域は変更されることがあり、備考に「一部○○小」とある部分は旧町名により決まるため、個別の住所については区の学務課（教育推進部学校運営課 03-5803-1295）にご確認ください。当社の掲載は区の公表データの転載であり、就学先を保証するものではありません。",
      procedureH2: "指定校以外の学校に通わせたい場合は？",
      procedure:
        "文京区には指定校変更の制度があります。申立てができる理由と手続きは区が定めており、可否の判断も区が行います。制度の内容と申請方法は区の学務課にご確認ください。当社は住まい探しの立場からご相談を承ります。",
      separateContracts:
        "相続・贈与・在留資格など法務手続きに関わる書類作成は、併設の四葉行政書士事務所が別契約で受任します。登記は司法書士、税務は税理士へ、それぞれ直接ご依頼いただく形をご案内します。当社は紹介料を受け取りません。",
    },
    table: {
      chome: "町丁目",
      ban: "番",
      go: "号",
      note: "備考",
      all: "全",
      wholeArea: "全域",
      partial: "番地により分かれる",
    },
    disclaimer:
      "通学区域は文京区が定めるもので、変更されることがあります。入学時点の就学先は区の決定によります。",
    sourceLabel: "出典",
    updatedLabel: "区の更新日",
    fetchedLabel: "当社取得日",
  },
  en: {
    hub: {
      title: "Bunkyo-ku elementary school districts: all 20 schools by chome and block",
      description:
        "School districts (attendance areas) for all 20 public elementary schools in Bunkyo-ku, Tokyo, reproduced from the ward's official table (as of 9 January 2026) with a map. Within some chome the assigned school differs by block number. Each school page shows the area table and available rentals and sales. Yotsuba Real Estate, Kohinata, Bunkyo-ku.",
      h1: "Elementary school districts in Bunkyo-ku, and finding a home",
      hook:
        "All 20 public elementary school districts in Bunkyo on one map, including the four schools the public calls “3S1K”. In those four districts, rentals we handle often receive applications soon after they are listed.",
      enrollment: { caption: "Pupils at the four schools (as of 1 May 2026) and the change since 2021", change: "vs. 2021", unit: "", source: "Source: Bunkyo City, pupils and students at city elementary and junior high schools, FY2021 and FY2026 (as of 1 May each year)" },
      answer:
        "In Bunkyo-ku, school attendance districts are defined not only by district (chome) but down to block (ban) and lot (go) numbers. Within the same chome, the assigned school can differ by address, and rows marked \"partly ○○ Elementary\" are determined by former place names. This page reproduces the ward's published table as it is.",
      lead: "When you search for a home by school district, the first thing you need is the exact boundary. We reproduce the ward's table down to block and lot numbers.",
      nicknameH2: "What does \"3S1K\" refer to?",
      nickname:
        "It is a nickname used by the public for four schools: Seishi, Showa, Sendagi and Kubomachi. It is not our own assessment or selection. Because many people search for these four by name, we provide a district page for each.",
      featuredH2: "District pages for the four schools",
      allSchoolsH2: "All 20 public elementary schools in Bunkyo-ku",
      allSchoolsLead:
        "School names and addresses come from the ward's school list; districts come from the ward's attendance district table.",
    },
    school: {
      titleTemplate: "{school} school district (attendance area): which addresses belong to it? Table and map",
      districtH2: "Which addresses are in the {school} school district?",
      neighborsLabel: "Schools that share a chome with this district (split by block, lot or former town name)",
      mapH2: "The area shown as a diagram",
      mapNote:
        "A diagram of the districts (chome) covered. It does not represent geographic position, scale or boundaries. Chome where the school differs by address are shown in a separate colour.",
      schoolInfoH2: "Where is the school?",
      addressLabel: "Address",
      telLabel: "Phone",
      siteLabel: "School website",
      fromOfficeLabel: "Road distance from our office",
      propertiesH2: "Do you have any listings in this district right now?",
      propertiesEmpty:
        "We have no listings in this district at the moment. Tell us what you are looking for and we will let you know when something comes up.",
      propertiesNote:
        "We list only properties whose address is known down to the lot number and whose school is uniquely determined by the ward's table.",
      noticeH2: "Can the district change?",
      notice:
        "The attendance district that applies at enrolment is decided by Bunkyo-ku. Districts may change, and rows marked \"partly ○○ Elementary\" are determined by former place names. Please confirm a specific address with the ward's School Administration Section (03-5803-1295). Our listing is a reproduction of the ward's published data and does not guarantee school assignment.",
      procedureH2: "What if you want a school other than the designated one?",
      procedure:
        "Bunkyo-ku has a procedure for changing the designated school. The permitted reasons, the application process and the decision all rest with the ward. Please confirm with the ward's School Administration Section.",
      separateContracts:
        "Document preparation for inheritance, gifts and residence status is handled by Yotsuba Administrative Scrivener Office under a separate contract. Registration is handled by a judicial scrivener and tax matters by a tax accountant, each engaged directly. We receive no referral fees.",
    },
    table: {
      chome: "Chome",
      ban: "Ban (block)",
      go: "Go (lot)",
      note: "Notes",
      all: "All",
      wholeArea: "Entire chome",
      partial: "Varies by address",
    },
    disclaimer:
      "Attendance districts are set by Bunkyo-ku and may change. The school assigned at enrolment is decided by the ward.",
    sourceLabel: "Source",
    updatedLabel: "Ward update",
    fetchedLabel: "Retrieved by us",
    placeNamesInJa:
      "Place names are shown in Japanese exactly as they appear in the ward's official table.",
  },
  "zh-tw": {
    hub: {
      title: "文京區小學學區（通學區域）一覽｜20校的町丁目・番地與地圖",
      description:
        "依文京區公布資料（2026年1月9日現在），完整刊載20所區立小學的學區（通學區域：町丁目・番・號）與地圖。同一町名也可能因番地而分屬不同學校。各校的學區頁面提供範圍表與出租・出售物件。文京區小日向的四葉不動產株式會社。",
      h1: "文京區的小學通學區域與找房",
      hook:
        "把文京區20所區立小學的通學區域放進一張地圖，其中包括社會上通稱「3S1K」的4校。在這4校的學區，本公司經手的物件也常在招租後短時間內就有人申請。",
      enrollment: { caption: "4校的學童人數（2026年5月1日現在）及與2021年度（令和3年度）相比的增減", change: "較2021年度", unit: "人", source: "出處：文京區「區立小・中學校 兒童・學生數」令和3年度・令和8年度（各年5月1日現在）" },
      answer:
        "文京區的小學通學區域不只分到町丁目，而是分到「番」「號」。同一個丁目也可能因地號不同而學校不同；備註寫「一部○○小」的部分，是依舊町名決定的。本頁將區公布的表格原樣刊載。",
      lead: "以通學區域找房時，最先需要的是正確的區域範圍。我們把區公布的表格，連番・號一起原樣刊載。",
      nicknameH2: "「3S1K」指的是什麼？",
      nickname:
        "這是社會上對誠之小學、昭和小學、千駄木小學、窪町小學4校的通稱，並非本公司的評價或篩選。由於指名查詢這4校的人較多，我們為各校設置了通學區域頁面。",
      featuredH2: "4校的通學區域頁面",
      allSchoolsH2: "文京區立小學20校一覽",
      allSchoolsLead: "校名與地址依區的「區立小學一覽」，通學區域依區的「小學通學區域」。",
    },
    school: {
      titleTemplate: "{school}的學區（通學區域）範圍到哪裡？｜町丁目・番地的表與地圖",
      districtH2: "{school}的學區（通學區域）範圍到哪裡？",
      neighborsLabel: "與本學區共用町丁目的學校（依番・號或舊町名劃分）",
      mapH2: "以圖示看町丁目的範圍",
      mapNote:
        "此圖顯示所涵蓋的町丁目，並非表示地理位置、比例尺或界線。因地號而分屬不同學校的町丁目，以不同顏色標示。",
      schoolInfoH2: "學校在哪裡？",
      addressLabel: "地址",
      telLabel: "電話",
      siteLabel: "學校官方網站",
      fromOfficeLabel: "自本公司事務所的道路距離",
      propertiesH2: "這個通學區域目前有可介紹的物件嗎？",
      propertiesEmpty:
        "目前本區域沒有可介紹的物件。歡迎告訴我們您的條件，有符合的物件時將立即通知。",
      propertiesNote:
        "僅刊載地址可確認到地號、且依區的表格可確定為單一學校的物件。",
      noticeH2: "通學區域會變更嗎？",
      notice:
        "入學時點的通學區域由文京區決定。區域可能變更，備註寫「一部○○小」的部分依舊町名決定，個別地址請向區的學務課（教育推進部學校營運課 03-5803-1295）確認。本公司的刊載為區公布資料的轉載，不保證就學學校。",
      procedureH2: "想讓孩子就讀指定學校以外的學校時？",
      procedure:
        "文京區設有指定學校變更制度。可申請的理由、手續與准否判斷均由區決定，詳情請向區的學務課確認。本公司以找房的立場提供諮詢。",
      separateContracts:
        "繼承、贈與、在留資格等法務手續的文件製作，由併設的四葉行政書士事務所另行簽訂契約承辦。登記由司法書士、稅務由稅理士，分別直接委任。本公司不收取介紹費。",
    },
    table: {
      chome: "町丁目",
      ban: "番",
      go: "號",
      note: "備註",
      all: "全",
      wholeArea: "全域",
      partial: "依地號而異",
    },
    disclaimer: "通學區域由文京區訂定，可能變更。入學時點的就學學校依區的決定。",
    sourceLabel: "出處",
    updatedLabel: "區的更新日",
    fetchedLabel: "本公司取得日",
    placeNamesInJa: "地名依區公布表格，以日文原樣標示。",
  },
  zh: {
    hub: {
      title: "文京区小学学区（通学区域）一览｜20校的町丁目・番地与地图",
      description:
        "依据文京区公布资料（2026年1月9日现在），完整刊载20所区立小学的学区（通学区域：町丁目・番・号）与地图。同一町名也可能因番地而分属不同学校。各校的学区页面提供范围表与出租・出售房源。文京区小日向的四叶不动产株式会社。",
      h1: "文京区的小学通学区域与找房",
      hook:
        "把文京区20所区立小学的通学区域放进一张地图，其中包括社会上通称「3S1K」的4校。在这4校的学区，本公司经手的房源也常在招租后短时间内就有人申请。",
      enrollment: { caption: "4校的学生人数（2026年5月1日现在）及与2021年度（令和3年度）相比的增减", change: "较2021年度", unit: "人", source: "出处：文京区「区立小・中学校 儿童・学生数」令和3年度・令和8年度（各年5月1日现在）" },
      answer:
        "文京区的小学通学区域不仅分到町丁目，而是分到「番」「号」。同一个丁目也可能因地号不同而学校不同；备注写「一部○○小」的部分，是依旧町名决定的。本页将区公布的表格原样刊载。",
      lead: "以通学区域找房时，最先需要的是准确的区域范围。我们把区公布的表格，连番・号一起原样刊载。",
      nicknameH2: "「3S1K」指的是什么？",
      nickname:
        "这是社会上对诚之小学、昭和小学、千駄木小学、洼町小学4校的通称，并非本公司的评价或筛选。由于指名查询这4校的人较多，我们为各校设置了通学区域页面。",
      featuredH2: "4校的通学区域页面",
      allSchoolsH2: "文京区立小学20校一览",
      allSchoolsLead: "校名与地址依区的「区立小学一览」，通学区域依区的「小学通学区域」。",
    },
    school: {
      titleTemplate: "{school}的学区（通学区域）范围到哪里？｜町丁目・番地的表与地图",
      districtH2: "{school}的学区（通学区域）范围到哪里？",
      neighborsLabel: "与本学区共用町丁目的学校（依番・号或旧町名划分）",
      mapH2: "以图示看町丁目的范围",
      mapNote:
        "此图显示所涵盖的町丁目，并非表示地理位置、比例尺或界线。因地号而分属不同学校的町丁目，以不同颜色标示。",
      schoolInfoH2: "学校在哪里？",
      addressLabel: "地址",
      telLabel: "电话",
      siteLabel: "学校官方网站",
      fromOfficeLabel: "自本公司事务所的道路距离",
      propertiesH2: "这个通学区域目前有可介绍的物件吗？",
      propertiesEmpty:
        "目前本区域没有可介绍的物件。欢迎告诉我们您的条件，有符合的物件时将立即通知。",
      propertiesNote:
        "仅刊载地址可确认到地号、且依区的表格可确定为单一学校的物件。",
      noticeH2: "通学区域会变更吗？",
      notice:
        "入学时点的通学区域由文京区决定。区域可能变更，备注写「一部○○小」的部分依旧町名决定，个别地址请向区的学务课（教育推进部学校运营课 03-5803-1295）确认。本公司的刊载为区公布资料的转载，不保证就学学校。",
      procedureH2: "想让孩子就读指定学校以外的学校时？",
      procedure:
        "文京区设有指定学校变更制度。可申请的理由、手续与准否判断均由区决定，详情请向区的学务课确认。本公司以找房的立场提供咨询。",
      separateContracts:
        "继承、赠与、在留资格等法务手续的文件制作，由并设的四叶行政书士事务所另行签订合同承办。登记由司法书士、税务由税理士，分别直接委任。本公司不收取介绍费。",
    },
    table: {
      chome: "町丁目",
      ban: "番",
      go: "号",
      note: "备注",
      all: "全",
      wholeArea: "全域",
      partial: "依地号而异",
    },
    disclaimer: "通学区域由文京区订定，可能变更。入学时点的就学学校依区的决定。",
    sourceLabel: "出处",
    updatedLabel: "区的更新日",
    fetchedLabel: "本公司取得日",
    placeNamesInJa: "地名依区公布表格，以日文原样标示。",
  },
};

export function gakkuCopy(locale: LangCode): GakkuCopy {
  return GAKKU_COPY[locale] ?? GAKKU_COPY.ja;
}

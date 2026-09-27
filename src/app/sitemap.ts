import { schoolSalePath, SCHOOL_SALE_INDEX_PATH } from "@/lib/sale-school-district";
import { listSchools } from "@/lib/school-district";
import { schoolRentalPath, SCHOOL_RENTAL_INDEX_PATH } from "@/lib/rental-school-district";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  getAllColumnsAllLocales,
  getAllLegalColumnsAllLocales,
  getAllLaborColumnsAllLocales,
} from "@/lib/columns";
import { canonicalUrl } from "@/lib/seo";
import type { ColumnIndexEntry } from "@/lib/columns";
import { getAllPublishedPropertiesAllLocales } from "@/lib/properties";
import { isListable, type PublicProperty } from "@/lib/property-shared";
import { WAKEARI_LAST_UPDATED_ISO } from "@/lib/wakeari";
import { PET_HOUSING_LAST_UPDATED_ISO, PET_HOUSING_PUBLISHED } from "@/lib/pet-housing";

export const revalidate = 300;

const ALL_LOCALES = ["ja", "en", "zh-tw", "zh"] as const;
/** sitemap の xhtml:link hreflang 値（ページmetadataの alternates と同一マッピング） */
const HREFLANG: Record<string, string> = { ja: "ja", en: "en", "zh-tw": "zh-Hant", zh: "zh-Hans" };

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
type StaticPage = {
  path: string;
  changeFrequency: ChangeFreq;
  priority: number;
  /** このページが実在するロケール（未指定＝全4ロケール）。ja先行公開ページはjaのみ出す＝存在しないロケールURLを広告しない */
  locales?: readonly (typeof ALL_LOCALES)[number][];
  /**
   * 実更新日を持つ固定ページだけが持つ lastmod（ISO 日付）。未指定＝出力しない（下の expandStatic の注記どおり）。
   * 2026-09-23 /wakeari 配下で追加：ページが可視の「最終更新」と ArticleJsonLd の dateModified を同じ定数で持つため、
   * 生成時刻ではなく実更新日を出せる。
   */
  lastModified?: string;
};

/**
 * hreflang alternates を生成する。URL生成は canonicalUrl（＝ページmetadataの alternates と
 * 同一の単一情報源）を再利用し、ロケール接頭辞・マルチテナントのパス結合を一箇所に集約する。
 */
function alternatesFor(businessKey: string, path: string, locales: readonly string[]) {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[HREFLANG[loc] ?? loc] = canonicalUrl(businessKey, path, loc);
  }
  return { languages };
}

/**
 * 固定ページを全4ロケールに展開。各ロケールURLを独立した <loc> として出力し、
 * それぞれに全4言語の hreflang alternates を付与する
 * （Next.js は配列1要素につき <url> 1件・<loc>=url のみを出すため、ロケール別に要素化しないと
 *  /en・/zh が <loc> として現れない）。
 *
 * lastmod は出力しない（SEO監査2026-08-24 P1-2）：固定ページは実更新日を保持しておらず、
 * 旧実装の「サイトマップ生成時刻」では取得のたびに全固定ページが「今更新した」ように見えて
 * Googleに lastmod 全体を信用されなくなる。実更新日を持たないページは省略が正
 * （https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap）。
 */
function expandStatic(
  businessKey: string,
  page: StaticPage,
): MetadataRoute.Sitemap {
  const locales = page.locales ?? ALL_LOCALES;
  const alternates = alternatesFor(businessKey, page.path, locales);
  return locales.map((loc) => ({
    url: canonicalUrl(businessKey, page.path, loc),
    ...(page.lastModified ? { lastModified: page.lastModified } : {}),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates,
  }));
}

/**
 * コラムを、そのコラムが実際に公開されているロケール（col.locales）のみ展開する
 * （存在しないロケールのURLを機械生成して404を量産しない）。locales 未設定＝後方互換で全4言語。
 * lastModified は frontmatter 相当の modifiedDate → date の順で採用。両方欠落時は省略
 * （SEO監査2026-08-24 P1-2：旧実装の「生成時刻」フォールバックは虚偽の更新日になる）。
 */
function expandColumn(
  businessKey: string,
  path: string,
  col: ColumnIndexEntry,
): MetadataRoute.Sitemap {
  const active = col.locales && col.locales.length > 0 ? col.locales : [...ALL_LOCALES];
  const alternates = alternatesFor(businessKey, path, active);
  const lastModified = col.modifiedDate ?? col.date;
  return active.map((loc) => ({
    url: canonicalUrl(businessKey, path, loc),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: "yearly" as const,
    priority: 0.6,
    alternates,
  }));
}

/**
 * 物件詳細を、その物件が公開されているロケール（p.locales・既定 ja）のみ展開する。
 * published のみ収載（取得関数が status:"published" 限定＋isListable の二重ガード）。
 * closed は成約時の revalidate で即時に外れる（おとり広告の構造的回避）。
 */
function expandProperty(p: PublicProperty): MetadataRoute.Sitemap {
  const active = p.locales && p.locales.length > 0 ? p.locales : (["ja"] as const);
  const path = `/bukken/${p.slug}`;
  const alternates = alternatesFor("realestate", path, active);
  return active.map((loc) => ({
    url: canonicalUrl("realestate", path, loc),
    lastModified: p.infoUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates,
  }));
}

const STATIC_REALESTATE: StaticPage[] = [
  { path: "/bunkyo/chukai-033", changeFrequency: "daily", priority: 0.8, locales: ["ja"] },
  { path: "/voices", changeFrequency: "monthly", priority: 0.7 },
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  // 2026-09-01：物件紹介（/bukken）。2026-09-16に ja先行→4ロケール（ページ側 PAGE_LOCALES と一致・locales未指定＝全4）
  { path: "/bukken", changeFrequency: "weekly", priority: 0.8 },
  // 2026-09-22：学区特集。区の通学区域（町丁目・番・号）の一次データ層。
  // ハブ＋4校（誠之・昭和・千駄木・窪町）。いずれもページ側 PAGE_LOCALES は4ロケール。
  { path: "/gakku", changeFrequency: "monthly", priority: 0.8 },
  { path: SCHOOL_SALE_INDEX_PATH, changeFrequency: "weekly", priority: 0.8 },
  ...listSchools().map(school => ({ path: schoolSalePath(school.slug), changeFrequency: "weekly" as const, priority: 0.7 })),
  { path: SCHOOL_RENTAL_INDEX_PATH, changeFrequency: "daily", priority: 0.8 },
  ...listSchools().map(school => ({ path: schoolRentalPath(school.slug), changeFrequency: "daily" as const, priority: 0.7 })),
  { path: "/gakku/seishi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gakku/showa", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gakku/sendagi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gakku/kubomachi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/souzoku", changeFrequency: "monthly", priority: 0.9 },
  { path: "/souzoku/nagare", changeFrequency: "monthly", priority: 0.7 },
  // タスクC-4（2026-07-19）：相続空き家。C-6-2で zh-tw・zh を公開。
  // 【2026-08-10】en 版は COPY に実在し本番の /en/souzoku/akiya が英語本文を配信しているため en を追加。
  // ページ側の availableLocales（PAGE_LOCALES）と必ず一致させる＝存在しないロケールURLを広告しない。
  {
    path: "/souzoku/akiya",
    changeFrequency: "monthly",
    priority: 0.7,
    locales: ["ja", "en", "zh-tw", "zh"],
  },
  // 2026-09-23：売りにくい土地・建物の出口相談（ハブ＋種類別4枚）。ja先行公開＝ページ側 availableLocales:["ja"] と一致。
  // lastmod＝ページの可視「最終更新」・ArticleJsonLd の dateModified と同じ定数（実更新日）。
  { path: "/wakeari", changeFrequency: "monthly", priority: 0.8, locales: ["ja"], lastModified: WAKEARI_LAST_UPDATED_ISO },
  { path: "/wakeari/saikenchiku-fuka", changeFrequency: "monthly", priority: 0.7, locales: ["ja"], lastModified: WAKEARI_LAST_UPDATED_ISO },
  // 2026-09-24 Phase 3：共有名義・借地権の2枚は繁体字版あり（台湾の相続人の需要。企画書 v1.0 §3-3）
  { path: "/wakeari/kyoyu", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "zh-tw"], lastModified: WAKEARI_LAST_UPDATED_ISO },
  { path: "/wakeari/shakuchi-sokochi", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "zh-tw"], lastModified: WAKEARI_LAST_UPDATED_ISO },
  { path: "/wakeari/kyosho", changeFrequency: "monthly", priority: 0.7, locales: ["ja"], lastModified: WAKEARI_LAST_UPDATED_ISO },
  // 2026-07-22：グループホーム開設ピラー（#4/#5 最優先KPI）。物件＋指定申請の分離受任ハブ。手本＝souzoku（priority 0.9）。
  { path: "/group-home", changeFrequency: "monthly", priority: 0.9 },
  // 2026-09-24：グループホーム向け物件の大家募集（貸す側の受け皿・専用フォーム）。ja先行公開（ページ側 availableLocales:["ja"] と一致）。
  { path: "/group-home/ooya", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-09-24：多頭飼い・大型犬の住まい探し（ペット横断 Phase 3）。ja のみ（ページ側 availableLocales:["ja"]・他言語は404）。
  // 公開フラグ（NEXT_PUBLIC_PET_HOUSING_PUBLISHED）が off の間はページが404のため載せない。lastmod＝可視の「最終更新」と同じ定数。
  ...(PET_HOUSING_PUBLISHED
    ? [{ path: "/pet-housing", changeFrequency: "monthly", priority: 0.8, locales: ["ja"], lastModified: PET_HOUSING_LAST_UPDATED_ISO } as const]
    : []),
  // 2026-07-22：シナジー領域ピラー（#11 飲食店開業・#15 会社設立×オフィス）。ja先行公開（/toushi/shitei-shinseiと同方式）。
  { path: "/inshokuten", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  { path: "/office", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-07-22：民泊ピラー（#13）。ja先行公開。
  { path: "/minpaku", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-07-22：介護事業所ピラー（#14）。ja先行公開。GH（/group-home）と福祉系開設クラスタ。
  { path: "/kaigo", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-07-24：借り上げ社宅ピラー（#12）。ja先行公開。導入・社宅規程・物件の分離受任（宅建業×社労士×税務）。
  { path: "/shataku", changeFrequency: "monthly", priority: 0.8 },
  // 2026-07-25：本帰国ピラー（定点#18の入れ替え先）。ja先行公開。
  // 役割＝主語は「帰国というライフイベント」。/global（主語＝在留資格・読者＝外国人）とは読者が別。
  { path: "/kikoku", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-07-25：東京赴任の住まい（ピラーC）。ja＋zh-tw。主語は「時間と距離」で /global と分ける。
  { path: "/funin", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "zh-tw"] },
  // 2026-07-27：非居住者オーナー（定点#32の対応ページ）。ja先行公開。
  // 主語は「非居住者であること」＝/kikoku（戻る）・/funin（来る）・売却コラム（売る）と読者が別。
  { path: "/kaigai-owner", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  // 2026-08-09：緊急帰国・不動産スピード換金（特集・離日売却クラスタの主力）。同日中に ja→zh→en→zh-tw の全4ロケール公開。
  // 主語は「これから出国する所有者・時間がない」＝売却コラム（海外在住・急がない）・/kaigai-owner（持つ）と読者が別。
  { path: "/leaving-japan", changeFrequency: "weekly", priority: 0.8 },
  // 2026-07-27：地名×空き家の1本目（レーンB）。ja先行公開・akiyaクラスタの子。
  // 誘導ページ化を避けるため段階実装：本ページを2測定で判定してから2本目以降に進む。
  { path: "/souzoku/akiya/koishikawa", changeFrequency: "monthly", priority: 0.6, locales: ["ja"] },
  // 2026-07-22：台湾越境相続（#19）。ja先行公開・souzokuクラスタの子。2026-07-23 zh-tw追加。
  { path: "/souzoku/taiwan", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "zh-tw"] },
  // 2026-07-25：中国語相続ハブ（#7）。ja先行公開・souzokuクラスタの子。ページ側 availableLocales:["ja"] と一致させる。
  { path: "/souzoku/chinese", changeFrequency: "monthly", priority: 0.7, locales: ["ja"] },
  { path: "/toushi", changeFrequency: "monthly", priority: 0.9 },
  { path: "/toushi/group-home", changeFrequency: "monthly", priority: 0.8 },
  // タスクC-2（2026-07-19）：指定申請と物件の分離受任。現フェーズ＝ja先行公開（/ryokinと同方式）
  { path: "/toushi/shitei-shinsei", changeFrequency: "monthly", priority: 0.7, locales: ["ja"] },
  { path: "/global", changeFrequency: "monthly", priority: 0.8 },
  // タスクC-3（2026-07-19）：中国語圏特化ハブ。C-6-1で zh-tw・zh を公開。
  // 【2026-08-10】en 版は COPY に実在し本番の /en/global/chinese が英語本文を配信しているため en を追加。
  // ページ側の availableLocales（PAGE_LOCALES）と必ず一致させる＝存在しないロケールURLを広告しない。
  {
    path: "/global/chinese",
    changeFrequency: "monthly",
    priority: 0.7,
    locales: ["ja", "en", "zh-tw", "zh"],
  },
  // タスクC-5（2026-07-19）：相談事例（モデルケース）。現フェーズ＝ja先行公開（/ryokinと同方式）
  { path: "/jirei", changeFrequency: "monthly", priority: 0.7, locales: ["ja"] },
  { path: "/access", changeFrequency: "monthly", priority: 0.7 },
  // 2026-07-28：相談先型クエリの受け皿。ja先行公開（多言語は指示書13で別途）。
  // 正本＝Drive「四葉_社労士開業2026_サイト切替設計」設計書 §1-3・§2-A-2
  { path: "/reasons", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  { path: "/network", changeFrequency: "monthly", priority: 0.7, locales: ["ja"] },
  // タスクB-1（2026-07-19）：不動産・料金ページ。C-6-3（2026-07-19）で en/zh-tw/zh を公開＝locales指定を解除（全4ロケール）
  { path: "/ryokin", changeFrequency: "monthly", priority: 0.8 },
  // 2026-08-11：転換側の受け皿。ご依頼から引渡しまでの実務（書類・費用の支払時期）。ja先行。
  // /souzoku/nagare（相続という入口）・/legal/nagare（行政書士業務）とは主語が別＝役割分担はページ冒頭に記載。
  { path: "/nagare", changeFrequency: "monthly", priority: 0.8, locales: ["ja"] },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  // タスクB-2（2026-07-19）：代表者プロフィール。C-6-3（2026-07-19）で en/zh-tw/zh を公開＝locales指定を解除（全4ロケール）
  { path: "/about/uramatsu", changeFrequency: "monthly", priority: 0.6 },
  { path: "/column", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/legal-notice", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

const STATIC_LEGAL: StaticPage[] = [
  { path: "/legal/voices", changeFrequency: "monthly", priority: 0.7 },
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services/shogai-fukushi", changeFrequency: "monthly", priority: 0.9 },
  // 親なき後（2026-07-25新設）＝ja先行公開のため locales:["ja"]
  { path: "/services/oyanakiato", changeFrequency: "monthly", priority: 0.9, locales: ["ja"] },
  // 2026-07-25：外国人社員の受け入れ（企業向け・ピラーB）。ja先行公開。アポスティーユ／領事認証が中核資産。
  { path: "/services/gaikokujin-shain", changeFrequency: "monthly", priority: 0.9, locales: ["ja"] },
  { path: "/services/ikuseishuro-gaibu-kansa", changeFrequency: "monthly", priority: 0.9, locales: ["ja"] },
  { path: "/services/visa", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/inheritance", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/company", changeFrequency: "monthly", priority: 0.7 },
  { path: "/services/subsidy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ryokin", changeFrequency: "monthly", priority: 0.8 },
  { path: "/nagare", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/column", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
];

/**
 * 社労士（/labor）。**開業まで sitemap に載せない。**
 *
 * 2026-08-09 に発見した欠落：本ファイルには labor の定義が一切なく、
 * `sitemap()` は realestate と legal しか返していなかった。
 * `BUSINESS_URLS.labor` は SR_LAUNCHED=true で追加されるが、それは
 * canonical URL の組み立てと robots.ts の露出に効くだけで、
 * **sitemap のエントリは1件も作られない**。
 * このままだと 9月1日にフラグを立てても /labor 配下は sitemap に載らず、
 * Search Console へ送れない（発見は内部リンク頼み）。
 *
 * ロケールは実装の availableLocales と一致させる。
 * ※ /labor 配下は段階的に多言語化中（第1波=トップ・services・ryokin・nagare は4言語）。
 * 　残りを多言語化するときは
 *   ページ側の availableLocales と本表の両方を同時に直す
 *   （18_言語別存在マトリクス.md の突合対象）。
 */
const STATIC_LABOR: StaticPage[] = [
  { path: "/labor/voices", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "en", "zh-tw", "zh"] },
  // 2026-09-01 4言語公開（第1波）。4ロケールとも本番200を実測（2026-09-01）。
  // locales の明示は sitemap-labor.test.ts の規約（存在しないロケールURLを広告しない）に合わせるため。
  { path: "/labor", changeFrequency: "monthly", priority: 0.9, locales: ["ja", "en", "zh-tw", "zh"] },
  { path: "/labor/services", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第1波）
  { path: "/labor/services/kaigo-roumu", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] },
  // 2026-09-22 4言語化（本文を JININ_KIJUN_ROUMU_COPY に移し en / zh-tw / zh を追加）。ページ側の availableLocales と一致。
  { path: "/labor/services/jinin-kijun-roumu", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] },
  { path: "/labor/services/shogu-kaizen", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] },
  // 2026-09-22 4言語化（本文を JOSEIKIN_COPY に移し en / zh-tw / zh を追加）。ページ側の availableLocales と一致。
  { path: "/labor/services/joseikin", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "en", "zh-tw", "zh"] },
  { path: "/labor/services/gaikokujin-koyo", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第2波）
  { path: "/labor/services/gaibu-kansanin", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第2波）
  { path: "/labor/services/saiyo", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第2波）
  // 2026-09-22 4言語化（本文を SHOGAI_NENKIN_COPY に移し en / zh-tw / zh を追加）。ページ側の availableLocales と一致。
  { path: "/labor/services/shogai-nenkin", changeFrequency: "monthly", priority: 0.8, locales: ["ja", "en", "zh-tw", "zh"] },
  { path: "/labor/ryokin", changeFrequency: "monthly", priority: 0.7, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第1波）
  { path: "/labor/nagare", changeFrequency: "yearly", priority: 0.6, locales: ["ja", "en", "zh-tw", "zh"] }, // 2026-09-01 4言語公開（第1波）
  { path: "/labor/faq", changeFrequency: "monthly", priority: 0.6, locales: ["ja", "en", "zh-tw", "zh"] },
  // 2026-09-22：本文は about=翻訳辞書（labor.aboutPage.*）、contact=CONTACT_LABELS／CONTACT_INTRO で
  // 4ロケールとも訳出済み。ページ側は availableLocales 未指定＝4言語の hreflang を出しており、
  // sitemap だけが ja に狭まっていた（存在する訳をGoogleに知らせていない）ので実体に合わせる。
  { path: "/labor/about", changeFrequency: "yearly", priority: 0.6, locales: ["ja", "en", "zh-tw", "zh"] },
  // 2026-09-22：労務コラムは全114本が en / zh-tw / zh の訳を持ち（labor-columns-seed.ts）、
  // Column.locales は空＝全ロケール公開のため、個別記事URLは既に4ロケールで sitemap に出ている
  // （expandColumn）。一覧ページ側も getColumnPageLocales が4言語を返し hreflang を出しているので、
  // 一覧だけ ja に狭めると「記事は載るが入口が載らない」ずれになる。
  { path: "/labor/column", changeFrequency: "daily", priority: 0.7, locales: ["ja", "en", "zh-tw", "zh"] },
  { path: "/labor/contact", changeFrequency: "yearly", priority: 0.5, locales: ["ja", "en", "zh-tw", "zh"] },
];

/** 社労士サイトマップ。**SR_LAUNCHED=false の間は空配列を返す**（開業前は1件も出さない） */
async function buildLaborSitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_PUBLIC_SR_LAUNCHED !== "true") return [];
  const laborColumns = await getAllLaborColumnsAllLocales();
  return [
    ...STATIC_LABOR.flatMap((page) => expandStatic("labor", page)),
    ...laborColumns.flatMap((col) =>
      expandColumn("labor", `/column/${col.slug}`, col),
    ),
  ];
}

async function buildRealestateSitemap(): Promise<MetadataRoute.Sitemap> {
  const columns = await getAllColumnsAllLocales();
  const properties = await getAllPublishedPropertiesAllLocales();
  return [
    ...STATIC_REALESTATE.flatMap((page) => expandStatic("realestate", page)),
    ...columns.flatMap((col) =>
      expandColumn("realestate", `/column/${col.slug}`, col),
    ),
    ...properties.filter(isListable).flatMap(expandProperty),
  ];
}

async function buildLegalSitemap(): Promise<MetadataRoute.Sitemap> {
  const legalColumns = await getAllLegalColumnsAllLocales();
  return [
    ...STATIC_LEGAL.flatMap((page) => expandStatic("legal", page)),
    ...legalColumns.flatMap((col) =>
      expandColumn("legal", `/column/${col.slug}`, col),
    ),
  ];
}

/**
 * ホスト名で振り分け:
 * - luck428gyosei.com → 行政書士のsitemap
 * - それ以外 → 不動産＋行政書士の統合sitemap
 *
 * 2026-07-25統合（AI可視性強化#2・Bing/IndexNow対応の前提整備）：
 * 旧構成では robots.txt が /legal/sitemap.xml を広告していたが該当ルートは存在せず404、
 * luck428gyosei.com/sitemap.xml も404＝**legal配下（GHコラム23本・業務ページ）がどの
 * サイトマップにも載っていなかった**。legalページのcanonicalホストは luck428.com
 * （BUSINESS_URLS.legal）のため、本体 sitemap.xml に統合して配信する。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") || "";

  if (host.includes("luck428gyosei.com")) {
    return buildLegalSitemap();
  }

  return [
    ...(await buildRealestateSitemap()),
    ...(await buildLegalSitemap()),
    ...(await buildLaborSitemap()), // SR_LAUNCHED=false の間は空
  ];
}

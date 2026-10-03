/**
 * 不動産コラム 追記型シード（2026-08-22 新設）
 *
 * ■ これは「追記型」のスクリプトです。
 *   不動産コラム（luck428.com /column・business=realestate）を1本足すたびに
 *   枝番スクリプト（-p2 …… -p6）と専用の管理画面ページを新規作成する方式をやめ、
 *   このファイルの ARTICLES に1エントリ追記するだけで済む形にしたもの。
 *   枝番方式は1本あたり seed 約294行＋管理画面 約121行＝約415行の新規作成が必要だった。
 *   毎日2本の運用では1か月で -p66 まで増えるため、ここで止める。
 *
 * ■ 新しい枝番スクリプト（seed-realestate-columns-p7.ts 等）を作らないこと。
 *   管理画面も /admin/columns/seed-realestate-daily で固定。記事が増えてもページを増やさない。
 *
 * ■ 1本追加する手順
 *   1. 原稿 scripts/realestate-columns/NN-<slug>.md を書く
 *      （H1なし／「**結論（先に要点）**：」開始／H2は疑問文／FAQ4問以上／
 *        「## この記事の出典（一次情報）」節／「一般的な情報提供」の判断留保／
 *        分離受任の明示／紹介料の扱い／禁止語を使わない）
 *   2. 翻訳する言語だけ scripts/realestate-columns/{en,zh-tw,zh}/NN-<slug>.md を書く
 *      （frontmatter に title / excerpt / category。内部リンクは絶対URL。相対パスはNG）
 *   3. 下の ARTICLES に1エントリ追記する（publishedAt と category は記事ごとに持たせる）
 *   4. npx tsx scripts/seed-realestate-columns-daily.ts → 「OK: 全チェック通過」を確認
 *   5. npx tsx scripts/seed-realestate-columns-daily.ts --emit-ts
 *      → src/lib/data/realestate-columns-daily-seed.ts を再生成（忘れると管理画面に並ばない）
 *   6. PRを出す（マージは浦松の指示を受けてから）
 *   7. マージ・デプロイ後に /admin/columns/seed-realestate-daily から投入
 *
 * ■ 既存記事をここへ移管しないこと。
 *   scripts/gh-columns/06-youto-henko.md は2つのスクリプトから同一slugを生成しており、
 *   片方だけ再emitすると本文が巻き戻る事故の種になっている。同じ轍を踏まないため、
 *   ARTICLES には「このスクリプトで新規に足した記事」だけを入れる。
 *   既存の枝番スクリプトと生成物（realestate-columns{,-p2..-p6}-seed.ts）は触らない。
 *
 * 使い方:
 *   npx tsx scripts/seed-realestate-columns-daily.ts            # dry-run（scripts/realestate-columns-daily.preview.json）
 *   npx tsx scripts/seed-realestate-columns-daily.ts --emit-ts  # src/lib/data/realestate-columns-daily-seed.ts を生成
 *
 * 本番投入は /admin/columns/seed-realestate-daily（管理者セッション経由・冪等upsert）を正とする。
 * --write は用意しない（このスクリプトはDBに書き込まない）。
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { AKIYA_GH_TENYO_SEED } from "../src/lib/data/akiya-gh-tenyo-seed";
import { HIKYOJUSHA_GAITAMEHO_COLUMN } from "../src/lib/data/hikyojusha-gaitameho-column-seed";
import { LEAVING_JAPAN_COLUMNS_SEED } from "../src/lib/data/leaving-japan-columns-seed";
import { REALESTATE_COLUMNS_P2_SEED } from "../src/lib/data/realestate-columns-p2-seed";
import { REALESTATE_COLUMNS_P3_SEED } from "../src/lib/data/realestate-columns-p3-seed";
import { REALESTATE_COLUMNS_P4_SEED } from "../src/lib/data/realestate-columns-p4-seed";
import { REALESTATE_COLUMNS_P5_SEED } from "../src/lib/data/realestate-columns-p5-seed";
import { REALESTATE_COLUMNS_P6_SEED } from "../src/lib/data/realestate-columns-p6-seed";
import { REALESTATE_COLUMNS_SEED } from "../src/lib/data/realestate-columns-seed";
import { SOUZOKU_JIKKA_SEED } from "../src/lib/data/souzoku-jikka-seed";
import { TAIWAN_COLUMNS_SEED } from "../src/lib/data/taiwan-columns-seed";
import { TOCHINE_YOSEKIRITSU_SEED } from "../src/lib/data/tochine-yosekiritsu-seed";

type Faq = { question: string; answer: string };

type Translation = {
  title: string;
  excerpt: string;
  content: string;
  category?: string;
};

type SeedColumn = {
  business: "realestate";
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  status: "published";
  author: { name: string; title: string };
  keywords: string[];
  tags: string[];
  locales: string[];
  faq: Faq[];
  translations?: { en?: Translation; "zh-tw"?: Translation; zh?: Translation };
};

const AUTHOR = {
  name: "浦松 丈二",
  title: "代表取締役・宅地建物取引士（四葉不動産株式会社）",
} as const;

const FORBIDDEN_WORDS = ["ワンストップ", "一括対応", "一体で", "一気通貫", "one-stop", "一站式"];

/**
 * 社会保険労務士の開業（2026-09-01）。**開業を前提にしていた検査**だけをこのフラグで切る。
 *
 * 正本は src/lib/shared/office.ts の SR_LAUNCHED（NEXT_PUBLIC_SR_LAUNCHED 由来）だが、
 * ここから import しない：
 *   - office.ts は `@/` エイリアスを使うサーバ専用モジュールで、このseedスクリプトの
 *     相対import（../src/lib/data/*）とは解決経路が違う
 *   - **CI は NEXT_PUBLIC_SR_LAUNCHED を設定していない**（.github/ 全体で0件＝2026-09-01実測）。
 *     env だけを見ると validate ジョブで常に false になり、切ったつもりが切れていない
 * そのため env があればそれを優先し、無ければ開業日（JST）で判定する。
 * 開業日は過ぎているので以後は常に true。ローカルで開業前の挙動を再現したいときだけ
 * NEXT_PUBLIC_SR_LAUNCHED を使わずに SR_LAUNCH_DATE を未来日へ差し替える。
 */
const SR_LAUNCH_DATE = "2026-09-01";
const SR_LAUNCHED =
  process.env.NEXT_PUBLIC_SR_LAUNCHED === "true" ||
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) >= SR_LAUNCH_DATE;

/**
 * 内部リンク先（/column/<slug>）の許可リスト。
 *
 * 手で維持しない。既存の realestate 系シード生成物から実行時に集める。
 * /column は business=realestate 専用ルート（社労士は /labor/column、行政書士は /legal/column）なので、
 * business で絞ってから slug を取る。記事を1本追加するときにこのリストを触る必要はない。
 *
 * ここに並ぶのは「realestate のコラムを1本でも含む src/lib/data の生成物」。
 * 枝番スクリプトを新設しない限り増えない（増やさないのが本スクリプトの目的）。
 *
 * ■ ただしリポジトリ由来だけでは足りない（2026-08-23 追記）
 *   管理画面から直接作られてリポジトリに原稿が無い記事が本番に実在する。
 *   例: /column/inuki-bukken-keiyakumae-hokenjo は本番で200を返すが、
 *   どの seed 生成物にも定義がないためこの Set に載らない。
 *   その結果 2026-08-23 に GitHub Actions の検証が
 *   「NG: shinya-shurui-inshoku-bukken-tekihi → 不明slug inuki-bukken-keiyakumae-hokenjo」
 *   で落ちた（2026-08-22 にも同じNGが出て、そのときは記事側のリンクを
 *   差し替えて回避している。原因が消えていないので再発した）。
 *   実在するURLを弾くのは検査の誤りなので、main() で本番 sitemap 由来の
 *   /column/<slug> を union して埋める（下の fetchPublishedColumnSlugs）。
 *   これは緩和ではない。実在しない slug は今までどおり NG で落ちる。
 *
 * union するので const ではなく let。
 */
let EXISTING_COLUMN_SLUGS: Set<string> = new Set(
  [
    REALESTATE_COLUMNS_SEED,
    REALESTATE_COLUMNS_P2_SEED,
    REALESTATE_COLUMNS_P3_SEED,
    REALESTATE_COLUMNS_P4_SEED,
    REALESTATE_COLUMNS_P5_SEED,
    REALESTATE_COLUMNS_P6_SEED,
    SOUZOKU_JIKKA_SEED,
    AKIYA_GH_TENYO_SEED,
    TOCHINE_YOSEKIRITSU_SEED,
    LEAVING_JAPAN_COLUMNS_SEED,
    TAIWAN_COLUMNS_SEED,
    HIKYOJUSHA_GAITAMEHO_COLUMN,
  ]
    .flat()
    .filter((c) => c.business === "realestate")
    .map((c) => c.slug),
);

const SITEMAP_URL = "https://luck428.com/sitemap.xml";
const SITEMAP_TIMEOUT_MS = 15_000;

/**
 * 他士業ルートに実在する slug（slug → その士業のルート接頭辞）。
 *
 * 用途は「NGメッセージに理由を添える」ことだけ。許可リストには入れない。
 * /column は business=realestate 専用ルートなので、行政書士・社労士の記事へ
 * /column/<slug> でリンクしたものは今までどおり NG で落とす（緩和しない）。
 *
 * 2026-08-24 の Daily Columns はこれで落ちた。slug は実在するのに
 * ルート接頭辞だけ間違っている、というのは NG 文面からは読み取れなかった。
 */
let OTHER_BUSINESS_COLUMN_SLUGS: Map<string, { prefix: string; label: string }> = new Map();

/** sitemap から拾う他士業ルート（/column は realestate 専用なのでここには入れない）。 */
const OTHER_BUSINESS_ROUTES = [
  { prefix: "/legal/column", label: "行政書士側" },
  { prefix: "/labor/column", label: "社労士側" },
] as const;

type PublishedSlugs = {
  /** 許可リストに union する realestate の slug。 */
  realestate: string[];
  /** ヒント専用。他士業ルートに実在する slug → そのルート接頭辞。 */
  other: Map<string, { prefix: string; label: string }>;
};

/**
 * 本番 sitemap に実在する /column/<slug> を集める。
 *
 * 拾うのは日本語の実体URL（`<loc>https://luck428.com/column/<slug></loc>`）だけ。
 * - ロケール接頭辞つき（/en/column/ /zh-tw/column/ /zh/column/）は拾わない。
 *   記事本文の内部リンクは日本語URLで書く決まりなので、許可リストに入れる意味がない。
 * - 他士業の /legal/column/ /labor/column/ は許可リストには入れない
 *   （/column は business=realestate 専用ルート）。ただし「slug は実在するが
 *   ルート接頭辞が別士業」という取り違えを NG 文面で言い当てるために、
 *   別枠（other）で集めて返す。許可リストが緩むわけではない。
 * - `<xhtml:link rel="alternate" href="…">` は `<loc>` ではないので、この正規表現には入らない。
 *
 * 取得に失敗しても検証は止めない。sitemap が引けないのは記事の不備ではないので
 * NG ではなく WARN を出し、リポジトリ由来の許可リストだけで続行する
 * （実在しない slug はその場合も NG のまま落ちる）。
 *
 * @returns realestate= 許可リストに union する slug、other= 他士業ルートに実在する
 *   slug の対応表（ヒント専用、許可リストには入れない）。取得できなかったときは null。
 */
async function fetchPublishedColumnSlugs(): Promise<PublishedSlugs | null> {
  let res: Response;
  try {
    res = await fetch(SITEMAP_URL, { signal: AbortSignal.timeout(SITEMAP_TIMEOUT_MS) });
  } catch (e) {
    const reason = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.log(`WARN: sitemap を取得できませんでした（${reason}）。リポジトリ由来の許可リストだけで検証を続行します。`);
    return null;
  }
  if (!res.ok) {
    console.log(`WARN: sitemap の取得に失敗（HTTP ${res.status}）。リポジトリ由来の許可リストだけで検証を続行します。`);
    return null;
  }
  let xml: string;
  try {
    xml = await res.text();
  } catch (e) {
    const reason = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.log(`WARN: sitemap の読み出しに失敗（${reason}）。リポジトリ由来の許可リストだけで検証を続行します。`);
    return null;
  }
  const re = /<loc>https:\/\/luck428\.com\/column\/([a-z0-9-]+)<\/loc>/g;
  const realestate = [...xml.matchAll(re)].map((m) => m[1]);

  // 他士業ルートは許可リストではなくヒント用に集める（用途の違いは上の宣言のコメント参照）。
  const other = new Map<string, { prefix: string; label: string }>();
  for (const route of OTHER_BUSINESS_ROUTES) {
    const rx = new RegExp(
      `<loc>https://luck428\\.com${route.prefix.replace(/\//g, "\\/")}/([a-z0-9-]+)</loc>`,
      "g",
    );
    for (const m of xml.matchAll(rx)) {
      if (!other.has(m[1])) other.set(m[1], route);
    }
  }
  return { realestate, other };
}

type ArticleSpec = {
  /** scripts/realestate-columns/ 配下のファイル名（翻訳も同名で {en,zh-tw,zh}/ 配下に置く） */
  file: string;
  slug: string;
  title: string;
  /** 記事ごとの公開日（YYYY-MM-DD）。バッチ共通の定数にしない */
  publishedAt: string;
  /** 記事ごとのカテゴリ。バッチ共通の定数にしない */
  category: string;
  excerpt: string;
  keywords: string[];
  tags: string[];
  locales: string[];
  localesWithTranslations?: Array<"zh" | "zh-tw" | "en">;
  /** 本文に必ず出す送出先（/office など）。全件の存在を verify で確認する */
  hubLinks: string[];
};

/**
 * 追記していく配列。ここに1エントリ足すのが「1本追加する」の実体。
 *
 * テンプレート（コピーして使う）:
 *   {
 *     file: "12-<slug>.md",
 *     slug: "<slug>",
 *     title: "……",
 *     publishedAt: "2026-08-23",
 *     category: "投資・事業用不動産",
 *     excerpt: "……",
 *     keywords: ["……"],
 *     tags: ["……"],
 *     locales: ["ja"],
 *     localesWithTranslations: [],
 *     hubLinks: ["/toushi"],
 *   },
 */
const ARTICLES: ArticleSpec[] = [
  {
    file: "12-clinic-bukken-youto-chiiki-kaisetsu-todokede.md",
    slug: "clinic-bukken-youto-chiiki-kaisetsu-todokede",
    title: "クリニックの物件は、契約前に何を確認するのか──用途地域・用途変更・開設届の順番",
    publishedAt: "2026-08-22",
    category: "投資・事業用不動産",
    excerpt:
      "診療所は用途地域の制限では13地域すべてで建てられます。物件で詰まるのは用途地域ではなく、有床か無床か、用途変更の確認申請の要否、消防用設備の現況、そして開設者が個人か医療法人か。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と自治体の案内から順に整理します。",
    keywords: [
      "クリニック 物件",
      "診療所 用途地域",
      "診療所 用途変更 確認申請",
      "診療所開設届",
      "医療法人 診療所 開設許可",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "13-souzoku-shakuchi-jinushi-shodaku-baikyaku.md",
    slug: "souzoku-shakuchi-jinushi-shodaku-baikyaku",
    title: "相続した家が借地だった──地主の承諾がいる場面・いらない場面と、売るときの順番",
    publishedAt: "2026-08-22",
    category: "相続",
    excerpt:
      "相続で借地上の建物を引き継ぐこと自体に、地主の承諾は要りません。承諾が要るのは売るときです。旧法と新法の分かれ目、建物の登記が対抗力の土台になること、売る前に集める書類まで、東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "借地権 相続",
      "借地 地主 承諾",
      "借地権 売却",
      "借地非訟 承諾に代わる許可",
      "旧借地法 借地借家法 違い",
    ],
    tags: ["相続", "借地権", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "14-unsou-eigyosho-shako-bukken-yoken.md",
    slug: "unsou-eigyosho-shako-bukken-yoken",
    title: "運送業を始めるなら、営業所と車庫の物件はどこを見て選ぶか",
    publishedAt: "2026-08-23",
    category: "投資・事業用不動産",
    excerpt:
      "運送業（緑ナンバー）の物件で詰まるのは用途地域ではありません。営業所と車庫が市街化調整区域でないか、両者の直線距離が公示の範囲内か、車庫が全車両を収容でき前面道路が通れる幅員か、休憩施設を営業所か車庫に併設できるか。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と公示から順に整理します。",
    keywords: [
      "運送業 物件",
      "一般貨物 営業所 車庫",
      "運送業 車庫 要件",
      "営業所 車庫 距離",
      "運送業 市街化調整区域",
    ],
    tags: ["事業用不動産", "許認可", "運送業", "市街化調整区域"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "15-souzoku-nochi-baikyaku-kashidashi-nagare.md",
    slug: "souzoku-nochi-baikyaku-kashidashi-nagare",
    title: "相続した農地を売る・貸すときに最初に確認すること",
    publishedAt: "2026-08-23",
    category: "相続",
    excerpt:
      "相続した農地は、売る・貸す前に「農地のままか、宅地などに転用するか」で手続きが分かれます。農地のまま耕作目的で売買・貸借するには農業委員会の許可（農地法第3条）、転用して売るには都道府県知事等の許可（第4条・第5条）が要り、市街化区域内なら届出で足ります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と農林水産省の資料から順に整理します。",
    keywords: [
      "農地 相続 売却",
      "農地 貸す 農業委員会",
      "農地法 3条 4条 5条",
      "農地 転用 市街化区域 届出",
      "相続 農地 3条の3 届出",
    ],
    tags: ["相続", "農地", "農地法", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "16-chugokugo-buyer-juyojiko-check-toushi-bukken.md",
    slug: "chugokugo-buyer-juyojiko-check-toushi-bukken",
    title: "中国語圏の買主に日本の収益物件を紹介する前に読む重要事項説明の要点",
    publishedAt: "2026-08-23",
    category: "投資・事業用不動産",
    excerpt:
      "日本の収益物件を中国語圏の買主に紹介する前に読むべきは、宅地建物取引業法第35条の重要事項説明です。登記された権利・法令上の制限・私道負担・供給施設が並び、非居住者が買主になるときは外為法の報告と税務の確認が先に重なります。東京都文京区の宅地建物取引士兼行政書士が、買主側デューデリの観点を条文と公的資料から整理します。",
    keywords: [
      "重要事項説明 宅建業法35条",
      "収益物件 買主 デューデリ",
      "非居住者 不動産 外為法 報告",
      "非居住者 賃料 源泉徴収",
      "中国語圏 買主 日本 不動産",
    ],
    tags: ["投資・事業用不動産", "重要事項説明", "非居住者", "外為法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "17-hoiku-shoukibo-bukken-youto-chiiki.md",
    slug: "hoiku-shoukibo-bukken-youto-chiiki",
    title: "小規模保育事業の物件を貸す・探すとき、用途地域と面積で何を確認するのか",
    publishedAt: "2026-08-24",
    category: "投資・事業用不動産",
    excerpt:
      "小規模保育の物件は用途地域では詰まりません。保育所は最も厳しい第一種低層住居専用地域でも建てられます。詰まるのは居室の面積（満2歳未満は1人3.3㎡、満2歳以上は1人1.98㎡）、用途変更の確認申請の要否、消防用設備、2階以上の避難の4点。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と省令から順に整理します。",
    keywords: [
      "小規模保育 物件",
      "保育所 用途地域",
      "保育所 用途変更 確認申請",
      "小規模保育 面積 基準",
      "保育所 消防設備",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "保育"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "18-souzoku-saikenchiku-fuka-baikyaku.md",
    slug: "souzoku-saikenchiku-fuka-baikyaku",
    title: "相続した再建築不可の物件は、売る前に何を確かめるのか",
    publishedAt: "2026-08-24",
    category: "相続",
    excerpt:
      "相続した再建築不可の物件は、まず接道を確かめます。建築基準法第43条は敷地が道路に2m以上接することを求め、幅員4m未満のみなし道路（2項道路）ではセットバックが要ります。接道が足りなくても、隣地の買い増しや第43条第2項の認定・許可という道があります。東京都文京区の宅地建物取引士兼行政書士が、売る前に確認できることを条文から整理します。",
    keywords: [
      "再建築不可 相続 売却",
      "接道義務 建築基準法 43条",
      "43条2項 認定 許可 建築審査会",
      "2項道路 セットバック",
      "無道路地 評価 財産評価基本通達",
    ],
    tags: ["相続", "再建築不可", "接道義務", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "19-chuka-souzoku-akiya-shodo-genchi.md",
    slug: "chuka-souzoku-akiya-shodo-genchi",
    title: "中華圏の相続人が日本の空き家を相続したとき、不動産会社が最初にできることは何か",
    publishedAt: "2026-08-24",
    category: "相続",
    excerpt:
      "中華圏の相続人が日本の空き家を相続したとき、不動産会社が相続直後にできるのは現地確認・査定・維持管理・売却準備の4つです。日本にいなくても現地を見て査定を出せ、相続登記や遺産分割の前でも並行できます。東京都文京区の宅地建物取引士兼行政書士が、不動産会社の範囲と他士業に振る境目を条文から整理します。",
    keywords: [
      "海外 相続人 日本 空き家",
      "相続登記 義務化 3年 不動産登記法",
      "空き家 固定資産税 住宅用地特例",
      "管理不全空家 特定空家 勧告",
      "在外相続人 署名証明 印鑑証明",
    ],
    tags: ["相続", "空き家", "中国語圏", "非居住者"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "20-biyoshitsu-riyojo-bukken-hokenjo-todokede.md",
    slug: "biyoshitsu-riyojo-bukken-hokenjo-todokede",
    title: "美容室・理容所を開くための物件は何を確認する？──保健所の構造設備基準と用途地域",
    publishedAt: "2026-08-25",
    category: "投資・事業用不動産",
    excerpt:
      "美容室・理容所の物件で保健所が見るのは、作業場と待合を明確に区分できるか、洗場・消毒・採光照明換気が整うかの2点です。飲食店やクリニックと違い、美容院・理髪店は建築基準法の用途地域制限を受けます。開設届はあらかじめ出し、構造設備の検査・確認を受けてからでなければ使えません。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と厚生労働省の要領から整理します。",
    keywords: [
      "美容室 物件 保健所",
      "美容所 構造設備基準",
      "理容所 開設届",
      "美容院 用途地域 兼用住宅",
      "美容所 検査確認 使用",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "美容師法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "21-souzoku-kyutaishin-mansion-baikyaku.md",
    slug: "souzoku-kyutaishin-mansion-baikyaku",
    title: "相続した旧耐震マンションは売れる？──新耐震基準と買主の住宅ローンの壁",
    publishedAt: "2026-08-25",
    category: "相続",
    excerpt:
      "相続した旧耐震マンションは売れます。境目は1981年6月1日で、この日以降に建築確認を受けた建物が新耐震です。売却の鍵は買主が住宅ローンを組めるか。買主の住宅ローン控除は登記簿上の建築日付が昭和57年1月1日以降かで変わり、旧耐震では耐震基準適合証明が要りますが区分マンションでは取得が難しいことが多い点まで、東京都文京区の宅地建物取引士兼行政書士が条文と国税庁の資料から整理します。",
    keywords: [
      "旧耐震 マンション 相続 売却",
      "新耐震基準 1981年6月1日",
      "耐震基準適合証明書 住宅ローン控除",
      "空き家 3000万円控除 区分所有 対象外",
      "旧耐震 住宅ローン 買主",
    ],
    tags: ["相続", "旧耐震", "マンション", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "22-doubutsu-toriatsukai-bukken-youken.md",
    slug: "doubutsu-toriatsukai-bukken-youken",
    title: "トリミング・ペットショップの物件、開業前に何を確認する？──第一種動物取扱業の飼養施設と物件の条件",
    publishedAt: "2026-08-26",
    category: "投資・事業用不動産",
    excerpt:
      "トリミングサロン・ペットショップの物件で先に詰まるのは、飼養施設の基準（ケージ・洗浄・消毒・換気・排水）を満たせるか、臭気・鳴き声で近隣とぶつからないか、賃貸借契約で「動物の飼養」が禁じられていないかの3点です。第一種動物取扱業の登録は事業所ごとで、物件が飼養施設の基準を満たせることが前提。東京都文京区の宅地建物取引士兼行政書士が、動物の愛護及び管理に関する法律の条文と環境省・自治体の案内から、契約前に確認できることを整理します。",
    keywords: [
      "トリミングサロン 物件",
      "ペットショップ 開業 物件",
      "第一種動物取扱業 登録 飼養施設",
      "動物取扱業 ケージ 数値規制",
      "動物取扱業 用途地域 賃貸",
    ],
    tags: ["事業用不動産", "許認可", "動物取扱業", "用途地域"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "23-sakoju-bukken-youken-toroku.md",
    slug: "sakoju-bukken-youken-toroku",
    title: "サ高住にできる物件の条件は？各戸25㎡・バリアフリーの実際──高齢者住まい法の登録基準",
    publishedAt: "2026-08-26",
    category: "投資・事業用不動産",
    excerpt:
      "サービス付き高齢者向け住宅（サ高住）として登録できる物件の骨格は、各戸原則25㎡以上（共用部分が十分なら18㎡以上）、各戸または共用部分の台所・便所・洗面・浴室・収納、廊下幅・段差・手すりのバリアフリー、少なくとも安否確認と生活相談の提供の4つです。既存建物でも満たせますが、床面積と共用設備の作りで可否が決まります。東京都文京区の宅地建物取引士兼行政書士が、高齢者の居住の安定確保に関する法律と国交省・厚労省の案内から物件条件を整理します。",
    keywords: [
      "サ高住 物件 条件",
      "サービス付き高齢者向け住宅 登録基準",
      "サ高住 25㎡ 18㎡ 床面積",
      "サ高住 バリアフリー 既存建物 改修",
      "高齢者住まい法 登録",
    ],
    tags: ["事業用不動産", "許認可", "サ高住", "バリアフリー"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "24-houkago-day-bukken-youto-chiiki-1kai.md",
    slug: "houkago-day-bukken-youto-chiiki-1kai",
    title: "放課後等デイサービスの物件は、用途地域・1階・面積・採光で決まる",
    publishedAt: "2026-08-27",
    category: "投資・事業用不動産",
    excerpt:
      "放課後等デイサービスに使える物件は、用途地域（工業専用地域では児童福祉施設等を建てられず、それ以外の12地域は原則可）、指導訓練室と面積、避難（児童の活動室を2階以上に置くなら要確認）、消防（消防法施行令別表第一(6)項ロ・ハ）、耐震の5点で決まります。東京都文京区の宅地建物取引士兼行政書士が、貸主・借主が物件を選ぶ段階で確認できる適合条件を条文と自治体の運用から整理します。",
    keywords: [
      "放課後等デイサービス 物件",
      "児童発達支援 用途地域",
      "放課後等デイ 訓練室 面積",
      "放課後等デイ 用途変更 確認申請",
      "児童福祉施設等 消防 (6)項ロ",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "障害福祉"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "25-souzoku-akiya-kaitai-koyatsuki-dochira.md",
    slug: "souzoku-akiya-kaitai-koyatsuki-dochira",
    title: "相続した空き家は、解体して更地で売るか古家付き土地で売るか",
    publishedAt: "2026-08-27",
    category: "相続",
    excerpt:
      "相続した空き家を「解体して更地」で売るか「古家付き土地（現況）」で売るかは、解体費と更地後に上がる固定資産税、買主層、契約不適合責任と解体費の負担、空き家3000万円特別控除（租税特別措置法35条3項）の適用のさせ方で決まります。控除は令和6年から買主が引渡し後に除却する形でも使える余地があり、解体のタイミングが手取りを左右します。東京都文京区の宅地建物取引士兼行政書士が売り方の比較を整理します。",
    keywords: [
      "相続 空き家 解体 更地",
      "古家付き土地 売却",
      "空き家 3000万円 特別控除",
      "更地 固定資産税 住宅用地特例",
      "契約不適合責任 現況渡し",
    ],
    tags: ["相続", "空き家", "売却", "税制特例"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "26-yakkyoku-bukken-youken-kozo-setsubi.md",
    slug: "yakkyoku-bukken-youken-kozo-setsubi",
    title: "調剤薬局を開くための物件は何が必要？──用途地域と構造設備基準（面積・調剤室・清潔区域）の確認点",
    publishedAt: "2026-08-28",
    category: "投資・事業用不動産",
    excerpt:
      "調剤薬局の物件で先に効くのは、①用途地域（薬局は「店舗」扱いで、診療所と違い用途地域の制限を受ける）②薬局等構造設備規則が求める面積おおむね19.8㎡以上・調剤室6.6㎡以上・清潔な区画、の2点です。医療モールやクリニック併設なら処方箋の応需と動線も見ます。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを薬機法と構造設備規則の条文から整理します。",
    keywords: [
      "調剤薬局 物件",
      "薬局開設許可 構造設備規則",
      "薬局 調剤室 6.6平方メートル",
      "薬局 用途地域 店舗",
      "医療モール 薬局 併設",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "薬機法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "27-kanka-bunkatsu-fudosan-baikyaku-nagare.md",
    slug: "kanka-bunkatsu-fudosan-baikyaku-nagare",
    title: "相続した不動産を換価分割で売る流れは？──名義・登記・譲渡税の按分まで",
    publishedAt: "2026-08-28",
    category: "相続",
    excerpt:
      "相続した不動産を「売って現金で分ける」のが換価分割です。代表者名義で登記して売る場合でも、換価のための便宜で代金を協議どおりに分けるなら贈与税は問題にならず（国税庁の質疑応答事例）、売却益にかかる譲渡所得税は各相続人が持分に応じて申告します。相続登記は2024年4月1日から義務化され、売る前提でも避けて通れません。東京都文京区の宅地建物取引士兼行政書士が、民法・所得税法・不動産登記法の条文から実務の順序を整理します。",
    keywords: [
      "換価分割 不動産 売却",
      "換価分割 代表者名義 贈与税",
      "換価分割 譲渡所得税 按分",
      "相続登記 義務化 3年 売却",
      "現物分割 代償分割 換価分割 違い",
    ],
    tags: ["相続", "換価分割", "譲渡所得税", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "28-shinkyu-seikotsuin-bukken-youto-hokenjo-todokede.md",
    slug: "shinkyu-seikotsuin-bukken-youto-hokenjo-todokede",
    title: "鍼灸院・整骨院の物件を探すとき、用途地域と保健所の開設届で何を確認する？",
    publishedAt: "2026-08-29",
    category: "投資・事業用不動産",
    excerpt:
      "鍼灸院・整骨院（あはき・柔整の施術所）の物件で先に効くのは、①用途地域（施術所は診療所と違い「サービス業を営む店舗」に準じて扱われるのが一般的で、用途地域の制限を受ける）②施術所の構造設備基準（専用施術室6.6㎡以上・待合室3.3㎡以上・換気・消毒設備）を満たせるか、の2点です。開設届は「開設後10日以内」に施術者本人が保健所へ出すもので、届出書類の作成は行政書士が承ります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることをあはき法・柔道整復師法の条文と省令から整理します。",
    keywords: [
      "鍼灸院 物件",
      "整骨院 接骨院 開業 物件",
      "施術所 構造設備基準 6.6平方メートル",
      "施術所 用途地域 サービス業を営む店舗",
      "あはき法 柔道整復師法 施術所 届出 10日以内",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "施術所"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "29-taiwan-senmonka-nihon-fudosan-touki-kenrisho-chigai.md",
    slug: "taiwan-senmonka-nihon-fudosan-touki-kenrisho-chigai",
    title: "台湾の専門家が日本の不動産取引で戸惑う登記と権利証の違いはどこ？",
    publishedAt: "2026-08-29",
    category: "相続",
    excerpt:
      "台湾の「權狀（権利証）」と日本の「登記識別情報」は、どちらも所有者の本人性を示す道具ですが性格が違います。日本は2004年の不動産登記法改正で紙の権利証（登記済証）を廃止し、英数字12桁の登記識別情報に切り替えました。所有権を公示する正本は登記簿で、権利証や識別情報を失っても事前通知や資格者代理人の本人確認情報で売れます。所有権移転登記を代理できるのは日本では司法書士で、台湾の地政士は代理できません。東京都文京区の宅地建物取引士兼行政書士が、専門家間の前提知識として条文から整理します。",
    keywords: [
      "台湾 地政士 日本 不動産 登記",
      "登記識別情報 登記済証 権利証 廃止",
      "権利証 なくても 売れる 事前通知",
      "司法書士 登記申請 代理 地政士",
      "台湾 相続人 日本 不動産 相続登記",
    ],
    tags: ["相続", "登記", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "30-gakudou-houkago-jido-club-bukken-youken.md",
    slug: "gakudou-houkago-jido-club-bukken-youken",
    title: "放課後児童クラブ（学童保育）に使える物件は？用途地域と面積・避難の目安",
    publishedAt: "2026-08-30",
    category: "投資・事業用不動産",
    excerpt:
      "放課後児童クラブ（学童保育＝放課後児童健全育成事業）に使える物件は、用途地域（工業専用地域では児童福祉施設等を建てられず、それ以外の12地域は原則可）、専用区画の面積（放課後児童健全育成事業の設備及び運営に関する基準〈平成26年厚生労働省令第63号〉第9条＝児童1人おおむね1.65㎡以上・静養区画を含む）、避難、消防、耐震の5点で決まります。放課後等デイサービスとは別制度です。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と省令から整理します。",
    keywords: [
      "放課後児童クラブ 物件",
      "学童保育 物件 用途地域",
      "放課後児童健全育成事業 面積 1.65平方メートル",
      "学童 届出 市町村 34条の8",
      "放課後児童クラブ 放課後等デイ 違い",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "学童保育"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "31-chousei-kuiki-souzoku-tochi-baikyaku.md",
    slug: "chousei-kuiki-souzoku-tochi-baikyaku",
    title: "相続した市街化調整区域の土地は売れる？既存宅地・開発許可の見分け方",
    publishedAt: "2026-08-30",
    category: "相続",
    excerpt:
      "相続した市街化調整区域の土地は、売ること自体はできます。所有権の移転に開発許可は要りません。価格を左右するのは「買主がそこに建てられるか」です。かつての既存宅地制度は2001年に廃止されており、建て替え可否は今は条例区域（都市計画法34条11号）や個別の開発許可（29条）・建築許可（43条）で決まります。東京都文京区の宅地建物取引士兼行政書士が、売る前に確認できることを条文と自治体の運用から整理します。",
    keywords: [
      "市街化調整区域 相続 売却",
      "既存宅地 廃止 2001年",
      "都市計画法 34条 43条 建築許可",
      "市街化調整区域 開発許可 29条",
      "調整区域 土地 査定 建て替え",
    ],
    tags: ["相続", "市街化調整区域", "都市計画法", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "32-jidosha-tokutei-seibi-ninsho-koujou-bukken-youken.md",
    slug: "jidosha-tokutei-seibi-ninsho-koujou-bukken-youken",
    title: "自動車整備工場（特定整備の認証工場）に使える物件の要件は？──面積・天井高・用途地域",
    publishedAt: "2026-08-31",
    category: "投資・事業用不動産",
    excerpt:
      "特定整備の認証工場（道路運送車両法第78条）に使える物件は、①用途地域で自動車修理工場を建てられる区域か②認証基準（第80条）の車両整備作業場・点検作業場が取れる広さと天井高か③リフト作業に耐える床と前面道路か、の3点で決まります。認証基準の作業場と用途地域の作業場床面積は別の物差しで、準工業・工業系が向くのはこのため。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを道路運送車両法・建築基準法の条文から整理します。",
    keywords: [
      "自動車整備工場 物件",
      "特定整備 認証工場 要件",
      "認証工場 作業場 面積 天井高",
      "自動車修理工場 用途地域 建築基準法",
      "認証工場 指定工場 民間車検場 違い",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "自動車整備"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "33-baibai-keiyaku-teppukin-loan-tokuyaku-chugokugo-buyer.md",
    slug: "baibai-keiyaku-teppukin-loan-tokuyaku-chugokugo-buyer",
    title: "中国語圏の買主が日本の売買契約で誤解しやすい条項（手付・ローン特約・契約不適合）は？",
    publishedAt: "2026-08-31",
    category: "投資・事業用不動産",
    excerpt:
      "中国語圏の買主が日本の売買契約でつまずきやすいのは、①手付が中国の「定金」と役割が違うこと（民法第557条＝解約手付）②ローン特約で契約が無条件に白紙へ戻る仕組み③契約不適合責任を「知った時から1年以内の通知」で行使する期間（民法第566条）、の3つです。東京都文京区の宅地建物取引士兼行政書士が、中国の商習慣との違いをふまえ、契約書と重要事項説明書のどの条項を先に読むかを条文から整理します。",
    keywords: [
      "日本 不動産 売買契約 手付 定金 違い",
      "ローン特約 融資利用の特約 白紙解除",
      "契約不適合責任 民法566条 1年 通知",
      "宅建業法 35条 37条 重要事項説明",
      "中国語圏 買主 非居住者 売買契約",
    ],
    tags: ["投資・事業用不動産", "売買契約", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "34-inshokuten-skeleton-bukken-haiki-grease.md",
    slug: "inshokuten-skeleton-bukken-haiki-grease",
    title: "スケルトン物件で飲食店を開くとき、排気・グリストラップ・防火で物件選びはどこまで決まるか",
    publishedAt: "2026-09-02",
    category: "投資・事業用不動産",
    excerpt:
      "スケルトン（内装なし）物件で飲食店を開けるかは、契約前の4点でほぼ決まります。①用途地域（第一種低層住居専用地域・工業専用地域では原則不可）②排気ダクトを外壁・屋上まで通せる経路と貸主の許可③グリストラップを後付けできる給排水の素地④防火区画・スプリンクラー・避難経路が階数と面積で成立するか。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを食品衛生法・建築基準法・消防法・風営法の条文から順に整理します。",
    keywords: [
      "スケルトン物件 飲食店",
      "飲食店 排気ダクト 物件",
      "グリストラップ 後付け",
      "飲食店 用途地域 工業専用地域",
      "深夜酒類提供飲食店営業 届出",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "35-souzoku-kyoyu-fudosan-uru-doui.md",
    slug: "souzoku-kyoyu-fudosan-uru-doui",
    title: "相続した共有の不動産を売る——全員の同意が要る場面と、自分の持分だけを売る場合の実務",
    publishedAt: "2026-09-02",
    category: "相続",
    excerpt:
      "相続した共有の不動産を「まるごと」売るには共有者全員の同意が要ります（民法第251条第1項）。一方、自分の持分だけなら他の共有者の同意なしに第三者へ売れますが、使い道が限られるため価格が下がりやすく買主も限られます。話し合いがまとまらないときは共有物分割（民法第256条・第258条）に進み、争いになれば弁護士へ。売る前提として相続登記（2024年4月から義務）を先に済ませます。東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "共有 不動産 売却",
      "共有持分 売却",
      "共有物分割 民法258条",
      "相続 共有 全員同意",
      "相続登記 義務化 2024",
    ],
    tags: ["相続", "共有", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "36-homon-kango-station-bukken-youken.md",
    slug: "homon-kango-station-bukken-youken",
    title: "訪問看護ステーションを開くとき、物件にはどんな条件が要りますか──専用の事務室・感染予防・用途地域",
    publishedAt: "2026-09-03",
    category: "投資・事業用不動産",
    excerpt:
      "訪問看護ステーションの物件で法令がまず求めるのは、専用の事務室と、訪問看護の提供に必要な設備・備品の2つです（指定居宅サービス等基準〈平成11年厚生省令第37号〉第62条）。利用者宅へ出向くため居室は要らず、用途地域も訪問介護・看護の事務所は技術的助言（国住街第107号・平成27年11月13日）で「老人福祉センターその他これに類するもの」として扱われ住居専用地域でも設置できる余地があります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と国の資料から整理します。",
    keywords: [
      "訪問看護ステーション 物件",
      "訪問看護 事務室 設備基準",
      "訪問看護 用途地域 老人福祉センター",
      "指定居宅サービス基準 第62条 事務室",
      "訪問看護 指定 都道府県 地方厚生局",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "訪問看護"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "37-kaigai-souzokunin-owner-change-baikyaku-gensen.md",
    slug: "kaigai-souzokunin-owner-change-baikyaku-gensen",
    title: "海外に住む相続人が、賃貸中のマンションを売るにはどう進めますか──オーナーチェンジ売却と源泉徴収10.21％",
    publishedAt: "2026-09-03",
    category: "相続",
    excerpt:
      "賃貸中のマンションを相続した海外居住の相続人が売るときは、相続・賃貸中・非居住者売主の3条件が重なります。オーナーチェンジ売却は賃貸借契約と敷金・賃借人をそのまま買主へ引き継ぎ（賃貸人たる地位の移転＝民法第605条の2）、売る前提でも相続登記（不動産登記法第76条の2・2024年4月1日施行）を先に済ませ、非居住者が売主だと買主が譲渡対価の10.21％を源泉徴収して確定申告で精算します。東京都文京区の宅地建物取引士兼行政書士が、条文と国税庁の資料から手順を整理します。",
    keywords: [
      "海外 相続人 オーナーチェンジ 売却",
      "非居住者 不動産 譲渡 源泉徴収 10.21%",
      "賃貸人たる地位の移転 民法605条の2 敷金",
      "相続登記 義務化 2024 非居住者",
      "賃貸中 マンション 売却 賃借人 通知",
    ],
    tags: ["相続", "オーナーチェンジ", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "38-jutakugata-yuryo-roujin-home-bukken-youken.md",
    slug: "jutakugata-yuryo-roujin-home-bukken-youken",
    title: "住宅型有料老人ホームの物件を探す：用途地域・消防・面積の要件",
    publishedAt: "2026-09-04",
    category: "投資・事業用不動産",
    excerpt:
      "住宅型有料老人ホームの物件で先に効くのは、①用途地域（有料老人ホームは「老人ホーム」として児童福祉施設等に含まれ、工業専用地域を除くすべての用途地域で建てられる）②消防（消防法施行令別表第一(6)項ロか(6)項ハかで、スプリンクラー設備が延べ面積に関わらず要るか6,000㎡以上で要るかが変わる）③居室の面積（老人福祉法上の一律基準はないが、標準指導指針は個室・1人13㎡以上を目安とする）の3点です。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と国の資料から順に整理します。",
    keywords: [
      "住宅型有料老人ホーム 物件",
      "有料老人ホーム 用途地域 児童福祉施設等",
      "有料老人ホーム スプリンクラー 6項ロ 6項ハ",
      "有料老人ホーム 届出 老人福祉法29条",
      "住宅型 サ高住 介護付 違い",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "39-souzoku-fudosan-kyoukai-kakutei-sokuryo-baikyaku.md",
    slug: "souzoku-fudosan-kyoukai-kakutei-sokuryo-baikyaku",
    title: "相続した土地、境界が未確定のまま売れる？確定測量が要る場面",
    publishedAt: "2026-09-04",
    category: "相続",
    excerpt:
      "相続した土地は、境界が未確定でも売ること自体はできます。ただし買主・金融機関は確定測量図を求めることが多く、ないと価格が下がったり引渡しが遅れたりします。境界が争いになれば筆界特定制度（不動産登記法第123条以下・平成18年施行）や分筆の登記へ進み、これらは土地家屋調査士が担います。確定測量図・現況測量図・地積測量図の読み分けから、相続登記・譲渡税と測量の順番まで、東京都文京区の宅地建物取引士兼行政書士が条文と国の資料から整理します。",
    keywords: [
      "相続 土地 境界 未確定 売却",
      "確定測量図 現況測量図 地積測量図 違い",
      "筆界特定制度 不動産登記法 123条",
      "確定測量 土地家屋調査士 費用 期間",
      "取得費加算 租税特別措置法39条 相続 売却",
    ],
    tags: ["相続", "境界確定", "確定測量", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "40-kensazumisho-nashi-bukken-fukushi-youto-henko.md",
    slug: "kensazumisho-nashi-bukken-fukushi-youto-henko",
    title: "検査済証のない中古物件を福祉施設に転用できるか──物件選びで先に見る点",
    publishedAt: "2026-09-05",
    category: "投資・事業用不動産",
    excerpt:
      "検査済証のない中古物件でも、障害福祉やデイの施設に転用できることはあります。物件を選ぶ段階で見るのは、その用途に使う部分の床面積が200㎡を超えるか（用途変更の確認申請の要否）、検査済証がなければ法適合状況調査で建築時の適法性を確かめられるか、既存不適格か違反建築か、の3点です。東京都文京区の宅地建物取引士兼行政書士が、内見の前に書類で絞り込める点を条文と国の資料から整理します。",
    keywords: [
      "検査済証 ない 物件 福祉 用途変更",
      "用途変更 確認申請 200平方メートル 建築基準法87条",
      "既存不適格 違反建築 違い",
      "法適合状況調査 既存建築物 現況調査ガイドライン",
      "障害福祉 デイサービス 物件 転用",
    ],
    tags: ["事業用不動産", "許認可", "用途変更", "検査済証"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "41-hikyojusha-shisan-kanri-hojin-shuueki-bukken.md",
    slug: "hikyojusha-shisan-kanri-hojin-shuueki-bukken",
    title: "中国・台湾の買主は日本の収益物件を法人で持つべきか個人で持つべきか",
    publishedAt: "2026-09-05",
    category: "投資・事業用不動産",
    excerpt:
      "中華圏の非居住者が日本の収益物件を持つとき、法人（日本の資産管理会社）で持つか個人で持つかは買う前に決めておく論点です。分かれ目は、非居住者本人が受け取る賃料の源泉徴収と確定申告、内国法人が受け取る賃料が非居住者源泉の対象外になること、どちらでも要る納税管理人の3つ。最終的な有利不利は税理士の領域で、東京都文京区の宅地建物取引士兼行政書士が物件取得と管理の実務の側から整理します。",
    keywords: [
      "非居住者 日本 収益物件 法人 個人",
      "資産管理会社 設立 非居住者 不動産",
      "非居住者 賃料 源泉徴収 所得税法212条",
      "納税管理人 国税通則法117条",
      "中華圏 投資家 日本 不動産 保有",
    ],
    tags: ["投資用不動産", "非居住者", "中国語", "税務"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "42-ninchisho-taiogata-grouphome-bukken-youken.md",
    slug: "ninchisho-taiogata-grouphome-bukken-youken",
    title: "認知症グループホームはどんな物件なら開設できる？用途地域・面積・消防の要件",
    publishedAt: "2026-09-06",
    category: "投資・事業用不動産",
    excerpt:
      "認知症グループホーム（認知症対応型共同生活介護）は、どんな物件でも開設できるわけではありません。効くのは、市町村の日常生活圏域ごとの必要利用定員総数の空き（総量規制）、消防法施行令別表第一(6)項ロとしてのスプリンクラー等、1ユニット5〜9人という規模、既存建物の用途変更の要否の4点です。東京都文京区の宅地建物取引士兼行政書士が、内見の前に書類で絞り込める点を条文と公的資料から整理します。",
    keywords: [
      "認知症グループホーム 物件 要件",
      "認知症対応型共同生活介護 開設",
      "地域密着型サービス 総量規制 日常生活圏域",
      "グループホーム スプリンクラー 消防法施行令 6項ロ",
      "グループホーム 用途変更 確認申請 200平方メートル",
    ],
    tags: ["事業用不動産", "許認可", "介護", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "43-souzoku-mitouki-tatemono-hyodai-touki-baikyaku.md",
    slug: "souzoku-mitouki-tatemono-hyodai-touki-baikyaku",
    title: "相続した実家に未登記の建物がある。そのまま売れる？表題登記からの流れ",
    publishedAt: "2026-09-06",
    category: "相続",
    excerpt:
      "相続した実家に未登記の建物があっても、売ること自体はできます。ただし買主・金融機関は登記を求めるため、売る前に表題登記（土地家屋調査士）と所有権保存登記（司法書士）を入れ、相続の名義に整えるのが実務です。固定資産税は払っているのに未登記、という状態がなぜ起きるかも含め、東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "未登記建物 相続 売却",
      "表題登記 所有権保存登記 不動産登記法47条 74条",
      "未登記家屋 固定資産税 家屋補充課税台帳",
      "相続登記 義務化 76条の2 令和6年4月1日",
      "未登記 建物 土地家屋調査士 司法書士",
    ],
    tags: ["相続", "登記", "未登記建物", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "44-souzoku-sublease-master-lease-chii-shokei.md",
    slug: "souzoku-sublease-master-lease-chii-shokei",
    title: "サブリース中の賃貸物件を相続したら、契約と賃料はどう引き継がれるか",
    publishedAt: "2026-09-07",
    category: "相続",
    excerpt:
      "サブリース（一括借上げ）中の賃貸物件を相続すると、貸主の地位はそのまま相続人に承継されます（民法第896条）。相続を理由に契約をすぐ解約することはできず（借地借家法第28条）、賃料保証が付いていてもサブリース業者からの賃料減額請求はあり得ます（借地借家法第32条第1項・最高裁平成15年10月21日判決）。サブリース新法で確認すべき書面と登録業者の調べ方まで、東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "サブリース 相続",
      "一括借上げ 相続 賃貸人たる地位",
      "サブリース 中途解約 正当事由 借地借家法28条",
      "サブリース 賃料減額請求 借地借家法32条",
      "賃貸住宅管理業法 重要事項説明 特定賃貸借契約",
    ],
    tags: ["相続", "サブリース", "賃貸経営", "借地借家法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "45-souzoku-haiguusha-kyojuuken-tatemono-baikyaku.md",
    slug: "souzoku-haiguusha-kyojuuken-tatemono-baikyaku",
    title: "配偶者居住権が設定された相続建物は売れるのか──評価・買い手・消滅の実務",
    publishedAt: "2026-09-08",
    category: "相続",
    excerpt:
      "配偶者居住権が付いた相続建物も、所有権を相続した人は売れます。ただし居住権が登記されていれば買主に対抗でき（民法第1031条）、居住権は第三者に譲渡できない（民法第1032条第2項）ため、実務では配偶者に放棄・合意消滅してもらい抹消登記を入れてから売るのが通例です。抹消登記は司法書士、消滅の対価にかかる譲渡所得やみなし贈与は税理士、遺産分割の紛争は弁護士に振り分けます。東京都文京区の宅地建物取引士兼行政書士が、売却の可否と段取りを条文と国税庁の資料から整理します。",
    keywords: [
      "配偶者居住権 建物 売却",
      "配偶者居住権 登記 対抗 民法1031条",
      "配偶者居住権 譲渡できない 民法1032条",
      "配偶者居住権 合意 消滅 抹消登記",
      "配偶者居住権 消滅 譲渡所得 みなし贈与",
    ],
    tags: ["相続", "配偶者居住権", "売却", "登記"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "46-hikyojusha-buyer-apart-loan-yushi-kanou.md",
    slug: "hikyojusha-buyer-apart-loan-yushi-kanou",
    title: "非居住者の中華圏バイヤーは日本の収益物件でアパートローンを組めるか",
    publishedAt: "2026-09-08",
    category: "投資・事業用不動産",
    excerpt:
      "海外に住む非居住者（中国・台湾）が日本の収益物件を買うとき、国内金融機関のアパートローン・プロパーローンは、日本国内の住所・永住資格・国内の連帯保証人などを求めることが多く、本人が単独で使える先は限られます。可否は各金融機関の審査次第。このため現金決済が中心になり、海外送金の着金から決済日を逆算する段取りが要点です。融資は各金融機関、送金は取引銀行、源泉・確定申告・納税管理人は税理士、在留資格は行政書士に振り分けます。東京都文京区の宅地建物取引士兼行政書士が、購入時の融資と現金決済の実務を条文と公的資料から整理します。",
    keywords: [
      "非居住者 日本 収益物件 ローン",
      "外国人 アパートローン 非居住者 融資",
      "非居住者 不動産 現金決済 海外送金",
      "非居住者 不動産取得 外為法 報告 20日",
      "非居住者 不動産 譲渡 源泉徴収 10.21%",
    ],
    tags: ["投資・事業用不動産", "非居住者", "融資", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "47-eigyo-souko-touroku-bukken-youken.md",
    slug: "eigyo-souko-touroku-bukken-youken",
    title: "営業倉庫にできる物件の条件は？倉庫業登録の施設基準から逆算する",
    publishedAt: "2026-09-09",
    category: "投資・事業用不動産",
    excerpt:
      "営業倉庫にできる物件は、まず「他人の物品を寄託されて保管する倉庫業か、単に倉庫スペースを貸す不動産賃貸か」で分かれます。倉庫業を営むには国土交通大臣の登録が要り（倉庫業法第3条）、倉庫の施設・設備が種類ごとの基準に適合していることが登録の要件です（第6条第1項第4号、施行規則）。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と国土交通省の資料から整理します。",
    keywords: [
      "営業倉庫 物件 条件",
      "倉庫業登録 施設設備基準",
      "倉庫業法 第3条 第6条",
      "倉庫の種類 一類 冷蔵倉庫",
      "貸倉庫 倉庫業 違い",
    ],
    tags: ["事業用不動産", "許認可", "倉庫業", "用途地域"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "48-souzoku-sanrin-genya-baikyaku-nagare.md",
    slug: "souzoku-sanrin-genya-baikyaku-nagare",
    title: "相続した山林・原野は売れるのか？境界不明と規制の壁をどう越えるか",
    publishedAt: "2026-09-09",
    category: "相続",
    excerpt:
      "相続した山林・原野は売ること自体はできますが、宅地とは違います。詰まる理由は、境界も地番もあいまいで面積が確定しないこと、保安林（森林法第34条）や林地開発の規制、伐採前の市町村長への届出（森林法第10条の8）です。売れないと判断したら相続土地国庫帰属（令和3年法律第25号）を検討する道もあります。東京都文京区の宅地建物取引士兼行政書士が、条文と公的資料から順に整理します。",
    keywords: [
      "相続 山林 原野 売却",
      "森林法 第10条の8 伐採届",
      "保安林 森林法 第34条 都道府県知事 許可",
      "相続土地国庫帰属 山林 要件",
      "山林 境界 未確定 測量 土地家屋調査士",
    ],
    tags: ["相続", "山林", "森林法", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "49-shika-gikoujo-kaisetsu-bukken-youken.md",
    slug: "shika-gikoujo-kaisetsu-bukken-youken",
    title: "歯科技工所を開くには、どんな物件が要る？──用途地域・構造設備基準と保健所への開設届",
    publishedAt: "2026-09-10",
    category: "投資・事業用不動産",
    excerpt:
      "歯科技工所の物件で先に効くのは3点です。①用途地域——歯科技工所は診療所と違い、原動機を使う「作業場（工場）」として建築基準法の用途制限を受けうる。②構造設備基準——歯科技工士法施行規則第13条の2が、十平方メートル以上の面積・適切な照明換気・じんあいや微生物汚染の防止を求める。③開設届——歯科技工士法第21条は開設後10日以内に保健所（都道府県知事等）へ届け出る事後届出。東京都文京区の宅地建物取引士兼行政書士が、契約前に不動産の側から確認できることを条文と保健所の案内から整理します。",
    keywords: [
      "歯科技工所 物件",
      "歯科技工所 開設届 保健所 10日以内",
      "歯科技工士法施行規則 13条の2 構造設備基準",
      "歯科技工所 用途地域 工場 作業場",
      "歯科技工所 換気 防塵 給排水",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "歯科技工"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "50-souzoku-shido-mochibun-ichitei-doro-baikyaku.md",
    slug: "souzoku-shido-mochibun-ichitei-doro-baikyaku",
    title: "相続した『私道の持分（位置指定道路）』は、どう売る？──宅地との一体売却・通行掘削承諾・評価",
    publishedAt: "2026-09-10",
    category: "相続",
    excerpt:
      "相続した私道の持分は、原則として前面の宅地と一体として売ります。持分だけを切り離すと買主の使い道が狭まり価格が下がりやすいからです。売却では、買主が求める通行・掘削の承諾を私道の共有者から取れるか、位置指定道路（建築基準法第42条第1項第5号）か2項道路（同第2項）かで説明が変わること、私道の相続税評価（財産評価基本通達24）は不特定多数が通るか特定の者だけかで扱いが分かれること、を押さえます。東京都文京区の宅地建物取引士兼行政書士が、条文と国の資料から整理します。",
    keywords: [
      "私道 持分 相続 売却",
      "位置指定道路 建築基準法 42条1項5号",
      "2項道路 セットバック 42条2項",
      "私道 通行 掘削 承諾書",
      "私道 評価 財産評価基本通達24 30%",
    ],
    tags: ["相続", "私道", "位置指定道路", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "51-shoukibo-takino-kaigo-bukken-youken.md",
    slug: "shoukibo-takino-kaigo-bukken-youken",
    title: "小規模多機能型居宅介護の物件要件｜宿泊室・登録定員・用途地域の見方",
    publishedAt: "2026-09-11",
    category: "投資・事業用不動産",
    excerpt:
      "小規模多機能型居宅介護（小多機）に転用できる物件は、①宿泊室を確保できるか（定員1人・床面積7.43㎡以上）②登録定員29人以下・通い最大18人・泊まり最大9人という規模を満たせるか③用途地域と用途分類（宿泊機能があるため寄宿舎か児童福祉施設等か・工業専用地域は不可）④宿泊機能がある分の消防用設備（スプリンクラー・自動火災報知）の4点で絞られます。ふつうの介護事業所と違い『泊まり』があることが物件条件を一段厳しくします。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と省令から順に整理します。",
    keywords: [
      "小規模多機能 物件",
      "小多機 宿泊室 7.43平方メートル",
      "小規模多機能 登録定員 29人 通い 泊まり",
      "小多機 用途地域 寄宿舎 児童福祉施設等",
      "小規模多機能 消防 6項ロ スプリンクラー",
    ],
    tags: ["事業用不動産", "許認可", "介護", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "52-souzoku-bessou-resort-mansion-shobun.md",
    slug: "souzoku-bessou-resort-mansion-shobun",
    title: "相続した別荘・リゾートマンションの処分｜買手が付かないときの選択肢",
    publishedAt: "2026-09-11",
    category: "相続",
    excerpt:
      "相続した別荘・リゾートマンションは売れますが、居住用の実家とは事情が違います。詰まるのは、遠方でアクセスが悪く需要が薄い、管理費・修繕積立金が高く滞納が積み上がる、その滞納は買主（特定承継人）が引き継ぐ（区分所有法第8条）、買手が付かず負動産化する、の4点。手段は値付けの見直し・買取・引取業者・管理組合への相談に分かれ、相続放棄や相続土地国庫帰属は建物付きでは使いにくい点も押さえます。東京都文京区の宅地建物取引士兼行政書士が、処分の選択肢を条文と国税庁の資料から整理します。",
    keywords: [
      "相続 別荘 リゾートマンション 処分",
      "リゾートマンション 管理費 滞納 売却",
      "区分所有法 8条 特定承継人 管理費 滞納",
      "リゾート 負動産 引取業者",
      "相続土地国庫帰属 建物 対象外",
    ],
    tags: ["相続", "リゾートマンション", "管理費滞納", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "53-hikyojusha-buyer-torihiki-kakunin-hanshuho.md",
    slug: "hikyojusha-buyer-torihiki-kakunin-hanshuho",
    title: "中国語圏の非居住バイヤーの取引時確認（犯収法）｜宅建業者の本人確認と実質的支配者",
    publishedAt: "2026-09-12",
    category: "投資・事業用不動産",
    excerpt:
      "非居住のバイヤーでも、宅地建物の売買を締結・代理・媒介する宅建業者は犯罪収益移転防止法第4条の取引時確認を省けません。本人特定事項・取引の目的・職業または事業の内容を確かめ、法人が買主なら実質的支配者まで確認し、確認記録・取引記録を7年間保存します。東京都文京区の宅地建物取引士兼行政書士が、宅建業者自身が犯収法で行う取引時確認の実務を条文と国の資料から整理します。",
    keywords: [
      "犯罪収益移転防止法 宅建業者 取引時確認",
      "非居住者 買主 本人確認 パスポート",
      "実質的支配者 議決権 25% 法人買主",
      "疑わしい取引の届出 宅建業者 国土交通大臣",
      "確認記録 取引記録 7年 保存",
    ],
    tags: ["投資・事業用不動産", "非居住者", "犯収法", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "54-tokku-minpaku-bukken-youken-nintei.md",
    slug: "tokku-minpaku-bukken-youken-nintei",
    title: "特区民泊（国家戦略特区・外国人滞在施設経営事業）の物件要件と認定の流れ",
    publishedAt: "2026-09-12",
    category: "投資・事業用不動産",
    excerpt:
      "特区民泊（国家戦略特別区域外国人滞在施設経営事業）に使える物件は、自治体が認める区域・用途地域か、一居室おおむね25㎡以上で台所・浴室・便所・洗面などの設備が整うか、近隣への周知と苦情対応の体制を置けるかの3点でほぼ決まります。滞在は原則2泊3日以上。東京都文京区の宅地建物取引士兼行政書士が、物件の用途地域・居室面積・設備を条文と自治体の資料から整理します。",
    keywords: [
      "特区民泊 物件 要件",
      "国家戦略特別区域法 13条 外国人滞在施設経営事業",
      "特区民泊 居室 床面積 25平方メートル",
      "特区民泊 2泊3日 用途地域 大田区",
      "特区民泊 民泊 旅館業 違い",
    ],
    tags: ["事業用不動産", "許認可", "民泊", "用途地域"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "55-chuko-sha-kobutsusho-tenjijo-hokan-bukken.md",
    slug: "chuko-sha-kobutsusho-tenjijo-hokan-bukken",
    title: "中古車販売店・古物商の展示場と保管場所──賃貸物件を探すときの用途地域と車庫の届出",
    publishedAt: "2026-09-13",
    category: "投資・事業用不動産",
    excerpt:
      "中古車販売や古物商の展示場に使える物件は、まず用途地域で絞られます。物品を売る店舗は建築基準法別表第二の用途制限を受け、第一種低層住居専用地域と工業専用地域では原則建てられません。整備を伴えば自動車修理工場としての作業場床面積制限が別に効きます。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを建築基準法・古物営業法・車庫法の条文から順に整理します。",
    keywords: [
      "中古車販売 物件",
      "古物商 展示場 用途地域",
      "中古車 展示場 建築基準法 別表第二",
      "車庫証明 販売 在庫車",
      "古物商 営業所 賃貸 契約",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "古物営業法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "56-souzoku-sokochi-jinushi-baikyaku.md",
    slug: "souzoku-sokochi-jinushi-baikyaku",
    title: "相続した底地（そこち）を売るには──借地人との関係・地代・売却ルート",
    publishedAt: "2026-09-13",
    category: "相続",
    excerpt:
      "底地（そこち）とは借地権が付いた土地の所有権です。相続で引き継ぐこと自体に借地人の承諾は要りません（民法第896条）。売る相手は主に借地人・第三者で、借地人が買えば借地関係は解消します。価格は地代の水準・残存期間・借地権割合で変わり一律ではありません。東京都文京区の宅地建物取引士兼行政書士が、売る相手・価格の考え方・進める順番を条文と国税庁の資料から整理します。",
    keywords: [
      "底地 相続 売却",
      "底地 借地権 違い",
      "底地 借地人 売る",
      "底地 評価 財産評価基本通達 25",
      "底地 地代 借地権割合",
    ],
    tags: ["相続", "底地", "借地権", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "57-shuro-keizoku-shien-b-bukken-youto-chiiki-shobo.md",
    slug: "shuro-keizoku-shien-b-bukken-youto-chiiki-shobo",
    title: "就労継続支援B型・就労移行の物件、用途地域と面積・消防はどこを見る？",
    publishedAt: "2026-09-15",
    category: "投資・事業用不動産",
    excerpt:
      "就労継続支援B型・就労移行支援の物件で先に効くのは、①用途地域（建築基準法施行令第19条第1項でこれらの事業所は「児童福祉施設等」に含まれ、工業専用地域では建てられず他12地域は原則可）②建築基準法上の用途と用途変更の確認申請（事務所→児童福祉施設等で200㎡超なら必要）③消防（消防法施行令別表第一(6)項ロ・ハで自動火災報知設備・スプリンクラーの要否が変わる）④内装改修とバリアフリー、の4点です。指定基準の充足判定と指定申請は行政書士に振ります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と省令から整理します。",
    keywords: [
      "就労継続支援B型 物件",
      "就労移行支援 物件 用途地域",
      "障害福祉サービス 児童福祉施設等 建築基準法施行令19条",
      "就労継続支援 消防 6項ロ 6項ハ",
      "就労継続支援B型 用途変更 確認申請",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "障害福祉"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "58-souzoku-koujou-souko-dojou-osen-baikyaku.md",
    slug: "souzoku-koujou-souko-dojou-osen-baikyaku",
    title: "相続した工場・倉庫を売る、土壌汚染とアスベストは誰がどこまで調べる？",
    publishedAt: "2026-09-15",
    category: "相続",
    excerpt:
      "相続した工場・倉庫・作業場だった不動産を売るとき、土壌汚染とアスベストは「誰がどこまで調べるか」で段取りが変わります。土壌汚染は有害物質使用特定施設の使用廃止時に土地所有者等へ調査・報告の義務が生じ（土壌汚染対策法第3条）、アスベストは石綿使用調査の記録があるときその内容が重要事項説明の対象になり（宅建業法第35条）、解体・改修では施工者に事前調査結果の報告義務があります（大気汚染防止法・令和4年4月1日〜）。調査は指定調査機関、相続登記は司法書士、譲渡所得税は税理士、紛争は弁護士へ振り分けます。東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "相続 工場 倉庫 土壌汚染 売却",
      "土壌汚染対策法 3条 有害物質使用特定施設 使用廃止",
      "アスベスト 重要事項説明 宅建業法35条 石綿",
      "石綿事前調査結果報告制度 大気汚染防止法 令和4年",
      "工場跡地 売却 土壌汚染 アスベスト 誰が調べる",
    ],
    tags: ["相続", "土壌汚染", "アスベスト", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "59-koshu-yokujo-sauna-bukken-youken.md",
    slug: "koshu-yokujo-sauna-bukken-youken",
    title: "サウナ・銭湯（公衆浴場）を開くための物件要件は？——公衆浴場法と用途地域",
    publishedAt: "2026-09-16",
    category: "投資・事業用不動産",
    excerpt:
      "サウナ・銭湯・スパの物件で最初に効くのは、①用途地域（公衆浴場は個室付浴場業に係るものを除き幅広い用途地域で建てられ、ここは詰まりにくい）②公衆浴場法が求める構造設備の基準（都道府県の条例で定まり自治体で違う）③用途変更の確認申請（公衆浴場は建築基準法の特殊建築物なので当該用途200㎡超では原則必要）④給排水・換気・レジオネラ対策、の4点です。物件選びの本当の関門は用途地域ではなく構造設備と用途変更・消防にあります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と厚生労働省の要領から順に整理します。",
    keywords: [
      "サウナ 物件 公衆浴場法",
      "銭湯 スパ 開業 物件",
      "公衆浴場 用途地域 個室付浴場業",
      "公衆浴場 用途変更 確認申請 特殊建築物",
      "サウナ 消防法施行令 別表第一 9項",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "公衆浴場法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "60-souzoku-tsukigime-coin-parking-tochi-baikyaku.md",
    slug: "souzoku-tsukigime-coin-parking-tochi-baikyaku",
    title: "相続した月極駐車場・コインパーキングの土地は売れる？——契約引継ぎと売却の順序",
    publishedAt: "2026-09-16",
    category: "相続",
    excerpt:
      "相続した稼働中の駐車場は、今の契約が付いたままでも売れます。月極もコインパーキング運営委託も契約上の地位は相続で承継され（民法第896条）、そのまま買主に引き継ぐことも、解約して更地で売ることもできます。月極は建物所有目的でない土地の賃貸借なので借地借家法の保護がなく、貸主からの解約に正当事由は要りません。駐車場用地は原則「自用地」評価で、貸宅地のような借地権割合の控除はありません。東京都文京区の宅地建物取引士兼行政書士が、契約引継ぎと売却の順序を条文と国税庁の資料から整理します。",
    keywords: [
      "相続 駐車場 土地 売却",
      "月極駐車場 借地借家法 適用外 解約",
      "コインパーキング 運営委託 一括借上げ 相続",
      "駐車場 相続税評価 自用地 財産評価基本通達",
      "駐車場 遺産分割前 売却 換価分割",
    ],
    tags: ["相続", "駐車場", "コインパーキング", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "61-trunk-room-bukken-youto-chiiki-youken.md",
    slug: "trunk-room-bukken-youto-chiiki-youken",
    title: "トランクルーム物件はどこに開ける？用途地域と建築基準法の要件",
    publishedAt: "2026-09-17",
    category: "投資・事業用不動産",
    excerpt:
      "トランクルーム（レンタル収納スペース）を開けるかは、まず用途地域で絞られます。建築基準法上は「倉庫」として扱われ、第一種・第二種低層住居専用地域と第一種中高層住居専用地域では原則建てられません。屋外のコンテナ型は、随時かつ任意に移動できないものは建築基準法第2条第1号の建築物に当たり確認申請が要り、既存の店舗・倉庫を転用して用途部分が200㎡を超えれば用途変更の確認申請（第87条）が要ります。収納スペースの賃貸自体は許認可制ではありませんが、可否は用途地域・構造・消防で分かれます。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と国の資料から整理します。",
    keywords: [
      "トランクルーム 物件 用途地域",
      "レンタル収納スペース 倉庫業 登録不要",
      "コンテナ トランクルーム 建築物 建築基準法",
      "用途変更 確認申請 200平方メートル 倉庫",
      "トランクルーム 消防法施行令 別表第一 14項",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "建築基準法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "62-souzoku-chintai-heiyou-jutaku-uru-kasu.md",
    slug: "souzoku-chintai-heiyou-jutaku-uru-kasu",
    title: "相続した賃貸併用住宅は売る・貸す・住むのどれで考える？",
    publishedAt: "2026-09-17",
    category: "相続",
    excerpt:
      "相続した賃貸併用住宅（自宅と賃貸部分が一体の建物）は、売る・貸す・住むのどれもできます。分かれ目は入居者の有無と税の特例の効き方です。入居者がいるまま売るオーナーチェンジでは賃貸人の地位が買主に移り（民法第605条の2）、入居者は借地借家法で守られます。居住用3000万円特別控除（租税特別措置法第35条）は居住用部分のみ、小規模宅地等の特例（第69条の4）は居住用と賃貸で枠が別。譲渡所得税・特例は税理士、相続登記は司法書士、入居者との紛争は弁護士に振ります。東京都文京区の宅地建物取引士兼行政書士が条文と国税庁の資料から整理します。",
    keywords: [
      "賃貸併用住宅 相続 売る 貸す",
      "オーナーチェンジ 売却 賃貸人たる地位 民法605条の2",
      "居住用 3000万円特別控除 併用住宅 租税特別措置法35条",
      "小規模宅地等の特例 区分登記 賃貸併用",
      "借地借家法 26条 28条 正当事由 立退料",
    ],
    tags: ["相続", "賃貸併用住宅", "オーナーチェンジ", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "63-ryokangyo-hotel-eigyo-bukken-youken.md",
    slug: "ryokangyo-hotel-eigyo-bukken-youken",
    title: "旅館業（ホテル・旅館営業）の許可が取れる物件は、どこで見分けるのか",
    publishedAt: "2026-09-18",
    category: "投資・事業用不動産",
    excerpt:
      "民泊は年180日まで。通年で回せる旅館業（旅館・ホテル営業）の許可が取れる物件かどうかは、契約前の3点でほぼ決まります。①用途地域で「ホテル又は旅館」を建てられる区域か（建築基準法別表第二）②旅館業法施行令の構造設備基準（客室面積・玄関帳場かICT代替）を満たせるか③消防法施行令別表第一(5)項イの防火対象物として自動火災報知設備などを備えられるか。2018年の改正でホテル営業と旅館営業は「旅館・ホテル営業」に統合され、1室から許可を目指せます。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文から整理します。",
    keywords: [
      "旅館業 物件 要件",
      "旅館・ホテル営業 許可 用途地域",
      "旅館業 民泊 違い 通年営業",
      "旅館業法施行令 客室 面積 玄関帳場 ICT",
      "旅館 消防 (5)項イ 自動火災報知設備",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "旅館業法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "64-souzoku-shakuchiken-tatemono-baikyaku-shodaku.md",
    slug: "souzoku-shakuchiken-tatemono-baikyaku-shodaku",
    title: "相続した借地権付き建物を売るには、地主の承諾がどこまで要るのか",
    publishedAt: "2026-09-18",
    category: "相続",
    excerpt:
      "相続した借地権付き建物を第三者に売るには、原則として地主の承諾が要ります（民法第612条第1項）。承諾の見返りに支払う「譲渡承諾料」に法律上の一律基準はなく、地主が承諾しないときは裁判所に承諾に代わる許可を求める借地非訟（借地借家法第19条第1項）という道があります。旧法借地権と定期借地権で売却のしやすさがどう変わるか、売る前に建物の相続登記をどう整えるかまで、東京都文京区の宅地建物取引士兼行政書士が、借地人側の立場から条文で整理します。",
    keywords: [
      "借地権 相続 売却 承諾",
      "譲渡承諾料 相場 名義書換料",
      "借地非訟 承諾に代わる許可 借地借家法19条",
      "定期借地権 事業用定期借地権 売却",
      "旧借地法 借地借家法 更新 違い",
    ],
    tags: ["相続", "借地権", "借地非訟", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "65-chuko-jidosha-kaitai-hasai-bukken-youken.md",
    slug: "chuko-jidosha-kaitai-hasai-bukken-youken",
    title:
      "自動車の解体・破砕業（自動車リサイクル法）の物件・立地要件は？生活環境影響調査と保管設備",
    publishedAt: "2026-09-19",
    category: "投資・事業用不動産",
    excerpt:
      "使用済自動車の解体業には都道府県知事の許可（自動車リサイクル法第60条）、破砕業にも同じく知事の許可（第67条）が要ります。物件で効くのは、用途地域（危険物と騒音振動を伴う工場は工業系に寄る）、施設に係る基準（飛散・流出・地下浸透・騒音を防ぐ設備）、そして破砕機等が廃棄物処理法第15条の産業廃棄物処理施設に当たる場合の生活環境影響調査です。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と公的資料から整理します。",
    keywords: [
      "自動車解体業 物件",
      "自動車リサイクル法 解体業 破砕業 許可",
      "解体業 用途地域 工業地域",
      "破砕業 生活環境影響調査 廃棄物処理法15条",
      "自動車解体 油水分離 施設基準",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "自動車リサイクル法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "66-souzoku-nagaya-renmune-kiribanashi-baikyaku.md",
    slug: "souzoku-nagaya-renmune-kiribanashi-baikyaku",
    title: "相続した長屋・連棟式建物は売れる？切り離し・隣家同意・再建築の実務",
    publishedAt: "2026-09-19",
    category: "相続",
    excerpt:
      "相続した長屋・連棟式（テラスハウス）建物も売れます。ただし単独で建て替えるために切り離すなら、隣接住戸への構造・雨仕舞いの影響があるため実務上は隣家の同意が要り、界壁の所有関係や建築確認の要否を先に調べます。建築基準法は原則として一敷地一建築物を想定し（施行令第1条）、連なった建物には連担建築物設計制度（第86条）という枠もあります。東京都文京区の宅地建物取引士兼行政書士が、売る前に確認できることを条文から整理します。",
    keywords: [
      "長屋 連棟 相続 売却",
      "連棟式建物 切り離し 隣家 同意",
      "長屋 界壁 民法229条 230条",
      "一敷地一建築物 連担建築物設計制度 建築基準法86条",
      "連棟 切り離し 再建築 建築確認",
    ],
    tags: ["相続", "長屋", "連棟式建物", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "67-chuka-pro-shuueki-biru-kensazumisho-dd.md",
    slug: "chuka-pro-shuueki-biru-kensazumisho-dd",
    title:
      "検査済証のない収益ビルの遵法性をどう調べる？海外の不動産プロ向け取得前デューデリ",
    publishedAt: "2026-09-19",
    category: "投資・事業用不動産",
    excerpt:
      "検査済証のない収益ビルでも取引はできますが、遵法性（建築基準法への適合）を取得前に確かめる必要があります。検査済証は完了検査に合格した証（建築基準法第7条）で、無いこと自体が違法を意味するわけではありません。建築時は適法で後の改正で現行規定に合わなくなった既存不適格（第3条第2項）は適法、建築時からの違反建築とは別物です。中国・台湾の不動産プロに向けて、東京都文京区の宅地建物取引士兼行政書士が取得前デューデリの進め方を条文と公的資料から整理します。",
    keywords: [
      "検査済証 ない 収益ビル 取得",
      "既存不適格 違反建築 見分け方 建築基準法3条2項",
      "検査済証のない建築物 法適合状況調査 現況調査ガイドライン",
      "重要事項説明 宅建業法35条 検査済証",
      "中国語圏 不動産 プロ デューデリ 収益物件",
    ],
    tags: ["投資・事業用不動産", "検査済証", "既存不適格", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "68-coin-laundry-bukken-youto-haisui-youken.md",
    slug: "coin-laundry-bukken-youto-haisui-youken",
    title: "コインランドリーを開くのに使える物件の条件は？──用途地域・排水・電気容量とクリーニング業法",
    publishedAt: "2026-09-20",
    category: "投資・事業用不動産",
    excerpt:
      "コインランドリーに使える物件は、まず用途地域で絞られます。無人のコインランドリー（客が自分で洗う・洗濯物の受取や引渡しをしない形態）は、近隣サービス目的なら建築基準法上「サービス業を営む店舗」として扱われるのが一般的ですが、業務用機器の原動機の規模によっては「工場」とみなされ、住居専用地域では建てられないことがあります。物件で詰まるのは用途地域のほか、給排水と電気・ガスの容量、そして乾燥機のリント（糸くず）火災への備えです。無人ランドリー自体はクリーニング業法の規制対象外ですが、取次所を併設すると同法の届出が要ります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文から整理します。",
    keywords: [
      "コインランドリー 物件",
      "コインランドリー 用途地域 サービス業を営む店舗 工場",
      "コインオペレーションクリーニング営業 届出",
      "クリーニング取次所 開設届 クリーニング業法5条",
      "コインランドリー 乾燥機 リント 火災 消防",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "クリーニング業法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "69-souzoku-hatazao-mudouro-tochi-baikyaku-nagare.md",
    slug: "souzoku-hatazao-mudouro-tochi-baikyaku-nagare",
    title: "相続した旗竿地・無道路地はどう売ればいいのか？──接道義務・43条2項認定・評価と売却導線",
    publishedAt: "2026-09-20",
    category: "相続",
    excerpt:
      "相続した旗竿地や無道路地・再建築不可の土地も、売ること自体はできます。ただし建て替えができるかで買い手と価格が大きく変わります。建築基準法第43条第1項は敷地が「道路」に2m以上接することを求め、この道路は第42条が定めるもの（幅員4m以上等）です。接道が足りなくても、第43条第2項の認定（第1号）・許可（第2号）、隣地の買い増し、位置指定道路の新設という道があります。東京都文京区の宅地建物取引士兼行政書士が、査定が下がる理由から売却の順序までを条文と国税庁の資料から整理します。",
    keywords: [
      "旗竿地 無道路地 相続 売却",
      "接道義務 建築基準法 43条 2m",
      "43条2項 認定 許可 建築審査会 平成30年法律67号",
      "位置指定道路 2項道路 セットバック 42条",
      "無道路地 不整形地 評価 財産評価基本通達20-3",
    ],
    tags: ["相続", "旗竿地", "無道路地", "接道義務"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "70-sanpai-tsumikae-hokan-bukken-youken.md",
    slug: "sanpai-tsumikae-hokan-bukken-youken",
    title: "産廃の積替え・保管ができる物件の要件は？用途地域・囲い・飛散防止の確認",
    publishedAt: "2026-09-21",
    category: "投資・事業用不動産",
    excerpt:
      "産業廃棄物の積替え・保管の拠点は、倉庫や資材置場をただ借りれば足りるものではありません。物件で効くのは、①用途地域（上屋を設けるなら建築基準法第48条・別表第二の用途制限を受け、準工業・工業・工業専用が向く）②飛散・流出・地下浸透・悪臭を防ぐ囲いと縦横おおむね60cm以上の掲示板③積替えのための保管上限量（平均搬出量の7日分）と積み上げ高さの制限、の3点です。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを廃棄物処理法・建築基準法の条文と自治体の手引きから整理します。",
    keywords: [
      "産廃 積替え 保管 物件",
      "産業廃棄物 収集運搬 積替え保管 許可",
      "産廃 保管基準 囲い 掲示板 60センチ",
      "積替え保管 上限 平均搬出量 7日分",
      "産廃 積替え保管 用途地域 準工業",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "廃棄物処理法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "71-souzoku-seisan-ryokuchi-baikyaku-nagare.md",
    slug: "souzoku-seisan-ryokuchi-baikyaku-nagare",
    title: "相続した生産緑地は売れる？特定生産緑地・買取申出と売却までの流れ",
    publishedAt: "2026-09-21",
    category: "相続",
    excerpt:
      "相続した生産緑地も売れますが、宅地とは道のりが違います。生産緑地には建築・宅地造成を制限する行為制限がかかり、そのまま宅地として自由には売れません。鍵は、特定生産緑地に移行済みか・30年経過や指定解除で制限が外れているか、市町村長への買取りの申出（生産緑地法第10条）、相続税の納税猶予（租税特別措置法第70条の6）の3点です。東京都文京区の宅地建物取引士兼行政書士が、売却までの流れを条文と国交省・国税庁の資料から整理します。",
    keywords: [
      "生産緑地 相続 売却",
      "特定生産緑地 移行 買取り申出",
      "生産緑地法 10条 30年 買取り",
      "生産緑地 2022年問題 指定解除",
      "農地 相続税 納税猶予 租税特別措置法70条の6",
    ],
    tags: ["相続", "生産緑地", "農地", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "72-chuka-souzokunin-kyoyu-mochibun-baikyaku-jitsumu.md",
    slug: "chuka-souzokunin-kyoyu-mochibun-baikyaku-jitsumu",
    title: "中華圏の相続人が共有する日本の不動産を売るには？持分・委任状・現地公証の実務",
    publishedAt: "2026-09-21",
    category: "相続",
    excerpt:
      "台湾・香港・中国大陸に住む複数の相続人が日本の不動産を共有で相続し売りたいとき、建物・土地をまるごと売るには共有者全員の同意が要ります（民法第251条第1項）。持分だけなら単独で売れますが価格が下がりやすい。海外在住の相続人は印鑑証明に代えて在外公館の署名証明を用い、委任状に現地公証や領事認証を重ねます。非居住者が売主だと源泉徴収10.21％も重なります。東京都文京区の宅地建物取引士兼行政書士が、委任・現地公証・決済と海外送金の段取りを条文と国税庁の資料から整理します。",
    keywords: [
      "海外 相続人 共有 不動産 売却",
      "在外公館 署名証明 サイン証明 委任状",
      "非居住者 不動産 譲渡 源泉徴収 10.21%",
      "共有 全員同意 民法251条 持分売却",
      "相続 準拠法 通則法36条 現地公証 領事認証",
    ],
    tags: ["相続", "共有", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "73-kensetsugyo-shizaioki-shako-chosei-kuiki-bukken.md",
    slug: "kensetsugyo-shizaioki-shako-chosei-kuiki-bukken",
    title: "建設業・運送業の資材置場や車庫は、市街化調整区域や農地で確保できますか",
    publishedAt: "2026-09-22",
    category: "投資・事業用不動産",
    excerpt:
      "建設業・運送業の資材置場や車庫は、①更地に置くだけ（建築物を建てない）か上屋・プレハブ事務所を建てるか②地目が農地か宅地・雑種地か、の2点で手続がまったく変わります。市街化調整区域でも更地の資材置場自体は開発許可の対象外ですが、地目が農地なら農地転用の許可が別に要り、上屋や事務所を建てるなら建築許可が要ります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを都市計画法・農地法・車庫法の条文から整理します。",
    keywords: [
      "資材置場 市街化調整区域 農地",
      "車庫 農地転用 農地法 4条 5条",
      "市街化調整区域 資材置場 開発許可 建築許可",
      "建設業 トラック 車庫証明 保管場所",
      "都市計画法 34条 43条 立地基準",
    ],
    tags: ["事業用不動産", "許認可", "市街化調整区域", "農地法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "74-souzoku-teiki-shakuchiken-tatemono-baikyaku.md",
    slug: "souzoku-teiki-shakuchiken-tatemono-baikyaku",
    title: "相続した一般定期借地権付きの建物やマンションは、どう売却しますか",
    publishedAt: "2026-09-22",
    category: "相続",
    excerpt:
      "相続した一般定期借地権付きの建物やマンションも売れます。ただし普通借地権（更新あり）と違い、一般定期借地権（借地借家法第22条）は更新がなく、存続期間が満了すれば原則として建物を取り壊し更地で地主へ返します。そのため残存期間が短いほど買主が付きにくく、価格に響きます。東京都文京区の宅地建物取引士兼行政書士が、普通借地権との違い・残存期間の効き方・地主の承諾・税務の振り分けを条文から整理します。",
    keywords: [
      "一般定期借地権 相続 売却",
      "定期借地権 借地借家法 22条 更新なし",
      "定期借地権 残存期間 価格 住宅ローン",
      "定期借地 更地返還 建物取壊し",
      "普通借地権 定期借地権 違い",
    ],
    tags: ["相続", "定期借地権", "借地権", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "75-kikenbutsu-kyuyu-souko-bukken-shobo-youken.md",
    slug: "kikenbutsu-kyuyu-souko-bukken-shobo-youken",
    title: "危険物を扱う事業用物件（給油取扱所・危険物倉庫）はどんな要件で探せばいいですか？",
    publishedAt: "2026-09-23",
    category: "投資・事業用不動産",
    excerpt:
      "危険物（ガソリン・塗料・溶剤・燃料）を扱う物件は、まず「どれだけの量を扱うか」で規制の強さが変わります。分岐点は指定数量で、指定数量以上の施設は市町村長等の設置許可と完成検査（消防法第11条）、その5分の1以上〜指定数量未満は市町村の火災予防条例による少量危険物の届出で足ります。物件で効くのは用途地域（建築基準法第48条・別表第二と施行令第130条の9）・構造と保安距離・保有空地、そしてガソリンスタンド跡地なら地下タンクと土壌。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と自治体の資料から整理します。",
    keywords: [
      "危険物 物件 給油取扱所",
      "危険物倉庫 用途地域 準工業",
      "指定数量 ガソリン 200リットル",
      "少量危険物 届出 火災予防条例",
      "消防法 設置許可 完成検査 第11条",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "消防法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "76-souzoku-fudosan-kyu-teitoken-massho-baikyaku.md",
    slug: "souzoku-fudosan-kyu-teitoken-massho-baikyaku",
    title: "相続した不動産に古い抵当権が残っているとき、抹消して売るにはどうしますか？",
    publishedAt: "2026-09-23",
    category: "相続",
    excerpt:
      "相続した不動産に古い抵当権が残っていても売れますが、買主・金融機関は担保のない状態での引渡しを求めるため、抹消の段取りが要ります。完済しているのに抵当権が消えないのは、抹消登記を申請しないと登記簿から消えないからです。抹消登記の申請は司法書士（登記は独占業務）で、当社は登記を代理しません。債権者だった会社が消滅・不明のときは休眠担保権の抹消（不動産登記法第70条・第70条の2、令和5年4月1日施行）を供託や30年経過で行います。東京都文京区の宅地建物取引士兼行政書士が、抹消と売却の順番を条文から整理します。",
    keywords: [
      "相続 不動産 抵当権 抹消 売却",
      "抵当権抹消登記 司法書士 登録免許税 1000円",
      "休眠担保権 抹消 不動産登記法 70条",
      "不動産登記法 70条の2 法人 解散 30年",
      "完済 抵当権 消えない 相続",
    ],
    tags: ["相続", "抵当権", "抹消登記", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  // ─── 2026-09-24：売りにくい土地・建物の出口相談（/wakeari）Phase 2 の8本 ───
  // 企画書 v1.0 §3-3 の slug・主語・書かないこと。受け皿は /wakeari 配下（hubLinks）。
  {
    file: "77-kyosho-tochi-15tsubo-uru-ikasu-bunkyo.md",
    slug: "kyosho-tochi-15tsubo-uru-ikasu-bunkyo",
    title: "文京区で15坪前後の狭小地を売るか活かすか。出口4つと買い手の種類は何ですか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "文京区で15坪（約50㎡）前後の狭小地には、①隣地の所有者に売る、②狭小住宅を建てて住む・貸す、③駐車場などで貸す、④媒介で売る（買取をご希望なら買取業者を買主とする媒介）の四つの出口があります。買い手は隣地所有者・狭小住宅の建築会社・実需の個人・駐車場運営会社・買取業者に分かれ、どれに向くかは接道・最低敷地面積（建築基準法第53条の2）・東京都建築安全条例第3条の路地状敷地の規定・防火地域で決まります。建てられるかどうかは建築士と特定行政庁が判断し、当社は役所調査と出口の比較、媒介を行います。",
    keywords: [
      "狭小地 売却 文京区",
      "15坪 土地 売る 活用",
      "狭小地 買い手 隣地 売却",
      "最低敷地面積 建築基準法 53条の2 狭小地",
      "旗竿地 狭小地 出口 相談 文京区",
    ],
    tags: ["狭小地", "旗竿地", "売却", "土地活用"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/kyosho"],
  },
  {
    file: "78-rinchi-baikyaku-kaimashi-nanari-tochi-deguchi.md",
    slug: "rinchi-baikyaku-kaimashi-nanari-tochi-deguchi",
    title: "隣地への売却・隣地の買い増しは、売りにくい土地の出口になりますか？誰が声をかけますか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "再建築不可・狭小地・旗竿地のように単独では買い手が限られる土地も、隣地の所有者から見ると合わせて使える土地になることがあります。隣地へ売る、隣地の一部を買い増して接道（建築基準法第43条第1項）や敷地面積を補うのは、売りにくい土地に共通する出口です。声かけは当社が媒介契約（宅地建物取引業法第34条の2）に基づき取引態様（第34条）を明示して行い、紛争性のある交渉は弁護士へ、境界確定と分筆・合筆（不動産登記法第41条の制限）は土地家屋調査士へ、登記は司法書士へ振り分けます。民法第209条の隣地使用権は売買を求める権利ではありません。",
    keywords: [
      "隣地 売却 声のかけ方",
      "隣地 買い増し 接道 2m 再建築不可",
      "隣地 売る 不動産会社 媒介",
      "合筆 制限 不動産登記法 41条",
      "隣地使用権 民法 209条 売買",
    ],
    tags: ["隣地", "再建築不可", "狭小地", "売却"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari"],
  },
  {
    file: "79-saikenchiku-fuka-43jo-2ko-nintei-kyoka-dare-ga.md",
    slug: "saikenchiku-fuka-43jo-2ko-nintei-kyoka-dare-ga",
    title: "再建築不可の43条2項1号認定・2号許可は、誰が・どこに申請しますか？文京区の窓口と流れ",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "建築基準法第43条第2項には、道路に2m以上接していない敷地でも建築を認める第1号の認定と第2号の許可があります。基準は建築基準法施行規則第10条の3（第1号＝幅員4m以上の農道等に接し延べ面積500㎡以内など、第2号＝周囲に広い空地を有するなど）にあり、申請者は建築主で実務は建築士が進め、申請先は特定行政庁の文京区、第2号の許可には文京区建築審査会（委員5名・原則毎月第4水曜日）の同意が要ります。当社は可否を判断せず、役所調査と出口の比較、媒介を行います。",
    keywords: [
      "43条2項 認定 許可 誰が申請",
      "再建築不可 43条 但し書き 文京区",
      "建築審査会 文京区 43条2項2号",
      "建築基準法施行規則 10条の3 認定 基準",
      "再建築不可 建築士 特定行政庁 相談",
    ],
    tags: ["再建築不可", "43条2項", "建築審査会", "文京区"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/saikenchiku-fuka"],
  },
  {
    file: "80-setback-42jo-2ko-doro-tochi-baikyaku-menseki.md",
    slug: "setback-42jo-2ko-doro-tochi-baikyaku-menseki",
    title: "42条2項道路のセットバックがある土地を売るとき、面積と価格はどう考えますか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "幅員4m未満の道に接する土地の多くは建築基準法第42条第2項の道路に面し、道の中心線から2m（がけ地・川沿いは4m）の線が道路境界線とみなされます。セットバック部分は敷地面積に算入されず（建築基準法施行令第2条第1項第1号）、建築物・擁壁を建てられません（同法第44条第1項）。売るときは登記簿の面積と建築上の敷地面積の違いを前提に価格の根拠を示し（宅地建物取引業法第34条の2第2項）、重要事項として法令上の制限を説明します（第35条第1項第2号）。中心線と後退幅は特定行政庁と土地家屋調査士・建築士が確定し、当社は個別の面積を算定しません。",
    keywords: [
      "セットバック 土地 売却 面積",
      "42条2項道路 セットバック 価格",
      "セットバック部分 敷地面積 算入 容積率",
      "2項道路 重要事項説明 法令上の制限",
      "セットバック 未後退 売却 文京区",
    ],
    tags: ["セットバック", "42条2項道路", "売却", "面積"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/saikenchiku-fuka"],
  },
  {
    file: "81-gake-yoheki-tochi-baikyaku-bunkyo.md",
    slug: "gake-yoheki-tochi-baikyaku-bunkyo",
    title: "文京区のがけ・擁壁のある土地を売るとき、何を確認し、誰が安全性を判断しますか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "坂と高低差の多い文京区で、がけ・擁壁のある土地を売るときは、擁壁の安全性と建て替え時の要否が価格と買い手の範囲を左右します。東京都建築安全条例第6条は高さ2mを超えるがけの下端から高さの2倍以内に建築・造成する場合に高さ2mを超える擁壁を求め、高さ2m超の擁壁は建築基準法第88条第1項・施行令第138条第1項第5号により確認の対象、がけ崩れのおそれがあれば擁壁等の措置が要ります（第19条第4項）。2024年7月31日から文京区全域が盛土規制法の宅地造成等工事規制区域です。安全性は建築士と特定行政庁が判断し、当社は書類の整理・役所調査・重要事項説明・出口の比較を行います。",
    keywords: [
      "擁壁 土地 売却 文京区",
      "がけ条例 東京都建築安全条例 6条 売却",
      "擁壁 検査済証 ない 売れる",
      "盛土規制法 文京区 規制区域 売却",
      "擁壁 安全性 誰が判断 建築士",
    ],
    tags: ["がけ", "擁壁", "盛土規制法", "文京区", "売却"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari"],
  },
  {
    file: "82-shozai-fumei-kyoyusha-mochibun-shutoku-joto.md",
    slug: "shozai-fumei-kyoyusha-mochibun-shutoku-joto",
    title: "所在の分からない共有者がいる土地・家は売れますか？改正民法の持分取得・譲渡の制度",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "共有者の一人の所在が分からない土地・家は、売却に全員の同意が要る（民法第251条第1項）ため、そのままでは売れません。令和3年法律第24号による改正民法（2023年4月1日施行）で、所在等不明共有者の持分を裁判所の決定で取得する制度（第262条の2）と、持分を含めて第三者に譲渡する権限を得る制度（第262条の3）ができ、時価相当額を供託して進めます。相続で共有になった不動産は相続開始から10年を経過していないと使えない場面があります。申立ての代理は弁護士、登記は司法書士が担い、当社は裁判手続を代理せず、売れる形が整った後の査定・媒介と段取りの整理を行います。",
    keywords: [
      "共有者 所在不明 不動産 売却",
      "所在等不明共有者 持分 取得 民法 262条の2",
      "所在等不明共有者 持分 譲渡 262条の3 供託",
      "共有者 行方不明 実家 売れない",
      "相続 10年 共有 持分 裁判",
    ],
    tags: ["共有", "所在不明", "民法改正", "売却"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/kyoyu"],
  },
  {
    file: "83-shakuchiken-sokochi-douji-baikyaku-touka-koukan.md",
    slug: "shakuchiken-sokochi-douji-baikyaku-touka-koukan",
    title: "借地権と底地の同時売却・等価交換は、地主と借地人の両方にとってどんな形ですか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "借地権の譲渡には地主の承諾（民法第612条第1項）が要り、承諾がなければ裁判所の許可（借地借家法第19条第1項）という手続になる一方、底地は借地人がいる限り自由に使えず、単独ではどちらも買い手が限られます。同時売却は地主と借地人がそろって第三者に売り完全所有権として渡して代金を分ける形、等価交換は借地権の一部と底地の一部を交換してそれぞれが完全所有権の土地を持つ形です。代金や交換の割合に決まった相場はなく、当社は媒介として双方の合意を書面にし、交渉の代理人にはなりません。紛争性は弁護士、測量・分筆は土地家屋調査士、登記は司法書士、税務は税理士へ。",
    keywords: [
      "借地権 底地 同時売却",
      "借地権 底地 等価交換 分け方",
      "地主 借地人 一緒に売る 代金 分け方",
      "底地 売却 借地人 承諾 民法 612条",
      "借地権 譲渡 許可 借地借家法 19条",
    ],
    tags: ["借地権", "底地", "同時売却", "等価交換"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/shakuchi-sokochi"],
  },
  {
    file: "84-saikenchiku-fuka-kashite-mochitsuzukeru-reform-hani.md",
    slug: "saikenchiku-fuka-kashite-mochitsuzukeru-reform-hani",
    title: "再建築不可の家を貸して持ち続けるとき、建築確認が要る工事と要らない工事の線はどこですか？",
    publishedAt: "2026-09-24",
    category: "売りにくい土地・建物",
    excerpt:
      "再建築不可の家でも修繕して貸しながら持ち続けられます。接道義務（建築基準法第43条第1項）が効くのは新築・増築・改築・移転（第2条第13号）であり、修繕・模様替は建築に当たらないからです。ただし主要構造部の一種以上の過半を修繕・模様替する大規模の修繕・模様替（第2条第14号・第15号）は、二以上の階数を有するか延べ面積200㎡超の建築物で確認が要ります（第6条第1項第2号）。この線は令和4年法律第69号の改正が2025年4月1日に施行されて引かれ、改正前は木造2階建て住宅の大規模修繕は確認の対象外でした。判断は建築士と特定行政庁が行い、当社は貸す・売る・持つの比較と賃貸・売却の媒介を行います。",
    keywords: [
      "再建築不可 リフォーム どこまで",
      "再建築不可 貸す 修繕 建築確認",
      "大規模の修繕 模様替 建築確認 2階建て 2025年4月",
      "4号特例 縮小 リフォーム 確認申請",
      "再建築不可 定期借家 貸して持つ",
    ],
    tags: ["再建築不可", "リフォーム", "建築確認", "賃貸"],
    locales: ["ja", "zh-tw"],
    localesWithTranslations: ["zh-tw"],
    hubLinks: ["/wakeari/saikenchiku-fuka"],
  },
  {
    file: "85-cleaning-jo-bukken-youken-kyusuisui-shori.md",
    slug: "cleaning-jo-bukken-youken-kyusuisui-shori",
    title: "クリーニング所を開くとき、物件の用途地域と構造設備はどこを確認する？",
    publishedAt: "2026-09-24",
    category: "投資・事業用不動産",
    excerpt:
      "洗濯物を受け取って自分の店で洗う「クリーニング所」に使える物件は、用途地域と構造設備基準で絞られます。業務用の洗たく機を置いて洗う一般のクリーニング所は建築基準法上「原動機を使用する工場」として扱われるのが一般的で、無人コインランドリーや取次所とは用途地域の扱いが違います。開設はクリーニング業法第5条第1項の届出をあらかじめ都道府県知事へ出し、第5条の2の検査・確認を受けてから使えます。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と厚生労働省・東京都の資料から整理します。",
    keywords: [
      "クリーニング所 物件",
      "クリーニング所 用途地域 工場",
      "クリーニング業法 開設届 5条",
      "クリーニング所 構造設備基準 洗場",
      "コインランドリー クリーニング所 違い",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "クリーニング業法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "86-souzoku-fudosan-daisho-bunkatsu-hyoka-baikyaku.md",
    slug: "souzoku-fudosan-daisho-bunkatsu-hyoka-baikyaku",
    title: "相続不動産を売らずに分ける「代償分割」——評価はどう決め、売却は要る？",
    publishedAt: "2026-09-24",
    category: "相続",
    excerpt:
      "一人が相続不動産を引き継ぎ、他の相続人へ代償金を払って分けるのが代償分割です。取得者が代償金を用意できれば売らずに残せ、金額は相続人の合意で決めますが、相続税の課税価格の計算では相続税評価額との調整が要る場面があります（国税庁タックスアンサーNo.4173）。代償金を現金でなく別の不動産で払うと譲渡所得が課税され得る点まで、東京都文京区の宅地建物取引士兼行政書士が、評価の決め方と売却の要否を条文と国税庁の資料から整理します。",
    keywords: [
      "代償分割 不動産 評価",
      "代償分割 換価分割 違い",
      "代償金 相続税 課税価格 調整",
      "代償分割 代償財産 現物 譲渡所得",
      "相続不動産 売らずに 分ける",
    ],
    tags: ["相続", "代償分割", "不動産評価", "譲渡所得"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "87-game-center-fuei-5go-bukken-youto-menseki.md",
    slug: "game-center-fuei-5go-bukken-youto-menseki",
    title: "ゲームセンター・アミューズメント施設の物件はどこまで選べる？（風営法5号）",
    publishedAt: "2026-09-25",
    category: "投資・事業用不動産",
    excerpt:
      "ゲームセンター・アミューズメント施設は風営法第2条第1項第5号の遊技場（5号営業）で、物件を置ける場所は二重に絞られます。①建築基準法の用途地域で遊技場を建てられるか、②風営法第4条第2項にもとづく都道府県条例が定める営業制限地域（保全対象施設からの距離・住居系地域の除外）に触れないか。営業時間の原則深夜0時までの制限や、許可前に賃貸借契約を結ぶリスクの避け方まで、東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文と条例から整理します。",
    keywords: [
      "ゲームセンター 物件 風営法",
      "風営法 5号営業 遊技場 用途地域",
      "ゲームセンター 保全対象施設 距離",
      "風営法 営業時間 午前0時 条例",
      "アミューズメント施設 許可 停止条件 特約",
    ],
    tags: ["事業用不動産", "許認可", "風営法", "用途地域"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "88-souzoku-shiyo-taishaku-tochi-baikyaku-nagare.md",
    slug: "souzoku-shiyo-taishaku-tochi-baikyaku-nagare",
    title: "親族にタダで貸していた「使用貸借」の土地を相続した——売るには何から？",
    publishedAt: "2026-09-25",
    category: "相続",
    excerpt:
      "親が親族・知人にタダで貸していた土地を相続したら、まず「使用貸借（無償）」と「賃貸借（有償）」の違いを押さえます。使用貸借には借地借家法の保護が及ばず、借主の死亡で原則終了します（民法第597条第3項）が、貸主（親）が亡くなっても終了せず相続人が貸主の地位を承継します（第896条）。借主が使い続けたまま売る場合の説明・価格、明け渡しは弁護士の領域であること、相続登記を先に済ませる理由まで、東京都文京区の宅地建物取引士兼行政書士が民法の条文から整理します。",
    keywords: [
      "使用貸借 土地 相続 売却",
      "使用貸借 賃貸借 違い 借地借家法",
      "使用貸借 借主の死亡 民法597条3項",
      "使用貸借 貸主 死亡 相続 896条",
      "使用貸借 土地 明け渡し 弁護士",
    ],
    tags: ["相続", "使用貸借", "借地借家法", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "89-shuzo-craft-beer-jozosho-bukken-youken.md",
    slug: "shuzo-craft-beer-jozosho-bukken-youken",
    title: "クラフトビール醸造所（酒類製造）を開く物件は何を確認すればいいですか？",
    publishedAt: "2026-09-26",
    category: "投資・事業用不動産",
    excerpt:
      "クラフトビール醸造所（酒類製造）の物件で先に効くのは、①用途地域（醸造所は建築基準法別表第二の「工場」で、作業場の床面積と危険性・環境影響で置ける区域が絞られる）②建物側の要件（タンクを載せる床荷重・天井高・電気容量・冷蔵/貯蔵区画）③醸造排水（BODが高く水質汚濁防止法の特定施設＋下水道の規制がかかる）④酒類製造免許の最低製造数量（ビールは年60キロリットル、発泡酒は年6キロリットル）の4点です。免許は所轄税務署（国税庁）の所管で宅建業者・行政書士の業務範囲外。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文から整理します。",
    keywords: [
      "クラフトビール 醸造所 物件",
      "酒類製造免許 最低製造数量 ビール 発泡酒",
      "醸造所 用途地域 工場 建築基準法",
      "醸造排水 BOD 水質汚濁防止法 特定施設",
      "ブルーパブ タップルーム 飲食店営業許可",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "酒税法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "90-souzoku-tochi-tehanasu-kokko-kizoku-baikyaku-hikaku.md",
    slug: "souzoku-tochi-tehanasu-kokko-kizoku-baikyaku-hikaku",
    title: "相続した土地は国庫帰属で手放すのと売るのとどちらが得ですか？",
    publishedAt: "2026-09-26",
    category: "相続",
    excerpt:
      "使い道のない相続した土地を手放すには、国に引き取ってもらう相続土地国庫帰属制度と、市場で売る2つの道があります。国庫帰属は審査手数料が土地一筆あたり1万4000円、承認されると負担金が原則20万円かかる「払って手放す」制度で、市場で売れる土地なら手取りが残ります。まず市場で売れるかを査定で見極め、売れないなら国庫帰属や引き取りを検討する順番が現実的です。東京都文京区の宅地建物取引士兼行政書士が、手放す費用と売る手取りを並べて判断材料を整理します。",
    keywords: [
      "相続 土地 手放す 国庫帰属 売却 比較",
      "相続土地国庫帰属 負担金 20万円 審査手数料",
      "国庫帰属 却下事由 不承認事由 使えない土地",
      "低未利用土地 100万円控除 措置法35条の3",
      "売れない土地 寄付 引き取りサービス",
    ],
    tags: ["相続", "国庫帰属", "売却", "税制特例"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "91-doubutsu-byoin-bukken-youken-kaisetsu-todokede.md",
    slug: "doubutsu-byoin-bukken-youken-kaisetsu-todokede",
    title: "動物病院を開くための物件はどう選ぶ？獣医療法の診療施設と構造の要件",
    publishedAt: "2026-09-27",
    category: "投資・事業用不動産",
    excerpt:
      "動物病院（獣医師が診療を行う診療施設）の物件で先に効くのは、①用途地域で「動物病院」を置けるか（建築基準法上は診療所ではなく店舗に準じて扱われることが多く、住居専用地域では制限を受ける）②獣医療法の構造設備の基準（消毒・逸走防止・伝染性疾患の隔離、手術を行うなら内壁と床の耐水性、調剤を行うなら冷暗貯蔵）を満たせる素地があるか③排水・防音・臭気で近隣とぶつからないか、の3点です。診療施設開設届（獣医療法第3条）は開設後10日以内の事後届出。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文から整理します。",
    keywords: [
      "動物病院 物件",
      "獣医療法 診療施設 開設届",
      "診療施設 構造設備 手術室 耐水",
      "動物病院 用途地域 建築基準法",
      "診療施設開設届 10日以内 都道府県知事",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "獣医療法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "92-souzoku-fudosan-nozei-shikin-baikyaku-schedule.md",
    slug: "souzoku-fudosan-nozei-shikin-baikyaku-schedule",
    title: "相続税の納税資金を不動産の売却でつくるには？10か月の期限から逆算する段取り",
    publishedAt: "2026-09-27",
    category: "相続",
    excerpt:
      "相続した不動産を売って相続税の納税資金をつくるなら、起点は申告・納付の期限＝相続の開始があったことを知った日の翌日から10か月（相続税法第27条・第33条）です。ここから逆算すると売却活動に使える期間は実質半年ほど。段取りは「相続登記→査定・売り出し→売買契約→決済・納税」で、登記は司法書士、税額と特例の判断は税理士、遺産分割の紛争は弁護士へ。相続開始から3年10か月以内の売却なら取得費加算（措置法第39条）で譲渡税を抑えられる余地があり、間に合わないときは延納・物納も。東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "相続税 納税資金 不動産 売却",
      "相続税 申告期限 10か月 相続税法27条",
      "取得費加算 措置法39条 3年10か月",
      "相続税 延納 物納 相続税法38条 41条",
      "小規模宅地等の特例 売却 保有継続",
    ],
    tags: ["相続", "相続税", "売却", "税制特例"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "93-tsusho-kaigo-dayservice-bukken-kinou-kunren-shitsu.md",
    slug: "tsusho-kaigo-dayservice-bukken-kinou-kunren-shitsu",
    title: "通所介護（デイサービス）の物件要件は？機能訓練室・入浴設備・送迎車の駐車場から見る",
    publishedAt: "2026-09-28",
    category: "投資・事業用不動産",
    excerpt:
      "通所介護（デイサービス）の物件で先に効くのは、①用途地域（デイサービスは建築基準法上「児童福祉施設等」に含まれる老人福祉施設として扱われるのが一般的で、工業専用地域を除きおおむね建てられる）②食堂と機能訓練室の合計面積が「3㎡×利用定員」以上とれるか（指定居宅サービス等基準〈平成11年厚生省令第37号〉第95条）③静養室・相談室・事務室、入浴介助をするなら入浴設備④送迎車の駐車と車寄せの動線、の4点です。既存建物を200㎡超で使うなら用途変更の確認申請が要ることもあります。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを条文から整理します。",
    keywords: [
      "通所介護 デイサービス 物件",
      "デイサービス 設備基準 機能訓練室 食堂 3平方メートル",
      "通所介護 用途地域 老人福祉施設 児童福祉施設等",
      "デイサービス 入浴設備 静養室 相談室",
      "デイサービス 送迎車 駐車場 車寄せ",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "介護保険"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "94-kaigai-buyer-it-jusetsu-online-yoken.md",
    slug: "kaigai-buyer-it-jusetsu-online-yoken",
    title: "海外に住む買主へオンラインで重要事項説明（IT重説）はできる？宅建業法上の要件と本人確認",
    publishedAt: "2026-09-28",
    category: "投資・事業用不動産",
    excerpt:
      "海外に住む買主へのオンラインの重要事項説明（IT重説）は、売買でも認められています。国土交通省は不動産の売買取引に係るIT重説を令和3年（2021年）3月30日から本格運用しており、海外在住者も対象です。要件は、宅建士と買主が書類・映像を視認でき双方向でやりとりできる環境、重要事項説明書等の事前送付・受領、宅地建物取引士証の画面上の提示が柱。重要事項説明書（宅建業法第35条）・37条書面は、令和4年5月18日施行の改正で相手方の承諾を得て電子交付できます。東京都文京区の宅地建物取引士兼行政書士が、本人確認と署名証明の段取りまで条文から整理します。",
    keywords: [
      "IT重説 海外 買主 オンライン 重要事項説明",
      "IT重説 売買 令和3年3月30日 本格運用",
      "宅建業法35条 37条 電子交付 令和4年5月18日",
      "海外在住 本人確認 犯収法 非対面",
      "署名証明 サイン証明 在外公館 実印 印鑑証明",
    ],
    tags: ["投資・事業用不動産", "IT重説", "重要事項説明", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "95-josanjo-kaisetsu-bukken-youken-iryoho.md",
    slug: "josanjo-kaisetsu-bukken-youken-iryoho",
    title: "助産所を開くための物件は何を満たせばよいか──医療法の要件（入所9人以下・分べん室・嘱託医師）",
    publishedAt: "2026-09-29",
    category: "投資・事業用不動産",
    excerpt:
      "助産所（分娩・産後ケア）の物件でまず効くのは医療法の3点です。入所は9人まで（妊婦・産婦・じよく婦10人以上の入所施設を有してはならない＝医療法第2条第2項）、分娩を取り扱うなら床面積9平方メートル以上の分べん室と入所室の床面積（一母子6.3平方メートル以上、内法測定＝施行規則第17条）、そして嘱託する産科・産婦人科の医師と緊急時の病院の確保（第19条・施行規則第15条の2）。診療所と違い医師は常駐せず、開設者が助産師なら届出、助産師でない事業者なら許可。東京都文京区の宅地建物取引士兼行政書士が、物件で確認できることを条文から整理します。",
    keywords: [
      "助産所 物件 要件",
      "助産所 開設 届出 許可 医療法",
      "助産所 分べん室 入所室 床面積",
      "助産所 嘱託医師 産科 産婦人科",
      "助産所 入所 9人 10人 医療法2条",
    ],
    tags: ["事業用不動産", "許認可", "医療法", "助産所"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "96-chugokugo-buyer-shinchiku-aota-tetsukekin-hozen.md",
    slug: "chugokugo-buyer-shinchiku-aota-tetsukekin-hozen",
    title: "新築の「青田売り」を買う中国語圏バイヤーが確認する手付金等の保全（宅建業法41条・41条の2）",
    publishedAt: "2026-09-29",
    category: "投資・事業用不動産",
    excerpt:
      "完成前の新築（青田売り）を買うとき、買主が支払う手付金等は宅地建物取引業法の「手付金等の保全措置」で守られます。売主が宅建業者で買主が宅建業者でないとき（第78条第2項）に働き、工事完了前（未完成）は第41条、完了後（完成）は第41条の2が根拠で保全の方法が違います。未完成は銀行等の保証委託・保証保険の2つのみ、完成はこれに指定保管機関の寄託が加わります。保全が要る額の線引きと、契約前に確認すべき書類、登記・税・海外送金の振り分けを、東京都文京区の宅地建物取引士兼行政書士が条文から整理します。",
    keywords: [
      "青田売り 手付金 保全措置",
      "宅建業法 41条 41条の2 手付金等の保全",
      "未完成物件 完成物件 保全 方法 違い",
      "手付金等 保全 5パーセント 10パーセント 1000万円",
      "中国語圏 買主 新築 マンション 非居住者",
    ],
    tags: ["投資・事業用不動産", "手付金等の保全", "重要事項説明", "非居住者", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "97-jidosha-shitei-seibi-minkan-shaken-bukken-setsubi.md",
    slug: "jidosha-shitei-seibi-minkan-shaken-bukken-setsubi",
    title: "民間車検場（指定自動車整備事業）にできる物件は？認証工場との違いと設備・敷地要件",
    publishedAt: "2026-09-30",
    category: "投資・事業用不動産",
    excerpt:
      "民間車検場（指定自動車整備事業、道路運送車両法第94条の2）にできる物件は、①まず認証工場の要件を満たすこと②完成検査場（検査ラインが取れる長さ・天井高）が取れる敷地か③ブレーキテスタ等の検査用機械器具を据えられる床・電源か、の3点で決まります。指定は地方運輸局長が行い、自動車検査員の選任も要ります。認証工場より一段重い要件を、東京都文京区の宅地建物取引士兼行政書士が道路運送車両法・指定自動車整備事業規則・建築基準法の条文から契約前に確認できる形で整理します。",
    keywords: [
      "民間車検場 物件",
      "指定自動車整備事業 第94条の2 指定",
      "指定工場 認証工場 違い",
      "完成検査場 検査ライン 面積 天井高",
      "自動車検査員 保安基準適合証",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "自動車整備"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "98-souzoku-kubun-shoyu-office-tenant-baikyaku.md",
    slug: "souzoku-kubun-shoyu-office-tenant-baikyaku",
    title: "相続した「区分所有オフィス（テナント1室）」を売るには？賃貸借の承継と管理組合の実務",
    publishedAt: "2026-09-30",
    category: "相続",
    excerpt:
      "相続した賃貸中の区分所有オフィス（テナント1室）は、賃貸人たる地位も含めて相続人が当然に承継します（民法第896条）。売るときは買主に賃貸人たる地位が移り、テナントに対抗するには所有権移転登記が要ります（民法第605条の2）。売る前に確認するのは、管理規約で事業用に使えるか・管理費と修繕積立金の滞納がないか・テナント契約の中身の3点。住宅マンションより買主が限られ価格は賃料（利回り）で決まりやすい点まで、東京都文京区の宅地建物取引士兼行政書士が区分所有法・民法・不動産登記法の条文から整理します。",
    keywords: [
      "区分所有 オフィス 相続 売却",
      "賃貸中 テナント 相続 承継",
      "賃貸人たる地位の移転 民法605条の2",
      "区分所有法 管理費 修繕積立金 滞納 承継",
      "相続登記 義務化 2024 オーナーチェンジ",
    ],
    tags: ["相続", "区分所有", "事業用不動産", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "99-kyoshujo-shitei-bukken-course-kyoshitsu-youken.md",
    slug: "kyoshujo-shitei-bukken-course-kyoshitsu-youken",
    title: "指定自動車教習所にできる物件は？コース・技能/学科教室・休憩室の面積と用途地域",
    publishedAt: "2026-10-01",
    category: "投資・事業用不動産",
    excerpt:
      "指定自動車教習所にできる物件は、①用途地域（自動車教習所は第一種住居地域で床面積3,000㎡以下、第二種住居・準住居・近隣商業・商業・準工業・工業・工業専用では制限なしで建てられ、低層・中高層住居専用・田園住居では建てられない。建築基準法別表第二）②コース（走路）の広さ（指定自動車教習所に関する内閣府令で原則8,000㎡以上、専ら大型・普通自動二輪免許を扱う教習所は3,500㎡以上）③学科教室・待合・休憩室・便所がとれる建物か、の3点でおおむね決まります。物件段階で見当はつけられますが、指定の可否の最終確認は都道府県公安委員会です。東京都文京区の宅地建物取引士兼行政書士が道路交通法・建築基準法・内閣府令の条文から整理します。",
    keywords: [
      "指定自動車教習所 物件",
      "自動車教習所 用途地域 建築基準法",
      "指定自動車教習所 コース 面積 8000平方メートル",
      "学科教室 技能教習 休憩室 面積",
      "届出教習所 指定教習所 違い",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "自動車教習所"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "100-souzoku-jikobukken-shinriteki-kashi-kokuchi-baikyaku.md",
    slug: "souzoku-jikobukken-shinriteki-kashi-kokuchi-baikyaku",
    title: "相続した実家が「事故物件」だった——売るときの告知義務と段取りはどうなりますか？",
    publishedAt: "2026-10-01",
    category: "相続",
    excerpt:
      "相続した実家で過去に人が亡くなっていても、売るときに常に告げなければならないわけではありません。国土交通省「宅地建物取引業者による人の死の告知に関するガイドライン」（令和3年10月）は、自然死・日常生活の中での不慮の死は原則として告げなくてよいとし、自殺・他殺等や特殊清掃等が行われた場合を告知の対象とします。賃貸では事案から概ね3年の経過が目安ですが、売買にはこの年数の区切りがありません。買主から問われた場合や社会的影響が大きい場合は期間・死因にかかわらず告げます。告知を怠ると契約不適合責任・損害賠償の問題になり得る点（民法第562条〜第564条・第566条）まで、東京都文京区の宅地建物取引士兼行政書士がガイドラインと条文から整理します。",
    keywords: [
      "事故物件 相続 売却 告知義務",
      "人の死の告知に関するガイドライン 国土交通省",
      "心理的瑕疵 自然死 自殺 特殊清掃",
      "賃貸 概ね3年 売買 告知 期間",
      "契約不適合責任 民法566条 告知書 重要事項説明",
    ],
    tags: ["相続", "事故物件", "心理的瑕疵", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
  {
    file: "101-chuka-shihon-kisei-soukin-nihon-fudosan-kessai.md",
    slug: "chuka-shihon-kisei-soukin-nihon-fudosan-kessai",
    title: "中国本土の資本規制（年5万ドル枠）があるのに、日本の不動産をどう決済するのか",
    publishedAt: "2026-10-02",
    category: "投資・事業用不動産",
    excerpt:
      "中国本土の個人が国外へ送れる外貨は、便利化額度（結售・結購とも1人あたり年間で等値5万米ドル）という狭い枠に収まり、しかもこの枠内の購汇は『境外での不動産購入』という資本項目には使えません。だから日本の不動産決済は、手付・残代金をいつ・どの原資で送れるかを契約前に見極めることが出発点になります。東京都文京区の宅地建物取引士兼行政書士が、中国側の資本規制と日本側の決済スケジュールの両面から、送金可否の見極めと日本側の外為法報告を条文と公的資料から整理します。",
    keywords: [
      "中国 個人 外貨 5万ドル 便利化額度",
      "購汇 境外买房 資本項目 使えない",
      "日本 不動産 決済 手付 残代金 送金",
      "非居住者 不動産取得 外為法 55条の3 20日",
      "台湾 香港 結匯 匯出 額度 違い",
    ],
    tags: ["投資・事業用不動産", "非居住者", "外為法", "中国語圏"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi"],
  },
  {
    file: "102-einou-taiyoko-nochi-ichiji-tenyo-bukken.md",
    slug: "einou-taiyoko-nochi-ichiji-tenyo-bukken",
    title: "営農型太陽光（ソーラーシェアリング）を置ける農地の条件とは",
    publishedAt: "2026-10-02",
    category: "投資・事業用不動産",
    excerpt:
      "営農型太陽光（ソーラーシェアリング）は、農地を宅地などへ全面転用するのではなく、支柱の基礎部分だけを農地法の一時転用許可で使い、下部では営農を続ける仕組みです。だから第一種農地など通常は転用が難しい農地でも、一定の要件を満たせば設置できる余地があります。鍵は、下部農地の収量がおおむね2割以上減らないこと。東京都文京区の宅地建物取引士兼行政書士が、農林水産省のガイドラインと農地法の条文から、一時転用許可の期間（原則3年・最長10年）と営農継続の要件を整理します。",
    keywords: [
      "営農型太陽光 農地 条件",
      "ソーラーシェアリング 一時転用許可 農地法4条 5条",
      "営農型 単収 2割 減少しない 8割",
      "一時転用 3年 10年 更新 認定農業者",
      "第一種農地 農用地区域 営農型 設置",
    ],
    tags: ["投資・事業用不動産", "許認可", "農地", "農地法"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku", "/toushi"],
  },
  {
    file: "103-nihongo-gakko-nintei-kikan-kousha-bukken-youken.md",
    slug: "nihongo-gakko-nintei-kikan-kousha-bukken-youken",
    title: "認定日本語教育機関の校舎物件はどう選ぶ？校地・校舎の面積要件と用途地域",
    publishedAt: "2026-10-03",
    category: "投資・事業用不動産",
    excerpt:
      "2024年4月施行の認定日本語教育機関制度では、校舎は認定基準（令和5年文部科学省令第40号）で面積115㎡以上かつ同時に授業を受ける生徒1人あたり2.3㎡以上が求められ、校地・校舎は原則として設置者が自ら所有し抵当権等の負担がないことが前提です（やむを得ない事情があれば例外あり）。用途地域の制限は建築基準法第48条・別表第二で決まり、各種学校に当たる場合は低層住居専用地域等では建てられません。東京都文京区の宅地建物取引士兼行政書士が、契約前に確認できることを認定基準と建築基準法の条文から整理します。",
    keywords: [
      "日本語学校 校舎 物件",
      "認定日本語教育機関 認定基準 校舎 115平方メートル",
      "日本語学校 用途地域 各種学校 建築基準法48条",
      "校地 校舎 自己所有 賃貸借 認定",
      "日本語教育機関認定法 令和5年法律第41号 施行",
    ],
    tags: ["事業用不動産", "許認可", "用途地域", "日本語学校"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/toushi", "/office"],
  },
  {
    file: "104-souzoku-tower-mansion-reiwa6-hyoka-baikyaku.md",
    slug: "souzoku-tower-mansion-reiwa6-hyoka-baikyaku",
    title: "相続したタワーマンションを売るなら？令和6年の居住用区分所有財産の新評価と売却の段取り",
    publishedAt: "2026-10-03",
    category: "相続",
    excerpt:
      "令和6年（2024年）1月1日以後に相続・遺贈・贈与で取得した居住用のタワーマンション等は、国税庁の通達「居住用の区分所有財産の評価について」（令和5年9月28日付）により相続税評価の計算が変わりました。市場価格と評価額の開きが大きい住戸は、評価額が市場価格のおおむね6割水準まで引き上げられます。ただしこれは相続税評価の枠組みの話で、実際に売れる価格とは別物です。東京都文京区の宅地建物取引士兼行政書士が、評価通達の要点と、管理費・修繕積立金の精算を含む売却の段取りを整理します。",
    keywords: [
      "タワーマンション 相続 売却",
      "居住用の区分所有財産の評価 通達 令和6年",
      "評価乖離率 評価水準 区分所有補正率",
      "マンション 管理費 修繕積立金 滞納 承継 区分所有法8条",
      "相続登記 義務化 2024 タワマン 売却",
    ],
    tags: ["相続", "タワーマンション", "相続税評価", "売却"],
    locales: ["ja", "en", "zh-tw", "zh"],
    localesWithTranslations: ["en", "zh-tw", "zh"],
    hubLinks: ["/souzoku"],
  },
];

function toPlainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

function parseFaq(content: string, label: string): Faq[] {
  const m = content.match(/## よくある質問\n([\s\S]*?)(?=\n## |$)/);
  if (!m) throw new Error(`${label}: 「## よくある質問」節が見つかりません`);
  const faqs: Faq[] = [];
  const re = /\*\*Q\.\s*([\s\S]*?)\*\*\n(A\.\s*[\s\S]*?)(?=\n\*\*Q\.|\s*$)/g;
  let q: RegExpExecArray | null;
  while ((q = re.exec(m[1])) !== null) {
    faqs.push({
      question: toPlainText(q[1]),
      answer: toPlainText(q[2].replace(/^A\.\s*/, "")),
    });
  }
  if (faqs.length === 0) throw new Error(`${label}: FAQを1件もパースできません`);
  return faqs;
}

function parseFrontmatter(raw: string, label: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${label}: frontmatterが見つかりません`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").trim();
  }
  for (const key of ["title", "excerpt", "category"]) {
    if (!meta[key]) throw new Error(`${label}: frontmatterに ${key} がありません`);
  }
  return { meta, body: m[2].trim() };
}

function readTranslation(spec: ArticleSpec, locale: "zh" | "zh-tw" | "en"): Translation {
  const p = resolve(process.cwd(), "scripts", "realestate-columns", locale, spec.file);
  const { meta, body } = parseFrontmatter(readFileSync(p, "utf-8"), `${locale}/${spec.file}`);
  return { title: meta.title, excerpt: meta.excerpt, category: meta.category, content: body };
}

function buildColumn(spec: ArticleSpec): SeedColumn {
  const jaPath = resolve(process.cwd(), "scripts", "realestate-columns", spec.file);
  const content = readFileSync(jaPath, "utf-8").trim();
  const translations: SeedColumn["translations"] = {};
  if (spec.localesWithTranslations?.includes("en")) translations.en = readTranslation(spec, "en");
  if (spec.localesWithTranslations?.includes("zh-tw")) translations["zh-tw"] = readTranslation(spec, "zh-tw");
  if (spec.localesWithTranslations?.includes("zh")) translations.zh = readTranslation(spec, "zh");
  return {
    business: "realestate",
    slug: spec.slug,
    title: spec.title,
    date: spec.publishedAt,
    category: spec.category,
    excerpt: spec.excerpt,
    content,
    status: "published",
    author: { ...AUTHOR },
    keywords: [...spec.keywords],
    tags: [...spec.tags],
    locales: [...spec.locales],
    faq: parseFaq(content, spec.file),
    translations: Object.keys(translations).length ? translations : undefined,
  };
}

/**
 * 検査は seed-realestate-columns-p6.ts のものを弱めずに引き継いでいる。
 * 追加した点は EXISTING_COLUMN_SLUGS を実行時に集めるようにしたことだけ。
 * ここの NG 判定を外して記事を通さない（記事側を直す）。
 */
function verify(cols: SeedColumn[], specs: ArticleSpec[]): string[] {
  const notes: string[] = [];
  const batchSlugs = new Set(cols.map((c) => c.slug));

  cols.forEach((c, i) => {
    const spec = specs[i];
    if (!c.content.startsWith("**結論（先に要点）**：")) {
      notes.push(`NG: ${spec.slug} が「**結論（先に要点）**：」で始まっていない`);
    }
    if (c.faq.length < 4) notes.push(`WARN: ${spec.slug} のFAQが${c.faq.length}件`);
    if (c.content.length < 1500) notes.push(`WARN: ${spec.slug} の本文が短い（${c.content.length}字）`);
    for (const hub of spec.hubLinks) {
      if (!c.content.includes(`](${hub})`)) notes.push(`NG: ${spec.slug} に ${hub} リンクなし`);
    }
    const links = [...c.content.matchAll(/\]\(\/column\/([a-z0-9-]+)\)/g)].map((x) => x[1]);
    for (const l of links) {
      if (l !== c.slug && !batchSlugs.has(l) && !EXISTING_COLUMN_SLUGS.has(l)) {
        // slug 自体は実在して、ルート接頭辞だけ間違っている場合がある。
        // 落とす条件は変えない。NG文面に直し方を書き足すだけ。
        const other = OTHER_BUSINESS_COLUMN_SLUGS.get(l);
        notes.push(
          other
            ? `NG: ${spec.slug} → 不明slug ${l}` +
                `（${other.label} ${other.prefix}/${l} に実在。ルート接頭辞の誤り。` +
                `リンクを ${other.prefix}/${l} に直す）`
            : `NG: ${spec.slug} → 不明slug ${l}`,
        );
      }
    }
    if (!c.content.includes("## この記事の出典（一次情報）")) notes.push(`NG: ${spec.slug} に出典節なし`);
    if (!c.content.includes("一般的な情報提供")) notes.push(`NG: ${spec.slug} に判断留保なし`);
    // 分離受任の明示（3事業体にまたがるため必須）
    if (!/それぞれ直接ご契約|独立した事業体|別々にご契約/.test(c.content)) {
      notes.push(`NG: ${spec.slug} に分離受任の明示なし`);
    }
    if (!/紹介料/.test(c.content)) notes.push(`NG: ${spec.slug} に紹介料の扱いの記載なし`);
    // 社労士は2026-09-01に開業した。開業**前**は「開業予定」の但し書きを必須にしていたが、
    // 開業後も掛け続けると、事実でない但し書きを本文に強制することになる。SR_LAUNCHED で切る。
    //
    // ★逆向きの検査（本文に「開業予定」「未開業」が残っていたらNG）は、ここに足さないこと。
    //   開業前に書かれた realestate 原稿6本（20/22/23/26/27/28）が「開業予定」を含んでおり、
    //   掃除より先に反転規則を入れると既存記事が一斉にNGになって seed dry-run が落ちる。
    //   順序は ①ここで切る → ②別PRで既存記事から「開業予定」を掃除 → ③そのあと反転規則
    //   （2026-09-01 浦松判断）。
    if (!SR_LAUNCHED && /社会保険労務士/.test(c.content) && !/開業予定/.test(c.content)) {
      notes.push(`NG: ${spec.slug} の社労士表記に「開業予定」の但し書きなし`);
    }
    // 助成金＝社会保険労務士の領域、補助金＝行政書士の領域。**業際の線であって開業の前後で
    // 変わる話ではない**ため、SR_LAUNCHED では切らない（2026-09-01：理由文が「開業前」に
    // なっていたのを業際に直しただけ。判定の挙動は変えていない）。
    if (/助成金/.test(c.content)) notes.push(`NG: ${spec.slug} に「助成金」（社労士の領域＝業際）あり`);

    if (c.translations) {
      for (const loc of ["en", "zh", "zh-tw"] as const) {
        const t = c.translations[loc];
        if (!t) continue;
        if (/\]\(\/(?!\/)/.test(t.content)) notes.push(`NG: ${spec.slug}/${loc} に相対パスの内部リンクあり`);
        if (!t.content.startsWith("**")) notes.push(`WARN: ${spec.slug}/${loc} が直答ブロックで始まっていない`);
      }
      if (c.translations.zh && !c.translations.zh.content.includes("四叶不动产株式会社")) {
        notes.push(`WARN: ${spec.slug}/zh のブランド表記を確認`);
      }
      if (c.translations["zh-tw"] && !c.translations["zh-tw"].content.includes("四葉不動產株式會社")) {
        notes.push(`WARN: ${spec.slug}/zh-tw のブランド表記を確認`);
      }
      if (c.translations.en && !c.translations.en.content.includes("Yotsuba Real Estate Co., Ltd.")) {
        notes.push(`WARN: ${spec.slug}/en のブランド表記を確認`);
      }
    }
  });

  const texts: Array<[string, string]> = [];
  for (const c of cols) {
    texts.push([c.slug, c.content + c.excerpt]);
    if (c.translations) {
      for (const loc of ["en", "zh", "zh-tw"] as const) {
        const t = c.translations[loc];
        if (t) texts.push([`${c.slug}/${loc}`, t.content + t.excerpt]);
      }
    }
  }
  for (const [label, text] of texts) {
    for (const w of FORBIDDEN_WORDS) {
      if (text.toLowerCase().includes(w.toLowerCase())) notes.push(`NG: ${label} に禁止語「${w}」あり`);
    }
  }

  // 追記型なのでバッチ内のslug重複を明示的に見る（同じ記事を2回書いても気づけるように）
  const seen = new Set<string>();
  for (const c of cols) {
    if (seen.has(c.slug)) notes.push(`NG: slug ${c.slug} が ARTICLES に重複している`);
    seen.add(c.slug);
  }

  return notes;
}

const EMIT_HEADER = `// このファイルは自動生成（npx tsx scripts/seed-realestate-columns-daily.ts --emit-ts）。直接編集しない。
// 原稿の正本＝scripts/realestate-columns/NN-<slug>.md（ja）＋{en,zh,zh-tw}/NN-<slug>.md（翻訳）。
// 修正はmd側→再生成で行う。用途＝/admin/columns/seed-realestate-daily からの管理者セッション経由upsert。
// 追記型。記事が増えてもこのファイルと管理画面ページは増やさない（枝番スクリプトを新設しないこと）。

export type RealestateSeedColumnDaily = {
  business: "realestate";
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  status: "published";
  author: { name: string; title: string };
  keywords: string[];
  tags: string[];
  locales: ("ja" | "en" | "zh-tw" | "zh")[];
  faq: { question: string; answer: string }[];
  translations?: {
    en?: { title: string; excerpt: string; content: string; category?: string };
    "zh-tw"?: { title: string; excerpt: string; content: string; category?: string };
    zh?: { title: string; excerpt: string; content: string; category?: string };
  };
};

export const REALESTATE_COLUMNS_DAILY_SEED: RealestateSeedColumnDaily[] = `;

async function main() {
  const emitTs = process.argv.includes("--emit-ts");
  if (process.argv.includes("--write")) {
    console.error("--write は用意していません。本番投入は /admin/columns/seed-realestate-daily を正とします。");
    process.exit(1);
  }

  // ARTICLES が空でも例外を投げない（追記型なので「まだ0本」は正常な状態）。
  const cols = ARTICLES.map(buildColumn);

  // 許可リストは「リポジトリ由来 ∪ 本番sitemap由来」。verify() より前に union する。
  // 管理画面から直接作られた記事はリポジトリに原稿が無く、sitemap でしか実在を確認できない。
  const published = await fetchPublishedColumnSlugs();
  if (published) {
    const before = EXISTING_COLUMN_SLUGS.size;
    EXISTING_COLUMN_SLUGS = new Set([...EXISTING_COLUMN_SLUGS, ...published.realestate]);
    const added = EXISTING_COLUMN_SLUGS.size - before;
    console.log(
      `sitemap: /column/ を ${published.realestate.length} 件検出、` +
        `うち ${added} 件を許可リストに追加（許可リスト合計 ${EXISTING_COLUMN_SLUGS.size} 件）`,
    );
    // 許可リストではない。NG になったときに理由を言い当てるための対応表。
    OTHER_BUSINESS_COLUMN_SLUGS = published.other;
    if (OTHER_BUSINESS_COLUMN_SLUGS.size) {
      console.log(
        `sitemap: 他士業ルートを ${OTHER_BUSINESS_COLUMN_SLUGS.size} 件検出` +
          `（許可リストには入れない。ルート接頭辞の取り違えを指摘するためだけに使う）`,
      );
    }
  }

  const notes = verify(cols, ARTICLES);

  if (emitTs) {
    if (notes.some((n) => n.startsWith("NG"))) {
      console.error(notes.join("\n"));
      console.error("NGがあるため中断します。");
      process.exit(1);
    }
    const out = resolve(process.cwd(), "src/lib/data/realestate-columns-daily-seed.ts");
    writeFileSync(out, EMIT_HEADER + JSON.stringify(cols, null, 2) + ";\n");
    console.log(`emit-ts → ${out}（${cols.length}本）`);
    console.log(notes.length ? notes.join("\n") : "OK: 全チェック通過");
    return;
  }

  const preview = {
    generatedAt: new Date().toISOString(),
    note: "不動産コラム（追記型）。1本追加は ARTICLES に1エントリ追記。投入は /admin/columns/seed-realestate-daily。",
    articleCount: cols.length,
    verification: notes.length ? notes : ["OK: 全チェック通過"],
    articles: cols.map((c) => ({
      slug: c.slug,
      title: c.title,
      date: c.date,
      category: c.category,
      locales: c.locales,
      faq: c.faq.length,
      contentChars: c.content.length,
      translationChars: c.translations
        ? Object.fromEntries(
            Object.entries(c.translations).map(([k, v]) => [k, v ? v.content.length : 0]),
          )
        : undefined,
    })),
  };
  const out = resolve(process.cwd(), "scripts", "realestate-columns-daily.preview.json");
  writeFileSync(out, JSON.stringify(preview, null, 2));
  console.log(`dry-run → ${out}（${cols.length}本）`);
  console.log(preview.verification.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

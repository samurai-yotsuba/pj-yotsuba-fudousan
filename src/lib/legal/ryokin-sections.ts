import { FAMILY_TRUST_COPY, FAMILY_TRUST_PATH } from "./family-trust-copy";

// /legal/ryokin の報酬額データ（2026-09-24 に page.tsx から移設＝テストで全行の訳の網羅と数値の一致を検査するため）。
// 中身・コメントは移設前と同一。金額を変えるときはこのファイルを直す。
// 2026-08-11：行単位の遷移先。設定した行は名称がリンクになる（定点#26・#27）
export type Row = { name: string; unit: string; price: string; jitsuhi?: string; value?: number; href?: string };
export type Section = { title: string; href?: string; rows: Row[]; hasJitsuhi?: boolean; noteKey?: "shogaiNote" | "ikuseishuroNote" };

export const SECTIONS: Section[] = [
  {
    // 2026-07-29 浦松指示：内部呼称の「（主力）」を削除（4言語とも）
    title: "障害福祉サービス",
    href: "/legal/services/shogai-fukushi",
    noteKey: "shogaiNote",
    rows: [
      // 2026-07-29：「開業伴走」は業務の一体提供を示唆する語（yotsuba-sharoushi-kaigyo 第6条）。
      // 受任範囲を示す「事前協議から開業まで」へ置き換えた。
      { name: "指定申請（通所系）フルサポート〔事前協議〜開業まで〕", unit: "一式", price: "605,000円", value: 605000 },
      { name: "指定申請（就労継続支援A型・B型）", unit: "1件", price: "440,000円", value: 440000 },
      { name: "指定申請（共同生活援助・グループホーム）", unit: "1件", price: "418,000円", value: 418000 },
      { name: "指定申請（通所系）スタンダード〔単独・顧問不要〕", unit: "1件", price: "385,000円", value: 385000 },
      { name: "指定申請（通所系）ライト〔書類作成中心〕", unit: "1件", price: "220,000円", value: 220000 },
      { name: "指定申請（訪問系：居宅介護・重度訪問介護）", unit: "1件", price: "198,000円", value: 198000 },
      { name: "運営指導（実地指導）フルサポート", unit: "一式", price: "275,000円", value: 275000 },
      { name: "事業計画書（融資用）", unit: "1件", price: "110,000円", value: 110000 },
      { name: "処遇改善加算 計画書（届出）", unit: "1件", price: "66,000円", value: 66000 },
      { name: "処遇改善加算 実績報告", unit: "1件", price: "55,000円", value: 55000 },
      { name: "指定更新", unit: "1件", price: "66,000円（早期割引対象）", value: 66000 },
      { name: "変更届（軽微〜サビ管変更）", unit: "1件", price: "33,000円〜" },
      // 2026-09-24 浦松指示：内部呼称「松・竹・梅」を公開面から外す（yotsuba-sharoushi-kaigyo 第6条6-5）。英中の訳と同じ呼び方に
      { name: "月額顧問（プレミアム：運営指導同行・優先）", unit: "月額", price: "88,000円", value: 88000 },
      { name: "月額顧問（スタンダード：届出代行込）", unit: "月額", price: "55,000円", value: 55000 },
      { name: "月額顧問（ベーシック：期限管理・相談）", unit: "月額", price: "33,000円", value: 33000 },
    ],
  },
  {
    title: "国際業務（在留資格・帰化・認証／中国語対応）",
    href: "/legal/services/visa",
    hasJitsuhi: true,
    noteKey: "ikuseishuroNote",
    rows: [
      { name: "経営・管理ビザ申請", unit: "1件", price: "別途お見積り", jitsuhi: "—" },
      { name: "永住許可申請", unit: "1件", price: "275,000円〜", jitsuhi: "8,000円" },
      { name: "帰化許可申請", unit: "1件", price: "275,000円〜", jitsuhi: "手数料無料" },
      { name: "在留資格認定（就労ビザ等）", unit: "1件", price: "176,000円〜（着手金50%）", jitsuhi: "—" },
      { name: "在留資格認定（特定技能）", unit: "1件", price: "165,000円〜", jitsuhi: "—" },
      { name: "在留資格変更（特定技能除く）", unit: "1件", price: "121,000円〜", jitsuhi: "—" },
      { name: "配偶者・結婚ビザ（日本人の配偶者等）", unit: "1件", price: "110,000円〜", jitsuhi: "—" },
      { name: "在留期間更新（雇用会社変更なし）", unit: "1件", price: "60,500円", jitsuhi: "4,000円", value: 60500 },
      { name: "　同（雇用会社変更あり）", unit: "1件", price: "99,000円〜", jitsuhi: "—" },
      { name: "在留資格認定（家族滞在）", unit: "1件", price: "55,000円（2人目以降 33,000円/人）", jitsuhi: "—", value: 55000 },
      { name: "就労資格証明書", unit: "1件", price: "66,000円〜", jitsuhi: "—" },
      { name: "アポスティーユ取得代行（1通）", unit: "1件", price: "16,500円", jitsuhi: "外務省手数料無料", value: 16500 },
      { name: "公印確認＋領事認証 取得代行（非ハーグ国向け）", unit: "1件", price: "50,000円", jitsuhi: "認証手数料は国により別途", value: 50000 },
      { name: "資格外活動許可", unit: "1件", price: "16,500円", jitsuhi: "—", value: 16500 },
      { name: "登録支援機関 支援委託", unit: "月額", price: "33,000円/人", jitsuhi: "—", value: 33000 },
      { name: "緊急加算（期限2週間前）／再申請加算", unit: "1件", price: "各44,000円", jitsuhi: "—", value: 44000 },
      // 2026-08-06：受け皿ページを新設したので、料金表からも辿れるようにする（定点#26・#27）
      // 2026-08-11：上の意図に対して href が入っておらず、備考の文言だけで実際のリンクが無かった。
      // GSCのURL検査で当該ページが「URL が Google に認識されていません」＝参照元ページ検出されず、
      // 内部リンクが実質2ページ（/legal/services・/legal/services/visa）しか無いことを実測したため href を補う。
      // 2026-08-12：1行に2業務が混在していた。担当できる事務所も単位も違うため分けた。
      //   ・監理支援機関の許可申請＝行政書士の業務（当事務所のみ）／1件
      //   ・外部監査人＝弁護士・社労士・行政書士のいずれでも就任可／事業所ごとに3か月に1回以上
      // 「予約受付」は入管の受付が始まっているように読めるため外した（受付開始時期は未公表）。
      // どちらの事務所で受けられるか・独立性の制約は ikuseishuroNote（表の下）に書いている。
      //
      // 【2026-08-12 浦松決定・再検討しないこと】
      //   ・金額は2行とも「別途お見積り」のまま。個別に置かない
      //   ・この2行は国際業務セクションに置いたまま。独立したセクションにはしない
      //   ・外部監査人は行政書士側（本ページ）にも載せたままでよい。
      //     /labor/ryokin にも同じ項目があるが、いずれの資格でも就任できるため重複ではない
      //     （育成就労法施行規則＝令和7年法務省・厚生労働省令第4号 第47条第2項第2号）
      { name: "〔2027年4月施行〕監理支援機関 許可申請", unit: "1件", price: "別途お見積り", jitsuhi: "—", href: "/legal/services/ikuseishuro-gaibu-kansa" },
      { name: "〔2027年4月施行〕育成就労 外部監査人 就任・定期監査", unit: "1回", price: "別途お見積り", jitsuhi: "—", href: "/legal/services/ikuseishuro-gaibu-kansa" },
    ],
  },
  {
    title: "会社設立・法人",
    href: "/legal/services/company",
    rows: [
      { name: "医療法人設立", unit: "一式", price: "880,000円〜" },
      { name: "事業協同組合 設立", unit: "一式", price: "770,000円〜" },
      { name: "NPO法人設立（認証〜登記完了）", unit: "一式", price: "275,000円（登記は司法書士）", value: 275000 },
      { name: "会社設立（定款作成等）", unit: "一式", price: "165,000円（定款認証・登免税15万〜・司法書士報酬別途）", value: 165000 },
      { name: "合同会社（LLC）設立", unit: "一式", price: "165,000円（登録免許税60,000円・電子定款で印紙不要）", value: 165000 },
      { name: "一般社団法人設立", unit: "一式", price: "165,000円（認証手数料・登免税・司法書士報酬別途）", value: 165000 },
    ],
  },
  {
    title: "建設業・宅建業",
    rows: [
      { name: "建設業許可（法人・新規）大臣", unit: "1件", price: "220,000円（登録免許税15万円）", value: 220000 },
      { name: "建設業許可（法人・新規）知事", unit: "1件", price: "165,000円（許可手数料9万円）", value: 165000 },
      { name: "建設業許可（個人・新規）知事", unit: "1件", price: "110,000円（許可手数料9万円）", value: 110000 },
      { name: "業種追加", unit: "1件", price: "88,000円（手数料5万円）", value: 88000 },
      { name: "決算変更届（事業年度終了届）", unit: "1件", price: "33,000円", value: 33000 },
      { name: "経営事項審査", unit: "1件", price: "55,000円（分析・評価手数料別途）", value: 55000 },
      { name: "建設業許可（法人・更新）知事", unit: "1件", price: "55,000円（更新手数料5万円）", value: 55000 },
      { name: "入札参加資格審査", unit: "1件", price: "33,000円", value: 33000 },
      { name: "CCUS 事業者登録代行", unit: "1件", price: "41,250円〜（資本金連動）" },
      { name: "宅地建物取引業免許（新規）知事", unit: "1件", price: "165,000円（申請手数料33,000円・保証協会加入金別途）", value: 165000 },
      { name: "宅地建物取引業免許（更新）知事", unit: "1件", price: "55,000円（手数料33,000円）", value: 55000 },
    ],
  },
  {
    title: "許認可（産廃・飲食・古物 等）",
    rows: [
      { name: "産業廃棄物収集運搬業許可（積替保管除く）", unit: "1件", price: "110,000円（手数料81,000円）", value: 110000 },
      { name: "深夜酒類提供飲食店 営業開始届", unit: "1件", price: "110,000円", value: 110000 },
      { name: "飲食店営業許可", unit: "1件", price: "55,000円（保健所手数料 約16,000〜18,300円）", value: 55000 },
      { name: "古物商許可", unit: "1件", price: "55,000円（手数料19,000円）", value: 55000 },
    ],
  },
  {
    title: "相続・遺言・信託",
    href: "/legal/services/inheritance",
    rows: [
      { name: "遺言執行手続", unit: "一式", price: "330,000円〜（遺産額により変動する場合あり）" },
      { name: "遺言書案作成", unit: "1件", price: "165,000円（証人費用・公証人手数料別途）", value: 165000 },
      { name: FAMILY_TRUST_COPY.ja.name, unit: FAMILY_TRUST_COPY.ja.unit, price: FAMILY_TRUST_COPY.ja.price, href: FAMILY_TRUST_PATH },
      { name: "遺産分割協議書の作成", unit: "一式", price: "99,000円〜（遺産総額連動）" },
      { name: "改葬許可申請（墓じまい）", unit: "1件", price: "88,000円〜" },
      { name: "金融機関 解約・名義変更", unit: "1件", price: "55,000円/1行", value: 55000 },
      { name: "戸籍収集（代行）", unit: "1件", price: "33,000円（3名まで／追加1名11,000円）", value: 33000 },
      { name: "相続関係説明図／財産目録", unit: "1件", price: "各33,000円", value: 33000 },
      { name: "法定相続情報一覧図", unit: "1件", price: "22,000円", value: 22000 },
    ],
  },
  {
    title: "その他（契約書・補助金）",
    href: "/legal/services/subsidy",
    rows: [
      { name: "内容証明郵便作成", unit: "1件", price: "33,000円（郵便料別途）", value: 33000 },
      { name: "離婚協議書作成", unit: "1件", price: "50,000円（公正証書は加算・公証人手数料別途）", value: 50000 },
      { name: "補助金申請サポート（相談・申請代行）", unit: "—", price: "相談は無料（初回・2回目以降とも）／申請代行は別途お見積り" },
    ],
  },
];

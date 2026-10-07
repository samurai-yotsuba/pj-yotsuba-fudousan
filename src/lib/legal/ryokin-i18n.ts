import { FAMILY_TRUST_COPY } from "./family-trust-copy";

/**
 * /legal/ryokin（報酬額表）の行ラベル・単位・金額欄の4言語化。2026-09-24。
 *
 * 以前はフェーズI（2026-07-10）の方針で「サービス名・金額は日本語のまま」だったが、
 * 英・中のページで表の中身がすべて日本語になり、全ページ点検（2026-09-24 #2）で翻訳もれとして検出された。
 * 公的手続きの名称が分かるよう、非日本語では訳の下に日本語の原名を小さく併記する（描画側）。
 *
 * ★金額・数値は1つも変えない。テスト（ryokin-i18n.test.ts）が ja と訳の数値の一致を検査する。
 *   ja の「15万」は 150,000、「9万円」は 90,000 として比較する。
 * ★JSON-LD（PriceSpecification の name）は ja 固定のまま（本ファイルは画面表示だけに使う）。
 */
import type { LangCode } from "@/config/languages";

type Tr = { en: string; "zh-tw": string; zh: string };

/** サービス名 */
const NAMES: Record<string, Tr> = {
  "指定申請（通所系）フルサポート〔事前協議〜開業まで〕": { en: "Designation application (day-service type), full support [from prior consultation to opening]", "zh-tw": "指定申請（日間通所類）全程支援〔從事前協議到開業〕", zh: "指定申请（日间通所类）全程支援〔从事前协商到开业〕" },
  "指定申請（就労継続支援A型・B型）": { en: "Designation application (Continuous Employment Support Type A / Type B)", "zh-tw": "指定申請（就勞持續支援A型・B型）", zh: "指定申请（就劳持续支援A型・B型）" },
  "指定申請（共同生活援助・グループホーム）": { en: "Designation application (communal living support / group home)", "zh-tw": "指定申請（共同生活援助・團體家屋）", zh: "指定申请（共同生活援助・集体住宅）" },
  "指定申請（通所系）スタンダード〔単独・顧問不要〕": { en: "Designation application (day-service type), standard [stand-alone, no retainer required]", "zh-tw": "指定申請（日間通所類）標準〔單次委託・無須顧問契約〕", zh: "指定申请（日间通所类）标准〔单次委托・无需顾问合同〕" },
  "指定申請（通所系）ライト〔書類作成中心〕": { en: "Designation application (day-service type), light [mainly document preparation]", "zh-tw": "指定申請（日間通所類）簡易〔以文件製作為主〕", zh: "指定申请（日间通所类）简易〔以文件制作为主〕" },
  "指定申請（訪問系：居宅介護・重度訪問介護）": { en: "Designation application (home-visit type: home care / visiting care for persons with severe disabilities)", "zh-tw": "指定申請（到府類：居家照護・重度到府照護）", zh: "指定申请（上门类：居家照护・重度上门照护）" },
  "運営指導（実地指導）フルサポート": { en: "Administrative guidance (on-site inspection), full support", "zh-tw": "營運指導（實地指導）全程支援", zh: "运营指导（实地指导）全程支援" },
  "事業計画書（融資用）": { en: "Business plan (for loan applications)", "zh-tw": "事業計畫書（融資用）", zh: "事业计划书（融资用）" },
  "処遇改善加算 計画書（届出）": { en: "Treatment-improvement add-on: plan (notification)", "zh-tw": "待遇改善加算　計畫書（申報）", zh: "待遇改善加算　计划书（申报）" },
  "処遇改善加算 実績報告": { en: "Treatment-improvement add-on: performance report", "zh-tw": "待遇改善加算　實績報告", zh: "待遇改善加算　实绩报告" },
  "指定更新": { en: "Designation renewal", "zh-tw": "指定更新", zh: "指定更新" },
  "変更届（軽微〜サビ管変更）": { en: "Change notification (from minor changes to a change of service manager)", "zh-tw": "變更申報（輕微變更至服務管理責任者變更）", zh: "变更申报（轻微变更至服务管理责任者变更）" },
  "月額顧問（プレミアム：運営指導同行・優先）": { en: "Monthly retainer (premium: attendance at administrative guidance, priority handling)", "zh-tw": "月額顧問（高級方案：陪同營運指導・優先處理）", zh: "月额顾问（高级方案：陪同运营指导・优先处理）" },
  "月額顧問（スタンダード：届出代行込）": { en: "Monthly retainer (standard: filing of notifications included)", "zh-tw": "月額顧問（標準方案：含代辦申報）", zh: "月额顾问（标准方案：含代办申报）" },
  "月額顧問（ベーシック：期限管理・相談）": { en: "Monthly retainer (basic: deadline management and consultation)", "zh-tw": "月額顧問（基本方案：期限管理・諮詢）", zh: "月额顾问（基本方案：期限管理・咨询）" },
  "経営・管理ビザ申請": { en: "Business Manager visa application", "zh-tw": "經營・管理簽證申請", zh: "经营・管理签证申请" },
  "永住許可申請": { en: "Permanent residence application", "zh-tw": "永住許可申請", zh: "永住许可申请" },
  "帰化許可申請": { en: "Naturalization application", "zh-tw": "歸化許可申請", zh: "归化许可申请" },
  "在留資格認定（就労ビザ等）": { en: "Certificate of Eligibility (work visas, etc.)", "zh-tw": "在留資格認定（工作簽證等）", zh: "在留资格认定（工作签证等）" },
  "在留資格認定（特定技能）": { en: "Certificate of Eligibility (Specified Skilled Worker)", "zh-tw": "在留資格認定（特定技能）", zh: "在留资格认定（特定技能）" },
  "在留資格変更（特定技能除く）": { en: "Change of status of residence (excluding Specified Skilled Worker)", "zh-tw": "在留資格變更（特定技能除外）", zh: "在留资格变更（特定技能除外）" },
  "配偶者・結婚ビザ（日本人の配偶者等）": { en: "Spouse visa (Spouse or Child of Japanese National)", "zh-tw": "配偶・結婚簽證（日本人之配偶者等）", zh: "配偶・结婚签证（日本人之配偶者等）" },
  "在留期間更新（雇用会社変更なし）": { en: "Extension of period of stay (same employer)", "zh-tw": "在留期間更新（未變更雇用公司）", zh: "在留期间更新（未变更雇用公司）" },
  "　同（雇用会社変更あり）": { en: "　Same (with a change of employer)", "zh-tw": "　同上（已變更雇用公司）", zh: "　同上（已变更雇用公司）" },
  "在留資格認定（家族滞在）": { en: "Certificate of Eligibility (Dependent)", "zh-tw": "在留資格認定（家族滯在）", zh: "在留资格认定（家族滞在）" },
  "就労資格証明書": { en: "Certificate of authorized employment", "zh-tw": "就勞資格證明書", zh: "就劳资格证明书" },
  "アポスティーユ取得代行（1通）": { en: "Obtaining an apostille on your behalf (1 document)", "zh-tw": "代辦取得海牙認證（Apostille，1份）", zh: "代办取得海牙认证（Apostille，1份）" },
  "公印確認＋領事認証 取得代行（非ハーグ国向け）": { en: "Obtaining official-seal certification + consular legalization on your behalf (for non-Hague countries)", "zh-tw": "代辦公印確認＋領事認證（適用於非海牙公約國）", zh: "代办公印确认＋领事认证（适用于非海牙公约国）" },
  "資格外活動許可": { en: "Permission to engage in activity other than that permitted", "zh-tw": "資格外活動許可", zh: "资格外活动许可" },
  "登録支援機関 支援委託": { en: "Support outsourced to a registered support organization", "zh-tw": "登錄支援機關　支援委託", zh: "登录支援机构　支援委托" },
  "緊急加算（期限2週間前）／再申請加算": { en: "Urgent surcharge (2 weeks before the deadline) / re-application surcharge", "zh-tw": "緊急加價（期限前2週內）／重新申請加價", zh: "紧急加价（期限前2周内）／重新申请加价" },
  "〔2027年4月施行〕監理支援機関 許可申請": { en: "[Effective April 2027] Supervising and support organization license application", "zh-tw": "〔2027年4月施行〕監理支援機關　許可申請", zh: "〔2027年4月施行〕监理支援机构　许可申请" },
  "〔2027年4月施行〕育成就労 外部監査人 就任・定期監査": { en: "[Effective April 2027] External auditor under the Employment for Skill Development System: appointment and periodic audits", "zh-tw": "〔2027年4月施行〕育成就勞　外部監查人　就任・定期監查", zh: "〔2027年4月施行〕育成就劳　外部监查人　就任・定期监查" },
  "医療法人設立": { en: "Medical corporation formation", "zh-tw": "醫療法人設立", zh: "医疗法人设立" },
  "事業協同組合 設立": { en: "Business cooperative formation", "zh-tw": "事業協同組合　設立", zh: "事业协同组合　设立" },
  "NPO法人設立（認証〜登記完了）": { en: "NPO corporation formation (from certification to completion of registration)", "zh-tw": "NPO法人設立（從認證到完成登記）", zh: "NPO法人设立（从认证到完成登记）" },
  "会社設立（定款作成等）": { en: "Company formation (articles of incorporation, etc.)", "zh-tw": "公司設立（製作章程等）", zh: "公司设立（制作章程等）" },
  "合同会社（LLC）設立": { en: "Godo kaisha (LLC) formation", "zh-tw": "合同會社（LLC）設立", zh: "合同会社（LLC）设立" },
  "一般社団法人設立": { en: "General incorporated association formation", "zh-tw": "一般社團法人設立", zh: "一般社团法人设立" },
  "建設業許可（法人・新規）大臣": { en: "Construction business license (corporation, new), Minister", "zh-tw": "建設業許可（法人・新申請）大臣", zh: "建设业许可（法人・新申请）大臣" },
  "建設業許可（法人・新規）知事": { en: "Construction business license (corporation, new), Governor", "zh-tw": "建設業許可（法人・新申請）知事", zh: "建设业许可（法人・新申请）知事" },
  "建設業許可（個人・新規）知事": { en: "Construction business license (individual, new), Governor", "zh-tw": "建設業許可（個人・新申請）知事", zh: "建设业许可（个人・新申请）知事" },
  "業種追加": { en: "Adding a type of construction work", "zh-tw": "追加業種", zh: "追加业种" },
  "決算変更届（事業年度終了届）": { en: "Financial statement change notification (end-of-fiscal-year report)", "zh-tw": "決算變更申報（事業年度終了申報）", zh: "决算变更申报（事业年度终了申报）" },
  "経営事項審査": { en: "Management matters review (Keishin)", "zh-tw": "經營事項審查", zh: "经营事项审查" },
  "建設業許可（法人・更新）知事": { en: "Construction business license (corporation, renewal), Governor", "zh-tw": "建設業許可（法人・更新）知事", zh: "建设业许可（法人・更新）知事" },
  "入札参加資格審査": { en: "Qualification review for public tenders", "zh-tw": "投標參加資格審查", zh: "投标参加资格审查" },
  "CCUS 事業者登録代行": { en: "CCUS (Construction Career Up System) business registration on your behalf", "zh-tw": "CCUS（建設職涯提升系統）事業者登錄代辦", zh: "CCUS（建设职业提升系统）事业者登录代办" },
  "宅地建物取引業免許（新規）知事": { en: "Real estate brokerage license (new), Governor", "zh-tw": "宅地建物交易業執照（新申請）知事", zh: "宅地建物交易业执照（新申请）知事" },
  "宅地建物取引業免許（更新）知事": { en: "Real estate brokerage license (renewal), Governor", "zh-tw": "宅地建物交易業執照（更新）知事", zh: "宅地建物交易业执照（更新）知事" },
  "産業廃棄物収集運搬業許可（積替保管除く）": { en: "Industrial waste collection and transport license (excluding transshipment and storage)", "zh-tw": "產業廢棄物收集運搬業許可（轉運保管除外）", zh: "产业废弃物收集运输业许可（转运保管除外）" },
  "深夜酒類提供飲食店 営業開始届": { en: "Notification of opening a late-night bar or restaurant serving alcohol", "zh-tw": "深夜提供酒類飲食店　營業開始申報", zh: "深夜提供酒类饮食店　营业开始申报" },
  "飲食店営業許可": { en: "Restaurant business permit", "zh-tw": "飲食店營業許可", zh: "饮食店营业许可" },
  "古物商許可": { en: "Secondhand dealer license", "zh-tw": "古物商許可", zh: "古物商许可" },
  "遺言執行手続": { en: "Will execution procedures", "zh-tw": "遺囑執行手續", zh: "遗嘱执行手续" },
  "遺言書案作成": { en: "Drafting a will", "zh-tw": "遺囑草案製作", zh: "遗嘱草案制作" },
  "遺産分割協議書の作成": { en: "Estate division agreement drafting", "zh-tw": "遺產分割協議書製作", zh: "遗产分割协议书制作" },
  "改葬許可申請（墓じまい）": { en: "Reburial permit application (closing a family grave)", "zh-tw": "改葬許可申請（遷墓・結束墓地）", zh: "改葬许可申请（迁墓・结束墓地）" },
  "金融機関 解約・名義変更": { en: "Closing accounts / changing account holders at financial institutions", "zh-tw": "金融機構　解約・名義變更", zh: "金融机构　解约・名义变更" },
  "戸籍収集（代行）": { en: "Collecting family registers (on your behalf)", "zh-tw": "戶籍收集（代辦）", zh: "户籍收集（代办）" },
  "相続関係説明図／財産目録": { en: "Inheritance relationship chart / inventory of assets", "zh-tw": "繼承關係說明圖／財產目錄", zh: "继承关系说明图／财产目录" },
  "法定相続情報一覧図": { en: "Statutory inheritance information chart", "zh-tw": "法定繼承資訊一覽圖", zh: "法定继承信息一览图" },
  "内容証明郵便作成": { en: "Drafting content-certified mail", "zh-tw": "存證信函（內容證明郵件）製作", zh: "内容证明邮件制作" },
  "離婚協議書作成": { en: "Divorce agreement drafting", "zh-tw": "離婚協議書製作", zh: "离婚协议书制作" },
  "補助金申請サポート（相談・申請代行）": { en: "Subsidy application support (consultation and application on your behalf)", "zh-tw": "補助金申請支援（諮詢・代辦申請）", zh: "补助金申请支援（咨询・代办申请）" },
};

/** 単位・金額欄・実費欄の文言（金額の型に当てはまらないもの） */
const PHRASES: Record<string, Tr> = {
  "一式": { en: "Package", "zh-tw": "全套", zh: "全套" },
  "1件": { en: "Per case", "zh-tw": "每件", zh: "每件" },
  "月額": { en: "Monthly", "zh-tw": "每月", zh: "每月" },
  "1回": { en: "Per audit", "zh-tw": "每次", zh: "每次" },
  "—": { en: "—", "zh-tw": "—", zh: "—" },
  "別途お見積り": { en: "Quoted individually", "zh-tw": "另行報價", zh: "另行报价" },
  "手数料無料": { en: "No fee", "zh-tw": "免手續費", zh: "免手续费" },
  "外務省手数料無料": { en: "No Ministry of Foreign Affairs fee", "zh-tw": "外務省免手續費", zh: "外务省免手续费" },
  "認証手数料は国により別途": { en: "Legalization fees vary by country and are charged separately", "zh-tw": "認證手續費依國家另計", zh: "认证手续费依国家另计" },
  "相談は無料（初回・2回目以降とも）／申請代行は別途お見積り": {
    en: "Consultation is free (both the first session and the 2nd and later sessions) / application on your behalf is quoted individually",
    "zh-tw": "諮詢免費（首次及第2次以後皆同）／代辦申請另行報價",
    zh: "咨询免费（首次及第2次以后均同）／代办申请另行报价",
  },
  "55,000円（2人目以降 33,000円/人）": { en: "¥55,000 (from the 2nd person: ¥33,000 per person)", "zh-tw": "55,000日圓（第2人起每人33,000日圓）", zh: "55,000日元（第2人起每人33,000日元）" },
  "33,000円/人": { en: "¥33,000 per person", "zh-tw": "每人33,000日圓", zh: "每人33,000日元" },
  "55,000円/1行": { en: "¥55,000 per 1 institution", "zh-tw": "每1家55,000日圓", zh: "每1家55,000日元" },
  "33,000円（3名まで／追加1名11,000円）": { en: "¥33,000 (up to 3 people / ¥11,000 for each additional 1 person)", "zh-tw": "33,000日圓（至3人為止／每追加1人11,000日圓）", zh: "33,000日元（至3人为止／每追加1人11,000日元）" },
};

/** 金額のうしろの括弧書き（備考） */
const NOTES: Record<string, Tr> = {
  "早期割引対象": { en: "early-booking discount available", "zh-tw": "適用提早委託折扣", zh: "适用提早委托折扣" },
  "着手金50%": { en: "50% retainer up front", "zh-tw": "著手金50%", zh: "着手金50%" },
  "登記は司法書士": { en: "registration is handled by a judicial scrivener", "zh-tw": "登記由司法書士辦理", zh: "登记由司法书士办理" },
  "定款認証・登免税15万〜・司法書士報酬別途": {
    en: "articles certification, registration and license tax from ¥150,000 and judicial scrivener fees are extra",
    "zh-tw": "章程認證、登錄免許稅15萬日圓起、司法書士報酬另計",
    zh: "章程认证、登录免许税15万日元起、司法书士报酬另计",
  },
  "登録免許税60,000円・電子定款で印紙不要": {
    en: "registration and license tax ¥60,000; no revenue stamp needed with electronic articles",
    "zh-tw": "登錄免許稅60,000日圓・電子章程免印花",
    zh: "登录免许税60,000日元・电子章程免印花",
  },
  "認証手数料・登免税・司法書士報酬別途": {
    en: "certification fee, registration and license tax and judicial scrivener fees are extra",
    "zh-tw": "認證手續費、登錄免許稅、司法書士報酬另計",
    zh: "认证手续费、登录免许税、司法书士报酬另计",
  },
  "登録免許税15万円": { en: "registration and license tax ¥150,000", "zh-tw": "登錄免許稅15萬日圓", zh: "登录免许税15万日元" },
  "許可手数料9万円": { en: "license fee ¥90,000", "zh-tw": "許可手續費9萬日圓", zh: "许可手续费9万日元" },
  "手数料5万円": { en: "fee ¥50,000", "zh-tw": "手續費5萬日圓", zh: "手续费5万日元" },
  "分析・評価手数料別途": { en: "analysis and evaluation fees are extra", "zh-tw": "分析・評價手續費另計", zh: "分析・评价手续费另计" },
  "更新手数料5万円": { en: "renewal fee ¥50,000", "zh-tw": "更新手續費5萬日圓", zh: "更新手续费5万日元" },
  "資本金連動": { en: "varies with share capital", "zh-tw": "依資本額而定", zh: "依注册资本而定" },
  "申請手数料33,000円・保証協会加入金別途": {
    en: "application fee ¥33,000; guarantee association membership fees are extra",
    "zh-tw": "申請手續費33,000日圓・保證協會入會費另計",
    zh: "申请手续费33,000日元・保证协会入会费另计",
  },
  "手数料33,000円": { en: "fee ¥33,000", "zh-tw": "手續費33,000日圓", zh: "手续费33,000日元" },
  "手数料81,000円": { en: "fee ¥81,000", "zh-tw": "手續費81,000日圓", zh: "手续费81,000日元" },
  "保健所手数料 約16,000〜18,300円": { en: "public health center fee approx. ¥16,000–¥18,300", "zh-tw": "保健所手續費約16,000〜18,300日圓", zh: "保健所手续费约16,000〜18,300日元" },
  "手数料19,000円": { en: "fee ¥19,000", "zh-tw": "手續費19,000日圓", zh: "手续费19,000日元" },
  "遺産額により変動する場合あり": { en: "may vary with the size of the estate", "zh-tw": "可能依遺產額而變動", zh: "可能依遗产额而变动" },
  "証人費用・公証人手数料別途": { en: "witness costs and notary fees are extra", "zh-tw": "證人費用・公證人手續費另計", zh: "证人费用・公证人手续费另计" },
  "遺産総額連動": { en: "varies with the total value of the estate", "zh-tw": "依遺產總額而定", zh: "依遗产总额而定" },
  "郵便料別途": { en: "postage extra", "zh-tw": "郵資另計", zh: "邮资另计" },
  "公正証書は加算・公証人手数料別途": {
    en: "surcharge for a notarial deed; notary fees extra",
    "zh-tw": "製作公證書另加價・公證人手續費另計",
    zh: "制作公证书另加价・公证人手续费另计",
  },
};

type NonJa = Exclude<LangCode, "ja">;

function money(amount: string, loc: NonJa) {
  return loc === "en" ? `¥${amount}` : loc === "zh-tw" ? `${amount}日圓` : `${amount}日元`;
}
function from(amount: string, loc: NonJa) {
  return loc === "en" ? `From ¥${amount}` : `${money(amount, loc)}起`;
}
function each(amount: string, loc: NonJa) {
  return loc === "en" ? `¥${amount} each` : `各${money(amount, loc)}`;
}
function withNote(base: string, note: string, loc: NonJa) {
  const n = NOTES[note]?.[loc];
  if (n === undefined) return null;
  return loc === "en" ? `${base} (${n})` : `${base}（${n}）`;
}

/** 金額欄・実費欄・単位の訳。型に当てはまらず辞書にも無いときは null（テストで検出する） */
export function localizeFeeText(ja: string, locale: LangCode): string | null {
  if (locale === "ja") return ja;
  const loc = locale as NonJa;
  if (ja === FAMILY_TRUST_COPY.ja.price) return FAMILY_TRUST_COPY[locale].price;
  if (ja === FAMILY_TRUST_COPY.ja.unit) return FAMILY_TRUST_COPY[locale].unit;
  if (PHRASES[ja]) return PHRASES[ja][loc];
  let m = ja.match(/^([\d,]+)円$/);
  if (m) return money(m[1], loc);
  m = ja.match(/^([\d,]+)円〜$/);
  if (m) return from(m[1], loc);
  m = ja.match(/^各([\d,]+)円$/);
  if (m) return each(m[1], loc);
  m = ja.match(/^([\d,]+)円（(.+)）$/);
  if (m) return withNote(money(m[1], loc), m[2], loc);
  m = ja.match(/^([\d,]+)円〜（(.+)）$/);
  if (m) return withNote(from(m[1], loc), m[2], loc);
  return null;
}

/** サービス名の訳。辞書に無いときは null */
export function localizeFeeName(ja: string, locale: LangCode): string | null {
  if (locale === "ja") return ja;
  if (ja === FAMILY_TRUST_COPY.ja.name) return FAMILY_TRUST_COPY[locale].name;
  return NAMES[ja]?.[locale as NonJa] ?? null;
}

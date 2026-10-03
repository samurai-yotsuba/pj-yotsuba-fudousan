import type { LangCode } from "@/config/languages";
import { LABOR_PLAN_COPY } from "./plan-copy";
import { LABOR_SETUP_COPY } from "./setup-copy";
import { LABOR_PRICING, formatLaborYen } from "./pricing";

type Copy = {
  hero: string; sub: string; title: string; intro: string;
  home: string; fees: string; pricingHeading: string; faq: string; flow: string; viewPlan: string; consult: string;
  foreignTitle: string; foreignBody: string; foreignLink: string; visaLink: string;
  foreignHighlightTitle: string; foreignHighlightBody: string; visaContractNotice: string;
  industryLabel: string; ghTitle: string; ghBody: string; ghLink: string; ghLegalLink: string;
  qualification: string; chineseTitle: string; chineseBody: string;
  includedTitle: string; included: string[]; excludedTitle: string; excluded: string[];
  recruitmentTitle: string; recruitment: string; recruitmentBoundary: string;
  payrollTitle: string; payroll: string; socialTitle: string; social: string;
  aiTitle: string; ai: string; setupDetail: string;
  steps: { name: string; text: string }[];
  questions: [string, string, string, string, string, string, string, string, string];
  quote: string; units: string; disclaimer: string;
};
export const LABOR_SERVICE_COPY: Record<LangCode, Copy> = {
  ja: {
    pricingHeading: "料金・報酬額表",
    foreignHighlightTitle: "在留資格の基本相談も無料",
    foreignHighlightBody: "顧問契約のお客様は、外国人雇用・在留資格の基本相談が追加料金なし。中国語での基本説明、LINE打刻、入社後の給与・社会保険・労務対応も支援します。",
    visaContractNotice: "申請手続は四葉行政書士事務所が別契約・別料金で対応します。個別申請の精査や書類作成は、受任前に範囲と費用をご案内します。",

    hero: "小さな会社に、人事部を。",
    sub: "freee人事労務とLINE打刻を使い、給与計算・通常手続・日常の労務相談をまとめて担います。",
    title: "小さな会社に、人事部を。｜四葉社会保険労務士事務所",
    intro: "従業員1〜10名程度の小規模会社に向けた、外部人事部サービスです。freee人事労務とLINE打刻を使い、給与計算・通常手続・日常の労務相談をまとめて担います。",
    home: "ホーム", fees: "料金", faq: "よくある質問", flow: "導入と毎月の進め方", viewPlan: "人事部丸投げプランを見る", consult: "無料相談を予約する",
    foreignTitle: "外国人雇用企業の外部人事部として",
    foreignBody: "中国語での基本説明、LINE打刻、入社後の給与・社会保険・日々の労務対応を支援します。代表は申請取次行政書士でもあり、在留資格と雇用条件の整合性を見通してご案内します。在留資格申請は行政書士業務として別契約です。",
    foreignLink: "外国人雇用を相談する", visaLink: "在留資格・申請取次について（行政書士）",
    industryLabel: "外部人事部の支援例・重点業種", ghTitle: "障害福祉・介護・グループホームの外部人事部として",
    ghBody: "シフト、人員配置、処遇改善、日々の労務管理など、障害福祉・介護・グループホームの現場に沿って支援します。月額に含む日常相談・給与計算・通常手続と、就業規則・処遇改善設計等の個別業務を分けてご案内します。",
    ghLink: "障害福祉・GHの人事労務", ghLegalLink: "開設・許認可について（行政書士）",
    qualification: "代表社会保険労務士は、申請取次行政書士でもあります。外国人雇用について、在留資格から入社後の給与・社会保険・労務まで一連の流れを見通してご相談いただけます。",
    chineseTitle: "中国語で直接ご相談いただけます", chineseBody: "経営者との基本相談、給与・社会保険の説明、入社時の基本説明は月額内です。その他の外国語はAI・翻訳支援を活用した基本案内に対応します。専門翻訳・長時間通訳は別料金です。",
    includedTitle: "月額に含まれるもの",
    included: ["freee人事労務の毎月の運用支援（初期導入は別料金）", "freee人事労務スタンダード・LINE打刻・Web給与明細", "毎月の給与計算・給与明細・社会保険料率等の反映", "通常の労務相談・従業員対応相談", "資格取得・資格喪失・被扶養者変更", "月額変更届・賞与支払届・算定基礎届・労働保険年度更新", "外国人雇用・在留資格の基本相談・社保雇保確認・採用後労務", "中国語での基本相談・給与社保説明・入社時基本説明", "求人票・採用条件・給与条件の相談、雇用契約・労働条件通知書のレビュー"],
    excludedTitle: "月額に含まれないもの",
    excluded: ["freee会計・その他のfreee製品", "社会保険新規適用・労働保険成立・雇用保険適用事業所設置・新設法人初期労務", "勤怠集計・打刻修正・打刻漏れ確認・残業集計・有休残数管理", "年末調整・在留資格申請", "本格採用RPO・専門翻訳・長時間通訳", "紛争性案件・大量入退社・過去給与修正"],
    recruitmentTitle: "採用労務サポート", recruitment: "採用計画作成、求人票の新規作成・改稿、採用フロー設計、定期ミーティング、条件設計資料作成を行います。",
    recruitmentBoundary: "月額内は相談・助言・レビュー。作成・運用はオプションです。本格RPOは別見積りとし、対応範囲を事前に確認します。求職者の紹介・あっせんは行いません。",
    payrollTitle: "給与計算を毎月の運用まで", payroll: "従業員がLINE打刻を行い、会社側が確認・修正・確定。freeeの給与計算結果を四葉が確認し、会社側が最終承認します。",
    socialTitle: "通常手続と日常の労務相談", social: "資格取得・喪失、被扶養者変更、月額変更、賞与支払、算定基礎、年度更新を月額に含めます。新規適用は別料金です。",
    aiTitle: "freee・LINEとAIの活用", ai: "freee人事労務とAIを活用して定型確認や情報整理を効率化し、最終的な確認・判断は社会保険労務士が行います。",
    setupDetail: "初期導入は標準導入と運用設計・移行ありの2区分です。作業前に内容を確認し、書面でお見積りします。社会保険等の新規適用申請は初期設定に含まれません。",
    steps: [
      { name: "ご相談", text: "給与計算対象人数、現状の勤怠運用、給与体系、外国人雇用、業種を伺います。" },
      { name: "業務範囲とお見積り", text: "月額・初期導入費・別料金の業務を同時に書面でご案内します。会社側で行う作業も確認します。" },
      { name: "ご契約", text: "含む業務・含まない業務・会社側の責任を明記します。在留資格申請などは資格業務ごとに別契約です。" },
      { name: "初期導入・運用設計", text: "標準導入ではfreee・従業員・通常の手当と通勤費・LINE打刻を設定し、初回給与計算と基本操作説明を行います。移行や複雑な設定がある場合は、事前に書面で合意した範囲で対応します。" },
      { name: "毎月の給与・通常手続", text: "従業員がLINE打刻し、会社側が勤怠を確認・修正・確定。freeeの給与計算内容を四葉が確認します。" },
      { name: "会社側の最終承認・報告", text: "給与計算結果を会社側が最終承認し、確認結果を共有します。人事変更情報は会社側からご提供いただきます。" },
    ],
    questions: ["人事部丸投げプランには何が含まれますか？", "料金は人数によってどう変わりますか？", "初期費用は何にかかりますか？", "勤怠確認や給与の承認も任せられますか？", "freee会計も含まれますか？", "採用はどこまで含まれますか？", "中国語・その他の外国語に対応していますか？", "在留資格申請や年末調整も月額内ですか？", "グループホーム・障害福祉事業者も依頼できますか？"],
    quote: "新規適用、年末調整、本格RPO、賞与3回目以降などの料金・範囲は個別にご案内します。", units: `人数は給与計算対象人数です。1〜10名は人数帯の料金です。10名を超える1名につき月額${formatLaborYen(LABOR_PRICING.additionalRecipientFee, "ja")}（税込）を加算します。`, disclaimer: "本ページは一般的な情報提供です。個別の事案については、資格者による確認を経てご案内します。",
  },
  en: {
    pricingHeading: "Fees and service charges",
    foreignHighlightTitle: "Basic residence status advice at no extra charge",
    foreignHighlightBody: "Clients with an HR retainer can receive basic foreign-employment and residence status advice at no additional charge. Basic explanations in Chinese, LINE clock-in, and payroll, social insurance and labor support after hiring are also included.",
    visaContractNotice: "Applications are handled by 四葉行政書士事務所 under a separate contract with separate fees. We explain the scope and fees for detailed application assessment and document preparation before accepting the engagement.",

    hero: "An HR department for your small business.", sub: "Using freee HR and LINE clock-in, we handle payroll, routine procedures and day-to-day labor advice.",
    title: "HR for small businesses | 四葉社会保険労務士事務所",
    intro: "An external HR service for small businesses with around 1–10 employees. Using freee HR and LINE clock-in, we handle payroll, routine procedures and day-to-day labor advice.",
    home: "Home", fees: "Fees", faq: "Frequently asked questions", flow: "Setup and monthly workflow", viewPlan: "View the HR plan", consult: "Book a free consultation",
    foreignTitle: "An external HR team for employers of foreign nationals", foreignBody: "We support basic explanations in Chinese, LINE clock-in, and payroll, social insurance and everyday labor matters after hiring. Our representative is also an administrative scrivener authorized for immigration application intermediation. Residence status applications require a separate administrative scrivener contract.", foreignLink: "Discuss foreign employment", visaLink: "Residence status applications (administrative scrivener)",
    industryLabel: "Examples of our external HR support and specialist industries", ghTitle: "An external HR team for disability welfare, care and group homes", ghBody: "Support tailored to shifts, staffing, wage improvement and everyday labor management in disability welfare, care and group homes. We distinguish routine advice, payroll and procedures included in the monthly fee from separate work such as employment rules and wage-improvement design.", ghLink: "Disability-welfare and group-home HR", ghLegalLink: "Opening and licensing (administrative scrivener)",
    qualification: "Our representative labor consultant is also an administrative scrivener authorized for immigration application intermediation, helping you consider residence status together with payroll, social insurance and labor matters after hiring.",
    chineseTitle: "Consult directly in Chinese", chineseBody: "Basic management consultations, payroll and social insurance explanations, and onboarding explanations in Chinese are included. Basic guidance in other languages uses AI and translation assistance. Specialist translation and extended interpreting carry separate fees.",
    includedTitle: "Included in the monthly fee", included: ["Ongoing freee HR operation support (initial setup is separately charged)", "freee HR Standard, LINE clock-in and online payslips", "Monthly payroll, payslips and social insurance rate updates", "Routine labor and employee-response consultations", "Insurance enrollment, loss of eligibility and dependent changes", "Monthly remuneration changes, bonus payment reports, annual remuneration assessment and annual labor insurance renewal", "Basic foreign-employment and residence status consultations, insurance checks and post-hire labor matters", "Basic Chinese consultations and payroll, insurance and onboarding explanations", "Advice on job postings, hiring and pay terms; reviews of employment contracts and working-condition notices"],
    excludedTitle: "Excluded from the monthly fee", excluded: ["freee Accounting and other freee products", "Initial social, labor and employment insurance registration and initial labor setup for a new company", "Attendance aggregation, time-entry corrections, missed-entry checks, overtime aggregation and paid-leave balance management", "Year-end tax adjustment and residence status applications", "Full recruitment process outsourcing, specialist translation and extended interpreting", "Disputes, large-scale staff entries/exits and corrections to past payroll"],
    recruitmentTitle: "Recruitment and labor support", recruitment: "Recruitment plans, new or revised job postings, hiring workflow design, regular meetings and employment-terms design documents.", recruitmentBoundary: "The monthly plan covers advice and reviews. Creation and operation are optional services. Full RPO requires a separate quote and advance agreement on scope; job placement or referral is not included.",
    payrollTitle: "A clear monthly payroll workflow", payroll: "Employees clock in through LINE. Your company reviews, corrects and finalizes attendance. We review the payroll calculated in freee, and your company gives final approval.",
    socialTitle: "Routine procedures and day-to-day labor advice", social: "Insurance enrollment and departure, dependent changes, remuneration changes, bonus reports and annual insurance procedures are included. Initial registration is separately charged.",
    aiTitle: "Using freee, LINE and AI", ai: "freee HR and AI help streamline routine checks and information organization. Final professional checks and judgments are made by the labor consultant.", setupDetail: "Initial setup has two options: standard setup, or workflow design and migration. We confirm the scope and provide a written quote before work begins. Initial insurance registration applications are excluded from system setup.",
    steps: [
      {name:"Consultation",text:"We ask about payroll headcount, attendance processes, pay structure, foreign employment and your industry."},
      {name:"Scope and quotation",text:"Monthly fees, initial setup and separate services are quoted together in writing. Your company's responsibilities are also confirmed."},
      {name:"Contract",text:"Included and excluded work and company responsibilities are recorded. Residence status applications require a separate contract for the relevant profession."},
      {name:"Initial setup and workflow design",text:"Standard setup covers freee, employees, usual allowances and commuting expenses, LINE clock-in, the first payroll calculation and basic guidance. Migration and complex configuration follow the scope agreed in writing before work begins."},
      {name:"Monthly payroll and routine procedures",text:"Employees clock in through LINE; your company checks, corrects and finalizes attendance. We review payroll calculated in freee."},
      {name:"Company approval and reporting",text:"Your company gives final approval of payroll results. We share the review results, and your company provides personnel changes."},
    ],
    questions:["What does the HR plan include?","How does the fee change with headcount?","What is the initial setup fee for?","Can you approve attendance and payroll for us?","Is freee Accounting included?","How much recruitment work is included?","Do you support Chinese and other languages?","Are residence applications and year-end tax adjustment included?","Can group homes and disability-welfare providers use the service?"],
    quote: "Fees and scope for initial insurance registration, year-end tax adjustment, full RPO and third or subsequent bonuses are discussed individually.",units: `Headcount means payroll recipients. Bands apply to 1–10 recipients; for 11 or more, add ${formatLaborYen(LABOR_PRICING.additionalRecipientFee, "en")} per month (tax included) for each recipient above 10.`,disclaimer:"This page provides general information. Individual matters are reviewed by a qualified professional.",
  },
  "zh-tw": {
    pricingHeading: "費用・報酬表",
    foreignHighlightTitle: "在留資格基本諮詢也免費",
    foreignHighlightBody: "顧問契約客戶可享外國人雇用與在留資格基本諮詢，不另收費。亦支援中文基本說明、LINE打卡，以及入職後的薪資、社會保險與勞務。",
    visaContractNotice: "申請手續由四葉行政書士事務所另行簽約、另行收費。個別申請的詳細審查與文件製作，會在受任前說明範圍及費用。",

    hero: "讓小公司，也有人事部。",sub: "透過freee人事勞務與LINE打卡，整合支援薪資計算、一般手續與日常勞務諮詢。",title: "小公司的外部人事部｜四葉社会保険労務士事務所",
    intro: "為約1至10名員工的小型公司提供外部人事部服務。透過freee人事勞務與LINE打卡，整合支援薪資計算、一般手續與日常勞務諮詢。",
    home:"首頁",fees:"費用",faq:"常見問題",flow:"導入與每月作業流程",viewPlan:"查看人事部全包方案",consult:"預約免費諮詢",
    foreignTitle: "雇用外國人企業的外部人事部",foreignBody: "支援中文基本說明、LINE打卡，以及入職後的薪資、社會保險與日常勞務。代表亦為可辦理申請取次的行政書士，綜合考量在留資格與雇用條件。在留資格申請以行政書士業務另行簽約。",foreignLink:"諮詢外國人雇用",visaLink:"在留資格・申請取次（行政書士）",
    industryLabel: "外部人事部支援實例・重點業種",ghTitle: "障害福祉、照護與團體家屋的外部人事部",ghBody: "依障害福祉、照護與團體家屋現場的需求，支援排班、人員配置、處遇改善與日常勞務管理。月費包含的日常諮詢、薪資計算與一般手續，與就業規則、處遇改善設計等個別業務，會分別說明。",ghLink:"障害福祉・團體家屋的人事勞務",ghLegalLink:"開設・許可申請（行政書士）",
    qualification:"代表社會保險勞務士亦為可辦理申請取次的行政書士，可從在留資格到入職後的薪資、社會保險與勞務，綜觀流程提供諮詢。",
    chineseTitle:"可直接以中文諮詢",chineseBody:"經營者基本諮詢、薪資與社會保險說明、入職基本說明均包含於月費。其他外語透過AI及翻譯支援提供基本指引。專業翻譯與長時間口譯另行收費。",
    includedTitle:"月費包含的內容",included:["freee人事勞務的每月操作支援（初期導入另行收費）", "freee人事勞務Standard、LINE打卡、網路薪資明細","每月薪資計算、薪資明細、社會保險費率等更新","一般勞務與員工應對諮詢","資格取得、資格喪失、被扶養者變更","月額變更屆、獎金支付屆、算定基礎屆、勞動保險年度更新","外國人雇用與在留資格基本諮詢、社保雇保確認、入職後勞務","中文基本諮詢、薪資社保說明、入職基本說明","職缺、招聘條件、薪資條件的諮詢；雇用契約及勞動條件通知書審閱"],
    excludedTitle:"月費不包含的內容",excluded:["freee會計及其他freee產品","社會保險新規適用、勞動保險成立、雇用保險設置、新設法人初期勞務","出勤彙整、打卡修正、漏打卡確認、加班彙整、有薪假餘額管理","年末調整、在留資格申請","完整招聘RPO、專業翻譯、長時間口譯","爭議案件、大量入離職、過去薪資修正"],
    recruitmentTitle:"招聘勞務支援",recruitment:"招聘計畫、職缺內容新製與改寫、招聘流程設計、定期會議、雇用條件設計資料製作。",recruitmentBoundary:"月費內為諮詢、建議與審閱；製作及營運為加購項目。完整RPO另行報價，事前確認範圍，不包含求職者介紹或仲介。",
    payrollTitle:"明確的每月薪資流程",payroll:"員工以LINE打卡，公司確認、修正並確定出勤。四葉確認freee計算的薪資內容，由公司最終核准。",socialTitle:"一般手續與日常勞務諮詢",social:"資格取得與喪失、被扶養者變更、月額變更、獎金支付、算定基礎、年度更新均包含於月費。新規適用另行收費。",
    aiTitle:"運用freee、LINE與AI",ai:"運用freee人事勞務與AI提高例行確認及資訊整理的效率，最終的專業確認與判斷由社會保險勞務士負責。",setupDetail: "初期導入分為標準導入與流程設計・資料移轉兩種。開始作業前先確認內容並提供書面報價。社會保險等新規適用申請不包含於系統設定。",
    steps:[{name:"諮詢",text:"了解薪資計算人數、出勤運作、薪資制度、外國人雇用與業種。"},{name:"範圍與報價",text:"同時以書面說明月費、初期費用與另計業務，確認公司負責的工作。"},{name:"簽約",text:"明定包含及不包含的工作與公司責任。在留資格申請等依資格業務另行簽約。"},{name:"初期導入與流程設計",text:"標準導入包含freee、員工、一般津貼與通勤費、LINE打卡設定，以及首次薪資計算與基本操作說明。資料移轉與複雜設定依事前書面約定的範圍辦理。"},{name:"每月薪資與一般手續",text:"員工以LINE打卡，公司確認、修正並確定出勤，四葉確認freee的薪資計算內容。"},{name:"公司核准與報告",text:"由公司最終核准薪資結果，分享確認結果，人事異動資訊由公司提供。"}],
    questions:["人事部全包方案包含什麼？","費用如何依人數計算？","初期費用用於哪些工作？","可以代為確定出勤與核准薪資嗎？","freee會計也包含嗎？","招聘支援包含到哪裡？","支援中文及其他外語嗎？","在留資格申請與年末調整也在月費內嗎？","團體家屋與障害福祉業者也能委託嗎？"],
    quote: "新規適用、年末調整、完整RPO、第3次起的獎金等，其費用與範圍個別說明。",units: `人數指薪資計算對象。1至10人按人數區間計費；11人以上，每超過10人的1人，月費加收${formatLaborYen(LABOR_PRICING.additionalRecipientFee, "zh-tw")}（含稅）。`,disclaimer:"本頁提供一般資訊。個別案件須由具資格的專業人士確認。",
  },
  zh: {
    pricingHeading: "费用・报酬表",
    foreignHighlightTitle: "在留资格基本咨询也免费",
    foreignHighlightBody: "顾问合同客户可享外国人雇用与在留资格基本咨询，不另收费。也支持中文基本说明、LINE打卡，以及入职后的工资、社会保险与劳务。",
    visaContractNotice: "申请手续由四葉行政書士事務所另行签约、另行收费。个别申请的详细审查与文件制作，会在受理委托前说明范围及费用。",

    hero: "让小公司，也有人事部。",sub: "通过freee人事劳务与LINE打卡，整合支持工资计算、一般手续与日常劳务咨询。",title: "小公司的外部人事部｜四葉社会保険労務士事務所",
    intro: "为约1至10名员工的小型公司提供外部人事部服务。通过freee人事劳务与LINE打卡，整合支持工资计算、一般手续与日常劳务咨询。",
    home:"首页",fees:"费用",faq:"常见问题",flow:"导入与每月工作流程",viewPlan:"查看人事部全包方案",consult:"预约免费咨询",
    foreignTitle: "雇用外国人企业的外部人事部",foreignBody: "支持中文基本说明、LINE打卡，以及入职后的工资、社会保险与日常劳务。代表亦为可办理申请取次的行政书士，综合考虑在留资格与雇用条件。在留资格申请以行政书士业务另行签约。",foreignLink:"咨询外国人雇用",visaLink:"在留资格・申请取次（行政书士）",
    industryLabel: "外部人事部支持实例・重点行业",ghTitle: "障害福祉、照护与团体家屋的外部人事部",ghBody: "根据障害福祉、照护与团体家屋现场的需求，支持排班、人员配置、处遇改善与日常劳务管理。月费包含的日常咨询、工资计算与一般手续，与就业规则、处遇改善设计等个别业务，会分别说明。",ghLink:"障害福祉・团体家屋的人事劳务",ghLegalLink:"开设・许可申请（行政书士）",
    qualification:"代表社会保险劳务士亦为可办理申请取次的行政书士，可从在留资格到入职后的工资、社会保险与劳务，综观流程提供咨询。",
    chineseTitle:"可直接用中文咨询",chineseBody:"经营者基本咨询、工资与社会保险说明、入职基本说明均包含于月费。其他外语通过AI及翻译支持提供基本指引。专业翻译与长时间口译另行收费。",
    includedTitle:"月费包含的内容",included:["freee人事劳务的每月操作支持（初期导入另行收费）", "freee人事劳务Standard、LINE打卡、网络工资明细","每月工资计算、工资明细、社会保险费率等更新","一般劳务与员工应对咨询","资格取得、资格丧失、被抚养者变更","月额变更届、奖金支付届、算定基础届、劳动保险年度更新","外国人雇用与在留资格基本咨询、社保雇保确认、入职后劳务","中文基本咨询、工资社保说明、入职基本说明","职位、招聘条件、工资条件的咨询；雇用合同及劳动条件通知书审阅"],
    excludedTitle:"月费不包含的内容",excluded:["freee会计及其他freee产品","社会保险新规适用、劳动保险成立、雇用保险设置、新设法人初期劳务","出勤汇总、打卡修正、漏打卡确认、加班汇总、带薪假余额管理","年末调整、在留资格申请","完整招聘RPO、专业翻译、长时间口译","争议案件、大量入离职、过去工资修正"],
    recruitmentTitle:"招聘劳务支持",recruitment:"招聘计划、职位内容新建与改写、招聘流程设计、定期会议、雇用条件设计资料制作。",recruitmentBoundary:"月费内为咨询、建议与审阅；制作及运营为加购项目。完整RPO另行报价，事前确认范围，不包含求职者介绍或中介。",
    payrollTitle:"明确的每月工资流程",payroll:"员工以LINE打卡，公司确认、修正并确定出勤。四叶确认freee计算的工资内容，由公司最终批准。",socialTitle:"一般手续与日常劳务咨询",social:"资格取得与丧失、被抚养者变更、月额变更、奖金支付、算定基础、年度更新均包含于月费。新规适用另行收费。",
    aiTitle:"运用freee、LINE与AI",ai:"运用freee人事劳务与AI提高例行确认及信息整理的效率，最终的专业确认与判断由社会保险劳务士负责。",setupDetail: "初期导入分为标准导入与流程设计・数据迁移两种。开始工作前先确认内容并提供书面报价。社会保险等新规适用申请不包含于系统设置。",
    steps:[{name:"咨询",text:"了解工资计算人数、出勤运作、工资制度、外国人雇用与行业。"},{name:"范围与报价",text:"同时以书面说明月费、初期费用与另计业务，确认公司负责的工作。"},{name:"签约",text:"明确包含及不包含的工作与公司责任。在留资格申请等按资格业务另行签约。"},{name:"初期导入与流程设计",text:"标准导入包含freee、员工、一般津贴与通勤费、LINE打卡设置，以及首次工资计算与基本操作说明。数据迁移与复杂设置按事前书面约定的范围办理。"},{name:"每月工资与一般手续",text:"员工以LINE打卡，公司确认、修正并确定出勤，四叶确认freee的工资计算内容。"},{name:"公司批准与报告",text:"由公司最终批准工资结果，分享确认结果，人事变动信息由公司提供。"}],
    questions:["人事部全包方案包含什么？","费用如何按人数计算？","初期费用用于哪些工作？","可以代为确定出勤与批准工资吗？","freee会计也包含吗？","招聘支持包含到哪里？","支持中文及其他外语吗？","在留资格申请与年末调整也在月费内吗？","团体家屋与障害福祉业者也能委托吗？"],
    quote: "新规适用、年末调整、完整RPO、第3次起的奖金等，其费用与范围个别说明。",units: `人数指工资计算对象。1至10人按人数区间计费；11人以上，每超过10人的1人，月费加收${formatLaborYen(LABOR_PRICING.additionalRecipientFee, "zh")}（含税）。`,disclaimer:"本页提供一般信息。个别案件须由具资格的专业人士确认。",
  },
};

export function getLaborPlanFaqs(locale: LangCode) {
  const c = LABOR_SERVICE_COPY[locale];
  const p = LABOR_PLAN_COPY[locale];
  const money = (amount: number) => formatLaborYen(amount, locale);
  const bands = LABOR_PRICING.bands.map(b => `${b.min}–${b.max}: ${money(b.monthly)}`).join(" / ");
  const setup = LABOR_SETUP_COPY[locale];
  const from = (amount: number) => locale === "en" ? `${p.from}${money(amount)}` : `${money(amount)}${p.from}`;
  const setupAnswer = `${p.setup}: ${setup.standardTitle} ${money(LABOR_PRICING.initialSetupStandard)} (${p.tax}). ${setup.standardWaiverNote} ${setup.standardCondition} ${setup.standardItems.join(" / ")}. ${setup.migrationTitle} ${from(LABOR_PRICING.initialSetupWithMigrationFrom)} (${p.tax}). ${setup.migrationCondition} ${setup.migrationItems.join(" / ")}. ${setup.quoteNote} ${c.setupDetail}`;
  const answers = [
    c.included.join(" / "),
    `${bands} (${p.monthly}, ${p.tax}). ${p.additional(10, money(LABOR_PRICING.additionalRecipientFee))}. ${c.quote}`,
    setupAnswer,
    p.responsibility + " " + c.payroll,
    p.system, c.recruitmentBoundary, c.chineseBody, p.separate, c.ghBody,
  ];
  return c.questions.map((q, i) => ({ q, a: answers[i] }));
}

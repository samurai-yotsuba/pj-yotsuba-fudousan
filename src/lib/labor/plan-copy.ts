import type { LangCode } from "@/config/languages";

export type LaborPlanCopy = {
  name: string;
  responsibility: string;
  monthly: string;
  setup: string;
  tax: string;
  from: string;
  people: string;
  additional: (people: number, fee: string) => string;
  payrollHeadline: (monthlyFee: string) => readonly [string, string];
  payrollEligibility: string;
  payrollIncluded: string;
  lineClockBenefit: string;
  scopeHeadings: readonly [string, string, string];
  scopeRows: readonly (readonly [string, string, string])[];
  system: string;
  separate: string;
};

export const LABOR_PLAN_COPY: Record<LangCode, LaborPlanCopy> = {
  ja: {
    lineClockBenefit: "LINE打刻込みで、毎日の勤怠を手軽に。",
    name: "人事部丸投げプラン（外部人事部サービス）",
    responsibility: "勤怠の確認・確定と給与計算結果の最終承認は会社側",
    monthly: "月額", setup: "初期導入費", tax: "税込", from: "〜",
    people: "給与計算対象人数",
    additional: (people, fee) => `${people}名を超える1名につき月額${fee}を加算`,
    payrollHeadline: (fee) => [`月額${fee}から、`, "給与計算込み"],
    payrollEligibility: "給与計算対象1〜3人・税込",
    payrollIncluded: "通常手続・労務相談・freee人事労務スタンダード・LINE打刻も込み",
    scopeHeadings: ["お任せできる", "会社側で行う", "別料金"],
    scopeRows: [
      ["給与計算", "勤怠の確認・修正・確定", "社会保険新規適用"],
      ["通常の社会保険・雇用保険手続", "給与計算結果の最終承認", "労働保険成立・雇用保険設置"],
      ["日常的な労務相談", "人事変更情報の提供", "在留資格申請"],
      ["採用条件・求人票等の相談・レビュー", "必要な社内承認", "年末調整"],
      ["中国語での基本説明", "—", "本格採用RPO"],
      ["外国人雇用・在留資格の基本相談（顧問契約内・追加料金なし）", "—", "専門翻訳・長時間通訳"],
      ["freee設定・毎月の運用支援（初期導入は別料金）", "—", "—"],
    ],
    system: "月額料金にはfreee人事労務スタンダードの利用料とLINE打刻機能を含みます。freee会計その他のfreee製品は含まれません。",
    separate: "社会保険情報の設定に新規適用申請は含まれません。在留資格申請は行政書士業務として別契約です。年末調整は別料金でお受けし、扶養控除などの税務判断・税務相談は税理士へおつなぎします。",
  },
  en: {
    lineClockBenefit: "Make daily attendance recording easier with included LINE clock-in.",
    name: "Outsourced HR Department Service",
    responsibility: "Your company reviews and finalizes attendance records and gives final approval of payroll results.",
    monthly: "Monthly fee", setup: "Initial setup fee", tax: "tax included", from: "from ",
    people: "Payroll recipients",
    additional: (people, fee) => `Add ${fee} per month for each recipient above ${people}`,
    payrollHeadline: (fee) => [`From ${fee} per month, `, "including payroll"],
    payrollEligibility: "For 1–3 payroll recipients · tax included",
    payrollIncluded: "Routine procedures, labor advice, freee HR Standard and LINE clock-in are also included.",
    scopeHeadings: ["We handle", "Your company handles", "Separate fees"],
    scopeRows: [
      ["Payroll calculation", "Attendance review, corrections and finalization", "Initial social insurance registration"],
      ["Routine social and employment insurance procedures", "Final approval of payroll results", "Establishing labor and employment insurance coverage"],
      ["Day-to-day labor consultations", "Providing personnel change information", "Residence status applications"],
      ["Advice and review of hiring terms and job postings", "Required internal approvals", "Year-end tax adjustment"],
      ["Basic explanations in Chinese", "—", "Full recruitment process outsourcing"],
      ["Basic foreign-employment and residence status advice (included in the HR retainer)", "—", "Specialist translation and extended interpreting"],
      ["freee setup and ongoing operation support (initial setup is separately charged)", "—", "—"],
    ],
    system: "The monthly fee includes freee HR Standard and LINE clock-in. freee Accounting and other freee products are excluded.",
    separate: "Social insurance information setup does not include initial registration applications. Residence status applications require a separate administrative scrivener contract. Year-end tax adjustment is available for a separate fee; tax judgments and tax advice, such as on dependent deductions, are referred to a tax accountant.",
  },
  "zh-tw": {
    lineClockBenefit: "包含LINE打卡，讓每日出勤紀錄更方便。",
    name: "人事部全包方案（外部人事部服務）",
    responsibility: "出勤資料的確認與確定，以及薪資計算結果的最終核准，由公司負責。",
    monthly: "月費", setup: "初期導入費", tax: "含稅", from: "起",
    people: "薪資計算對象人數",
    additional: (people, fee) => `超過${people}人後，每增加1人，月費加收${fee}`,
    payrollHeadline: (fee) => [`每月${fee}起，`, "包含薪資計算"],
    payrollEligibility: "薪資計算對象1至3人・含稅",
    payrollIncluded: "亦包含一般手續、勞務諮詢、freee人事勞務Standard與LINE打卡",
    scopeHeadings: ["可委託的工作", "由公司負責", "另行收費"],
    scopeRows: [
      ["薪資計算", "出勤資料的確認、修正與確定", "社會保險新規適用"],
      ["一般社會保險與雇用保險手續", "薪資計算結果的最終核准", "勞動保險成立與雇用保險設置"],
      ["日常勞務諮詢", "提供人事異動資訊", "在留資格申請"],
      ["招聘條件與職缺內容的諮詢、審閱", "必要的公司內部核准", "年末調整"],
      ["中文基本說明", "—", "完整招聘流程外包（RPO）"],
      ["外國人雇用與在留資格基本諮詢（顧問契約內不另收費）", "—", "專業翻譯與長時間口譯"],
      ["freee設定與每月操作支援（初期導入另行收費）", "—", "—"],
    ],
    system: "月費包含freee人事勞務Standard使用費及LINE打卡功能，不含freee會計或其他freee產品。",
    separate: "社會保險資料設定不包含新規適用申請。在留資格申請以行政書士業務另行簽約；年末調整可另行收費承辦，扶養扣除等稅務判斷與稅務諮詢則為您轉介稅理士。",
  },
  zh: {
    lineClockBenefit: "包含LINE打卡，让每日出勤记录更方便。",
    name: "人事部全包方案（外部人事部服务）",
    responsibility: "出勤资料的确认与确定，以及工资计算结果的最终批准，由公司负责。",
    monthly: "月费", setup: "初期导入费", tax: "含税", from: "起",
    people: "工资计算对象人数",
    additional: (people, fee) => `超过${people}人后，每增加1人，月费加收${fee}`,
    payrollHeadline: (fee) => [`每月${fee}起，`, "包含工资计算"],
    payrollEligibility: "工资计算对象1至3人・含税",
    payrollIncluded: "也包含一般手续、劳务咨询、freee人事劳务Standard与LINE打卡",
    scopeHeadings: ["可委托的工作", "由公司负责", "另行收费"],
    scopeRows: [
      ["工资计算", "出勤资料的确认、修正与确定", "社会保险新规适用"],
      ["一般社会保险与雇用保险手续", "工资计算结果的最终批准", "劳动保险成立与雇用保险设置"],
      ["日常劳务咨询", "提供人事变动信息", "在留资格申请"],
      ["招聘条件与职位内容的咨询、审阅", "必要的公司内部批准", "年末调整"],
      ["中文基本说明", "—", "完整招聘流程外包（RPO）"],
      ["外国人雇用与在留资格基本咨询（顾问合同内不另收费）", "—", "专业翻译与长时间口译"],
      ["freee设置与每月操作支持（初期导入另行收费）", "—", "—"],
    ],
    system: "月费包含freee人事劳务Standard使用费及LINE打卡功能，不含freee会计或其他freee产品。",
    separate: "社会保险资料设置不包含新规适用申请。在留资格申请以行政书士业务另行签约；年末调整可另行收费承办，抚养扣除等税务判断与税务咨询则为您介绍税理士。",
  },
};

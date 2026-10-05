// Client-safe copy shared by the company CTA and the existing legal contact form.
import type { LangCode } from "@/config/languages";

export const COMPANY_CONTACT_INTENT = "kyoninka";

export const COMPANY_TEMPLATE: Record<LangCode, string> = {
  ja: "事業内容：\n設立希望時期：\n日本に住む予定（なし／あり／未定）：\n在留資格の相談（不要／必要／未定）：",
  en: "Business activity:\nDesired incorporation timing:\nPlans to live in Japan (no / yes / undecided):\nResidence status consultation (not needed / needed / undecided):",
  "zh-tw": "事業內容：\n希望設立時期：\n是否計畫在日本居住（否／是／未定）：\n是否需要在留資格諮詢（不需要／需要／未定）：",
  zh: "业务内容：\n希望设立时间：\n是否计划在日本居住（否／是／未定）：\n是否需要在留资格咨询（不需要／需要／未定）：",
};

export const COMPANY_CTA: Record<LangCode, { heading: string; lead: string; line: string; copy: string }> = {
  ja: {
    heading: "会社設立について相談する",
    lead: "事業内容・設立時期・日本に住む予定を、わかる範囲でお知らせください。海外に住み続ける場合と、在留資格も必要な場合を分けて確認します。",
    line: "LINEで会社設立を相談（無料）",
    copy: "相談テンプレをコピー",
  },
  en: {
    heading: "Discuss company formation",
    lead: "Tell us your business activity, timing and plans to live in Japan, as far as you know. We distinguish remaining overseas from also needing a Japanese residence status.",
    line: "Discuss company formation on LINE (free)",
    copy: "Copy the consultation template",
  },
  "zh-tw": {
    heading: "諮詢公司設立",
    lead: "請在了解的範圍內，告知事業內容、設立時期及是否計畫在日本居住。我們會分別確認繼續居住海外，以及同時需要在留資格的情況。",
    line: "用LINE諮詢公司設立（免費）",
    copy: "複製諮詢範本",
  },
  zh: {
    heading: "咨询公司设立",
    lead: "请在了解的范围内，告知业务内容、设立时间及是否计划在日本居住。我们会分别确认继续居住海外，以及同时需要在留资格的情况。",
    line: "用LINE咨询公司设立（免费）",
    copy: "复制咨询模板",
  },
};

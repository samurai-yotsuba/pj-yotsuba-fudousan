import type { LangCode } from "@/config/languages";

/** Public HR service fees. All amounts are JPY including tax; setup is separate. */
export const LABOR_PRICING = {
  currency: "JPY",
  taxIncluded: true,
  bands: [
    { min: 1, max: 3, monthly: 33000 },
    { min: 4, max: 5, monthly: 44000 },
    { min: 6, max: 10, monthly: 55000 },
  ],
  additionalRecipientFee: 3300,
  initialSetupStandard: 55000,
  initialSetupWithMigrationFrom: 88000,
  recruitmentSupportFrom: 22000,
} as const;

/** The additional-recipient formula applies to every count above ten. */
export function getLaborMonthlyFee(payrollRecipients: number): number {
  if (!Number.isSafeInteger(payrollRecipients) || payrollRecipients < 1) {
    throw new RangeError("Payroll recipient count must be a positive safe integer.");
  }
  const band = LABOR_PRICING.bands.find(({ max }) => payrollRecipients <= max);
  if (band) return band.monthly;
  const lastBand = LABOR_PRICING.bands[LABOR_PRICING.bands.length - 1];
  const fee = lastBand.monthly + (payrollRecipients - lastBand.max) * LABOR_PRICING.additionalRecipientFee;
  if (!Number.isSafeInteger(fee)) throw new RangeError("Calculated fee exceeds the safe integer range.");
  return fee;
}

export function formatLaborYen(amount: number, locale: LangCode): string {
  const value = amount.toLocaleString("en-US");
  return locale === "en" ? `¥${value}` : `${value}${locale === "ja" ? "円" : locale === "zh-tw" ? "日圓" : "日元"}`;
}

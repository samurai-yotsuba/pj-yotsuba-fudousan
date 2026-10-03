import { describe, expect, it } from "vitest";
import { getLaborMonthlyFee, LABOR_PRICING } from "@/lib/labor/pricing";

describe("Small-company HR pricing (JPY, tax included)", () => {
  it.each([
    [1, 33000], [2, 33000], [3, 33000], [4, 44000], [5, 44000],
    [6, 55000], [7, 55000], [8, 55000], [9, 55000], [10, 55000],
    [11, 58300], [12, 61600], [13, 64900], [14, 68200], [15, 71500],
    [16, 74800], [17, 78100], [18, 81400], [19, 84700], [20, 88000],
    [21, 91300], [22, 94600], [23, 97900], [24, 101200], [25, 104500],
    [26, 107800], [27, 111100], [28, 114400], [29, 117700], [30, 121000],
  ])("quotes %i payroll recipients at %i yen per month", (people, yen) => {
    expect(getLaborMonthlyFee(people)).toBe(yen);
  });

  it.each([[31, 124300], [32, 127600], [100, 352000], [1000, 3322000]])("applies the same formula beyond 30 recipients (%i)", (people, yen) => {
    expect(getLaborMonthlyFee(people)).toBe(yen);
  });

  it.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid payroll counts (%s) instead of displaying a misleading quote",
    (people) => expect(() => getLaborMonthlyFee(people)).toThrow(RangeError),
  );

  it("starts the tax-inclusive surcharge at the eleventh recipient", () => {
    expect(getLaborMonthlyFee(10)).toBe(55000);
    expect(getLaborMonthlyFee(11)).toBe(58300);
    expect(getLaborMonthlyFee(11) - getLaborMonthlyFee(10)).toBe(3300);
  });

  it("keeps setup and recruitment separate from the recurring fee", () => {
    expect(LABOR_PRICING.initialSetupStandard).toBe(55000);
    expect(LABOR_PRICING.initialSetupWithMigrationFrom).toBe(88000);
    expect(LABOR_PRICING.recruitmentSupportFrom).toBe(22000);
    expect(LABOR_PRICING.currency).toBe("JPY");
    expect(LABOR_PRICING.taxIncluded).toBe(true);
    expect(getLaborMonthlyFee(1)).toBe(33000);
  });
});

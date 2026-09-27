import { describe, expect, it } from "vitest";
import { brokerFeeBadge, brokerFeeLine, isDiscountedBrokerFee } from "../broker-fee";
import { rentalSpecSchema } from "../property-validation";

const rental = (brokerFee?: "full" | "half" | "p033" | "free") => ({ dealType: "rental" as const, spec: { dealType: "rental" as const, brokerFee } as never });

describe("仲介手数料 無料・半額の表示（ATBB→athome ルール v1.1 第5節）", () => {
  it("半額・無料だけバッジを出し、満額は値引き表示しない", () => {
    expect(brokerFeeBadge(rental("free"), "ja")).toBe("仲介手数料 無料");
    expect(brokerFeeBadge(rental("half"), "ja")).toBe("仲介手数料 半額");
    expect(brokerFeeBadge(rental("p033"), "ja")).toBe("仲介手数料 0.33ヶ月（税込）");
    expect(brokerFeeBadge(rental("full"), "ja")).toBeNull();
    expect(brokerFeeBadge(rental(), "ja")).toBeNull();
  });
  it("満額は賃料1か月分＋消費税と表示し、未設定なら何も出さない", () => {
    expect(brokerFeeLine(rental("full"), "ja")).toBe("仲介手数料：賃料1か月分＋消費税");
    expect(brokerFeeLine(rental("half"), "ja")).toContain("0.5か月分");
    expect(brokerFeeLine(rental("p033"), "ja")).toBe("仲介手数料：賃料0.3か月分＋消費税（税込0.33ヶ月）");
    expect(brokerFeeLine(rental(), "ja")).toBeNull();
    expect(brokerFeeLine(rental("free"), "en")).toBe("Brokerage fee: free");
  });
  it("絞り込みは半額・無料の賃貸だけ", () => {
    expect([rental("free"), rental("half"), rental("p033"), rental("full"), rental()].filter(isDiscountedBrokerFee)).toHaveLength(3);
    expect(isDiscountedBrokerFee({ dealType: "land", spec: { dealType: "land" } as never })).toBe(false);
  });
  it("値引きの理由（業者間の事情）を表示文言に含めない", () => {
    for (const locale of ["ja", "en", "zh-tw", "zh"] as const) {
      for (const fee of ["full", "half", "p033", "free"] as const) expect(brokerFeeLine(rental(fee), locale)).not.toMatch(/\bAD\b|広告料|広告費/);
    }
  });
  it("スキーマは満額・0.33ヶ月・無料（旧データの半額）だけを受け付ける", () => {
    expect(rentalSpecSchema.shape.brokerFee.safeParse("half").success).toBe(true);
    expect(rentalSpecSchema.shape.brokerFee.safeParse("p033").success).toBe(true);
    expect(rentalSpecSchema.shape.brokerFee.safeParse("quarter").success).toBe(false);
    expect(rentalSpecSchema.shape.brokerFee.safeParse(undefined).success).toBe(true);
  });
});

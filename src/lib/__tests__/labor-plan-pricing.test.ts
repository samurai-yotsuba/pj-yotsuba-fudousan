import { LABOR_SETUP_COPY } from "@/lib/labor/setup-copy";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { languages } from "@/config/languages";
import { LABOR_PLAN_COPY } from "@/lib/labor/plan-copy";
import { LaborPlanPricing, LaborPlanResponsibility, formatLaborYen } from "@/components/labor/LaborPlanPricing";

describe("V10 plan presentation", () => {
  it.each(languages)("renders both fees and responsibilities in $code without interaction", ({ code }) => {
    const html = renderToStaticMarkup(createElement(LaborPlanPricing, { locale: code }));
    const c = LABOR_PLAN_COPY[code];
    expect(html).toContain(formatLaborYen(33000, code));
    expect(html).toContain(formatLaborYen(88000, code));
    expect(html).toContain(formatLaborYen(55000, code));
    expect(html).toContain(c.monthly);
    expect(html).toContain(c.setup);
    expect(html).toContain(c.tax);
    expect(html).toContain(c.responsibility);
    expect(html).toContain(LABOR_SETUP_COPY[code].standardCondition);
    expect(html).toContain(LABOR_SETUP_COPY[code].migrationCondition);
    expect(html).toContain(LABOR_SETUP_COPY[code].quoteNote);
    expect(html).toContain("11+");
    expect(html).toContain(formatLaborYen(3300, code));
    expect(html).not.toContain("2,200");
    expect(html).not.toContain("31+");
    for (const item of [...LABOR_SETUP_COPY[code].standardItems, ...LABOR_SETUP_COPY[code].migrationItems]) expect(html).toContain(item);
    for (const heading of c.scopeHeadings) expect(html).toContain(heading);
    expect(html).toContain(c.system);
    expect(html).toContain(c.separate);
    expect(html).not.toMatch(/<details|hidden|role="tab"/);
    expect(html.indexOf(LABOR_SETUP_COPY[code].heading)).toBeLessThan(html.indexOf("<table"));
    expect(html.indexOf("</table>")).toBeLessThan(html.indexOf(c.scopeHeadings[0]));
  });

  it("renders the exact requested Japanese Hero responsibility", () => {
    const html = renderToStaticMarkup(createElement(LaborPlanResponsibility, { locale: "ja" }));
    expect(html).toContain("勤怠の確認・確定と給与計算結果の最終承認は会社側");
  });
});

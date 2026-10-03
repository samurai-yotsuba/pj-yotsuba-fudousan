import { LABOR_ENGAGEMENT_COPY } from "@/lib/labor/engagement-copy";
import { LABOR_SETUP_COPY, FREEE_SUPPORT_URL } from "@/lib/labor/setup-copy";
import { describe, it, expect, vi, afterAll } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { LangCode } from "@/config/languages";
import { LABOR_PLAN_COPY } from "@/lib/labor/plan-copy";
import { LABOR_SERVICE_COPY } from "@/lib/labor/service-copy";
import { getLaborPriceStructuredData } from "@/lib/labor/structured-data";
import { LABOR_ANCILLARY_FEES } from "@/lib/labor/ancillary-fees";
const state = vi.hoisted(() => {
  const previous = process.env.NEXT_PUBLIC_SR_LAUNCHED;
  process.env.NEXT_PUBLIC_SR_LAUNCHED = "true";
  return { locale: "ja" as LangCode, previous };
});
afterAll(() => {
  if (state.previous === undefined) delete process.env.NEXT_PUBLIC_SR_LAUNCHED;
  else process.env.NEXT_PUBLIC_SR_LAUNCHED = state.previous;
});
vi.mock("@/lib/getRequestLocale", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("@/components/shared/CtaBand", () => ({ CtaBand: () => null }));
vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));
vi.mock("@/components/shared/CrossLinkBanner", () => ({ CrossLinkBanner: () => null }));
import Top, { generateMetadata as topMetadata } from "@/app/[locale]/(labor)/labor/page";
import Prices from "@/app/[locale]/(labor)/labor/ryokin/page";
import Services from "@/app/[locale]/(labor)/labor/services/page";
import Faq from "@/app/[locale]/(labor)/labor/faq/page";
import { LABOR_TOP_COPY } from "@/lib/labor/top-copy";

for (const locale of ["ja", "en", "zh-tw", "zh"] as const) {
  describe(`V10 pages (${locale})`, () => {
    it("provides visible targets for the footer's insurance, payroll and work-rule links", async () => {
      state.locale = locale;
      const services = renderToStaticMarkup(await Services());
      const prices = renderToStaticMarkup(await Prices());
      for (const id of ["standalone-services", "payroll"]) {
        expect(services.match(new RegExp(`id="${id}"`, "g"))).toHaveLength(1);
      }
      expect(services.slice(services.indexOf('id="payroll"'))).toContain(LABOR_ENGAGEMENT_COPY[locale].payrollTitle);
      expect(prices.match(/id="work-rules"/g)).toHaveLength(1);
      const rules = LABOR_ANCILLARY_FEES[locale].sections.find(section => "id" in section && section.id === "work-rules")!;
      const rulesSection = prices.match(/<section[^>]*id="work-rules"[^>]*>([\s\S]*?)<\/section>/)?.[1];
      expect(rulesSection).toContain(rules.title);
      expect(rulesSection).toContain(rules.rows[0].name);
    });
    it("preserves resident tax and workplace change/closure fees", () => {
      const rows = LABOR_ANCILLARY_FEES[locale].sections.flatMap(section => section.rows);
      expect(rows.some(row => "value" in row && row.value === 550)).toBe(true);
      expect(rows.filter(row => "value" in row && row.value === 6050)).toHaveLength(2);
      expect(rows.some(row => "value" in row && row.value === 11550)).toBe(true);
    });
    it("prioritizes engagement choices while preserving advisory scope, foreign employers and GH", async () => {
      state.locale = locale;
      const html = renderToStaticMarkup(await Top());
      const c = LABOR_SERVICE_COPY[locale];
      const p = LABOR_PLAN_COPY[locale];
      const e = LABOR_ENGAGEMENT_COPY[locale];
      const encode = (text: string) => text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
      for (const line of LABOR_TOP_COPY[locale].headline) expect(html).toContain(encode(line));
      expect(html.indexOf('id="standalone-services"')).toBeLessThan(html.indexOf('id="advisory-plan"'));
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).not.toContain('id="engagement-comparison"');
      expect(html).toContain('href="#advisory-plan"');
      expect(html).toContain(c.foreignHighlightBody);
      expect(html).toContain(c.visaContractNotice);
      expect(html.indexOf(c.visaContractNotice)).toBeLessThan(html.indexOf(c.visaLink));
      expect(html.indexOf(c.chineseTitle)).toBeLessThan(html.indexOf(c.recruitmentTitle));
      expect(html.indexOf(p.scopeHeadings[1])).toBeLessThan(html.indexOf(c.foreignHighlightTitle));
      expect(html).not.toContain("<main");
      expect(html.indexOf(p.responsibility)).toBeGreaterThan(html.indexOf("<h1"));
      expect(html.indexOf(p.responsibility)).toBeLessThan(html.indexOf(c.foreignHighlightTitle));
      expect(html.indexOf(p.name)).toBeLessThan(html.indexOf(c.foreignHighlightTitle));
      expect(html.indexOf(c.foreignHighlightTitle)).toBeLessThan(html.indexOf(c.ghTitle));
      expect(html).toContain("33,000");
      expect(html).toContain("55,000");
      expect(html).toContain("3,300");
      expect(html).not.toContain("2,200");
      expect(html).toContain("88,000");
      const setup = LABOR_SETUP_COPY[locale];
      expect(html).toContain(setup.freeeSupport);
      expect(html).toContain(`href="https://www.freee.co.jp/hr/contacts/"`);
      expect(html.indexOf(setup.comparisonTitle)).toBeGreaterThan(html.indexOf("88,000"));
      expect(html.indexOf(setup.comparisonTitle)).toBeLessThan(html.indexOf(c.foreignHighlightTitle));
      expect(html).not.toContain("https://www.freee.co.jp/accounting/smb/support/");
      const prefix = locale === "ja" ? "" : `/${locale}`;
      expect(html).toContain(`href="${prefix}/legal/services/visa"`);
      expect(html).toContain(`href="${prefix}/legal/services/shogai-fukushi"`);
      expect(html).toContain(`href="${prefix}/labor/contact?intent=labor"`);
      const metadata = await topMetadata();
      expect(metadata.title).toEqual({ absolute: e.title });
      expect(metadata.description).toBe(e.description);
      expect(JSON.stringify(metadata.alternates)).toContain(`${prefix}/labor`);
    });

    it.each([["prices", Prices], ["faq", Faq]] as const)("keeps %s consistent with the new fee and scope", async (_name, Page) => {
      state.locale = locale;
      const html = renderToStaticMarkup(await Page());
      expect(html).toContain("33,000");
      expect(html).toContain("55,000");
      expect(html).toContain("3,300");
      expect(html).not.toContain("2,200");
      expect(html).toContain("88,000");
      expect(html).toContain("freee");
      expect(html).toContain("LINE");
      expect(html).not.toMatch(/23,100|50％|50%|顧問料は、労務のご相談に対する対価|ご相談だけです|in-house|内製|内制|內製/);
    });

    it("shows both conditional setup tiers and a fair freee comparison", async () => {
      state.locale = locale;
      const html = renderToStaticMarkup(await Prices());
      const setup = LABOR_SETUP_COPY[locale];
      expect(html).toContain(setup.standardTitle);
      expect(html).toContain(setup.standardCondition);
      expect(html).toContain(setup.migrationTitle);
      expect(html).toContain(setup.migrationCondition);
      expect(html).toContain(setup.quoteNote);
      expect(html).toContain(setup.freeeSupport);
      expect(html).toContain(setup.comparison);
      expect(html).toContain(`href="${FREEE_SUPPORT_URL}"`);
      expect(html).not.toContain("https://www.freee.co.jp/accounting/smb/support/");
      expect(html).not.toContain("<main");
      expect(html).not.toContain("31+");
    });

    it("has fixed offers from the canonical calculation and no invented setup price", () => {
      const offers = getLaborPriceStructuredData(locale).offers;
      expect(offers[10].priceSpecification.price).toBe(58300);
      expect(offers[29].priceSpecification.price).toBe(121000);
      expect(offers.filter(x => x.name.startsWith(LABOR_PLAN_COPY[locale].name))).toHaveLength(30);
      expect(offers.some(x => x.name.includes(LABOR_PLAN_COPY[locale].setup))).toBe(false);
    });
  });
}

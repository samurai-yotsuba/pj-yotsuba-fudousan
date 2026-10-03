import { LABOR_SETUP_COPY } from "@/lib/labor/setup-copy";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it, vi } from "vitest";
import type { LangCode } from "@/config/languages";
import { GH_SERVICE_COPY } from "@/lib/labor/gh-service-copy";
import { KAIGO_SERVICE_COPY } from "@/lib/labor/kaigo-service-copy";
import { SHOGU_SERVICE_COPY } from "@/lib/labor/shogu-service-copy";
import { LABOR_PLAN_COPY } from "@/lib/labor/plan-copy";

const state = vi.hoisted(() => {
  const previous = process.env.NEXT_PUBLIC_SR_LAUNCHED;
  process.env.NEXT_PUBLIC_SR_LAUNCHED = "true";
  return { locale: "ja" as LangCode, launched: true, previous };
});
afterAll(() => {
  if (state.previous === undefined) delete process.env.NEXT_PUBLIC_SR_LAUNCHED;
  else process.env.NEXT_PUBLIC_SR_LAUNCHED = state.previous;
});
vi.mock("@/lib/getRequestLocale", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("@/lib/shared/office", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/shared/office")>(),
  get SR_LAUNCHED() { return state.launched; },
}));
vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));
vi.mock("@/components/shared/CtaBand", () => ({ CtaBand: () => null }));

import Kaigo, { generateMetadata as kaigoMetadata } from "@/app/[locale]/(labor)/labor/services/kaigo-roumu/page";
import Shogu, { generateMetadata as shoguMetadata } from "@/app/[locale]/(labor)/labor/services/shogu-kaizen/page";
import Legal, { generateMetadata as legalMetadata } from "@/app/[locale]/(legal)/legal/services/shogai-fukushi/page";

/** Resolve the real async server shell and cross-link banners before static rendering. */
async function resolveServerComponents(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolveServerComponents));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (typeof element.type === "function" && element.type.constructor.name === "AsyncFunction") {
    const Component = element.type as (props: unknown) => Promise<ReactNode>;
    return resolveServerComponents(await Component(element.props));
  }
  if (element.props.children === undefined) return element;
  return cloneElement(element, {}, await resolveServerComponents(element.props.children));
}

async function renderPage(Page: () => Promise<ReactElement>) {
  return renderToStaticMarkup(await resolveServerComponents(await Page()));
}

for (const locale of ["ja", "en", "zh-tw", "zh"] as const) {
  describe(`V10 GH pages (${locale})`, () => {
    it("uses the shared plan fees and preserves substantive care guidance", async () => {
      state.locale = locale;
      state.launched = true;
      const html = await renderPage(Kaigo);
      const c = KAIGO_SERVICE_COPY[locale];
      const g = GH_SERVICE_COPY[locale];
      const p = LABOR_PLAN_COPY[locale];
      expect(html).toContain(c.title);
      if (locale === "zh" || locale === "zh-tw") expect(html).not.toMatch(/第[0-9]+款/);
      expect(html.indexOf(p.responsibility)).toBeGreaterThan(html.indexOf("<h1"));
      expect(html.indexOf(p.responsibility)).toBeLessThan(html.indexOf(g.sector));
      expect(html).toContain("33,000");
      expect(html).toContain("88,000");
      expect(html).toContain("11+");
      expect(html).toContain("3,300");
      expect(html).not.toContain("2,200");
      expect(html).not.toContain("31+");
      for (const text of [p.tax, p.setup, p.system, p.separate, g.routine, g.excluded, g.recruitment, g.setupDetail, g.judgment, c.specialistScope]) expect(html).toContain(text);
      for (const text of [...LABOR_SETUP_COPY[locale].standardItems, ...LABOR_SETUP_COPY[locale].migrationItems, ...p.scopeHeadings, c.employmentTitle, c.nightTitle, c.openingTitle, c.beforeOpeningTitle]) expect(html).toContain(text);
      expect(html.indexOf(LABOR_SETUP_COPY[locale].standardItems[0])).toBeLessThan(html.indexOf("<table"));
      expect(html.indexOf("</table>")).toBeLessThan(html.indexOf(p.scopeHeadings[0]));
      expect(html).not.toMatch(/顧問料は.*ご相談に対する対価|手続だけのご依頼は承っておりません|報酬額表の料金を都度/);
    });

    it("separates wage design from administrative documents and recurring HR fees", async () => {
      state.locale = locale;
      state.launched = true;
      const html = await renderPage(Shogu);
      const c = SHOGU_SERVICE_COPY[locale];
      const p = LABOR_PLAN_COPY[locale];
      expect(html).toContain(c.lead);
      for (const text of [c.boundaryIntro, c.contracts, c.fees, c.ongoing, p.responsibility, p.system]) expect(html).toContain(text);
      for (const row of c.rows) for (const text of row) expect(html).toContain(text);
      expect(html.indexOf(c.fees)).toBeLessThan(html.indexOf("33,000"));
      expect(html.indexOf(c.ongoing)).toBeLessThan(html.indexOf("33,000"));
      expect(html).toContain("88,000");
      expect(html).not.toContain("ひとつの事務所が両方を名乗ることはできません");
    });

    it("keeps localized links, canonical URLs, metadata and all hreflang alternatives", async () => {
      state.locale = locale;
      state.launched = true;
      const prefix = locale === "ja" ? "" : `/${locale}`;
      for (const [Page, metadata, path] of [
        [Kaigo, kaigoMetadata, "/labor/services/kaigo-roumu"],
        [Shogu, shoguMetadata, "/labor/services/shogu-kaizen"],
        [Legal, legalMetadata, "/legal/services/shogai-fukushi"],
      ] as const) {
        const html = await renderPage(Page);
        const meta = await metadata();
        expect(meta.alternates?.canonical).toBe(`https://luck428.com${prefix}${path}`);
        expect(Object.keys(meta.alternates?.languages ?? {})).toEqual(expect.arrayContaining(["ja", "en", "zh-Hant", "zh-Hans"]));
        expect(meta.description).toBeTruthy();
        if (path.startsWith("/labor")) {
          expect(html).toContain(`href="${prefix}/legal/services/shogai-fukushi"`);
          expect(html).toContain(`href="${prefix}/labor/ryokin"`);
        } else {
          expect(html).toContain(`href="${prefix}/labor/services/kaigo-roumu"`);
          expect(html).toContain(`href="${prefix}/labor/services/shogu-kaizen"`);
          expect(html).toContain(`href="${prefix}/toushi/group-home"`);
        }
      }
    });

    it("does not render labor links or the new labor offer before launch", async () => {
      state.locale = locale;
      state.launched = false;
      const html = await renderPage(Legal);
      const g = GH_SERVICE_COPY[locale];
      expect(html).toContain(g.beforeTitle);
      expect(html).not.toContain(g.after);
      expect(html).not.toMatch(/href="(?:\/(?:en|zh-tw|zh))?\/labor(?:\/|")/);
      expect(html).toContain("/toushi/group-home");
    });
  });
}

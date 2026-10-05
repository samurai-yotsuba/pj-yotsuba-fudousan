import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { LangCode } from "@/config/languages";
import { COMPANY_TEMPLATE, COMPANY_CTA, COMPANY_CONTACT_INTENT } from "@/lib/shared/company-intake";
import { contactIntentPreset } from "@/lib/shared/contact-intent-preset";
import { PROPERTY_TEMPLATE, PROPERTY_TEMPLATE_GENERAL, PROPERTY_TEMPLATE_GH_JA } from "@/lib/shared/property-intake";
import { addLocalePrefix } from "@/lib/locale";

const state = vi.hoisted(() => ({ locale: "ja" as LangCode }));
vi.mock("@/lib/getRequestLocale", () => ({ getRequestLocale: async () => state.locale }));
import Page, { generateMetadata } from "@/app/[locale]/(legal)/legal/services/company/page";
import { CtaBand } from "@/components/shared/CtaBand";
import { LegalServicePage } from "@/components/shared/LegalServicePage";

// Resolve async server children, then let React render actual client components normally.
async function resolveServerChildren(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolveServerChildren));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (typeof element.type === "function" && element.type.constructor.name === "AsyncFunction") {
    const component = element.type as (props: unknown) => Promise<ReactNode>;
    return resolveServerChildren(await component(element.props));
  }
  if (element.props.children === undefined) return element;
  return cloneElement(element, {}, await resolveServerChildren(element.props.children));
}

for (const locale of ["ja", "en", "zh-tw", "zh"] as const) {
  describe(`company consultation in ${locale}`, () => {
    it("connects the localized CTA to a legal category and the same short form template", async () => {
      state.locale = locale;
      const page = await Page();
      expect(page.type).toBe(LegalServicePage);
      expect(page.props.ctaVariant).toBe("company");
      const html = renderToStaticMarkup(await CtaBand({ businessKey: "legal", variant: page.props.ctaVariant }));
      expect(html).toContain(COMPANY_CTA[locale].heading);
      expect(html).toContain(COMPANY_TEMPLATE[locale]);
      expect(html).toContain(`href="${addLocalePrefix("/legal/contact", locale)}?intent=${COMPANY_CONTACT_INTENT}"`);
      expect(html).toContain(`href="${addLocalePrefix("/line", locale)}"`);
      expect(contactIntentPreset(COMPANY_CONTACT_INTENT, "legal", locale)).toEqual({
        category: "kyoninka", message: COMPANY_TEMPLATE[locale],
      });
      expect(COMPANY_TEMPLATE[locale].split("\n")).toHaveLength(4);
      expect(contactIntentPreset(COMPANY_CONTACT_INTENT, "realestate", locale)).toBeNull();
    });

    it("preserves real estate templates and categories", async () => {
      state.locale = locale;
      for (const [variant, intent, template] of [
        ["property", "bukken", PROPERTY_TEMPLATE[locale]],
        ["property-general", "bukken-general", PROPERTY_TEMPLATE_GENERAL[locale]],
      ] as const) {
        const html = renderToStaticMarkup(await CtaBand({ businessKey: "realestate", variant }));
        expect(html).toContain(template);
        expect(html).toContain(`href="${addLocalePrefix("/contact", locale)}?intent=${intent}"`);
        expect(contactIntentPreset(intent, "realestate", locale)).toEqual({ category: "bukken", message: template });
      }
      expect(contactIntentPreset("bukken-gh", "realestate", locale)).toEqual({ category: "bukken", message: PROPERTY_TEMPLATE_GH_JA });
      expect(contactIntentPreset("visa", "legal", locale)).toEqual({ category: "visa", message: "" });
      expect(contactIntentPreset("sale", "legal", locale)).toBeNull();
      expect(contactIntentPreset("unrecognized", "legal", locale)).toBeNull();
    });

    it("translates the shell and separates staying overseas from residence status consultation", async () => {
      state.locale = locale;
      const page = await Page();
      const html = renderToStaticMarkup(await resolveServerChildren(await LegalServicePage(page.props)));
      expect(html).toContain(COMPANY_CTA[locale].heading);
      const phrases = {
        ja: ["海外に住み続ける方", "口座開設・許認可・在留資格の取得を保証するものではありません"],
        en: ["If you plan to remain overseas", "are not guaranteed", "Related links", "About the author"],
        "zh-tw": ["計畫繼續居住海外者", "不保證銀行開戶", "本頁相關連結", "本文作者"],
        zh: ["计划继续居住海外者", "不保证银行开户", "本页相关链接", "本文作者"],
      };
      for (const phrase of phrases[locale]) expect(html).toContain(phrase);
      if (locale !== "ja") expect(html).not.toMatch(/対応エリア|この記事の著者|業務案内|このページの関連リンク|駅・エリア|賃料の上限/);
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toBe(`https://luck428.com${addLocalePrefix("/legal/services/company", locale)}`);
    });
  });
}

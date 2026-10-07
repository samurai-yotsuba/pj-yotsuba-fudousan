import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { LangCode } from "@/config/languages";
import { FAMILY_TRUST_COPY, FAMILY_TRUST_PATH, familyTrustFaq } from "@/lib/legal/family-trust-copy";
import { SECTIONS } from "@/lib/legal/ryokin-sections";
import { addLocalePrefix } from "@/lib/locale";
import { readFileSync } from "node:fs";

const state = vi.hoisted(() => ({ locale: "ja" as LangCode }));
vi.mock("@/lib/getRequestLocale", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("@/components/shared/Breadcrumb", () => ({ Breadcrumb: () => null }));
vi.mock("@/components/shared/CtaBand", () => ({ CtaBand: () => null }));
vi.mock("@/components/shared/CrossLinkBanner", () => ({ CrossLinkBanner: () => null }));
import Fees from "@/app/[locale]/(legal)/legal/ryokin/page";
import FaqPage from "@/app/[locale]/(legal)/legal/faq/page";

async function resolveAsync(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolveAsync));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (typeof element.type === "function" && element.type.constructor.name === "AsyncFunction") {
    const Component = element.type as (props: unknown) => Promise<ReactNode>;
    return resolveAsync(await Component(element.props));
  }
  if (element.props.children) return cloneElement(element, { children: await resolveAsync(element.props.children) });
  return element;
}

const LOCALES = ["ja", "en", "zh-tw", "zh"] as const;
const EXAMPLES = [[25000000, 330000], [30000000, 330000], [50000000, 550000], [100000000, 1100000], [150000000, 1375000]];
/** 検証専用：1円=20000単位。公開コードに請求計算・丸めを導入しない。 */
function exactFeeUnits(value: bigint) {
  return value <= BigInt(100000000)
    ? [BigInt(330000) * BigInt(20000), value * BigInt(220)].reduce((a, b) => a > b ? a : b)
    : BigInt(1100000) * BigInt(20000) + (value - BigInt(100000000)) * BigInt(110);
}
function tableRows(body: string) {
  return body.split("\n").filter(line => line.startsWith("|")).slice(2).map(line =>
    line.split("|").slice(1, -1).map(cell => cell.match(/\d[\d,]*/g)?.map(n => Number(n.replaceAll(",", ""))) ?? [])
  );
}

describe("家族信託：承認された料金原稿・表示経路", () => {
  for (const locale of LOCALES) {
    it(`${locale}: 税込率と掲載例を整数比で照合し、共有持分を二重計上しない`, () => {
      const c = FAMILY_TRUST_COPY[locale];
      const rates = c.sections[0].body;
      expect(rates).toContain("1.1"); expect(rates).toContain("0.55");
      expect(rates).toContain("330,000"); expect(rates).toContain("1,100,000");
      const actual = tableRows(c.sections[3].body).map(row => [row[0][0], row[1][0]]);
      expect(actual).toEqual(EXAMPLES);
      for (const [value, fee] of actual) expect(exactFeeUnits(BigInt(value))).toBe(BigInt(fee) * BigInt(20000));
      const spouses = tableRows(c.sections[4].body);
      expect(spouses.map(row => [row[1][0], row[2][0]])).toEqual([[330000, 660000], [550000, 1100000]]);
      for (const [totalProperty, expected] of [[50000000, 660000], [100000000, 1100000]]) {
        const share = BigInt(totalProperty) / BigInt(2);
        expect(exactFeeUnits(share) * BigInt(2)).toBe(BigInt(expected) * BigInt(20000));
      }
      // 100,000,001円 → 1,100,000.0055円。請求額の丸めは未承認。
      expect(exactFeeUnits(BigInt(100000001))).toBe(BigInt(22000000110));
      expect(exactFeeUnits(BigInt(100000001)) % BigInt(20000)).toBe(BigInt(110));
    });

    it(`${locale}: PC表・SPカード・詳細に同じ料金が載り、最低額を総額Offerにしない`, async () => {
      state.locale = locale;
      const html = renderToStaticMarkup(await resolveAsync(await Fees()));
      const c = FAMILY_TRUST_COPY[locale];
      const escape = (text: string) => renderToStaticMarkup(<>{text}</>);
      expect(html.split(escape(c.price))).toHaveLength(3); // PC / SP
      expect(html).toContain('id="family-trust"');
      expect(html).toContain(`href="${addLocalePrefix(FAMILY_TRUST_PATH, locale)}"`);
      expect((html.match(/<h1\b/g) ?? [])).toHaveLength(1);
      for (const s of c.sections) expect(html).toContain(escape(s.heading));
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
      const offers = graph["@graph"][0].offers;
      expect(offers.some((offer: { name: string }) => /信託|trust/i.test(offer.name))).toBe(false);
      expect(SECTIONS.flatMap(s => s.rows).find(r => r.href === FAMILY_TRUST_PATH)?.value).toBeUndefined();
    });

    it(`${locale}: FAQ表示と単一のFAQPage JSON-LDの回答・言語・リンクが一致`, async () => {
      state.locale = locale;
      const html = renderToStaticMarkup(await FaqPage());
      const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
      const faqs = scripts.filter(s => s["@type"] === "FAQPage");
      expect(faqs).toHaveLength(1);
      expect(faqs[0].inLanguage).toBe(({ ja: "ja", en: "en", "zh-tw": "zh-Hant", zh: "zh-Hans" })[locale]);
      for (const item of familyTrustFaq(locale)) {
        expect(faqs[0].mainEntity).toContainEqual({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } });
        expect(html).toContain(renderToStaticMarkup(<>{item.a}</>));
        expect(html).toContain(`href="${item.links![0].href}"`);
      }
      const file = `scripts/legal-columns/${locale === "ja" ? "" : `${locale}/`}32-kazoku-shintaku-gyosei-yakuwari-kumisei.md`;
      expect(readFileSync(file, "utf8")).toContain(`](${addLocalePrefix(FAMILY_TRUST_PATH, locale)})`);
    });
  }
});

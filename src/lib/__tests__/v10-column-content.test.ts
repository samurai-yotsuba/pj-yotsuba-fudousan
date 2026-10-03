import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LABOR_COLUMNS_SEED } from "@/lib/data/labor-columns-seed";
import { getLocalizedColumn, isLocaleAllowed, type Column } from "@/lib/column-shared";

const slugs = [
  "kyuyo-keisan-soba-sharoushi",
  "hitori-de-60sha-roumu-de-nariatsu-ka",
  "sharoushi-komonryo-nan-no-taika",
  "freee-jinji-roumu-sharoushi-doko-made",
  "kyuyo-keisan-freee-naisei",
] as const;
const locales = ["ja", "en", "zh-tw", "zh"] as const;

for (const slug of slugs) {
  describe(`V10 existing article: ${slug}`, () => {
    for (const locale of locales) {
      it(`${locale}: localized article, fees, links and visible FAQ agree with the seed`, () => {
        const matches = LABOR_COLUMNS_SEED.filter((column) => column.slug === slug);
        expect(matches).toHaveLength(1);
        const base: Column = matches[0];
        expect(base.business).toBe("labor");
        expect(isLocaleAllowed(base, locale)).toBe(true);
        const article = getLocalizedColumn(base, locale);
        if (locale !== "ja") {
          const translation = base.translations?.[locale];
          expect(translation).toBeDefined();
          expect(article.title).toBe(translation?.title);
          expect(article.excerpt).toBe(translation?.excerpt);
          expect(article.content).toBe(translation?.content);
          expect(article.faq).toEqual(translation?.faq);
          expect(article.content).not.toBe(base.content);
        }
        expect(article.content).not.toMatch(/^# /m);
        expect(article.content).not.toContain("1,100");
        expect(article.content).not.toContain("23,100");
        if (slug !== "hitori-de-60sha-roumu-de-nariatsu-ka") {
          expect(article.content).toContain("3,300");
          expect(article.content).not.toContain("2,200");
          expect(article.content).not.toMatch(/11[〜～–]30|31名|31人|31 or more/);
        }
        if (slug === "sharoushi-komonryo-nan-no-taika") {
          for (const amount of ["71,500", "88,000", "121,000", "22,000"]) expect(article.content).toContain(amount);
        }
        const lead = article.content.trim().split("\n\n")[0];
        for (const amount of ["33,000", "88,000"]) {
          expect(article.content).toContain(amount);
          if (slug !== "hitori-de-60sha-roumu-de-nariatsu-ka") {
            expect(lead).toContain(amount);
            expect(article.excerpt).toContain(amount);
          }
        }
        // Metadata/schema FAQ must be the four questions and answers actually visible in this locale.
        expect(article.faq).toHaveLength(4);
        const visibleText = renderToStaticMarkup(createElement(ReactMarkdown, {
          remarkPlugins: [remarkGfm],
        }, article.content)).replace(/<[^>]+>/g, "");
        expect(visibleText).not.toContain("**");
        for (const item of article.faq ?? []) {
          const question = renderToStaticMarkup(createElement("span", null, item.question)).replace(/<[^>]+>/g, "");
          const answer = renderToStaticMarkup(createElement("span", null, item.answer)).replace(/<[^>]+>/g, "");
          expect(visibleText).toContain(question);
          expect(visibleText).toContain(answer);
        }
        const prefix = locale === "ja" ? "" : `/${locale}`;
        const links = [...article.content.matchAll(/\]\((\/[^)]+)\)/g)].map((match) => match[1]);
        expect(links).toContain(`${prefix}/labor/ryokin`);
        expect(links).toContain(`${prefix}/about/uramatsu`);
        for (const href of links) {
          expect(href).toMatch(locale === "ja" ? /^\/(labor|legal|about)\// : new RegExp(`^/${locale}/`));
        }
        if (locale === "ja") {
          expect(article.content).toContain("勤怠の確認・確定と給与計算結果の最終承認は会社側");
        }
        if (locale === "zh" || locale === "zh-tw") {
          expect(article.content).not.toMatch(/第[一二三四五六七八九十百千0-9０-９]+款/);
        }
      });
    }
  });
}

import { renderToStaticMarkup } from "react-dom/server";
import { BlogPostingJsonLd } from "@/components/seo/BlogPostingJsonLd";
import { SpeakableJsonLd } from "@/components/seo/SpeakableJsonLd";
import { describe, expect, it } from "vitest";
import { NONRESIDENT_COMPANY_COLUMN_SEED } from "@/lib/data/nonresident-company-column-seed";
import type { Column } from "@/lib/column-shared";
import { getLocalizedColumn } from "@/lib/column-shared";
import { NONRESIDENT_COPY, NONRESIDENT_SOURCES } from "@/lib/legal/nonresident-review-copy";

describe("nonresident article publication boundary", () => {
  it("publishes one localized article without publishing proposed bank services or fees", () => {
    expect(NONRESIDENT_COMPANY_COLUMN_SEED).toHaveLength(1);
    const seed = NONRESIDENT_COMPANY_COLUMN_SEED[0];
    expect(seed.status).toBe("published");
    expect(seed.locales).toEqual(["ja", "en", "zh-tw", "zh"]);
    for (const locale of seed.locales!) {
      const base: Column = seed;
      const col = getLocalizedColumn(base, locale);
      const draft = NONRESIDENT_COPY[locale];
      const path = `/legal/column/${seed.slug}`;
      const url = `https://luck428.com${locale === "ja" ? "" : `/${locale}`}${path}`;
      const posting = renderToStaticMarkup(BlogPostingJsonLd({ businessKey: "legal", column: col, locale }));
      const speakable = renderToStaticMarkup(SpeakableJsonLd({ businessKey: "legal", path, headline: col.title, summary: col.excerpt, locale }));
      expect(posting).toContain(`${url}#article`);
      expect(posting).toContain(`"@id":"${url}"`);
      expect(speakable).toContain(`"url":"${url}"`);
      expect(col.title).toBe(draft.articleTitle);
      expect(col.faq).toEqual(draft.faqs);
      for (const source of NONRESIDENT_SOURCES) expect(col.content).toContain(source);
      for (const item of draft.faqs) {
        expect(col.content).toContain(item.question);
        expect(col.content).toContain(item.answer);
      }
      expect(col.content).not.toContain(draft.review);
      expect(col.content).not.toContain(draft.updated);
      for (const service of draft.services.slice(1)) expect(col.content).not.toContain(service);
    }
    expect(JSON.stringify(seed)).not.toMatch(/33,?000|88,?000|16,?500/);
  });
});

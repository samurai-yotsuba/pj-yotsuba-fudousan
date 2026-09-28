// 2026-09-28 性能是正の退行防止：一覧サムネイルの srcset 肥大と、コラム見出し画像の lazy 読み込み
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("物件サムネイル（/bukken 一覧）", () => {
  it("一覧カードは sizes を渡さない（125件×17本の srcset で HTML が1.3MBになった事故の再発防止）", () => {
    const card = readFileSync(join(process.cwd(), "src/components/bukken/PropertyCard.tsx"), "utf8");
    const block = card.slice(card.indexOf("<PropertyImage"), card.indexOf("/>", card.indexOf("<PropertyImage")));
    expect(block).not.toMatch(/sizes=/);
  });
});

describe("コラムの見出し画像（LCP）", () => {
  it("next/image に preload を付け、fill の既定 lazy のままにしない", () => {
    const hero = readFileSync(join(process.cwd(), "src/components/column/ColumnArticleHero.tsx"), "utf8");
    const img = hero.slice(hero.indexOf("<Image"), hero.indexOf("/>", hero.indexOf("<Image")));
    expect(img).toMatch(/\bpreload\b/);
    expect(img).not.toMatch(/loading="lazy"/);
  });
});

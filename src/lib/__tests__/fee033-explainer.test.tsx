// 2026-09-29：/bunkyo/chukai-033 を「仲介手数料0.33ヶ月」の説明ページとして完成させる（PR-B）。
// AI可視性v2 q08「賃貸の仲介手数料「0.33ヶ月」とはどういう意味ですか？」で出典2位（引かれたのはFAQの一文）。
// 計算例の表・含まれない費用・支払時期・FAQPage 構造化データを足し、学区の一覧（/gakku/rentals）とは役割を分ける。
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Fee033Explainer } from "@/components/bukken/Fee033Explainer";
import { buildFaqJsonLd } from "@/components/shared/Faq";
import { FEE033_EXAMPLE_RENTS, FEE033_FAQ, FEE033_HUB_COPY, FEE033_OTHER_COSTS, fee033Example } from "@/lib/fee033-hub";
import { BROKER_FEE_PERCENT } from "@/lib/broker-fee";

/** 他社・ポータル・法令上の上限との比較、値引き・最上級の表現は書かない（表示規約・浦松規程） */
const BANNED = ["安い", "格安", "最安", "相場", "他社", "ポータル", "法定上限", "上限の範囲", "1ヶ月分より", "お得", "割引", "キャンペーン", "ワンストップ", "街の不動産屋"];
const allCopy = [
  ...(Object.values(FEE033_HUB_COPY) as string[]),
  ...FEE033_FAQ.flatMap((f) => [f.q, f.a, ...(f.links ?? []).map((l) => l.label)]),
  ...FEE033_OTHER_COSTS.flatMap((r) => [r.name, r.note]),
];

describe("0.33ヶ月の計算例", () => {
  it("賃料×0.3が本体、その10%が消費税、合計は賃料×0.33（broker-fee の33%と同じ丸め）", () => {
    expect(fee033Example(100_000)).toEqual({ rentYen: 100_000, base: 30_000, tax: 3_000, total: 33_000 });
    expect(fee033Example(183_000)).toEqual({ rentYen: 183_000, base: 54_900, tax: 5_490, total: 60_390 });
    for (const rent of FEE033_EXAMPLE_RENTS) {
      const ex = fee033Example(rent);
      expect(ex.total).toBe(Math.round((rent * BROKER_FEE_PERCENT.p033) / 100));
      expect(ex.base + ex.tax).toBe(ex.total);
    }
    expect(FEE033_EXAMPLE_RENTS.length).toBeGreaterThanOrEqual(5);
  });
  it("説明部品に計算例の表・含まれない費用の表・支払時期・見分け方・料金ページへのリンクが載る", () => {
    const html = renderToStaticMarkup(<Fee033Explainer />);
    expect((html.match(/<table/g) ?? []).length).toBe(2);
    expect(html).toContain("100,000円");
    expect(html).toContain("33,000円");
    expect(html).toContain("250,000円");
    expect(html).toContain("82,500円");
    for (const r of FEE033_OTHER_COSTS) expect(html).toContain(r.name);
    expect(html).toContain(FEE033_HUB_COPY.payment);
    expect(html).toContain(FEE033_HUB_COPY.howToTell);
    expect(html).toContain('href="/ryokin"');
    expect(html).toContain('id="example"');
    expect(html).toContain('id="other-costs"');
  });
});

describe("題名・直答・FAQ", () => {
  it("題名と直答は「0.33ヶ月とは」に答え、主語は四葉不動産株式会社（免許番号つき）", () => {
    expect(FEE033_HUB_COPY.title).toContain("仲介手数料0.33ヶ月とは");
    expect(FEE033_HUB_COPY.h1).toContain("0.33ヶ月（税込）とは");
    expect(FEE033_HUB_COPY.description).toContain("0.3ヶ月分＋消費税");
    expect(FEE033_HUB_COPY.description.length).toBeLessThanOrEqual(160);
    expect(FEE033_HUB_COPY.answer).toContain("四葉不動産株式会社");
    expect(FEE033_HUB_COPY.answer).toContain("第113304号");
    expect(FEE033_HUB_COPY.answer).toContain("管理費・共益費を除いた賃料");
  });
  it("FAQ は0.33に固有の6問。学区・法人契約の質問は持たずリンクで送る（重複回避）", () => {
    expect(FEE033_FAQ).toHaveLength(6);
    for (const f of FEE033_FAQ) expect(f.q).not.toMatch(/学区|小学校|法人契約/);
    expect(FEE033_FAQ.some((f) => (f.links ?? []).some((l) => l.href === "/faq#corporate"))).toBe(true);
    expect(FEE033_FAQ.some((f) => (f.links ?? []).some((l) => l.href === "/gakku/rentals"))).toBe(true);
    expect(FEE033_FAQ[0].q).toContain("0.33ヶ月");
    expect(FEE033_FAQ[0].a).toContain("0.33%ではありません");
    expect(FEE033_FAQ.some((f) => f.q.includes("管理費") && f.a.includes("33,000円"))).toBe(true);
    expect(FEE033_FAQ.some((f) => f.q.includes("いつ支払"))).toBe(true);
  });
  it("FAQPage 構造化データが作れる（Answer は本文のみ）", () => {
    const ld = buildFaqJsonLd(FEE033_FAQ, "ja");
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(6);
    expect(ld.mainEntity[0].name).toBe(FEE033_FAQ[0].q);
    expect(JSON.stringify(ld)).not.toContain("/faq#corporate");
  });
  it("比較・値引き・最上級の表現を書いていない。手数料表示は税込を明示", () => {
    for (const text of allCopy) for (const b of BANNED) expect(text, `「${b}」: ${text.slice(0, 40)}`).not.toContain(b);
    expect(FEE033_HUB_COPY.h1).toContain("税込");
    expect(FEE033_HUB_COPY.exampleLead).toContain("消費税");
  });
});

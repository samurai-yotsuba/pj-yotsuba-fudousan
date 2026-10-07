import { describe, expect, it } from "vitest";
import { SECTIONS } from "@/lib/legal/ryokin-sections";
import { localizeFeeName, localizeFeeText } from "@/lib/legal/ryokin-i18n";

const LOCALES = ["en", "zh-tw", "zh"] as const;
const KANA = /[ぁ-んァ-ヶー]/;

/** 数値の多重集合。「15万」「9萬」は 150000・90000 に直し、桁区切りは外す */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function numbers(text: string): string[] {
  text = text.replace(/(\d[\d,]*(?:\.\d+)?)\s*[億亿]/g, (_, n) => String(Number(n.replace(/,/g, "")) * 100000000));
  const out: string[] = [];
  MONTHS.forEach((m, i) => {
    if (text.includes(m)) out.push(String(i + 1));
  });
  for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*([万萬])?/g)) {
    const n = Number(m[1].replace(/,/g, "")) * (m[2] ? 10000 : 1);
    out.push(String(n));
  }
  return out.sort();
}

const rows = SECTIONS.flatMap((s) => s.rows);
const texts = [...new Set(rows.flatMap((r) => [r.price, r.jitsuhi ?? "—"]))];
// 単位（「1件」「1回」等）は訳で数字が落ちる（Per case）ため、数値比較の対象外にして網羅だけ見る
const units = [...new Set(rows.map((r) => r.unit))];

describe("報酬額表（/legal/ryokin）の4言語化：2026-09-24 全ページ点検 #2", () => {
  for (const loc of LOCALES) {
    it(`${loc}: 全サービス名に訳があり、かなが残らず、数値が一致する`, () => {
      for (const r of rows) {
        const t = localizeFeeName(r.name, loc);
        expect(t, r.name).not.toBeNull();
        expect(KANA.test(t!), `${loc} ${t}`).toBe(false);
        expect(numbers(t!), `${loc} ${r.name}`).toEqual(numbers(r.name));
      }
    });

    it(`${loc}: 単位・金額・実費欄に訳があり、かなが残らず、金額が1円も変わらない`, () => {
      for (const ja of texts) {
        const t = localizeFeeText(ja, loc);
        expect(t, ja).not.toBeNull();
        expect(KANA.test(t!), `${loc} ${t}`).toBe(false);
        expect(numbers(t!), `${loc} ${ja}`).toEqual(numbers(ja));
      }
    });
  }

  it("単位は全言語に訳がある", () => {
    for (const loc of LOCALES) for (const u of units) {
      const t = localizeFeeText(u, loc);
      expect(t, u).not.toBeNull();
      expect(KANA.test(t!)).toBe(false);
    }
  });

  it("内部呼称（松・竹・梅）を公開面に出さない（2026-09-24 浦松指示）", () => {
    for (const r of rows) expect(r.name, r.name).not.toMatch(/[（(][松竹梅][：:]/);
  });

  it("ja は原文のまま", () => {
    for (const r of rows) expect(localizeFeeName(r.name, "ja")).toBe(r.name);
    for (const ja of texts) expect(localizeFeeText(ja, "ja")).toBe(ja);
  });
});

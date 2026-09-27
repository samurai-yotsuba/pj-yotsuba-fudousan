// 2026-09-28：学区で借りる・買うご家族向けQA（ハブのみ）。表現の禁止事項と4言語の対応を確認する。
import { describe, expect, it } from "vitest";
import { SCHOOL_RENTAL_HUB_FAQ, SCHOOL_SALE_HUB_FAQ } from "@/lib/rental-school-hub-faq";
import { pickFaqJa } from "@/data/faqJa";

const LOCALES = ["ja", "en", "zh-tw", "zh"] as const;
const BANNED = ["SUUMO", "HOME'S", "ポータル", "最安", "格安", "業界", "必ず通え", "広告掲載できない", "内容証明", "サブリース", "元付", "外国人", "学区房", "相場"];

describe("学区のご家族向けQA", () => {
  it("4言語で問数がそろい、空欄がない", () => {
    for (const l of LOCALES) {
      expect(SCHOOL_RENTAL_HUB_FAQ[l]).toHaveLength(SCHOOL_RENTAL_HUB_FAQ.ja.length);
      expect(SCHOOL_SALE_HUB_FAQ[l].items).toHaveLength(SCHOOL_SALE_HUB_FAQ.ja.items.length);
      for (const it of [...SCHOOL_RENTAL_HUB_FAQ[l], ...SCHOOL_SALE_HUB_FAQ[l].items]) { expect(it.q.trim()).not.toBe(""); expect(it.a.trim()).not.toBe(""); }
    }
  });
  it("禁止表現（比較・批判・断定・国籍向け）を含まない", () => {
    const all = LOCALES.flatMap(l => [...SCHOOL_RENTAL_HUB_FAQ[l], ...SCHOOL_SALE_HUB_FAQ[l].items]).map(i => i.q + i.a).join("\n");
    for (const w of BANNED) expect(all).not.toContain(w);
  });
  it("年齢の設問は出典（文部科学省の架け橋プログラム）を示し、推奨は当社の考えとして書く", () => {
    const a = SCHOOL_RENTAL_HUB_FAQ.ja[1].a;
    expect(a).toContain("幼保小の架け橋プログラム");
    expect(a).toContain("四葉不動産では");
    expect(a).not.toContain("とされています");
  });
  it("0.33ヶ月は「表示している物件」に限る書き方", () => {
    expect(SCHOOL_RENTAL_HUB_FAQ.ja[2].a).toContain("「仲介手数料0.33ヶ月」と表示している物件");
  });
  it("税務・融資の判断は専門家・金融機関に委ねる", () => {
    expect(SCHOOL_SALE_HUB_FAQ.ja.items[0].a).toContain("金融機関の審査で決まります");
    const shataku = pickFaqJa(["会社名義（役員社宅）で借りたいのですが、税理士の計算に必要な資料はそろいますか？", "自宅の一部を仕事場として使える物件を借りられますか？"]);
    for (const it of shataku) expect(it.a).toContain("税理士にご確認ください");
  });
});

import type { LangCode } from "@/config/languages";
import {
  DISTRICT_SOURCE,
  findSchoolBySlug,
  listDistrictRows,
  listDistrictRowsBySchool,
  listSchools,
  type DistrictRow,
  type SchoolInfo,
} from "@/lib/school-district";
import { gakkuCopy, isFeaturedSchoolSlug } from "@/lib/gakku";

/**
 * 学校ごとの「学区の要約」＝区の表から機械的に作る直答（2026-09-29）。
 *
 * それまでの要約は「通学区域は下の表のとおりです」で、町丁目を一つも言っていなかった。
 * GSC では「〇〇小学校 学区」で順位5〜10に出ているのにクリック0（description が疑問文のまま）、
 * AI 検索では「どこからどこまで？」に引用できる一文が無く区公式・他社が引かれていた。
 * ここで作る一文を H1 直下・H2「どこからどこまで？」の直後・meta description・FAQ の回答に共用する。
 *
 * 書き方の規律：町丁目の列挙は区の表だけから作る（手書きしない）。全域か一部かも表から判定する。
 * 学校の評判・人気・序列は書かない。地名は区の表のまま日本語（en/zh でも）。
 */

export interface DistrictCoverage {
  /** 全域が通学区域の町丁目（区の表の並び順） */
  whole: string[];
  /** 一部（番・号・旧町名で分かれる）の町丁目 */
  partial: string[];
}

const isAll = (v: string) => v.trim() === "" || v.trim() === "全";

/** 町丁目ごとに、全域か一部かを区の表から判定する */
export function districtCoverage(rows: DistrictRow[]): DistrictCoverage {
  const seen = new Map<string, boolean>();
  for (const r of rows) {
    const wholeRow = isAll(r.ban) && isAll(r.go) && r.note.trim() === "";
    const prev = seen.get(r.chome);
    // 同じ町丁目に複数行がある場合は、全行が「全・全・備考なし」のときだけ全域
    seen.set(r.chome, prev === undefined ? wholeRow : prev && wholeRow);
  }
  const whole: string[] = [];
  const partial: string[] = [];
  for (const [chome, isWhole] of seen) (isWhole ? whole : partial).push(chome);
  return { whole, partial };
}

/** 「千駄木3丁目」「千駄木5丁目」→「千駄木3・5丁目」のように町名でまとめる（日本語・中国語向け） */
export function groupChome(chomes: string[]): string[] {
  const byTown = new Map<string, string[]>();
  for (const c of chomes) {
    const m = c.match(/^(.*?)(\d+)丁目$/);
    if (!m) {
      byTown.set(c, byTown.get(c) ?? []);
      continue;
    }
    const list = byTown.get(m[1]) ?? [];
    list.push(m[2]);
    byTown.set(m[1], list);
  }
  return [...byTown].map(([town, nums]) => (nums.length ? `${town}${nums.join("・")}丁目` : town));
}

function joinJa(items: string[]) {
  return items.join("、");
}
function joinEn(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * 直答の一文（＋出典の注記＋免責）。
 * 例：文京区立千駄木小学校の学区（通学区域）は、千駄木4丁目の全域と、向丘2丁目、千駄木3・5丁目、本駒込3・4丁目の一部です。
 */
export function districtSummary(locale: LangCode, school: SchoolInfo, rows: DistrictRow[]): string {
  const c = gakkuCopy(locale);
  const asOf = DISTRICT_SOURCE.updatedAt;
  const body = districtLead(locale, school, rows);
  if (locale === "en") {
    return `${body} (split by block and lot number; Bunkyo-ku's table, ${rows.length} rows, as of ${asOf}). Within some chome the assigned school differs by block and lot number, so check the table rather than the chome name alone. ${c.disclaimer}`;
  }
  if (locale === "zh-tw") {
    return `${body}（依「番」「號」劃分；文京區公布資料・共${rows.length}列・${asOf}現在）。部分町丁目會因「番」「號」而分屬不同學校，請以表格確認。${c.disclaimer}`;
  }
  if (locale === "zh") {
    return `${body}（依「番」「号」划分；文京区公布资料・共${rows.length}行・${asOf}现在）。部分町丁目会因「番」「号」而分属不同学校，请以表格确认。${c.disclaimer}`;
  }
  return `${body}（一部の町丁目は「番」「号」で学校が分かれます。文京区の公表データ・${rows.length}行・${asOf}現在）。同じ町丁目でも番地によって学校が変わる区域があるため、表でご確認ください。${c.disclaimer}`;
}

/** 直答の本体（1文・句点なし）。H1 直下の短い要約に使う */
export function districtLead(locale: LangCode, school: SchoolInfo, rows: DistrictRow[]): string {
  const { whole, partial } = districtCoverage(rows);
  const name = school.formalName;
  if (locale === "en") {
    const w = joinEn(whole);
    const p = joinEn(partial);
    if (whole.length && partial.length) return `The ${name} school district (attendance area) covers all of ${w}, and parts of ${p}`;
    if (whole.length) return `The ${name} school district (attendance area) covers all of ${w}`;
    return `The ${name} school district (attendance area) covers parts of ${p}`;
  }
  const w = joinJa(groupChome(whole));
  const p = joinJa(groupChome(partial));
  if (locale === "zh-tw") {
    if (whole.length && partial.length) return `${name}的學區（通學區域）包含${w}的全域，以及${p}的一部分`;
    if (whole.length) return `${name}的學區（通學區域）包含${w}的全域`;
    return `${name}的學區（通學區域）包含${p}的一部分`;
  }
  if (locale === "zh") {
    if (whole.length && partial.length) return `${name}的学区（通学区域）包含${w}的全域，以及${p}的一部分`;
    if (whole.length) return `${name}的学区（通学区域）包含${w}的全域`;
    return `${name}的学区（通学区域）包含${p}的一部分`;
  }
  if (whole.length && partial.length) return `${name}の学区（通学区域）は、${w}の全域と、${p}の一部です`;
  if (whole.length) return `${name}の学区（通学区域）は、${w}の全域です`;
  return `${name}の学区（通学区域）は、${p}の一部です`;
}

/** slug から要約を作る簡便版（description など） */
export function districtSummaryBySlug(locale: LangCode, slug: string): string {
  const school = findSchoolBySlug(slug);
  if (!school) return "";
  return districtSummary(locale, school, listDistrictRowsBySchool(slug));
}

export interface NeighborSchool {
  school: SchoolInfo;
  /** 両校の通学区域が同じ町丁目に及んでいる町丁目 */
  chomes: string[];
}

/**
 * 同じ町丁目を分け合っている学校（＝番・号や旧町名で学校が分かれる相手）。
 * 「境界付近の住所はどちらの学校か」を利用者が辿れるよう、学区ページ同士を相互リンクするために使う。
 */
export function neighborSchools(slug: string): NeighborSchool[] {
  const me = findSchoolBySlug(slug);
  if (!me) return [];
  const mine = new Set(listDistrictRowsBySchool(slug).map((r) => r.chome));
  const out: NeighborSchool[] = [];
  const all = listDistrictRows();
  for (const other of listSchools()) {
    if (other.slug === slug) continue;
    const shared: string[] = [];
    for (const r of all) {
      if (r.school !== other.name || !mine.has(r.chome) || shared.includes(r.chome)) continue;
      shared.push(r.chome);
    }
    if (shared.length) out.push({ school: other, chomes: shared });
  }
  return out;
}

/** 各校の「学区ページ」の場所。4校は通学区域ページ、残り16校は学区（通学区域）表つきの賃貸ページ */
export function schoolDistrictPagePath(slug: string): string {
  return isFeaturedSchoolSlug(slug) ? `/gakku/${slug}` : `/gakku/${slug}/rentals`;
}

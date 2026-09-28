import type { LangCode } from "@/config/languages";
import { DISTRICT_SOURCE } from "@/lib/school-district";
import { gakkuCopy } from "@/lib/gakku";

/**
 * 直答ブロック。町丁目の列挙は区の表から機械的に作る（手書きの説明を入れない）。
 * 4校の通学区域ページと、残り16校の学区賃貸ページ（2026-09-28）で共用。
 */
export function districtSummary(locale: LangCode, formalName: string, rowCount: number): string {
  const c = gakkuCopy(locale);
  const rows = rowCount;
  if (locale === "en") {
    return `${formalName} covers the districts listed below, as published by Bunkyo-ku (${rows} rows in the ward's table, as of ${DISTRICT_SOURCE.updatedAt}). Within some chome the assigned school differs by block and lot number, so check the table rather than the chome name alone. ${c.disclaimer}`;
  }
  if (locale === "zh-tw") {
    return `${formalName}的通學區域如下表（依文京區公布資料，共${rows}列，${DISTRICT_SOURCE.updatedAt}現在）。部分町丁目會因「番」「號」而分屬不同學校，請以表格確認，勿僅以町丁目判斷。${c.disclaimer}`;
  }
  if (locale === "zh") {
    return `${formalName}的通学区域如下表（依文京区公布资料，共${rows}行，${DISTRICT_SOURCE.updatedAt}现在）。部分町丁目会因「番」「号」而分属不同学校，请以表格确认，勿仅以町丁目判断。${c.disclaimer}`;
  }
  return `${formalName}の通学区域は下の表のとおりです（文京区の公表データ・${rows}行・${DISTRICT_SOURCE.updatedAt}現在）。同じ町丁目でも「番」「号」によって学校が分かれる区域があるため、町丁目だけで判断せず表でご確認ください。${c.disclaimer}`;
}

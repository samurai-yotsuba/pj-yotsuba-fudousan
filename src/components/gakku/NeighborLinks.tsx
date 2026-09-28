/**
 * 同じ町丁目を分け合う学校（番・号・旧町名で分かれる相手）への相互リンク。
 * 4校の通学区域ページと16校の学区賃貸ページで共用。サーバー専用の依存を持たない（テストで描画できるように）。
 */
import Link from "next/link";
import type { LangCode } from "@/config/languages";
import { addLocalePrefix } from "@/lib/locale";
import { gakkuCopy } from "@/lib/gakku";
import { neighborSchools, schoolDistrictPagePath } from "@/lib/school-district-summary";

export function NeighborLinks({ slug, locale }: { slug: string; locale: LangCode }) {
  const c = gakkuCopy(locale);
  const neighbors = neighborSchools(slug);
  if (neighbors.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text">
      <p className="font-semibold text-ink">{c.school.neighborsLabel}</p>
      <ul className="mt-2 space-y-1">
        {neighbors.map((n) => (
          <li key={n.school.slug}>
            <Link href={addLocalePrefix(schoolDistrictPagePath(n.school.slug), locale)} className="underline">
              {n.school.formalName}
            </Link>
            <span className="text-text-muted">（{n.chomes.join("、")}）</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


import Link from "next/link";
import type { LangCode } from "@/config/languages";
import type { PublicProperty } from "@/lib/property-shared";
import { getLocalizedProperty } from "@/lib/property-shared";
import { addLocalePrefix } from "@/lib/locale";
import { formatAccessL, formatPropertyPriceL, localizedImageAlt, propertyUi } from "@/lib/property-i18n";
import { SchoolDistrictTag } from "@/components/gakku/RentalSchoolDistrict";
import { PropertyImage } from "@/components/bukken/PropertyImage";
import { brokerFeeBadge, brokerFeeAmountLabel, brokerFeeOf } from "@/lib/broker-fee";

export function PropertyCard({ p, locale }: { p: PublicProperty; locale: LangCode }) {
  const original = p;
  p = getLocalizedProperty(p, locale);
  const hero = p.images[0];
  const ui = propertyUi(locale);
  return (
    <Link
      href={addLocalePrefix(`/bukken/${p.slug}`, locale)}
      data-property-id={p.slug}
      data-fee-type={brokerFeeOf(p) ?? "unknown"}
      className="flex flex-col gap-4 sm:flex-row rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
    >
      {hero ? (
        // 2026-09-23：128px の枠に元写真（最大3.8MB）を読み込んでいた。next/image で縮小配信する
        // 2026-09-28：固定幅なので sizes を付けない＝srcset は 1x/2x の2本（一覧のHTML肥大の是正）
        <PropertyImage
          src={hero.url}
          alt={localizedImageAlt(hero, p.title, locale)}
          width={128}
          height={96}
          className="h-24 w-32 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-surface-dim text-xs text-text-muted">
          No Image
        </div>
      )}
      <div className="min-w-0">
        <p className="flex flex-wrap gap-1 text-[10px]">
          <span className="rounded-full bg-primary-tint px-2 py-0.5 font-medium text-primary">
            {ui.dealType[p.dealType]}
          </span>
          <span className="rounded-full bg-surface-dim px-2 py-0.5 font-medium text-text-muted">
            {ui.tradeMode[p.tradeMode]}
          </span>
        </p>
        <SchoolDistrictTag property={original} locale={locale} />
        <h3 className="mt-1 break-words text-sm font-semibold text-ink">{p.title}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatPropertyPriceL(p, locale)}
          {brokerFeeBadge(p, locale) && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 align-middle text-[10px] font-semibold text-white">{brokerFeeBadge(p, locale)}</span>
          )}
        </p>
        {brokerFeeAmountLabel(p, locale) && <p className="mt-2 text-sm font-semibold text-primary">{brokerFeeAmountLabel(p, locale)}</p>}
        {p.spec.dealType === "rental" && <p className="mt-2 text-xs leading-6 text-text-muted">
          {ui.dealType.rental} · {p.spec.layout} · {p.spec.exclusiveAreaSqm}㎡<br />
          {{ ja: "管理費・共益費", en: "Management fee", "zh-tw": "管理費", zh: "管理费" }[locale]}：{p.spec.managementFee}<br />
          {p.spec.accessText}
        </p>}
        <p className="mt-0.5 break-words text-xs text-text-muted">{p.locationText}</p>
        {p.access[0] && (
          <p className="truncate text-xs text-text-muted">{formatAccessL(p.access[0], locale)}</p>
        )}
        <span className="mt-3 inline-block text-xs font-semibold text-primary underline">{{ ja: "物件詳細を見る", en: "View details", "zh-tw": "查看詳情", zh: "查看详情" }[locale]} →</span>
      </div>
    </Link>
  );
}


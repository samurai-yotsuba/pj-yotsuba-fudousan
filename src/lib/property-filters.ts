import type { PublicProperty } from "./property-shared";
import { brokerFeeOf, isDiscountedBrokerFee } from "./broker-fee";
import { rentalSchoolDistrict } from "./rental-school-district";
export type PropertyFilters = { fee?: string; school?: string; layout?: string; station?: string; pets?: string };
export function filterProperties(properties: PublicProperty[], f: PropertyFilters) {
  return properties.filter(p => {
    if (f.fee === "p033" && brokerFeeOf(p) !== "p033") return false;
    if (f.fee === "discount" && !isDiscountedBrokerFee(p)) return false;
    if (f.school) { const d = rentalSchoolDistrict(p); if (d?.status !== "determined" || d.school.slug !== f.school) return false; }
    if (f.layout && (p.spec.dealType !== "rental" || p.spec.layout !== f.layout)) return false;
    if (f.station && !p.access.some(a => a.station === f.station) && !(p.spec.dealType === "rental" && rentalStations(p).includes(f.station))) return false;
    if (f.pets) {
      if (p.spec.dealType !== "rental") return false;
      const terms = p.spec.conditions.normalize("NFKC");
      if (!/ペット(?:飼育)?(?:可|相談)|ペット飼育相談/.test(terms)) return false;
      if (f.pets === "multiple" && !/多頭(?:飼育)?(?:可|相談)|(?:2|3|二|三)匹(?:まで|可)/.test(terms)) return false;
    }
    return true;
  });
}
export function rentalStations(p: PublicProperty): string[] {
  return [...new Set([...p.access.map(a => a.station), ...(p.spec.dealType === "rental" ? [...p.spec.accessText.matchAll(/[「『]([^」』]+)[」』]駅/g)].map(m => m[1]) : [])])];
}

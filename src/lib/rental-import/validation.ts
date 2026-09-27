import { rentalSchoolDistrict } from "@/lib/rental-school-district";
import { createHash } from "node:crypto";
import { z } from "zod";
import { propertyInputSchema } from "@/lib/property-validation";
import { scanPropertyText, type PropertyInput } from "@/lib/property-shared";
import { brokerIncomeYen, extractAdEvidence, INCOME_THRESHOLD_YEN, isRecentMail, P033_INCOME_THRESHOLD_YEN, subtrackIncomeYen, SUBTRACK_INCOME_THRESHOLD_YEN } from "./candidates";
import { portalCheckSchema, summarizePortalChecks } from "./portal-counts";
import { evidenceSchema, titleHighlightSchema, validTitleHighlight, TITLE_HIGHLIGHT_LABELS, conditionChoiceSchema, rentEvidenceSchema, validRentEvidence, isPrimaryReference, RENTAL_IMPORT_POLICY, hasAdvertisingAllow, selectCondition, isCurrentEvidence } from "./policy";
import { contentReviewSchema, rentalContentDigest } from "./content-review";

export const listingEvidenceSchema = evidenceSchema.extend({
  authenticated: z.boolean(), siteOperational: z.boolean(), exactRoomMatched: z.boolean(),
});
export { isPrimaryReference } from "./policy";
export function validListingEvidence(evidence: z.infer<typeof listingEvidenceSchema>, provider: "itandi" | "reins" | "eslife", now: Date) {
  return evidence.authenticated && evidence.siteOperational && evidence.exactRoomMatched && isFresh(evidence.checkedAt, now) && isPrimaryReference(evidence.reference, provider);
}

export const rentalImportSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  /** Direct portal search is a separate intake route; never invent a mail record. */
  intake: z.object({
    kind: z.literal("portal-search"),
    /**
     * 新規登録は bunkyo-income800k（ITANDI・いい生活、手数料満額＋AD 80万円以上）、
     * または eslife-new-income400k（サブトラック：いい生活のみ、AD＋借主手数料 40万円超、手数料はアットホームと同じ）、
     * または bunkyo-p033-income300k（2026-09-27〜：ITANDI・いい生活、借主手数料0.33ヶ月で AD＋賃料×0.33 ≥ 30万円、写真付き）。
     * 旧方針は登録済み物件の再確認だけに使う。
     */
    policy: z.enum(["bunkyo-income800k", "eslife-new-income400k", "bunkyo-p033-income300k", "bunkyo-rent200k-ad30-or-rent250k"]),
    updateEvidence: listingEvidenceSchema,
  }).optional(),
  supportingDocuments: z.array(evidenceSchema).max(10).optional(),
  email: z.object({
    messageId: z.string().min(1), receivedAt: z.iso.datetime({ offset: true }), adQuote: z.string().min(1),
    senderDomain: z.string().trim().toLowerCase().optional(),
    advertising: z.object({
      status: z.enum(["allowed", "denied", "unknown"]),
      building: z.string().trim().min(1), address: z.string().trim().min(1), unit: z.string().trim().min(1),
      evidence: evidenceSchema,
    }).optional(),
  }).optional(),
  source: z.object({
    provider: z.enum(["itandi", "reins", "eslife", "other"]),
    roomId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
    url: z.url().startsWith("https://"),
    /** Provider ID alone cannot cross-match sites: require exact building + address + unit. */
    building: z.string().trim().min(1), address: z.string().trim().min(1), unit: z.string().trim().min(1),
    availability: z.enum(["available", "closed", "removed", "unknown"]),
    /** Early gate: an ITANJI application means the room must not be imported. */
    applicationStatus: z.enum(["not-applied", "applied", "unknown"]).optional(),
    checkedAt: z.iso.datetime({ offset: true }),
    listingEvidence: listingEvidenceSchema,
    rent: rentEvidenceSchema,
    adQuote: z.string().min(1),
    /** A single affirmative ITANJI advertising observation is sufficient. */
    advertising: z.object({ status: z.enum(["allowed", "denied", "unknown"]), evidence: evidenceSchema }).optional(),
    adValidUntil: z.iso.datetime({ offset: true }).optional(),
  }),
  /** Deprecated v1.1 evidence. Accepted only for migration of old drafts; never read for a v1.2 decision. */
  reins: z.object({
    propertyId: z.string().min(1), building: z.string().min(1), address: z.string().min(1), unit: z.string().min(1),
    advertising: z.enum(["allowed", "denied", "unknown"]),
    evidence: evidenceSchema,
    availability: z.enum(["available", "closed", "removed", "unknown"]),
    listingEvidence: listingEvidenceSchema,
    rent: rentEvidenceSchema,
  }).optional(),
  advertisingEvidence: z.array(z.object({
    provider: z.string().min(1), building: z.string().min(1), address: z.string().min(1), unit: z.string().min(1),
    status: z.enum(["allowed", "denied", "unknown"]), evidence: evidenceSchema,
  })).optional(),
  photoPermission: z.object({ status: z.enum(["allowed", "denied", "unknown"]), evidence: evidenceSchema }).optional(),
  conditionChoices: z.array(conditionChoiceSchema).optional(),
  titleHighlights: z.array(titleHighlightSchema).max(3).optional(),
  contentReview: contentReviewSchema.optional(),
  unconfirmedTerms: z.object({
    /** 2026-09-25: 更新料・契約期間・入居時期も社長指示で「未確認」表示を許可。 */
    fields: z.array(z.enum(["guaranteeDeposit", "insurance", "guarantor", "conditions", "renewalFee", "contractPeriod", "deliveryYm"])).min(1),
    operatorInstruction: z.literal("未確認です。未確認と書いてください。"),
    recordedAt: z.iso.datetime({ offset: true }),
  }).optional(),
  portalChecks: z.array(portalCheckSchema).optional(),
  /** Only unresolved conflicts block registration. Resolved comparisons retain their evidence. */
  conflicts: z.array(z.string()),
  property: propertyInputSchema,
});
export type RentalImport = z.infer<typeof rentalImportSchema>;
export type GateResult = { ok: true; value: RentalImport; property: PropertyInput } | { ok: false; reasons: string[] };
const DAY = 86_400_000;
export function rentalIdentity(source: Pick<RentalImport["source"], "building" | "address" | "unit">) {
  const norm = (s: string) => s.normalize("NFKC").replace(/\s/g, "").toLowerCase();
  return createHash("sha256").update(`${norm(source.address)}|${norm(source.building)}|${norm(source.unit)}`).digest("hex").slice(0, 24);
}
function same(a: string, b: string) { return a.normalize("NFKC").replace(/\s/g, "").toLowerCase() === b.normalize("NFKC").replace(/\s/g, "").toLowerCase(); }
export function jstDate(now: Date) { return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10); }
export const isFresh = isCurrentEvidence;

export function validateRentalImport(input: unknown, now: Date, mode: "draft" | "published" = "draft", maintenance = false): GateResult {
  const parsed = rentalImportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reasons: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  const v = parsed.data, reasons: string[] = [];
  // Reject applied rooms before any expensive detail, image, or condition work.
  if ((v.source.applicationStatus ?? "unknown") === "applied") reasons.push("ITANJIで申込済みのため対象外です");
  const legacyMigration = !!v.reins && !v.source.advertising && !(v.advertisingEvidence ?? []).some((a) => a.provider === "itandi");
  if (legacyMigration) {
    // Compatibility only: old saved drafts can be rechecked while the operator
    // migrates them. New records must supply ITANJI evidence explicitly.
    if (v.reins!.availability !== "available" || !validListingEvidence(v.reins!.listingEvidence, "reins", now)) reasons.push("旧形式のREINS根拠が期限切れです");
  }
  // SUUMO・アットホーム・HOME'Sは判定に使わない。REINSは広告可の確認だけ許可する。
  const directSearch = v.intake?.kind === "portal-search";
  const subtrackPolicy = directSearch && v.intake!.policy === "eslife-new-income400k";
  const p033Policy = directSearch && v.intake!.policy === "bunkyo-p033-income300k";
  const incomePolicy = directSearch && (v.intake!.policy === "bunkyo-income800k" || subtrackPolicy || p033Policy);
  if (directSearch) {
    const provider = v.source.provider;
    const evidence = v.intake!.updateEvidence;
    if (!maintenance && !incomePolicy) reasons.push("新規の直接検索は「仲介手数料＋AD 80万円以上」の方針で登録してください");
    if (subtrackPolicy && provider !== "eslife") reasons.push("サブトラック（40万円超）はいい生活の物件だけです");
    // Relative hours are copied from the search UI, not fabricated timestamps.
    const hours = [...evidence.quote.normalize("NFKC").matchAll(/募集条件更新\s*(\d+)\s*時間前/g)].map(m => Number(m[1]));
    if (!maintenance && !incomePolicy && (!(provider === "itandi" || provider === "eslife") || !validListingEvidence(evidence, provider, now)
      || hours.length !== 1 || hours[0] >= 24 || hours[0] * 3600_000 + now.getTime() - Date.parse(evidence.checkedAt) >= 24 * 3600_000)) reasons.push("取得元で24時間以内の募集条件更新を確認してください");
    if (!/^東京都\s*文京区/.test(v.source.address.normalize("NFKC"))) reasons.push("直接検索の対象エリアは文京区です");
    if (!incomePolicy && v.source.rent.yen < 200000) reasons.push("直接検索の賃料は20万円以上です");
  } else if (!v.email || (!maintenance && !isRecentMail(v.email.receivedAt, now))) reasons.push("メールが直近1暦月の対象外です");
  for (const [label, quote] of [...(!directSearch && v.email ? [["メール", v.email.adQuote]] : []), ["取得元", v.source.adQuote]]) {
    if (v.source.provider === "eslife" && label === "メール") continue;
    if (p033Policy && label === "取得元") {
      const fee = v.property.spec.dealType === "rental" ? v.property.spec.brokerFee : undefined;
      if (fee !== "p033") { reasons.push("写真付き個別掲載は借主の仲介手数料を0.33ヶ月に設定してください"); continue; }
      const income = subtrackIncomeYen(quote, v.source.rent.yen, "p033");
      if (income === null) reasons.push("取得元の掲載料条件を確定できません");
      else if (income < P033_INCOME_THRESHOLD_YEN) reasons.push(`ADと借主手数料（0.33ヶ月）の合計が30万円未満です（${income}円）`);
      continue;
    }
    if (subtrackPolicy && label === "取得元") {
      const fee = v.property.spec.dealType === "rental" ? v.property.spec.brokerFee : undefined;
      if (!fee) { reasons.push("サブトラックは借主の仲介手数料（満額・0.33ヶ月・無料）をアットホームと同じに設定してください"); continue; }
      const income = subtrackIncomeYen(quote, v.source.rent.yen, fee);
      if (income === null) reasons.push("取得元の掲載料条件を確定できません");
      else if (income <= SUBTRACK_INCOME_THRESHOLD_YEN) reasons.push(`ADと借主手数料の合計が40万円以下です（${income}円）`);
      continue;
    }
    if (incomePolicy && label === "取得元") {
      const income = brokerIncomeYen(quote, v.source.rent.yen);
      if (income === null) reasons.push("取得元の掲載料条件を確定できません");
      else if (income < INCOME_THRESHOLD_YEN) reasons.push(`仲介手数料（賃料×1.1）と掲載料の合計が80万円未満です（${income}円）`);
      continue;
    }
    const ads = extractAdEvidence(quote);
    const values = [...new Set(ads.map((a) => a.months))];
    const eslifeNoAdException = label === "取得元" && v.source.rent.yen >= 250000 && (directSearch || (v.source.provider === "eslife" && /AD\s*(?:なし|無|0)/i.test(quote)));
    const eslifeThreshold = (directSearch || v.source.provider === "eslife") && label === "取得元" ? 0.3 : 2;
    if (!eslifeNoAdException && (!ads.length || ads.some((a) => a.ambiguous || a.months === null || a.months < eslifeThreshold) || values.length !== 1)) reasons.push(`${label}の掲載料条件を確定できません`);
  }
  if (!(v.source.provider === "itandi" || v.source.provider === "eslife") || v.source.availability !== "available" || !validListingEvidence(v.source.listingEvidence, v.source.provider, now)) reasons.push("取得元で同一号室の現在の掲載を確認してください");
  if (!validRentEvidence(v.source.rent, v.source.provider === "eslife" ? "eslife" : "itandi", now)) reasons.push("取得元の賃料の原文と金額を確認してください");
  if (v.source.provider === "eslife") {
    if (!/^東京都\s*文京区/.test(v.source.address.normalize("NFKC"))) reasons.push("いい生活の対象エリアを文京区に限定してください");
    if (v.source.applicationStatus !== "not-applied") reasons.push("申込あり・申込不明のいい生活物件は掲載できません");
  }
  v.property.priceYen = legacyMigration ? Math.max(v.source.rent.yen, v.reins!.rent.yen) : v.source.rent.yen;
  if (legacyMigration && (!validRentEvidence(v.reins!.rent, "reins", now))) reasons.push("旧形式のREINS賃料根拠が不正です");
  if (!isFresh(v.source.checkedAt, now)) reasons.push("募集状況の確認が24時間以内ではありません");
  if (v.source.adValidUntil && Date.parse(v.source.adValidUntil) < now.getTime()) reasons.push("AD適用期限を過ぎています");
  const adEvidence = [
    ...(v.advertisingEvidence ?? []).filter((a) => a.provider === "itandi"),
    ...(v.advertisingEvidence ?? []).filter((a) => a.provider === "reins"),
    ...(v.source.advertising ? [{ ...v.source, provider: v.source.provider, status: v.source.advertising.status, evidence: v.source.advertising.evidence }] : []),
    ...(legacyMigration && v.reins ? [{ ...v.reins, provider: "reins", status: v.reins.advertising, evidence: v.reins.evidence }] : []),
    ...(v.email?.senderDomain === "ttfuhan.com" && v.email.advertising ? [{ ...v.email.advertising, provider: "email" }] : []),
  ];
  const adAllowed = adEvidence.some((a) => (a.provider === "itandi" || a.provider === "reins" || a.provider === "eslife" || a.provider === "email") && a.status === "allowed" && hasAdvertisingAllow(a.evidence.quote)
    && isFresh(a.evidence.checkedAt, now) && (["building", "address", "unit"] as const).every((key) => same(a[key], v.source[key])));
  if (!adAllowed) reasons.push("同一号室の広告可を東京建物メール、ITANJIまたはREINSで確認してください");
  const resolved = new Set<string>(), fields = new Set<string>();
  const decisions: { field: string; rule: string; selectedIndex: number; value: string }[] = [];
  for (const choice of v.conditionChoices ?? []) {
    if (fields.has(choice.field)) { reasons.push(`条件の比較が重複しています: ${choice.field}`); continue; }
    fields.add(choice.field);
    const result = selectCondition(choice, now);
    if (!result.ok) { reasons.push(result.reason); continue; }
    if (v.property.spec.dealType === "rental") {
      if (choice.field === "conditions") {
        const current = v.property.spec.conditions, from = choice.replace;
        if (!from) { reasons.push("conditions: 置換する条項をreplaceに指定してください"); continue; }
        const occurrences = (text: string) => current.split(text).length - 1;
        if (occurrences(from) === 1) v.property.spec.conditions = current.replace(from, () => result.value);
        // Publication checks run again against the already selected public text.
        else if (occurrences(from) !== 0 || occurrences(result.value) !== 1) { reasons.push("conditions: 置換する条項を一意に特定できません"); continue; }
      } else v.property.spec[choice.field] = result.value;
    }
    choice.resolves.forEach((c) => resolved.add(c));
    decisions.push({ field: choice.field, rule: choice.rule, selectedIndex: result.index, value: result.value });
  }
  if (v.conflicts.length) reasons.push(...v.conflicts.filter((c) => !resolved.has(c)).map((c) => `要確認: ${c}`));
  if (mode === "published") {
    const review = v.contentReview;
    if (!review || !isFresh(review.checkedAt, now) || review.digest !== rentalContentDigest(v.property)
    || (v.property.locales ?? ["ja"]).some((locale) => !review.locales.includes(locale))) reasons.push("採用後の条件と日本語本文・公開する各翻訳を照合し、contentReviewに記録してください");
  }
  if (v.property.dealType !== "rental" || v.property.spec.dealType !== "rental") reasons.push("賃貸物件のみ取込できます");
  if (!v.property.images.some((i) => i.kind === "photo") || !v.property.images.some((i) => i.kind === "floorplan")) reasons.push("写真と間取りが各1点以上必要です");
  const disclosedUnknown = (key: string, value: string) => !!v.unconfirmedTerms
    && (v.unconfirmedTerms.fields as string[]).includes(key) && value.includes("未確認");
  if (v.unconfirmedTerms && Date.parse(v.unconfirmedTerms.recordedAt) > now.getTime()) reasons.push("未確認表示の指示日時が未来です");
  if (v.property.spec.dealType === "rental") {
    for (const [key, value] of Object.entries(v.property.spec)) {
      if (typeof value === "string" && /入力なし|不明|未確認|要確認|確認中/.test(value) && !disclosedUnknown(key, value)) reasons.push(`賃貸条件が未確認です: ${key}`);
    }
  }
  if (!same(v.property.locationText, v.source.address)) reasons.push("公開所在地が照合元と一致しません");
  const highlights = v.titleHighlights ?? [];
  if (new Set(highlights.map(h => h.kind)).size !== highlights.length || highlights.some(h => !validTitleHighlight(h, now) || h.evidence.reference !== v.source.url)) reasons.push("物件名に入れる可条件をITANJIの同一物件の原文で確認してください");
  const titlePrefix = (["foreignResidents", "corporateLease", "pets"] as const).filter(kind => highlights.some(h => h.kind === kind)).map(kind => `【${TITLE_HIGHLIGHT_LABELS[kind]}】`).join("");
  if (!same(v.property.title.split(" ").join(""), `${titlePrefix}${v.source.building}${v.source.unit}`)) reasons.push("物件名・号室を照合元と一致させてください");
  if (v.source.provider === "itandi" && v.source.url !== `https://itandibb.com/rent_rooms/${v.source.roomId}`) reasons.push("ITANDIの部屋IDとURLが一致しません");
  if (v.source.provider === "eslife" && !isPrimaryReference(v.source.url, "eslife")) reasons.push("いい生活の物件URLを確認してください");
  if (v.property.spec.dealType === "rental" && !disclosedUnknown("guarantor", v.property.spec.guarantor) && !/不要|利用なし/.test(v.property.spec.guarantor) && !/[0-9０-９].*(?:円|%|％|ヶ月|か月)/.test(v.property.spec.guarantor)) reasons.push("保証会社の費用を確認してください");
  if (v.property.tradeMode !== "broker") reasons.push("自社の取引態様を媒介として確認してください");
  // Scan every public field including alt, translations, fees. Internal evidence is excluded deliberately.
  const { internal: _internal, ...publicData } = v.property;
  void _internal;
  const publicText = JSON.stringify({ ...publicData, slug: undefined, images: publicData.images.map(({ alt }) => ({ alt })) }).normalize("NFKC");
  const hits = scanPropertyText(publicText);
  if (/\bAD(?=[\s:：=0-9]|$)|広告費|業務委託料|\bREINS\b/i.test(publicText)) reasons.push("公開情報に業者間の広告料・取得元情報が含まれています");
  if (hits.length) reasons.push(`公開情報に禁止語・業者間情報があります: ${[...new Set(hits.map((h) => h.term))].join("、")}`);
  if (reasons.length) return { ok: false, reasons };
  const property: PropertyInput = {
    ...v.property, slug: `rent-${rentalIdentity(v.source)}`, status: mode,
    spec: { ...v.property.spec, ...(v.property.spec.dealType === "rental" ? { availabilityExpiresAt: new Date(Math.min(Date.parse(v.source.checkedAt), Date.parse(v.source.listingEvidence.checkedAt), ...(legacyMigration ? [Date.parse(v.reins!.listingEvidence.checkedAt)] : [])) + 26 * 3600_000).toISOString() } : {}) },
    infoUpdatedAt: jstDate(now), nextUpdateAt: jstDate(new Date(now.getTime() + DAY)),
    publishedAt: mode === "published" ? jstDate(now) : undefined,
    internal: { rentalImport: { version: 2, policy: RENTAL_IMPORT_POLICY, intake: v.intake, supportingDocuments: v.supportingDocuments, email: v.email, source: v.source, advertisingEvidence: v.advertisingEvidence, photoPermission: v.photoPermission, conditionChoices: v.conditionChoices, titleHighlights: v.titleHighlights, unconfirmedTerms: v.unconfirmedTerms, contentReview: v.contentReview, decisions, migration: v.reins ? { legacyReins: v.reins, legacyPortalChecks: summarizePortalChecks(v.portalChecks ?? []) } : undefined } },
  };
  // Audit the original address at intake. Public tags are recomputed from that
  // address so saved evidence or translations can never override the district.
  property.internal!.schoolDistrict = rentalSchoolDistrict(property);
  return { ok: true, value: v, property };
}

/** Read-only audit. Output excludes private addresses, names, prices and source IDs. */
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import type { AdminProperty } from "../src/lib/property-shared";
config({ path: ".env.local", quiet: true });
const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : "/private/tmp/fee033-data-audit.json";
if (!output) throw new Error("--output requires a filename");
const snapshotIndex = process.argv.indexOf("--snapshot");
const snapshotPath = snapshotIndex >= 0 ? process.argv[snapshotIndex + 1] : null;
if (snapshotIndex >= 0 && !snapshotPath) throw new Error("--snapshot requires a filename");
const limitedProjection = process.argv.includes("--limited-projection");
const readSource = snapshotPath ? "read-only-supabase-snapshot" : "prisma-read-only";


type JsonObject = Record<string, unknown>;
function object(value: unknown): JsonObject { return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function strings(value: unknown, path: string): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  return Object.entries(object(value)).flatMap(([key, v]) => strings(v, `${path}.${key}`));
}
function count<T>(items: T[], key: (item: T) => string) { const out: Record<string, number> = {}; for (const item of items) { const k = key(item); out[k] = (out[k] ?? 0) + 1; } return out; }
function permissionShape(p: AdminProperty) {
  const internal = object(p.internal), imported = object(internal.rentalImport), source = object(imported.source);
  const observed: { path: string; type: string; status: string | null }[] = [];
  for (const [path, value] of [
    ["internal.advertising", internal.advertising],
    ["internal.rentalImport.source.advertising", source.advertising],
    ["internal.rentalImport.advertisingEvidence", imported.advertisingEvidence],
    ["internal.rentalImport.email.advertising", object(imported.email).advertising],
    ["internal.rentalImport.migration.legacyReins.advertising", object(object(imported.migration).legacyReins).advertising],
  ] as const) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      const raw = typeof item === "string" ? item : object(item).status;
      const status = typeof raw === "string" && ["allowed", "denied", "unknown", "not-allowed", "contact-required"].includes(raw) ? raw : null;
      observed.push({ path, type: Array.isArray(value) ? "array" : typeof value, status });
    }
  }
  return observed;
}
/** Column names follow Prisma @map annotations. JSON spec/internal remain opaque. */
function snapshotProperty(value: unknown): AdminProperty {
  const row = object(value);
  for (const key of ["id", "slug", "status", "deal_type", "category", "trade_mode", "title", "location_text", "description", "info_updated_at", "next_update_at"]) {
    if (typeof row[key] !== "string") throw new Error("Invalid property snapshot column type");
  }
  const priceYen = Number(row.price_yen);
  if (!Number.isSafeInteger(priceYen) || priceYen < 0 || !row.spec || typeof row.spec !== "object") throw new Error("Invalid property snapshot numeric/spec type");
  return {
    id: row.id as string, slug: row.slug as string, status: row.status as AdminProperty["status"],
    dealType: row.deal_type as AdminProperty["dealType"], category: row.category as AdminProperty["category"], tradeMode: row.trade_mode as AdminProperty["tradeMode"],
    title: row.title as string, priceYen, priceNote: typeof row.price_note === "string" ? row.price_note : undefined,
    locationText: row.location_text as string, access: (row.access ?? []) as AdminProperty["access"], spec: row.spec as AdminProperty["spec"], images: (row.images ?? []) as AdminProperty["images"], description: row.description as string,
    publishedAt: typeof row.published_at === "string" ? row.published_at : undefined,
    infoUpdatedAt: row.info_updated_at as string, nextUpdateAt: row.next_update_at as string,
    locales: (row.locales ?? ["ja"]) as AdminProperty["locales"], translations: row.translations as AdminProperty["translations"],
    internal: row.internal as AdminProperty["internal"], createdAt: typeof row.created_at === "string" ? row.created_at : undefined, updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

async function run() {
  let disconnect: (() => Promise<void>) | undefined;
  try {
    const [shared, fees, feedModule, discoveryModule, identityModule] = await Promise.all([
      import("../src/lib/property-shared"), import("../src/lib/broker-fee"), import("../src/lib/school-rental-feed"), import("../src/lib/rental-discovery"), import("../src/lib/registered-rental-identity"),
    ]);
    let all: AdminProperty[];
    let rawFeeds: {provider:string;payload:unknown;checkedAt:Date}[];
    if (snapshotPath) {
      const snapshot = object(JSON.parse(await readFile(snapshotPath, "utf8")));
      if (!Array.isArray(snapshot.properties) || !Array.isArray(snapshot.feeds)) throw new Error("Invalid snapshot shape");
      all = snapshot.properties.map(snapshotProperty);
      rawFeeds = snapshot.feeds.map(value => {
        const row = object(value);
        if (typeof row.provider !== "string" || typeof row.checked_at !== "string") throw new Error("Invalid feed snapshot shape");
        return {provider:row.provider,payload:row.payload,checkedAt:new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(row.checked_at) ? row.checked_at : `${row.checked_at}Z`)};
      });
    } else {
      const [{ getProperties }, { prisma }] = await Promise.all([import("../src/lib/db/properties"), import("../src/lib/prisma")]);
      disconnect = () => prisma.$disconnect();
      // These are the only database operations: SELECT all properties and saved feeds.
      [all, rawFeeds] = await Promise.all([getProperties(), prisma.schoolRentalFeed.findMany()]);
    }
    const now = new Date();
    const visible = all.filter(p => shared.isPubliclyVisible(shared.toPublicProperty(p), "ja", now));
    const publicRentals = visible.filter(p => p.dealType === "rental");
    const feesOf = (p: AdminProperty) => fees.brokerFeeOf(shared.toPublicProperty(p)) ?? "unknown";
    const validFeeds = rawFeeds.flatMap(row => {
      const parsed = feedModule.feedSchema.safeParse(row.payload);
      return parsed.success && parsed.data.provider === row.provider && Date.parse(parsed.data.checkedAt) === row.checkedAt.getTime() ? [parsed.data] : [];
    });
    const identities = all.flatMap(p => { const i = identityModule.registeredRentalIdentity(p); return i ? [i] : []; });
    const compiled = feedModule.compileRentalSummaries(validFeeds, identities, now);
    const privateCounts = rawFeeds.length === validFeeds.length ? discoveryModule.compilePrivateSchoolCounts(validFeeds, identities, now) : null;
    const discovery = discoveryModule.compileRentalDiscovery(visible.map(shared.toPublicProperty), compiled.summaries, "ja", compiled.market.checkedAt, now, privateCounts);
    const candidates: unknown[] = [];
    for (const p of all.filter(p => p.dealType === "rental")) {
      const fee = feesOf(p);
      const fields = [ ...strings(p.description, "description"), ...strings(p.priceNote, "priceNote"), ...strings(p.translations, "translations"), ...strings(p.spec, "spec") ];
      for (const field of fields) {
        const normalized = field.text.normalize("NFKC");
        const clauses = normalized.split(/[。\n!?！？]/).filter(t => /仲介(?:手数料|料|費)|中介(?:手续费|费)|brokerage|commission/i.test(t));
        const mentions = new Set<string>();
        for (const clause of clauses) {
          if (/(?:0\.33\s*(?:ヶ月|か月|カ月|個月|个月|month)|0\.3\s*(?:ヶ月|か月|カ月|個月|个月|month))/i.test(clause)) mentions.add("p033");
          if (/(?:1(?:\.0|\.1)?\s*(?:ヶ月|か月|カ月|個月|个月|month)|one\s+month)/i.test(clause)) mentions.add("full");
          if (/無料|免費|免费|\bfree\b|no brokerage/i.test(clause)) mentions.add("free");
          if (/半額|半价|半價|half|0\.5\s*(?:ヶ月|か月|month)/i.test(clause)) mentions.add("half");
        }
        const conflicting = [...mentions].filter(m => m !== fee);
        if (conflicting.length) candidates.push({ ...(visible.includes(p) ? {slug:p.slug} : {adminId:p.id}), status:p.status, field:field.path, fee, conflictingMentions:conflicting, note:"機械抽出候補。計算比較・対象条件の文脈を人が確認するまで料金矛盾と断定しない。" });
      }
    }
    const observed = all.flatMap(p => permissionShape(p));
    const publicMissingEvidence = publicRentals.filter(p => !permissionShape(p).some(x => x.status === "allowed"));
    const publicNegativeEvidence = publicRentals.filter(p => { const x = permissionShape(p); return x.some(e => e.status === "denied" || e.status === "not-allowed") && !x.some(e => e.status === "allowed"); });
    const report = {
      outcome:"complete", readSource, auditedAt:now.toISOString(), readOnly:true,
      properties:{total:all.length,byStatus:count(all,p=>p.status),byDealType:count(all,p=>p.dealType),rentalFeeAllStatuses:count(all.filter(p=>p.dealType==="rental"),feesOf)},
      publicRentalFees:{total:publicRentals.length,p033:publicRentals.filter(p=>feesOf(p)==="p033").length,nonP033Known:publicRentals.filter(p=>!["p033","unknown"].includes(feesOf(p))).length,unknown:publicRentals.filter(p=>feesOf(p)==="unknown").length,byFee:count(publicRentals,feesOf)},
      feeContradictionCandidates:limitedProjection ? null : candidates,
      contentAuditScope:limitedProjection ? "Free text excluded from local snapshot; run server-side aggregate text audit separately." : "All local property text fields scanned for candidates.",
      schools:discovery.schools, schoolTotals:{public:discovery.totalPublicListings,p033:discovery.totalFee033Listings,updatedAt:discovery.updatedAt},
      feedAudit:{savedSnapshots:rawFeeds.length,validSnapshots:validFeeds.length,invalidSnapshots:rawFeeds.length-validFeeds.length,publicSummaryCount:compiled.summaries.length,excludedCount:compiled.excluded.length,privateEligibleCount:privateCounts?Object.values(privateCounts.counts).reduce((a,b)=>a+b,0):null},
      pageExamples:{p033:publicRentals.find(p=>feesOf(p)==="p033")?.slug??null,nonP033:publicRentals.find(p=>!["p033","unknown"].includes(feesOf(p)))?.slug??null},
      publicationBoundary:{permissionKeyTypes:count(observed,x=>`${x.path}:${x.type}:${x.status??"unrecognized"}`),publicWithoutRecognizedAllowedEvidenceCount:publicMissingEvidence.length,publicExplicitNegativeWithoutAllowedCount:publicNegativeEvidence.length,explicitNegativeAdminIds:publicNegativeEvidence.map(p=>p.id),limitation:"Manual publication is currently gated by status/locale rather than an advertising-permission check in getPublishedProperties. Missing recognized evidence does not prove advertising is prohibited; permission may use a legacy/manual representation. Review aggregate counts before changing publication."},
    };
    await writeFile(output, JSON.stringify(report,null,2)+"\n", {mode:0o600});
    console.log(JSON.stringify({outcome:report.outcome,output,totalProperties:all.length,publicRentalFees:report.publicRentalFees,feeCandidateCount:limitedProjection ? null : candidates.length,schoolTotals:report.schoolTotals,publicationEvidenceCounts:{missing:publicMissingEvidence.length,explicitNegative:publicNegativeEvidence.length}}));
  } catch (error) {
    // Do not print error.message: database connection strings/hosts and SQL values can appear there.
    const e = object(error);
    const safeCode = typeof e.code === "string" && /^[A-Z0-9_]{1,40}$/.test(e.code) ? e.code : null;
    const message = error instanceof Error ? error.message : "";
    const reason = /Can.t reach database server|connect|timed out|timeout|network/i.test(message) ? "database-connectivity" : /Environment variable not found|DATABASE_URL.*missing/i.test(message) ? "missing-database-environment" : /did not initialize|generate/i.test(message) ? "prisma-client-generation" : "initialization-or-query-error";
    const report = {outcome:"blocked",readSource,reason,auditedAt:new Date().toISOString(),readOnly:true,errorCode:safeCode,errorName:error instanceof Error?error.name:"UnknownError",note:"Read-only audit could not finish. Check generated Prisma Client and database connectivity; no database writes were attempted."};
    await writeFile(output, JSON.stringify(report,null,2)+"\n", {mode:0o600}); console.log(JSON.stringify({...report,output})); process.exitCode=1;
  } finally { await disconnect?.(); }
}
void run();

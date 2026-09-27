import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma, type Property as PropertyRow } from "@prisma/client";
import type { LangCode } from "@/config/languages";
import {
  toPublicProperty,
  isPubliclyVisible,
  isPropertyLocaleAllowed,
  getLocalizedProperty,
  type AdminProperty,
  type PublicProperty,
} from "@/lib/property-shared";

export { isPropertyLocaleAllowed, getLocalizedProperty };
export type { PublicProperty };

/**
 * 公開ページ用の物件取得（columns.ts と同型）。
 * 公開面へ渡す値は必ず toPublicProperty()（ホワイトリスト変換）を通す＝
 * internal（業者間情報）はこのモジュールから外に出ない。
 */

function rowToPublic(row: PropertyRow): PublicProperty {
  const admin: AdminProperty = {
    id: row.id,
    slug: row.slug,
    status: row.status,
    dealType: row.dealType,
    category: row.category,
    tradeMode: row.tradeMode,
    title: row.title,
    priceYen: Number(row.priceYen),
    priceNote: row.priceNote ?? undefined,
    locationText: row.locationText,
    access: (row.access as AdminProperty["access"]) ?? [],
    spec: row.spec as AdminProperty["spec"],
    images: (row.images as AdminProperty["images"]) ?? [],
    description: row.description,
    publishedAt: row.publishedAt ?? undefined,
    infoUpdatedAt: row.infoUpdatedAt,
    nextUpdateAt: row.nextUpdateAt,
    locales: row.locales as LangCode[],
    translations: (row.translations as AdminProperty["translations"]) ?? undefined,
    // internal は意図的に写さない（公開系へ持ち込まない）
  };
  return toPublicProperty(admin);
}

/**
 * properties テーブル未作成（`prisma migrate deploy` 前）のビルドを壊さないためのガード。
 * デプロイ順は「コードのデプロイ→マイグレーション適用」（浦松管理）であり、
 * PRプレビュー・マージ直後の本番ビルドはテーブルが無い状態で generateStaticParams・
 * sitemap・一覧のプリレンダーを実行する（2026-09-01 Vercelプレビューで P2021 を実測）。
 * P2021（テーブル不存在）だけを空扱いに落とし、それ以外のエラーはそのまま投げる。
 * マイグレーション適用後は次の revalidate / ビルドで自動的に通常動作へ戻る。
 */
function isPropertiesTableMissing(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021"
  );
}

/** 公開中（published）の物件一覧。現在ロケールで公開されているもののみ */
export const getPublishedProperties = cache(
  async (locale: LangCode): Promise<PublicProperty[]> => {
    try {
      const rows = await prisma.property.findMany({
        where: { status: "published" },
        orderBy: { infoUpdatedAt: "desc" },
      });
      return rows.map(rowToPublic).filter((p) => isPubliclyVisible(p, locale));
    } catch (err) {
      if (isPropertiesTableMissing(err)) return [];
      throw err;
    }
  },
);

/** sitemap.ts・generateStaticParams 専用（全ロケール横断・published のみ） */
export const getAllPublishedPropertiesAllLocales = cache(
  async (): Promise<PublicProperty[]> => {
    try {
      const rows = await prisma.property.findMany({
        where: { status: "published" },
        orderBy: { infoUpdatedAt: "desc" },
      });
      return rows.map(rowToPublic).filter((p) => isPubliclyVisible(p));
    } catch (err) {
      if (isPropertiesTableMissing(err)) return [];
      throw err;
    }
  },
);

/**
 * 詳細ページ用。公開判定（isPubliclyVisible）を満たす物件だけを返す。
 * closed（募集終了）・draft・未知のslugはすべて undefined＝ページ側 notFound() で
 * 実HTTP 404（本番で未知slugが通常UA・bingbotとも404になることを2026-09-20に実測）。
 * 410は proxy で毎リクエストDBを引く必要があるため採用しない。DBの closed 履歴は管理側に残る。
 */
export const getPublicPropertyBySlug = cache(
  async (slug: string): Promise<PublicProperty | undefined> => {
    try {
      const row = await prisma.property.findFirst({ where: { slug, status: "published" } });
      if (!row) return undefined;
      const p = rowToPublic(row);
      return isPubliclyVisible(p) ? p : undefined;
    } catch (err) {
      if (isPropertiesTableMissing(err)) return undefined;
      throw err;
    }
  },
);

/** Closed rentals retain a safe navigation page, never their old advertising details. */
export const getClosedRentalNavigation = cache(async (slug: string) => {
  try {
    const row = await prisma.property.findFirst({ where: { slug, status: "closed", dealType: "rental" }, select: { slug: true, locales: true, locationText: true } });
    if (!row) return null;
    const { rentalSchoolDistrict } = await import("./rental-school-district");
    const district = rentalSchoolDistrict({ dealType: "rental", locationText: row.locationText });
    return { slug: row.slug, locales: row.locales as LangCode[], schoolSlug: district?.status === "determined" ? district.school.slug : null };
  } catch (error) { if (isPropertiesTableMissing(error)) return null; throw error; }
});

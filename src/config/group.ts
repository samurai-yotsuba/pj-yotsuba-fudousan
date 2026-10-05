import { SR_OFFICE_NAME } from "@/lib/shared/sr-name";

export type NavItem = { href: string; label: string };

// Canonical host for cross-site navigation, including visits from a tenant alias domain.
export const GROUP_SITE_ORIGIN = "https://luck428.com";

/** public/yotsuba の元画像寸法。h固定/w-autoのロゴ領域を読み込み前から確保する。 */
export const groupLogoDimensions = {
  realestate: { horizontal: { width: 2601, height: 713 }, square: { width: 1741, height: 1410 } },
  legal: { horizontal: { width: 3900, height: 713 }, square: { width: 3246, height: 1410 } },
  labor: { horizontal: { width: 5020, height: 713 }, square: { width: 3520, height: 1410 } },
} as const;

export const groupBusinesses = [
  {
    key: "realestate",
    name: "四葉不動産",
    nameEn: "Real Estate",
    description: "不動産賃貸・売買・管理",
    href: "/",
    pathPrefix: "/",
    /** このテナントに紐づくドメイン（複数可） */
    domains: ["luck428.com", "www.luck428.com"],
    external: false,
    logo: {
      square: "/yotsuba/realestate-square.png",
      horizontal: "/yotsuba/realestate-horizontal.png",
    },
    nav: [
      { href: "/services", label: "サービス" },
      { href: "/about", label: "会社概要" },
      { href: "/column", label: "コラム" },
      { href: "/contact", label: "お問い合わせ" },
    ] as NavItem[],
  },
  {
    key: "legal",
    name: "四葉行政書士事務所",
    nameEn: "Administrative Scrivener",
    description: "補助金・助成金申請、在留資格・ビザ、法務手続き",
    href: "/legal",
    pathPrefix: "/legal",
    domains: ["luck428gyosei.com", "www.luck428gyosei.com"],
    external: false,
    logo: {
      square: "/yotsuba/legal-square.png",
      horizontal: "/yotsuba/legal-horizontal.png",
    },
    nav: [
      { href: "/legal", label: "サービス" },
      { href: "/legal/about", label: "事務所概要" },
      { href: "/legal/column", label: "コラム" },
      { href: "/legal/contact", label: "お問い合わせ" },
    ] as NavItem[],
  },
  // 社労士：SR_LAUNCHED=true（開業日・2026年9月）まで配列に含めない
  // ＝ヘッダーGroupSwitcher・フッターのグループ事業グリッド等へ一切露出しない（社労士法27条対策）。
  // /labor維持（2026-07-09浦松決定）・旧yotsuba-labor.comドメインは使わない（domains空）。
  ...(process.env.NEXT_PUBLIC_SR_LAUNCHED === "true"
    ? [
        {
          key: "labor",
          name: SR_OFFICE_NAME, // 事務所名は実行時結合（法27条ソース漏れ対策＝sr-name.ts参照）
          nameEn: "Certified Social Insurance and Labor Consultant (Sharoushi)",
          description: "障害福祉・介護の労務、処遇改善加算、雇用助成金",
          href: "/labor",
          pathPrefix: "/labor",
          domains: [] as string[],
          external: false,
          logo: {
            square: "/yotsuba/labor-square.png",
            horizontal: "/yotsuba/labor-horizontal.png",
          },
          nav: [
            { href: "/labor/services", label: "サービス" },
            { href: "/labor/about", label: "事務所概要" },
            { href: "/labor/column", label: "コラム" },
            { href: "/labor/contact", label: "お問い合わせ" },
          ] as NavItem[],
        },
      ]
    : []),
];

/** ホスト名からテナントを判定 */
export function getBusinessByHost(
  host: string,
): (typeof groupBusinesses)[number] {
  const hostname = host.split(":")[0]; // ポート番号を除去

  // ドメインマッチ
  for (const biz of groupBusinesses) {
    if ((biz.domains as readonly string[]).includes(hostname)) return biz;
  }

  // localhost開発用: legal.localhost → legal
  const sub = hostname.split(".")[0];
  if (sub === "legal") return groupBusinesses[1];
  // TODO: 社労士開業（2026年9月）後に復活
  // if (sub === "labor") return groupBusinesses[2];

  // デフォルト: 不動産
  return groupBusinesses[0];
}

/** パスからテナントを判定 */
export function getBusinessByPath(pathname: string) {
  for (const biz of groupBusinesses) {
    if (biz.pathPrefix !== "/" && pathname.startsWith(biz.pathPrefix)) {
      return biz;
    }
  }
  return groupBusinesses[0];
}

export const groupBrand = {
  name: "四葉グループ",
  nameEn: "YOTSUBA GROUP",
} as const;

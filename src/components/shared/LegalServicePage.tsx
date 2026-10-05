// LegalServicePage — 行政書士 型A業務ページの共通シェル
// 各業務ページ（visa/inheritance/company/subsidy…）はこのシェルにデータ＋本文を渡すだけ。
// 差し替えるのは：slug（→URL・/hero/legal-<slug>-16x9.webp）・meta（各ページのexport）・h1・lead・faq・internalLinks・children（H2群）。
// JSON-LD＝Service（BreadcrumbListは<Breadcrumb>部品が出力・FAQPageは/legal/faq専用）。クロスリンクはpathで自動（getCrossLinks）。
// 本番配置＝src/components/shared/LegalServicePage.tsx。※flagship shogai-fukushi は全部入り版を別途保持。
// 2026-07-11 ロケール保持（診断_ロケール保持リンク_v1 §B-6）：async化し、シェルが直接描画する
//   internalLinks の素Linkのみ addLocalePrefix（ここで1回だけ付与）。Breadcrumb/CtaBand/CrossLinkBanner
//   は各部品が自前付与＝シェルでは触らない（二重適用禁止）。Service JSON-LD の url は接頭辞なし維持（診断§C-3）。
import type { LangCode } from "@/config/languages";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRequestLocale } from "@/lib/getRequestLocale";
import { addLocalePrefix } from "@/lib/locale";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CtaBand, type CtaBandVariant } from "@/components/shared/CtaBand";
import { CrossLinkBanner } from "@/components/shared/CrossLinkBanner";
import { getCrossLinks } from "@/lib/cross-links";
import { SR_LAUNCHED } from "@/lib/shared/office";
import { PERSON_ID } from "@/lib/seo";
import { SR_BIO } from "@/lib/shared/sr-label";

const SITE = "https://luck428.com";

// Shared shell text was still Japanese on translated service pages.
const SHELL_COPY: Record<LangCode, { home: string; services: string; area: string; related: string; author: string; authorAlt: string; bio: string }> = {
  ja: {
    home: "ホーム", services: "業務案内",
    area: "対応エリア：東京都内。手続の窓口・運用は自治体ごとに異なるため、着手時に管轄の窓口で確認します。",
    related: "このページの関連リンク", author: "この記事の著者",
    authorAlt: "四葉行政書士事務所 代表 浦松丈二",
    bio: `浦松 丈二｜四葉行政書士事務所 代表行政書士（登録番号 第25087022号）・宅地建物取引士。元毎日新聞中国総局長（記者歴34年）。${SR_BIO.ja}。`,
  },
  en: {
    home: "Home", services: "Services",
    area: "Service area: Tokyo. Procedures vary by municipality; we confirm with the relevant office before starting.",
    related: "Related links", author: "About the author",
    authorAlt: "Joji Uramatsu, representative of 四葉行政書士事務所",
    bio: `Joji Uramatsu | Representative gyoseishoshi at 四葉行政書士事務所 (registration no. 25087022) and licensed real estate transaction specialist. Former China bureau chief of the Mainichi Shimbun, with 34 years in journalism. ${SR_BIO.en}.`,
  },
  "zh-tw": {
    home: "首頁", services: "業務介紹",
    area: "服務區域：東京都內。手續窗口及作業方式因自治體而異，開始辦理時將向管轄窗口確認。",
    related: "本頁相關連結", author: "本文作者",
    authorAlt: "四葉行政書士事務所 代表 浦松丈二",
    bio: `浦松丈二｜四葉行政書士事務所 代表行政書士（登錄編號 第25087022號）・宅地建物取引士。曾任每日新聞中國總局長，新聞工作資歷34年。${SR_BIO.zhTw}。`,
  },
  zh: {
    home: "首页", services: "业务介绍",
    area: "服务区域：东京都内。手续窗口及办理方式因自治体而异，开始办理时将向管辖窗口确认。",
    related: "本页相关链接", author: "本文作者",
    authorAlt: "四葉行政書士事務所 代表 浦松丈二",
    bio: `浦松丈二｜四葉行政書士事務所 代表行政书士（登记编号 第25087022号）・宅地建物取引士。曾任每日新闻中国总局长，新闻工作经历34年。${SR_BIO.zh}。`,
  },
};

export type ServiceQA = { q: string; a: string };
export type LegalServicePageProps = {
  slug: string; // "visa" 等
  crumbLabel: string; // パンくず末尾＝ページ名
  serviceName: string; // JSON-LD Service name
  heroAlt: string;
  /**
   * ヒーロー画像の明示指定（任意）。省略時は従来どおり `/hero/legal-${slug}-16x9.webp`。
   * 専用画像が未制作のページで既存画像を暫定共用するために追加（2026-07-25・既存呼び出し元の出力は不変）。
   */
  heroSrc?: string;
  h1: string;
  lead: ReactNode; // 結論（回答ファースト）
  internalLinks: { href: string; label: string }[];
  /**
   * CtaBandバリアント（2026-07-24 CTA刷新v2）。"property"=物件条件／"company"=会社設立インテーク（4ロケール）。
   * 文言解決はCtaBand内部で行う。
   */
  ctaVariant?: CtaBandVariant;
  /**
   * CTAの相談カテゴリプリセット（2026-07-27）。CtaBandのintentへそのまま渡す。
   * 値は contact-intake.ts の CATEGORY_ORDER_BY_BUSINESS.legal のキー。
   */
  ctaIntent?: string;
  /** CTA見出しの上書き（2026-07-27）。省略時はvariant→テナント既定 */
  ctaHeading?: string;
  /** CTAリード文の上書き（2026-07-27）。省略時はvariant→テナント既定 */
  ctaSubtext?: string;
  children: ReactNode; // H2セクション群（疑問文H2＝表示のみ・FAQPageは/faq専用）
};

export async function LegalServicePage(p: LegalServicePageProps) {
  const locale = await getRequestLocale();
  const copy = SHELL_COPY[locale];
  const path = `/legal/services/${p.slug}`;
  const url = SITE + path;
  const crossLinks = getCrossLinks(path, SR_LAUNCHED);

  // BreadcrumbList は <Breadcrumb> 部品が出力（二重出力を避ける）。FAQPage は /legal/faq 専用
  // （型Aの疑問文H2は表示のみ＝本文とFAQPage回答文の不一致を避ける）。
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // GovernmentService は「政府が提供する行政サービス」の型であり、行政書士事務所の
        // 申請支援業務には誤用（SEO監査2026-08-24 P0-3）＝全ページ Service に統一
        "@type": "Service",
        "@id": url + "#service",
        name: p.serviceName,
        provider: { "@id": SITE + "/legal/#organization" },
        author: { "@id": PERSON_ID },
        areaServed: "東京都",
        url,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb
        items={[
          { name: copy.home, href: "/legal" },
          { name: copy.services, href: "/legal/services" },
          { name: p.crumbLabel },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 pb-16">
        {/* ヒーロービジュアル（slug で決まる） */}
        {/* 2026-09-23：素の img で1600pxを配信しLCPが最大5.6秒（モバイル）。next/image で画面幅に合わせて縮小する */}
        <Image
          src={p.heroSrc ?? `/hero/legal-${p.slug}-16x9.webp`}
          alt={p.heroAlt}
          width={1600}
          height={900}
          className="mt-3 w-full rounded-2xl object-cover"
          sizes="(min-width: 768px) 736px, calc(100vw - 32px)"
          quality={60}
          loading="eager"
          fetchPriority="high"
          preload
        />

        {/* 結論・回答ファースト */}
        <header className="pt-4">
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{p.h1}</h1>
          <div className="mt-4 leading-relaxed text-text">{p.lead}</div>
        </header>

        {/* 本文 H2 群 */}
        <section className="mt-8 space-y-8">{p.children}</section>

        <p className="mt-8 text-sm text-text-muted">
          {copy.area}
        </p>

        {/* 内部リンク束（サイロ内・コンパクト） */}
        <nav aria-label={copy.related} className="mt-8 rounded-xl border border-border bg-surface p-4 text-sm">
          <div className="font-medium text-ink">{copy.related}</div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-primary">
            {p.internalLinks.map((l) => (
              <li key={l.href}>
                <Link href={addLocalePrefix(l.href, locale)} className="underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* クロスリンク（事業間・独立受任注記＝pathで自動） */}
        {crossLinks.map((c) => (
          <CrossLinkBanner key={c.id} link={c} />
        ))}

        {/* 署名（E-E-A-T） */}
        <aside className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <img src="/staff/uramatsu-square.webp" alt={copy.authorAlt} width={48} height={48} className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
          <p className="text-xs leading-relaxed text-text-muted">
            <strong>{copy.author}</strong> {copy.bio}
          </p>
        </aside>
      </article>

      <div className="mx-auto max-w-3xl px-4">
        <CtaBand
          businessKey="legal"
          variant={p.ctaVariant}
          intent={p.ctaIntent}
          heading={p.ctaHeading}
          subtext={p.ctaSubtext}
        />
      </div>
    </>
  );
}

/** H2セクションの見出し（本文内で使い回す） */
export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-xl font-semibold text-ink">{children}</h2>;
}

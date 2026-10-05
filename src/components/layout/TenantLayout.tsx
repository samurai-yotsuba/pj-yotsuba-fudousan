"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { addLocalePrefix, stripLocalePrefix } from "@/lib/locale";
import { Menu, X, CalendarDays, ChevronDown } from "lucide-react";
import { groupBusinesses, groupLogoDimensions, GROUP_SITE_ORIGIN } from "@/config/group";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { GroupSwitcher } from "@/components/ui/GroupSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { tenantThemeVars } from "@/lib/tenant-theme";
import { gaEvent } from "@/lib/gtag";
import { normalizePath } from "@/lib/normalize-path"; // cross-links直importはC7文言のクライアント同梱を招くため禁止
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { LinkaFab } from "@/components/shared/LinkaFab";
import { footerSrRegistration } from "@/lib/shared/footer-sr-registration";
import contactStyles from "@/components/shared/ContactCta.module.css";
import { SR_LAUNCHED, type BusinessKey } from "@/lib/shared/office";
import { SR_OFFICE_NAME, SR_OFFICE_NAME_ZH_TW, SR_OFFICE_NAME_ZH } from "@/lib/shared/sr-name"; // 事務所名は実行時結合（法27条ソース漏れ対策）
import type { LangCode } from "@/config/languages";
import type { ColumnLocaleIndex } from "@/lib/column-language-links";
import {
  SERVICE_NAV_CATEGORIES,
  SERVICE_NAV_FEATURES,
  SERVICE_NAV_UTILITY_LINKS,
  resolveNavLabel,
  isNavLinkVisible,
} from "@/config/services-nav"; // 「サービス」メガメニュー・アコーディオンの単一ソース（ヘッダー・フッター・/servicesページ共通）

type NavItem = { href: string; label: string };
type FooterSection = { title: string; links: NavItem[] };

/** テナントごとのナビ href 定義（言語に依存しない） */
// labels＝コード内直書きラベル（4ロケール）。指定時はFirestore t() より優先（新キーをFirestoreに増やさない運用）
const NAV_HREFS: Record<string, { href: string; key: string; labels?: Record<string, string> }[]> = {
  realestate: [
    { href: "/services", key: "services" },
    // 2026-09-16浦松指示：物件1件目の公開に伴い「取扱物件」をヘッダー最上段へ（それまで /toushi 本文からの1本のみで到達不能に近かった）。
    // コード内4ロケールラベル（B1の教訓＝Firestoreに新キーを増やさない）。/bukken は同日に4ロケール公開＝locales制限なし。
    { href: "/bukken", key: "bukken", labels: { ja: "取扱物件", en: "Properties", "zh-tw": "銷售物件", zh: "在售房源" } },
    // 2026-09-22：学区特集（区の通学区域の一次データ）。取扱物件の隣に置く。
    { href: "/gakku", key: "gakku", labels: { ja: "学区から探す", en: "School districts", "zh-tw": "依學區尋找", zh: "按学区查找" } },
    { href: "/about", key: "about" },
    { href: "/column", key: "column" },
    // 2026-07-10浦松指示：コラムの後にアクセス（/access・コード内4ロケールラベル）
    { href: "/access", key: "access", labels: { ja: "アクセス", en: "Access", "zh-tw": "交通位置", zh: "交通位置" } },
    { href: "/contact", key: "contact" },
  ],
  legal: [
    // TODO: 社労士開業（2026年9月）後に復活
    // { href: "/legal", key: "home" },
    // 2026-07-10浦松指示：①1番目=障害福祉（主力業務への直行） ②2番目=報酬額表（ラベルはFirestore legal.nav.services）
    { href: "/legal/services/shogai-fukushi", key: "shogaiFukushi", labels: { ja: "障害福祉", en: "Disability Welfare", "zh-tw": "障礙福祉", zh: "残障福祉" } },
    { href: "/legal/ryokin", key: "services" },
    { href: "/legal/about", key: "about" },
    { href: "/legal/column", key: "column" },
    // B4（2026-07-10浦松承認）：/legal内の問い合わせ導線はテナント内 /legal/contact へ
    { href: "/legal/contact", key: "contact" },
  ],
  // 社労士：ページ自体が SR_LAUNCHED=false の間は404（(labor)/layout.tsx）＝ここは labor ページ表示時のみ使われる
  labor: [
    { href: "/labor/services", key: "services" },
    { href: "/labor/ryokin", key: "fees", labels: { ja: "料金", en: "Fees", "zh-tw": "費用", zh: "费用" } },
    { href: "/labor/about", key: "about" },
    { href: "/labor/column", key: "column" },
    // B4：/labor/contact ページ実在（src/app/(labor)/labor/contact/page.tsx）＝テナント内導線へ
    { href: "/labor/contact", key: "contact" },
  ],
};

/** テナントごとのフッターナビ href 定義 */
const FOOTER_NAV_HREFS: Record<
  string,
  {
    sectionKey: string;
    // titleLabels＝コード内直書き4ロケール（items[].labelsと同方式）。未指定時はFirestore t()に
    // フォールバック（既存の legal/labor セクションはこれまで通りFirestore依存のまま）。
    titleLabels?: Record<string, string>;
    // labels＝コード内直書き4ロケール（NAV_HREFSと同方式）。Firestoreに新キーを増やさず、
    // 未定義キーで t() が生キー文字列を返して表示される事故も防ぐ（B1の教訓）。
    // locales＝このリンク先が実在するロケール（未指定＝全4ロケール）。config/services-nav.tsの
    // ServiceNavLink.localesと同じ考え方＝sitemap.tsのStaticPage.localesと必ず一致させる。
    items: { href: string; key: string; labels?: Record<string, string>; locales?: LangCode[] }[];
  }[]
> = {
  realestate: [
    // 2026-07-23：ヘッダーのメガメニュー化にあわせてフッターも3カラム→4カラムに再編（設計書§設計②）。
    // 旧「サービス」列4項目が全て/servicesへの同一リンクだった不具合を解消＝各リンクが実ページに接続。
    // カテゴリ・ロケール可用性は config/services-nav.ts と揃える（新設ピラーの多くはja先行公開）。
    {
      sectionKey: "inheritance",
      titleLabels: { ja: "相続・グループホーム開設", en: "Inheritance & Group Homes", "zh-tw": "繼承・團體家屋開設", zh: "继承・团体家屋开设" },
      items: [
        { href: "/souzoku", key: "souzokuGuide", labels: { ja: "相続不動産ガイド", en: "Inherited property guide", "zh-tw": "繼承不動產指南", zh: "继承不动产指南" } },
        {
          href: "/souzoku/akiya",
          key: "akiya",
          labels: { ja: "空き家の売却・活用", "zh-tw": "空屋的出售・活用", zh: "空置房屋的出售・活用" },
          locales: ["ja", "zh-tw", "zh"],
        },
        // 2026-09-23：売りにくい土地・建物の出口相談（/wakeari・ja先行公開）。「相続した不動産」の隣（指示書 v2.0 7-1）。services-nav.ts と同じ locales。
        { href: "/wakeari", key: "wakeari", labels: { ja: "売りにくい土地・建物" }, locales: ["ja"] },
        { href: "/group-home", key: "groupHome", labels: { ja: "グループホーム開設ガイド", en: "Group home opening guide", "zh-tw": "團體家屋開設指南", zh: "团体家屋开设指南" } },
        // 2026-09-24：大家募集ページ（貸す側の受け皿）。ja先行公開＝sitemap.ts の locales:["ja"] と一致
        { href: "/group-home/ooya", key: "groupHomeOoya", labels: { ja: "グループホーム向け物件を貸したい方へ" }, locales: ["ja"] },
      ],
    },
    {
      sectionKey: "business",
      titleLabels: { ja: "投資・事業用不動産", en: "Investment & Business Use", "zh-tw": "投資・事業用不動產", zh: "投资・事业用不动产" },
      items: [
        { href: "/toushi", key: "toushiGuide", labels: { ja: "投資・事業用 総合", en: "Investment & business overview", "zh-tw": "投資・事業用 總覽", zh: "投资・事业用 总览" } },
        { href: "/kaigo", key: "kaigo", labels: { ja: "介護事業所の開業" }, locales: ["ja"] },
        {
          href: "/toushi",
          key: "openingSupport",
          labels: {
            ja: "民泊・飲食店・会社設立",
            en: "Business openings: care homes, minpaku, restaurants, company setup",
            "zh-tw": "民宿・餐飲店・公司設立",
            zh: "民宿・餐饮店・公司设立",
          },
        },
      ],
    },
    {
      sectionKey: "global",
      titleLabels: { ja: "外国人・基本業務", en: "International & Everyday Services", "zh-tw": "外國人・基本業務", zh: "外国人・基本业务" },
      items: [
        { href: "/global", key: "foreignResidents", labels: { ja: "外国人の部屋探し", en: "Room hunting for international residents", "zh-tw": "外國人租屋・找房", zh: "外国人租房・找房" } },
        { href: "/global/chinese", key: "chinese", labels: { ja: "中国語相談", "zh-tw": "中文諮詢", zh: "中文咨询" }, locales: ["ja", "zh-tw", "zh"] },
        // 2026-09-05 月次点検（INIT-06）：海外オーナー・出国前の売却入口。/leaving-japan は4ロケール実在（sitemap.ts locales未指定）＝locales未指定。
        {
          href: "/leaving-japan",
          key: "leavingJapan",
          labels: { ja: "出国前の不動産売却", en: "Selling before leaving Japan", "zh-tw": "出國前的不動產出售", zh: "出国前的不动产出售" },
        },
        // 2026-07-11修正の踏襲：基本業務（賃貸・売買・管理）は/servicesへ集約（表現規程＝コンサル型方針）
        { href: "/services", key: "management", labels: { ja: "賃貸・売買・管理", en: "Rental, Sale & Management", "zh-tw": "租賃・買賣・管理", zh: "租赁・买卖・管理" } },
        // 2026-09-16浦松指示：取扱物件（/bukken・4ロケール）を基本業務の隣へ。ヘッダー NAV_HREFS と表記統一
        { href: "/bukken", key: "bukken", labels: { ja: "取扱物件", en: "Properties", "zh-tw": "銷售物件", zh: "在售房源" } },
        { href: "/gakku", key: "gakku", labels: { ja: "学区から探す", en: "School districts", "zh-tw": "依學區尋找", zh: "按学区查找" } },
      ],
    },
    {
      sectionKey: "company",
      titleLabels: { ja: "会社情報・その他", en: "Company & More", "zh-tw": "公司資訊・其他", zh: "公司信息・其他" },
      items: [
        { href: "/about", key: "about" },
        { href: "/voices", key: "voices", labels: { ja: "お客様の声", en: "Client testimonials", "zh-tw": "客戶心聲", zh: "客户心声" } },
        { href: "/column", key: "column" },
        // タスクC-5（2026-07-19）：相談事例（モデルケース）。ja先行公開（sitemap/availableLocalesとも["ja"]）。
        { href: "/jirei", key: "jirei", labels: { ja: "相談事例", en: "Case Studies", "zh-tw": "諮詢案例", zh: "咨询案例" }, locales: ["ja"] },
        { href: "/faq", key: "faq", labels: { ja: "よくある質問", en: "FAQ", "zh-tw": "常見問題", zh: "常见问题" } },
        // タスクB-1（2026-07-19）：料金ページ新設。2026-07-20（翻訳チェック§B）で en/zh-tw/zh を追加。
        { href: "/ryokin", key: "ryokin", labels: { ja: "料金", en: "Fees", "zh-tw": "費用", zh: "费用" } },
        // 2026-09-05 月次点検（INIT-06/NEW-SALE-1）：孤立していた /nagare を料金の隣へ。ja先行（sitemap.ts locales:["ja"]・services-nav.ts の SERVICE_NAV_UTILITY_LINKS と同じ）。
        { href: "/nagare", key: "nagare", labels: { ja: "ご依頼から引渡しまでの流れ" }, locales: ["ja"] },
        // 2026-07-10浦松指示のラベルをNAV_HREFSから踏襲（ヘッダー・フッターで表記統一）
        { href: "/access", key: "access", labels: { ja: "アクセス", en: "Access", "zh-tw": "交通位置", zh: "交通位置" } },
        { href: "/contact", key: "contact", labels: { ja: "お問い合わせ", en: "Contact", "zh-tw": "聯絡我們", zh: "联系我们" } },
        // sectionKeyを"other"→"company"に変更したためFirestoreキーパス変更＝コード内ラベル必須（B1の教訓）
        { href: "/legal-notice", key: "legalNotice", labels: { ja: "特定商取引法表記", en: "Legal Notice", "zh-tw": "特定商交易法標示", zh: "特定商交易法标示" } },
      ],
    },
  ],
  legal: [
    {
      sectionKey: "services",
      items: [
        // 2026-07-11修正：全4項目が /legal（トップ）向きで個別ページに繋がっていなかったため実ページへ張り替え。
        // あわせて主力（障害福祉・相続）をフッターに追加（浦松承認）。ラベルはコード内4ロケール直書き。
        {
          href: "/legal/services/shogai-fukushi",
          key: "shogaiFukushi",
          labels: { ja: "障害福祉", en: "Disability Welfare", "zh-tw": "障礙福祉", zh: "残障福祉" },
        },
        {
          href: "/legal/services/inheritance",
          key: "inheritance",
          labels: { ja: "相続・遺言", en: "Inheritance & Wills", "zh-tw": "繼承・遺囑", zh: "继承・遗嘱" },
        },
        { href: "/legal/services/subsidy", key: "subsidy" },
        { href: "/legal/services/visa", key: "visa" },
        { href: "/legal/services/company", key: "incorporation" },
        // 許認可の専用ページは無く、会社設立ページが「会社設立・許認可」を包含（浦松承認）
        { href: "/legal/services/company", key: "permits" },
      ],
    },
    {
      sectionKey: "office",
      items: [
        { href: "/legal/about", key: "about" },
        { href: "/legal/voices", key: "voices", labels: { ja: "お客様の声", en: "Client testimonials", "zh-tw": "客戶心聲", zh: "客户心声" } },
        { href: "/legal/column", key: "column" },
      ],
    },
    {
      sectionKey: "other",
      // B4：legalテナント内の問い合わせは /legal/contact（実在ページ）へ
      items: [{ href: "/legal/contact", key: "contact" }],
    },
  ],
  // 社労士：ページ自体が SR_LAUNCHED=false の間は404＝laborページ表示時のみ使われる
  labor: [
    {
      sectionKey: "services",
      items: [
        { href: "/labor/services#standalone-services", key: "socialInsurance" },
        { href: "/labor/services/joseikin", key: "subsidy" },
        { href: "/labor/ryokin#work-rules", key: "rules" },
        { href: "/labor/services#payroll", key: "payroll" },
      ],
    },
    {
      sectionKey: "office",
      items: [
        { href: "/labor/about", key: "about" },
        { href: "/labor/voices", key: "voices", labels: { ja: "お客様の声", en: "Client testimonials", "zh-tw": "客戶心聲", zh: "客户心声" } },
        { href: "/labor/column", key: "column" },
      ],
    },
    {
      sectionKey: "other",
      // B4：laborテナント内の問い合わせは /labor/contact（実在ページ）へ
      items: [{ href: "/labor/contact", key: "contact" }],
    },
  ],
};

/**
 * B1（2026-07-10浦松承認）：フッター独立受任注記のコード内4ロケール直書き。
 * Firestore側キー（common.footer.independentNote）が未定義のとき t() はキー文字列を
 * 返す（truthy）ため `||` フォールバックが不発＝生キーが表示されていた。Firestoreに
 * 依存せず、labelsパターンと同じくコード内ロケールマップで表示する。
 * 社労士事務所名は連続リテラル禁止（法27条ソース漏れ対策）＝SR_OFFICE_NAMEで実行時結合。
 * 開業（SR_LAUNCHED=true・2026-09-01）で「（2026年9月開業予定）」の注記が外れる。
 * この注記は**全ページのフッター**に出るため、開業後も残ると
 * サイト全体が「まだ開業していない」と言い続けることになる（2026-08-31 に発見して是正）。
 */
/** 開業前だけ事務所名のうしろに付く注記。開業後は空文字。 */
const SR_PENDING_NOTE: Record<string, string> = SR_LAUNCHED
  ? { ja: "", en: "", "zh-tw": "", zh: "" }
  : {
      ja: "（2026年9月開業予定）",
      en: " (opening September 2026)",
      "zh-tw": "（預定2026年9月開業）",
      zh: "（预定2026年9月开业）",
    };

const INDEPENDENT_NOTE: Record<string, string> = {
  ja: `四葉不動産株式会社・四葉行政書士事務所・${SR_OFFICE_NAME}${SR_PENDING_NOTE.ja}は、それぞれ独立した事業体として業務を受任します。`,
  en: `Yotsuba Real Estate Co., Ltd., Yotsuba Gyoseishoshi (Administrative Scrivener) Office, and Yotsuba Sharoushi (Certified Social Insurance and Labor Consultant) Office${SR_PENDING_NOTE.en} operate as independent business entities, each accepting engagements separately.`,
  // 中文でも事務所名の連続リテラルは書けないため実行時結合の定数を挿入する。
  // zh-tw／zh はそれぞれの字体の事務所名を使う（翻訳DBの labor.name と一致させた）。
  "zh-tw": `四葉不動產株式會社、四葉行政書士事務所、${SR_OFFICE_NAME_ZH_TW}${SR_PENDING_NOTE["zh-tw"]}為各自獨立之事業體，分別承接業務。`,
  zh: `四葉不動産株式会社、四葉行政书士事务所、${SR_OFFICE_NAME_ZH}${SR_PENDING_NOTE.zh}为各自独立的事业体，分别承接业务。`,
};

/**
 * 「サービス」メガメニュー（デスクトップ・realestateテナント専用）。
 * ホバーで開閉しつつ、クリックでもトグル可能にする（キーボード・タッチ操作がホバーのみに依存しないため）。
 * カテゴリ・子ページ・ロケール可用性は config/services-nav.ts を単一ソースとして参照する。
 */
function ServicesMegaMenu({
  label,
  isActive,
  locale,
}: {
  label: string;
  isActive: boolean;
  locale: LangCode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  }, [cancelClose]);

  // Escapeで閉じる／外側クリックで閉じる（ホバーのみに依存しないa11y対応）
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="services-mega-menu"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className={`header-nav-link relative flex items-center gap-1 px-4 py-2 text-base font-medium transition-colors duration-200 ${
          isActive || open ? "header-nav-active" : "text-text-muted"
        }`}
      >
        {label}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        <span
          className={`gradient-line absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
            isActive ? "w-4/5" : "w-0"
          }`}
        />
      </button>

      {open && (
        <div
          id="services-mega-menu"
          className="fixed inset-x-0 top-16 z-40 sm:top-20"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-3 rounded-2xl border border-border bg-surface p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {SERVICE_NAV_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={cat.hubHref}
                      onClick={() => setOpen(false)}
                      className="text-sm font-bold text-ink transition-colors hover:text-primary-dark"
                    >
                      {resolveNavLabel(cat.categoryLabel, locale)}
                    </Link>
                    <ul className="mt-3 space-y-2.5">
                      {cat.children
                        .filter((child) => isNavLinkVisible(child, locale))
                        .map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className="text-sm text-text-muted transition-colors hover:text-primary-dark"
                            >
                              {resolveNavLabel(child.label, locale)}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* 4カテゴリの外のサービス（/pet-housing など）。補助リンクの列より目立つ1段で出す */}
              {SERVICE_NAV_FEATURES.filter((feature) => isNavLinkVisible(feature, locale)).map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  onClick={() => setOpen(false)}
                  className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-primary/30 bg-primary-tint px-4 py-3 transition-colors hover:border-primary/60"
                >
                  <span className="text-sm font-bold text-ink">{resolveNavLabel(feature.label, locale)}</span>
                  <span className="text-xs text-text-muted">{resolveNavLabel(feature.description, locale)}</span>
                </Link>
              ))}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4">
                {SERVICE_NAV_UTILITY_LINKS.filter((link) => isNavLinkVisible(link, locale)).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-xs font-medium text-text-muted transition-colors hover:text-primary-dark"
                  >
                    {resolveNavLabel(link.label, locale)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 「サービス」アコーディオン（モバイルメニュー内・realestateテナント専用）。
 * タップで4カテゴリ＋子ページを一覧展開する（デスクトップのメガメニューと同じ情報構造をリスト形式で踏襲）。
 */
function ServicesMobileAccordion({
  label,
  isActive,
  locale,
  style,
  onNavigate,
}: {
  label: string;
  isActive: boolean;
  locale: LangCode;
  style?: React.CSSProperties;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={style}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="services-mobile-accordion"
        onClick={() => setOpen((v) => !v)}
        className={`header-nav-link flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
          isActive ? "bg-primary/5 header-nav-active" : "text-text-muted hover:bg-surface-dim"
        }`}
      >
        <span className="inline-flex items-center">
          {isActive && <span className="gradient-line mr-2 h-4 w-0.5 rounded-full" />}
          {label}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id="services-mobile-accordion" className="mt-1 space-y-4 py-2 pl-4">
          {SERVICE_NAV_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <Link
                href={cat.hubHref}
                onClick={onNavigate}
                className="block text-xs font-bold tracking-wide text-text-muted"
              >
                {resolveNavLabel(cat.categoryLabel, locale)}
              </Link>
              <ul className="mt-1.5 space-y-1">
                {cat.children
                  .filter((child) => isNavLinkVisible(child, locale))
                  .map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        className="block rounded-md px-2 py-1.5 text-sm text-text hover:bg-surface-dim"
                      >
                        {resolveNavLabel(child.label, locale)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          {SERVICE_NAV_FEATURES.filter((feature) => isNavLinkVisible(feature, locale)).map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              onClick={onNavigate}
              className="block rounded-lg border border-primary/30 bg-primary-tint px-3 py-2"
            >
              <span className="block text-sm font-bold text-ink">{resolveNavLabel(feature.label, locale)}</span>
              <span className="block text-xs text-text-muted">{resolveNavLabel(feature.description, locale)}</span>
            </Link>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
            {SERVICE_NAV_UTILITY_LINKS.filter((link) => isNavLinkVisible(link, locale)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className="text-xs font-medium text-text-muted underline-offset-2 hover:underline"
              >
                {resolveNavLabel(link.label, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TenantHeader({ businessKey, columnLocales }: { businessKey: string; columnLocales: ColumnLocaleIndex }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rawPathname = usePathname();
  // ロケールセグメント（/ja 含む）を剥がしてから使う。剥がさないとナビのアクティブ判定が
  // 全ロケールで不一致になる（2026-09-02・言語スイッチャー二重ロケール是正と同根）。
  const pathname = stripLocalePrefix(rawPathname);
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const biz = groupBusinesses.find((b) => b.key === businessKey)!;
  const logoDimensions = groupLogoDimensions[businessKey as BusinessKey];

  const allNav = useMemo(() => {
    const hrefs = NAV_HREFS[businessKey] ?? [];
    return hrefs.map((h) => ({
      href: h.href,
      label: h.labels?.[locale] ?? h.labels?.ja ?? t(`${businessKey}.nav.${h.key}`),
    }));
  }, [businessKey, t, locale]);

  // B4：contactのhrefはテナントごとに /contact・/legal/contact・/labor/contact と異なるため末尾一致で判定
  const navItems = allNav.filter((n) => !n.href.endsWith("/contact"));
  const contactItem = allNav.find((n) => n.href.endsWith("/contact"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ページ遷移時にメニューを閉じる。
  // useEffect 内の同期 setState（react-hooks/set-state-in-effect）を避けるため、
  // React 公式の「値の変更に合わせてレンダー中に state を調整する」パターンを使う。
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      const hasChildNavItem = navItems.some(
        (n) => n.href !== href && n.href.startsWith(href + "/"),
      );
      if (hasChildNavItem) return pathname === href;
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname, navItems],
  );

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "header-border-gradient bg-surface/50 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="relative z-50 flex shrink-0 items-center gap-2">
            <div className="hidden md:block">
              <GroupSwitcher />
            </div>
            <Link href={biz.href} className="flex items-center">
              <Image
                src={biz.logo.horizontal}
                alt={t(`${businessKey}.name`)}
                width={logoDimensions.horizontal.width}
                height={logoDimensions.horizontal.height}
                sizes={businessKey === "labor" ? "(min-width: 640px) 395px, (min-width: 370px) 282px, calc(100vw - 88px)" : businessKey === "realestate" ? "(min-width: 640px) 205px, 146px" : "(min-width: 640px) 307px, 219px"}
                className={businessKey === "labor" ? "h-auto w-[min(282px,calc(100vw-88px))] sm:h-14 sm:w-auto" : "h-10 w-auto sm:h-14"}
                priority
              />
            </Link>
          </div>

          <nav
            className={`hidden items-center gap-1 ${businessKey === "labor" ? "xl:flex" : businessKey === "realestate" ? "lg:flex" : "md:flex"}`}
            aria-label={t("common.navigation.mainNav")}
          >
            {navItems.map(({ href, label }) =>
              businessKey === "realestate" && href === "/services" ? (
                <ServicesMegaMenu key={href} label={label} isActive={isActive(href)} locale={locale} />
              ) : (
                <Link
                  key={href}
                  href={href}
                  className={`header-nav-link relative px-4 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive(href) ? "header-nav-active" : "text-text-muted"
                  }`}
                >
                  {label}
                  <span
                    className={`gradient-line absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                      isActive(href) ? "w-4/5" : "w-0"
                    }`}
                  />
                </Link>
              ),
            )}

            <div className="ml-2 border-l border-border pl-3">
              <LanguageSwitcher columnLocales={columnLocales} />
            </div>

            {contactItem && (
              <Link
                href={contactItem.href}
                className="cta-gradient-outline ml-3 px-5 py-2 text-base font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <span className="cta-gradient-text">{contactItem.label}</span>
              </Link>
            )}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-site-menu"
            className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-text transition-colors hover:bg-surface-dim ${businessKey === "labor" ? "xl:hidden" : businessKey === "realestate" ? "lg:hidden" : "md:hidden"}`}
            aria-label={
              isOpen
                ? t("common.navigation.closeMenu")
                : t("common.navigation.openMenu")
            }
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${businessKey === "labor" ? "xl:hidden" : businessKey === "realestate" ? "lg:hidden" : "md:hidden"} ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <nav
        id="mobile-site-menu"
        inert={!isOpen}
        aria-label={t("common.navigation.mobileMenu")}
        className={`fixed right-0 top-0 z-40 flex h-full w-[min(18rem,85vw)] flex-col bg-surface pt-16 shadow-2xl transition-transform duration-300 ease-out sm:pt-20 ${businessKey === "labor" ? "xl:hidden" : businessKey === "realestate" ? "lg:hidden" : "md:hidden"} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-1">
            {navItems.map(({ href, label }, i) =>
              businessKey === "realestate" && href === "/services" ? (
                <ServicesMobileAccordion
                  key={href}
                  label={label}
                  isActive={isActive(href)}
                  locale={locale}
                  style={{ transitionDelay: isOpen ? `${i * 50}ms` : "0ms" }}
                  onNavigate={() => setIsOpen(false)}
                />
              ) : (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`header-nav-link flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive(href)
                      ? "bg-primary/5 header-nav-active"
                      : "text-text-muted hover:bg-surface-dim"
                  }`}
                  style={{ transitionDelay: isOpen ? `${i * 50}ms` : "0ms" }}
                >
                  {isActive(href) && (
                    <span className="gradient-line mr-2 h-4 w-0.5 rounded-full" />
                  )}
                  {label}
                </Link>
              ),
            )}
          </div>
          <section aria-labelledby="mobile-group-sites-title" className="mt-4 border-t border-border pt-4">
            <h2 id="mobile-group-sites-title" className="px-4 text-xs font-semibold text-text-muted">
              {t("common.navigation.groupSites")}
            </h2>
            <ul className="mt-2 space-y-1">
              {groupBusinesses.filter((other) => other.key !== businessKey).map((other) => (
                <li key={other.key}>
                  <a
                    href={`${GROUP_SITE_ORIGIN}${addLocalePrefix(other.href, locale)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-14 items-center rounded-lg px-4 py-3 text-sm font-medium leading-relaxed text-text hover:bg-surface-dim"
                  >
                    {t(`${other.key}.name`)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://www.samurai.co.jp/"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-14 items-center rounded-lg px-4 py-3 text-sm font-medium leading-relaxed text-text hover:bg-surface-dim"
                >
                  {t("common.footer.samuraiName")}
                </a>
              </li>
            </ul>
          </section>
        </div>
        {/* 下部固定バー(64px・z-40)に隠れないよう底上げ（言語切替＋お問い合わせを可視域に） */}
        <div className="shrink-0 border-t border-border px-4 py-4 pb-[88px]">
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher columnLocales={columnLocales} />
          </div>
          {contactItem && (
            <Link
              href={contactItem.href}
              onClick={() => setIsOpen(false)}
              className="cta-gradient-outline flex w-full items-center justify-center px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <span className="cta-gradient-text">{contactItem.label}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

function TenantFooter({ businessKey }: { businessKey: string }) {
  const currentYear = new Date().getFullYear();
  const biz = groupBusinesses.find((b) => b.key === businessKey)!;
  const logoDimensions = groupLogoDimensions[businessKey as BusinessKey];
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const pathname = usePathname();

  // いい相続バナーの表示判定（下の「Legal」ブロック末尾で使う）。
  // フッターは共通部品のため、条件を付けないと legal テナントの全ページに出る。
  // 浦松指示（2026-08-07）により /legal トップの1ページだけに限定する。
  // ・businessKey === "legal"：宅建業・社労士のフッターには出さない（業法分離）
  // ・locale === "ja"：先方指定のアンカーテキストが日本語固定
  // ・normalizePath(...) === "/legal"：locale接頭辞を除いたパスがトップ本体のときのみ。
  //   末尾スラッシュは Next.js の trailingSlash 既定（false）により付かないが、
  //   将来の設定変更に備えて許容しておく。
  const isISozokuBadgeVisible =
    businessKey === "legal" &&
    locale === "ja" &&
    ["/legal", "/legal/"].includes(normalizePath(pathname ?? "/"));

  const footerSections: FooterSection[] = useMemo(() => {
    const defs = FOOTER_NAV_HREFS[businessKey] ?? [];
    return defs.map((section) => ({
      // titleLabels（コード内4ロケール）を優先し、無ければ従来どおりFirestore t()。
      title:
        section.titleLabels?.[locale] ??
        section.titleLabels?.ja ??
        t(`${businessKey}.footerNav.${section.sectionKey}.title`),
      links: section.items
        // locales未指定＝全ロケール表示。指定時は現在ロケールが含まれる項目のみ（存在しないページへのリンクを出さない）
        .filter((item) => !item.locales || item.locales.includes(locale))
        .map((item) => ({
          href: item.href,
          // labels（コード内4ロケール）を優先し、無ければFirestore t()。ヘッダー（allNav）と同方式。
          label:
            item.labels?.[locale] ??
            item.labels?.ja ??
            t(`${businessKey}.footerNav.${section.sectionKey}.${item.key}`),
        })),
    }));
  }, [businessKey, t, locale]);

  return (
    <footer className="defer-footer text-text">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8">
        <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="shrink-0">
            <Link href={biz.href} className="inline-block">
              <Image
                src={biz.logo.square}
                alt={t(`${businessKey}.name`)}
                width={logoDimensions.square.width}
                height={logoDimensions.square.height}
                sizes={`${Math.ceil(112 * logoDimensions.square.width / logoDimensions.square.height)}px`}
                className="h-28 w-auto"
              />
            </Link>
            <p className="cta-gradient-text mt-1 text-xs font-medium tracking-[0.15em]">
              {t(`${businessKey}.tagline`)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              {t(`${businessKey}.footerDescription1`)}
              <br />
              {t(`${businessKey}.footerDescription2`)}
            </p>
            <address className="mt-4 text-xs not-italic leading-relaxed text-text-muted">
              {t("address.postalCode")}
              <br />
              {t("address.full")}
            </address>
            <div className="mt-3 text-xs text-text-muted">
              {/* 2026-08-14：フッターの電話は全ページに出るのに未計測だった。
                  tel: リンク7か所のうち計測されていたのは CtaBandActions と
                  MobileStickyBar の2か所だけで、GA4の cta_tel_click が28日間0件
                  だった主因はここ。location で押された場所を分けて記録する。 */}
              <a
                href={`tel:${t("address.phone")}`}
                onClick={() => gaEvent("cta_tel_click", { location: "footer" })}
                className="hover:text-text"
              >
                TEL: {t("address.phone")}
              </a>
            </div>

            {/* SNS + Booking */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.facebook.com/uramatsujoji"
                target="_blank"
                rel="noopener noreferrer"
                // 2026-07-29 浦松指示：SNSアイコンを各サービスのブランド色にする。
                // hover時は枠線を色に合わせ、地をごく薄い同系色にする（アイコン色は変えない）。
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-[#1877F2] transition-colors hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5"
                aria-label="Facebook"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/uramatsu_joji/"
                target="_blank"
                rel="noopener noreferrer"
                // Instagramの公式マークはグラデーションだが、9pxの枠に収める小サイズでは
                // 判別しづらいため、公式パレットの中核色 #E4405F（単色）を用いる。
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-[#E4405F] transition-colors hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5"
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://note.com/luck428"
                target="_blank"
                rel="noopener noreferrer"
                // note のブランド色 #41C9B4
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-[#41C9B4] transition-colors hover:border-[#41C9B4]/40 hover:bg-[#41C9B4]/5"
                aria-label="note"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.195 2.641c-1.2-.499-4.063-.46-6.309.122-2.274.588-4.208 1.66-4.208 1.66s-.09-.2-.539-.408c-.449-.207-1.382-.525-2.792-.37-1.41.156-3.143.922-4.49 2.34C2.51 7.402 1.744 9.899 1.57 11.562c-.175 1.664-.07 3.463.384 5.105.455 1.643 1.34 3.296 2.782 4.348 1.443 1.053 3.092 1.186 4.544.922 1.452-.264 2.78-.886 3.812-1.584 1.032-.698 1.827-1.335 2.272-1.776l.145-.148c.184.24.414.46.694.64.96.617 2.12.563 2.963.32.843-.243 1.53-.65 2.083-1.095.553-.446.963-.916 1.248-1.29.284-.374.4-.605.4-.605l-1.462-.8s-.085.15-.306.43a5.831 5.831 0 01-.927.891c-.372.284-.817.533-1.322.662-.505.129-1.122.126-1.53-.137-.188-.122-.33-.287-.445-.504l7.395-3.62s.16-.7.108-1.874c-.054-1.175-.302-2.764-1.188-4.186-.887-1.423-2.188-2.18-3.35-2.577-1.163-.397-2.166-.517-2.902-.524-.737-.008-1.21.065-1.21.065s1.17-.713 2.872-1.196c1.702-.483 3.954-.56 5.26-.2l-.194-1.671zm-7.597 7.106c.485.033.937.12 1.312.275.75.308 1.278.828 1.636 1.418.358.59.55 1.247.652 1.835l-6.543 3.202c-.098-.39-.16-.8-.175-1.252-.028-.831.1-1.83.448-2.73.348-.9.876-1.72 1.575-2.254.485-.37 1.095-.494 1.095-.494z" />
                </svg>
              </a>
              <a
                href="https://www.samurai.co.jp/samurai/reserve/uramatsu-joji"
                target="_blank"
                rel="noopener noreferrer"
                // 「予約」は士業ドットコムの予約ページへ遷移する自社導線のため、
                // 外部SNSのブランド色ではなくテナントの主色（--color-primary）を用いる。
                // route group が割り当てる値を読むのでテナント非依存（不動産＝緑系／行政書士＝別色）。
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-primary-dark transition-colors hover:border-primary/40 hover:bg-primary/5"
                aria-label={t("common.footer.samuraiName")}
              >
                <CalendarDays size={16} />
                <span className="text-xs font-medium">
                  {t("common.booking")}
                </span>
              </a>
            </div>
          </div>

          {/* realestate＝4カラム（設計書§設計②）／legal・labor＝既存3カラムのまま（回帰なし） */}
          <div
            className={`grid grid-cols-2 gap-8 ${
              footerSections.length >= 4 ? "sm:grid-cols-4 sm:gap-8" : "sm:grid-cols-3 sm:gap-12"
            }`}
          >
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-bold tracking-wide text-text">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map(({ href, label }, i) => {
                    // Native anchors also scroll when the same fragment is clicked again.
                    const isLaborAnchor = businessKey === "labor" && href.includes("#");
                    const FooterLink = isLaborAnchor ? "a" : Link;
                    return <li key={`${href}-${i}`}>
                      <FooterLink
                        href={isLaborAnchor ? addLocalePrefix(href, locale) : href}
                        className="group inline-flex max-w-full items-center text-sm text-text-muted transition-colors duration-200"
                      >
                        <span className="gradient-line mr-2 inline-block h-px w-0 transition-all duration-200 group-hover:w-3" />
                        <span className="footer-link-text min-w-0 [overflow-wrap:anywhere]">{label}</span>
                      </FooterLink>
                    </li>;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Group businesses */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="text-center text-[10px] font-medium tracking-[0.3em] text-text-muted">
            {t("brand.groupNameEn")}
          </p>
          <p className="mt-1 text-center text-sm font-bold">
            {t("brand.groupName")}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {groupBusinesses.map((b) => {
              const isCurrent = b.key === businessKey;
              const inner = (
                <div
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isCurrent
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-surface hover:border-primary/30 hover:bg-surface-dim"
                  }`}
                >
                  <Image
                    src={b.logo.square}
                    alt={t(`${b.key}.name`)}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">
                      {t(`${b.key}.name`)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {isCurrent
                        ? t("common.currentSite")
                        : t(`${b.key}.description`)}
                    </p>
                  </div>
                </div>
              );
              if (isCurrent) return <div key={b.key}>{inner}</div>;
              return (
                <Link key={b.key} href={b.href}>
                  {inner}
                </Link>
              );
            })}
          </div>
          {/* 独立受任注記（業法分離＝ページ割v2 §3-3）。B1：Firestoreに頼らずコード内4ロケールで表示 */}
          <p className="mt-4 text-center text-[10px] leading-relaxed text-text-muted">
            {INDEPENDENT_NOTE[locale] ?? INDEPENDENT_NOTE.ja}
          </p>
        </div>
      </div>

      {/* SAMURAI */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-medium tracking-[0.2em] text-text-muted">
            {t("common.footer.managedServices")}
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <a
              href="https://www.samurai.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-text/5 text-lg font-bold text-text/60">
                S
              </div>
              <div>
                <p className="text-sm font-bold">
                  {t("common.footer.samuraiName")}
                </p>
                <p className="mt-0.5 text-[10px] text-text-muted">
                  {t("common.footer.samuraiDescription")}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-[11px] font-medium text-text-muted">
            {t("common.footer.legalHeadquartersLine")}
          </p>
          <div className="mt-3 space-y-1 text-[10px] leading-relaxed text-text-muted">
            <p>{t("common.footer.realestateRegistration")}</p>
            <p>{t("common.footer.realestateRepRegistration")}</p>
            <p>{t("common.footer.legalRepRegistration")}</p>
            {/* 公開後は3事業共通で代表個人の登録表示。DBに旧試験合格文が残っても併記しない。 */}
            {SR_LAUNCHED ? (
              <p className="break-words">{footerSrRegistration(locale)}</p>
            ) : t("representative.srExamNote") ? (
              <p>{t("representative.srExamNote")}</p>
            ) : null}
          </div>

          {/* いい相続（株式会社鎌倉新書・東証プライム 6184）との相互リンク
              ── 2026-08-07 いい相続運営事務局／山﨑氏の設置手順PPTに基づき設置（浦松指示）。
              ・バナー＝先方指定4パターンのうち①「いい相続掲載士業」（白）。
                「掲載」は掲載の事実のみを述べる控えめな表記（浦松選択 2026-08-07）。
              ・リンク先＝いい相続内の当事務所ページ。lib/seo.ts の LEGAL_SAME_AS と同一URL。
              ・画像は先方ホストのバッジを先方指定のまま参照する（先方が更新した場合に追随させるため／
                先方の設置確認も同URLで行われる）。ローカルへ複製しない。
              ・表示条件＝isISozokuBadgeVisible（この関数の先頭で算出）。
                legal テナント／ja／パスが /legal トップ本体、の3条件すべて。
                フッターは共通部品のため、条件を付けないと legal 配下の全ページに出る。
                浦松指示（2026-08-07）によりトップ1ページだけに限定している。
              ・配置＝資格表記の直下（浦松指示 2026-08-07）。
                相談導線より前に外部サイトへの出口を置かない。先方PPTは位置・大きさを指定していない。
              ・rel は noopener のみ。nofollow を付けない（相互リンクの趣旨を損なうため）。
                noreferrer も付けない（先方側で当サイトからの流入を計測できるようにするため）。 */}
          {isISozokuBadgeVisible && (
            <div className="mt-6">
              <a
                href="https://www.i-sozoku.com/detail/oid1000790/"
                target="_blank"
                rel="noopener"
                className="inline-flex flex-col items-center gap-2 text-[11px] text-text-muted"
              >
                <img
                  src="https://www.i-sozoku.com/wp-content/themes/i-sozoku/images/badge/keisai-white.png"
                  alt="当事務所は「いい相続」に掲載されています"
                  width={110}
                  height={110}
                  loading="lazy"
                  decoding="async"
                />
                <span className="underline">当事務所は「いい相続」に掲載されています</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className={`mx-auto flex max-w-7xl flex-col flex-wrap items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8 ${contactStyles.footerEnd}`}>
          <p className="text-xs text-text-muted">
            &copy; {currentYear} {t("common.footer.copyright")}
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <Link
              href="/privacy-policy"
              className="group/legal transition-colors duration-200"
            >
              <span className="footer-link-text">
                {t("common.footer.privacyPolicy")}
              </span>
            </Link>
            <Link
              href="/terms"
              className="group/legal transition-colors duration-200"
            >
              <span className="footer-link-text">
                {t("common.footer.terms")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function TenantLayoutShell({
  businessKey,
  columnLocales,
  children,
}: {
  businessKey: BusinessKey;
  columnLocales: ColumnLocaleIndex;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 【1ページ1LINKA】不動産トップ（各locale含む）は本文の60秒診断がLINKA＝FABを出さない
  const isRealestateTop =
    businessKey === "realestate" && normalizePath(pathname ?? "/") === "/";
  return (
    // A-2: テナント主色を route group 単位で --color-primary に割当（fixed子要素にも継承）
    <div style={tenantThemeVars(businessKey)}>
      <TenantHeader businessKey={businessKey} columnLocales={columnLocales} />
      {/* pb: SPの固定バー（MobileStickyBar）に本文が隠れないための余白 */}
      <main id="main-content" className="relative z-[1] pt-16 pb-[64px] sm:pt-20 md:pb-0">
        {children}
      </main>
      <TenantFooter businessKey={businessKey} />
      <MobileStickyBar businessKey={businessKey} />
      <LinkaFab businessKey={businessKey} suppressed={isRealestateTop} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { gaEvent } from "@/lib/gtag";
import { OFFICE, type BusinessKey } from "@/lib/shared/office-public";
import { CONTACT_CTA_COPY } from "@/lib/shared/contact-cta-copy";
import {
  contactBasePath,
  contactCtaHrefs,
  contactEventName,
  contactEventParams,
  shouldShowContactCta,
  type ContactCtaAction,
  type ContactCtaPlacement,
} from "@/lib/shared/contact-cta";
import { RENTAL_CAMPAIGN_COPY, rentalLineHref, type RentalCampaignKind } from "@/lib/rental-campaign";
import styles from "./ContactCta.module.css";

function useContactActions(businessKey: BusinessKey, placement: ContactCtaPlacement) {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const copy = CONTACT_CTA_COPY[locale] ?? CONTACT_CTA_COPY.ja;
  const hrefs = contactCtaHrefs(businessKey);
  const base = contactBasePath(pathname) ?? "/";
  const rentalKind: RentalCampaignKind | null = businessKey !== "realestate" ? null : base.startsWith("/bunkyo/chukai-033") ? "fee033" : base.startsWith("/gakku") ? "gakku" : base.startsWith("/bukken") ? "property" : null;
  if (rentalKind) hrefs.line = rentalLineHref({ sourcePage: base, kind: rentalKind, ...(base.startsWith("/bukken/") ? { propertyId: base.split("/")[2] } : {}), ...(base.startsWith("/gakku/") && !["rentals", "sales"].includes(base.split("/")[2]) ? { school: base.split("/")[2] } : {}) }, "ja");
  const track = (action: ContactCtaAction) => {
    // 1クリック1イベント。旧イベントを重ねて送信しない。
    if (action === "line" && rentalKind) { gaEvent(`click_line_${rentalKind}`, { source_page: base, location: placement }); return; }
    gaEvent(contactEventName(placement, action), contactEventParams(businessKey, locale, pathname, placement));
  };
  return { copy: rentalKind ? { ...copy, line: RENTAL_CAMPAIGN_COPY[locale].consult } : copy, hrefs, track, pathname };
}

/** TenantLayoutShellの既存マウントを再利用し、3事業×4言語を共通実装。 */
export function StickyContactCta({ businessKey }: { businessKey: BusinessKey }) {
  const { copy, hrefs, track, pathname } = useContactActions(businessKey, "sticky");
  const visible = shouldShowContactCta(pathname, businessKey);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = navRef.current;
    if (!element || !visible) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--yotsuba-contact-height");
    const measure = () => {
      const height = element.getBoundingClientRect().height;
      // 一時非表示（入力/ダイアログ/LINKA）の間も余白を保持してレイアウトを動かさない。
      if (height > 0) root.style.setProperty("--yotsuba-contact-height", `${height}px`);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      if (previous) root.style.setProperty("--yotsuba-contact-height", previous);
      else root.style.removeProperty("--yotsuba-contact-height");
    };
  }, [visible, pathname]);

  if (!visible) return null;

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div ref={navRef} role="navigation" aria-label={copy.nav} className={styles.sticky} data-contact-cta="sticky" data-nosnippet="">
        <p className={styles.topic}>{copy.topic[businessKey]}</p>
        <Link href={hrefs.line} onClick={() => track("line")} className={styles.primary}>
          <MessageCircle size={20} aria-hidden="true" />
          <span>{copy.line}</span>
        </Link>
        <a href={OFFICE.telHref} onClick={() => track("phone")} className={`${styles.secondary} ${styles.phone}`}>
          <Phone size={18} aria-hidden="true" />
          <span>{copy.phone}</span>
        </a>
        <Link href={hrefs.contact} onClick={() => track("contact")} className={`${styles.secondary} ${styles.desktopContact}`}>
          <Mail size={18} aria-hidden="true" />
          <span>{copy.contact}</span>
        </Link>
      </div>
    </>
  );
}

/** 記事中の1か所に置く補助導線。料金・無料・即時返信は約束しない。 */
export function InlineContactCta({ businessKey }: { businessKey: BusinessKey }) {
  const { copy, hrefs, track } = useContactActions(businessKey, "mid_article");
  return (
    <section className={`not-prose ${styles.inline}`} aria-label={copy.nav} data-contact-cta="mid_article" data-nosnippet="">
      <p className={styles.inlineHeading}>{copy.inlineHeading}</p>
      <p className={styles.inlineBody}>{copy.inlineBody[businessKey]}</p>
      <div className={styles.inlineActions}>
        <Link href={hrefs.line} onClick={() => track("line")} className={styles.primary}>
          <MessageCircle size={20} aria-hidden="true" />
          <span>{copy.line}</span>
        </Link>
        <Link href={hrefs.contact} onClick={() => track("contact")} className={styles.secondary}>
          <span>{copy.contact}</span>
        </Link>
      </div>
    </section>
  );
}

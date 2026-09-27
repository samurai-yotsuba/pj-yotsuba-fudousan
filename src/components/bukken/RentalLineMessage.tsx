"use client";
import { useState } from "react";
import type { LangCode } from "@/config/languages";
import { RENTAL_CAMPAIGN_COPY } from "@/lib/rental-campaign";
export function RentalLineMessage({ message, locale }: { message: string; locale: LangCode }) {
  const [copied, setCopied] = useState(false);
  const c = RENTAL_CAMPAIGN_COPY[locale];
  return <section className="mt-6 rounded-xl border border-border p-4 text-left">
    <p className="text-sm leading-6">{c.copyNote}</p>
    <textarea aria-label={c.copy} readOnly value={message} rows={7} className="mt-3 w-full rounded-lg border border-border p-3 text-sm" onFocus={e => e.currentTarget.select()} />
    <button type="button" className="mt-3 min-h-11 rounded-lg border border-primary px-4 py-2 text-sm text-primary" onClick={async () => { try { await navigator.clipboard.writeText(message); setCopied(true); } catch { setCopied(false); } }}>{copied ? c.copied : c.copy}</button>
    <p role="status" className="mt-2 text-xs text-text-muted">{copied ? c.copied : c.failed}</p>
  </section>;
}

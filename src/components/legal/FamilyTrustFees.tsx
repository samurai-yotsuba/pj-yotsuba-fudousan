import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LangCode } from "@/config/languages";
import { FAMILY_TRUST_COPY } from "@/lib/legal/family-trust-copy";

/** 既存の料金ページ内の詳細。表はセル内で折り返し、小画面でも全列を表示。 */
export function FamilyTrustFees({ locale }: { locale: LangCode }) {
  const c = FAMILY_TRUST_COPY[locale];
  return (
    <section id="family-trust" aria-labelledby="family-trust-heading" className="mt-6 scroll-mt-24 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 id="family-trust-heading" className="font-serif text-xl font-semibold text-ink">{c.sections[0].heading}</h2>
      <div className="prose prose-sm mt-3 max-w-none break-words prose-headings:text-ink prose-p:text-text-muted prose-li:text-text-muted">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
          table: ({ children }) => <table className="w-full table-fixed border-collapse text-xs sm:text-sm">{children}</table>,
          th: ({ children }) => <th className="border border-border bg-primary-tint p-2 text-left align-top font-semibold">{children}</th>,
          td: ({ children }) => <td className="border border-border p-2 align-top">{children}</td>,
        }}>
          {c.sections.map((s, i) => `${i === 0 ? "" : `### ${s.heading}\n\n`}${s.body}`).join("\n\n")}
        </ReactMarkdown>
      </div>
    </section>
  );
}

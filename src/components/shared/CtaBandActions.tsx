"use client";
// CtaBandActions — CTA帯のインタラクティブ部（2026-07-24 CTA刷新v2）。
// CtaBand（server）から文言・hrefをpropsで受け取る＝office.ts（SR名入り）をクライアントに載せない。
// 役割：①条件テンプレのコピー ②LINE/お問い合わせ/電話ボタン＋GA4クリック計測 ③信頼マイクロコピー表示。
// 相談内容・個人情報はGAパラメータに入れない（位置情報のみ）。
import { useState } from "react";
import Link from "next/link";
import { gaEvent } from "@/lib/gtag";

type Props = {
  /** /line（LINE中継ページ）へのロケール接頭辞付与済みhref（2026-09-01 WebView対策で直リンクから変更） */
  lineHref: string;
  lineLabel: string;
  /** ロケール接頭辞・intentクエリ付与済みのhrefを受け取る（ここでは変換しない） */
  contactHref: string;
  contactLabel: string;
  telHref: string;
  telLabel: string;
  /** コピペ用テンプレート（物件条件・会社設立バリアント） */
  template?: string;
  copyLabel: string;
  copiedLabel: string;
  /** 信頼マイクロコピー（代表直通・24時間受付） */
  trustNote?: string;
};

export function CtaBandActions(p: Props) {
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    if (!p.template) return;
    try {
      await navigator.clipboard.writeText(p.template);
      setCopied(true);
      gaEvent("cta_template_copy", { location: "cta_band" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // クリップボード不可の環境ではテンプレ表示のみ（手動選択でコピー可能）
    }
  };

  return (
    <>
      {p.template && (
        <div className="mx-auto mt-5 max-w-md rounded-xl border border-border bg-white/80 p-4 text-left">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text">{p.template}</pre>
          <button
            type="button"
            onClick={copyTemplate}
            className="mt-3 inline-flex min-h-[36px] items-center rounded-lg border border-primary px-4 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-focus"
          >
            {copied ? p.copiedLabel : p.copyLabel}
          </button>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {/* 主CTA＝LINE（塗り・主色）＝内部 /line 経由（2026-09-01 WebViewのLINE起動ブロック対策）。
            cta_line_click(location=cta_band)は「/lineへの入口タップ」、実際のLINE起動は
            /line側の location=line_bridge で計測する */}
        <Link
          href={p.lineHref}
          onClick={() => gaEvent("cta_line_click", { location: "cta_band" })}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {p.lineLabel}
        </Link>
        {/* 補助＝お問い合わせ（アウトライン中立） */}
        <Link
          href={p.contactHref}
          onClick={() => gaEvent("cta_contact_click", { location: "cta_band" })}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary-dark"
        >
          {p.contactLabel}
        </Link>
        {/* 補助＝電話＝tel:・変換しない */}
        <a
          href={p.telHref}
          onClick={() => gaEvent("cta_tel_click", { location: "cta_band" })}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary-dark"
        >
          {p.telLabel}
        </a>
      </div>
      {p.trustNote && <p className="mt-3 text-xs text-text-muted">{p.trustNote}</p>}
    </>
  );
}

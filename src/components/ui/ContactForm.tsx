"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { addLocalePrefix } from "@/lib/locale";
import { BUKKEN_CATEGORY_LABEL, PROPERTY_TEMPLATE_GENERAL } from "@/lib/shared/property-intake";
import { contactIntentPreset } from "@/lib/shared/contact-intent-preset";
import {
  CATEGORY_ORDER_BY_BUSINESS,
  CATEGORY_ORDER_DEFAULT,
  EXTRA_CATEGORY_LABELS,
  SOURCE_FIELD_LABEL,
  SOURCE_OPTIONS,
  SOURCE_PLACEHOLDER,
} from "@/lib/shared/contact-intake";
import type { LangCode } from "@/config/languages";
import { contactIntentParam, gaEvent } from "@/lib/gtag";
import { takeContactPrefill } from "@/lib/shared/contact-prefill";

const inputClass =
  "mt-1 w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none transition-all duration-300 gradient-border-input";
const errorClass = "mt-1 text-xs text-red-500";

type Props = {
  thanksPath?: string;
  business?: string;
};

export function ContactForm({ thanksPath = "/thanks", business = "realestate" }: Props) {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  // 2026-07-27：流入元（任意）。AI検索→受任の接続を測る唯一の結果指標。
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");

  const lang = locale as LangCode;

  // 2026-07-27：相談カテゴリを事業別に出し分ける。
  // 定義が無い事業は CATEGORY_ORDER_DEFAULT ＝従来の並びで挙動を変えない。
  const categoryKeys = CATEGORY_ORDER_BY_BUSINESS[business] ?? CATEGORY_ORDER_DEFAULT;

  // ラベルの解決順：bukken（property-intake）→ 新カテゴリ（contact-intake）→ Firestore辞書。
  // Firestore辞書に新キーは増やさない（B1教訓）。
  const categoryLabelOf = (key: string): string => {
    if (key === "bukken") {
      return BUKKEN_CATEGORY_LABEL[lang] ?? BUKKEN_CATEGORY_LABEL.ja;
    }
    const extra = EXTRA_CATEGORY_LABELS[key];
    if (extra) return extra[lang] ?? extra.ja;
    return t(`contact.form.categoryOptions.${key}`);
  };

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  // 来訪元（?intent=）。送信完了イベントに付け、どのページから来た相談かを GA4 で数える（2026-09-23）
  const [intentParam, setIntentParam] = useState("none");

  // CTA intent selects a displayed category and its matching localized template.
  // Use window inside the effect to keep static rendering; preserve already-entered values.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const intent = sp.get("intent") ?? "";
    setIntentParam(contactIntentParam(intent));
    if (!intent) return;
    const preset = contactIntentPreset(intent, business, lang);
    if (!preset) return;
    setCategory((c) => c || preset.category);
    // A sender's saved draft takes precedence over a blank template. Never overwrite user input.
    const prefill = takeContactPrefill(intent);
    if (prefill) setMessage((m) => m || prefill);
    else if (preset.message) setMessage((m) => m || preset.message);
  }, [lang, business]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, category, source, message, business }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          // 入力エラーで止まった回数。どの項目で詰まるかは送らない（自由記述を出さないため）。
          // GA4のform_startが1ユーザー9.1回（2026-08-13時点の28日実測）と異常に多く、
          // 記入途中の離脱が疑われるため、その切り分け用に残す。
          gaEvent("contact_submit_error", { business, kind: "validation" });
        } else {
          setServerError(data.error ?? t("contact.form.error"));
          gaEvent("contact_submit_error", { business, kind: "server" });
        }
        return;
      }

      // 送信完了（2026-08-14 新設）。
      // 本フォームは React の状態から fetch で送るため、GA4 の自動計測（form_submit）が
      // 発火せず、成果が1件も記録されていなかった。ここが唯一の成功地点なので必ず通す。
      // パラメータは閉じた選択肢のみ。氏名・メール・電話・本文は送らない（gtag.ts の規約）。
      // source＝「どちらで四葉グループをお知りになりましたか」の任意選択。未回答は空文字になる。
      gaEvent("contact_submit", {
        business,
        category: category || "unset",
        source: source || "unanswered",
        intent: intentParam,
      });

      // 2026-09-22：ロケール接頭辞を付ける。これが無いと /en/・/zh-tw/・/zh/ から送信した人も
      // 一律で日本語版の完了画面（/labor/thanks 等）に落ち、言語が最後の1画面で切り替わっていた。
      router.push(addLocalePrefix(thanksPath, locale));
    } catch {
      setServerError(t("contact.form.error"));
      gaEvent("contact_submit_error", { business, kind: "network" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gradient-border overflow-hidden rounded-2xl bg-surface p-5 sm:p-8">
      <h2 className="text-xl font-bold">{t("contact.form.title")}</h2>
      <p className="mt-2 text-sm text-text-muted">
        {t("contact.form.description")}
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            {t("contact.form.fields.name")} <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            {t("contact.form.fields.email")} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {errors.email && <p className={errorClass}>{errors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            {t("contact.form.fields.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            {t("contact.form.fields.category")} <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              // v2.2：手動で「物件を探してほしい」を選んだ場合も、本文が空ならテンプレを挿入
              // （ページ文脈がないため最も広い一般テンプレ＝住まい／店舗／事務所を用途欄で受け分け）
              if (v === "bukken") {
                setMessage(
                  (m) => m || (PROPERTY_TEMPLATE_GENERAL[locale as LangCode] ?? PROPERTY_TEMPLATE_GENERAL.ja),
                );
              }
            }}
            className={inputClass}
          >
            <option value="">{t("contact.form.categoryOptions.placeholder")}</option>
            {/* 2026-07-24 CTA刷新v2／2026-07-27 事業別の出し分け。
                Firestore辞書に新キーは増やさない（B1教訓）＝新カテゴリのラベルは
                contact-intake.ts、bukken は property-intake.ts の4ロケール直書きを参照 */}
            {categoryKeys.map((key) => (
              <option key={key} value={key}>
                {categoryLabelOf(key)}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category[0]}</p>}
        </div>

        {/* 2026-07-27：流入元（任意）。AI検索の効果を測るため「AIに聞いて」と
            「検索結果」を分けている。必須にしない＝問い合わせの摩擦を増やさない */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium">
            {SOURCE_FIELD_LABEL[lang] ?? SOURCE_FIELD_LABEL.ja}
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={inputClass}
          >
            <option value="">{SOURCE_PLACEHOLDER[lang] ?? SOURCE_PLACEHOLDER.ja}</option>
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label[lang] ?? o.label.ja}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            {t("contact.form.fields.message")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
          {errors.message && <p className={errorClass}>{errors.message[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="gradient-line w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t("contact.form.submitting") : t("common.submit")}
        </button>
      </form>
    </div>
  );
}

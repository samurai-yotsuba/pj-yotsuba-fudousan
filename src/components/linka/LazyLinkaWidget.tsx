"use client";

import { useEffect, useRef, useState, type ComponentType, type ComponentProps } from "react";
import type { LinkaWidget } from "./LinkaWidget";
import { useLanguage } from "@/contexts/LanguageContext";

type WidgetProps = ComponentProps<typeof LinkaWidget>;
const COPY = {
  ja: { open: "LINKAに相談する", loading: "読み込み中…", error: "読み込めませんでした。", retry: "ページを再読み込みして再試行", notice: "入力中の内容は再読み込みで消えます。必要な内容を控えてからお試しください。" },
  en: { open: "Talk to LINKA", loading: "Loading…", error: "Unable to load.", retry: "Reload page to try again", notice: "Reloading clears unsent entries. Please copy anything you need first." },
  "zh-tw": { open: "向LINKA諮詢", loading: "載入中…", error: "無法載入。", retry: "重新載入頁面後重試", notice: "重新載入會清除尚未送出的內容，請先複製需要保留的內容。" },
  zh: { open: "向LINKA咨询", loading: "加载中…", error: "无法加载。", retry: "重新加载页面后重试", notice: "重新加载会清除尚未发送的内容，请先复制需要保留的内容。" },
};

/** Inline widgets load near the viewport; a floating panel loads when opened. */
export function LazyLinkaWidget({ deferUntilVisible = false, ...props }: WidgetProps & { deferUntilVisible?: boolean }) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const container = useRef<HTMLDivElement>(null);
  const focusOnLoad = useRef(false);
  const [requested, setRequested] = useState(!deferUntilVisible);
  const [Widget, setWidget] = useState<ComponentType<WidgetProps> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!deferUntilVisible || requested || !container.current) return;
    if (!("IntersectionObserver" in window)) return; // The open button remains usable.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setRequested(true);
    }, { rootMargin: "0px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [deferUntilVisible, requested]);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    const load = () => import("./LinkaWidget").then((module) => {
      if (!cancelled) setWidget(() => module.LinkaWidget);
    }).catch(() => { if (!cancelled) setFailed(true); });
    // Explicit clicks stay immediate; automatic inline loading yields to paint.
    if (!deferUntilVisible || focusOnLoad.current || !("requestIdleCallback" in window)) {
      void load();
      return () => { cancelled = true; };
    }
    const idle = window.requestIdleCallback(() => { void load(); }, { timeout: 1000 });
    return () => { cancelled = true; window.cancelIdleCallback(idle); };
  }, [requested, deferUntilVisible]);

  useEffect(() => {
    if (Widget && focusOnLoad.current) {
      container.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
      focusOnLoad.current = false;
    }
  }, [Widget]);

  return (
    <div ref={container} className={props.className}>
      {Widget ? <Widget {...props} /> : (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
          {props.greeting && <p className="text-sm text-text-muted">{props.greeting}</p>}
          {requested && !failed ? <p role="status">{copy.loading}</p> : (
            <>
              {failed && <p role="alert">{copy.error}</p>}
              {failed && <p className="text-sm text-text-muted">{copy.notice}</p>}
              <button type="button" className="rounded-lg bg-primary-dark px-4 py-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
                onClick={() => {
                  // Turbopack caches a rejected chunk load for the document lifetime.
                  // An explicit reload can recover; repeated import() cannot.
                  if (failed) { window.location.reload(); return; }
                  focusOnLoad.current = true;
                  setRequested(true);
                }}>
                {failed ? copy.retry : copy.open}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

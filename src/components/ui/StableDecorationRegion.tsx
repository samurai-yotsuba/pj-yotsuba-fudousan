"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Freeze only the inner artwork region; the outer clip still follows the page. */
export function StableDecorationRegion({ children }: { children: ReactNode }) {
  const region = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    const element = region.current;
    if (!element) return;
    // Reset on navigation, then retain the SSR page's existing decoration positions.
    // Font swaps, skipped-card layout and details opening no longer move the artwork.
    element.style.height = "";
    element.style.height = `${element.getBoundingClientRect().height}px`;
  }, [pathname]);
  return (
    <div ref={region} data-decoration-region className="absolute inset-0">
      {children}
    </div>
  );
}

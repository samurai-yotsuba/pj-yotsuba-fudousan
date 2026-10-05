import type { CSSProperties } from "react";
import { CLOVER_PATH } from "./clover-path";
import { StableDecorationRegion } from "./StableDecorationRegion";

/**
 * 背景にアイコンを散りばめる装飾コンポーネント
 *
 * 使い方: 親要素に `relative` を設定し、その直下に配置する
 * - absolute + inset-0 で親の表示領域内に配置
 * - 内側の描画領域を固定し、本文や遅延描画の高さの変化では動かさない
 * - z-0 でコンテンツの後ろに表示
 * - pointer-events-none でクリック透過
 */

type IconPlacement = {
  top: string;
  left: string;
  size: number;
  rotate: number;
};

// Preserve the original artwork distribution; freeze its inner region after hydration.
const placements: IconPlacement[] = [
  // 左上
  { top: "3%", left: "-3%", size: 800, rotate: 15 },
  // 右上
  { top: "10%", left: "82%", size: 500, rotate: -25 },
  // 左中上
  { top: "28%", left: "5%", size: 600, rotate: 40 },
  // 右中
  { top: "42%", left: "78%", size: 700, rotate: -12 },
  // 左中下
  { top: "58%", left: "-5%", size: 550, rotate: -35 },
  // 右下
  { top: "75%", left: "72%", size: 500, rotate: 45 },
  // 左下
  { top: "88%", left: "8%", size: 650, rotate: -18 },
];

/** ロゴの黄緑（2.5%の透かしでは2色の差は判別できないため1色で塗る） */
const ICON_GREEN = "#8CC21F";
const SYMBOL_ID = "yotsuba-scattered-clover";

export default function ScatteredIcons() {
  // Artwork stays server-rendered; only the region's height is frozen on the client.
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <StableDecorationRegion>
        {/* SPは3点・幅44vw。
            2026-09-24：以前は img 要素（next/image）で描いており、透明度2.5%でも Chrome が
            LCP（最大視覚要素）の候補に数え、/bukken 等で「表示完了」がこの装飾の描画時刻になっていた
            （Lighthouse 3.0〜5.1秒でぶれる）。CSS の mask-image でも候補に残ることを実測で確認したため、
            インラインSVGの図形（path）で描く。図形は LCP の候補にならず、画像の取得も発生しない。
            形は四つ葉ロゴの輪郭をなぞったもの（clover-path.ts）。 */}
        <svg width="0" height="0" className="absolute" focusable="false">
          <defs>
            <symbol id={SYMBOL_ID} viewBox="0 0 512 512">
              <path d={CLOVER_PATH} fill={ICON_GREEN} fillRule="evenodd" />
            </symbol>
          </defs>
        </svg>
        {placements.map((p, i) => (
          <svg
            key={i}
            data-decoration="scattered-icon"
            width={p.size}
            height={p.size}
            viewBox="0 0 512 512"
            focusable="false"
            className={`absolute aspect-square h-auto max-w-none w-[min(var(--decoration-size),44vw)] sm:w-[var(--decoration-size)] ${i % 3 === 0 ? "" : "hidden sm:block"}`}
            style={
              {
                top: p.top,
                left: p.left,
                "--decoration-size": `${p.size}px`,
                opacity: 0.025,
                transform: `rotate(${p.rotate}deg)`,
              } as CSSProperties
            }
          >
            <use href={`#${SYMBOL_ID}`} />
          </svg>
        ))}
      </StableDecorationRegion>
    </div>
  );
}

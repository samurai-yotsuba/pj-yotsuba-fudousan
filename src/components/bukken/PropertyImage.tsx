import Image from "next/image";
import { isOptimizableImageUrl } from "@/lib/shared/image-hosts";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * 表示幅の目安。これを基に画面幅に合った縮小版が選ばれる。
   * 固定幅の小さなサムネイルでは省略する（srcset が 1x/2x の2本だけになる）。
   * 2026-09-28：一覧の125件すべてに sizes="128px" を付けると srcset が17本ずつになり、
   * /bukken の HTML が1.3MB（うち img タグ56万字）まで膨らんで描画が約4秒遅れていた。
   */
  sizes?: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  quality?: 60 | 75;
};

/**
 * 物件写真。自社 Storage の画像は next/image で画面幅に合わせて縮小・WebP化して配信する。
 * 許可外の URL（旧データ・外部URL）は、例外でページを落とさないよう素の img に戻す。
 */
export function PropertyImage({ src, alt, width, height, sizes, className, loading = "lazy", fetchPriority, quality = 75 }: Props) {
  if (isOptimizableImageUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} loading={loading} fetchPriority={fetchPriority} decoding="async" />
  );
}

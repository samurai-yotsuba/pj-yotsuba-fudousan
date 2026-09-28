import Image from "next/image";

export type ColumnArticleHeroIllustration = {
  src: string;
  alt: string;
  source: string;
  theme: string;
};

type Props = {
  date: string;
  category: string;
  title: string;
  illustration: ColumnArticleHeroIllustration;
};

export function ColumnArticleHero({ date, category, title, illustration }: Props) {
  const isLocalImage = illustration.src.startsWith("/");

  return (
    <section className="relative overflow-hidden border-b border-border pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-32 lg:pb-20">
      <div
        className="pointer-events-none absolute inset-0 bg-green-gradient"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:gap-12 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <time className="text-xs text-text-muted" dateTime={date}>
              {date.replace(/-/g, ".")}
            </time>
            <span className="gradient-line rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white">
              {category}
            </span>
          </div>
          <h1 className="article-headline mt-4 text-2xl font-bold leading-relaxed sm:text-3xl md:text-4xl">
            {title}
          </h1>
        </div>

        <figure
          className="relative aspect-video overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_45px_rgba(27,67,50,0.14)]"
          data-column-illustration="true"
          data-illustration-source={illustration.source}
          data-illustration-theme={illustration.theme}
        >
          {isLocalImage ? (
            <Image
              src={illustration.src}
              alt={illustration.alt}
              fill
              // 2026-09-28：この画像はコラムのLCP。next/image の fill は既定で遅延読み込み（lazy）になり、
              // fetchPriority="high" と矛盾して読み込み開始が約1.5秒遅れていた（Lighthouse実測）。
              // サービスページのヒーロー（#417）と同じく preload＋quality 60 に揃える。
              preload
              quality={60}
              sizes="(max-width: 1023px) calc(100vw - 2rem), 42vw"
              className="object-cover"
            />
          ) : (
            // 外部URLは管理画面の既存ogImageを尊重する。許可ホストを広げず、通常のimgで表示する。
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={illustration.src}
              alt={illustration.alt}
              width={1600}
              height={900}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          )}
        </figure>
      </div>
    </section>
  );
}

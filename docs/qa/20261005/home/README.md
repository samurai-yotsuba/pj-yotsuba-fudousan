# 不動産トップの高速化 — 検証記録（2026-10-05）

桜画像の元データはWebP 1600×900・437716 bytes。eager/highとresponsive sizesは既に適切だったため維持。ホームだけに画面幅別AVIFをpicture/sourceで追加し、既存Next ImageのWebPをfallbackとして残した。賃貸入口をServer Componentへ分離し、一覧遷移先の先読みを止めた。LINKAは実際に表示領域へ入ってからidle時に本体をロードし、明示クリックは即時。未使用の旧hero遅延アニメ4クラスとscrollBounce定義を削除。配色・配置・画像・本文は維持した。

## 条件と測定

最新main `1fea641`を起点。未マージPR465はlaborの年末調整表記のみで重複なし。3件は独立worktree。全体production buildはNext16.3.5、SR_LAUNCHED=true、使い捨てlocalhost DB。合成賃貸60件と公開ページから取得した4言語UI辞書を全版で固定。本番DBは使用していない。

Lighthouse13.5.0 / 同一Chrome154 / localhost / performance only / simulated throttling。mobile=412×823 DPR1.75・CPU4×・RTT150ms、desktop=1350×940 DPR1・CPU1×・RTT40ms。各ページ／端末／版3回、ブラウザstorage reset、サーバー画像・ページは画面確認で事前生成済み。ビルド・他ブラウザ検証を止めて順次実行。[3回の全値・設定](lab-results.json)。ラボ値のみで、CrUX等の実ユーザーデータは取得・混合していない。現行本番の別baselineはローカル成果物に保存し、この表と比較しない。

| 端末 | 指標 | 変更前中央値 | 変更後中央値 |
|---|---|---:|---:|
| mobile | LCP | 2,792.5 ms | 2,562.5 ms |
| mobile | CLS | 0.000000  | 0.000000  |
| mobile | TBT | 30.0 ms | 41.5 ms |
| mobile | ページ転送量 | 1,801,021 bytes | 1,762,893 bytes |
| desktop | LCP | 771.8 ms | 712.3 ms |
| desktop | CLS | 0.000000  | 0.000000  |
| desktop | TBT | 0.0 ms | 0.0 ms |
| desktop | ページ転送量 | 2,335,911 bytes | 2,118,848 bytes |

## 桜画像・初期通信

| 端末 | 桜画像 bytes 前→後（中央値） | JS bytes 前→後（中央値） | CSS bytes 前→後（中央値） |
|---|---:|---:|---:|
| mobile | 93,051 → 60,946 | 211,404 → 209,295 | 88,640 → 88,571 |
| desktop | 222,270 → 142,467 | 304,079 → 218,956 | 91,640 → 91,571 |

JS/CSSはLighthouseのページ読込み中の転送量（font-faceの遅延CSSやルーター先読みを含む）。新しいレンダーブロッキングCSSは追加していない。必要なブランドフォントCSSは残し、不要な遷移先先読みの通信を削減した。AVIF元ファイルは420×236/750×422/828×466/1200×675/1600×900。

## 動作・静的検査

4言語×スマホ/PCの8経路でAVIF選択・eager/high・WebP fallback・学区リンクHTTP200・LINKA本文の遅延ロードを確認。初期画面のLINKA本体は8件すべて未ロード。元WebPは維持、AVIF生成は node scripts/generate-home-hero.mjs で再現できる。Googleタグは実装1か所、通常ブラウザ相当の初期化→SPA遷移でもloader/config各1回。Google配信コードを代替し計測hitを遮断して確認。重複がなかったためタグとCTA/LINE/tel/送信イベントは変更していない。全1839テスト通過。

各PRで型チェック成功、全eslint error0（既存warning23）、production build成功。フォームはローカル代替応答とモックメールのみ、本番送信なし。スクリーンショット=390×844 DPR2 / 1440×900 DPR1。

## 比較画像

| 言語／端末 | 変更前 | 変更後 |
|---|---|---|
| ja / mobile | [画面](images/before-ja-mobile.png) | [画面](images/after-ja-mobile.png) |
| ja / desktop | [画面](images/before-ja-desktop.png) | [画面](images/after-ja-desktop.png) |
| en / mobile | [画面](images/before-en-mobile.png) | [画面](images/after-en-mobile.png) |
| en / desktop | [画面](images/before-en-desktop.png) | [画面](images/after-en-desktop.png) |
| zh / mobile | [画面](images/before-zh-mobile.png) | [画面](images/after-zh-mobile.png) |
| zh / desktop | [画面](images/before-zh-desktop.png) | [画面](images/after-zh-desktop.png) |
| zh-tw / mobile | [画面](images/before-zh-tw-mobile.png) | [画面](images/after-zh-tw-mobile.png) |
| zh-tw / desktop | [画面](images/before-zh-tw-desktop.png) | [画面](images/after-zh-tw-desktop.png) |

## 未確認事項と確認範囲

Google Analytics管理画面での実受信・実ユーザー指標は未検証。headlessラボは既存bot guardでGoogle計測を除外する。AVIF非対応の実端末は未検証だがpictureのsourceを除いたWebP読み込みを全8経路で確認。ローカル3回の中央値は本番配信後の速度を保証しない。

別チャットの独立レビューは未実施。ユーザーの追加指示により、検証後に3件をマージする。本番反映は通常のVercelパイプラインの状態を確認する。

[コンプライアンス自己点検] 判断留保:有／匿名化:実顧客データなし／法令引用:引用なし／未検証事項:上記。
[配布切り分け] 四葉固有=コピー・画像・ロゴ。汎用=フォームintent整合、responsive picture、SVG/画像領域固定と比較計測。カタログ追記はCowork正本更新担当へ引継ぎ（AI共有メモリの確定事項）。

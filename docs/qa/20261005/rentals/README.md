# 学区賃貸一覧の表示安定化 — 検証記録（2026-10-05）

背景SVGのtopがbody全高の%で指定され、一覧のcontent-visibility推定高補正や条件開閉で装飾まで動いていた。内側の装飾領域だけを初期描画時の高さで固定し、元の割合・位置を保つ。外側は現在の本文高でclipするため余分なスクロール領域を作らない。ページ遷移時に高さを取り直し、SVGの正方形寸法も明示した。7個の図形・色・透明度・角度・大きさを維持。ロゴの元PNG実寸を正本化し、header/footerのwidth/heightとsizesを一致させた。検索情報のSSR・一覧構造・既存遅延描画は維持した。

## 条件と測定

最新main `1fea641`を起点。未マージPR465はlaborの年末調整表記のみで重複なし。3件は独立worktree。全体production buildはNext16.3.5、SR_LAUNCHED=true、使い捨てlocalhost DB。合成賃貸60件と公開ページから取得した4言語UI辞書を全版で固定。本番DBは使用していない。

Lighthouse13.5.0 / 同一Chrome154 / localhost / performance only / simulated throttling。mobile=412×823 DPR1.75・CPU4×・RTT150ms、desktop=1350×940 DPR1・CPU1×・RTT40ms。各ページ／端末／版3回、ブラウザstorage reset、サーバー画像・ページは画面確認で事前生成済み。ビルド・他ブラウザ検証を止めて順次実行。[3回の全値・設定](lab-results.json)。ラボ値のみで、CrUX等の実ユーザーデータは取得・混合していない。現行本番の別baselineはローカル成果物に保存し、この表と比較しない。

| 端末 | 指標 | 変更前中央値 | 変更後中央値 |
|---|---|---:|---:|
| mobile | LCP | 2,336.6 ms | 2,336.7 ms |
| mobile | CLS | 0.000000  | 0.000000  |
| mobile | TBT | 189.5 ms | 171.7 ms |
| mobile | ページ転送量 | 1,907,494 bytes | 1,908,635 bytes |
| desktop | LCP | 511.2 ms | 533.8 ms |
| desktop | CLS | 0.000227  | 0.000227  |
| desktop | TBT | 0.0 ms | 0.0 ms |
| desktop | ページ転送量 | 2,010,293 bytes | 2,011,161 bytes |

## 装飾SVGの再現

| 端末 | 最初のSVG：スクロール時 前→後 | 描画対象7個の最大移動 前→後 |
|---|---:|---:|
| mobile | 47.844px → 0.000122px | 1403.611px → 0.000122px |
| desktop | 31.047px → 0.000000px | 910.797px → 0.000000px |

非表示のSVGは除外。スクロールでcontent-visibilityの推定高が補正される実描画を確認し、その後1000pxの合成領域追加でも後版は位置が動かない。CSS丸め誤差は0.001px未満。Lighthouse初期CLSとは別の再現テスト。[変更前](before-layout-probe.json)／[変更後](after-layout-probe.json)。

## 動作・静的検査

4言語×スマホ/PC×トップ/会社設立/学区一覧=24画面HTTP200。4言語×20校=80リンクHTTP200、サーバーHTMLに架空賃貸の建物情報が存在。カード写真128×96・小ロゴ48×48は既に固定領域なので維持。元PNG寸法と指定寸法を照合する6回帰テストを追加。全1845テスト通過。

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

一覧は合成賃貸60件（本番同時取得画面は約6389 DOM、合成は約3021 DOM）で検証。本番件数・本番配信の性能は未検証。初期ロードCLSと、スクロール/本文高さ変化時の装飾移動は別に記録し、低い初期CLSをSVG原因と断定しない。英語390pxでフォント到着に伴う約0.0236の小さなCLSが残る。

別チャットの独立レビューは未実施。ユーザーの追加指示により、検証後に3件をマージする。本番反映は通常のVercelパイプラインの状態を確認する。

[コンプライアンス自己点検] 判断留保:有／匿名化:実顧客データなし／法令引用:引用なし／未検証事項:上記。
[配布切り分け] 四葉固有=コピー・画像・ロゴ。汎用=フォームintent整合、responsive picture、SVG/画像領域固定と比較計測。カタログ追記はCowork正本更新担当へ引継ぎ（AI共有メモリの確定事項）。

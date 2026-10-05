# 会社設立の相談入口 — 検証記録（2026-10-05）

会社設立ページ末尾が不動産条件テンプレと intent=bukken に接続されていた。会社設立用の4行テンプレへ切り替え、既存の会社設立・各種許認可カテゴリ kyoninka と本文初期値に接続した。海外居住継続と在留資格相談を分け、口座・許認可・在留資格を保証しない。共通法務シェルの翻訳漏れも4言語で修正した。

## 条件と測定

最新main `1fea641`を起点。未マージPR465はlaborの年末調整表記のみで重複なし。3件は独立worktree。全体production buildはNext16.3.5、SR_LAUNCHED=true、使い捨てlocalhost DB。合成賃貸60件と公開ページから取得した4言語UI辞書を全版で固定。本番DBは使用していない。

Lighthouse13.5.0 / 同一Chrome154 / localhost / performance only / simulated throttling。mobile=412×823 DPR1.75・CPU4×・RTT150ms、desktop=1350×940 DPR1・CPU1×・RTT40ms。各ページ／端末／版3回、ブラウザstorage reset、サーバー画像・ページは画面確認で事前生成済み。ビルド・他ブラウザ検証を止めて順次実行。[3回の全値・設定](lab-results.json)。ラボ値のみで、CrUX等の実ユーザーデータは取得・混合していない。現行本番の別baselineはローカル成果物に保存し、この表と比較しない。

| 端末 | 指標 | 変更前中央値 | 変更後中央値 |
|---|---|---:|---:|
| mobile | LCP | 2,416.2 ms | 2,414.5 ms |
| mobile | CLS | 0.000000  | 0.000000  |
| mobile | TBT | 33.5 ms | 33.0 ms |
| mobile | ページ転送量 | 1,763,290 bytes | 1,776,375 bytes |
| desktop | LCP | 535.8 ms | 536.7 ms |
| desktop | CLS | 0.000227  | 0.000227  |
| desktop | TBT | 0.0 ms | 0.0 ms |
| desktop | ページ転送量 | 1,865,836 bytes | 1,885,247 bytes |

## 動作・静的検査

4言語×スマホ/PCの8経路でCTA→フォーム category=kyoninka・4行本文・代替送信成功イベントを確認。メール送信はブラウザで代替し、APIの会社設立通知分類はResendをモックした回帰テストで確認。不動産3テンプレ×4言語も保持。フォーム／LINE中継／ビザ／障害福祉／料金リンクはHTTP200。全1851テスト通過、APIカテゴリ回帰追加後の関連22テスト・型チェック通過。

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

会社設立相談の個別可否・在留資格の要否の判断は資格者が行う。実メール到達と実際の受任は未検証。本番フォーム送信は実施していない。

別チャットの独立レビューは未実施。ユーザーの追加指示により、検証後に3件をマージする。本番反映は通常のVercelパイプラインの状態を確認する。

[コンプライアンス自己点検] 判断留保:有／匿名化:実顧客データなし／法令引用:引用なし／未検証事項:上記。
[配布切り分け] 四葉固有=コピー・画像・ロゴ。汎用=フォームintent整合、responsive picture、SVG/画像領域固定と比較計測。カタログ追記はCowork正本更新担当へ引継ぎ（AI共有メモリの確定事項）。

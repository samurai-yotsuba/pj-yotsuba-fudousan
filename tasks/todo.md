# SEO・LLMO・AIO監査(2026-08-24)対応 — fix/seo-audit-2026-08-24

## 2026-09-24 フレンシア文京関口1105号室の掲載停止

- [x] ファミリー向けでないことを確認記録へ反映し、公開一覧から除外
- [x] 今後の掲載条件にファミリー向け適合と根拠を追加
- [x] 学校名のリンク先を面積条件のある賃貸一覧ではなく学区紹介へ変更
- [x] 回帰テスト、型検査、lint（全119ファイル・1,696件、型検査、lint error 0）
- [ ] PR作成、マージ、本番非表示確認

## 2026-09-24 小石川3丁目売地を柳町小学校区へ掲載

- [x] 公開物件と手元の販売図面を照合（65.30㎡・1億5,800万円・Koishikawa 331 Project）
- [x] 文京区の通学区域表で小石川3丁目31番が柳町小学校区と確認
- [x] 番地を非公開のまま、物件カード・詳細・柳町小学区の売買一覧へ反映
- [x] 回帰テスト（柳町小学区への所属、詳細ページ導線、他学区へ混入しないこと）
- [ ] 本番表示確認

## 2026-09-24 賃貸学区ハブの学校別「売買0件」を削除

- [x] `/gakku/rentals` の20校タイル下から学校別の売買件数リンクを削除
- [x] 売買学区一覧への全体導線は維持
- [x] 4言語の回帰テスト、型検査、lint
- [ ] 本番表示確認

## 2026-09-24 広告可を個別確認したペット物件の最小掲載

- [x] REINSの個別確認結果から、広告可・募集中・同一号室確認済みだけを抽出
- [x] 住所を文京区の通学区域データと照合し、学区未確定は除外
- [x] 公開画面には「学区」「物件」だけを表示し、媒体名・物件番号・住所・賃料・判定根拠は渡さない
- [x] 対象テスト、型検査、lint（全117ファイル・1,676件、型検査、lint error 0）
- [ ] PR作成、マージ、本番表示確認

監査指示書: ~/Downloads/luck428-seo-llmo-aio-audit-2026-08-24.md

## P0 技術修正

- [x] P0-1a proxy.ts: set-cookieを「既存Cookieの値がURLとズレたときだけ」に限定(初回Cookie付与はLanguageContextのクライアントeffectへ移設＝クローラーにset-cookieが一切出ない)
- [x] P0-1b proxy.ts: 公開GETページに `s-maxage=3600, stale-while-revalidate=86400` を付与(ローカルnext startでmiddlewareヘッダーがNextのno-storeを上書きすることを実測確認)
- [x] P0-1c vercel.json: 関数リージョンをhnd1(東京)に固定(現状iad1・DBはap-northeast-1で毎クエリ太平洋往復)
- [x] P0-2 layout.tsx: 3フォントすべて `preload: false`(204件→0件・実測0)
- [x] P0-3a BlogPostingJsonLd: Blog @id/url を canonicalUrl で生成(/legal/legal/column解消・実測0件)
- [x] P0-3b BlogPostingJsonLd: image を実在画像URL(文字列)に(legalコラム実測=legal-og.png・200/image/png)
- [x] P0-3c GovernmentService 削除(LegalServicePage + shogai-fukushi/visa/company/gaikokujin-shain/ikuseishuro-gaibu-kansa・実測0件)

## P1 構造整理

- [x] P1-1 WebSite name を「四葉グループ」単一ノードに(realestate layoutのみ出力・legal/laborから削除・ColumnCollectionのisPartOfも統一)
- [x] P1-2 sitemap.ts: 固定ページのlastmod省略・コラムはdateModified/dateのみ(フォールバックnow廃止)
- [x] P1-4 legal用OG画像(1200×630)生成 → BUSINESS_SEO.legal.ogImage設定・twitter card=summary_large_image(og:imageは正規ホスト絶対URLで出力)

## 判断メモ

- robots.txt の `/_next/static/media/` ブロックは**維持**(2026-07-30浦松承認・GSC woff2問題対策。preload削減後に再評価)
- ISR/SSG全面化は今回見送り(全ページがheaders()依存＝ロケール設計の大改修が必要)。CDNキャッシュ(s-maxage)で受け入れ基準を満たす

## 検証

- [x] npm test(231件) / tsc --noEmit / npx next build 通過(prisma dev使い捨てDB＋pgbouncer=true＋seed-local-sample)
- [x] next start + curl: cache-control / set-cookie / preload件数 / schema出力 / canonical・hreflang・lang属性・410 をすべて実測確認

## レビュー

- 全ロケールの公開GETページ: `cache-control: public, s-maxage=3600, stale-while-revalidate=86400`・set-cookieなし。
  set-cookieが出るのは「既存Cookieの値とURLロケールがズレた同期時」のみ(このときはno-store維持=正しい)
- /admin・/api・/thanks等の動的ルートはno-storeのまま
- sitemap: lastmodはコラム(dateModified/date保持分)のみ。固定ページから消え、連続取得で不変
- 残タスク(監査書のうち今回未実施): §4コンテンツ・内部リンク改善(inheritance/souzoku強化・CTA整理)、§6ローカルSEO(GBP・外部NAP統一=サイト外作業)、§7翻訳品質、robots.txtのmedia解除判断(preload削減後のGSC推移を見て再評価)
- デプロイ後確認: x-vercel-cache=HIT/STALE、x-vercel-id がhnd1実行になること、GSC URL検査、Rich Results Test


## 2026-09-07 コラム一覧Egress削減
- [x] 接続ref・適用規程・AI共有メモリを確認
- [x] SQL投影・20件ページ分割・翻訳フォールバックを実装
- [x] SQL・データ量・4言語一覧/詳細/移動を検証
- [x] lint/typecheck/test/build、レビュー用差分を出力

### レビュー記録
- 接続確認: luck428-corporate / lxsnklqwysakhnmvdivh。基点 origin/main 3f7c969。
- 20件/ページ。本文・全翻訳JSONをSQLから除外。補助インデックスは100件/SQLで全候補を維持。
- 369テスト・型チェック・本番build成功。lint error 0（既存warning 38）。
- 本番読取SQLで先頭一覧のJSON換算値2.95〜5.31MB→13.1〜22.0KB。課金Egressの実測ではない。
- ローカルPostgresで3事業×4言語、ページ境界・公開条件・翻訳欠損・詳細・SEOを検証。
- 実機ブラウザのページ移動・言語切替確認。SR_LAUNCHED=falseの8ルート404確認。
- 本番接続のローカル資格情報は認証拒否。本番SQLは認証済みSupabaseコネクタ、ビルド/表示はローカルfixture DBで検証。
- commit/push/deploy未実施。別セッションレビュー用のpatch・SQL・検証報告を本タスクoutputsに保存。


## 2026-09-08 緊急対応 第1回（404・言語切替）

- [x] 最新mainと現行ルーティング・公開言語の判定を確認
- [x] ドットを含む記事URLのルーティングを修正
- [x] 公開済み記事の言語だけを初期HTMLに出力
- [x] 管理画面の再検証に言語一覧のキャッシュ失効を連動
- [x] 回帰テスト・型検査・変更箇所の静的検査
- [x] ローカル本番ビルド、社労士公開フラグ両状態の確認
- [x] 57参照元ページの再検査、4言語のブラウザ操作確認
- [x] 差分・検証結果をレビュー用にまとめる

公開サイトの診断で検出したリンク先140件が対象。内訳を再確認し、言語切替のリンク先139件（49参照元ページ）、同じリンク先に向かう社労士記事本文内の3参照、ドットを含む日本語記事1件に分けた。本文リンク3件は表示時に公開言語へ解決し、移動先言語を明示する。記事の公開データや翻訳本文は変更しない。速度改善・robots.txt・GSC整理は計画書の次段階で扱う。

### 第1回の検証結果

- vitest: 26ファイル・418テスト成功。型検査成功。変更ファイルのESLint: エラー0、既存のimg警告1。
- ローカル本番ビルド: 1,411ページ生成成功。公開ページはSSG/ISRを維持。
- 57参照元を含む66パスの検査成功。対象の日本語記事は200・自己参照canonical・H1が1件・キャッシュHIT。
- 390px表示で日本語→英語→繁体字→簡体字の切替とcanonical更新を確認。未公開翻訳リンク0、横はみ出し0、ブラウザ実行エラー0。
- 社労士フラグfalseの開発環境で対象記事404、サイトマップにlaborのURLなし。
- 本番DB接続は手元の設定では成功しなかった。検証には公開HTMLの言語情報260記事と既存原稿を使ったローカルDBを使用（220記事は原稿あり、40記事は検査用本文）。本番DBへの書込みは行っていない。本番反映後の実測は別途必要。


### 独立レビュー後の追加検証（2026-09-09）

- [x] コラム詳細だけを静的ファイル判定の例外とし、他の拡張子・ドット付きディレクトリの従来配信を維持
- [x] POST/upsert/PATCH/DELETEのサーバー側で公開言語・旧新URL・事業配下・サイトマップのキャッシュを失効
- [x] 新規・編集画面の重複する再検証リクエストを削除。公開更新に失敗した場合は保存済みの旨を表示
- [x] 回帰テスト448項目成功
- [x] 実HTTPによる公開変更・削除・slug/事業移動・サイトマップ整合性の確認
- [ ] 最終差分の別セッションレビュー、プレビューで再検証

既知制限: 公開状態の変更前から開いている第三者ブラウザのlayoutは、通常のSPA遷移では古い言語一覧を保持し得る。新規アクセス・ハードリロード・次回サーバー取得を今回の対象とし、リアルタイム更新は別途扱う。DB更新とNextキャッシュは分散トランザクションではないため、キャッシュ失効の失敗はAPIの503とmutationSucceeded=trueで明示し、成功表示にしない。

- ローカル実HTTP検証: 28確認成功。DBはローカル専用、認証はループバックfixture、IndexNowは非本番として送信抑止。検証記事は最後に削除済み。
- 別セッション再レビュー: 公開阻害の指摘なし。after通知の登録失敗も保存結果に影響しない防御と3テストを追加。

## 2026-09-09 PR #326/#327 統合検証
- [x] #326成功・#327キャンセルを確認
- [x] 既存の検証済み統合候補を#327へ反映
- [ ] テスト・型検査・Preview build・公開URL確認
- [ ] 重複PR整理（本番マージは別途）

## 2026-09-09 V10 implementation — PR1 through PR4

- [x] Centralize HR plan fees, setup costs and responsibility boundaries in four locales.
- [x] Rebuild labor home, pricing, FAQ and workflow pages; keep unrelated existing fees.
- [x] Rebuild legal home and qualification-gated foreign-employer/GH links.
- [x] Align foreign-employment and visa LPs; correct language-support claims in the existing Japanese employer guide.
- [x] Translate care/GH and treatment-improvement LPs; separate wage work from administrative submissions.
- [x] Align the FAQ and two translated GH routes with sitemap hreflang entries.
- [x] Integrated unit/regression tests: 587 passed; typecheck passed; full lint: 0 errors, 36 warnings.
- [x] Public HTTP checks: 40 URLs (10 pages × 4 locales), all 200 with one H1 and matching canonical/hreflang.
- [x] Private HTTP checks: 28 labor URLs return 404/noindex; 12 legal URLs return 200 with no labor links.
- [x] Final build compilation and TypeScript passed; DB authentication blocked page-data collection (exit 1, not build success).
- [x] Mobile and desktop checks of plan fees, responsibility boundaries, controlled table scrolling and reciprocal links.
- [x] Resolved in PR5: production-mode build passed with a disposable local DB; current production translations still require release-time verification.
- [x] PR5 proceeded after direct user approval; external-model review is not claimed. Final five-article implementation and checks are recorded below.
- [ ] Confirm V10 PART L and perform the separate-session primary review before release.

No commit, push, PR, merge, deployment or DB writes were performed. Worktrees are based on e7e952316403f954c6eb82f39dac43e01718ce13. Existing unrelated working files are preserved. Detailed final verification and resume instructions are in the calling task outputs; raw logs and environment settings are not part of the distribution.

## 2026-09-09 V10 PR5 — columns and local verification

- [x] User directly approved the three presented Japanese revisions (04, 16, 37). No external-model review result is claimed.
- [x] Final consistency scan found two further old-price references (03, 38); align only the affected office-service passages with the already approved V10 terms.
- [x] Preserve article identity, original publication dates and topics; do not change unrelated articles.
- [x] Use the repository's disposable local DB workflow to validate page generation without accessing production data.
- [x] Final: 5 articles × 4 locales; 607 tests passed; typecheck/build passed; lint 0 errors; 120 public/private URL checks passed.
- [x] Generated seed changes only 5 of 90 articles; 85 remain unchanged. CJK emphasis rendering corrected and tested.
- [ ] Separate-session primary review, PART L confirmation and production-data comparison before publication.

Only a task-owned loopback database receives fixture writes. No production DB writes, commits, PRs or deployments. Final evidence is saved in the calling task outputs.


## 問い合わせCTA v2 統合検証（2026-09-12）

- [x] 最新 main 7c92bfb へ同期し、既存作業とパッチの一致を確認
- [x] 同梱 v2 の10ファイルを適用
- [x] 実依存で型検査・変更対象lint・全671テスト（40ファイル）を通過
- [x] 同梱テストのreact/no-children-propを修正し、ColumnBodyと既存言語リンク補正の結合確認を追加
- [ ] SR_LAUNCHED=false / true の本番ビルド完了（両方コンパイル・型検査成功、DB認証でページ生成停止）
- [x] 3事業×4言語×9サイズのCTA配置108ケース、動作・遷移等84項目、追加表示条件21項目を検証
- [x] SR_LAUNCHED=falseの社労士経路4言語が404・noindex・CTA非表示
- [x] 横幅比較108ケースでCTA・LINKA非表示時と同幅（ページ全体のはみ出し48ケースは翻訳復旧後に再確認）
- [ ] 実データでの不動産トップ・コラム詳細・共通翻訳の画面確認（有効なDATABASE_URL待ち）
- [x] 差分・検証結果・未検証事項を別セッションレビュー用に整理

### 統合検証のレビュー記録

- ソース10ファイルを未コミット状態で適用済み。実装8ファイルは同梱v2と一致、テスト2ファイルのみ追加修正。
- 不動産の配置・遷移確認はトップのDB認証エラーにより固定のアクセスページで代替。共通DB翻訳はフォールバック状態なので、本番文面の幅・全体レイアウトは未確定。
- 既存.env.localのDATABASE_URL/DIRECT_URLのパスワードがテンプレート値。Vercelのpreview/productionにはDATABASE_URLが登録済み（前回のenv runによる不存在判定を訂正）。取得値が伏せ字になるため、Vercelクラウド内の設定で全体ビルドを行う。秘密値・環境変数ファイルは変更していない。
- ブラウザの電話/LINE外部遷移、フォーム等POST、GA4外部送信は抑止してローカルイベントを検証。
- 公開前のiOS実機・GA4受信・独立した別セッションレビュー、commit/push/PR/merge・本番反映・DB投入は未実施。


### 本番反映（2026-09-12 利用者承認）

- [x] 利用者から全体ビルド・コミット・本番反映を承認済み
- [x] 最終ソース10ファイルが型検査・lint・671テスト通過時と同一であることを確認
- [ ] 作業ブランチのコミット・PRとVercelプレビュービルド
- [ ] 本番ブランチへ統合し、本番ビルドと公開URLを確認

ローカルで秘密値を読み出せないため、既存Vercel環境内でのフルビルドで検証する。

## 2026-09-13 社労士トップの依頼方法・料金比較
- [x] 最新mainから作業を分離し、公開ページ・現行料金・実装指示を照合
- [x] 4言語のトップ、標準料金モデル、単独依頼、共有フォルダの説明を実装
- [x] 料金・FAQ・業務案内と構造化データの整合を確認
- [x] 型・lint・テスト・build、4言語とスマートフォンの実表示を検証
- [x] 差分とローカルプレビューを提出（マージ・本番公開は別途）

検証：689テスト、変更箇所lint、型チェック、本番ビルド（387ページ）、4言語20ページのHTTP検証を通過。390px幅でも横溢れなし。非公開フラグは独立チェックで404ガード・4言語メタデータ非表示を確認（5件）。非公開設定のdev HTTP検証は既存Googleフォント取得失敗で未完了。ローカルプレビューのみ、マージ・公開・本番DB変更なし。

### 2026-09-13 追加修正
- [x] 標準導入55,000円に、一定期間の顧問契約で無料になる場合がある旨を4言語で追加。比較表・内訳・プラン料金・FAQを共通文言で統一。
- [x] キャッチコピー「小さな会社にも、人事部を」をロゴのピンクと同系統の濃色にし、文字を拡大。
- [x] 給与計算の包含範囲を「給与計算対象３名まで含む（1〜3名の人数帯）」に4言語で変更。
- [x] 初期費用を191,700円（136,700円）と併記し、括弧内の適用条件を近接表示。

追加修正後も対象35テスト・対象6ファイルのlint・型検査を含む本番形式ビルド・20ページのHTTP検証を通過。PCと390px幅で実表示を確認。

### マージ承認と最終検証（2026-09-13）

利用者が最終画面を確認し、コミット・PR作成・マージまで明示承認。最新origin/main（3373fa8）との差分に競合なし。最終版で689テスト、変更15ファイルのlint、本番形式ビルド（387ページ）、20ページHTTP確認、4言語の確定文言・料金・FAQの照合を通過。承認された差分をsquashマージする。


## 2026-09-13 トップ公開後レビューの追補
- [x] 相談例の給与計算文・外国人雇用カードを4言語で簡潔にし、冒頭の「まとめて」を「含めて」に変更
- [x] 冒頭CTA直下に初回60分無料を4言語で明記
- [x] 利用者の判断に従い、在留資格の基本相談無料と既存の受任条件を維持
- [x] lint・型・既存689テスト・387ページの本番形式ビルド・4言語20ページのHTTP確認・日本語390px幅の実表示を確認
- [x] 既存の公開承認に基づきPR #344を作成。統合・本番公開の最終状態はPRと公開検証記録を参照。


## 2026-09-13 スマホ冒頭の表示速度・文字色
- [x] PageSpeedの診断内訳を確認（スマホLCP4.3秒、Style/Layout1.8秒、淡色背景上の主色文字）
- [x] 社労士のスマホ表示で、装飾用フォントを主要画像の読み込み・初回描画後に読み込む
- [x] 冒頭画像の画質・表示幅指定と、社労士ヘッダーロゴの寸法指定を適正化
- [x] 社労士の依頼導線・比較表・手順の緑文字を濃色に変更
- [x] スケジューラ7テストを含む696テスト、型検査、変更箇所lint、本番形式ビルド387ページ、4言語20ページのHTTP検証を通過
- [x] 日本語・英語の390px幅と日本語PCの実表示を確認。緑文字のコントラスト比4.40→6.37、冒頭画像750pxのWebP容量23,850→19,726 bytes（17.3%削減）
- [ ] 本番へ反映し、同条件のPageSpeed測定で効果を確認

改善前の同一URL再測定は20:08が78点・LCP4.3秒、20:40が98点・LCP1.8秒。測定の変動が大きいため、初回との単純比較を今回の速度改善効果とは扱わない。既存の料金・相談条件・ピンクのキャッチコピーを維持。公開・公開後測定の結果はPRと検証記録を参照。

### 小型スマホ幅の補正
- [x] 320px幅でヘッダーロゴがメニューボタンを圧迫する問題を修正。狭い画面では縦横比を保ってロゴを縮小
- [x] 型・変更箇所lint・387ページビルド通過。4言語320pxでヘッダー右端289pxが表示領域305pxに収まり、日本語のメニュー開閉も確認。390px幅でも横溢れなし

## 2026-09-13 ゼヒトモ公式タグ
- [x] 認証済みの公式設定画面で発行タグと同一ページURLの登録条件を確認
- [x] 指定コラムと料金ページの日本語版2ページへの設置・公開を利用者が承認
- [x] 公式ID・リンク3本・表示文・targetを維持し、問い合わせ帯の下へ限定配置
- [x] 原稿・料金・他言語・共通フッター・本番DBは変更なし
- [x] 全696テスト、型チェック、全体lint（エラー0）、コラムdry-run検査を通過
- [x] 別セッションのコードレビューで具体的な不具合指摘なし（レビュー環境でのVitestは権限制限。本セッションでは全件通過）
- [x] 本番形式ビルド763ページ、対象2ページ・対象外9ページのHTTP検査、PC・390pxの目視と320pxの部品幅を確認
- [ ] PR・squashマージ・本番の2ページを確認
- [ ] 料金ページURLのゼヒトモ登録を確認（掲載対象としての受理は未確認）

## 2026-09-13 ヘッダー・フッターの翻訳キー露出
- [x] 利用者のスクリーンショットで、文字崩れの実体が翻訳キーの露出と確認
- [x] 翻訳DB取得失敗が空辞書になり、共通レイアウトの文字列へそのまま届く経路を特定
- [x] 社労士ナビ・フッター・共有連絡先の4言語の予備辞書をサーバーで補完。正常なDB文言・意図的な空文字・現在言語と日本語だけの配信を維持
- [x] 両言語のDB取得失敗を再現し、実ヘッダー・フッターの翻訳、電話リンク、欠損・不正型・開業前ゲートを検証する9テストを追加
- [x] 効果を確認できなかった追加フォント遅延を撤回。画像圧縮・文字色・小型スマホのロゴ補正は維持
- [x] 698テスト・型・lint・本番形式387ページビルド・4言語20ページの翻訳キー検査を通過。PCの4言語切替と320px日本語メニューを実表示で確認
- [ ] 既存の公開承認に基づきマージ・本番反映、公開ヘッダー・フッターを再確認

レビュー：DBの書き換えは行わない。予備データは本日取得した公開UIから、共通レイアウトで必要な項目だけを採用。本文・料金・相談条件は変更しない。速度は変更前3回の中央値96点/LCP2.3秒に対し変更後75点/LCP4.4秒で、追加フォント遅延の効果は確認できず。原因と断定せず、未確認の最適化を撤回する。

## 2026-09-14 社労士トップ刷新・問い合わせ受任フロー

- [x] 統合指示書、共有メモリ、最新main、既存差分・共通部品・正本を確認
- [x] 4言語の変更前PC/SP画面とローカル性能を記録
- [x] 代表実写真4候補を比較し、人物画素を保持して生成背景と合成
- [x] 新ヒーロー → 3依頼方法 → 4区分フローバナー → 既存料金比較
- [x] /labor/nagareを8段階・3例・資料区分・6FAQ・相談導線へ更新
- [x] 4言語の本文・metadata・リンク、既存gaEventを利用する計測
- [x] 型検査・lint・関連テスト・build
- [x] 5幅・4言語、操作・計測・アクセシビリティ・性能検証
- [x] 独立レビュー用資料と未追跡ファイルを含む差分パック

基準HEAD: 04c28cd2e33d4fa7a0b1b484066180b1b7600d84。開始時clean。
作業場所は専用worktree。料金正本・フォーム送信処理・proxy・他事業は変更しない。
当初はローカルレビューで停止。後続の明示指示により、検証後のPR・マージまで進める（末尾参照）。本番DB更新は行わない。

### 追加修正：代表写真の選び直し・ヒーロー右余白
- [x] プロフィール撮影の「1」「2」をFinderで開く
- [x] ヒーローを本文の右280px予約領域から独立させ、写真を画面右端まで広げる
- [x] 代表名を左コピー下へ移し、追従案内との重なりを避ける。後の指定で写真加工注記・トップ上部の事務所名と地域肩書きは削除
- [x] 型検査・変更部品lint・関連36テスト
- [x] ユーザー指定0169に差し替え、ズボンを上着と同色・控えめな顔補正・靴を写さない構図・植物背景を反映
- [x] ユーザー確定コピー「仕事が楽しい。そんな職場に」を2行配置、4言語を同趣旨へ更新
- [x] 追加修正後の最終build（2ワーカー、371/371ページ）・4言語5幅の実画面・最終buildの5条件確認・レビュー一式を更新

0169の人物補正はユーザーの明示的な追加依頼による。初回0079の画素保持の検証を0169に流用しない。

- [x] 追加指定のトップ説明文を4言語に反映し、STEP 5の未装飾リストをPC2列・狭幅1列の箇条書きへ修正（4言語5幅確認）。

### 追加指示：実装完了後のマージ
- ユーザーの「全部終わったら実装してマージしてください」により、当初のローカル停止指定を更新。検証完了後はcommit・push・PR・squash mergeまで進める。
- [x] 最新mainとの競合なし、変更全体の型検査・lint・706テストを確認
- [x] 最新コピー・肩書き・STEP 5の修正を含む最終build（371ページ）と4言語40条件の実表示・操作を確認
- [x] 変更差分を確認し、PR #349 のチェック成功後にマージ（f028b56）

## 2026-09-14 社労士フッターのサービスリンク修正

- [x] 公開フッターの4リンクがすべて業務案内ページを指し、同ページでは移動しないことを再現
- [x] 助成金は専用ページ、保険手続き・給与計算・就業規則は対応する説明箇所へ接続
- [x] 4言語共通のアンカーと固定ヘッダー用の移動余白を設定
- [x] 型検査・lint（既存warning 1件・error 0）・710テスト・ローカル本番形式ビルド（371ページ）・4言語のクリック動作を確認
- [x] 同じアンカーを再度押しても目的箇所へ戻るよう、社労士フッターのアンカー3件はブラウザ標準のリンクを使用
- [ ] 既存の実装・マージ指示に従いPR・マージ、公開リンクを確認

## 2026-09-14 三本線メニューからグループサイトへ移動

- [x] 3サイト共通のメニューと正式なリンク先・4言語表示を確認
- [x] 他の2サイトと士業ドットコムを三本線メニューに追加
- [x] 小型画面でメニュー内スクロールと下部の言語切替・お問い合わせの表示、開閉時のスクロール制御を確認
- [x] 3サイト×4言語の実表示、公開フラグの両状態の回帰テスト、型検査・lint（error 0、既存warning 1）・730テスト・build（371ページ）を確認
- [x] 三本線メニューから4つの公式サイトへ実際に移動できることを確認
- [ ] 検証資料を保存し、既存の指示に従ってPR・マージ

## 2026-09-14 日次コラム6本（Issue #350）の復旧

- [x] 引継ぎパックのハッシュ照合、最新 main（489fd2c）とパッチ基点の一致確認、パッチ適用（適用後ツリー e5e9f80a 一致）
- [x] 原稿6本×4言語の修正点（対抗要件の施行日、協定24か国の出典、令和8年法律第45号の公布日、着手前に、事業体名の日本語統一、日付2026-09-13）を確認
- [x] 英語版3か所の文末ピリオド欠落を補正し、不動産・行政書士の seed を再生成
- [x] seed dry-run／emit-ts（3分野、NG 0・no-op）、lint（error 0）、tsc、730テスト、使い捨てDBでの本番ビルド（371ページ）、Actions 条件7ケースを確認
- [x] `recover/columns-20260914` で draft PR を作成（マージ・デプロイ・DB投入は浦松の指示待ち）
- [ ] 資格者レビュー（法務省通知の本文確認を含む）→ マージ → デプロイ → 管理画面から3分野を投入 → 24URLの200・言語・canonical・sitemap を確認 → Issue #350 を閉じる


## 2026-09-15 Daily Columns 修復経路
- [x] 実行34877853793・PR #353・原稿artifactを照合
- [x] 検証ログが隠しディレクトリ除外で消える不具合を修正
- [x] PR #353のfix条件修正を先行して適用（原稿は含めない）
- [x] GitHub公式glob・式評価器で旧動作と修正後を検証
- [x] actionlint・差分検査
- [ ] mainへのマージと修正後workflowの実走（承認後）


## 2026-09-18 お客様の声（依頼済み範囲）

- [x] 元会話の21件と既存構成を確認、origin/mainから独立worktreeを作成
- [x] 各事業のトップに3件の全文と全7件の専用ページへの導線を実装
- [x] 原文・匿名表記維持、4言語、参考訳と原文の区別、成果保証を避ける注記
- [x] フッター・sitemap・llms.txt・canonical/hreflang・CollectionPage/ItemList
- [x] 原文一致、型、lint、775テスト、ビルド（隔離ローカルDB）、公開フラグ両状態
- [x] 12ページ×320/768/1440pxの36ケース、12トップ×390px、84リンク、原文開閉（クリック・Enter）を確認
- [x] 変更内容・検証結果・確認画像をレビュー用に整理

レビュー：本件はコラム制作ではなく、依頼済み顧客体験談の掲載。日本語本文は編集せず、翻訳は参考訳として併記する。評価点・星・Review/AggregateRatingは生成しない。現在の実体は1リポジトリ内の3事業ルートであり、その構成を維持する。

検証結果：日本語21件完全一致・3言語参考訳63件。775テスト成功。既存フッターimg警告1件のみ。初回ビルドは既存環境のDB認証で停止したため、公開UI辞書のみの隔離DBで383ページの静的生成まで通過。社労士公開オフ時は4言語404/noindex、RSC本文漏出なし、sitemap/llms.txt非掲載を実測。


## 2026-09-18 グループ紹介を3事業に統一

- [x] 最新main・公開ページ・4言語の翻訳DBを確認
- [x] 不動産・行政書士・社労士・士業ドットコムの現行グループ説明を調査
- [x] 未適用の開業パッチを確認し、共通紹介・概要表の追加パッチを用意
- [x] llms.txtの構成見出し・説明・表と共通metadataを開業状態に合わせる
- [x] 対象翻訳28項目のみ更新し、DB再読込と対象外JSONの一致を確認
- [x] 公開表示をキャッシュ再検証後に確認（8ページ・24表示項目）
- [x] 型検査・lint・775件の既存テスト・コラムdry-run・変更差分を確認
- [x] PR提出用の差分・検証記録・本番適用状況を整理（mergeは指示後）

### 検証記録

- 型検査・変更3ファイルのlint: 成功。vitest: 50ファイル・775件成功。
- 開業パッチの既存43件も最終修正後に成功。28項目のfrom/toが更新実績と一致。
- llms.txtを開業前後で評価し、見出し・説明・構成表が2事業/3事業で一致、分離受任表現も維持。
- 社労士コラムdry-run: 106本、終了0。FAQ数の既存警告2件（5件・8件）あり。生成previewは変更前に戻した。
- 士業ドットコムの最新mainと本番llms.txtは3事業表記済みのため変更なし。
- 公開3サイト×4言語の概要ページと士業ドットコム/about・llms.txtはHTTP 200。
- 本番翻訳28項目を更新。対象外JSONのハッシュが4言語すべて変更前後で一致。
- Vercelで本番の/about・/legal/about×4言語の8パスタグを再検証し、公開HTML内の24表示項目が修正値と完全一致。
- llms.txtと共通metadataはソース修正のためPRのmerge・デプロイ待ち。


## 2026-09-18 3サイトの健全性・パフォーマンス改善

- [x] 最新mainを分離worktreeに取得し、公開Lighthouseトレースで初期処理を切り分け
- [x] 未使用JS/CSSの内訳と既存チャット遅延読み込みを確認
- [x] フォントの連続レイアウトを抑え、画像配信を軽量化
- [x] 共通CSP・埋め込み制限と4言語FAQ見出しを修正
- [x] 同条件の修正前後計測、4言語表示・操作、型・lint・テスト・ビルドを確認
- [x] PR提出用の差分と検証記録を整理（merge・本番反映は指示後）

検証記録：`docs/performance-20260918.md`。モバイルTBTは3サイトで改善。LCPは概ね横ばい、行政書士PCのTBT改善は未確認。本番ビルド・型・778テスト成功。未使用JS/CSSを字種や機能ごと削除せず、描画とフォント適用順序を変更した。

## 2026-09-20 賃貸自動取込
- [x] 共有メモリ・既存物件機能・実メール・ITANDI BB詳細の確認
- [x] 賃貸項目・月額表示・公開鮮度判定
- [x] メール候補抽出・検証・画像・冪等取込
- [x] 管理画面の導線・実行手順
- [x] テスト・型・lint・build確認
- [x] 実データdry-run・本番反映待ち事項を整理

検証：型・変更ファイルlint・858テスト成功。全体buildはコンパイル・型工程に成功し、既存ローカルDB接続のプレースホルダーによりページデータ取得で停止。追加指示の広告可・画像・厳しい条件・多いペット頭数を反映。3ポータルの号室別確認を実施し、実物件はHOME’Sで同一001号室の掲載終了を確認して除外。四葉管理画面の認証を確認。本番反映・別セッションレビュー・本番の通し検証は未実施。定期実行は毎日9時で停止状態。

## 2026-09-20 物件探しの流れ・公開サンプル
- [x] 既存導線・共通メモリ・公開権利を確認
- [x] 公開用架空サンプルへの差替えをユーザーが承認
- [x] 9ページPDFとトップ・流れ・介護ページの導線を実装
- [x] PDF・画面・型・lint・テストの検証（ホーム全体は公開環境で確認）
- [ ] 公開・最終確認
## 2026-09-22 物件比較サンプルの用途別展開

- [x] 既存の通所系福祉施設サンプルを3ページに限定する
- [x] グループホーム・オフィス・飲食店・投資物件の比較PDFを4言語で生成する
- [x] 通所系福祉施設サンプルも4言語で揃え、ロケールごとのPDFへ接続する
- [x] 各ページの内容・CTA・PDFを同じ用途に揃える
- [x] 全PDFの全ページを描画し、文字欠け・重なり・内容を検査する
- [ ] 型検査・lint・関連テスト・本番ビルドを実行する

### レビュー

- 20PDF・180ページを画像化。全ファイル9ページ、テキスト抽出可能、文字欠け・重なり・表のはみ出しなし。
- 既存の通所系資料は `/nagare`・`/kaigo`・`/toushi/shitei-shinsei` の3ページ。専用版は `/group-home`・`/office`・`/inshokuten`・`/toushi` に配置。トップページからは削除。
- ローカルbuildはコンパイル・TypeScript成功。DATABASE_URL未設定のため、既存コラム取得でページデータ収集時に停止。Vercel Previewで全体buildと実画面を確認する。

## 2026-09-22 既存挿絵によるコラム詳細の先行修正

- [x] 公開ページ監査・既存20テーマ画像・3詳細テンプレートを確認
- [x] 既存画像だけを使う選択規則とレスポンシブ配置を設計
- [x] 画像1枚あたりの使用上限を設けない方針を確定
- [x] 日本語正本から画像を一度決める共通resolverを実装
- [x] 不動産・行政書士・社労士の共通コラムヒーローを実装
- [x] visible image・OG/Twitter・BlogPosting JSON-LDの画像を統一
- [x] resolver・使用上限なし・4言語alt・画像実在性のテストを通す
- [x] 型検査・変更ファイルlint・全テスト・buildを通す
- [x] 4言語・390/768/1440pxの実画面とHTMLメタデータを確認
- [x] 差分・検証結果を整理しPRを作成

### レビュー

- 記事固有`ogImage`→slug指定→テーマ一致→事業別フォールバックの順で解決する。日本語正本から一度だけ決め、4言語で同じsrcを使う。
- 画像1枚あたりの使用上限は設けない。同一テーマ25記事が同じ最適画像を選ぶ回帰テストを追加した。
- 20テーマ画像の実在、危険な`ogImage`スキームの除外、相対・絶対URL、4言語alt、JSON-LD絶対URLの二重連結防止を含む1,031テストが成功した。
- TypeScript、変更ファイルeslint、Next.js 16.3.5の本番ビルドが成功。使い捨てDBに3事業の代表記事を入れ、417ページを静的生成した。本番DBは変更していない。
- 3事業×4言語の12ページで、visible image、OG、Twitter、BlogPosting JSON-LDが同じ画像を指すことを確認した。390px・768px・1440pxで画像は16:9を維持して表示された。
- 768pxの不動産ページに既存ヘッダーナビ由来の横溢れが76pxある。挿絵は705×397pxでviewport内に収まり、今回の変更によるものではないため対象外とした。

## 2026-09-22 /gakku に 3S1K 通学区域マップを設置

- [x] 同梱の地図（自己完結・noindex）と埋め込み部品をリポジトリの置き場所・エイリアスに合わせて配置
- [x] 導入文の直後・H2「「3S1K」とは何を指しますか？」の直前に強調セクションを挿入（日本語のみ）
- [x] 既存の強調ブロックのデザイントークンで組み、新しい色を足さない
- [x] iframeの高さ追従を修正し、内部スクロールを出さない
- [x] 型検査・変更ファイルlint・全テスト・本番ビルドを通す
- [x] PC幅1280pxとスマホ幅390pxで実画面を確認し、地図内リンクの遷移先を確認
- [ ] PRレビュー・マージ・本番反映（浦松の指示を待つ）

### レビュー

- 地図は `public/gakku/3s1k-map.html`（自己完結・noindex・sitemap未収載）。埋め込みは `src/components/gakku/GakkuMapEmbed.tsx`。
- 設置は日本語の `/gakku` のみ。地図の注記・凡例・校名が日本語のため en / zh-tw / zh には出さない（実測：ja=1参照、他3ロケール=0参照）。
- セクションは既存の強調ブロックと同じ `rounded-xl border border-border bg-surface-dim`＋`font-serif text-xl font-semibold text-ink` の見出し。色の追加なし。
- **高さ追従のバグを修正**。地図側の `postMessage` はhydrationより前に飛ぶため初回を取りこぼし、iframeが640pxのまま内部スクロールが出ていた（実測：中身はPC 992px・スマホ 1122px）。同一オリジンなので `ResizeObserver` で中身を直接見る方式に変えた。修正後はiframe高さ＝中身の高さで一致し、学校一覧を開くと 992→1222px（PC）・1122→1352px（スマホ）と追従する。
- 1280px・390pxとも地図内の横スクロールなし。凡例はPCのみ（スマホは右一覧が凡例を兼ねる設計どおり非表示）。地図内「番・号の表と取扱物件を見る」から `target="_top"` で `/gakku/seishi` へ親ページごと遷移することを確認。
- CSPは `base-uri 'self'; object-src 'none'; frame-ancestors 'self'` のみ。script-src等を足していないため、同一オリジンiframe・cdnjs・国土地理院タイル・Google Fontsはいずれも許可範囲内（配信ヘッダを実測）。
- 検証環境の制約：この作業環境の外向き通信ではcdnjsと国土地理院タイルが遮断されるため、Leafletは同一バージョン（1.9.4）をnpmから、タイルはダミー画像を差し込んで描画確認した。区域ポリゴン8件（全域4・号分かれ4）・校名ラベル4件・学校カード4件は実物で確認済み。**本番のタイル画像そのものはPreview/本番で要確認。**
- ローカルbuildは使い捨てPostgresを立てて完走（417ページ）。本番DBは触っていない。

## 2026-09-22 /labor の多言語ずれ是正（指示書の事実確認＋PR-1・PR-2）

- [x] 指示書「社労士サイト（/labor）の多言語ずれの是正 2026-09-22」の事実関係をコードで突合
- [x] 不具合A（hreflang）：joseikin・jinin-kijun-roumu に `availableLocales: ["ja"]` を付ける
- [x] 不具合Aの取りこぼし：ja 限定3ページの canonical を `locale: "ja"` に固定
- [x] 不具合B（sitemap）：/labor/about・/labor/contact を4ロケールに是正
- [x] 指示書の誤り訂正：/labor/column も4ロケールに是正（記事はjaのみ、は事実に反する）
- [x] STATIC_LABOR の locales とページの availableLocales の一致をテストで固定
- [x] 型検査・変更ファイルlint・全テスト1050件・本番ビルドを通す
- [x] ビルド成果物のHTMLで hreflang と canonical を4ロケール分実測
- [x] PR-3（3ページの4言語化）＝①shogai-nenkin ②joseikin ③jinin-kijun-roumu の順で実施（浦松の指示：訳案を作り浦松が校閲）
- [ ] 訳文の校閲（浦松）
- [ ] PRレビュー・マージ・本番反映（浦松の指示を待つ）

### レビュー

**指示書の事実確認（コードで突合）**

| 指示書の主張 | 判定 | 根拠 |
|---|---|---|
| joseikin・jinin-kijun-roumu が `availableLocales` 未指定＝4言語のhreflangを広告 | 正しい | `src/lib/seo.ts` の `buildHreflang`：未指定＝`HREFLANG_ORDER` 全件 |
| 3ページとも本文がJSX直書きの日本語 | 正しい | `COPY: Record<LangCode, …>` を持たない |
| saiyo・kaigo-roumu が手本 | 正しい | saiyo＝同一ファイル内COPY、kaigo-roumu＝`src/lib/labor/kaigo-service-copy.ts` |
| /labor/about・/labor/contact は訳済みなのに sitemap が ja 限定 | 正しい | contact＝`CONTACT_LABELS`/`CONTACT_INTRO` が4ロケール（ローカルビルドのHTMLで実測：H1が Contact／聯絡我們／联系我们）。about＝`scripts/backup/translations-*.json` の `labor.aboutPage` が4ロケール |
| shogai-nenkin は「宣言は正しい」 | **誤り（半分）** | hreflangは正しいが、`locale`（リクエストロケール）を渡しており /en/・/zh/・/zh-tw/ が自己canonicalの重複URLになっていた |
| /labor/column は「労務コラムは日本語のみ。現状で正しい」 | **誤り** | `labor-columns-seed.ts` の全114本が en / zh-tw / zh の訳を持ち、`locales: []`＝全ロケール公開。記事URLは既に4ロケールで sitemap に出ている |
| /legal にも同じずれがあるか（未検証事項） | **ずれ無し** | ja先行の3ページとも `availableLocales: ["ja"]` ＋ `locale: "ja"` 済み |
| hreflang は `hrefLang`（キャメルケース）で出力される | 正しい | ビルド成果物で `hrefLang="ja"` を確認（`hreflang=` は0件） |

**やったこと**

- ja限定3ページ（joseikin・jinin-kijun-roumu・shogai-nenkin）に `availableLocales: ["ja"]` と `locale: "ja"` を入れた。
  指示書は `availableLocales` だけを足す指示だったが、それでは canonical の重複が残る。
  リポジトリには2026-08-10（PR#210・#211）に確立した型があり、/legal・/toushi・/minpaku 等の ja 限定ページは
  いずれも `locale: "ja"` を明示している。同じ型に揃えた。**本文は1字も変えていない。**
- sitemap の /labor/about・/labor/contact・/labor/column を4ロケールに是正。
- `sitemap-labor.test.ts` に、STATIC_LABOR の `locales` とページ側 `availableLocales` の一致を全エントリで突合する番人を追加した。
  ja限定ページが `locale: "ja"` を持つことも同時に検査する。**人間の注意力に頼らない形にしたのが今回の本体。**

**検証**

- `tsc --noEmit` ＝ 0件／変更5ファイルの `eslint` ＝ 0件／`vitest run` ＝ 72ファイル1050件すべて通過
- 追加テストが効くことを確認：/labor/about を `["ja"]` に戻すと2件が落ちる
- 使い捨てPostgres（migrate deploy 済み・本番DBは未接触）で `NODE_ENV=production npm run build` を完走
- ビルド成果物のHTMLで実測（ja・en・zh-tw・zh の12通り）：3ページとも `hrefLang="ja"` と `hrefLang="x-default"` の2つだけ、canonical は接頭辞なしの ja URL

**未了・申し送り**

- **PR-3（3ページの4言語化）は着手していない。** 指示書自身が「判断留保:有（3ページを訳すか ja 限定で確定させるかの最終判断）」としており、
  §4が「機械翻訳をそのまま入れない」としているため、訳文の作成方針を浦松に確認してから行う。
  本PRの `availableLocales: ["ja"]` は4言語化の前提工程でもあり、訳を入れる際は4言語に置き換える（sitemapと同時に）。
- /labor トップの非日本語版にかなが残る件（指示書§5）は未検査。

### 追記（PR-3：3ページの4言語化）

**やったこと**

指示書の順序どおり ①`shogai-nenkin` ②`joseikin` ③`jinin-kijun-roumu` の3ページを en / zh-tw / zh に展開した。
方式は手本B（`src/lib/labor/*-copy.ts` に COPY を切り出す・既存＝`kaigo-service-copy.ts`）に統一し、新しい方式は発明していない。
sitemap の `locales` もページの `availableLocales` と同時に4言語へ直した。

**日本語版は1字も変えていない（実測）**

3ページとも、移行前のビルド成果物と移行後のビルド成果物で可視テキストを差分比較し、**差分0**。
移行前のJSXがソース改行で出していた半角スペース（`shogai-nenkin` 2か所・`joseikin` 5か所）も、
テキストノードの分かれ方（`最終更新：`＋日付）も、そのまま保存した。
かな文字数も指示書の実測値（ja＝1,271／793／820）と一致した。

**翻訳の規律**

- 日本語版にない事実・数値は足していない。見出し数・段落数・表の行数・箇条書きの数は日本語版と同じ
- 制度名・法令名は日本語の原名を残し、各言語の説明を併記（障害年金／助成金・補助金／常勤換算／社会保険労務士法／障害者総合支援法 ほか）
- 事務所名は全ロケールで日本語表記のまま。分離受任は既存表記（另行簽訂契約承辦／另行签订合同承办）
- 禁止語（`COMPLIANCE_SCAN_TERMS` 62語）は4ロケールとも0件
- 報酬額・年金額・等級表・時効は `shogai-nenkin` の訳でも書いていない。`joseikin` の成功報酬20%・顧問契約限定は訳でも落としていない

**翻訳して初めて分かった問題（`jinin-kijun-roumu`）**

このページは日本語版にしか存在しない2ページへリンクしていた。

| リンク先 | 実態 | 対処 |
|---|---|---|
| `/legal/column/group-home-sewanin-seikatsushienin-haichi` | コラムの `locales` が `["ja"]`。`[slug]/page.tsx` が `isLocaleAllowed` で弾くため**ロケール接頭辞つきURLは404** | 訳文では接頭辞を付けず日本語版URLへ送り、ラベルに「日文」を添えた |
| `/reasons` | `availableLocales:["ja"]`。接頭辞つきでも日本語本文を返す | 同上 |

そのまま `addLocalePrefix` を通していたら、英語版・中国語版から404へのリンクを出すところだった。
`ja` では `addLocalePrefix` が恒等なので、日本語版の出力とリンク先URLは変わっていない（実測で一致を確認）。

**浦松の判断をお願いしたい点**

`joseikin` の日本語リードは「社会保険労務士の**独占業務**です」と業務独占を断定している。
一方 `shogai-nenkin` は、石井弁護士の確認前であることを理由に意図的に「社会保険労務士の**業務**です」へ弱めている
（同ファイル冒頭コメント）。日本語を書き換えない方針（指示書§4）に従って日本語のまま忠実に訳したが、
2ページの強さを揃えるかどうかは判断を仰ぎたい。`joseikin-copy.ts` 冒頭にも同じ申し送りを書いた。

**検証**

- `tsc --noEmit` 0件／変更ファイルの `eslint` 0件／`vitest run` 1050件通過／本番ビルド完走（405ページ）
- ビルド成果物で12通り（3ページ×4ロケール）実測：hreflang は4言語＋x-default、canonical は各ロケール自身、
  内部リンクはロケール接頭辞つきでリンク先が全てビルド済み、禁止語0件
- 非日本語版のかな＝en 26〜43／zh-tw・zh 30〜49。基準線（26〜28）を上回る分は、
  原名を残した日本語の制度名（障害年金・親なき後・キャリアアップ助成金・正社員化コース・
  サービス管理責任者・世話人）によるもので、未翻訳の残留ではない（実測で内訳を確認）

## 2026-09-22（続き） 送信完了ページの多言語化とフォーム遷移の是正

指示書§5の申し送り「/labor トップの非日本語版にかなが残る（285前後）」を確認した結果の作業。

- [x] `/labor` トップの残留を確認 → **未翻訳の残留なし**（設計どおり）
- [x] `/labor` 配下18ページ×4ロケールを一巡し、残る実害を洗い出し
- [x] `ContactForm` の遷移にロケール接頭辞を付ける
- [x] `/labor/thanks`・`/legal/thanks` を4言語化（既存訳に統一）
- [x] `/labor/thanks` の `<title>` 二重を修正
- [x] 3つとも番人テストで固定し、戻すと落ちることを確認
- [ ] 訳文の校閲（浦松）
- [ ] PRレビュー・マージ・本番反映（浦松の指示を待つ）

### レビュー

**指示書§5の申し送りは空振り（/labor トップは設計どおり）**

`/en/labor` のかな285の内訳を実測した。

| 内訳 | かな |
|---|---:|
| `<details>` の中（開閉できる日本語原文・PR #367 の設計） | 248 |
| 共通レイアウト（四葉グループ・士業ドットコム・浦松丈二） | — |
| 匿名のお客さま名（Wさん（50代・女性）／P社（サービス業・従業員6名）） | — |
| **上記以外（＝未翻訳の残留）** | **0** |

`<details>` の外に残る日本語は共通レイアウトと匿名名だけで、ページ自身が
"The Japanese originals and the anonymous names supplied by clients are retained." と明示している。
指示書が「仕様どおり」と判断した `/labor/voices`（かな460）と同じ設計が、トップの声セクションにも適用されているだけだった。
**別PRは不要。**

**代わりに見つけた3つの実害（連鎖していた）**

| # | 不具合 | 影響範囲 |
|---|---|---|
| 1 | `ContactForm` の `router.push(thanksPath)` がロケール接頭辞を付けていない | 3レーン全部。/en/・/zh-tw/・/zh/ から送信した人が一律で日本語版URLに落ちる |
| 2 | `/labor/thanks`・`/legal/thanks` の本文がJSX直書きの日本語 | 4ロケールとも日本語の完了画面 |
| 3 | `/labor/thanks` の `title` に事務所名 → layout の template と二重 | 実測「送信完了 \| 四葉社会保険労務士事務所｜四葉社会保険労務士事務所」 |

**1が2を隠していた。** 誰も非日本語版の完了画面URLに到達しないので、日本語のままでも気づけなかった。
1だけ直すと非日本語版URLに到達するようになり、そこが日本語という状態が露出する。**2つを同時に直す必要があった。**
3は 2026-09-05 月次点検 NEW-TECH-1 が `/labor/contact`・`/labor/about` で直した型と同じで、本ページだけ漏れていた。

不動産レーンの `/thanks` は翻訳辞書方式で4ロケールとも訳済みのため、1の修正は改善のみで影響なし（実測で確認）。

**訳文は既存訳に統一した**

不動産レーンの翻訳辞書 `thanks.*` に同じ日本語からの訳が既にあったため、title・body はそれに合わせた
（同じ日本語の訳が3レーンで食い違うのを避ける）。1つだけ合わせていないのが戻り先のラベルで、
辞書の `common.backToTop` は「トップに戻る」を Back to top／返回頂部／返回顶部 としているが、
このリンクの遷移先はページ先頭へのスクロールではなく各レーンのトップページなので、
`CONTACT_LABELS.home`（Home／首頁／首页）に合わせた。**辞書側はDBの値なので本PRでは触っていない。**

**日本語を1か所だけ意図的に変えた**

`/labor/thanks` の `title` から事務所名を外した（`送信完了 | 四葉社会保険労務士事務所` → `送信完了`）。
本文の文言は変えていない。2026-09-05 に同じ判断が兄弟ページで下されている型に揃えただけだが、
`<title>` の表示は変わる（noindexページのためSEO影響はない）。

**検証**

- `tsc` 0件／変更5ファイルの `eslint` 0件／`vitest run` **1099件**通過（+49件）／本番ビルド完走
- 番人テストが3つとも効くことを確認：title に事務所名を戻すと5件、接頭辞を外すと2件、本文を日本語直書きに戻すと4件が落ちる
- ビルド成果物で実測：`/labor/thanks`・`/legal/thanks` とも4ロケールで H1・本文・戻り先が訳され、
  かなは 58/60/60 → **26/28/28**（共通レイアウトの基準線ちょうど）。`/labor/thanks` の title 二重も解消

**申し送り**

- 翻訳辞書の `common.backToTop`（Back to top／返回頂部／返回顶部）は、遷移先がトップページであることを踏まえると誤訳。DBの値のため別途の判断。
- 翻訳辞書の `thanks.metaTitle` に旧ブランド名「四葉パートナーズ」が残っている（不動産レーン）。本PRの対象外。

## 2026-09-23 物件画像の修正と自動化

- [x] 不鮮明画像と重複の原因確認（72×96サムネイル・同一画像の反復取得）
- [x] 掲載元拡大ギャラリー19点取得、帯入り募集図面1点除外
- [x] プレミスト文京千石205を18点に差し替え、DB条件維持・公開全点確認
- [x] 原画像検査・画素重複除外・バックアップ・同時更新防止を共通化
- [x] Browser取得/アップロード関数、通常CLIと認証済みコネクター経由の代替手順
- [x] 全1,110テスト・型検査・変更箇所lintを通過。Sharp 0.35.4でも画像回帰11件と実画像18点を確認
- [ ] PR作成

## 2026-09-24 GSC点検の是正（canonical・hreflang・言語切替）

2026-09-23 に GSC のエクスポート（全既知ページ／送信済みページ）と本番 sitemap 全1,615URLの取得で確認した3件を直す。
未登録1万件の84%はフォント（robots.txt ブロック）で、sitemap 内の実ページは「クロール済み - 未登録」28件・登録済み778件＝構造上の問題なし。
本PRは登録率そのものではなく、canonical の矛盾と404リンクの発生源を止めるもの。

- [x] `/funin`：en・zh は ja 本文のフォールバックなのに canonical がリクエストロケール（/en/funin・/zh/funin が自己canonical）→ `locale:"ja"`（/kaigo・/kikoku の型）
- [x] `/reasons`・`/network`：sitemap は ja のみなのに hreflang が4言語 → `availableLocales:["ja"]`
- [x] 言語切替：日本語のみ公開の物件で EN・繁體・简体 が404へのリンク → 記事と同じ表に `bukken/<slug>` で公開ロケールを載せる（`getPropertyLanguageIndex`）。写真ページ（/photos）も対象
- [x] 番人テスト：STATIC_REALESTATE・STATIC_LEGAL の locales とページの availableLocales の突合（sitemap-labor.test.ts の型を拡張）＋ /funin・/reasons・/network の canonical/hreflang 実行検査＋物件の言語切替
- [ ] PR作成（マージは指示を受けてから）

**検証**：tsc 0件／変更9ファイルの eslint 0件／vitest 1,316件通過／番人テストは修正前の状態に戻すと3件とも落ちることを確認（/reasons 2件・/funin 1件・レイアウトの配線1件）

**申し送り（本PR対象外）**
- `/nagare` のヒーロー画像 `/hero/realestate-souzoku-16x9.webp` が404（2026-09-23 点検 #1）。既存画像への差し替えは別途
- 学区賃貸一覧84URLは force-dynamic（no-store）。空室鮮度が要らなければ ISR に戻す判断は浦松
- Vercel Skew Protection（`?dpl=`）がフォントURLを増殖させる根本原因。切るかどうかは浦松判断（現状はブロック維持を推奨）

## 2026-09-23 難あり土地（狭小地・再建築不可・共有・借地）出口相談コーナー Phase 1 — claude/pensive-babbage-x4to85

企画書：難あり土地出口相談_AIO-LLMO-SEO実装プラン v1.0（2026-09-24）。第12章の決定は推奨案で仮置き（/wakeari・買取は案B・文京区を中心に東京23区・ja のみ・定点#34〜#39と/jirei 2事例は Phase 3 で別途）。

- [x] 着手前確認：git pull（origin/main c36a605）／本番 /wakeari 配下は404／既存コラム19本の200を実測（4本は接続断で未確認）
- [x] 法令の一次確認：建築基準法6条・42条・43条・53条の2・88条／施行令2条・138条／民法251・252・256・258・262の2・262の3・572・612条／借地借家法3・10・13・19・22・23条／宅建業法32・34・34の2・46条／不動産登記法76条の2（e-Gov API）／東京都建築安全条例3条・3条の2・6条（都例規集）／報酬告示（令和6年告示第949号・高知県公式）
- [x] Wikidata：借地権=Q2630687／旗竿地=Q109361716／共有=Q1939539（共有持分の完全一致なし）／再建築不可・狭小地=該当なし
- [x] `src/lib/wakeari.ts`（5ページの単一ソース：メタ・固定文言・FAQ・役割表・コラム束ね・チェックリスト）※指示書 v2.0（2026-09-24）の固定文言・FAQ設問・役割表・チェックリスト仕様を反映
- [x] 受け皿5枚（/wakeari・/saikenchiku-fuka・/kyoyu・/shakuchi-sokochi・/kyosho）＝RealestateServicePage 方式・ja先行
- [x] 出口チェックリスト（静的JS・送信なし・留保文必置・指示書 5-5 の6問と分岐）
- [x] JSON-LD：Service（shell＋ハブに種類別4件）＋FAQPage＋BreadcrumbList＋ItemList（ハブ）＋Speakable（.wakeari-answer／.wakeari-who・dateModified）
- [x] knowsAbout 5項目（sameAs はラベル完全一致の旗竿地 Q109361716 のみ。借地権 Q2630687 は ja ラベル不一致で付けない）
- [x] llms.txt 節追加／問い合わせ category=wakeari（通知メール表示名も）／sitemap 5件（ja・実更新日の lastmod）
- [x] 内部リンク：/souzoku（3つの出口の節末＋FAQ 2問の回答直下）／akiya／koishikawa／toushi／ryokin／サービスメガメニュー・フッター／既存コラム19本→受け皿（コード側の対応表・DB本文は不変）
- [x] 番人テスト（wakeari-pages.test.ts・25件）＋ labor-contact-order.test.ts の期待値更新
- [x] tsc 0件／eslint エラー0／vitest 1,376件通過／next build 通過（使い捨てのローカル Prisma Postgres・5ルート SSG）／next start への到達性チェック 5枚 ALL OK（200・canonical・noindex なし・JSON-LD parse・FAQ 文言一致・sitemap 5URL・llms.txt・コラムの受け皿ブロック・各ページのリンク・問い合わせ category）
- [x] PR（draft）#421 https://github.com/yotsuba-samurai2/pj-yotsuba-fudousan/pull/421 。マージ・デプロイ・GSC は浦松 → **2026-09-24 07:40 JST 浦松がマージ**（squash d2d2f7b。直前に別セッションが main（#420）を取り込み、共有ファイルの競合を解消）。台帳＝効果待ち・再着手可能日 2026-10-08。本番の到達性チェックと GSC 登録は浦松（デプロイ後）

### レビュー記録（2026-09-23）
- 実装方式：既存の RealestateServicePage シェル（koishikawa と同じ ja のみの作り）。新しい仕組みは作らず、SpeakableJsonLd と shell に任意 prop を足しただけ（既存出力は不変）。
- 指示書 v2.0 を途中で受領し、固定文言（事業者主語の一文・分離受任の一文・直答ブロック・留保1行・チェックリストの留保文）と FAQ 設問・役割表・チェックリストの仕様を差し替えた。「当社が買主となる」の文言は削除。
- 指示書と食い違った点は実査表（docs/wakeari/00_jissa.md）と PR 本文に記載：GeoCircle に @id が無い／Offer は価格なし／固定ページの lastmod は実更新日のみ／md 原稿は作らず TSX を正本に。
- 未検証：改正法の法律番号・施行政令番号・告示原文・条ごとの最終改正日・「提携する買取業者」の書面の有無（U12 と同じ論点）・Rich Results Test。

## 2026-09-24 難あり土地 出口相談コーナー Phase 2 — 新規コラム8本（ja・zh-tw）— claude/pensive-babbage-x4to85（#421 マージ後に main から作り直し）

企画書 v1.0 §3-3 の8本。指示書 v2.0 §11（Phase 2＝sitemap 再取得→第7条の型で md→seed dry-run→--emit-ts→PR。投入・GSC は浦松）。

- [x] 着手前確認：本番 sitemap（449URL）に 狭小地・隣地売却・43条2項の申請主体・セットバック・がけ擁壁・所在不明共有者・同時売却等価交換・再建築不可のリフォーム範囲 の記事なし
- [x] 法令の一次確認（e-Gov XML／API v2）：建築基準法2条13〜15号・6条1項2項・6条の4・19条4項・44条1項／施行令2条・138条／施行規則10条の3（現行版 2026-04-01・令和7年国交省令80号）／民法25・30・209・251・252・262条の2・262条の3・264条の2・264条の3・572・612条／不動産登記法41条・76条の2／借地借家法3・10・13・19・38条／宅建業法32・34・34条の2・35条1項2号・46・47条の2／盛土規制法（昭和36年法律191号・令和4年法律55号 2023-05-26施行）／2025-04-01 施行の建築基準法改正＝**令和4年法律第69号（API v2 で確定＝Phase 1 の未検証事項を解消）**／東京都建築安全条例3・3条の2・6条（例規集 g101RG00001306）／文京区：建築審査会・許可認定申請書・盛土規制法（区全域 2024-07-31 指定）
- [x] 原稿 ja 8本：scripts/realestate-columns/77〜84（各 5,600〜6,800字。結論→疑問文H2→表→誰に相談→FAQ4→出典→※3行→署名）
- [x] ARTICLES に8エントリ（publishedAt 2026-09-24・category「売りにくい土地・建物」・hubLinks＝/wakeari 配下）
- [x] src/lib/wakeari.ts の対応表に8 slug（投入前は DB に無いので表示されない＝404 リンクなし）
- [x] zh-tw 翻訳 8本（frontmatter・絶対URL・四葉不動產株式會社。4サブエージェントで並行作成→構造一致を機械確認・調查士に統一）
- [x] npx tsx scripts/seed-realestate-columns-daily.ts → NG 0（新規8本に注記なし。既存2記事の WARN 6件のみ）→ --emit-ts（73本）
- [x] tsc 0／eslint 0／vitest 94ファイル・1,389件（wakeari-pages.test.ts の対応表 19→27）
- [x] draft PR #423 https://github.com/yotsuba-samurai2/pj-yotsuba-fudousan/pull/423 。マージ・管理画面投入（/admin/columns/seed-realestate-daily）・GSC は浦松

## 2026-09-24 難あり土地 出口相談コーナー Phase 3 — 繁体字版2枚・/jirei モデルケース⑤・定点 #34〜#39 — claude/pensive-babbage-x4to85（#429 マージ済み）

- [x] /zh-tw/wakeari/kyoyu・/zh-tw/wakeari/shakuchi-sokochi（日本語版の逐語訳・ja の出力は不変）。/souzoku/taiwan と同じ ja＋zh-tw の型＝en・zh は日本語へフォールバック、sitemap は2枚だけ ["ja","zh-tw"]
- [x] 共通の繁体字文言 src/lib/wakeari-zh-tw.ts、WakeariRoleTable・WakeariSources に locale
- [x] /jirei にモデルケース⑤（再建築不可の旗竿地を貸して持ち続ける）
- [x] docs/wakeari/92_teiten-34-39.md（企画書 §9 の定点6行）
- [x] PR #429 → 浦松がマージ（squash d1180e7）
- 保留（浦松の判断待ち）：/jirei の「共有×相続」モデルケース、/jirei ケース②の「提携する司法書士」の文言（#424 の判断と食い違う）

## 2026-09-24 不具合：出口チェックリストの「この内容で相談する」で回答が消えていた — claude/pensive-babbage-x4to85（浦松報告）

- [x] 再現（ローカル next dev＋Chromium）：6問回答 → CTA → /contact?intent=wakeari。カテゴリは入るが「ご相談内容」は0文字
- [x] 原因：チェックリストは /contact?intent=wakeari へ遷移するだけで、回答を渡す仕組みが無かった（ボタンの文言と実装の食い違い）
- [x] 修正：src/lib/shared/contact-prefill.ts（sessionStorage・intent 一致で1回読んだら消す・30分で失効・URL に載せない）、wakeari.ts に結果の計算と本文の生成、チェックリストの CTA で書き、ContactForm で読む（入力途中の本文は上書きしない）
- [x] ローカルで4通り確認（6問回答／再読み込みで二重に入らない／0問ならカテゴリだけ／通常の /contact は空）
- [x] tsc 0／eslint 0／vitest 115ファイル・1,663件（contact-prefill.test.ts を追加）
- [x] Vercel プレビューの配信 JS に、書く側（/wakeari）と読む側（/contact）の両方が入っていることを確認
- [x] draft PR #431 https://github.com/yotsuba-samurai2/pj-yotsuba-fudousan/pull/431 。本番ドメインでの操作確認（このコンテナの Chromium は証明書を検証できない）・マージは浦松
- [x] 浦松の指示でマージ（squash 0034806）。本番の配信 JS に書く側・読む側の両方、/wakeari に新しい説明文を確認。**浦松の端末で本番の操作確認 OK（2026-09-24）**
- 残るもの：フォームから「戻る」でチェックリストに戻ると回答は空（画面の状態は保存しない設計のまま）
  → **浦松判断 2026-09-24：残さなくていい（対応しない）**

## 2026-09-24 /jirei モデルケース⑥（共有×相続・代償分割）— claude/pensive-babbage-x4to85（#431 に同梱）

浦松の決定（2026-09-24）：企画書 v1.0 決定6＝モデルケース化してよい（「モデルケースを追加」）。ケース②の「提携する司法書士をご紹介します」＝「提携います」（提携している、と解釈）→ 文言は据え置き。

- [x] 骨子＝企画書 §3-4（きょうだいの共有で意見が分かれた実家／売った場合と持ち続けた場合の数字を並べる／売らない出口＝代償分割／行政書士は遺産分割協議書のみ別契約／登記は司法書士・税は税理士）
- [x] /jirei の約束どおり：想定形・完了形の事例談なし・地名・金額・人数・期間・人物属性なし・冒頭注記と「※モデルケースです」は不変・分離受任と紹介料の明示
- [x] 文言は /wakeari/kyoyu の本文・FAQ に揃えた（数字を同じ物差しで並べる・代理や交渉はしない・紛争性は弁護士・相談と査定は無料）。査定は不動産鑑定士の鑑定評価ではない旨を明記
- [x] 回答ブロック・description を「6つ／6例」、キーワードに「共有 相続 実家 代償分割 相談」
- [x] リンク先5本は本番で 200 を確認（/wakeari/kyoyu・共有コラム・換価分割コラム・/legal/services/inheritance・/wakeari）
- [x] 番人テスト src/lib/__tests__/jirei-page.test.ts（件数の一致・見出しの連番・注記の確定文言・想定形と紹介料の明示・一体提供の語）。件数と完了形を壊すと落ちることを確認
- [x] tsc 0／eslint 0／vitest 116ファイル・1,668件
- [x] 本番反映（#431・0034806）を確認：/jirei は6事例・ItemList 6件・canonical は自URL・sitemap 収載。GSC は https://luck428.com/jirei を更新として浦松へ
- [x] **⑥の本文は浦松検収 OK（2026-09-24・修正なし）**。⑤は再検収待ちのまま

## 2026-09-24 グループホーム向け物件・大家募集ページ（/group-home/ooya）Phase 1

指示書：「グループホーム向け物件・大家募集ページ Cowork実装指示書 v1.0（2026-09-24）」。受け皿＝新ページ（募集条件・流れ・専用フォーム・誰がやるか）、深掘り＝既存コラム `/column/kodate-akiya-group-home-ni-kasu`。決定欄は全項目既定値。

- [x] Step 0：作業ツリー清浄・sitemap に `/group-home/ooya` なし・7-2 のコラム10本の存在確認
- [x] Step 1：リポジトリ実査表 `docs/gh-owner/00_jissa.md`
- [x] Step 2：法令一次確認 `docs/gh-owner/01_konkyo.md`（e-Gov 法令 API・参照日付き。取得不能は「未検証」）
- [x] Step 3：原稿 `docs/gh-owner/10_page.md`・`20_form.md`・`21_links.md`・`22_llms.md`・`23_events.md`
- [x] Step 4：ルート `/group-home/ooya`（ja のみ）・専用フォーム・`category=gh-owner`・GA4 イベント・JSON-LD・llms.txt・内部リンク（既存ページはリンク追加のみ）・対応表コンポーネント・`cases` 枠・sitemap・`90_pr-body.md`
- [x] Step 5：`npx tsc --noEmit`／eslint／vitest／禁止語 grep 0件／分離受任の判定語／相対パス／整形本文の目視
- [x] Step 6-7：コミット・push・ドラフト PR #420（マージは指示を受けてから）

**検証（2026-09-24）**：`npx tsc --noEmit` 0件／変更・新規ファイルの eslint error 0（警告は既存の `<img>` 4件のみ）／vitest 93ファイル・1,359件通過（新規：`gh-owner-intake.test.ts`・`gh-owner-page.test.ts`、追記：`contact-api-routing.test.ts`・`labor-contact-order.test.ts`）／禁止語 grep 0件（origin/main 基準）／分離受任の判定語あり／内部リンクは相対パス／既存ページの差分はリンク行の追加のみ（削除行なし）／整形本文はテストで期待出力と照合

**レビュー記録**
- 法令一次確認で指示書の2点を訂正：共同生活援助の定義は障害者総合支援法第5条**第18項**（付録Bの第17項は自立生活援助）／宅建業法第34条の2は売買・交換の媒介契約書面の規定で貸借の媒介を含まないため引用せず、第34条（取引態様の明示）・第46条（報酬）に置き換え
- 既存 API `/api/contact` は `category=gh-owner` のときだけ「電話があればメール任意」（他カテゴリは不変）。メール無しは自動返信を送らず replyTo も付けない
- GA4 は既存のイベント名（`contact_submit`・`contact_submit_error`・`cta_contact_click`・`cta_line_click`・`cta_tel_click`）に `page`/`location`/`form_id`/`property_type` を足す方式。`form_start` は GA4 自動収集と名前が重なるため `contact_form_start`
- sitemap の lastmod は固定ページで出さない既存設計（SEO監査 P1-2）に従い出さない（指示書 Step 4-10 からの意図的な逸脱。dateModified は WebPage JSON-LD と可視表示で持つ）
- 姉妹企画 `/wakeari`（PR #421・未マージ）とは対応表コンポーネント（`column-consult-windows.ts`・`RelatedConsultWindows.tsx`）を共用する設計。後にマージする側で競合解消
- 未検証：文京区の近隣説明の運用（区ページに記載なし）／消防法施行令(6)項ロの入居者区分の数値（総務省令未取得）／既存送信経路のスパム対策は無し（本 PR で新設せず）／Wikidata「共同生活援助」の照合（API が 429）／描画確認は Vercel プレビュー


## 2026-09-24 四葉ペット横断プロジェクト Phase 1（調査・設計のみ）— claude/zealous-fermat-t7x0f2

指示書：「四葉ペット横断プロジェクト 改訂版マスター実装指示書」版2.0（2026-09-24）。**Phase 1 はアプリコード・DB・ジョブ・公開サイトを変更せず、報告書を提出して停止する**（第0・20章）。

- [x] 作業場所・Git（clean・origin/main と差分0）・オープンPR（#424・#419 は対象外）を確認
- [x] 4領域を並行調査：学区フィード／フォーム・GA4・GH大家LP／ルート・多言語・SEO・JSON-LD／ペット関連の既存記事
- [x] 報告書 `docs/pet-project/00_phase1-report.md`、別セッション検証用 `docs/pet-project/01_handoff-for-verification.md`
- [x] draft PR #425 https://github.com/yotsuba-samurai2/pj-yotsuba-fudousan/pull/425
- [x] 浦松の判断 D-1〜D-5（受付テーブル新設／scope 分離案A／トップへの追加位置／学区「平均2倍以上」／Phase 2 の範囲）＝2026-09-24 決定
- [ ] 別セッションで一次検証（F1〜F14・S1〜S6）
- [x] Phase 2 の実施指示（それまで着手しない）＝2026-09-24 指示

**レビュー記録**
- 監査の「同一アプリ内のルートグループ」は現物と一致（不動産・行政書士・社労士が1アプリ）。統合・移転は不要
- 学区フィードの保存キーは `provider` 単独（scope はスキーマ検査のリテラルのみ）。ペット scope を同テーブルに入れると学区を上書きする
- `/api/contact` は受付を保存しない（メールだけが記録・事務所宛メール失敗で消失・自動返信失敗で重複）。迷惑投稿対策なし。第12章を満たすには受付テーブルが要る
- 既存学区ページの空表示「ご紹介できる物件はありません」（4言語）と「平均2倍以上」（ja・zh-tw・zh）は指示書と不整合。Phase 5 候補
- 未実測：ja 専用ページの `/en/...` が 200 で日本語本文を返す点（コード上の推定。検証項目 F12）

## 2026-09-24 四葉ペット横断プロジェクト Phase 2（保存分離・許諾ゲート・公開集計・表示部品）— claude/zealous-fermat-t7x0f2

浦松判断：D-1 受付テーブル新設（Phase 3）／D-2 学区と別の保存先／D-3 推奨どおり／D-4 「平均2倍以上」削除／D-5 指示書どおり Phase 2 から。計画はプランモードで承認済み。

- [x] 基準線：main `e1d692c` で vitest 94ファイル・1,389件、tsc 0
- [x] D-4：`RentalComparison.tsx` の相談枠から「平均2倍以上」を4言語とも削除（英語版にもあった）＋再発防止テスト（7e5fb21）
- [x] 新テーブル `rental_survey_batches`・`rental_survey_finalizations`（migration＋down.sql。RLS・権限剥奪）
- [x] `src/lib/rental-survey/`（scope・pet-terms・batch・permissions・units・finalize・summary・store）
- [x] 管理API `/api/admin/rental-survey`（save-batch／finalize／rollback・dryRun・GET はメタ情報のみ）
- [x] 表示部品 `SurveyCountsPanel`（4言語・未組込み）
- [x] テスト 10ファイル（T01〜T16 対応）＋学区APIに1件
- [x] ローカル実DB（prisma dev）で migration・T01・T03・down.sql・当て直しを確認（学区の行は全工程で完全一致）
- [x] 検証：vitest 104ファイル・1,532件／tsc 0／eslint error 0
- [x] `docs/pet-project/20_phase2.md`、Phase 1 報告書の訂正、検証依頼書に Phase 2 項目
- [x] PR #425 の更新 → マージ（02affa8）・本番DBに rental_survey を作成（2026-09-24・浦松承認）。許諾台帳・公開フラグは未（別承認）

**レビュー記録**
- `prisma migrate diff` の出力に既存のずれ `DROP INDEX "columns_locales_gin"` が入る。生成SQLをそのまま使わず、2テーブル作成だけに絞った
- `down.sql` は当初「`migrate resolve --rolled-back`」を案内していたが、適用済みの migration には使えなかった（P3012）。適用記録の削除を down.sql に含め、戻す→当て直す→再検証で確認
- 読み返しで2点を修正：管理APIのログに Error オブジェクトを渡さない（Prisma のエラー文はデータを含み得る）／許諾台帳の同時刻の確認済み・撤回は拒否側を採る。どちらも修正前のコードで新テストが失敗することを確認
- 指示書どおりにしない点（少数抑制・広告不可件数・前週比）は `20_phase2.md` 第3章に理由を記載
- 未実施：ローカルの `next build`（Vercel プレビューで確認）／表示部品を組み込んだページの描画（Phase 3・5）

## 2026-09-24 四葉ペット横断プロジェクト Phase 3（住宅LP /pet-housing と借り手・大家の受付）— claude/zealous-fermat-t7x0f2

浦松判断：受付テーブル新設（D-1）／保存期間1年／閲覧は uramatsujoji@luck428.com の所有者だけ／`/services`＋メニュー（D-3）。計画はプランモードで承認済み。

- [x] 基準線：main `2b80c41`（#426 まで）
- [x] 受付テーブル `inquiries`（migration＋down.sql。RLS・権限剥奪）と保存層・受付番号・通知（Resend の `error` を確認）
- [x] 受付API `POST /api/inquiries`（保存成功＝受付成功・同じキーの再送は同じ受付番号・通知失敗は記録のみ・ログはコードだけ）
- [x] 閲覧者の限定 `verifyInquiryOwner`、管理API・管理画面「受付」（一覧・詳細・通知の再送・1年超の削除）
- [x] 借り手・大家フォーム、入口の CTA、完了はその場で受付番号（URL に載せない）
- [x] LP `/pet-housing`（ja のみ・公開フラグ `NEXT_PUBLIC_PET_HOUSING_PUBLISHED` 既定 off）と掲載先（メニュー・/services・sitemap・llms.txt・言語切替）
- [x] テスト：pet-intake・inquiries-mail・inquiries-store・inquiries-api・inquiries-admin・pet-forms・pet-housing-page（フラグ on／off）
- [x] ローカル実DB（prisma dev）で保存・二重送信・1年超の削除・down.sql・当て直し（他テーブルは不変）
- [x] ローカルの `next build`＋`next start` をフラグ on／off の両方で実測
- [x] 検証：vitest 112ファイル・1,628件／tsc 0／eslint error 0
- [x] `docs/pet-project/30_phase3.md`
- [ ] draft PR（マージ・本番DBへの inquiries 作成・公開フラグ・GSC は別承認）

**レビュー記録**
- 隠し欄に値がある送信は、計画の「成功と同じ応答」をやめ 400 にした。偽の受付番号を返すとクライアントが完了の計測を送るため（T19）
- Phase 2 の番人テスト「件数枠をどのページにも組み込まない」を、「組み込むのは /pet-housing だけ」に更新（段階の境界を表すテスト）
- 型付き配列の中の条件付きスプレッドには文脈の型が付かない（`locales: string[]` の型エラー）。型を付けた定数に切り出した
- 範囲外の発見（別途判断）：`/api/contact` が Resend の `error` を見ていない／管理APIはログインできる人なら誰でも通す／本番に `property_publication_events` が無い／本番の `_prisma_migrations` にリポジトリに無い行／既存の ja 先行ページの `/en/...` が 200

## 2026-09-24 ペット調査の開始（台帳の記載・取込画面・独自集計の公表）

浦松指示：「ペット調査はやってください」／台帳は「浦松判断として記載」／REINS も入れる（同席時のみ）／「LPへの件数表示＝集計公表はおこなってください。REINSなどとはかかず、独自集計」

- [x] 許諾台帳：4媒体 × store・aggregate の8行（浦松判断・書面回答なし・2026-09-24 日本時間0時から）。ad・image・sns は記載なし
- [x] 件数枠の注記を「当社が独自に集計したもの」に（4言語・媒体名なし）
- [x] 確定・巻き戻しの成功時に `/ja/pet-housing` を再生成（失敗は記録のみで確定は成功）
- [x] 確認用の純関数 `review.ts`（`summarizeBatch`・`pickFinalizationBatches`）
- [x] 取込画面 `/admin/bukken/rental-survey` と、`/admin/bukken` の「学区別の募集一覧」の隣のリンク
- [x] テスト：permissions・panel・api・review（新規）・admin-page（新規）
- [x] ローカル実DB（prisma dev）で、実際の管理API・実際の台帳を通す（`verify-local.ts exercise-api`・偽の認証サーバー）
- [x] `next build`（公開フラグと `RENTAL_SURVEY_PUBLIC_SCOPES` を有効化）＋ `next start`：件数枠 2件・「当社が独自に集計したものです」・媒体名なし／取込画面 200
- [x] 検証：vitest 114ファイル・1,650件／tsc 0（検証スクリプトも個別に 0）／eslint error 0
- [x] `docs/pet-project/32_pet-survey-start.md`
- [ ] draft PR（マージは浦松の指示後）
- [ ] Vercel の Production に `RENTAL_SURVEY_PUBLIC_SCOPES=bunkyo-rent-pet:1`（浦松。マージ前に設定すれば、マージ時の自動デプロイで反映）
- [ ] 週次スケジュール（リポジトリ外の運用文書）のペット調査を「実施」に

**レビュー記録**
- 計画では集計公表を未確認のまま（LP に出さない）としていたが、計画承認後の浦松指示で aggregate も記載し、独自集計として公表することにした。指示書 第7章の「媒体名の省略・独自集計の表記は許諾確認の代わりにならない」は、台帳のコメントと文書 32 に判断の根拠と並べて残した。
- 取込画面は管理APIの入出力を変えずに作った（dryRun → 本実行の2段階・`expectedSequence`）。許諾・確定の判定はブラウザでは行わず管理APIだけが行う（番人テストで固定）。
- 本番の公開フラグ：本番はまだ #419（07:04Z マージ）のデプロイで、`/pet-housing` は生成時の 404 がキャッシュされている（`x-nextjs-prerender: 1`・`x-vercel-cache: HIT`）。再デプロイ分は本番に出ていない。Vercel コネクタは team が見えず（`list_teams` が空）、状態は浦松の画面で確認してもらう。

## 2026-09-24 「ペットと暮らす」をサービスに見える位置へ（浦松指摘）

浦松指摘：「ペットと暮らすがサービスにでてきません」。公開後の本番で、/pet-housing はヘッダー「サービス」の補助リンクの小さな列（「多頭飼い・大型犬の住まい探し」）と、/services の4枚のカードの下の1行にしか無かった。

- [x] メニュー：`SERVICE_NAV_FEATURES` を新設し、4カテゴリの直下に見出し＋説明の1段で出す（メガメニューとスマホのアコーディオン）。補助リンクの列からは外した
- [x] 表示名を「ペットと暮らす住まい探し」に、説明「多頭飼い・大型犬の賃貸・購入と、大家さんの受入れ相談」を添える（対象の範囲を説明で示す）
- [x] /services：1行の文章を、4領域のカードと同じ体裁の案内カードに
- [x] 4カテゴリ（設計書で固定）とトップの3本柱（D-3）は変えない。ja のみ・公開フラグ off では出さない（従来どおり）
- [x] テスト：pet-housing-page（メニューの位置・表示名・/services のカード・ヘッダーの両メニューでの並び順）
- [x] 検証：vitest 114ファイル・1,652件／tsc 0／eslint error 0／ローカルの本番ビルドで画面を撮影
- [ ] PR（マージは浦松の指示後）


## 2026-10-03 人事部丸投げプランの人数加算変更

- [x] remote・既存作業状態確認、origin/mainから専用worktree作成
- [x] AI共有メモリ・料金の取得経路・Notion報酬表の重複調査
- [x] 共通税込単価3,300円・4言語表示・計算テスト更新
- [x] 関連コラム4本×4言語の原稿修正・seed再生成
- [x] Notion現行管理行作成・旧資料との区別・再取得確認
- [x] lint・型検査・関連/全テスト・build・実画面検証
- [x] コミット・PR提出用の差分確認（merge・本番反映は別途指示待ち）

**レビュー記録**
- 共通定義は税込。11名以上は55,000円＋（給与計算対象人数−10）×3,300円。基本人数帯・初期費用・採用22,000円等は維持。
- 現行の共通計算に合わせ、関連コラム4本×4言語に残る「11〜30名・31名以上個別見積り」を「11名以上」に整合。料金例15名71,500円・20名88,000円・30名121,000円。
- Notion報酬表58行を確認し現行プランの重複なし。現行管理行3ee4a1d1-bc13-81c5-99c9-cec83d286138を作成し、算定方法・備考・本文を実更新。基本月額は税抜30,000円／税込目安33,000円。旧資料37e4a1d1-bc13-8173-a685-fcf752cd0a2dには現行参照のみ追加し旧料金を保持。
- 検証：vitest130ファイル1,839件、tsc成功、eslint error0・既存warning23。column:checkはNG0（既存FAQ件数warning2）。差分チェック成功。
- 本番DB資格情報の認証エラーがあったため、使い捨てローカルPrisma DBで136本を投入しNext16.3.5本番build成功。4言語32ページ・指定10ケース×4言語のJSON-LDをHTTP検証し、料金表・日本語FAQを実画面確認。公開フラグoffは404。
- 公開用seedは136本中4本の料金部分のみ変更。Notionはコードの自動取得元ではないため、再同期で戻る経路なし。コラムは本番DB配信のため、merge・deploy後に既存管理画面/admin/columns/seed-laborの「全件」投入と実ページ・キャッシュ再確認が必要（AGENTS.md§5の手動工程）。
- 本番DB投入・merge・本番deployは未実施。別セッション「粗探し」の一次レビューは未実施。元checkoutの別作業は不変。


## 2026-10-06 非居住者の株式会社設立・銀行手続（非公開レビュー）

- [x] 添付仕様、AI共有メモリ、規程、最新mainと公開HTMLを照合
- [x] 元の未コミット変更を保護した隔離チェックアウトで実装
- [x] 会社設立・報酬額表・日本語office・翻訳済み法人保有記事・新法務記事を4言語対応
- [x] 開発時のみのサーバー側ゲート・本番404・ブランチ自動デプロイ抑止
- [x] e-Gov現行版・金融庁No.112と原稿の条文・改正日を照合
- [x] lockfile通りの依存環境：型検査、lint error 0・既存warning 23、133ファイル／1,866テスト（maxWorkers=2）
- [x] 本番build、55 HTML/RSC等・232 client JS・422 prerender HTMLの漏出なし、4言語32 PC/SP画面とofficeフォールバック
- [x] 実装commit 8f80d0f、Draft PR #469、4言語原稿・34画面・検証JSONと報告を提出（CIチェック未登録）

レビュー記録：本番DBの読み取り認証が失敗したため、未公開CMS記事の重複確認は未検証。新記事は本番404とし、公開前に再確認する。本番DB更新・マージ・公開・送金・外部連絡は行わない。

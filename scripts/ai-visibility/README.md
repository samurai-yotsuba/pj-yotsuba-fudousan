# AI可視性 定点計測 v2（Gemini API＋Google検索グラウンディング）

四葉グループの3士業サイト（luck428.com／samurai.co.jp／note.com/luck428）が、Googleの検索AIに近い答えの中で **引用されるか・名指しされるか** を、毎日30問で自動計測する仕組み。

旧方式（Macの測定用ChromeでGoogle AIモードの画面を読む・launchd `com.yotsuba.ai-visibility`・45問・30〜40分）の後継。ブラウザもログインもMacの状態も使わない。GitHub Actions 上で約5分で終わる。

設計の正本：`四葉基幹CRM/設計_AI可視性計測v2_20260928.md`（層A＝この仕組み。層B・Cは未着手）

## 何を測るか

| 判定 | 定義 |
|---|---|
| 引用（cite） | 回答の出典（grounding chunks）に自社ドメインがある（`luck428.com`・`samurai.co.jp`・`note.com/luck428`） |
| 引用順位（cite_rank） | 出典の中で自社が最初に出る位置（1始まり） |
| 根拠に使用（cite_supported） | 自社出典が本文のどこかの根拠として実際に使われた（groundingSupports に索引がある） |
| 名指し（named） | 回答本文に「四葉」「四叶」「浦松丈二」「luck428」「Yotsuba」のいずれかが出る。**設問文の丸写し部分は除く**（「文京区の四葉不動産の…」と聞き返しただけでは名指しにしない）。q29（士業ドットコム）は判定語を設問側で上書き |
| 他社ドメイン（domains） | 出典に出たドメインの並び（推薦型の設問で誰が土俵に乗っているかを見る） |

API の答えは利用者が見る Google AI モードの画面そのものではない（設計書 §6）。毎日の変化を追う代理指標として使う。

## ファイル

```
scripts/ai-visibility/
  questions.json          設問30問（version・categories・questions[]）
  lib.mjs                 判定・整形の純粋関数（ネットワークなし）
  measure.mjs             実行本体（Gemini呼び出し・並列・再試行・保存）
  fixtures/mock-gemini.json  --mock 用の応答見本
  README.md               この文書
.github/workflows/ai-visibility.yml   毎日 22:30 JST に実行・結果を main にコミット
src/lib/__tests__/ai-visibility-v2.test.ts   検証（vitest）
tasks/ai-visibility-v2/   ← 結果（Actions が追記）
  results.csv             1問1行（date, engine, model, qid, cat, lang, type, measured, cite, cite_rank, cite_supported, named, named_hits, own_urls, domains, search_queries, finish, ms）
  summary.csv             1日1行（測定数・引用合計・名指し合計・分類別・引用/名指し/欠測の設問ID）
  latest.md               当日の30問表（引用〇×・順位・名指し・出典上位）
  weekly.md               直近7日の要約（月曜または --weekly）
  anomaly.md              異常検知時のみ
  detail/YYYY-MM-DD.jsonl 本文・出典URL・検索語の生データ（90日で自動削除。CSVは永続）
```

## 初回セットアップ（浦松が行う）

1. **Gemini API キーを作る** — Google AI Studio（https://aistudio.google.com/）→ API keys。
   - **Google検索グラウンディングは無料枠では使えない**。プロジェクトに **課金を有効化**（有料枠）しておく。有料枠では Gemini 3.x のグラウンディングが **月5,000件まで無料、超過は1,000件あたり $14**（2026-09-28 に公式料金表で確認）。30問×31日＝930件なので通常は無料枠内。
   - キーは 1 個だけ発行し、用途を「AI可視性計測」と分かる名前にする。**チャットや文書にキーの値を貼らない。**
2. **GitHub に登録** — リポジトリ `yotsuba-samurai2/pj-yotsuba-fudousan` → Settings → Secrets and variables → Actions
   - Secrets：`GEMINI_API_KEY` ＝ 上のキー
   - Variables（任意）：`GEMINI_MODEL` ＝ 使うモデル名。未設定なら `gemini-3.5-flash`。もっと安くしたいときは `gemini-3.5-flash-lite`
3. **試運転** — Actions → 「AI Visibility v2」→ Run workflow → `limit` に `3` を入れて実行。
   - `limit` を入れた実行は **何も書き込まない**（dry-run）。ログ（Actions の「計測」ステップ）に `q01 cite=… named=… 出典N` が3行出れば鍵と課金の設定は正しい。
   - `GEMINI_API_KEY がありません` → Secret 名の綴りを確認。`429`/`403` が続く → 課金が有効か、キーの制限（API 制限）を確認。
4. **本計測を1回手動で** — `limit` を空のまま Run workflow。`tasks/ai-visibility-v2/latest.md` が main にコミットされる。30問の判定を目視で確認し、設問や判定語のずれを直す（下記「設問を直す」）。
5. **旧方式を止める（2週間並走後）** — Mac で
   ```
   launchctl bootout gui/$(id -u)/com.yotsuba.ai-visibility
   mv ~/Library/LaunchAgents/com.yotsuba.ai-visibility.plist ~/Library/LaunchAgents/_disabled.com.yotsuba.ai-visibility.plist
   ```
   旧CSV（`tasks/ai-visibility/…`）はそのまま残す。継続8問（legacy 番号つき）は旧CSVの同番号と比べられる。

## 日々の運用

- 毎日 22:30 JST に自動実行。コミットメッセージが `chore(ai-visibility): 2026-09-29 引用 7/30・名指し 4/30・測定 30/30 [skip ci]` の形で main に積まれる。
- **計測データだけのコミットでは Vercel の本番ビルドは走らない**（`vercel.json` の `ignoreCommand` が `tasks/ai-visibility-v2` 以外に差分が無ければビルドを省く）。
- **異常検知 → Issue**（題名「【AI可視性v2】異常検知 …」）：欠測が2割超（測定 < 24/30）、または引用数が直近7回の中央値から5以上落ちたとき。まず Actions のログを見る。原因の多くは API の障害・鍵の失効・課金停止。
- **週次要約 → Issue**（月曜）：直近7日の引用率・名指し率、「引用0のまま（3回以上）」「引用はあるのに名指し0」の設問一覧。ここから `yotsuba-ai-visibility-improve` スキルで改善に入る。
- 同じ日に2回走っても、その日の行は上書きされる（二重計上しない）。

## 手元で動かす

```
# 鍵なしの通し確認（fixtures の応答を使う。/tmp に書く）
node scripts/ai-visibility/measure.mjs --mock --out /tmp/aiv

# 本物の API で3問だけ（書き込みなし）
GEMINI_API_KEY=… node scripts/ai-visibility/measure.mjs --limit 3

# 本物の API で全問・書き込みあり（通常は Actions に任せる）
GEMINI_API_KEY=… node scripts/ai-visibility/measure.mjs
```

主なフラグ：`--out DIR`（既定 tasks/ai-visibility-v2）／`--limit N`（先頭N問・既定で dry-run。書くなら `--write` を足す）／`--dry-run`／`--weekly`／`--concurrency 4`／`--model NAME`／`--no-resolve`（出典URLの転送先解決を省く）／`--mock`。

終了コード：0 正常／2 測定0件／3 鍵なし。

検証：`npx vitest run src/lib/__tests__/ai-visibility-v2.test.ts`

## 設問を直す

`scripts/ai-visibility/questions.json` を編集して PR。

- `id` は `q01`〜 の連番で一意。分類 `cat` は `categories` にあるもの。`lang` は `ja`／`zh`／`zh-tw`。
- `type` は「相談先型」（AIが相談先・業者を挙げる設問。名指しされるかが本題）・「知識型」（手続き・定義の設問。出典に入るかが本題）・「指名型」（自社名を含む設問。丸写しは名指しに数えない）。
- 旧45問から続けている設問は `legacy` に旧番号を入れる（旧CSVと突き合わせるため）。
- 自社名以外を名指しとみなす設問は `namedTerms` で上書き（例：q29 は「士業ドットコム」「samurai.co.jp」）。
- 設問に **顧客名・案件情報・他社名・「ワンストップ」「格安」「最安」** を入れない（テストで弾く）。
- 設問を差し替えたら `version` を上げる。旧設問の行は CSV に残るので、集計は `qid` と `version` の切れ目に注意する。

## 費用と上限

- Gemini 3.5 Flash の本文トークン：30問×約1,500トークン／日 ＝ 月に数十円〜百円台の見込み（未検証・初月の請求で確認）
- グラウンディング：月930件 ＜ 無料5,000件。`--limit` の試運転もこの件数に入る。
- 万一 Google が無料枠を廃止・変更した場合は Actions のログと Google Cloud の請求で気づく。月次で請求を一度見る。

## 判定の限界（読み方の注意）

- 出典URLは Google の転送URL（vertexaisearch）で返る。実体URLは転送先を1段だけ追って解決するが、失敗したときは出典の `title`／`domain` でホストを判定する。`own_urls` が空でも `cite=1` のことがある。
- 名指し判定は文字列一致。「四葉」を含む無関係な語（例：四葉のクローバー）を拾う可能性がある。`detail/*.jsonl` の本文で確認する。
- 回答は毎回揺れる（temperature 0.2 でも検索結果が変わる）。1日の〇×ではなく **7日の率** で見る。
- 30問の内容は公開の一般設問のみ。顧客・案件に関わる設問は入れない（規程：yotsuba-ledger-gate）。

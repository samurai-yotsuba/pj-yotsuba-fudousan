# 仲介手数料0.33ヶ月・学区集客

基準: origin/main 8ba70d4。既存変更を含めない専用worktree。

- [x] 既存ルール・共有メモリ・データ/公開経路確認
- [x] 料金全文検索・FAQ固定1.1計算を特定
- [x] 既存RentalSpec.brokerFeeを唯一の正本として金額・FAQ・JSON-LD統一
- [x] 0.33ハブ・カード・トップ・料金・共通LINE導線
- [x] 学区集計・20校導線・非公開詳細の境界を強化
- [ ] 全件監査・テスト・lint・typecheck・build・4画面幅検証
- [ ] レポート/差分を提出（本番公開はしない）

## 設計
新しいDB料率列を増やさず既存 full/half/p033/free を移行不要で利用。不明値はnull。
物件円額・比較は丸めMath.round（既存費用表示の四捨五入）を整数百分率で共通化。
20校の既存 /gakku/{school}/rentals を使い、4校の区域ガイドと役割を維持。
広告不可・紹介可否未確認は公開一覧へ流さない。market countから紹介可能数を推定しない。
FAQは可視HTMLを正本とし新ハブにFAQPageを増設しない（Google 2026-05-07検索表示終了、06-15文書撤去）。
終了物件の広告情報を削除する既存方針を保ち、賃貸closedは価格・名称・住所・画像・Offerを含まないnoindexの終了案内＋現在物件導線へ。draft/未知は404。

## 検証結果
1771 tests/124 files成功、lint 0 errors/23既存warnings、typecheck成功。検証DBでWebpack production build成功。Turbopackは環境のport bind制限でpanic。37 URLを合成データで検証。
本番はaggregate SQLのみで公開賃貸113件p033を確認、20校登録物件111件・区域未確定/区外2件。個別物件/フィードsnapshot取得は自動承認レビュー拒否のため未実施。広告不可件数の本番全件監査は未完了。

## 承認後の本番監査
ユーザー承認後に最小投影で読取。登録129件・募集フィード850件、公開賃貸113件すべてp033/広告allowed。20校公開262件（登録111+比較151）、広告不可紹介可能28件、総数290。料金113件のFAQ/Offer一致・不一致0。保存文章はサーバー側機械検索で矛盾候補0。監査snapshotのtimezoneなしSQL日時はPrismaのUTCに合わせ正規化。本文等は取得せず--limited-projectionを明示。

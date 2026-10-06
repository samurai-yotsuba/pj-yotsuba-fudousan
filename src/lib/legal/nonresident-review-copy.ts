import type { LangCode } from "@/config/languages";

// Amounts are JPY, including consumption tax. Contract conditions remain unapproved.
export const NONRESIDENT_FEES = [
  { amount: 165000, basis: "case", minimum: false },
  { amount: 33000, basis: "case", minimum: false },
  { amount: 88000, basis: "bank", minimum: false },
  { amount: 16500, basis: "month", minimum: true },
] as const;

export type NonresidentCopy = {
  review: string; updated: string; home: string; column: string; feesTitle: string;
  serviceTitle: string; serviceLead: string; stagesTitle: string; stages: string;
  entrustedTitle: string; services: [string, string, string, string];
  processTitle: string; process: string; rolesTitle: string; roles: [string, string][];
  independence: string; disclaimer: string; feeColumns: [string, string, string, string, string];
  names: [string, string, string, string]; units: [string, string, string, string];
  exclusions: [string, string, string, string]; tax: string; minimumPrefix: string; minimumSuffix: string; feeNote: string;
  faqTitle: string; faqs: { question: string; answer: string }[];
  articleLink: string; serviceLink: string; feeLink: string;
  propertyTitle: string; propertyBody: string; articleTitle: string; excerpt: string;
  articleSections: { heading: string; paragraphs: string[] }[];
  preparationTitle: string; preparationColumns: [string, string]; preparation: [string, string][];
  sourcesTitle: string; sourceLabels: [string, string, string, string, string, string];
  sourceNotes: [string, string, string, string, string, string]; author: string; authorLink: string;
};

export const NONRESIDENT_COPY: Record<LangCode, NonresidentCopy> = {
  ja: {
    review: "非公開レビュー用原稿・料金案（提供条件と公開は未承認）", updated: "原稿更新日：2026年10月6日（未公開）",
    home: "ホーム", column: "コラム", feesTitle: "会社設立・銀行手続の報酬案",
    serviceTitle: "海外に住んだまま日本の株式会社を設立したい方へ",
    serviceLead: "海外在住で日本国内に住所を有しない方の株式会社設立では、定款などの設立書類に加え、資本金を払い込む口座と、設立後に事業で使う法人口座の準備が大切です。四葉行政書士事務所は、事業内容、出資者、役員、日本の事業拠点を整理し、必要書類と手続の順序をご案内します。ここでいう非居住者は対象者の説明であり、税法・外為法の居住者区分を判定するものではありません。",
    stagesTitle: "設立時の払込みと設立後の法人口座は同じですか？",
    stages: "設立前に行う資本金の払込みと、登記後に申し込む法人口座の開設は別の段階です。第三者名義口座の特例は、発起人と設立時取締役の全員が日本国内に住所を持たない株式会社の発起設立について確認します。払込金の受領権限、払込証明、銀行の受入条件、資金受領・引渡しに関する規制をそれぞれ確認し、預り金口という名称だけで適法性や利用可否を判断しません。",
    entrustedTitle: "どの手続きを相談できますか？",
    services: [
      "事業内容と機関設計の確認、定款等の書類作成、必要資料の整理を行います。登記申請は司法書士へ直接ご依頼いただき、当事務所とは別契約・別請求です。",
      "第三者名義口座の取扱いの対象、受領権限、銀行の受入条件、資金の管理・引渡方法を確認します。受託条件が整った案件について、預り金専用口座で一時的に受領し、入出金記録と受領・引渡しの報告を行う内容案です。",
      "申込先1行の必要資料の整理、事業内容・取引予定の説明資料作成、面談準備、照会事項への回答準備をお手伝いします。会社設立支援とは別の業務・料金です。口座開設と海外からの送金受取りには、それぞれ銀行の確認があります。",
      "銀行からの照会内容の整理、依頼者の確認に基づく回答資料の準備、記録管理など、契約で定めた事務を継続して支援する内容案です。取引責任者の登録・変更が必要な場合は、銀行の要件と実際の権限を確認します。",
    ],
    processTitle: "相談からどのように進みますか？",
    process: "事業計画と資金の流れを伺い、必要資料と銀行への確認事項を整理します。その後、業務ごとのお見積り・契約、設立書類の準備、払込方法の確定、司法書士による登記、法人口座の申込みへ進みます。開設後の事務支援は必要な方と別途契約します。",
    rolesTitle: "誰がどの手続きを担当しますか？",
    roles: [["設立書類・許認可書類、銀行手続の準備", "四葉行政書士事務所"], ["設立登記", "司法書士（直接・別契約）"], ["口座・送金・取引権限の確認と審査", "金融機関"], ["物件紹介・仲介・契約手続", "四葉不動産株式会社（直接・別契約）"], ["税務／紛争・個別の法的判断", "税理士／弁護士等の資格者"]],
    independence: "各事業体・専門家は独立し、それぞれ顧客と直接契約・直接請求・直接入金します。当事務所は紹介料を受け取りません。設立登記は司法書士への別契約で、165,000円に司法書士報酬は含まれません。",
    disclaimer: "口座開設、海外着金、審査期間は銀行の判断によるため、結果や完了時期を保証するものではありません。会社設立だけで日本での在留資格が得られるものでもありません。本ページは一般的な情報提供であり、個別の法的判断は資格者による確認を要します。",
    feeColumns: ["業務", "単位", "報酬（消費税込み）", "主な範囲", "含まないもの・別途確認"],
    names: ["株式会社設立支援", "資本金の一時受領・管理", "法人口座開設支援", "開設後の口座関連事務"],
    units: ["1件", "1件", "1行", "月額"],
    exclusions: ["登記申請、登録免許税、定款認証等の実費、司法書士報酬、②③④", "資本金そのもの、銀行・送金等の実費。期間・上限・返金条件は未確定", "①、銀行手数料等。不開設時の報酬・返金、再申請の条件は未確定", "取扱金額に応じ増額。金額の定義・集計期間・増額基準・業務と権限・解約条件は未確定"],
    tax: "円（税込）", minimumPrefix: "", minimumSuffix: "〜", feeNote: "①は既存の会社設立（定款作成等）165,000円と同じ設立支援の報酬で、追加請求ではありません。①と③は別料金です。総費用・成功報酬・全額返金を示す表ではありません。翻訳・認証・郵送・追加照会等の料金内外も公開前に確定します。",
    faqTitle: "よくある質問", faqs: [
      { question: "海外に住み続けても相談できますか？", answer: "海外居住を続ける方と、日本で暮らすため在留資格も必要な方を分けて準備事項を整理します。会社設立による在留資格の取得を保証しません。" },
      { question: "第三者名義口座は誰でも使えますか？", answer: "株式会社の発起設立で、発起人と設立時取締役の全員が日本国内に住所を持たない場合の特例です。受領権限、払込証明、銀行条件、資金受領事業に関する規制は別に確認します。" },
      { question: "会社ができれば銀行口座も開設できますか？", answer: "開設可否と期間は銀行の審査によります。海外送金の受取りも別の確認があり、申込支援は結果の保証ではありません。" },
      { question: "設立・登記・物件は一括料金ですか？", answer: "それぞれ独立した受任者との直接・別契約です。司法書士報酬、法定費用、不動産費用、銀行関連支援は165,000円に含みません。" },
    ],
    articleLink: "資本金の払込みと法人口座開設の解説", serviceLink: "海外在住者の会社設立と銀行手続の準備", feeLink: "報酬額表",
    propertyTitle: "海外から日本の事業拠点を準備するには？",
    propertyBody: "海外在住の方が日本で会社を設立する際は、事業内容に合う物件と、設立・銀行手続の予定を合わせて検討します。設立前後の契約名義、法人登記利用の可否、業種による物件要件を確認し、順序は個別に調整します。用途の可否は最終的に貸主の判断によります。四葉不動産株式会社は物件探しと契約手続きを扱い、設立書類・払込方法・銀行手続の準備は四葉行政書士事務所へ相談します。両者は独立し、直接契約・直接請求・直接入金する別契約です。日本に住まない設立と在留資格のための事業所確保は別に検討します。物件契約によって口座開設や在留資格の取得は保証されません。",
    articleTitle: "非居住者の株式会社設立｜資本金の払込みと法人口座開設の進め方",
    excerpt: "海外在住者だけでも、日本の株式会社の設立登記を申請できます。資本金の払込みには一定条件で第三者名義口座を使う取扱いがありますが、設立後の法人口座開設、海外送金の受取り、資金受領を業務とする者の規制確認は、それぞれ必要です。",
    articleSections: [
      { heading: "海外在住者だけで株式会社を設立できますか？", paragraphs: ["代表取締役全員が日本に住所を持たない株式会社も、設立登記を申請できます。定款、本店所在地、出資、役員構成などを決め、海外で用意する署名証明等の資料を確認します。日本で生活し経営する場合の在留資格は、会社設立とは別に検討します。この記事は株式会社の発起設立を扱い、合同会社や外国会社の日本支店にはそのまま転用しません。非居住者という語は海外在住で日本国内に住所を有しない方を示し、税法・外為法の居住者区分を判定しません。"] },
      { heading: "資本金の払込みに第三者の口座を使えますか？", paragraphs: ["法務省は、発起人と設立時取締役の全員が日本国内に住所を持たない場合に限り、第三者名義口座を払込証明に利用する取扱いを示しています。払込金の受領権限を委任したことを示す書面と、払込みの証明に必要な資料を整えます。登記上の取扱いに加え、口座の銀行がその受入れを認めるかも確認します。", "海外から第三者が資金を受けて引き渡す仕組みには、2026年6月1日施行の改正資金決済法も関係します。預り金専用口座という名称だけで利用可否は決まりません。金融庁資料のNo.112には設立時出資金の受領・移動例があり、具体的な資金の流れとその例の異同について、専門家による規制確認が必要です。例示があることだけで適用除外や取扱い可能と断定しません。"] },
      { heading: "会社を設立すれば法人口座も開設できますか？", paragraphs: ["登記の完了後も、銀行は事業内容、取引目的、実質的支配者、取引を担当する人などを確認します。都市銀行を含め、申込条件と必要資料は銀行・商品により異なります。事業計画、契約書、拠点を説明する資料、予定する入出金を準備すると、確認事項を整理しやすくなります。口座開設の結果や期間は銀行の審査によります。"] },
      { heading: "海外着金と取引責任者はどう確認しますか？", paragraphs: ["口座が開いても、海外からの送金には送金目的、資金の背景、送金人との関係等について追加資料を求められることがあります。利用予定の国・通貨・金額・頻度を申込み前に整理しましょう。", "取引責任者・取引担当者の呼び方や権限は銀行により異なります。外部の専門家を登録できるか、必要な委任と本人確認は何か、開設後にどこまで手続できるかを個別に確認します。銀行のログイン情報を共有したり、包括的な単独操作を当然の内容にしたりしません。"] },
    ],
    preparationTitle: "相談前に何を準備しますか？", preparationColumns: ["項目", "整理する内容"],
    preparation: [["人と会社", "発起人・役員の居住地、持株関係、事業内容、本店候補"], ["設立時の資金", "出資者、金額、送金元、払込先、受領権限、引渡し方法"], ["開設後の取引", "取引先、国・通貨、予定金額・頻度、担当者と権限"]],
    sourcesTitle: "この記事の根拠", sourceLabels: ["法務省：外国人・海外居住者の方の商業・法人登記の手続", "会社法", "資金決済に関する法律", "資金移動業者に関する内閣府令", "金融庁：令和7年資金決済法改正パブリックコメント 別紙4 No.112（41頁）", "犯罪による収益の移転防止に関する法律"],
    sourceNotes: ["2015年3月16日民商第29号通知・2017年3月17日民商第41号通達。参照日2026年10月6日。", "第34条第1項・第2項。現行施行版2026年8月12日、最終公布改正2026年7月23日・令和8年法律第64号。", "第2条の2第2号。関係改正施行2026年6月1日。現行施行版2026年8月12日、最終公布改正2026年7月23日・令和8年法律第64号。", "第1条の3第1項・第2項第4号。最終改正2026年5月22日・令和8年内閣府令第51号、施行2026年6月1日。", "公表2026年5月22日、参照2026年10月6日。本件への適用は資格者確認を要します。", "第4条第1項第1号〜第4号・第4項。現行施行版2026年8月12日、最終公布改正2026年7月23日・令和8年法律第64号。銀行の商品条件・審査を代替しません。"],
    author: "著者：浦松丈二｜四葉行政書士事務所 代表行政書士", authorLink: "著者・事務所紹介",
  },
  en: {
    review: "Private review draft and proposed fees — service conditions and publication are unapproved", updated: "Draft updated: 6 October 2026 (unpublished)", home: "Home", column: "Articles", feesTitle: "Proposed incorporation and banking-support fees",
    serviceTitle: "Incorporating a Japanese K.K. while continuing to live abroad",
    serviceLead: "For founders living overseas without an address in Japan, incorporating a kabushiki kaisha (K.K.) requires preparing both incorporation documents and the account for paying in capital, followed by the company's operating account after registration. 四葉行政書士事務所 organizes the business, investors, officers and Japanese premises, and explains the documents and sequence. ‘Nonresident’ describes this audience; it does not determine residence under tax or foreign-exchange law.",
    stagesTitle: "Is the capital payment account the same as the company's bank account?", stages: "Capital is paid before incorporation; the company applies for its bank account after registration. The third-party account exception concerns incorporation by promoters where every promoter and director at incorporation has no address in Japan. Authority to receive the funds, evidence of payment, bank acceptance and regulation of receiving and handing over funds require separate checks. An account described as dedicated to temporarily holding client funds does not by its name establish legality or availability.",
    entrustedTitle: "What procedures can you discuss with us?", services: [
      "We clarify the business and governance structure, prepare articles of incorporation and organize supporting materials. Registration is entrusted directly to a judicial scrivener under a separate contract and invoice.",
      "The proposal checks eligibility for a third-party account, authority to receive funds, bank acceptance, and custody and handover arrangements. Only cases meeting all engagement conditions would involve temporary receipt in an account dedicated to client funds, with transaction records and reports of receipt and handover.",
      "For one applicant bank, we help organize required materials, prepare explanations of the business and expected transactions, and prepare for interviews and inquiries. This is a separate service and fee from incorporation. Account opening and incoming overseas remittances each require the bank's checks.",
      "The proposal provides continuing clerical support defined by contract: organizing bank inquiries, preparing response materials based on the client's confirmation, and maintaining records. Any registration or change of a transaction contact requires checking the bank's requirements and actual authority.",
    ], processTitle: "How does the consultation proceed?", process: "We discuss your business plan and fund flows and organize documents and questions for the bank. This is followed by separate estimates and contracts, incorporation documents, confirmation of the capital payment method, registration by a judicial scrivener, and the company's bank application. Continuing clerical support requires a separate engagement if needed.",
    rolesTitle: "Who handles each procedure?", roles: [["Incorporation/licensing documents and banking preparation", "四葉行政書士事務所"], ["Incorporation registration", "Judicial scrivener (direct, separate engagement)"], ["Accounts, remittances, transaction authority and screening", "Financial institution"], ["Property search, brokerage and contract procedures", "四葉不動産株式会社 (direct, separate engagement)"], ["Tax / disputes and individual legal decisions", "Tax accountant / lawyer or other qualified professional"]],
    independence: "Each entity and professional is independent and contracts, invoices and receives payment directly from the client. Our office receives no referral fees. Registration is a separate engagement with a judicial scrivener; their fee is excluded from JPY 165,000.", disclaimer: "Account opening, receipt of overseas funds and screening timelines depend on the bank; neither results nor completion dates are guaranteed. Incorporation alone does not grant Japanese residence status. This page provides general information; individual legal decisions require a qualified professional's review.",
    feeColumns: ["Service", "Unit", "Fee (consumption tax included)", "Main scope", "Excluded / requiring confirmation"], names: ["K.K. incorporation support", "Temporary receipt and administration of capital", "Corporate bank-account application support", "Account-related clerical support after opening"], units: ["Per case", "Per case", "Per bank", "Monthly"], exclusions: ["Registration filing, statutory tax, notarization and other disbursements, judicial-scrivener fees, services ②–④", "Capital itself and bank/remittance costs. Holding period, limits and refund conditions remain undecided", "Service ① and bank costs. Fees/refunds if declined and repeat-application terms remain undecided", "Increases with the amount handled. Definition, aggregation period, increase criteria, duties, authority and termination remain undecided"], tax: "JPY (tax included)", minimumPrefix: "From ", minimumSuffix: "", feeNote: "Service ① is the existing JPY 165,000 incorporation-document fee, not an additional charge. Services ① and ③ are separately priced. This table does not state total costs, a success fee or a full-refund promise. Inclusion of translation, authentication, postage and additional inquiries must also be settled before publication.",
    faqTitle: "Frequently asked questions", faqs: [
      { question: "Can I consult you while continuing to live abroad?", answer: "We separate preparation for those staying overseas from residence-status questions for those planning to live in Japan. Incorporation does not guarantee residence status." },
      { question: "Can anyone use a third-party account?", answer: "The exception concerns incorporation of a K.K. by promoters when every promoter and director at incorporation has no address in Japan. Receipt authority, payment evidence, bank terms and regulation of fund-receipt businesses require separate checks." },
      { question: "Does registration ensure a corporate bank account?", answer: "Opening and timing depend on bank screening. Incoming overseas remittances require separate checks; application support does not guarantee the result." },
      { question: "Is incorporation, registration and property a single package?", answer: "Each independent provider contracts directly and separately with the client. Judicial-scrivener fees, statutory costs, property costs and banking support are excluded from JPY 165,000." },
    ], articleLink: "Capital payments and corporate bank-account applications", serviceLink: "Incorporation and banking preparation for overseas founders", feeLink: "Fee schedule",
    propertyTitle: "How do you prepare Japanese business premises from overseas?", propertyBody: "Match premises to the business and coordinate incorporation and banking schedules. Check the contracting name before and after incorporation, permission to register the company at the address and industry-specific premises requirements; the sequence is adjusted individually. Permitted use ultimately depends on the landlord. 四葉不動産株式会社 handles property search and contract procedures; incorporation documents, capital payment methods and banking preparation are discussed with 四葉行政書士事務所. These independent entities each contract, invoice and receive payment directly under separate engagements. Incorporating while staying overseas and securing premises for residence-status purposes require separate consideration. A property contract does not guarantee an account or residence status.",
    articleTitle: "Nonresident K.K. incorporation: capital payments and corporate bank accounts", excerpt: "Founders living overseas can apply to register a Japanese K.K. A third-party capital payment account may be used under specific conditions, while the corporate bank account, incoming overseas funds and regulation of businesses receiving funds each require separate checks.",
    articleSections: [
      { heading: "Can overseas residents alone establish a Japanese K.K.?", paragraphs: ["Registration applications are accepted even where every representative director has no address in Japan. Decide the articles, registered office, contributions and officers, and check signature certificates and other materials prepared overseas. Residence status for living and managing a business in Japan is a separate issue. This article concerns incorporation of a K.K. by promoters, not an LLC or a foreign-company branch. ‘Nonresident’ means the intended overseas audience without an address in Japan, not a tax or foreign-exchange classification."] },
      { heading: "Can capital be paid into a third party's account?", paragraphs: ["The Ministry of Justice's exception applies only where every promoter and director at incorporation has no address in Japan. Prepare a document delegating authority to receive the capital and evidence of payment. Bank acceptance must be checked separately from registration practice.", "Arrangements for a third party to receive funds from overseas and hand them over also involve amendments to the Payment Services Act (資金決済に関する法律) effective 1 June 2026. The description ‘account dedicated to temporarily holding client funds’ does not establish availability. FSA response No.112 addresses an incorporation-related receipt and transfer example. A specialist must compare the actual fund flow with that example; the example alone does not establish an exemption or permission."] },
      { heading: "Does incorporation ensure a corporate bank account?", paragraphs: ["After registration, banks still check business activities, transaction purposes, beneficial owners and the individual handling transactions. Requirements differ by bank and product, including major commercial banks. Prepare the business plan, contracts, premises evidence and planned transactions. Opening and timing depend on bank screening."] },
      { heading: "How are incoming overseas funds and transaction contacts checked?", paragraphs: ["Even after opening, the bank may request the remittance purpose, background of funds and relationship with the sender. Organize countries, currencies, amounts and frequency before applying.", "Titles and powers of transaction contacts differ by bank. Check whether an external professional may be registered, the delegation and identification needed, and the permitted procedures after opening. Sharing bank login credentials or assuming unrestricted independent operation is not part of the proposal."] },
    ], preparationTitle: "What should you prepare before consulting?", preparationColumns: ["Area", "Information"], preparation: [["People and company", "Promoters'/officers' addresses, ownership, business and proposed registered office"], ["Capital at incorporation", "Contributor, amount, sender, payment account, receipt authority and handover method"], ["Transactions after opening", "Counterparties, countries, currencies, amounts, frequency, contact and authority"]],
    sourcesTitle: "Sources for this article", sourceLabels: ["Ministry of Justice: commercial registration for foreign nationals and overseas residents", "Companies Act (会社法)", "Payment Services Act (資金決済に関する法律)", "Cabinet Office Order on Funds Transfer Service Providers (資金移動業者に関する内閣府令)", "FSA: 2025 Payment Services Act amendment, public-comment responses, Annex 4 No.112 (p.41)", "Act on Prevention of Transfer of Criminal Proceeds (犯罪による収益の移転防止に関する法律)"],
    sourceNotes: ["Notices of 16 March 2015 (Minsho No.29) and 17 March 2017 (Minsho No.41). Accessed 6 October 2026. ", "Article 34, paragraphs 1–2. Version effective 12 August 2026; latest promulgated amendment: 23 July 2026, Act No.64 of 2026.", "Article 2-2, item 2. Relevant amendment effective 1 June 2026. Version effective 12 August 2026; latest promulgated amendment: 23 July 2026, Act No.64 of 2026.", "Article 1-3, paragraph 1 and paragraph 2, item 4. Latest amendment: 22 May 2026, Cabinet Office Order No.51; effective 1 June 2026.", "Published 22 May 2026; accessed 6 October 2026. Application to an individual case requires professional review.", "Article 4, paragraph 1, items 1–4 and paragraph 4. Version effective 12 August 2026; latest promulgated amendment: 23 July 2026, Act No.64 of 2026. It does not replace bank product terms or screening."], author: "Author: 浦松丈二 | Representative gyoseishoshi, 四葉行政書士事務所", authorLink: "Author and office profile",
  },
  "zh-tw": {
    review: "非公開審閱稿・報酬方案（服務條件及公開尚未核准）", updated: "原稿更新：2026年10月6日（未公開）", home: "首頁", column: "專欄", feesTitle: "公司設立・銀行手續報酬方案",
    serviceTitle: "持續居住海外，希望設立日本株式會社的人士", serviceLead: "居住海外且在日本國內沒有住所的人士設立株式會社時，除章程等設立文件外，亦須準備資本金繳納帳戶及設立後使用的法人帳戶。四葉行政書士事務所協助整理業務、出資者、董事及日本營業據點，說明所需文件與順序。此處「非居住者」是讀者範圍的說明，並非稅法或外匯法上的居住者認定。",
    stagesTitle: "設立時繳納資本金與法人帳戶是同一件事嗎？", stages: "設立前的資本金繳納與登記後的法人帳戶申請，是不同階段。第三人名義帳戶特例，限於發起人與設立時董事全體在日本國內均無住所的株式會社發起設立。收款授權、繳納證明、銀行受理條件及收取・交付資金的法規，均須分別確認。「預り金口」的名稱本身，不能證明合法性或可用性。",
    entrustedTitle: "可以諮詢哪些手續？", services: ["確認業務及機關設計、製作章程等文件、整理所需資料。登記申請須直接委託司法書士，與本事務所分別簽約及請款。", "方案先確認第三人帳戶特例、收款授權、銀行受理條件及資金管理・交付方法。僅對受託條件完整的案件，擬以專用帳戶暫時收款，並記錄收支及報告收取・交付情形。", "以申請的1家銀行為單位，協助整理資料、製作業務與交易計畫說明、準備面談及詢問的回答資料。與設立協助為不同業務・費用。開戶與海外匯款入帳，各須銀行確認。", "方案依契約持續協助整理銀行詢問、依客戶確認準備回答資料及管理紀錄等事務。若須登錄或變更交易聯絡人，另確認銀行要件及實際權限。"],
    processTitle: "諮詢後如何進行？", process: "了解業務計畫與資金流向，整理資料及須向銀行確認的事項。其後逐項報價・簽約，準備設立文件、確定繳納方式，由司法書士登記，再申請法人帳戶。需要開戶後事務協助的人士另行簽約。", rolesTitle: "各項手續由誰負責？", roles: [["設立・許可文件及銀行手續準備", "四葉行政書士事務所"], ["設立登記", "司法書士（直接・另行簽約）"], ["帳戶、匯款、交易權限確認與審查", "金融機構"], ["物件介紹・仲介・契約手續", "四葉不動産株式会社（直接・另行簽約）"], ["稅務／糾紛及個別法律判斷", "稅理士／律師等資格者"]],
    independence: "各事業體・專業人士皆獨立，分別與客戶直接簽約、直接請款、直接收款。本事務所不收介紹費。登記須與司法書士另行簽約，165,000日圓不含司法書士報酬。", disclaimer: "開戶、海外款項入帳及審查期間由銀行判斷，不保證結果或完成時間。設立公司本身亦不代表取得日本在留資格。本頁為一般資訊，個別法律判斷須由資格者確認。",
    feeColumns: ["業務", "單位", "報酬（含消費稅）", "主要範圍", "不包含・另須確認"], names: ["株式會社設立協助", "資本金暫時收取・管理", "法人帳戶申請協助", "開戶後帳戶相關事務"], units: ["1件", "1件", "1家銀行", "月額"], exclusions: ["登記申請、登錄免許稅、章程認證等實費、司法書士報酬及②③④", "資本金本身、銀行・匯款等實費。保管期間・上限・退款條件未確定", "①及銀行手續費等。未能開戶的報酬・退款及再申請條件未確定", "按處理金額增加。金額定義・計算期間・調整標準・業務權限・解約條件未確定"], tax: "日圓（含稅）", minimumPrefix: "", minimumSuffix: "起", feeNote: "①與既有公司設立（章程製作等）165,000日圓為同一筆設立協助報酬，並非追加收費。①與③分別計費。此表不表示總費用、成功報酬或全額退款承諾。翻譯・認證・郵寄・追加詢問等是否包含，亦須在公開前確定。",
    faqTitle: "常見問題", faqs: [{ question: "繼續居住海外也能諮詢嗎？", answer: "持續居住海外與計畫赴日生活而須在留資格的人士，分別整理準備事項。公司設立不保證取得在留資格。" }, { question: "任何人都能用第三人帳戶嗎？", answer: "特例限株式會社發起設立，且發起人及設立時董事全體在日本國內均無住所。收款授權、繳納證明、銀行條件與收款事業規制另須確認。" }, { question: "設立公司即可開戶嗎？", answer: "可否開戶及期間由銀行審查。海外款項入帳另須確認，申請協助不保證結果。" }, { question: "設立・登記・物件是套裝價格嗎？", answer: "各獨立受任者分別直接簽約。165,000日圓不含司法書士報酬、法定費用、不動產費用或銀行相關協助。" }],
    articleLink: "資本金繳納與法人帳戶申請解說", serviceLink: "海外人士的公司設立與銀行手續準備", feeLink: "報酬額表", propertyTitle: "如何從海外準備日本營業據點？", propertyBody: "依業務選擇物件，並協調設立・銀行手續的時間。確認設立前後契約名義、是否允許法人登記及行業物件要件，順序逐案調整。用途最終由出租人判斷。四葉不動産株式会社處理物件尋找及契約；設立文件、繳納方法及銀行準備向四葉行政書士事務所諮詢。兩者獨立，以別契約直接簽約、直接請款、直接收款。不居住日本的公司設立與在留資格所需事業所須分開考慮。物件契約不保證開戶或在留資格。",
    articleTitle: "非居住者設立日本株式會社｜資本金繳納與法人帳戶的辦理方式", excerpt: "全體居住海外的人士亦可申請日本株式會社的設立登記。資本金繳納在特定條件下可使用第三人帳戶，但設立後的法人開戶、海外款項入帳及收取資金業者的法規，各須分別確認。",
    articleSections: [
      { heading: "全體居住海外也能設立株式會社嗎？", paragraphs: ["代表董事全體在日本沒有住所的株式會社，亦可申請設立登記。確定章程、本店、出資及董事，確認海外準備的簽名證明等。赴日生活・經營所需在留資格另行檢討。本文限株式會社的發起設立，不直接適用於合同會社或外國公司日本分店。「非居住者」指居住海外且在日本沒有住所的讀者，不作稅法・外匯法的居住者認定。"] },
      { heading: "資本金可繳入第三人帳戶嗎？", paragraphs: ["法務省特例限發起人及設立時董事全體在日本國內均無住所。須準備收款授權委任文件及繳納證明資料，亦須另確認銀行是否接受。", "第三人從海外收款後交付的安排，亦涉及2026年6月1日施行的資金決済に関する法律修正。預り金專用帳戶的名稱本身不能決定可用性。金融廳No.112涉及設立時出資金收取・移轉例，須由專家對照實際資金流與該例，不能僅因有例示便斷定豁免或可辦理。"] },
      { heading: "公司設立後一定能開法人帳戶嗎？", paragraphs: ["登記完成後，銀行仍確認業務、交易目的、實質支配者及交易聯絡人。包括都市銀行在內，條件與文件因銀行・商品而異。準備業務計畫、契約、據點資料及預定收支，有助整理確認事項。開戶結果與時間取決於銀行審查。"] },
      { heading: "海外款項及交易聯絡人如何確認？", paragraphs: ["開戶後，海外匯款仍可能須提出匯款目的、資金背景與匯款人關係等資料。申請前整理國家・幣別・金額・頻率。", "交易責任人・聯絡人的名稱與權限因銀行而異，外部專業人士能否登錄、委任與本人確認、開戶後能辦的手續，均須逐案確認。不以共享銀行登入資訊或全面單獨操作為當然內容。"] },
    ], preparationTitle: "諮詢前須準備什麼？", preparationColumns: ["項目", "整理內容"], preparation: [["人員與公司", "發起人・董事住所、持股關係、業務、本店候選"], ["設立資金", "出資者、金額、匯款來源、繳納帳戶、收款權限、交付方式"], ["開戶後交易", "交易對象、國家・幣別、金額・頻率、聯絡人與權限"]],
    sourcesTitle: "本文依據", sourceLabels: ["法務省：外國人・海外居民商業法人登記手續", "会社法", "資金決済に関する法律", "資金移動業者に関する内閣府令", "金融廳：令和7年資金決済法修正公眾意見 別紙4 No.112（41頁）", "犯罪による収益の移転防止に関する法律"], sourceNotes: ["2015年3月16日民商第29號通知・2017年3月17日民商第41號通達。2026年10月6日參照。", "第34條第1項・第2項。現行施行版2026年8月12日；最終公布修正2026年7月23日・令和8年法律第64號。", "第2條之2第2號。相關修正2026年6月1日施行。現行施行版2026年8月12日；最終公布修正2026年7月23日・令和8年法律第64號。", "第1條之3第1項・第2項第4號。最終修正2026年5月22日・令和8年內閣府令第51號，2026年6月1日施行。", "2026年5月22日公布；2026年10月6日參照。個案適用須資格者確認。", "第4條第1項第1號至第4號・第4項。現行施行版2026年8月12日；最終公布修正2026年7月23日・令和8年法律第64號。不能代替銀行商品條件・審查。"], author: "作者：浦松丈二｜四葉行政書士事務所 代表行政書士", authorLink: "作者・事務所介紹",
  },
  zh: {
    review: "非公开审阅稿・报酬方案（服务条件及公开尚未批准）", updated: "原稿更新：2026年10月6日（未公开）", home: "首页", column: "专栏", feesTitle: "公司设立・银行手续报酬方案", serviceTitle: "持续居住海外，希望设立日本株式会社的人士", serviceLead: "居住海外且在日本国内没有住所的人士设立株式会社时，除章程等设立文件外，还须准备资本金缴纳账户及设立后使用的法人账户。四葉行政書士事務所协助整理业务、出资者、董事及日本营业据点，说明所需文件与顺序。此处「非居住者」说明读者范围，并非税法或外汇法上的居住者认定。", stagesTitle: "设立时缴纳资本金与法人账户是同一件事吗？", stages: "设立前的资本金缴纳与登记后的法人账户申请是不同阶段。第三人名义账户特例，限发起人及设立时董事全体在日本国内均无住所的株式会社发起设立。收款授权、缴纳证明、银行受理条件及收取・交付资金的法规须分别确认。「預り金口」名称本身不能证明合法性或可用性。",
    entrustedTitle: "可以咨询哪些手续？", services: ["确认业务及机构设计、制作章程等文件、整理资料。登记申请须直接委托司法书士，与本事务所分别签约及收费。", "方案先确认第三人账户特例、收款授权、银行受理条件及资金管理・交付方法。仅对受托条件完整的案件，拟以专用账户暂时收款，并记录收支及报告收取・交付情况。", "以申请的1家银行为单位，协助整理资料、制作业务与交易计划说明、准备面谈及询问的回答资料。与设立协助为不同业务・费用。开户与海外汇款入账各须银行确认。", "方案依合同持续协助整理银行询问、根据客户确认准备回答资料及管理记录等事务。若须登记或变更交易联系人，另确认银行要求及实际权限。"], processTitle: "咨询后如何进行？", process: "了解业务计划与资金流向，整理资料及须向银行确认的事项。其后逐项报价・签约，准备设立文件、确定缴纳方式，由司法书士登记，再申请法人账户。需要开户后事务协助的人士另行签约。", rolesTitle: "各项手续由谁负责？", roles: [["设立・许可文件及银行手续准备", "四葉行政書士事務所"], ["设立登记", "司法书士（直接・另行签约）"], ["账户、汇款、交易权限确认与审查", "金融机构"], ["物件介绍・仲介・合同手续", "四葉不動産株式会社（直接・另行签约）"], ["税务／纠纷及个别法律判断", "税理士／律师等资格者"]], independence: "各事业体・专业人士独立，分别与客户直接签约、直接收费、直接收款。本事务所不收介绍费。登记须与司法书士另行签约，165,000日元不含司法书士报酬。", disclaimer: "开户、海外款项入账及审查期间由银行判断，不保证结果或完成时间。设立公司本身也不代表取得日本在留资格。本页为一般信息，个别法律判断须资格者确认。",
    feeColumns: ["业务", "单位", "报酬（含消费税）", "主要范围", "不包含・另须确认"], names: ["株式会社设立协助", "资本金暂时收取・管理", "法人账户申请协助", "开户后账户相关事务"], units: ["1件", "1件", "1家银行", "月额"], exclusions: ["登记申请、登录免许税、章程认证等实费、司法书士报酬及②③④", "资本金本身、银行・汇款等实费。保管期间・上限・退款条件未确定", "①及银行手续费等。未能开户的报酬・退款及再申请条件未确定", "按处理金额增加。金额定义・计算期间・调整标准・业务权限・解约条件未确定"], tax: "日元（含税）", minimumPrefix: "", minimumSuffix: "起", feeNote: "①与既有公司设立（章程制作等）165,000日元为同一笔设立协助报酬，并非追加收费。①与③分别计费。此表不表示总费用、成功报酬或全额退款承诺。翻译・认证・邮寄・追加询问等是否包含，也须在公开前确定。",
    faqTitle: "常见问题", faqs: [{ question: "继续居住海外也能咨询吗？", answer: "持续居住海外与计划赴日生活而须在留资格的人士，分别整理准备事项。公司设立不保证取得在留资格。" }, { question: "任何人都能用第三人账户吗？", answer: "特例限株式会社发起设立，且发起人及设立时董事全体在日本国内均无住所。收款授权、缴纳证明、银行条件及收款事业规制另须确认。" }, { question: "设立公司即可开户吗？", answer: "能否开户及期间由银行审查。海外款项入账另须确认，申请协助不保证结果。" }, { question: "设立・登记・物件是套装价格吗？", answer: "各独立受任者分别直接签约。165,000日元不含司法书士报酬、法定费用、不动产费用或银行相关协助。" }], articleLink: "资本金缴纳与法人账户申请解说", serviceLink: "海外人士的公司设立与银行手续准备", feeLink: "报酬额表", propertyTitle: "如何从海外准备日本营业据点？", propertyBody: "根据业务选择物件，并协调设立・银行手续时间。确认设立前后合同名义、是否允许法人登记及行业物件要求，顺序逐案调整。用途最终由出租人判断。四葉不動産株式会社处理物件寻找及合同；设立文件、缴纳方法及银行准备向四葉行政書士事務所咨询。两者独立，以别合同直接签约、直接收费、直接收款。不居住日本的公司设立与在留资格所需事业所须分开考虑。物件合同不保证开户或在留资格。",
    articleTitle: "非居住者设立日本株式会社｜资本金缴纳与法人账户的办理方式", excerpt: "全体居住海外的人士也可申请日本株式会社的设立登记。资本金缴纳在特定条件下可使用第三人账户，但设立后的法人开户、海外款项入账及收取资金业者的法规各须分别确认。",
    articleSections: [
      { heading: "全体居住海外也能设立株式会社吗？", paragraphs: ["代表董事全体在日本没有住所的株式会社也可申请设立登记。确定章程、本店、出资及董事，确认海外准备的签名证明等。赴日生活・经营所需在留资格另行考虑。本文限株式会社发起设立，不直接适用于合同会社或外国公司日本分店。「非居住者」指居住海外且在日本没有住所的读者，不作税法・外汇法的居住者认定。"] },
      { heading: "资本金可缴入第三人账户吗？", paragraphs: ["法务省特例限发起人及设立时董事全体在日本国内均无住所。须准备收款授权委托文件及缴纳证明资料，也须另确认银行是否接受。", "第三人从海外收款后交付的安排也涉及2026年6月1日施行的資金決済に関する法律修正。預り金专用账户的名称本身不能决定可用性。金融厅No.112涉及设立时出资金收取・移转例，须由专家对照实际资金流与该例，不能仅因有例示便断定豁免或可办理。"] },
      { heading: "公司设立后一定能开法人账户吗？", paragraphs: ["登记完成后，银行仍确认业务、交易目的、实质支配者及交易联系人。包括都市银行在内，条件与文件因银行・产品而异。准备业务计划、合同、据点资料及预定收支，有助整理确认事项。开户结果与时间取决于银行审查。"] },
      { heading: "海外款项及交易联系人如何确认？", paragraphs: ["开户后海外汇款仍可能须提出汇款目的、资金背景与汇款人关系等资料。申请前整理国家・币种・金额・频率。", "交易负责人・联系人的名称及权限因银行而异，外部专业人士能否登记、授权与本人确认、开户后能办的手续均须逐案确认。不以共享银行登录信息或全面单独操作为当然内容。"] },
    ], preparationTitle: "咨询前须准备什么？", preparationColumns: ["项目", "整理内容"], preparation: [["人员与公司", "发起人・董事住所、持股关系、业务、本店候选"], ["设立资金", "出资者、金额、汇款来源、缴纳账户、收款权限、交付方式"], ["开户后交易", "交易对象、国家・币种、金额・频率、联系人及权限"]],
    sourcesTitle: "本文依据", sourceLabels: ["法务省：外国人・海外居民商业法人登记手续", "会社法", "資金決済に関する法律", "資金移動業者に関する内閣府令", "金融厅：令和7年資金決済法修正公众意见 别纸4 No.112（41页）", "犯罪による収益の移転防止に関する法律"], sourceNotes: ["2015年3月16日民商第29号通知・2017年3月17日民商第41号通达。2026年10月6日参照。", "第34条第1项・第2项。现行施行版2026年8月12日；最终公布修正2026年7月23日・令和8年法律第64号。", "第2条之2第2号。相关修正2026年6月1日施行。现行施行版2026年8月12日；最终公布修正2026年7月23日・令和8年法律第64号。", "第1条之3第1项・第2项第4号。最终修正2026年5月22日・令和8年内阁府令第51号，2026年6月1日施行。", "2026年5月22日公布；2026年10月6日参照。个案适用须资格者确认。", "第4条第1项第1号至第4号・第4项。现行施行版2026年8月12日；最终公布修正2026年7月23日・令和8年法律第64号。不能代替银行产品条件・审查。"], author: "作者：浦松丈二｜四葉行政書士事務所 代表行政书士", authorLink: "作者・事务所介绍",
  },
};

export const NONRESIDENT_SOURCES = [
  "https://www.moj.go.jp/MINJI/minji06_00104.html",
  "https://laws.e-gov.go.jp/law/417AC0000000086",
  "https://laws.e-gov.go.jp/law/421AC0000000059",
  "https://laws.e-gov.go.jp/law/422M60000002004",
  "https://www.fsa.go.jp/news/r7/sonota/20260522/04.pdf#page=41",
  "https://laws.e-gov.go.jp/law/419AC0000000022",
] as const;

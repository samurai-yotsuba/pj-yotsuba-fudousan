import type { LangCode } from "@/config/languages";
export type AncillaryRow = { name: string; unit: string; price: string; value?: number };
export type AncillarySection = { id?: string; title: string; lead?: string; note?: string; rows: AncillaryRow[] };
export const LABOR_ANCILLARY_FEES = {
  "ja": {
    "sections": [
      {
        "title": "ご相談（顧問契約前）",
        "note": "顧問契約に至らない場合の2回目以降に申し受けます。顧問契約後のご相談は顧問料に含まれます。",
        "rows": [
          {
            "name": "初めてのご相談",
            "unit": "60分まで",
            "price": "無料"
          },
          {
            "name": "2回目以降のご相談",
            "unit": "1時間",
            "price": "11,000円",
            "value": 11000
          }
        ]
      },
      {
        "title": "住民税の手続",
        "rows": [
          {
            "name": "住民税 特別徴収税額の年度更新",
            "unit": "1名／年",
            "price": "550円",
            "value": 550
          },
          {
            "name": "住民税 特別徴収の異動届",
            "unit": "1件",
            "price": "お見積り"
          }
        ]
      },
      {
        "title": "事業所の変更・廃止",
        "rows": [
          {
            "name": "事業所 各種変更届",
            "unit": "1件",
            "price": "6,050円",
            "value": 6050
          },
          {
            "name": "社会保険 適用事業所全喪届",
            "unit": "1件",
            "price": "11,550円",
            "value": 11550
          },
          {
            "name": "雇用保険 適用事業所廃止届",
            "unit": "1件",
            "price": "6,050円",
            "value": 6050
          },
          {
            "name": "労働保険 確定保険料申告・保険関係消滅",
            "unit": "一式",
            "price": "15,400円〜"
          }
        ]
      },
      {
        "title": "手続代行（給付）",
        "rows": [
          {
            "name": "傷病手当金 申請",
            "unit": "1件",
            "price": "15,400円",
            "value": 15400
          },
          {
            "name": "出産手当金 申請",
            "unit": "1件",
            "price": "15,400円",
            "value": 15400
          },
          {
            "name": "育児休業給付金",
            "unit": "1件",
            "price": "初回 27,500円／2回目以降 6,600円〜"
          }
        ]
      },
      {
        "title": "36協定",
        "note": "料金は1事業場あたりの作成・届出です。",
        "rows": [
          {
            "name": "36協定 新規作成・届出",
            "unit": "1事業場",
            "price": "22,000円",
            "value": 22000
          },
          {
            "name": "特別条項付き36協定 新規作成・届出",
            "unit": "1事業場",
            "price": "27,500円",
            "value": 27500
          },
          {
            "name": "36協定 翌年度更新",
            "unit": "1事業場",
            "price": "11,000円",
            "value": 11000
          },
          {
            "name": "特別条項付き36協定 翌年度更新",
            "unit": "1事業場",
            "price": "16,500円",
            "value": 16500
          }
        ]
      },
      {
        "id": "work-rules",
        "title": "規程",
        "note": "当事務所が作成した規程の法改正対応（該当条文の改定と届出）は、顧問料に含まれます。回数の制限はありません。会社の都合による改定は「就業規則 変更」の料金を申し受けます。",
        "rows": [
          {
            "name": "就業規則 新規作成",
            "unit": "一式",
            "price": "88,000〜220,000円（規模・規程の本数で変動）"
          },
          {
            "name": "就業規則 変更",
            "unit": "一式",
            "price": "44,000円〜"
          },
          {
            "name": "賃金規程 作成",
            "unit": "1件",
            "price": "49,800円",
            "value": 49800
          },
          {
            "name": "育児介護休業規程 作成",
            "unit": "1件",
            "price": "79,800円",
            "value": 79800
          },
          {
            "name": "ハラスメント防止規程 作成",
            "unit": "1件",
            "price": "11,000円",
            "value": 11000
          },
          {
            "name": "社宅規程 作成",
            "unit": "1件",
            "price": "38,500円",
            "value": 38500
          },
          {
            "name": "出張旅費規程 作成",
            "unit": "1件",
            "price": "59,800円",
            "value": 59800
          }
        ]
      },
      {
        "title": "加算・募集・調査",
        "rows": [
          {
            "name": "処遇改善加算 賃金要件の設計・算定支援",
            "unit": "1件",
            "price": "お見積り"
          },
          {
            "name": "労基署調査・是正対応",
            "unit": "1件",
            "price": "55,000〜110,000円"
          },
          {
            "name": "従業員説明会の開催",
            "unit": "1回",
            "price": "55,000円",
            "value": 55000
          },
          {
            "name": "労働者代表の選出支援",
            "unit": "—",
            "price": "無料"
          }
        ]
      },
      {
        "title": "助成金",
        "note": "着手金はいただきません。紹介料の授受も行いません。",
        "rows": [
          {
            "name": "助成金 申請代行（顧問先限定）",
            "unit": "一式",
            "price": "着手金なし ＋ 成功報酬 支給額の20%"
          }
        ]
      },
      {
        "title": "外部監査人（監理支援機関のお客さま）",
        "lead": "顧問契約は不要です。監理支援機関から直接お受けします。",
        "note": "外部監査人をお引き受けした監理支援機関の関係先とは、労務の顧問契約を結びません。既存の顧問先が加入している監理支援機関の外部監査人も、お引き受けしません。",
        "rows": [
          {
            "name": "外部監査人 就任・定期監査",
            "unit": "1回",
            "price": "お見積り"
          },
          {
            "name": "実地確認への同行",
            "unit": "1回",
            "price": "上記のお見積りに含みます"
          }
        ]
      },
      {
        "title": "障害年金（個人のお客さま）",
        "lead": "顧問契約は不要です。ご本人・ご家族から直接お受けします。",
        "note": "着手金・成功報酬の額は税込です。診断書料等の実費は別途申し受けます。障害年金の裁定請求の代理は社会保険労務士の業務です。",
        "rows": [
          {
            "name": "障害年金 裁定請求（新規）",
            "unit": "1件",
            "price": "着手金 30,000円 ＋ 成功報酬 年金3ヶ月分"
          },
          {
            "name": "障害年金 裁定請求（遡及請求あり）",
            "unit": "1件",
            "price": "上記 ＋ 遡及額の15%"
          },
          {
            "name": "事務手数料・実費",
            "unit": "—",
            "price": "郵送・診断書料・書類取得等の実費は別途"
          }
        ]
      }
    ],
    "notTitle": "当事務所では取り扱わない業務",
    "notLead": "次の業務は当事務所では承っておりません。その資格をお持ちの方におつなぎします。",
    "notLeadStrong": "ご紹介にあたって紹介料の授受は一切行いません。",
    "notRows": [
      {
        "name": "年末調整に伴う扶養控除・賃貸料相当額・非課税限度額などの税務判断・税務相談",
        "to": "税理士"
      },
      {
        "name": "法人登記の変更",
        "to": "司法書士"
      },
      {
        "name": "離職理由をめぐる争いなど、紛争性が生じた事案",
        "to": "弁護士"
      },
      {
        "name": "在留資格の申請書類の作成・申請取次",
        "to": "四葉行政書士事務所（別事業体・別々にご契約いただきます）"
      },
      {
        "name": "処遇改善加算の計画書・実績報告書の作成と指定権者への提出",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "補助金の申請",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "監理支援機関の許可申請書類の作成",
        "to": "四葉行政書士事務所（同上）"
      }
    ],
    "notNote": "※四葉不動産株式会社・四葉行政書士事務所・四葉社会保険労務士事務所は、それぞれ別の事業体として独立してご依頼をお受けします。ご依頼いただく場合は事務所ごとに別々にご契約いただき、料金・請求も分かれます。当事務所へのご依頼が、他の事務所へのご依頼の条件になることはありません。",
    "taxNote": "※金額はすべて税込です。「〜」「お見積り」としている項目は、事案により作業量が変わるため、ご契約前に個別のお見積りを書面でご提示します。確定額のみ構造化データ（PriceSpecification）として出力しています。",
    "crossLead": "行政書士業務（指定申請・在留資格・補助金等）の報酬は、四葉行政書士事務所（別事業体・独立受任）のページへ。",
    "authorTitle": "この記事の著者",
    "authorBody1": " 浦松 丈二｜四葉社会保険労務士事務所 代表 社会保険労務士",
    "authorBody2": "・行政書士（登録番号 第25087022号）・宅地建物取引士。元毎日新聞中国総局長（記者歴34年）。"
  },
  "en": {
    "sections": [
      {
        "title": "Consultations (before an advisory contract)",
        "note": "Charged from the second consultation onward when no advisory contract follows. After contracting, consultations are covered by the advisory fee.",
        "rows": [
          {
            "name": "First consultation",
            "unit": "up to 60 min",
            "price": "free"
          },
          {
            "name": "Second consultation onward",
            "unit": "per hour",
            "price": "¥11,000",
            "value": 11000
          }
        ]
      },
      {
        "title": "Resident tax procedures",
        "rows": [
          {
            "name": "Resident tax: annual update of special collection amounts",
            "unit": "per person / year",
            "price": "¥550",
            "value": 550
          },
          {
            "name": "Resident tax: special-collection change report",
            "unit": "per case",
            "price": "individual quote"
          }
        ]
      },
      {
        "title": "Workplace changes and closure",
        "rows": [
          {
            "name": "Workplace change notifications",
            "unit": "per case",
            "price": "¥6,050",
            "value": 6050
          },
          {
            "name": "Social insurance: full-loss report of covered workplace",
            "unit": "per case",
            "price": "¥11,550",
            "value": 11550
          },
          {
            "name": "Employment insurance: workplace closure report",
            "unit": "per case",
            "price": "¥6,050",
            "value": 6050
          },
          {
            "name": "Labor insurance: final premium declaration / termination",
            "unit": "package",
            "price": "from ¥15,400"
          }
        ]
      },
      {
        "title": "Benefit applications",
        "rows": [
          {
            "name": "Injury and sickness allowance claim",
            "unit": "per case",
            "price": "¥15,400",
            "value": 15400
          },
          {
            "name": "Maternity allowance claim",
            "unit": "per case",
            "price": "¥15,400",
            "value": 15400
          },
          {
            "name": "Childcare leave benefits",
            "unit": "per case",
            "price": "first ¥27,500 / thereafter from ¥6,600"
          }
        ]
      },
      {
        "title": "Article 36 agreements",
        "note": "Per workplace, drafting and filing.",
        "rows": [
          {
            "name": "Article 36 agreement: new drafting & filing",
            "unit": "per workplace",
            "price": "¥22,000",
            "value": 22000
          },
          {
            "name": "With special clauses: new drafting & filing",
            "unit": "per workplace",
            "price": "¥27,500",
            "value": 27500
          },
          {
            "name": "Article 36 agreement: annual renewal",
            "unit": "per workplace",
            "price": "¥11,000",
            "value": 11000
          },
          {
            "name": "With special clauses: annual renewal",
            "unit": "per workplace",
            "price": "¥16,500",
            "value": 16500
          }
        ]
      },
      {
        "id": "work-rules",
        "title": "Rules and regulations",
        "note": "For rules drafted by this office, amendments required by legal changes (revision of the affected articles and filing) are covered by the advisory fee, with no limit on frequency. Revisions at the company's own initiative are charged as \"work rules: revision\".",
        "rows": [
          {
            "name": "Work rules: new drafting",
            "unit": "package",
            "price": "¥88,000–220,000 (varies by size and number of rules)"
          },
          {
            "name": "Work rules: revision",
            "unit": "package",
            "price": "from ¥44,000"
          },
          {
            "name": "Wage rules",
            "unit": "per set",
            "price": "¥49,800",
            "value": 49800
          },
          {
            "name": "Childcare/caregiver leave rules",
            "unit": "per set",
            "price": "¥79,800",
            "value": 79800
          },
          {
            "name": "Harassment prevention rules",
            "unit": "per set",
            "price": "¥11,000",
            "value": 11000
          },
          {
            "name": "Company-housing rules",
            "unit": "per set",
            "price": "¥38,500",
            "value": 38500
          },
          {
            "name": "Business-travel expense rules",
            "unit": "per set",
            "price": "¥59,800",
            "value": 59800
          }
        ]
      },
      {
        "title": "Additions, recruitment, inspections",
        "rows": [
          {
            "name": "Treatment-improvement addition: wage-requirement design",
            "unit": "per case",
            "price": "individual quote"
          },
          {
            "name": "Labor Standards Office inspection response",
            "unit": "per case",
            "price": "¥55,000–110,000"
          },
          {
            "name": "Employee briefing session",
            "unit": "per session",
            "price": "¥55,000",
            "value": 55000
          },
          {
            "name": "Support for electing an employee representative",
            "unit": "—",
            "price": "free"
          }
        ]
      },
      {
        "title": "Subsidies",
        "note": "No upfront fee. No referral fees are paid or received.",
        "rows": [
          {
            "name": "Subsidy application (advisory clients only)",
            "unit": "package",
            "price": "no upfront fee + success fee of 20% of the amount granted"
          }
        ]
      },
      {
        "title": "External auditor (for supervising support organizations)",
        "lead": "No advisory contract required; engaged directly by the supervising support organization.",
        "note": "We do not enter labor advisory contracts with parties related to a supervising support organization whose external auditor we serve as, and we do not serve as external auditor for an organization our existing advisory clients belong to.",
        "rows": [
          {
            "name": "External auditor: appointment & periodic audits",
            "unit": "per audit",
            "price": "individual quote"
          },
          {
            "name": "Accompanying on-site checks",
            "unit": "per visit",
            "price": "included in the quote above"
          }
        ]
      },
      {
        "title": "Disability pension (individual clients)",
        "lead": "No advisory contract required; engaged directly by the person or their family.",
        "note": "Upfront and success fees are tax-inclusive. Out-of-pocket costs such as medical certificates are charged separately. Representing disability pension claims is the work of Certified Social Insurance and Labor Consultants.",
        "rows": [
          {
            "name": "Disability pension claim (new)",
            "unit": "per case",
            "price": "¥30,000 upfront + success fee of 3 months of pension"
          },
          {
            "name": "Disability pension claim (with retroactive claim)",
            "unit": "per case",
            "price": "the above + 15% of the retroactive amount"
          },
          {
            "name": "Administrative costs",
            "unit": "—",
            "price": "postage, medical certificates, and document fees are charged at cost"
          }
        ]
      }
    ],
    "notTitle": "Work this office does not handle",
    "notLead": "The following is not handled by this office. We will refer you to a qualified professional.",
    "notLeadStrong": " No referral fees are paid or received.",
    "notRows": [
      {
        "name": "Tax judgments and tax advice in the year-end adjustment (dependent deductions, deemed rent, non-taxable limits)",
        "to": "a licensed tax accountant"
      },
      {
        "name": "Changes to corporate registration",
        "to": "a judicial scrivener"
      },
      {
        "name": "Disputes, such as contested reasons for leaving employment",
        "to": "an attorney"
      },
      {
        "name": "Preparing residence-status application documents / application services",
        "to": "四葉行政書士事務所 (a separate business entity; contracted separately)"
      },
      {
        "name": "Preparing and filing treatment-improvement addition plans and reports",
        "to": "四葉行政書士事務所 (same as above)"
      },
      {
        "name": "Subsidy (hojokin) applications",
        "to": "四葉行政書士事務所 (same as above)"
      },
      {
        "name": "Preparing permit applications for supervising support organizations",
        "to": "四葉行政書士事務所 (same as above)"
      }
    ],
    "notNote": "* Yotsuba Real Estate Co., Ltd., 四葉行政書士事務所, and 四葉社会保険労務士事務所 are independent business entities and accept engagements separately. Contracts, fees, and billing are separate for each office, and engaging this office is never a condition for engaging another.",
    "taxNote": "* All amounts include tax. Items marked \"from\" or \"individual quote\" vary in workload by case; a written individual quote is presented before contracting. Only fixed amounts are output as structured data (PriceSpecification).",
    "crossLead": "For fees of administrative-scrivener work (designation applications, residence status, subsidies), see 四葉行政書士事務所 — a separate business entity engaged independently.",
    "authorTitle": "Author",
    "authorBody1": " Joji Uramatsu | Representative, 四葉社会保険労務士事務所; Certified Social Insurance and Labor Consultant",
    "authorBody2": "; Administrative Scrivener (Reg. No. 25087022); Licensed Real Estate Transaction Specialist. Former China General Bureau Chief of the Mainichi Shimbun (34 years as a journalist)."
  },
  "zh-tw": {
    "sections": [
      {
        "title": "諮詢（顧問契約前）",
        "note": "未簽訂顧問契約時，自第2次起收費。簽約後的諮詢包含在顧問費內。",
        "rows": [
          {
            "name": "首次諮詢",
            "unit": "60分鐘以內",
            "price": "免費"
          },
          {
            "name": "第2次起的諮詢",
            "unit": "每小時",
            "price": "11,000日圓",
            "value": 11000
          }
        ]
      },
      {
        "title": "住民稅手續",
        "rows": [
          {
            "name": "住民稅 特別徵收稅額的年度更新",
            "unit": "每人／年",
            "price": "550日圓",
            "value": 550
          },
          {
            "name": "住民稅 特別徵收異動届",
            "unit": "1件",
            "price": "個別報價"
          }
        ]
      },
      {
        "title": "事業所變更與廢止",
        "rows": [
          {
            "name": "事業所 各種變更届",
            "unit": "1件",
            "price": "6,050日圓",
            "value": 6050
          },
          {
            "name": "社會保險 適用事業所全喪届",
            "unit": "1件",
            "price": "11,550日圓",
            "value": 11550
          },
          {
            "name": "僱用保險 適用事業所廢止届",
            "unit": "1件",
            "price": "6,050日圓",
            "value": 6050
          },
          {
            "name": "勞動保險 確定保險料申告・保險關係消滅",
            "unit": "一式",
            "price": "15,400日圓起"
          }
        ]
      },
      {
        "title": "給付申請",
        "rows": [
          {
            "name": "傷病手當金 申請",
            "unit": "1件",
            "price": "15,400日圓",
            "value": 15400
          },
          {
            "name": "出產手當金 申請",
            "unit": "1件",
            "price": "15,400日圓",
            "value": 15400
          },
          {
            "name": "育兒休業給付金",
            "unit": "1件",
            "price": "首次 27,500日圓／第2次起 6,600日圓起"
          }
        ]
      },
      {
        "title": "36協定",
        "note": "費用為每一事業場的製作・申報。",
        "rows": [
          {
            "name": "36協定 新規製作・申報",
            "unit": "每一事業場",
            "price": "22,000日圓",
            "value": 22000
          },
          {
            "name": "附特別條款36協定 新規製作・申報",
            "unit": "每一事業場",
            "price": "27,500日圓",
            "value": 27500
          },
          {
            "name": "36協定 翌年度更新",
            "unit": "每一事業場",
            "price": "11,000日圓",
            "value": 11000
          },
          {
            "name": "附特別條款36協定 翌年度更新",
            "unit": "每一事業場",
            "price": "16,500日圓",
            "value": 16500
          }
        ]
      },
      {
        "id": "work-rules",
        "title": "規程",
        "note": "本事務所製作的規程，因法令修正所需的對應（相關條文修訂與申報）包含在顧問費內，不限次數。因公司自身需要的修訂，按「工作規則 變更」收費。",
        "rows": [
          {
            "name": "工作規則 新規製作",
            "unit": "一式",
            "price": "88,000〜220,000日圓（依規模・規程數量而異）"
          },
          {
            "name": "工作規則 變更",
            "unit": "一式",
            "price": "44,000日圓起"
          },
          {
            "name": "薪資規程 製作",
            "unit": "1件",
            "price": "49,800日圓",
            "value": 49800
          },
          {
            "name": "育兒介護休業規程 製作",
            "unit": "1件",
            "price": "79,800日圓",
            "value": 79800
          },
          {
            "name": "防止騷擾規程 製作",
            "unit": "1件",
            "price": "11,000日圓",
            "value": 11000
          },
          {
            "name": "員工宿舍規程 製作",
            "unit": "1件",
            "price": "38,500日圓",
            "value": 38500
          },
          {
            "name": "出差旅費規程 製作",
            "unit": "1件",
            "price": "59,800日圓",
            "value": 59800
          }
        ]
      },
      {
        "title": "加算・招募・調查",
        "rows": [
          {
            "name": "處遇改善加算 薪資要件的設計・計算支援",
            "unit": "1件",
            "price": "個別報價"
          },
          {
            "name": "勞基署調查・改善對應",
            "unit": "1件",
            "price": "55,000〜110,000日圓"
          },
          {
            "name": "員工說明會",
            "unit": "1回",
            "price": "55,000日圓",
            "value": 55000
          },
          {
            "name": "勞工代表選出支援",
            "unit": "—",
            "price": "免費"
          }
        ]
      },
      {
        "title": "助成金",
        "note": "不收著手金。不收取、也不支付介紹費。",
        "rows": [
          {
            "name": "助成金 申請代行（限顧問客戶）",
            "unit": "一式",
            "price": "無著手金 ＋ 成功報酬 支給額的20%"
          }
        ]
      },
      {
        "title": "外部監查人（監理支援機關客戶）",
        "lead": "不需顧問契約。由監理支援機關直接委託。",
        "note": "與本事務所擔任外部監查人之監理支援機關的關係單位，不簽訂勞務顧問契約。既有顧問客戶所加入之監理支援機關的外部監查人，亦不承接。",
        "rows": [
          {
            "name": "外部監查人 就任・定期監查",
            "unit": "1回",
            "price": "個別報價"
          },
          {
            "name": "實地確認同行",
            "unit": "1回",
            "price": "包含在上述報價內"
          }
        ]
      },
      {
        "title": "障害年金（個人客戶）",
        "lead": "不需顧問契約。由本人・家屬直接委託。",
        "note": "著手金・成功報酬為含稅。診斷書費等實費另計。障害年金裁定請求的代理為社會保險勞務士的業務。",
        "rows": [
          {
            "name": "障害年金 裁定請求（新規）",
            "unit": "1件",
            "price": "著手金 30,000日圓 ＋ 成功報酬 年金3個月分"
          },
          {
            "name": "障害年金 裁定請求（含遡及請求）",
            "unit": "1件",
            "price": "上述 ＋ 遡及額的15%"
          },
          {
            "name": "事務手續費・實費",
            "unit": "—",
            "price": "郵寄・診斷書費・文件取得等實費另計"
          }
        ]
      }
    ],
    "notTitle": "本事務所不承辦的業務",
    "notLead": "下列業務本事務所不承辦。我們會為您轉介具備該資格的專業人士。",
    "notLeadStrong": "轉介不收取、也不支付任何介紹費。",
    "notRows": [
      {
        "name": "年終調整中的扶養扣除・相當租金額・非課稅限度額等稅務判斷與稅務諮詢",
        "to": "稅理士"
      },
      {
        "name": "法人登記的變更",
        "to": "司法書士"
      },
      {
        "name": "離職理由的爭議等具紛爭性的案件",
        "to": "律師"
      },
      {
        "name": "在留資格申請文件的製作・申請取次",
        "to": "四葉行政書士事務所（另一獨立事業體・另行簽約）"
      },
      {
        "name": "處遇改善加算計畫書・實績報告書的製作與向指定權者提出",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "補助金申請",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "監理支援機關許可申請文件的製作",
        "to": "四葉行政書士事務所（同上）"
      }
    ],
    "notNote": "※四葉不動產株式會社・四葉行政書士事務所・四葉社會保險勞務士事務所為各自獨立的事業體，分別承接委託。委託時依事務所分別簽約，費用・請款也分開。委託本事務所，不會成為委託其他事務所的條件。",
    "taxNote": "※金額均為含稅。標示「起」「個別報價」的項目，因作業量隨個案而異，將於簽約前以書面提出個別報價。僅確定金額輸出為結構化資料（PriceSpecification）。",
    "crossLead": "行政書士業務（指定申請・在留資格・補助金等）的報酬，請見四葉行政書士事務所（另一獨立事業體・獨立受任）的頁面。",
    "authorTitle": "本文作者",
    "authorBody1": " 浦松 丈二｜四葉社會保險勞務士事務所 代表 社會保險勞務士",
    "authorBody2": "・行政書士（登錄號 第25087022號）・宅地建物取引士。曾任每日新聞中國總局長（記者資歷34年）。"
  },
  "zh": {
    "sections": [
      {
        "title": "咨询（顾问合同前）",
        "note": "未签订顾问合同时，自第2次起收费。签约后的咨询包含在顾问费内。",
        "rows": [
          {
            "name": "首次咨询",
            "unit": "60分钟以内",
            "price": "免费"
          },
          {
            "name": "第2次起的咨询",
            "unit": "每小时",
            "price": "11,000日元",
            "value": 11000
          }
        ]
      },
      {
        "title": "住民税手续",
        "rows": [
          {
            "name": "住民税 特别征收税额的年度更新",
            "unit": "每人／年",
            "price": "550日元",
            "value": 550
          },
          {
            "name": "住民税 特别征收异动届",
            "unit": "1件",
            "price": "个别报价"
          }
        ]
      },
      {
        "title": "事业所变更与废止",
        "rows": [
          {
            "name": "事业所 各种变更届",
            "unit": "1件",
            "price": "6,050日元",
            "value": 6050
          },
          {
            "name": "社会保险 适用事业所全丧届",
            "unit": "1件",
            "price": "11,550日元",
            "value": 11550
          },
          {
            "name": "雇用保险 适用事业所废止届",
            "unit": "1件",
            "price": "6,050日元",
            "value": 6050
          },
          {
            "name": "劳动保险 确定保险料申告・保险关系消灭",
            "unit": "一式",
            "price": "15,400日元起"
          }
        ]
      },
      {
        "title": "给付申请",
        "rows": [
          {
            "name": "伤病津贴金 申请",
            "unit": "1件",
            "price": "15,400日元",
            "value": 15400
          },
          {
            "name": "生育津贴金 申请",
            "unit": "1件",
            "price": "15,400日元",
            "value": 15400
          },
          {
            "name": "育儿休业给付金",
            "unit": "1件",
            "price": "首次 27,500日元／第2次起 6,600日元起"
          }
        ]
      },
      {
        "title": "36协定",
        "note": "费用为每一事业场的制作・申报。",
        "rows": [
          {
            "name": "36协定 新规制作・申报",
            "unit": "每一事业场",
            "price": "22,000日元",
            "value": 22000
          },
          {
            "name": "附特别条款36协定 新规制作・申报",
            "unit": "每一事业场",
            "price": "27,500日元",
            "value": 27500
          },
          {
            "name": "36协定 翌年度更新",
            "unit": "每一事业场",
            "price": "11,000日元",
            "value": 11000
          },
          {
            "name": "附特别条款36协定 翌年度更新",
            "unit": "每一事业场",
            "price": "16,500日元",
            "value": 16500
          }
        ]
      },
      {
        "id": "work-rules",
        "title": "规程",
        "note": "本事务所制作的规程，因法令修订所需的对应（相关条文修订与申报）包含在顾问费内，不限次数。因公司自身需要的修订，按「就业规则 变更」收费。",
        "rows": [
          {
            "name": "就业规则 新规制作",
            "unit": "一式",
            "price": "88,000〜220,000日元（按规模・规程数量而异）"
          },
          {
            "name": "就业规则 变更",
            "unit": "一式",
            "price": "44,000日元起"
          },
          {
            "name": "工资规程 制作",
            "unit": "1件",
            "price": "49,800日元",
            "value": 49800
          },
          {
            "name": "育儿介护休业规程 制作",
            "unit": "1件",
            "price": "79,800日元",
            "value": 79800
          },
          {
            "name": "防止骚扰规程 制作",
            "unit": "1件",
            "price": "11,000日元",
            "value": 11000
          },
          {
            "name": "员工宿舍规程 制作",
            "unit": "1件",
            "price": "38,500日元",
            "value": 38500
          },
          {
            "name": "出差旅费规程 制作",
            "unit": "1件",
            "price": "59,800日元",
            "value": 59800
          }
        ]
      },
      {
        "title": "加算・招聘・调查",
        "rows": [
          {
            "name": "处遇改善加算 工资要件的设计・计算支援",
            "unit": "1件",
            "price": "个别报价"
          },
          {
            "name": "劳基署调查・改善对应",
            "unit": "1件",
            "price": "55,000〜110,000日元"
          },
          {
            "name": "员工说明会",
            "unit": "1回",
            "price": "55,000日元",
            "value": 55000
          },
          {
            "name": "劳动者代表选出支援",
            "unit": "—",
            "price": "免费"
          }
        ]
      },
      {
        "title": "助成金",
        "note": "不收着手金。不收取、也不支付介绍费。",
        "rows": [
          {
            "name": "助成金 申请代行（限顾问客户）",
            "unit": "一式",
            "price": "无着手金 ＋ 成功报酬 支给额的20%"
          }
        ]
      },
      {
        "title": "外部监查人（监理支援机关客户）",
        "lead": "不需顾问合同。由监理支援机关直接委托。",
        "note": "与本事务所担任外部监查人之监理支援机关的关系单位，不签订劳务顾问合同。既有顾问客户所加入之监理支援机关的外部监查人，亦不承接。",
        "rows": [
          {
            "name": "外部监查人 就任・定期监查",
            "unit": "1回",
            "price": "个别报价"
          },
          {
            "name": "实地确认同行",
            "unit": "1回",
            "price": "包含在上述报价内"
          }
        ]
      },
      {
        "title": "障害年金（个人客户）",
        "lead": "不需顾问合同。由本人・家属直接委托。",
        "note": "着手金・成功报酬为含税。诊断书费等实费另计。障害年金裁定请求的代理为社会保险劳务士的业务。",
        "rows": [
          {
            "name": "障害年金 裁定请求（新规）",
            "unit": "1件",
            "price": "着手金 30,000日元 ＋ 成功报酬 年金3个月分"
          },
          {
            "name": "障害年金 裁定请求（含追溯请求）",
            "unit": "1件",
            "price": "上述 ＋ 追溯额的15%"
          },
          {
            "name": "事务手续费・实费",
            "unit": "—",
            "price": "邮寄・诊断书费・文件取得等实费另计"
          }
        ]
      }
    ],
    "notTitle": "本事务所不承办的业务",
    "notLead": "下列业务本事务所不承办。我们会为您介绍具备该资格的专业人士。",
    "notLeadStrong": "介绍不收取、也不支付任何介绍费。",
    "notRows": [
      {
        "name": "年终调整中的抚养扣除・相当租金额・非课税限度额等税务判断与税务咨询",
        "to": "税理士"
      },
      {
        "name": "法人登记的变更",
        "to": "司法书士"
      },
      {
        "name": "离职理由的争议等具纠纷性的案件",
        "to": "律师"
      },
      {
        "name": "在留资格申请文件的制作・申请取次",
        "to": "四葉行政書士事務所（另一独立事业体・分别签约）"
      },
      {
        "name": "处遇改善加算计划书・实绩报告书的制作与向指定权者提出",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "补助金申请",
        "to": "四葉行政書士事務所（同上）"
      },
      {
        "name": "监理支援机关许可申请文件的制作",
        "to": "四葉行政書士事務所（同上）"
      }
    ],
    "notNote": "※四葉不動産株式会社・四葉行政書士事務所・四葉社会保険労務士事務所为各自独立的事业体，分别承接委托。委托时按事务所分别签约，费用・请款也分开。委托本事务所，不会成为委托其他事务所的条件。",
    "taxNote": "※金额均为含税。标示「起」「个别报价」的项目，因作业量随个案而异，将于签约前以书面提出个别报价。仅确定金额输出为结构化数据（PriceSpecification）。",
    "crossLead": "行政书士业务（指定申请・在留资格・补助金等）的报酬，请见四葉行政書士事務所（另一独立事业体・独立受任）的页面。",
    "authorTitle": "本文作者",
    "authorBody1": " 浦松 丈二｜四葉社会保険労務士事務所 代表 社会保险劳务士",
    "authorBody2": "・行政书士（登录号 第25087022号）・宅地建物取引士。曾任每日新闻中国总局长（记者经历34年）。"
  }
} satisfies Record<LangCode, {sections: AncillarySection[]; notTitle: string; notLead: string; notLeadStrong: string; notRows: {name:string;to:string}[]; notNote:string;taxNote:string;crossLead:string;authorTitle:string;authorBody1:string;authorBody2:string}>;

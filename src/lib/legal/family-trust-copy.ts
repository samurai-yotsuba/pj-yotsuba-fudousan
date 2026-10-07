// 掲載原稿：浦松提供・2026-10-07（第2〜6章）。料金の施行日は未設定。
// 料率・最低額・基礎額は消費税込み。端数処理・公開計算機能は追加しない。
import type { LangCode } from "@/config/languages";
import type { FaqItem } from "@/components/shared/Faq";
import { addLocalePrefix } from "@/lib/locale";

export const FAMILY_TRUST_PATH = "/legal/ryokin#family-trust";
type TrustCopy = {
  name: string;
  unit: string;
  price: string;
  sections: { heading: string; body: string }[];
};

export const FAMILY_TRUST_COPY: Record<LangCode, TrustCopy> = {
  "ja": {
    name: "家族信託契約書作成支援",
    unit: "1契約",
    price: "信託財産評価額1億円以下：1.1％（最低330,000円）／1億円超：1,100,000円＋超過額の0.55％。消費税込み。実費・他の専門家の報酬別途",
    sections: [
      {
        heading: "家族信託契約書作成支援の報酬はいくらですか",
        body: `四葉行政書士事務所は、ご意向と信託する財産を整理し、家族信託契約書の作成を支援します。報酬は1契約ごとに信託財産の評価額から算定し、最低330,000円（税込）です。契約書案の作成、通常の修正、公証役場との文案調整を含みます。

| 1契約あたりの信託財産評価額 | 当事務所の報酬（消費税込み） |
|---|---:|
| 1億円以下 | 信託財産評価額の1.1％（最低330,000円） |
| 1億円超 | 1,100,000円＋1億円を超える部分の0.55％ |

記載の料率は消費税込みです。この計算結果に消費税を重ねて加算することはありません。公証人手数料、登録免許税等の実費、他の専門家の報酬は含まれません。`,
      },
      {
        heading: "どこまで報酬に含まれますか",
        body: `- ご意向と信託する財産の整理
- 行政書士業務の範囲で行う、契約書作成のための設計支援
- 信託契約書案の作成
- お見積りで定めた範囲の通常の修正
- 公証役場との文案調整

これらの業務を上記の報酬に含み、別建ての契約書作成料はいただきません。通常の修正や文案調整に含まれる具体的な範囲は、お見積りで明示します。公正証書そのものは公証人が作成します。`,
      },
      {
        heading: "信託財産の評価額はどう決めますか",
        body: `| 財産の種類 | 報酬算定に使う評価額 |
|---|---|
| 不動産 | 最新年度の固定資産税評価額×実際に信託する持分 |
| 金銭 | 実際に信託する金額 |
| その他の財産 | 評価方法と算定額を事前にお示しします |

複数の財産を1つの契約で信託する場合は、その契約に含める財産の評価額を合計します。不動産の算定基準は固定資産税評価額であり、市場価格や相続税評価額とは異なります。この評価は当事務所の報酬算定のためのもので、税務上の評価を示すものではありません。`,
      },
      {
        heading: "報酬の計算例はありますか",
        body: `| 信託財産評価額（1契約） | 当事務所の報酬（税込） |
|---|---:|
| 25,000,000円 | 330,000円（最低報酬） |
| 30,000,000円 | 330,000円 |
| 50,000,000円 | 550,000円 |
| 100,000,000円 | 1,100,000円 |
| 150,000,000円 | 1,375,000円 |

上記は当事務所の報酬の例です。実費、他の専門家の報酬、別途お見積りする追加業務の報酬は含みません。`,
      },
      {
        heading: "夫婦それぞれが契約する場合はいくらですか",
        body: `夫婦それぞれが委託者となり、2つの信託契約を作成する場合は、各契約で信託する財産の評価額をもとに計算し、最低報酬も契約ごとに適用します。同じ不動産の全体評価額を2つの契約それぞれに重ねて計上せず、各契約で実際に信託する持分を計上します。

| 各契約の信託財産評価額 | 各契約の報酬（税込） | 2契約の合計（税込） |
|---|---:|---:|
| 夫25,000,000円・妻25,000,000円 | 各330,000円 | 660,000円 |
| 夫50,000,000円・妻50,000,000円 | 各550,000円 | 1,100,000円 |

たとえば、固定資産税評価額50,000,000円の不動産を夫婦が各2分の1所有し、それぞれの持分だけを別の契約で信託する場合は、各契約に25,000,000円を計上します。`,
      },
      {
        heading: "別にかかる費用はありますか",
        body: `| 項目 | 取り扱い |
|---|---|
| 公証人手数料、登録免許税、証明書取得費等 | 当事務所の報酬とは別に、必要な実費をご負担いただきます |
| 登記申請 | 司法書士へ直接ご依頼いただきます。司法書士の報酬は別です |
| 税務相談・申告等 | 税理士へ直接ご依頼いただきます。税理士の報酬は別です |
| 紛争対応・弁護士による法的判断等 | 弁護士へ直接ご依頼いただきます。弁護士の報酬は別です |
| 複数金融機関への対応、複雑な交代・承継の定め、追加・変更等 | 作業範囲と追加報酬を事前にお見積りします |

各専門家は独立して、お客様と直接契約・直接請求・直接入金を行います。当事務所は紹介料を受け取ったり支払ったりしません。`,
      },
      {
        heading: "契約後の相談にも費用がかかりますか",
        body: `ご相談は初回・2回目以降とも無料で、お見積りの提示も無料です。契約後の通常のご相談も無料です。契約内容の変更、財産の追加、信託の終了に伴う書類作成等の実作業は、作業範囲と報酬を事前にお見積りします。`,
      },
      {
        heading: "受託者への就任や資金の預かりも含まれますか",
        body: `受託者・信託監督人等への就任や、信託財産・資金の預かり、継続的な管理サービスは、この契約書作成支援には含まれません。

四葉不動産株式会社・四葉行政書士事務所・四葉社会保険労務士事務所は、それぞれ独立した事業体として業務を受任します。本表は四葉行政書士事務所の報酬です。

本資料は一般的な情報提供であり、個別の法的判断は資格者による確認を要します。`,
      },
    ],
  },
  "en": {
    name: "Family/private trust agreement drafting support in Japan",
    unit: "Per agreement",
    price: "Up to JPY 100,000,000: 1.1% of trust asset value, minimum JPY 330,000. Above JPY 100,000,000: JPY 1,100,000 + 0.55% of the excess. Consumption tax included. Expenses and other professionals' fees are separate",
    sections: [
      {
        heading: "What are the fees for family trust agreement drafting support in Japan",
        body: `四葉行政書士事務所 provides family/private trust agreement drafting support in Japan. We help organize your wishes and the assets to be placed in trust. Our fee is calculated separately for each agreement, based on the value of the assets covered by that agreement, with a minimum fee of JPY 330,000 including Japanese consumption tax. It includes preparing the draft agreement, ordinary revisions and coordination of the wording with the notary office.

| Value of trust assets per agreement | Our fee including Japanese consumption tax |
|---|---:|
| JPY 100,000,000 or less | 1.1% of the value of trust assets, subject to a minimum of JPY 330,000 |
| More than JPY 100,000,000 | JPY 1,100,000 plus 0.55% of the amount exceeding JPY 100,000,000 |

The rates above already include consumption tax. No further consumption tax is added to the result of this calculation. Notary fees, registration and license tax, other out-of-pocket expenses, and fees charged by other professionals are separate.`,
      },
      {
        heading: "What does our fee include",
        body: `- Organizing your wishes and the assets to be placed in trust
- Support in structuring the agreement within the scope of a Japanese administrative scrivener's document-drafting services
- Preparing the draft trust agreement
- Ordinary revisions within the scope stated in the quotation
- Coordinating the draft wording with the notary office

These services are included in the fee above. We do not charge an additional agreement-drafting fee for the same work. The quotation will specify the scope of ordinary revisions and wording coordination. The notarial deed itself is prepared by the notary.`,
      },
      {
        heading: "How are trust assets valued for the fee calculation",
        body: `| Asset type | Value used to calculate our fee |
|---|---|
| Real estate | The fixed asset tax assessed value for the latest fiscal year, multiplied by the ownership share actually placed in trust |
| Money | The amount actually placed in trust |
| Other assets | The valuation method and the amount used will be presented in advance |

When one agreement covers multiple assets, the values of the assets covered by that agreement are added together. For real estate, we use the Japanese fixed asset tax assessed value, which differs from market value and inheritance tax value. This valuation is used to calculate our fee; it is not a tax valuation.`,
      },
      {
        heading: "What are some fee examples",
        body: `| Value of trust assets per agreement | Our fee including consumption tax |
|---|---:|
| JPY 25,000,000 | JPY 330,000, the minimum fee |
| JPY 30,000,000 | JPY 330,000 |
| JPY 50,000,000 | JPY 550,000 |
| JPY 100,000,000 | JPY 1,100,000 |
| JPY 150,000,000 | JPY 1,375,000 |

These examples cover our fee only. Out-of-pocket expenses, fees charged by other professionals and separately quoted additional work are not included.`,
      },
      {
        heading: "How are fees calculated for two separate agreements for spouses",
        body: `If each spouse acts as the settlor under a separate trust agreement, we calculate the fee for each agreement using the assets covered by that agreement. The minimum fee applies to each agreement. We do not count the full value of the same property twice. Only the ownership share actually placed in trust under each agreement is counted.

| Value of trust assets under each agreement | Fee per agreement including tax | Total for two agreements including tax |
|---|---:|---:|
| JPY 25,000,000 for each spouse | JPY 330,000 each | JPY 660,000 |
| JPY 50,000,000 for each spouse | JPY 550,000 each | JPY 1,100,000 |

For example, if spouses each own one-half of a property with a fixed asset tax assessed value of JPY 50,000,000, and each places only their own share in trust under a separate agreement, JPY 25,000,000 is counted under each agreement.`,
      },
      {
        heading: "What costs are charged separately",
        body: `| Item | How it is handled |
|---|---|
| Notary fees, registration and license tax, certificate costs and similar expenses | Necessary out-of-pocket expenses are payable separately from our fee |
| Registration applications | You engage a judicial scrivener directly; their fee is separate |
| Tax advice and tax filings | You engage a tax accountant directly; their fee is separate |
| Dispute-related work and legal assessments by a lawyer | You engage a lawyer directly; their fee is separate |
| Work involving multiple financial institutions, complex replacement or succession provisions, additions or amendments | The scope of work and additional fee are quoted in advance |

Each professional acts independently and contracts with, invoices and receives payment directly from the client. Our office neither receives nor pays referral fees.`,
      },
      {
        heading: "Are consultations after the agreement is completed free",
        body: `Initial and subsequent consultations are free, as are quotations. Ordinary consultations after the trust agreement is completed are also free. Substantive work, such as preparing documents for amendments, adding assets or ending the trust, is quoted separately in advance, with the scope of work and fee specified.`,
      },
      {
        heading: "Does this fee include acting as trustee or holding funds",
        body: `Appointment as trustee, trust supervisor or a similar role, custody of trust assets or funds, and ongoing asset-management services are not included in this agreement-drafting service.

四葉不動産株式会社, 四葉行政書士事務所 and 四葉社会保険労務士事務所 each accept engagements as independent entities. This schedule covers the fees of 四葉行政書士事務所.

This information concerns services for family/private trust agreements in Japan. It is general information; legal assessments for individual cases require review by an appropriately qualified professional.`,
      },
    ],
  },
  "zh": {
    name: "日本家族信托合同起草支援",
    unit: "每份合同",
    price: "信托财产评估金额不超过1亿日元：1.1%（最低330,000日元）；超过1亿日元：1,100,000日元＋超出部分的0.55%。含日本消费税。实际费用及其他专业人士报酬另计",
    sections: [
      {
        heading: "日本家族信托合同起草支援的费用是多少",
        body: `四葉行政書士事務所协助整理您的意愿及拟纳入信托的财产，并提供日本家族信托合同的起草支援。报酬按每份合同所涉及的信托财产评估金额分别计算，最低为330,000日元（含日本消费税）。报酬包含合同草案起草、通常范围内的修改，以及与日本公证处的文案协调。

| 每份合同的信托财产评估金额 | 本事务所报酬（含日本消费税） |
|---|---:|
| 不超过100,000,000日元 | 信托财产评估金额的1.1%，最低330,000日元 |
| 超过100,000,000日元 | 1,100,000日元＋超过100,000,000日元部分的0.55% |

上述费率已含消费税，不会在计算结果上再次加收消费税。公证人手续费、登录免许税等实际费用，以及其他专业人士的报酬另计。`,
      },
      {
        heading: "报酬包含哪些服务",
        body: `- 整理您的意愿及拟纳入信托的财产
- 在日本行政书士业务范围内，为起草合同提供内容设计支援
- 起草信托合同草案
- 报价所列通常范围内的修改
- 与日本公证处协调合同文案

上述服务已包含在本表报酬中，不另行收取同一工作的合同起草费。通常修改及文案协调的具体范围会在报价中列明。公证书本身由日本公证人制作。`,
      },
      {
        heading: "如何确定用于计算报酬的财产评估金额",
        body: `| 财产种类 | 用于计算报酬的金额 |
|---|---|
| 不动产 | 最新年度的日本固定资产税评估金额×实际纳入信托的产权份额 |
| 资金 | 实际纳入信托的金额 |
| 其他财产 | 事先说明评估方法及采用的金额 |

同一份合同涉及多项财产时，将该合同中实际纳入信托的各项财产评估金额相加。不动产采用日本固定资产税评估金额，与市场价格及日本遗产税评估金额不同。这一金额仅用于计算本事务所报酬，不代表税务评估结果。`,
      },
      {
        heading: "有哪些报酬计算示例",
        body: `| 每份合同的信托财产评估金额 | 本事务所报酬（含税） |
|---|---:|
| 25,000,000日元 | 330,000日元（最低报酬） |
| 30,000,000日元 | 330,000日元 |
| 50,000,000日元 | 550,000日元 |
| 100,000,000日元 | 1,100,000日元 |
| 150,000,000日元 | 1,375,000日元 |

以上仅为本事务所报酬的示例，不包含实际费用、其他专业人士的报酬，以及另行报价的追加工作。`,
      },
      {
        heading: "夫妻分别订立两份合同时如何计算",
        body: `夫妻各自作为委托人，分别订立两份信托合同时，按每份合同实际涉及的财产评估金额分别计算报酬，每份合同均适用最低报酬。同一不动产的全部评估金额不会在两份合同中重复全额计入，而是分别计入各合同实际纳入信托的产权份额。

| 每份合同的信托财产评估金额 | 每份合同报酬（含税） | 两份合同合计（含税） |
|---|---:|---:|
| 丈夫25,000,000日元，妻子25,000,000日元 | 各330,000日元 | 660,000日元 |
| 丈夫50,000,000日元，妻子50,000,000日元 | 各550,000日元 | 1,100,000日元 |

例如，一处不动产的固定资产税评估金额为50,000,000日元，夫妻各拥有二分之一产权，分别以各自份额订立信托合同时，每份合同计入25,000,000日元。`,
      },
      {
        heading: "哪些费用需要另行支付",
        body: `| 项目 | 处理方式 |
|---|---|
| 公证人手续费、登录免许税、证明文件取得费等 | 必要的实际费用由客户另行承担，不包含在本事务所报酬中 |
| 登记申请 | 由客户直接委托日本司法书士，其报酬另计 |
| 税务咨询及申报等 | 由客户直接委托日本税理士，其报酬另计 |
| 纠纷处理及律师进行的法律判断等 | 由客户直接委托日本律师，其报酬另计 |
| 涉及多家金融机构、复杂的人员更替或权益承继安排、追加或变更等 | 事先列明工作范围及追加报酬并提供报价 |

各专业人士独立承接业务，与客户直接签约、直接开具账单并直接收款。本事务所不收取或支付介绍费。`,
      },
      {
        heading: "合同订立后的咨询是否收费",
        body: `首次及后续咨询均免费，提供报价也免费。信托合同订立后的通常咨询同样免费。涉及合同变更、追加财产或终止信托等事项的文件起草及其他实际工作，将事先另行报价，明确工作范围及报酬。`,
      },
      {
        heading: "是否包含担任受托人或保管资金",
        body: `担任受托人、信托监督人等职务，以及保管信托财产或资金、持续管理财产的服务，均不包含在本合同起草支援服务中。

四葉不動産株式会社、四葉行政書士事務所、四葉社会保険労務士事務所分别作为独立业务主体承接委托。本表仅列示四葉行政書士事務所的报酬。

本资料介绍的是日本家族信托合同起草支援，属于一般性信息。具体案件的法律判断须由具有相应资格的专业人士确认。`,
      },
    ],
  },
  "zh-tw": {
    name: "日本家族信託契約擬定協助",
    unit: "每份契約",
    price: "信託財產評估金額1億日圓以下：1.1%（最低330,000日圓）；超過1億日圓：1,100,000日圓＋超出部分的0.55%。含日本消費稅。實際費用及其他專業人士報酬另計",
    sections: [
      {
        heading: "日本家族信託契約擬定協助的費用是多少",
        body: `四葉行政書士事務所協助整理您的意願及擬納入信託的財產，並提供日本家族信託契約的擬定協助。報酬依每份契約所涉及的信託財產評估金額分別計算，最低為330,000日圓（含日本消費稅）。報酬包含契約草案擬定、一般範圍內的修改，以及與日本公證處的文案協調。

| 每份契約的信託財產評估金額 | 本事務所報酬（含日本消費稅） |
|---|---:|
| 100,000,000日圓以下 | 信託財產評估金額的1.1%，最低330,000日圓 |
| 超過100,000,000日圓 | 1,100,000日圓＋超過100,000,000日圓部分的0.55% |

上述費率已含消費稅，不會在計算結果上再次加收消費稅。公證人手續費、登錄免許稅等實際費用，以及其他專業人士的報酬另計。`,
      },
      {
        heading: "報酬包含哪些服務",
        body: `- 整理您的意願及擬納入信託的財產
- 在日本行政書士業務範圍內，提供契約擬定所需的內容設計協助
- 擬定信託契約草案
- 報價所列一般範圍內的修改
- 與日本公證處協調契約文案

上述服務已包含在本表報酬中，不另收同一工作的契約擬定費。一般修改及文案協調的具體範圍會在報價中列明。公證書本身由日本公證人製作。`,
      },
      {
        heading: "如何決定用來計算報酬的財產評估金額",
        body: `| 財產種類 | 用來計算報酬的金額 |
|---|---|
| 不動產 | 最新年度的日本固定資產稅評估金額×實際納入信託的持分 |
| 金錢 | 實際納入信託的金額 |
| 其他財產 | 事先說明評估方法及採用的金額 |

同一份契約涉及多項財產時，將該契約中實際納入信託的各項財產評估金額加總。不動產採用日本固定資產稅評估金額，與市場價格及日本遺產稅評估金額不同。此金額僅用來計算本事務所報酬，不代表稅務評估結果。`,
      },
      {
        heading: "有哪些報酬計算範例",
        body: `| 每份契約的信託財產評估金額 | 本事務所報酬（含稅） |
|---|---:|
| 25,000,000日圓 | 330,000日圓（最低報酬） |
| 30,000,000日圓 | 330,000日圓 |
| 50,000,000日圓 | 550,000日圓 |
| 100,000,000日圓 | 1,100,000日圓 |
| 150,000,000日圓 | 1,375,000日圓 |

以上僅為本事務所報酬的範例，不包含實際費用、其他專業人士的報酬，以及另行報價的追加工作。`,
      },
      {
        heading: "夫妻分別訂立兩份契約時如何計算",
        body: `夫妻各自作為委託人，分別訂立兩份信託契約時，依每份契約實際涉及的財產評估金額分別計算報酬，每份契約均適用最低報酬。同一不動產的全部評估金額不會在兩份契約中重複全額計入，而是分別計入各契約實際納入信託的持分。

| 每份契約的信託財產評估金額 | 每份契約報酬（含稅） | 兩份契約合計（含稅） |
|---|---:|---:|
| 丈夫25,000,000日圓，妻子25,000,000日圓 | 各330,000日圓 | 660,000日圓 |
| 丈夫50,000,000日圓，妻子50,000,000日圓 | 各550,000日圓 | 1,100,000日圓 |

例如，一筆不動產的固定資產稅評估金額為50,000,000日圓，夫妻各持有二分之一，分別以自己的持分訂立信託契約時，每份契約計入25,000,000日圓。`,
      },
      {
        heading: "哪些費用需要另行支付",
        body: `| 項目 | 處理方式 |
|---|---|
| 公證人手續費、登錄免許稅、證明文件取得費等 | 必要的實際費用由客戶另行負擔，不包含在本事務所報酬中 |
| 登記申請 | 由客戶直接委託日本司法書士，其報酬另計 |
| 稅務諮詢及申報等 | 由客戶直接委託日本稅理士，其報酬另計 |
| 紛爭處理及律師進行的法律判斷等 | 由客戶直接委託日本律師，其報酬另計 |
| 涉及多家金融機構、複雜的人員更替或權益承繼安排、追加或變更等 | 事先列明工作範圍及追加報酬並提供報價 |

各專業人士獨立承接業務，與客戶直接簽約、直接開立帳單並直接收款。本事務所不收取或支付介紹費。`,
      },
      {
        heading: "契約訂立後的諮詢是否收費",
        body: `首次及後續諮詢均免費，提供報價也免費。信託契約訂立後的一般諮詢同樣免費。涉及契約變更、追加財產或終止信託等事項的文件擬定及其他實際工作，將事先另行報價，明確說明工作範圍及報酬。`,
      },
      {
        heading: "是否包含擔任受託人或保管資金",
        body: `擔任受託人、信託監督人等職務，以及保管信託財產或資金、持續管理財產的服務，均不包含在本契約擬定協助服務中。

四葉不動産株式会社、四葉行政書士事務所、四葉社会保険労務士事務所分別以獨立事業體承接委託。本表僅列示四葉行政書士事務所的報酬。

本資料介紹的是日本家族信託契約擬定協助，屬於一般性資訊。個別案件的法律判斷須由具有相應資格的專業人士確認。`,
      },
    ],
  },
};

/** FAQ本文とJSON-LDには、料金詳細と同じ原稿の段落・料金表を使う。 */
export function familyTrustFaq(locale: LangCode): FaqItem[] {
  const c = FAMILY_TRUST_COPY[locale];
  return [0, 4, 6].map((index) => {
    const section = c.sections[index];
    // 表を自然な読み順のテキストにする。見出し行・区切り行は回答では省略。
    const answer = section.body.split("\n\n").map((block) => {
      if (!block.startsWith("|")) return block;
      return block.split("\n").slice(2).map((row) =>
        row.split("|").slice(1, -1).map((cell) => cell.trim()).join(": ")
      ).join("\n");
    }).join("\n\n");
    return {
      q: section.heading,
      a: answer,
      links: [{ href: addLocalePrefix(FAMILY_TRUST_PATH, locale), label: c.name }],
    };
  });
}

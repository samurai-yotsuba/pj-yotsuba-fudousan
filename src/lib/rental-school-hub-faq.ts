import type { LangCode } from "@/config/languages";

/**
 * 学区で借りる・買うご家族向けの追加QA（2026-09-28 浦松指示「顧客の悩みに直接答えるQA」）。
 * 賃貸＝/gakku/rentals（ハブ）だけに出す。学校別20ページには出さない（同じQAの重複を避ける）。
 * 売買＝/gakku/sales（ハブ）だけに出す。
 * 書かないこと：オーナー・元付・サブリース会社への批判、他社・ポータル・法令上の上限との比較、相場の断定、
 * 税務・融資の判断、「必ず」の約束、特定の国籍向けの打ち出し。
 * 年齢の設問の出典＝文部科学省「幼保小の架け橋プログラム」（架け橋期＝5歳児〜小学校1年生の2年間）。推奨は当社の考えとして書く。
 */
type QA = { q: string; a: string };

export const SCHOOL_RENTAL_HUB_FAQ: Record<LangCode, QA[]> = {
  ja: [
    { q: "学区を考えて賃貸を借りるとき、いちばん気をつけることは何ですか？", a: "「何年住むか」を先に決めることです。お子さまが学校や友だちになじむと、途中で学区を変えるのは簡単ではありません。小学校の6年間、中学校まで含めれば9年間の通学先を選ぶつもりで物件を選ぶことをおすすめしています。そのうえで、契約の型（普通借家か定期借家か）、更新の条件、再契約の可否が、その期間に合うかを契約前に確認します。" },
    { q: "学区を考えて引っ越すなら、子どもが何歳のときがいいですか？", a: "四葉不動産では、幼稚園・保育園の3〜5歳のうちに引っ越しておくことをおすすめしています。子ども同士、家族ぐるみ、地域とのつながりが育ちやすい時期だと考えているからです。文部科学省も、5歳児から小学校1年生までの2年間を「架け橋期」と位置づけ、幼児教育から小学校教育へのつながりを重視しています（文部科学省「幼保小の架け橋プログラム」）。この時期を、通う予定の小学校がある地域で迎えられるよう、時期に余裕をもってご相談ください。" },
    { q: "初期費用はいくらかかりますか？", a: "物件ページに、賃料・管理費・敷金・礼金・仲介手数料を円で表示しています。保証会社・火災保険・鍵交換など物件ごとに別途かかる費用も含め、申込の前に、入居日による日割り賃料まで入れた概算をお出しします。四葉不動産は事務手数料・書類作成費などの名目の費用をいただきません。「仲介手数料0.33ヶ月」と表示している物件は、仲介手数料が賃料0.3ヶ月分＋消費税（税込0.33ヶ月分）です。" },
    { q: "予算の範囲で、家族が暮らせる広さの部屋が見つかりません。", a: "同じ学区でも、築年数、駅からの距離、定期借家かどうか、建物の種類（マンション・一戸建ての貸家）によって、同じ予算で借りられる広さは変わります。ご予算・必要な広さ・学区をお知らせいただければ、サイトに載っていない物件も含めて条件に合うものを探します。" },
    { q: "定期借家の物件は避けたほうがいいですか？", a: "一概には言えません。期間が満了すると契約が終わる仕組みなので、住みたい期間（たとえばお子さまの在学期間）と契約期間、再契約の可否を契約前に確認することが大切です。重要事項説明でご説明します。" },
    { q: "入居したい時期が決まっています。間に合いますか？", a: "物件によって審査にかかる期間が異なります。法人契約は提出書類が多く、個人契約より時間がかかることがあります。入居したい時期から逆算して、審査・契約・鍵の受け取りまでの段取りと、先にそろえておく書類をお伝えします。" },
    { q: "住む期間が決まっている場合、途中で解約するときの注意点は？", a: "解約の予告期間や、一定期間内に解約した場合の違約金は物件ごとに定められています。住む予定の期間をお知らせいただければ、契約の前に解約の条件を確認し、ご説明します。" },
    { q: "礼金などの条件を相談できますか？", a: "条件を決めるのは貸主です。ご希望は申込の際に貸主側へお伝えしますが、応じていただけるとは限りません。" },
  ],
  en: [
    { q: "What matters most when renting with a school district in mind?", a: "Decide first how many years you will live there. Once children settle into their school and friendships, changing districts midway is not easy. We recommend choosing a home as if you were choosing where your child will go to school for six years, or nine if you include junior high school. We then check before signing whether the lease type (ordinary or fixed-term), the renewal terms and the possibility of re-signing fit that period." },
    { q: "If we move for a school district, at what age of our child is it best?", a: "Yotsuba Real Estate recommends moving while your child is 3 to 5 years old and in kindergarten or nursery school, because we believe this is a time when ties among children, between families and with the local community grow easily. Japan's Ministry of Education (MEXT) also positions the two years from age 5 to the first grade of elementary school as the \"bridging period\" and emphasizes the connection from early childhood education to elementary education (MEXT, \"Bridging Program for Early Childhood and Elementary Education\"). Please consult us with time to spare so that your child can spend this period in the area of the elementary school they will attend." },
    { q: "How much are the initial costs?", a: "Our property pages show the rent, management fee, deposit, key money and brokerage fee in yen. Before you apply, we give you an estimate that also covers property-specific costs such as the guarantor company, fire insurance and key replacement, including prorated rent for your move-in date. Yotsuba Real Estate does not charge administrative or document fees. For properties marked \"Brokerage fee 0.33 months\", the brokerage fee is 0.3 months' rent plus consumption tax (0.33 months including tax)." },
    { q: "We cannot find a home big enough for our family within our budget.", a: "Even within the same school district, the size you can rent for the same budget changes with the building's age, the distance from the station, whether the lease is fixed-term, and the type of building (condominium or detached house). Tell us your budget, the size you need and the school district, and we will look for matching homes, including those not listed on our website." },
    { q: "Should we avoid fixed-term leases?", a: "Not necessarily. A fixed-term lease ends when the term expires, so it is important to check before signing whether the period you want to live there (for example, your child's school years), the lease term and the possibility of re-signing fit together. We explain this in the explanation of important matters before the contract." },
    { q: "We need to move in by a certain time. Can we make it?", a: "The screening period differs by property. Corporate leases require more documents and can take longer than individual leases. Working back from your move-in date, we explain the schedule for screening, contract and key handover, and the documents to prepare in advance." },
    { q: "Our stay has a set length. What should we check about ending the lease early?", a: "The notice period for cancellation and any penalty for cancelling within a certain period are set for each property. Tell us how long you plan to live there, and we will check and explain the cancellation terms before you sign." },
    { q: "Can we ask about conditions such as key money?", a: "The landlord decides the conditions. We pass your requests on to the landlord's side when you apply, but they may not be accepted." },
  ],
  "zh-tw": [
    { q: "考慮學區租屋時，最需要注意什麼？", a: "先決定要住幾年。孩子一旦熟悉學校和朋友，中途更換學區並不容易。我們建議以選擇小學6年、含國中則9年就學地點的心態來挑選物件，並在簽約前確認契約類型（普通租賃或定期租賃）、續約條件及能否再簽約，是否符合這段期間。" },
    { q: "若為學區搬家，孩子幾歲時搬比較好？", a: "四葉不動產建議在孩子3至5歲、就讀幼稚園或托兒所期間搬家，因為我們認為這是孩子之間、家庭之間以及與社區之間容易建立關係的時期。日本文部科學省也將5歲至小學1年級這2年定位為「銜接期（架け橋期）」，重視從幼兒教育到小學教育的銜接（文部科學省「幼保小の架け橋プログラム」）。為了讓孩子在即將就讀的小學所在地區度過這段時期，請預留充裕時間與我們諮詢。" },
    { q: "初期費用大約多少？", a: "物件頁面以日圓標示租金、管理費、押金、禮金及仲介費。申請前，我們會提供包含保證公司、火災保險、換鎖等各物件另計費用，並依入住日計算按日租金的概算。四葉不動產不收取事務手續費、文件製作費等名目的費用。標示「仲介費0.33個月」的物件，仲介費為0.3個月租金加消費稅（含稅0.33個月）。" },
    { q: "在預算內找不到全家住得下的房子。", a: "即使在同一學區，屋齡、距車站的距離、是否為定期租賃、建物類型（公寓或獨棟出租房屋）不同，同樣預算能租到的面積也會不同。請告訴我們預算、需要的面積與學區，我們會連同網站未刊登的物件一起尋找符合條件的房子。" },
    { q: "定期租賃的物件應該避開嗎？", a: "不能一概而論。定期租賃在期間屆滿時契約即終止，因此簽約前確認想居住的期間（例如孩子的在學期間）、契約期間及能否再簽約是否相符很重要。我們會在重要事項說明時加以說明。" },
    { q: "已決定希望入住的時間，來得及嗎？", a: "審查所需時間依物件而異。法人契約需提交的文件較多，可能比個人契約花更久時間。我們會從希望入住的時間倒推，說明審查、簽約到領取鑰匙的流程，以及應事先準備的文件。" },
    { q: "居住期間已確定時，中途解約要注意什麼？", a: "解約的預告期間，以及在一定期間內解約的違約金，各物件規定不同。請告訴我們預計居住的期間，我們會在簽約前確認並說明解約條件。" },
    { q: "禮金等條件可以商量嗎？", a: "條件由房東決定。我們會在申請時將您的希望轉達給房東方，但不一定能獲得同意。" },
  ],
  zh: [
    { q: "考虑学区租房时，最需要注意什么？", a: "先决定要住几年。孩子一旦熟悉学校和朋友，中途更换学区并不容易。我们建议以选择小学6年、含初中则9年就学地点的心态来挑选房源，并在签约前确认合同类型（普通租赁或定期租赁）、续约条件及能否再签约，是否符合这段期间。" },
    { q: "如果为学区搬家，孩子几岁时搬比较好？", a: "四叶不动产建议在孩子3至5岁、就读幼儿园或保育园期间搬家，因为我们认为这是孩子之间、家庭之间以及与社区之间容易建立关系的时期。日本文部科学省也将5岁至小学1年级这2年定位为“衔接期（架け橋期）”，重视从幼儿教育到小学教育的衔接（文部科学省「幼保小の架け橋プログラム」）。为了让孩子在即将就读的小学所在地区度过这段时期，请预留充裕时间与我们咨询。" },
    { q: "初期费用大约多少？", a: "房源页面以日元标示租金、管理费、押金、礼金及中介费。申请前，我们会提供包含担保公司、火灾保险、换锁等各房源另计费用，并按入住日计算按日租金的概算。四叶不动产不收取事务手续费、文件制作费等名目的费用。标示“中介费0.33个月”的房源，中介费为0.3个月租金加消费税（含税0.33个月）。" },
    { q: "在预算内找不到全家住得下的房子。", a: "即使在同一学区，房龄、距车站的距离、是否为定期租赁、建筑类型（公寓或独栋出租房屋）不同，同样预算能租到的面积也会不同。请告诉我们预算、需要的面积和学区，我们会连同网站未刊登的房源一起寻找符合条件的房子。" },
    { q: "定期租赁的房源应该避开吗？", a: "不能一概而论。定期租赁在期间届满时合同即终止，因此签约前确认想居住的期间（例如孩子的在学期间）、合同期间及能否再签约是否相符很重要。我们会在重要事项说明时加以说明。" },
    { q: "已确定希望入住的时间，来得及吗？", a: "审查所需时间因房源而异。法人合同需提交的文件较多，可能比个人合同花更长时间。我们会从希望入住的时间倒推，说明审查、签约到领取钥匙的流程，以及应事先准备的文件。" },
    { q: "居住期间已确定时，中途解约要注意什么？", a: "解约的预告期间，以及在一定期间内解约的违约金，各房源规定不同。请告诉我们预计居住的期间，我们会在签约前确认并说明解约条件。" },
    { q: "礼金等条件可以商量吗？", a: "条件由房东决定。我们会在申请时将您的希望转达给房东方，但不一定能获得同意。" },
  ],
};

export const SCHOOL_SALE_HUB_FAQ: Record<LangCode, { heading: string; items: QA[] }> = {
  ja: { heading: "学区で家を買うときのよくあるご質問", items: [
    { q: "学区を考えて家を買う場合、何から始めればいいですか？", a: "物件より先に、資金計画です。いくらまでなら住宅ローンを組めるかを先に知っておくと、物件選びがスムーズに進みます。反対に、物件から先に選ぶと、その物件に合わせた無理な資金計画を立ててしまいがちです。四葉不動産では、ご予算の目安を確かめるところからご相談を受けています。借入の可否や条件は金融機関の審査で決まります。" },
    { q: "借りるか、買うか迷っています。両方相談できますか？", a: "はい。四葉不動産は賃貸と売買の両方を扱っています。住む予定の期間、ご予算、広さの希望によって考え方が変わるため、条件を伺ったうえで、それぞれの場合に必要な費用と手続きをご説明します。どちらにするかの最終判断はお客様ご自身でお願いします。" },
  ] },
  en: { heading: "FAQ on buying a home in a school district", items: [
    { q: "If we buy a home with a school district in mind, where should we start?", a: "With your financial plan, before the property. Knowing how much you can borrow on a mortgage makes choosing a property smoother. If you choose the property first, you tend to make an unrealistic financial plan to fit it. Yotsuba Real Estate starts consultations by confirming your budget range. Whether and on what terms you can borrow is decided by the financial institution's screening." },
    { q: "We cannot decide whether to rent or buy. Can we consult about both?", a: "Yes. Yotsuba Real Estate handles both rentals and sales. The approach depends on how long you plan to live there, your budget and the size you want, so after hearing your conditions we explain the costs and procedures for each case. The final decision is yours." },
  ] },
  "zh-tw": { heading: "在學區購屋的常見問題", items: [
    { q: "考慮學區購屋時，應該從哪裡開始？", a: "先做資金規劃，再看物件。先了解房貸最多能借多少，挑選物件會更順利。反之，若先選物件，往往會為了配合物件而訂出勉強的資金計畫。四葉不動產會從確認預算範圍開始提供諮詢。能否貸款及貸款條件，由金融機構審查決定。" },
    { q: "還在猶豫要租還是要買，可以兩者一起諮詢嗎？", a: "可以。四葉不動產同時經手租賃與買賣。考量方式會因預計居住期間、預算及面積需求而不同，我們會在了解條件後，說明兩種情況各自所需的費用與手續。最終決定請由您本人判斷。" },
  ] },
  zh: { heading: "在学区购房的常见问题", items: [
    { q: "考虑学区购房时，应该从哪里开始？", a: "先做资金规划，再看房源。先了解房贷最多能借多少，挑选房源会更顺利。反之，如果先选房源，往往会为了配合房源而制定勉强的资金计划。四叶不动产会从确认预算范围开始提供咨询。能否贷款及贷款条件，由金融机构审查决定。" },
    { q: "还在犹豫是租还是买，可以两者一起咨询吗？", a: "可以。四叶不动产同时经营租赁与买卖。考虑方式会因预计居住期间、预算及面积需求而不同，我们会在了解条件后，说明两种情况各自所需的费用与手续。最终决定请由您本人判断。" },
  ] },
};

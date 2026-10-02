/**
 * 「仲介手数料0.33ヶ月」の説明部分（計算例・含まれない費用・支払時期・見分け方）。
 * データ取得を持たない純粋な部品にして、テストで描画できるようにしている。
 *
 * 書かないこと：他社・ポータル・法令上の上限との比較、「安い」「格安」「最安」等（表示規約・浦松規程）。
 */
import Link from "next/link";
import { FEE033_EXAMPLE_RENTS, FEE033_HUB_COPY as c, FEE033_OTHER_COSTS, fee033Example } from "@/lib/fee033-hub";

const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;

export function Fee033Explainer() {
  return (
    <>
      <section id="example" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold">{c.exampleH2}</h2>
        <p className="mt-3 text-sm leading-7">{c.exampleLead}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">賃料（管理費等を除く）</th>
                <th scope="col" className="py-2 pr-3 font-medium">0.3ヶ月分（本体）</th>
                <th scope="col" className="py-2 pr-3 font-medium">消費税（10%）</th>
                <th scope="col" className="py-2 font-medium">仲介手数料（税込0.33ヶ月分）</th>
              </tr>
            </thead>
            <tbody>
              {FEE033_EXAMPLE_RENTS.map((rent) => {
                const ex = fee033Example(rent);
                return (
                  <tr key={rent} className="border-b border-border">
                    <td className="py-2 pr-3">{yen(ex.rentYen)}</td>
                    <td className="py-2 pr-3">{yen(ex.base)}</td>
                    <td className="py-2 pr-3">{yen(ex.tax)}</td>
                    <td className="py-2 font-semibold">{yen(ex.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-text-muted">対象物件の物件ページには、その賃料で計算した税込の円額を表示しています。</p>
      </section>

      <section id="other-costs" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold">{c.otherCostsH2}</h2>
        <p className="mt-3 text-sm leading-7">{c.otherCostsLead}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">費用</th>
                <th scope="col" className="py-2 font-medium">どう決まるか</th>
              </tr>
            </thead>
            <tbody>
              {FEE033_OTHER_COSTS.map((row) => (
                <tr key={row.name} className="border-b border-border align-top">
                  <td className="py-2 pr-3 font-semibold">{row.name}</td>
                  <td className="py-2 leading-6">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mt-6 font-semibold">{c.paymentH3}</h3>
        <p className="mt-2 text-sm leading-7">{c.payment}</p>
        <h3 className="mt-6 font-semibold">{c.howToTellH3}</h3>
        <p className="mt-2 text-sm leading-7">{c.howToTell}</p>
        <p className="mt-3 text-sm">
          <Link href="/ryokin" className="text-primary underline">四葉不動産の料金（売買・賃貸・相談）</Link>
        </p>
      </section>
    </>
  );
}

import { useMemo, useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function RFQs() {
  const { rfqs, products, addQuote, acceptQuoteToOrder, addresses } = useAppStore();
  const [price, setPrice] = useState("");
  const [valid, setValid] = useState("");
  const [note, setNote] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [addr, setAddr] = useState(addresses[0]?.id || null);

  const open = useMemo(() => rfqs.slice().reverse(), [rfqs]);

  const productBy = (id) => products.find(p => p.id === id);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">RFQs</h1>

      {open.length === 0 && <div>No RFQs yet. Go to a product and click “Request Quote”.</div>}

      <div className="space-y-4">
        {open.map(r => {
          const prod = productBy(r.productId);
          return (
            <div key={r.id} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">#{r.id} — {prod?.name}</div>
                  <div className="text-sm text-gray-600">Qty {r.qty} • Target ₹{r.targetPrice} • Status {r.status}</div>
                  <div className="text-sm mt-2">Specs: {r.specs || "-"}</div>
                </div>
                <div className="text-sm text-gray-600">Created {new Date(r.createdAt).toLocaleString()}</div>
              </div>

              {r.quotes.length > 0 && (
                <div className="mt-3">
                  <div className="font-semibold text-sm mb-1">Quotes</div>
                  <div className="space-y-1">
                    {r.quotes.map((q, i) => (
                      <div key={i} className="flex items-center justify-between border rounded p-2">
                        <div>₹{q.price} per unit • valid till {q.validUntil || "-"}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{q.note}</span>
                          <button
                            className="px-3 py-1 rounded bg-green-600 text-white"
                            onClick={() => setSelectedRFQ({ rfqId: r.id, quoteIndex: i })}
                          >
                            Accept → Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 grid md:grid-cols-4 gap-2">
                <input placeholder="Counter price (per unit)" value={price} onChange={(e)=>setPrice(e.target.value)} className="border rounded px-2 py-1" />
                <input placeholder="Validity (YYYY-MM-DD)" value={valid} onChange={(e)=>setValid(e.target.value)} className="border rounded px-2 py-1" />
                <input placeholder="Note" value={note} onChange={(e)=>setNote(e.target.value)} className="border rounded px-2 py-1" />
                <button
                  className="bg-blue-600 text-white rounded px-3"
                  onClick={() => {
                    if (!price) return alert("Enter counter price");
                    addQuote({ rfqId: r.id, price: Number(price), validUntil: valid, note });
                    setPrice(""); setValid(""); setNote("");
                  }}
                >
                  Send Counter-Offer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept dialog */}
      {selectedRFQ && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-full max-w-md">
            <h3 className="font-semibold mb-2">Select shipping address</h3>
            <select className="w-full border rounded px-3 py-2 mb-4" value={addr ?? ""} onChange={(e)=>setAddr(Number(e.target.value))}>
              {addresses.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
            </select>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={()=>{
                acceptQuoteToOrder({ ...selectedRFQ, addressId: addr, poInfo: { method: "PO", poNumber: `RFQ-${selectedRFQ.rfqId}` }});
                setSelectedRFQ(null);
                alert("Order created from RFQ");
              }}
            >
              Confirm
            </button>
            <button className="ml-3 px-4 py-2 rounded border" onClick={()=>setSelectedRFQ(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function AdminRFQs() {
  const { rfqs, products, quoteRFQ, acceptRFQ } = useAppStore();
  const [draft, setDraft] = useState({}); // { [rfqId]: {price, validUntil, note} }

  const setField = (id, key, val) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), [key]: val } }));

  const submitQuote = (id) => {
    const d = draft[id] || {};
    quoteRFQ(id, {
      price: Number(d.price),
      note: d.note || "",
      validUntil: d.validUntil || null,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin • RFQs</h1>

      {rfqs.length === 0 && <div className="text-gray-500">No RFQs yet.</div>}

      <div className="space-y-4">
        {rfqs.map((r) => (
          <div key={r.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">RFQ #{r.id}</div>
                <div className="text-xs text-gray-600">
                  Status: <b className="uppercase">{r.status}</b> • Target: {r.targetPrice ?? "—"} • Valid until: {r.validUntil ?? "—"}
                </div>
              </div>
              <button
                onClick={() => acceptRFQ(r.id)}
                className="border px-3 py-1 rounded"
                disabled={r.status === "accepted"}
                title="Convert to Order"
              >
                Convert to Order
              </button>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {r.items.map((it, i) => {
                const p = products.find((x) => String(x.id) === String(it.productId));
                return (
                  <div key={i} className="flex gap-2">
                    <div className="w-40 truncate">{p?.name || it.productId}</div>
                    <div>Qty: {it.qty}</div>
                    {it.specs && <div className="text-gray-600">Specs: {it.specs}</div>}
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-xs text-gray-600">Quote Price</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={draft[r.id]?.price ?? ""}
                  onChange={(e) => setField(r.id, "price", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Valid Until</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                  value={draft[r.id]?.validUntil ?? ""}
                  onChange={(e) => setField(r.id, "validUntil", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600">Note</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={draft[r.id]?.note ?? ""}
                  onChange={(e) => setField(r.id, "note", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => submitQuote(r.id)} className="bg-blue-600 text-white px-3 py-1 rounded">
                Submit Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

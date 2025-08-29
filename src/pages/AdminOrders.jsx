import { useAppStore } from "../context/AppStore";
import { useState, useMemo } from "react";
import { calcOrderTaxes } from "../utils/tax";
import InvoiceButton from "../components/InvoiceButton";

const SELLER_STATE = "KA"; // change if needed

const statusColors = {
  PendingApproval: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Packed: "bg-indigo-100 text-indigo-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const { orders, addresses, advanceOrder, updateOrderStatus, setTracking, org } = useAppStore();
  const [draft, setDraft] = useState({}); // {orderId: {carrier, awb}}

  const setField = (id, key, val) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), [key]: val } }));

  const saveTracking = (id) => setTracking(id, draft[id] || {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin • Orders</h1>

      {orders.map((o) => {
        const address = addresses.find((a) => String(a.id) === String(o.addressId)) || null;
        const taxes = useMemo(() => {
          return calcOrderTaxes(o.items || [], {
            sellerState: SELLER_STATE,
            buyerState: address?.state,
            defaultRate: 18,
          });
        }, [o.items, address?.state]);

        return (
          <div key={o.id} className="border rounded-lg p-4 bg-white space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Order #{o.id}</div>
                <div className="text-xs text-gray-600">
                  Created: {new Date(o.createdAt).toLocaleString()} • Buyer: {o.buyerId}
                </div>
                <div className="text-xs text-gray-600">
                  Payment: {o.paymentMethod} • Subtotal: ₹{o.totals?.subtotal ?? 0}
                </div>
                {address && (
                  <div className="text-xs text-gray-600">
                    Ship: {address.name} — {address.city} ({address.state})
                  </div>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[o.status] || "bg-gray-100"}`}>
                {o.status}
              </span>
            </div>

            <div className="text-sm">
              {o.items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-48 truncate">{it.name}</div>
                  <div>HSN: {it.hsn || "—"}</div>
                  <div>Qty: {it.qty}</div>
                  <div>Unit: {Number.isFinite(Number(it.unitPrice)) ? `₹${it.unitPrice}` : "POR"}</div>
                  <div>Total: ₹{it.lineTotal}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <InvoiceButton order={o} org={org} address={address} taxes={taxes} />
            </div>

            <div className="grid md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600">Carrier</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={draft[o.id]?.carrier ?? o.tracking?.carrier ?? ""}
                  onChange={(e) => setField(o.id, "carrier", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">AWB / Tracking No</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={draft[o.id]?.awb ?? o.tracking?.awb ?? ""}
                  onChange={(e) => setField(o.id, "awb", e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveTracking(o.id)} className="border px-3 py-1 rounded">Save Tracking</button>
                <button onClick={() => advanceOrder(o.id)} className="bg-blue-600 text-white px-3 py-1 rounded">
                  Advance Status
                </button>
                <button onClick={() => updateOrderStatus(o.id, "Delivered")} className="border px-3 py-1 rounded">
                  Mark Delivered
                </button>
              </div>
            </div>

            <details className="text-xs">
              <summary className="cursor-pointer select-none text-gray-700">History</summary>
              <div className="mt-2 space-y-1">
                {(o.history || []).map((h, idx) => (
                  <div key={idx} className="text-gray-600">
                    {new Date(h.at).toLocaleString()} • {h.by} • {h.type} • {h.status} {h.note ? `• ${h.note}` : ""}
                  </div>
                ))}
              </div>
            </details>
          </div>
        );
      })}
    </div>
  );
}

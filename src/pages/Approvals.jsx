import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Approvals() {
  const { orders, approveOrder, rejectOrder } = useAppStore();
  const [reason, setReason] = useState({}); // {orderId: "text"}

  const waiting = orders.filter((o) => o.status === "PendingApproval");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Approvals</h1>

      {waiting.length === 0 && <div className="text-gray-500">Nothing to approve.</div>}

      {waiting.map((o) => (
        <div key={o.id} className="border rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Order #{o.id}</div>
              <div className="text-xs text-gray-600">
                Created: {new Date(o.createdAt).toLocaleString()} • Payment: {o.paymentMethod}
              </div>
            </div>
            <div className="text-sm px-2 py-1 rounded bg-amber-100 text-amber-800">
              {o.status}
            </div>
          </div>

          <div className="text-sm">
            {o.items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-48 truncate">{it.name}</div>
                <div>Qty: {it.qty}</div>
                <div>Unit: {Number.isFinite(Number(it.unitPrice)) ? `₹${it.unitPrice}` : "POR"}</div>
                <div>Total: ₹{it.lineTotal}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">Subtotal: <b>₹{o.totals?.subtotal ?? 0}</b></div>
            <div className="flex gap-2">
              <input
                placeholder="Reject reason (optional)"
                className="border rounded px-2 py-1"
                value={reason[o.id] || ""}
                onChange={(e) => setReason((r) => ({ ...r, [o.id]: e.target.value }))}
              />
              <button onClick={() => rejectOrder(o.id, reason[o.id] || "")}
                      className="border px-3 py-1 rounded text-red-600">Reject</button>
              <button onClick={() => approveOrder(o.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

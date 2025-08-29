import { useAppStore } from "../context/AppStore";

const statusColors = {
  PendingApproval: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Packed: "bg-indigo-100 text-indigo-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-700",
};

export default function Orders() {
  const { orders, currentUser } = useAppStore();
  const myOrders = orders.filter((o) => !currentUser || o.buyerId === currentUser.id);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Orders</h1>

      {myOrders.length === 0 && <div className="text-gray-500">No orders yet.</div>}

      {myOrders.map((o) => (
        <div key={o.id} className="border rounded-lg p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Order #{o.id}</div>
              <div className="text-xs text-gray-600">
                Created: {new Date(o.createdAt).toLocaleString()} • Payment: {o.paymentMethod}
              </div>
              {o.tracking?.awb && (
                <div className="text-xs text-gray-600">
                  Tracking: {o.tracking.carrier || "Carrier"} • {o.tracking.awb}
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
                <div>Qty: {it.qty}</div>
                <div>Unit: {Number.isFinite(Number(it.unitPrice)) ? `₹${it.unitPrice}` : "POR"}</div>
                <div>Total: ₹{it.lineTotal}</div>
              </div>
            ))}
          </div>

          <div className="text-right text-sm">
            Subtotal: <b>₹{o.totals?.subtotal ?? 0}</b>
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
      ))}
    </div>
  );
}

import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function RMA() {
  const { orders, setOrders } = useAppStore();
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState("");

  const submit = () => {
    if (!orderId || !reason) return alert("Select order and reason");
    const id = Date.now();
    setOrders(orders.map(o => o.id === Number(orderId) ? { ...o, rma: [...(o.rma||[]), { id, reason, photo, at: new Date().toISOString(), status: "OPEN"}] } : o));
    setOrderId(""); setReason(""); setPhoto("");
    alert("RMA/Service ticket created");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">RMA / Service</h1>

      <select value={orderId} onChange={(e)=>setOrderId(e.target.value)} className="w-full border rounded px-3 py-2 mb-2">
        <option value="">Select order</option>
        {orders.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.items.map(i=>i.name).join(", ")}</option>)}
      </select>

      <input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason" className="w-full border rounded px-3 py-2 mb-2" />
      <input value={photo} onChange={(e)=>setPhoto(e.target.value)} placeholder="Photo URL (optional)" className="w-full border rounded px-3 py-2 mb-3" />

      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Ticket</button>
    </div>
  );
}

import { useAppStore } from "../context/AppStore";

const nextStatus = (s) => {
  const flow = ["CONFIRMED","PACKED","SHIPPED","DELIVERED"];
  const i = flow.indexOf(s);
  return i >= 0 && i < flow.length-1 ? flow[i+1] : null;
};

export default function Orders() {
  const { orders, setOrders } = useAppStore();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {orders.length === 0 && <div>No orders yet.</div>}

      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">#{o.id} — {o.items.map(i=>i.name).join(", ")}</div>
              <div className="text-sm">Status: <b>{o.status}</b></div>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              Subtotal ₹{o.totals?.subtotal ?? o.items.reduce((s,i)=>s+i.qty*i.unit,0)} • Tax ₹{o.totals?.tax ?? 0} • Total ₹{o.totals?.total ?? 0}
            </div>

            <div className="mt-2 text-xs">
              Timeline: {o.timeline.map(t => `${t.status}@${new Date(t.at).toLocaleString()}`).join(" → ")}
            </div>

            <div className="mt-3 flex gap-2">
              {nextStatus(o.status) && (
                <button
                  className="border rounded px-3 py-1"
                  onClick={()=>{
                    const ns = nextStatus(o.status);
                    setOrders(orders.map(x=>x.id===o.id ? { ...x, status: ns, timeline: [...x.timeline, { at:new Date().toISOString(), status: ns }]} : x));
                  }}
                >
                  Advance to {nextStatus(o.status)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

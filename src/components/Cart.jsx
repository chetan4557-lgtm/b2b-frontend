import { useContext, useMemo } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../context/AppStore";

export default function Cart() {
  const { cart, removeFromCart, inc, dec } = useContext(CartContext);
  const { products, getTierPrice, org, currentUser, addresses } = useAppStore();
  const nav = useNavigate();

  const items = useMemo(() => {
    return cart.map((c) => {
      const p = products.find((x) => x.id === c.id);
      const unit = getTierPrice(p, c.qty);
      const base = p.tiers?.[0]?.price ?? unit;
      const okMOQ = c.qty >= (p.moq || 1);
      const okMultiple = c.qty % (p.cartonMultiple || 1) === 0;
      const savings = Math.max(0, (base - unit) * c.qty);
      return { ...c, unit, base, savings, okMOQ, okMultiple, name: p.name, image: p.image, hsn: p.hsn, leadDays: p.leadDays };
    });
  }, [cart, products, getTierPrice]);

  const subtotal = items.reduce((s, i) => s + i.unit * i.qty, 0);
  const totalSavings = items.reduce((s, i) => s + i.savings, 0);

  // Estimate delivery: max(product lead) + ETA by pincode (simple)
  // If there is at least one address, pick the first as default preview
  const defaultAddress = addresses[0];
  const pincodeETA = (pincode) => String(pincode).startsWith("56") ? 2 : 5; // demo
  const maxLead = items.reduce((m, i) => Math.max(m, i.leadDays || 0), 0);
  const estDays = (defaultAddress ? pincodeETA(defaultAddress.pincode) : 3) + maxLead;
  const etaDate = formatDate(addDays(new Date(), estDays));

  const needsApproval = subtotal > org.approvalLimit && currentUser.role === "buyer";

  if (cart.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Your Cart</h2>
        <p className="text-gray-600">No items in cart.</p>
        <Link to="/products" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Browse Products
        </Link>
      </div>
    );
  }

  const exportPDF = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const rows = items.map(i => `
      <tr>
        <td>${escapeHtml(i.name)}<br/><small>HSN ${i.hsn}</small></td>
        <td>${i.qty}</td>
        <td>₹${i.unit}</td>
        <td>₹${i.unit * i.qty}</td>
      </tr>
    `).join("");

    w.document.write(`
      <html>
        <head>
          <title>Cart Summary</title>
          <style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:20px;}
            table{width:100%;border-collapse:collapse;}
            th,td{border:1px solid #ddd;padding:8px;text-align:left;}
            th{background:#f5f5f5;}
          </style>
        </head>
        <body>
          <h2>Cart Summary</h2>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p><b>Subtotal:</b> ₹${subtotal}</p>
          <p><b>Total Savings:</b> ₹${totalSavings}</p>
          <p><b>Estimated Delivery:</b> ${etaDate} (${estDays} days)</p>
          <hr/>
          <p style="color:#888;font-size:12px">Print to PDF using your browser.</p>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Your Cart</h2>
      <div className="text-sm text-gray-600 mb-4">
        Estimated delivery: <b>{etaDate}</b> ({estDays} days)
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border rounded p-3">
            <div className="flex items-center gap-3">
              {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-600">
                  HSN {item.hsn} • Unit ₹{item.unit}
                  {item.savings > 0 && <span className="ml-2 text-green-700">Save ₹{item.savings}</span>}
                </div>
                {!item.okMOQ && <div className="text-red-600 text-xs">Below MOQ</div>}
                {!item.okMultiple && <div className="text-red-600 text-xs">Not a multiple of carton size</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => dec(item.id)} className="px-2 py-1 border rounded">−</button>
              <span className="w-6 text-center">{item.qty}</span>
              <button onClick={() => inc(item.id)} className="px-2 py-1 border rounded">＋</button>
              <div className="w-24 text-right font-semibold">₹{item.unit * item.qty}</div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xl font-bold">Subtotal: ₹{subtotal}</div>
          {totalSavings > 0 && <div className="text-green-700 text-sm">You saved ₹{totalSavings} with bulk pricing</div>}
          {needsApproval && <div className="text-amber-600 text-sm mt-1">Above ₹{org.approvalLimit} — requires approver.</div>}
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="border px-4 py-2 rounded">Export PDF</button>
          <Link to="/lists" className="border px-4 py-2 rounded">Save as List</Link>
          <button
            onClick={() => nav("/checkout", { state: { needsApproval } })}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            {needsApproval ? "Submit for Approval" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// helpers
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

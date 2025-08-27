import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useAppStore } from "../context/AppStore";
import { useLocation } from "react-router-dom";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;

export default function Checkout() {
  const { cart, clear } = useContext(CartContext);
  const { products, getTierPrice, addresses, setAddresses, org, setOrders } = useAppStore();
  const [addressId, setAddressId] = useState(addresses[0]?.id || null);
  const [gstin, setGstin] = useState(org.gstin || "");
  const [payment, setPayment] = useState("PO");
  const [poNumber, setPoNumber] = useState("");
  const [poFileName, setPoFileName] = useState("");
  const [placedId, setPlacedId] = useState(null);
  const { state } = useLocation();

  const items = useMemo(() => cart.map(c => {
    const p = products.find(x => x.id === c.id);
    const unit = getTierPrice(p, c.qty);
    return { ...c, name: p.name, hsn: p.hsn, unit, image: p.image };
  }), [cart, products, getTierPrice]);

  const subtotal = items.reduce((s,i)=>s+i.unit*i.qty,0);

  // Simple tax: if state === KA → CGST+SGST (9%+9%), else IGST 18%
  const selectedAddress = addresses.find(a => a.id === addressId);
  const intraState = selectedAddress?.state?.toUpperCase() === "KA";
  const tax = Math.round(subtotal * 0.18);
  const cgst = intraState ? Math.round(tax/2) : 0;
  const sgst = intraState ? Math.round(tax/2) : 0;
  const igst = intraState ? 0 : tax;
  const total = subtotal + tax;

  const placeOrder = (e) => {
    e.preventDefault();
    if (!gstinRegex.test(gstin)) return alert("Invalid GSTIN format");
    if (payment === "PO" && !poNumber) return alert("PO number required");

    const id = Date.now();
    setOrders(o => [...o, {
      id,
      from: "CHECKOUT",
      items: items.map(i => ({ productId: i.id, name: i.name, hsn: i.hsn, qty: i.qty, unit: i.unit, image: i.image })),
      addressId,
      status: state?.needsApproval ? "PENDING_APPROVAL" : "CONFIRMED",
      timeline: [{ at: new Date().toISOString(), status: state?.needsApproval ? "PENDING_APPROVAL" : "CONFIRMED" }],
      taxes: { cgst, sgst, igst },
      totals: { subtotal, tax, total },
      payment: { method: payment, poNumber, poFileName, terms: org.netTerms },
      gstin
    }]);
    clear();
    setPlacedId(id);
  };

  if (placedId) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Order placed!</h1>
        <p className="mb-4">Order #{placedId}. {state?.needsApproval ? "Pending approval by approver." : "We will process it shortly."}</p>
        <button className="border px-4 py-2 rounded" onClick={() => window.print()}>
          Print / Save Tax Invoice (PDF)
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-bold mb-3">Order Summary</h2>
        <div className="space-y-2">
          {items.map(i => (
            <div key={i.id} className="flex justify-between">
              <span>{i.name} (HSN {i.hsn}) × {i.qty}</span>
              <span>₹{i.unit * i.qty}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-600">Subtotal: ₹{subtotal}</div>
        {intraState ? (
          <div className="text-sm text-gray-600">CGST 9%: ₹{cgst} • SGST 9%: ₹{sgst}</div>
        ) : (
          <div className="text-sm text-gray-600">IGST 18%: ₹{igst}</div>
        )}
        <div className="text-lg font-bold mt-1">Total: ₹{total}</div>
      </div>

      <form onSubmit={placeOrder} className="border rounded p-4 shadow">
        <h2 className="text-xl font-bold mb-4">Billing & Payment</h2>

        <label className="block text-sm mb-1">Select Address</label>
        <select value={addressId ?? ""} onChange={(e)=>setAddressId(Number(e.target.value))} className="w-full border rounded px-3 py-2 mb-3">
          {addresses.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}, {a.state} ({a.pincode})</option>)}
        </select>
        <a className="text-blue-600 underline text-sm" href="/address-book">Manage addresses</a>

        <label className="block text-sm mt-4 mb-1">GSTIN</label>
        <input value={gstin} onChange={(e)=>setGstin(e.target.value.toUpperCase())} placeholder="22ABCDE1234F1Z5" className="w-full border rounded px-3 py-2 mb-3" />

        <label className="block text-sm mb-1">Payment Method</label>
        <select value={payment} onChange={(e)=>setPayment(e.target.value)} className="w-full border rounded px-3 py-2 mb-3">
          <option value="PO">Purchase Order (PO)</option>
          <option value="Net-30">Net-30</option>
          <option value="Net-45">Net-45</option>
          <option value="CreditLine">Credit Line</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>

        {payment === "PO" && (
          <>
            <label className="block text-sm mb-1">PO Number</label>
            <input value={poNumber} onChange={(e)=>setPoNumber(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />
            <label className="block text-sm mb-1">Upload PO (filename only demo)</label>
            <input type="text" placeholder="po.pdf" value={poFileName} onChange={(e)=>setPoFileName(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />
          </>
        )}

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          {state?.needsApproval ? "Submit Order for Approval" : "Place Order"}
        </button>
      </form>
    </div>
  );
}

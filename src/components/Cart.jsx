import { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAppStore } from "../context/AppStore";

const N = globalThis.Number;
const isFin = (v) => N.isFinite(N(v));
const nOr = (v, f) => (isFin(v) ? N(v) : f);

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Cart() {
  const nav = useNavigate();
  const { products, getTierPrice, addresses = [] } = useAppStore();
  const { cart = [], removeFromCart, inc, dec, clear } = useContext(CartContext);

  const rows = useMemo(() => {
    const catalog = Array.isArray(products) ? products : [];
    const src = Array.isArray(cart) ? cart : [];

    return src.map((c) => {
      const product = catalog.find((p) => String(p?.id) === String(c?.id));
      const qty = nOr(c?.qty, 1);

      // Compute unit price for this qty (may be null if no valid tiers)
      const unit = product ? getTierPrice(product, qty) : null;

      // Format display strings RIGHT HERE (prevents "₹null")
      const unitDisplay = isFin(unit) ? `₹${unit}` : "Price on request";
      const lineTotal = isFin(unit) ? unit * qty : 0;
      const lineTotalDisplay = isFin(unit) ? `₹${lineTotal}` : "—";

      // Basic checks
      const moq = nOr(product?.moq, 1);
      const multiple = nOr(product?.cartonMultiple, 1);
      const okMOQ = qty >= moq;
      const okMultiple = qty % multiple === 0;

      // Savings vs first tier if defined
      const base = product?.tiers?.[0]?.price;
      const savings = isFin(base) && isFin(unit) ? Math.max(0, (base - unit) * qty) : 0;

      return {
        id: c?.id,
        qty,
        product,
        unit,                // raw number or null
        unitDisplay,         // clean string
        lineTotal,           // raw number (0 if POR)
        lineTotalDisplay,    // clean string
        okMOQ,
        okMultiple,
        savings,
      };
    });
  }, [cart, products, getTierPrice]);

  const subtotal = useMemo(
    () => rows.reduce((s, r) => s + (isFin(r.lineTotal) ? r.lineTotal : 0), 0),
    [rows]
  );
  const totalSavings = useMemo(
    () => rows.reduce((s, r) => s + (isFin(r.savings) ? r.savings : 0), 0),
    [rows]
  );

  const maxLead = rows.reduce((m, r) => Math.max(m, nOr(r.product?.leadDays, 0)), 0);
  const eta = addresses.length ? addDays(new Date(), maxLead + 2) : null;

  if (!rows.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-4">No items in cart.</p>
        <Link to="/products" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clear} className="border px-3 py-1 rounded text-red-600">Clear Cart</button>
      </div>

      <div className="divide-y border rounded-lg bg-white">
        {rows.map((r) => (
          <div key={r.id} className="p-4 flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {r.product?.image ? (
                <img src={r.product.image} alt={r.product?.name || "item"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-500">No image</span>
              )}
            </div>

            <div className="flex-1">
              <div className="font-semibold">{r.product?.name || "Product not found"}</div>
              {r.product ? (
                <div className="text-xs text-gray-600">
                  HSN {r.product.hsn || "—"} • MOQ {nOr(r.product.moq, 1)} • Multiple {nOr(r.product.cartonMultiple, 1)} • Lead {nOr(r.product.leadDays, 0)}d
                </div>
              ) : (
                <div className="text-xs text-red-600">This product is no longer available.</div>
              )}

              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm">Qty</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="border rounded px-2 py-1 w-24"
                  value={r.qty}
                  onChange={(e) => {
                    const next = Math.max(1, nOr(e.target.value, 1));
                    if (next > r.qty) inc(r.id);
                    else if (next < r.qty) dec(r.id);
                  }}
                />
                <button onClick={() => removeFromCart(r.id)} className="ml-2 border px-3 py-1 rounded text-red-600">
                  Remove
                </button>
                {(!r.okMOQ || !r.okMultiple) && (
                  <span className="text-xs text-red-600 ml-2">
                    {r.okMOQ ? "" : `Min ${nOr(r.product?.moq, 1)}. `}
                    {r.okMultiple ? "" : `Order in multiples of ${nOr(r.product?.cartonMultiple, 1)}.`}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right min-w-[160px]">
              <div className="text-sm text-gray-500">Unit</div>
              <div className="font-semibold">{r.unitDisplay}</div>
              <div className="text-sm text-gray-500 mt-2">Line total</div>
              <div className="font-semibold">{r.lineTotalDisplay}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {eta ? <>Estimated delivery by <b>{formatDate(eta)}</b></> : "Add an address at checkout to see ETA"}
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-500">Savings</div>
            <div className="font-semibold">₹{totalSavings}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-xl font-bold">₹{subtotal}</div>
            <div className="text-xs text-gray-500">(Items with “Price on request” are billed offline)</div>
          </div>
          <button onClick={() => nav("/checkout")} className="bg-blue-600 text-white px-5 py-2 rounded">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { calcOrderTaxes, isValidGSTIN, getHSNRate } from "../utils/tax";
import InvoiceButton from "../components/InvoiceButton";

const N = globalThis.Number;
const isFin = (v) => N.isFinite(N(v));
const nOr = (v, f) => (isFin(v) ? N(v) : f);

const SELLER_STATE = "KA"; // change to your seller's state code

export default function Checkout() {
  const nav = useNavigate();
  const { products, getTierPrice, addOrder, org, setOrg, addresses } = useAppStore();
  const { cart = [], clear } = useContext(CartContext);

  const [addressId, setAddressId] = useState(addresses[0]?.id ?? null);
  const [payment, setPayment] = useState("Card/UPI");
  const [gstin, setGstin] = useState(org.gstin || "");
  const [gstError, setGstError] = useState("");

  useEffect(() => {
    if (gstin && !isValidGSTIN(gstin)) setGstError("Invalid GSTIN format");
    else setGstError("");
  }, [gstin]);

  const shipAddr = useMemo(
    () => addresses.find((a) => String(a.id) === String(addressId)) || null,
    [addresses, addressId]
  );

  const items = useMemo(() => {
    const catalog = Array.isArray(products) ? products : [];
    const src = Array.isArray(cart) ? cart : [];
    return src.map((c) => {
      const p = catalog.find((x) => String(x.id) === String(c.id));
      const qty = nOr(c.qty, 1);
      const unit = p ? getTierPrice(p, qty) : null;
      // choose rate: product.taxRate > inferred from HSN > fallback
      const inferred = getHSNRate(p?.hsn);
      const gstRate = Number.isFinite(Number(p?.taxRate))
        ? Number(p.taxRate)
        : (inferred ?? 18);

      return {
        productId: c.id,
        name: p?.name || "",
        hsn: p?.hsn || "",
        qty,
        unitPrice: unit,
        gstRate,
        lineTotal: isFin(unit) ? unit * qty : 0,
      };
    });
  }, [cart, products, getTierPrice]);

  const subtotal = items.reduce((s, x) => s + (isFin(x.lineTotal) ? x.lineTotal : 0), 0);
  const needsApproval =
    subtotal > nOr(org.approvalLimit, 0) ||
    ["PO", "Net-30", "Net-45", "Credit Line"].includes(payment);

  const taxes = useMemo(() => {
    const buyerState = shipAddr?.state || "";
    return calcOrderTaxes(items, {
      sellerState: SELLER_STATE,
      buyerState,
      defaultRate: 18,
    });
  }, [items, shipAddr]);

  const placeOrder = () => {
    if (gstin && isValidGSTIN(gstin)) {
      setOrg({ ...org, gstin: gstin.toUpperCase() });
    }

    const orderId = addOrder({
      status: needsApproval ? "PendingApproval" : "Confirmed",
      paymentMethod: payment,
      addressId,
      items,
      totals: {
        subtotal,
        taxable: taxes.totals.taxableTotal,
        cgst: taxes.totals.cgstTotal,
        sgst: taxes.totals.sgstTotal,
        igst: taxes.totals.igstTotal,
        tax: taxes.totals.taxTotal,
        grandTotal: taxes.totals.grandTotal,
      },
      meta: { gstin: gstin || null },
    });

    clear();
    nav("/orders");
    console.log("Order placed:", orderId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <section className="border rounded-lg p-4 bg-white space-y-2">
        <h2 className="font-semibold">Buyer GST Details</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600">GSTIN</label>
            <input
              className={`border rounded px-3 py-2 w-full ${gstError ? "border-red-500" : ""}`}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
            />
            {gstError && <div className="text-xs text-red-600 mt-1">{gstError}</div>}
          </div>
          <div>
            <label className="block text-xs text-gray-600">Org Name</label>
            <input className="border rounded px-3 py-2 w-full" value={org.name} readOnly />
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-4 bg-white space-y-2">
        <h2 className="font-semibold">Shipping Address</h2>
        <select
          className="border rounded px-3 py-2"
          value={addressId ?? ""}
          onChange={(e) => setAddressId(Number(e.target.value))}
        >
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.line1}, {a.city} ({a.state})
            </option>
          ))}
        </select>
      </section>

      <section className="border rounded-lg p-4 bg-white space-y-2">
        <h2 className="font-semibold">Payment</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {["Card/UPI", "PO", "Net-30", "Net-45", "Credit Line"].map((m) => (
            <label key={m} className="flex items-center gap-2 border rounded px-3 py-2">
              <input
                type="radio"
                name="pay"
                value={m}
                checked={payment === m}
                onChange={(e) => setPayment(e.target.value)}
              />
              {m}
            </label>
          ))}
        </div>
        {needsApproval && (
          <div className="mt-2 text-sm text-amber-700">
            This order will be placed as <b>Pending Approval</b> (limit: ₹{org.approvalLimit}).
          </div>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white space-y-1">
        <h2 className="font-semibold">Summary (GST)</h2>
        <div className="text-sm text-gray-700">Items: {items.length}</div>
        <div className="text-sm text-gray-700">Taxable Value: ₹{taxes.totals.taxableTotal}</div>
        <div className="text-sm text-gray-700">CGST: ₹{taxes.totals.cgstTotal}</div>
        <div className="text-sm text-gray-700">SGST: ₹{taxes.totals.sgstTotal}</div>
        <div className="text-sm text-gray-700">IGST: ₹{taxes.totals.igstTotal}</div>
        <div className="text-lg font-bold">Grand Total: ₹{taxes.totals.grandTotal}</div>

        <div className="flex gap-2 mt-2">
          <InvoiceButton
            order={{ id: "preview", items }}
            org={{ name: org.name, gstin: gstin || org.gstin }}
            address={shipAddr}
            taxes={taxes}
          />
        </div>
      </section>

      <button
        onClick={placeOrder}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!!gstError}
        title={gstError ? "Fix GSTIN to proceed" : ""}
      >
        Place Order
      </button>
    </div>
  );
}

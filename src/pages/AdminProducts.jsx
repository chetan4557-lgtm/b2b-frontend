import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../context/AppStore";
import { Link } from "react-router-dom";

const EMPTY = {
  id: "",
  name: "",
  description: "",
  hsn: "",
  image: "",
  category: "",
  taxRate: 18,      // NEW
  moq: 1,
  cartonMultiple: 1,
  leadDays: 0,
  tiers: [{ min: 1, max: null, price: "" }],
};

const N = globalThis.Number;
const isFin = (v) => N.isFinite(N(v));
const toNumOr = (v, f) => (isFin(v) ? N(v) : f);

export default function AdminProducts() {
  const store = useAppStore?.();
  if (!store) return <div className="p-6">AppStore not available</div>;

  const { products, addProduct, updateProduct, deleteProduct } = store;
  const safeProducts = Array.isArray(products) ? products : [];

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => setForm(editing ? normalizeIncoming(editing) : EMPTY), [editing]);

  const filtered = useMemo(() => {
    const needle = (q || "").toLowerCase();
    return safeProducts.filter((p) =>
      (String(p?.name ?? "") + " " + String(p?.description ?? "") + " " + String(p?.category ?? ""))
        .toLowerCase()
        .includes(needle)
    );
  }, [safeProducts, q]);

  function normalizeIncoming(p) {
    return {
      id: String(p?.id ?? ""),
      name: String(p?.name ?? ""),
      description: String(p?.description ?? ""),
      hsn: String(p?.hsn ?? ""),
      image: String(p?.image ?? ""),
      category: String(p?.category ?? ""),
      taxRate: toNumOr(p?.taxRate, 18),        // NEW
      moq: toNumOr(p?.moq, 1),
      cartonMultiple: toNumOr(p?.cartonMultiple, 1),
      leadDays: toNumOr(p?.leadDays, 0),
      tiers: Array.isArray(p?.tiers)
        ? p.tiers.map((t) => ({
            min: toNumOr(t?.min, 1),
            max: t?.max == null ? null : toNumOr(t?.max, null),
            price: isFin(t?.price) ? N(t.price) : "",
          }))
        : [{ min: 1, max: null, price: "" }],
    };
  }

  function cleanForSave(f) {
    const tiers = (f.tiers || [])
      .map((t) => ({
        min: toNumOr(t.min, 1),
        max: t.max === "" ? null : (t.max == null ? null : toNumOr(t.max, null)),
        price: isFin(t.price) ? N(t.price) : NaN,
      }))
      .filter((t) => isFin(t.price))
      .sort((a, b) => a.min - b.min);

    return {
      id: (f.id && String(f.id).trim()) || Date.now().toString(),
      name: (f.name || "").trim(),
      description: (f.description || "").trim(),
      hsn: (f.hsn || "").trim(),
      image: (f.image || "").trim(),
      category: (f.category || "").trim(),
      taxRate: Math.max(0, toNumOr(f.taxRate, 18)),       // NEW
      moq: Math.max(1, toNumOr(f.moq, 1)),
      cartonMultiple: Math.max(1, toNumOr(f.cartonMultiple, 1)),
      leadDays: Math.max(0, toNumOr(f.leadDays, 0)),
      tiers,
    };
  }

  // ---- Validation (tiers) ----
  const tierErrors = useMemo(() => validateTiers(form.tiers), [form.tiers]);
  const hasErrors = tierErrors.length > 0;

  function onSubmit(e) {
    e.preventDefault();
    const clean = cleanForSave(form);
    if (!clean.name) {
      alert("Name is required");
      return;
    }
    if (hasErrors) {
      alert("Fix tier errors before saving.");
      return;
    }
    if (editing) updateProduct(clean);
    else addProduct(clean);
    setEditing(null);
    setForm(EMPTY);
  }

  const setField = (key, val) => setForm((s) => ({ ...s, [key]: val }));
  const addTier = () => setForm((f) => ({ ...f, tiers: [...(f.tiers || []), { min: "", max: null, price: "" }] }));
  const removeTier = (i) => setForm((f) => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) }));
  const setTier = (i, key, val) =>
    setForm((f) => {
      const copy = [...(f.tiers || [])];
      copy[i] = { ...copy[i], [key]: val };
      return { ...f, tiers: copy };
    });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin • Products</h1>
        <Link to="/products" className="text-blue-600 underline">View Store</Link>
      </div>

      {/* Editor */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Text label="Name *" value={form.name} onChange={(v) => setField("name", v)} required />
          <Text label="Category" value={form.category} onChange={(v) => setField("category", v)} />
          <TextArea label="Description" value={form.description} onChange={(v) => setField("description", v)} />
          <Text label="Image URL" placeholder="/images/mixer.jpg or https://…" value={form.image} onChange={(v) => setField("image", v)} />
          <Text label="HSN" value={form.hsn} onChange={(v) => setField("hsn", v)} />
          <NumInput label="GST Rate (%)" value={form.taxRate} min={0} onChange={(v) => setField("taxRate", v)} /> {/* NEW */}
          <NumInput label="MOQ" value={form.moq} min={1} onChange={(v) => setField("moq", v)} />
          <NumInput label="Carton Multiple" value={form.cartonMultiple} min={1} onChange={(v) => setField("cartonMultiple", v)} />
          <NumInput label="Lead Days" value={form.leadDays} min={0} onChange={(v) => setField("leadDays", v)} />

          {/* Tiers */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Price Tiers</div>
              <button type="button" onClick={addTier} className="border px-3 py-1 rounded">+ Add Tier</button>
            </div>

            {/* Error list */}
            {hasErrors && (
              <div className="mb-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                <div className="font-semibold">Fix these issues:</div>
                <ul className="list-disc ml-5">
                  {tierErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              {(form.tiers || []).map((t, i) => {
                const rowErr = validateTierRow(t);
                return (
                  <div key={i} className={`grid grid-cols-12 gap-2 ${rowErr ? "bg-red-50 rounded p-2" : ""}`}>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Min Qty</label>
                      <input type="number" className={`border rounded px-2 py-1 w-full ${rowErr?.min ? "border-red-500" : ""}`} value={t.min}
                        onChange={(e) => setTier(i, "min", e.target.value)} min={1} />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Max Qty (blank = ∞)</label>
                      <input type="number" className={`border rounded px-2 py-1 w-full ${rowErr?.max ? "border-red-500" : ""}`} value={t.max == null ? "" : t.max}
                        onChange={(e) => setTier(i, "max", e.target.value === "" ? null : e.target.value)} min={1} />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">Unit Price (₹)</label>
                      <input type="number" className={`border rounded px-2 py-1 w-full ${rowErr?.price ? "border-red-500" : ""}`} value={t.price}
                        onChange={(e) => setTier(i, "price", e.target.value)} min={0} />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <button type="button" onClick={() => removeTier(i)} className="border px-3 py-1 rounded w-full">Remove</button>
                    </div>
                    {rowErr && <div className="col-span-12 text-xs text-red-700">{rowErr.message}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60" disabled={hasErrors}>
              {editing ? "Update Product" : "Create Product"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="border px-4 py-2 rounded">Cancel Edit</button>
            )}
          </div>
        </form>
      </div>

      {/* Search + Count */}
      <div className="flex items-center justify-between">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="border rounded px-3 py-2 w-72" />
        <span className="text-sm text-gray-600">{filtered.length} items</span>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 bg-white shadow-sm flex gap-4">
            {p.image && <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded" />}
            <div className="flex-1">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-gray-600 mb-1">
                HSN {p.hsn || "—"} • GST {isFin(p.taxRate) ? p.taxRate : 18}% • MOQ {isFin(p.moq) ? p.moq : 1} • Carton {isFin(p.cartonMultiple) ? p.cartonMultiple : 1} • Lead {isFin(p.leadDays) ? p.leadDays : 0}d
              </div>
              <div className="text-xs text-gray-700">
                {(Array.isArray(p.tiers) && p.tiers.length > 0) ? (
                  p.tiers.map((t, i) => (
                    <span key={i} className="inline-block mr-2 border rounded px-2 py-0.5">
                      {isFin(t.min) ? t.min : 1}-{t.max == null ? "∞" : (isFin(t.max) ? t.max : "")}: ₹{isFin(t.price) ? t.price : 0}
                    </span>
                  ))
                ) : (
                  <span className="inline-block border rounded px-2 py-0.5">Price on request</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(p)} className="border px-3 py-1 rounded">Edit</button>
                <button onClick={() => deleteProduct(p.id)} className="border px-3 py-1 rounded text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-gray-500">No products.</div>}
      </div>
    </div>
  );
}

// --- Validation helpers ---
function validateTierRow(t) {
  const min = Number(t?.min);
  const max = t?.max == null ? null : Number(t?.max);
  const price = Number(t?.price);

  if (!Number.isFinite(min) || min < 1) return { min: true, message: "Min qty must be ≥ 1" };
  if (!(t?.max == null) && (!Number.isFinite(max) || max < min)) return { max: true, message: "Max qty must be ≥ Min qty or blank for ∞" };
  if (!Number.isFinite(price) || price < 0) return { price: true, message: "Price must be a valid number ≥ 0" };
  return null;
}

function validateTiers(tiers) {
  const errors = [];
  const rows = (tiers || []).map((t, i) => ({ ...t, _i: i }));

  // basic row validation
  rows.forEach((r) => {
    const e = validateTierRow(r);
    if (e) errors.push(`Row ${r._i + 1}: ${e.message}`);
  });

  // order by min
  const sorted = [...rows].sort((a, b) => Number(a.min) - Number(b.min));

  // no overlaps & monotonic
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    const curMax = cur.max == null ? Infinity : Number(cur.max);
    if (curMax >= Number(nxt.min)) {
      errors.push(`Rows ${cur._i + 1}–${nxt._i + 1} overlap (max of one must be < min of the next).`);
    }
  }

  // at least one tier (optional rule: comment out if allowing POR)
  if (sorted.length === 0) {
    errors.push("Add at least one price tier or leave all prices validly set.");
  }

  return errors;
}

// --- Reusable Inputs ---
function Text({ label, value, onChange, ...rest }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input className="border rounded px-3 py-2 w-full" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}
function NumInput({ label, value, onChange, min = 0 }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)} // string → number on save
      />
    </div>
  );
}
function TextArea({ label, value, onChange, ...rest }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <textarea className="border rounded px-3 py-2 w-full h-24" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}

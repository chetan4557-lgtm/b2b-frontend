import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../context/AppStore";

const EMPTY = {
  id: "",
  name: "",
  description: "",
  hsn: "",
  image: "",
  category: "",
  moq: 1,
  cartonMultiple: 1,
  leadDays: 0,
  // we’ll collect a single “base price” and save it as one tier
  basePrice: "",
};

const N = Number;
const isFin = (v) => N.isFinite(N(v));
const toNumOr = (v, f) => (isFin(N(v)) ? N(v) : f);

export default function SellerProducts() {
  const store = useAppStore();
  if (!store) return <div className="p-6">AppStore not available</div>;

  const { products, addProduct, updateProduct, deleteProduct, currentUser } = store;

  if (!currentUser) {
    return (
      <div className="p-6">
        Please <Link to="/login" className="underline text-blue-600">sign in</Link> as a seller.
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const isSeller = currentUser.role === "seller";

  // Only show my products if seller; admins can see all (for moderation)
  const myProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (isAdmin) return list;
    return list.filter((p) => String(p?.sellerId) === String(currentUser.id));
  }, [products, currentUser, isAdmin]);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = (q || "").toLowerCase();
    return myProducts.filter((p) =>
      (String(p?.name ?? "") + " " + String(p?.description ?? "") + " " + String(p?.category ?? ""))
        .toLowerCase()
        .includes(needle)
    );
  }, [myProducts, q]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  useEffect(() => setForm(editing ? normalizeIncoming(editing) : EMPTY), [editing]);

  function normalizeIncoming(p) {
    const basePrice =
      isFin(p?.tiers?.[0]?.price) ? N(p.tiers[0].price) : (isFin(p?.price) ? N(p.price) : "");
    return {
      id: String(p?.id ?? ""),
      name: String(p?.name ?? ""),
      description: String(p?.description ?? ""),
      hsn: String(p?.hsn ?? ""),
      image: String(p?.image ?? ""),
      category: String(p?.category ?? ""),
      moq: toNumOr(p?.moq, 1),
      cartonMultiple: toNumOr(p?.cartonMultiple, 1),
      leadDays: toNumOr(p?.leadDays, 0),
      basePrice,
    };
  }

  function cleanForSave(f) {
    const id = (f.id && String(f.id).trim()) || Date.now().toString();
    const payload = {
      id,
      sellerId: currentUser.id, // tag ownership
      name: (f.name || "").trim(),
      description: (f.description || "").trim(),
      hsn: (f.hsn || "").trim(),
      image: (f.image || "").trim(),
      category: (f.category || "").trim(),
      moq: Math.max(1, toNumOr(f.moq, 1)),
      cartonMultiple: Math.max(1, toNumOr(f.cartonMultiple, 1)),
      leadDays: Math.max(0, toNumOr(f.leadDays, 0)),
      tiers: isFin(f.basePrice)
        ? [{ min: 1, max: null, price: N(f.basePrice) }]
        : [],
    };
    return payload;
  }

  function onSubmit(e) {
    e.preventDefault();
    const payload = cleanForSave(form);
    if (editing) {
      updateProduct(payload);
    } else {
      addProduct(payload);
    }
    setEditing(null);
    setForm(EMPTY);
  }

  if (!isSeller && !isAdmin) {
    return <div className="p-6">403 • Only sellers/admins can manage products.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Moderate Products" : "My Products"}
          <span className="ml-2 text-sm text-gray-500">({filtered.length})</span>
        </h1>
        <Link to="/products" className="text-blue-600 underline">View Store</Link>
      </div>

      {/* Editor */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Text label="Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <Text label="Category *" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="mixers / ovens / fridges ..." required />
          <TextArea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
          <Text label="HSN" value={form.hsn} onChange={(v) => setForm((f) => ({ ...f, hsn: v }))} />
          <Text label="Image URL" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} placeholder="https://..." />

          <NumInput label="MOQ" value={form.moq} onChange={(v) => setForm((f) => ({ ...f, moq: v }))} min={1} />
          <NumInput label="Carton Multiple" value={form.cartonMultiple} onChange={(v) => setForm((f) => ({ ...f, cartonMultiple: v }))} min={1} />
          <NumInput label="Lead Time (days)" value={form.leadDays} onChange={(v) => setForm((f) => ({ ...f, leadDays: v }))} min={0} />

          <NumInput label="Base Price (₹)" value={form.basePrice} onChange={(v) => setForm((f) => ({ ...f, basePrice: v }))} min={0} />

          <div className="md:col-span-2 flex gap-2 pt-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              {editing ? "Save changes" : "Add product"}
            </button>
            {editing && (
              <button type="button" className="px-4 py-2 rounded border" onClick={() => { setEditing(null); setForm(EMPTY); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search + table */}
      <div className="flex items-center justify-between">
        <input
          className="border rounded px-3 py-2 w-full md:w-80"
          placeholder="Search my products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">MOQ</th>
              <th className="text-left p-3">Lead</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <img
                    src={p.image || `https://picsum.photos/seed/${encodeURIComponent(p.name)}/120/90`}
                    alt={p.name}
                    className="w-20 h-16 object-cover rounded"
                    onError={(e) => (e.currentTarget.src = `https://placehold.co/120x90?text=${encodeURIComponent(p.name || "Product")}`)}
                  />
                </td>
                <td className="p-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-gray-500 line-clamp-1 max-w-xs">{p.description}</div>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.moq}</td>
                <td className="p-3">{p.leadDays}d</td>
                <td className="p-3">
                  {isFin(p?.tiers?.[0]?.price) ? `₹${N(p.tiers[0].price).toLocaleString()}` : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border" onClick={() => setEditing(p)}>Edit</button>
                    <button className="px-3 py-1 rounded border border-red-400 text-red-600" onClick={() => deleteProduct(p.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={7}>No products yet. Add one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      <input type="number" min={min} className="border rounded px-3 py-2 w-full" value={value} onChange={(e) => onChange(e.target.value)} />
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

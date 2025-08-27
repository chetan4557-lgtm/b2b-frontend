import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useAppStore } from "../context/AppStore";
import Filters from "../components/Filters";
import CompareBar from "../components/CompareBar";

export default function Products() {
  const { products } = useAppStore();

  // Pull initial search from URL (?q=xxx)
  const [q, setQ] = useState(new URLSearchParams(location.search).get("q") || "");
  const [minMOQ, setMinMOQ] = useState(1);
  const [maxLead, setMaxLead] = useState(999);
  const [priceRange, setPriceRange] = useState([0, 999999]); // INR
  const [compare, setCompare] = useState(() => {
    try { return JSON.parse(localStorage.getItem("compare") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("compare", JSON.stringify(compare));
  }, [compare]);

  const list = useMemo(() => {
    let data = products.filter(p =>
      (p.name + " " + p.description).toLowerCase().includes(q.toLowerCase())
    );
    data = data.filter(p => (p.moq || 1) >= minMOQ);
    data = data.filter(p => (p.leadDays || 0) <= maxLead);
    data = data.filter(p => {
      const base = p.tiers?.[0]?.price ?? 0;
      return base >= priceRange[0] && base <= priceRange[1];
    });
    return data;
  }, [products, q, minMOQ, maxLead, priceRange]);

  return (
    <div className="p-6">
      <Filters
        q={q}
        onQ={setQ}
        minMOQ={minMOQ}
        onMinMOQ={setMinMOQ}
        maxLead={maxLead}
        onMaxLead={setMaxLead}
        priceRange={priceRange}
        onPriceRange={setPriceRange}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {list.map((p) => (
          <div key={p.id} className="space-y-2 border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={compare.includes(p.id)}
                  onChange={(e) => {
                    setCompare(prev => e.target.checked ? [...new Set([...prev, p.id])] : prev.filter(x => x !== p.id));
                  }}
                />
                Compare
              </label>
              <span className="text-xs text-gray-600">Lead: {p.leadDays}d</span>
            </div>

            <ProductCard product={p} />

            <div className="text-xs text-gray-600">
              {p.tiers.map((t,i)=>(
                <span key={i} className="inline-block mr-2 border rounded px-2 py-0.5">
                  {t.min}–{t.max}: ₹{t.price}
                </span>
              ))}
              <span className="inline-block ml-2">MOQ {p.moq}, multiple {p.cartonMultiple}</span>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-gray-500">No products match the filters.</div>}
      </div>

      <CompareBar
        products={products.filter(p => compare.includes(p.id))}
        onClear={() => setCompare([])}
        onRemove={(id) => setCompare(compare.filter(x => x !== id))}
      />
    </div>
  );
}

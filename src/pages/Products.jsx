import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAppStore } from "../context/AppStore";
import Filters from "../components/Filters";

const N = Number;
const isFin = (v) => N.isFinite(N(v));
const nOr = (v, f) => (isFin(v) ? N(v) : f);

const normalize = (s) => String(s || "").trim().toLowerCase();

export default function Products() {
  const { products } = useAppStore();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // NEW: support category param (cat=mixers)
  const catParam = normalize(params.get("cat"));
  const initialQ = params.get("q") || "";
  const limitParam = params.get("limit");
  const initialLimit = limitParam && isFin(N(limitParam)) ? N(limitParam) : undefined;

  const [q, setQ] = useState(initialQ);

  // Build filtered list
  const { list, appliedCategory } = useMemo(() => {
    const src = Array.isArray(products) ? products : [];
    let data = [...src];

    // If cat is present, filter STRICTLY by category
    let appliedCategory = "";
    if (catParam) {
      appliedCategory = catParam;
      data = data.filter((p) => normalize(p.category) === catParam);
      // Fallback: also accept singular/plural name matches if category field is absent/mismatched
      if (data.length < 5) {
        const alt = src.filter(
          (p) =>
            normalize(p.name).includes(catParam.replace(/s$/, "")) ||
            normalize(p.description).includes(catParam.replace(/s$/, ""))
        );
        // merge without duplicates
        const ids = new Set(data.map((d) => String(d.id)));
        for (const a of alt) if (!ids.has(String(a.id))) data.push(a);
      }
    }

    // Then apply free-text search if q is provided (acts as additional filter)
    const qNorm = normalize(q);
    if (qNorm) {
      data = data.filter((p) =>
        (normalize(p.name) + " " + normalize(p.description) + " " + normalize(p.category)).includes(qNorm)
      );
    }

    // Basic numeric filters could go here if you re-enable them

    // Limit if requested (e.g., cat click passes limit=5)
    if (initialLimit) data = data.slice(0, initialLimit);

    return { list: data, appliedCategory };
  }, [products, q, catParam, initialLimit]);

  return (
    <div className="p-6 space-y-4">
      {/* Optional context bar when category is applied */}
      {appliedCategory && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <div>
            <span className="font-semibold capitalize">{appliedCategory}</span>
            {initialLimit ? <span className="text-sm text-gray-600"> — showing top {initialLimit}</span> : null}
          </div>
          <Link
            to={`/products?cat=${encodeURIComponent(appliedCategory)}`}
            className="text-sm underline"
            title="View all in this category"
          >
            View all
          </Link>
        </div>
      )}

      {/* Header: compact search only (no results count/reset) */}
      <div className="flex items-center justify-start">
        <Filters q={q} onQ={setQ} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {list.length === 0 && <div className="text-gray-500">No products match your selection.</div>}
    </div>
  );
}

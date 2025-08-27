import { useMemo } from "react";

export default function CompareBar({ products, onClear, onRemove }) {
  const visible = products.length > 0;
  const headers = ["Name", "MOQ", "Carton", "Lead (d)", "Tiers"];

  const rows = useMemo(() => {
    return products.map(p => ({
      id: p.id,
      Name: p.name,
      MOQ: p.moq,
      Carton: p.cartonMultiple,
      "Lead (d)": p.leadDays,
      Tiers: p.tiers?.map(t => `${t.min}-${t.max}:₹${t.price}`).join(" | ")
    }));
  }, [products]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-white border-t shadow-2xl">
      <div className="max-w-6xl mx-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Compare Products ({products.length})</div>
          <div className="flex gap-2">
            {products.map(p => (
              <button key={p.id} className="text-xs border rounded px-2 py-1" onClick={()=>onRemove(p.id)}>
                Remove {p.name}
              </button>
            ))}
            <button className="text-xs border rounded px-2 py-1" onClick={onClear}>Clear</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {headers.map(h => <th key={h} className="text-left p-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  {headers.map(h => <td key={h} className="p-2 align-top">{r[h]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

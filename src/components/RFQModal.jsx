import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function RFQModal({ product, onClose }) {
  const { createRFQ } = useAppStore();
  const [qty, setQty] = useState(1);
  const [specs, setSpecs] = useState("");
  const [target, setTarget] = useState("");

  const submit = () => {
    createRFQ({
      items: [{ productId: product.id, qty: Number(qty), specs }],
      targetPrice: target === "" ? null : Number(target),
      note: "",
    });
    onClose?.();
    alert("RFQ submitted!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Request Quote — {product.name}</div>
        <div>
          <label className="block text-xs text-gray-600">Quantity</label>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)}
                 className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Specs / Notes</label>
          <textarea value={specs} onChange={(e) => setSpecs(e.target.value)}
                    className="border rounded px-2 py-1 w-full h-20" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Target Price (optional)</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)}
                 className="border rounded px-2 py-1 w-full" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="border px-3 py-1 rounded">Cancel</button>
          <button onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded">Submit RFQ</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function RFQModal({ product, onClose }) {
  const { createRFQ, getTierPrice } = useAppStore();
  const [qty, setQty] = useState(product.moq || 1);
  const [specs, setSpecs] = useState("");
  const [targetPrice, setTargetPrice] = useState(getTierPrice(product, qty));

  const submit = () => {
    if (qty < (product.moq || 1)) return alert(`MOQ is ${product.moq}`);
    if (qty % (product.cartonMultiple || 1) !== 0)
      return alert(`Quantity must be a multiple of ${product.cartonMultiple}`);
    createRFQ({ productId: product.id, qty, specs, targetPrice });
    onClose?.();
    alert("RFQ submitted!");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-3">Request Quote — {product.name}</h2>

        <label className="block text-sm">Quantity (MOQ {product.moq}, multiple of {product.cartonMultiple})</label>
        <input
          type="number"
          min={product.moq || 1}
          value={qty}
          onChange={(e) => setQty(Math.max(product.moq || 1, Number(e.target.value) || 1))}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <label className="block text-sm">Specs / Notes</label>
        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <label className="block text-sm">Target Price (per unit)</label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white">Submit RFQ</button>
        </div>
      </div>
    </div>
  );
}

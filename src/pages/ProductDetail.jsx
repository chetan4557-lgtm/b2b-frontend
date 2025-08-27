import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAppStore } from "../context/AppStore";
import RFQModal from "../components/RFQModal";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, getTierPrice } = useAppStore();
  const [showRFQ, setShowRFQ] = useState(false);

  const product = useMemo(
    () => products.find((p) => String(p.id) === id),
    [id, products]
  );
  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
      <img src={product.image} alt={product.name} className="w-full h-80 object-cover rounded-lg" />
      <div>
        <h1 className="text-3xl font-bold mb-1">{product.name}</h1>
        <p className="text-gray-600 mb-3">{product.description}</p>
        <div className="mb-2 text-sm text-gray-700">HSN: {product.hsn}</div>
        <div className="mb-4">
          <div className="font-semibold">Tiered Pricing (per unit)</div>
          <div className="mt-1 text-sm">
            {product.tiers.map((t, i) => (
              <div key={i}>• {t.min}–{t.max}: ₹{t.price}</div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-700">
            MOQ: <b>{product.moq}</b> • Carton multiple: <b>{product.cartonMultiple}</b>
          </div>
          <div className="mt-2 text-sm">Example price @ MOQ: ₹{getTierPrice(product, product.moq)}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowRFQ(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            Request Quote
          </button>
          <a href="/messages" className="px-4 py-2 rounded border">Message Seller</a>
        </div>
      </div>

      {showRFQ && <RFQModal product={product} onClose={() => setShowRFQ(false)} />}
    </div>
  );
}

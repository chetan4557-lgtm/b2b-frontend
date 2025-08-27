import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(product.moq || 1);

  return (
    <div className="border p-4 rounded-lg shadow-md">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md mb-3" />
      )}

      <h2 className="text-xl font-bold">{product.name}</h2>
      <p className="text-gray-600">{product.description}</p>

      <p className="text-green-700 font-semibold mb-3">
        MOQ {product.moq} • Carton×{product.cartonMultiple}
      </p>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={product.moq || 1}
          step={product.cartonMultiple || 1}
          value={qty}
          onChange={(e) => setQty(Math.max(product.moq || 1, Number(e.target.value) || 1))}
          className="w-24 border rounded px-2 py-1"
        />
        <button
          onClick={() => {
            if (qty < (product.moq || 1)) return alert(`MOQ is ${product.moq}`);
            if (qty % (product.cartonMultiple || 1) !== 0)
              return alert(`Quantity must be a multiple of ${product.cartonMultiple}`);
            addToCart({ ...product, price: 0 }, qty); // price computed in Cart using tiers
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add to Cart
        </button>
        <Link to={`/products/${product.id}`} className="ml-auto text-blue-600 underline">
          View details
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { getProductImage, fallbackPlaceholder } from "../utils/imageService";

export default function ProductCard({ product }) {
  const moq = Number.isFinite(Number(product?.moq)) ? Number(product.moq) : 1;
  const carton = Number.isFinite(Number(product?.cartonMultiple)) ? Number(product.cartonMultiple) : 1;
  const src = getProductImage(product);

  return (
    <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
      <Link to={`/products/${product.id}`} className="block w-full">
        <div className="aspect-[4/3] bg-gray-100 w-full overflow-hidden">
          <img
            src={src}
            alt={product?.name || "Product"}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.src = fallbackPlaceholder(800, 600, product?.name || "Product"))}
          />
        </div>
      </Link>

      <div className="p-3">
        <div className="font-semibold text-lg truncate" title={product?.name}>
          {product?.name || "Unnamed product"}
        </div>
        <div className="text-sm text-gray-600">
          MOQ {moq} • Carton×{carton}
        </div>
      </div>
    </div>
  );
}

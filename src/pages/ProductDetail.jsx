import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";

const N = globalThis.Number;
const isFin = (v) => N.isFinite(N(v));
const nOr = (v, f) => (isFin(v) ? N(v) : f);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getTierPrice } = useAppStore();
  const { addToCart } = useContext(CartContext);

  const product = products.find((p) => String(p.id) === String(id));

  // ---- Fallbacks / gallery ----
  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    return product.image ? [product.image] : [];
  }, [product]);

  const [activeIdx, setActiveIdx] = useState(0);

  // ---- Variations (optional; safe if not present) ----
  const colors = product?.options?.colors || [];
  const sizes = product?.options?.sizes || [];
  const [color, setColor] = useState(colors[0] || null);
  const [size, setSize] = useState(sizes[0] || null);

  // ---- Quantity with MOQ / carton multiple ----
  const moq = nOr(product?.moq, 1);
  const multiple = nOr(product?.cartonMultiple, 1);
  const [qty, setQty] = useState(moq);

  const normalizedQty = useMemo(() => {
    // Enforce MOQ and carton multiple
    let q = nOr(qty, moq);
    if (q < moq) q = moq;
    if (multiple > 1) {
      const rem = q % multiple;
      if (rem !== 0) q = q + (multiple - rem);
    }
    return q;
  }, [qty, moq, multiple]);

  // ---- Pricing ----
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const p = getTierPrice(product, normalizedQty);
    return isFin(p) ? p : 0;
  }, [product, normalizedQty, getTierPrice]);

  const tiers = Array.isArray(product?.tiers) ? product.tiers : [];

  // ---- Actions ----
  const doAdd = () => {
    // We keep cart API signature as { id, qty }
    addToCart({ id: product.id, qty: normalizedQty });
  };

  const startOrder = () => {
    doAdd();
    navigate("/checkout");
  };

  const chatNow = () => {
    navigate("/messages");
  };

  if (!product) {
    return <div className="p-6">Product not found.</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left thumbs */}
        <div className="lg:col-span-2">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[520px] pr-1">
            {gallery.length === 0 && (
              <div className="w-20 h-20 border rounded flex items-center justify-center text-xs text-gray-500">
                No Image
              </div>
            )}
            {gallery.map((src, i) => (
              <button
                key={i}
                className={`w-20 h-20 border rounded overflow-hidden shrink-0 ${
                  i === activeIdx ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setActiveIdx(i)}
                title="Preview"
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main image */}
        <div className="lg:col-span-6">
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {gallery[activeIdx] ? (
              <img
                src={gallery[activeIdx]}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Product spotlights / description */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Product description</h2>
            <p className="text-gray-700">
              {product?.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-4">
          <div className="border rounded-xl p-4 bg-white space-y-4">
            <h1 className="text-2xl font-bold">{product?.name}</h1>

            {/* Tier prices summary */}
            {tiers.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Tiered Pricing</div>
                <div className="flex flex-wrap gap-2">
                  {tiers.map((t, i) => (
                    <div
                      key={i}
                      className="rounded border px-3 py-1 text-sm"
                      title={`${t.min}-${t.max === Infinity ? "∞" : t.max} units`}
                    >
                      <span className="font-medium">
                        ₹{nOr(t.price, 0).toLocaleString()}
                      </span>{" "}
                      <span className="text-gray-600">
                        {nOr(t.min, 1)}–{t.max === Infinity ? "∞" : nOr(t.max, "")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Price on request</div>
            )}

            {/* Variations */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-3">
                {colors.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`px-3 py-1 rounded border text-sm ${
                            c === color ? "bg-blue-600 text-white" : "bg-white"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Size</div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`px-3 py-1 rounded border text-sm ${
                            s === size ? "bg-blue-600 text-white" : "bg-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MOQ / multiples / qty */}
            <div className="space-y-1 text-sm text-gray-700">
              <div>HSN: {product?.hsn || "—"}</div>
              <div>
                MOQ: <span className="font-medium">{moq}</span> • Carton multiple:{" "}
                <span className="font-medium">{multiple}</span> • Lead:{" "}
                <span className="font-medium">{nOr(product?.leadDays, 0)}d</span>
              </div>
            </div>

            {/* Quantity + Unit price */}
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  min={moq}
                  step={multiple || 1}
                  value={qty}
                  onChange={(e) => setQty(N(e.target.value))}
                  className="mt-1 w-28 border rounded px-3 py-2"
                />
                {multiple > 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Order in multiples of {multiple}
                  </div>
                )}
                {normalizedQty !== qty && (
                  <div className="text-xs text-orange-600 mt-1">
                    Adjusted to {normalizedQty} to meet MOQ/multiple.
                  </div>
                )}
              </div>

              <div className="ml-auto text-right">
                <div className="text-sm text-gray-600">Unit price</div>
                <div className="text-xl font-semibold">
                  ₹{nOr(unitPrice, 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                onClick={startOrder}
              >
                Start order
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={doAdd}
              >
                Add to cart
              </button>
              <button
                className="border px-4 py-2 rounded"
                onClick={chatNow}
              >
                Chat now
              </button>
            </div>

            {/* Shipping (placeholder) */}
            <div className="pt-3 text-sm text-gray-600 border-t">
              <div className="font-medium mb-1">Shipping</div>
              <div>
                Enter your address at checkout to see delivery ETA and costs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

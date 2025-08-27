export default function Filters({
  q, onQ,
  minMOQ, onMinMOQ,
  maxLead, onMaxLead,
  priceRange, onPriceRange
}) {
  return (
    <div className="mb-6 border rounded-xl p-4 bg-white shadow-sm">
      <div className="grid md:grid-cols-5 gap-3">
        <input
          value={q}
          onChange={(e)=>onQ(e.target.value)}
          placeholder="Search products…"
          className="border rounded px-3 py-2"
        />
        <div>
          <label className="block text-xs text-gray-600 mb-1">Min MOQ</label>
          <input
            type="number"
            min={1}
            value={minMOQ}
            onChange={(e)=>onMinMOQ(Math.max(1, Number(e.target.value)||1))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Max Lead Days</label>
          <input
            type="number"
            min={0}
            value={maxLead}
            onChange={(e)=>onMaxLead(Math.max(0, Number(e.target.value)||0))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="w-full">
            <label className="block text-xs text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e)=>onPriceRange([Number(e.target.value)||0, priceRange[1]])}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e)=>onPriceRange([priceRange[0], Number(e.target.value)||0])}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
        <button
          onClick={()=>{
            onQ("");
            onMinMOQ(1);
            onMaxLead(999);
            onPriceRange([0, 999999]);
          }}
          className="self-end border rounded px-3 py-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

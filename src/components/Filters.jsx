export default function Filters({ q, onQ }) {
  const clear = () => onQ?.("");

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm border rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* Short, neat search box */}
        <input
          type="text"
          value={q || ""}
          onChange={(e) => onQ?.(e.target.value)}
          placeholder="Search products..."
          className="w-60 md:w-72 border rounded px-4 py-2"
        />
        <button
          type="button"
          onClick={clear}
          className="border px-3 py-2 rounded"
          title="Clear search"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

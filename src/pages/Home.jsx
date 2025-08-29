import { Link } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { getCategoryImage, getProductImage, fallbackPlaceholder } from "../utils/imageService";

// Fixed list of featured categories
const CATEGORIES = [
  { key: "Mixers", cat: "mixers" },
  { key: "Ovens", cat: "ovens" },
  { key: "Cold Storage & Freezers", cat: "fridges" },
  { key: "Dishwashers", cat: "dishwashers" },
  { key: "Cooktops & Ranges", cat: "cooktops" },
  { key: "Prep Tables & Sinks", cat: "prep" },
  { key: "Storage & Racks", cat: "storage" },
  { key: "Smallwares", cat: "smallwares" },
];

const canSeeRFQs = (user) =>
  !!user && ["buyer", "approver", "accounting", "admin"].includes(user.role);

function CatCard({ c }) {
  const src = getCategoryImage(c.cat);
  return (
    <Link
      to={`/products?cat=${encodeURIComponent(c.cat)}&limit=5`}
      className="block rounded-2xl overflow-hidden border bg-white hover:shadow transition"
    >
      <div className="aspect-[16/9] bg-gray-100">
        <img
          src={src}
          alt={c.key}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = fallbackPlaceholder(1200, 675, c.key))}
        />
      </div>
      <div className="p-4 font-semibold">{c.key}</div>
    </Link>
  );
}

function PickCard({ p }) {
  const src = getProductImage(p);
  return (
    <Link to={`/products/${p.id}`} className="block border rounded-2xl overflow-hidden hover:shadow bg-white">
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={src}
          alt={p.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = fallbackPlaceholder(800, 600, p.name || "Product"))}
        />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-500">{(p.category || "").toString().toUpperCase()}</div>
        <div className="font-semibold">{p.name}</div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { currentUser, orders, rfqs, lists, products } = useAppStore();

  const pendingRFQs      = rfqs.filter(r => r.status === "OPEN" || r.status === "QUOTED").length;
  const pendingApprovals = orders.filter(o => o.status === "PENDING_APPROVAL").length;
  const shipped          = orders.filter(o => o.status === "SHIPPED").length;

  const picks = (products || []).slice(0, 8);

  return (
    <div className="p-6 space-y-8">
      {/* HERO */}
      <section className="bg-blue-600 text-white rounded-2xl p-8 shadow">
        <h1 className="text-3xl font-bold">Buy Direct from Manufacturers</h1>
        <p className="mt-2 opacity-90">Bulk pricing, RFQs, approvals, and GST-ready checkout.</p>

        <div className="mt-4 flex gap-3">
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded font-semibold">
            Shop Now
          </Link>

          {!currentUser && (
            <Link to="/register" className="inline-flex items-center gap-2 border border-white/80 px-5 py-2 rounded font-semibold hover:bg-blue-500/20">
              Create account
            </Link>
          )}

          {canSeeRFQs(currentUser) && (
            <Link to="/rfqs" className="inline-flex items-center gap-2 border border-white/80 px-5 py-2 rounded font-semibold hover:bg-blue-500/20">
              Manage RFQs
            </Link>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <h2 className="text-xl font-bold mb-3">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => <CatCard key={c.key} c={c} />)}
        </div>
      </section>

      {/* Top Picks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Top Picks</h2>
          <Link to="/products" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {picks.map((p) => <PickCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Your Activity — ONLY when signed in */}
      {currentUser && (
        <section>
          <h2 className="text-xl font-bold mb-3">Your Activity</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Widget label="Open/Quoted RFQs" value={pendingRFQs} />
            <Widget label="Orders Pending Approval" value={pendingApprovals} />
            <Widget label="Shipments in Transit" value={shipped} />
            <Widget label="Saved Lists" value={lists.length} />
          </div>
        </section>
      )}
    </div>
  );
}

function Widget({ label, value }) {
  return (
    <div className="border rounded-2xl p-5 bg-white shadow-sm">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}

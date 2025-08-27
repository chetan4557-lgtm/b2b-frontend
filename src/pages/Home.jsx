import { Link } from "react-router-dom";
import { useAppStore } from "../context/AppStore";

export default function Home() {
  const { orders, rfqs, lists, products } = useAppStore();

  // Simple featured "categories" from product name keywords (demo)
  const categories = [
    { key: "Mixers", match: "Mixer", img: "/images/mixer.jpg", href: "/products?q=mixer" },
    { key: "Ovens", match: "Oven", img: "/images/oven.jpg", href: "/products?q=oven" },
    { key: "Cutters", match: "Cutting", img: "/images/cutter.jpg", href: "/products?q=cutting" },
  ].filter(c => products.some(p => (p.name || "").toLowerCase().includes(c.match.toLowerCase())));

  const pendingRFQs = rfqs.filter(r => r.status === "OPEN" || r.status === "QUOTED").length;
  const pendingApprovals = orders.filter(o => o.status === "PENDING_APPROVAL").length;
  const shipped = orders.filter(o => o.status === "SHIPPED").length;

  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      <section className="bg-blue-600 text-white rounded-2xl p-8 shadow">
        <h1 className="text-3xl font-bold">Buy Direct from Manufacturers</h1>
        <p className="mt-2 opacity-90">Bulk pricing, RFQs, approvals, and GST-ready checkout.</p>
        <div className="mt-4 flex gap-3">
          <Link to="/products" className="bg-white text-blue-700 px-4 py-2 rounded font-semibold">
            Shop Now
          </Link>
          <Link to="/rfqs" className="border border-white px-4 py-2 rounded">
            Manage RFQs
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-bold mb-3">Quick Links</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link className="border rounded-xl p-4 hover:shadow" to="/orders">My Orders</Link>
          <Link className="border rounded-xl p-4 hover:shadow" to="/rfqs">My RFQs</Link>
          <Link className="border rounded-xl p-4 hover:shadow" to="/lists">Saved Lists</Link>
          <Link className="border rounded-xl p-4 hover:shadow" to="/company">Company Account</Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <h2 className="text-xl font-bold mb-3">Featured Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <Link key={c.key} to={c.href} className="block border rounded-2xl overflow-hidden hover:shadow">
              <img src={c.img} alt={c.key} className="w-full h-40 object-cover" />
              <div className="p-4 font-semibold">{c.key}</div>
            </Link>
          ))}
          {categories.length === 0 && <div className="text-gray-600">No featured categories yet.</div>}
        </div>
      </section>

      {/* Dashboard-ish widgets */}
      <section>
        <h2 className="text-xl font-bold mb-3">Your Activity</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Widget label="Open/Quoted RFQs" value={pendingRFQs} />
          <Widget label="Orders Pending Approval" value={pendingApprovals} />
          <Widget label="Shipments in Transit" value={shipped} />
          <Widget label="Saved Lists" value={lists.length} />
        </div>
      </section>
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

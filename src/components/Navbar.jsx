import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAppStore } from "../context/AppStore";

const canSeeRFQs = (user) =>
  !!user && ["buyer", "approver", "accounting", "admin"].includes(user.role);

export default function Navbar() {
  const { count } = useContext(CartContext);
  const { pathname } = useLocation();
  const { currentUser, signOut } = useAppStore();
  const nav = useNavigate();

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-1 rounded hover:bg-blue-500/20 ${pathname === to ? "font-semibold underline" : ""}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">B2B Market</Link>

      <div className="flex items-center gap-2">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>

        {/* RFQs visible only for buyer/approver/accounting/admin */}
        {canSeeRFQs(currentUser) && <NavLink to="/rfqs">RFQs</NavLink>}

        {/* Seller portal link remains for sellers/admins, if you added it */}
        {(currentUser?.role === "seller" || currentUser?.role === "admin") && (
          <NavLink to="/seller/products">My Products</NavLink>
        )}

        {!currentUser ? (
          <Link
            to="/login"
            className={`px-3 py-1 rounded bg-white text-blue-700 hover:bg-blue-100 ${pathname === "/login" ? "font-semibold underline" : ""}`}
          >
            Sign in
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-white/15">
              {currentUser.name} <span className="opacity-80">({currentUser.role})</span>
            </span>
            <button
              onClick={() => { signOut(); nav("/"); }}
              className="px-3 py-1 rounded hover:bg-blue-500/20"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        )}

        <Link to="/cart" className="relative px-3 py-1 rounded hover:bg-blue-500/20">
          Cart
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {count}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

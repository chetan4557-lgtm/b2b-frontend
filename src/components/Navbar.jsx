import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Navbar() {
  const { count } = useContext(CartContext);
  const { pathname } = useLocation();

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
      <div className="flex items-center gap-4">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
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

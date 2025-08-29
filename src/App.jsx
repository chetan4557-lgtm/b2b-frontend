import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./pages/Checkout";
import RFQs from "./pages/RFQs";
import Company from "./pages/Company";
import Lists from "./pages/Lists";
import AdminProducts from "./pages/AdminProducts";
import AdminRFQs from "./pages/AdminRFQs";
import AdminOrders from "./pages/AdminOrders";
import AddressBook from "./pages/AddressBook";
import Orders from "./pages/Orders";
import RMA from "./pages/RMA";
import Messages from "./pages/Messages";
import Login from "./pages/Login";

import SellerProducts from "./pages/SellerProducts";

import { CartProvider } from "./context/CartContext";
import { AppStoreProvider } from "./context/AppStore";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireRole from "./components/RequireRole";
import Register from "./pages/Register";

export default function App() {
  return (
    <AppStoreProvider>
      <CartProvider>
        <ErrorBoundary>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/rfqs" element={<RFQs />} />
              <Route path="/company" element={<Company />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/address-book" element={<AddressBook />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/rma" element={<RMA />} />
              <Route path="/messages" element={<Messages />} />
	      <Route path="/register" element={<Register />} />

              {/* Seller portal */}
              <Route
                path="/seller/products"
                element={
                  <RequireRole allow={["seller", "admin"]}>
                    <SellerProducts />
                  </RequireRole>
                }
              />

              {/* Admin area (optional) */}
              <Route
                path="/admin/products"
                element={
                  <RequireRole allow={["admin"]}>
                    <AdminProducts />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/rfqs"
                element={
                  <RequireRole allow={["admin"]}>
                    <AdminRFQs />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <RequireRole allow={["admin"]}>
                    <AdminOrders />
                  </RequireRole>
                }
              />
            </Routes>
          </Router>
        </ErrorBoundary>
      </CartProvider>
    </AppStoreProvider>
  );
}

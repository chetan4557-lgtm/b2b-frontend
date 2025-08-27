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
import AddressBook from "./pages/AddressBook";
import Orders from "./pages/Orders";
import RMA from "./pages/RMA";
import Messages from "./pages/Messages";
import { CartProvider } from "./context/CartContext";
import { AppStoreProvider } from "./context/AppStore";

export default function App() {
  return (
    <AppStoreProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/company" element={<Company />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/address-book" element={<AddressBook />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </Router>
      </CartProvider>
    </AppStoreProvider>
  );
}

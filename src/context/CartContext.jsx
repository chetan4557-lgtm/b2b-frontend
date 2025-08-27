import { createContext, useEffect, useMemo, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p);
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) =>
    setCart(prev => prev.filter(p => p.id !== id));

  const inc = (id) =>
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p));

  const dec = (id) =>
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p));

  const clear = () => setCart([]);

  const { count, total } = useMemo(() => ({
    count: cart.reduce((n, p) => n + p.qty, 0),
    total: cart.reduce((sum, p) => sum + p.price * p.qty, 0),
  }), [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, inc, dec, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

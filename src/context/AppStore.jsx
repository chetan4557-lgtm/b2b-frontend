// src/context/AppStore.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppStore = createContext(null);
export const useAppStore = () => useContext(AppStore);

// -------------- localStorage helpers --------------
const safeLoad = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
const safeSave = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// Keys
const LS_PRODUCTS  = "b2b.products";
const LS_RFQS      = "b2b.rfqs";
const LS_ORDERS    = "b2b.orders";
const LS_LISTS     = "b2b.lists";
const LS_MESSAGES  = "b2b.messages";
const LS_ADDRESSES = "b2b.addresses";
const LS_ORG       = "b2b.org";

// -------------- Seed products (images: Unsplash Source) --------------
// We use `https://source.unsplash.com/800x600/?<query>&sig=<n>`
// These are stable and always return a relevant image.
const img = {
  mixer: (n) => `https://source.unsplash.com/800x600/?kitchen-mixer,stand-mixer&sig=${n}`,
  oven: (n) => `https://source.unsplash.com/800x600/?oven,kitchen,commercial&sig=${n}`,
  fridge: (n) => `https://source.unsplash.com/800x600/?fridge,freezer,commercial&sig=${n}`,
  dishwasher: (n) => `https://source.unsplash.com/800x600/?dishwasher,kitchen,industrial&sig=${n}`,
  cooktop: (n) => `https://source.unsplash.com/800x600/?stove,cooktop,range&sig=${n}`,
  prep: (n) => `https://source.unsplash.com/800x600/?stainless,sink,worktable&sig=${n}`,
  storage: (n) => `https://source.unsplash.com/800x600/?storage,shelf,rack&sig=${n}`,
  smallwares: (n) => `https://source.unsplash.com/800x600/?kitchen,utensils,tools&sig=${n}`,
};

const seedProducts = [
  // Mixers (5)
  {
    id: 1, name: "ProLine 20L Planetary Mixer", description: "Heavy duty planetary mixer 20L",
    hsn: "850940", category: "mixers", moq: 1, cartonMultiple: 1, leadDays: 3,
    tiers: [{ min:1, max:9, price: 68500 }, { min:10, max:49, price: 64900 }, { min:50, max: Infinity, price: 61500 }],
    image: img.mixer(1),
  },
  {
    id: 2, name: "Spiral Dough Mixer 50L", description: "High torque spiral mixer 50L",
    hsn: "850940", category: "mixers", moq: 1, cartonMultiple: 1, leadDays: 5,
    tiers: [{ min:1, max:4, price: 124000 }, { min:5, max:19, price: 119500 }, { min:20, max: Infinity, price: 115000 }],
    image: img.mixer(2),
  },
  {
    id: 18, name: "Planetary Mixer 10L", description: "Compact planetary mixer 10L",
    hsn: "850940", category: "mixers", moq: 1, cartonMultiple: 1, leadDays: 3,
    tiers: [{ min:1, max:9, price: 48500 }, { min:10, max:49, price: 45900 }, { min:50, max: Infinity, price: 43900 }],
    image: img.mixer(3),
  },
  {
    id: 21, name: "Planetary Mixer 30L", description: "Heavy-duty planetary mixer 30L",
    hsn: "850940", category: "mixers", moq: 1, cartonMultiple: 1, leadDays: 4,
    tiers: [{ min:1, max:9, price: 89500 }, { min:10, max:49, price: 86500 }, { min:50, max: Infinity, price: 83500 }],
    image: img.mixer(4),
  },
  {
    id: 22, name: "Spiral Mixer 20L", description: "Compact spiral dough mixer 20L",
    hsn: "850940", category: "mixers", moq: 1, cartonMultiple: 1, leadDays: 4,
    tiers: [{ min:1, max:9, price: 76500 }, { min:10, max:49, price: 73900 }, { min:50, max: Infinity, price: 71500 }],
    image: img.mixer(5),
  },

  // Ovens
  {
    id: 3, name: "Convection Oven – 6 Pan", description: "Commercial convection oven 6 GN pans",
    hsn: "851660", category: "ovens", moq: 1, cartonMultiple: 1, leadDays: 4,
    tiers: [{ min:1, max:4, price: 158000 }, { min:5, max:19, price: 152000 }, { min:20, max: Infinity, price: 146000 }],
    image: img.oven(1),
  },
  {
    id: 4, name: "Deck Oven – Double Deck", description: "Stone deck electric oven",
    hsn: "851660", category: "ovens", moq: 1, cartonMultiple: 1, leadDays: 6,
    tiers: [{ min:1, max:4, price: 275000 }, { min:5, max:19, price: 262000 }, { min:20, max: Infinity, price: 249000 }],
    image: img.oven(2),
  },
  {
    id: 19, name: "Combi Oven 10GN", description: "Steam + convection combi oven",
    hsn: "851660", category: "ovens", moq: 1, cartonMultiple: 1, leadDays: 7,
    tiers: [{ min:1, max:2, price: 498000 }, { min:3, max:9, price: 479000 }, { min:10, max: Infinity, price: 465000 }],
    image: img.oven(3),
  },

  // Fridges / Cold Storage
  {
    id: 5, name: "Upright Freezer 1200L", description: "Double door upright freezer 1200 litres",
    hsn: "841810", category: "fridges", moq: 1, cartonMultiple: 1, leadDays: 5,
    tiers: [{ min:1, max:4, price: 139000 }, { min:5, max:19, price: 133000 }, { min:20, max: Infinity, price: 127000 }],
    image: img.fridge(1),
  },
  {
    id: 6, name: "Blast Chiller 5 Tray", description: "Rapid chilling for 5 GN trays",
    hsn: "841869", category: "fridges", moq: 1, cartonMultiple: 1, leadDays: 7,
    tiers: [{ min:1, max:2, price: 225000 }, { min:3, max:9, price: 215000 }, { min:10, max: Infinity, price: 205000 }],
    image: img.fridge(2),
  },
  {
    id: 20, name: "Glass Door Display Chiller 900L", description: "Two-door display chiller",
    hsn: "841821", category: "fridges", moq: 1, cartonMultiple: 1, leadDays: 5,
    tiers: [{ min:1, max:4, price: 118000 }, { min:5, max:19, price: 112000 }, { min:20, max: Infinity, price: 106000 }],
    image: img.fridge(3),
  },

  // Dishwashers
  {
    id: 7, name: "Hood Type Dishwasher", description: "Pass-through commercial dishwasher",
    hsn: "842211", category: "dishwashers", moq: 1, cartonMultiple: 1, leadDays: 3,
    tiers: [{ min:1, max:4, price: 165000 }, { min:5, max:19, price: 158000 }, { min:20, max: Infinity, price: 149000 }],
    image: img.dishwasher(1),
  },
  {
    id: 8, name: "Rack Conveyor Dishwasher", description: "High throughput dishwasher for kitchens",
    hsn: "842211", category: "dishwashers", moq: 1, cartonMultiple: 1, leadDays: 10,
    tiers: [{ min:1, max:2, price: 495000 }, { min:3, max:9, price: 475000 }, { min:10, max: Infinity, price: 459000 }],
    image: img.dishwasher(2),
  },

  // Cooktops / Ranges
  {
    id: 9, name: "4 Burner Range with Oven", description: "Gas range with integrated oven",
    hsn: "732111", category: "cooktops", moq: 1, cartonMultiple: 1, leadDays: 3,
    tiers: [{ min:1, max:9, price: 82000 }, { min:10, max:49, price: 79500 }, { min:50, max: Infinity, price: 77000 }],
    image: img.cooktop(1),
  },
  {
    id: 10, name: "Induction Cooktop – 5 Zone", description: "Energy efficient 5-zone induction",
    hsn: "851660", category: "cooktops", moq: 1, cartonMultiple: 1, leadDays: 4,
    tiers: [{ min:1, max:9, price: 99000 }, { min:10, max:49, price: 96000 }, { min:50, max: Infinity, price: 93000 }],
    image: img.cooktop(2),
  },

  // Prep
  {
    id: 11, name: "SS Prep Table 6ft", description: "Stainless-steel prep table 6 feet",
    hsn: "732393", category: "prep", moq: 1, cartonMultiple: 1, leadDays: 2,
    tiers: [{ min:1, max:9, price: 28500 }, { min:10, max:49, price: 26900 }, { min:50, max: Infinity, price: 25500 }],
    image: img.prep(1),
  },
  {
    id: 12, name: "Double Sink Unit", description: "Commercial double sink with splashback",
    hsn: "732410", category: "prep", moq: 1, cartonMultiple: 1, leadDays: 3,
    tiers: [{ min:1, max:9, price: 24500 }, { min:10, max:49, price: 23200 }, { min:50, max: Infinity, price: 21900 }],
    image: img.prep(2),
  },

  // Storage
  {
    id: 13, name: "Heavy Duty Storage Rack", description: "4-tier storage rack for kitchens",
    hsn: "732690", category: "storage", moq: 1, cartonMultiple: 1, leadDays: 2,
    tiers: [{ min:1, max:9, price: 21500 }, { min:10, max:49, price: 19900 }, { min:50, max: Infinity, price: 18900 }],
    image: img.storage(1),
  },
  {
    id: 14, name: "Ingredient Bin – 90L", description: "Food-grade ingredient storage bin",
    hsn: "392310", category: "storage", moq: 2, cartonMultiple: 2, leadDays: 2,
    tiers: [{ min:2, max:9, price: 7600 }, { min:10, max:49, price: 7300 }, { min:50, max: Infinity, price: 7000 }],
    image: img.storage(2),
  },

  // Smallwares
  {
    id: 15, name: "Chef Knife Set (8pc)", description: "Professional stainless knife set",
    hsn: "821192", category: "smallwares", moq: 1, cartonMultiple: 1, leadDays: 2,
    tiers: [{ min:1, max:19, price: 5400 }, { min:20, max:99, price: 5200 }, { min:100, max: Infinity, price: 4900 }],
    image: img.smallwares(1),
  },
  {
    id: 16, name: "Gastronorm Pans – Set", description: "GN pan set (various depths)",
    hsn: "732393", category: "smallwares", moq: 1, cartonMultiple: 1, leadDays: 2,
    tiers: [{ min:1, max:19, price: 3200 }, { min:20, max:99, price: 3000 }, { min:100, max: Infinity, price: 2800 }],
    image: img.smallwares(2),
  },
  {
    id: 17, name: "Measuring Set – SS", description: "Stainless measuring cups & spoons",
    hsn: "732393", category: "smallwares", moq: 1, cartonMultiple: 1, leadDays: 2,
    tiers: [{ min:1, max:19, price: 1600 }, { min:20, max:99, price: 1500 }, { min:100, max: Infinity, price: 1400 }],
    image: img.smallwares(3),
  },
];

// -------------- Provider --------------
export function AppStoreProvider({ children }) {
  const [products, setProducts] = useState(() => safeLoad(LS_PRODUCTS, seedProducts));
  useEffect(() => safeSave(LS_PRODUCTS, products), [products]);

  const [rfqs, setRfqs]           = useState(() => safeLoad(LS_RFQS, []));
  const [orders, setOrders]       = useState(() => safeLoad(LS_ORDERS, []));
  const [lists, setLists]         = useState(() => safeLoad(LS_LISTS, []));
  const [messages, setMessages]   = useState(() => safeLoad(LS_MESSAGES, {}));
  const [addresses, setAddresses] = useState(() =>
    safeLoad(LS_ADDRESSES, [
      { id: 1, name: "Main Warehouse", pincode: "560037", line1: "KR Puram", city: "Bengaluru", state: "KA" },
    ])
  );

  // Start signed OUT by default; includes a demo seller account.
  const [org, setOrg] = useState(() =>
    safeLoad(LS_ORG, {
      name: "Acme Kitchens Pvt Ltd",
      gstin: "",
      users: [
        { id: 1, name: "Buyer A", role: "buyer" },
        { id: 2, name: "Approver B", role: "approver" },
        { id: 3, name: "Accounting C", role: "accounting" },
        { id: 4, name: "Seller D", role: "seller" },
        // { id: 5, name: "Admin E", role: "admin" },
      ],
      currentUserId: null,
      approvalLimit: 50000,
      netTerms: "Net-30",
      creditLimit: 500000,
    })
  );

  useEffect(() => safeSave(LS_RFQS, rfqs), [rfqs]);
  useEffect(() => safeSave(LS_ORDERS, orders), [orders]);
  useEffect(() => safeSave(LS_LISTS, lists), [lists]);
  useEffect(() => safeSave(LS_MESSAGES, messages), [messages]);
  useEffect(() => safeSave(LS_ADDRESSES, addresses), [addresses]);
  useEffect(() => safeSave(LS_ORG, org), [org]);

  const currentUser = useMemo(
    () => org.users.find((u) => u.id === org.currentUserId) || null,
    [org]
  );

  // Helpers
  const getTierPrice = (product, qty) => {
    if (!product?.tiers?.length) return 0;
    for (const t of product.tiers) {
      const max = (t.max === "" || t.max == null) ? Infinity : t.max;
      if (qty >= t.min && qty <= max) return t.price;
    }
    return product.tiers.at(-1).price;
  };

  const addProduct    = (prod) => setProducts((prev) => [...prev, { ...prod, id: prod.id ?? Date.now() }]);
  const updateProduct = (prod) => setProducts((prev) => prev.map((p) => (String(p.id) === String(prod.id) ? prod : p)));
  const deleteProduct = (id)   => setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));

  const signIn  = (userId) => setOrg((prev) => ({ ...prev, currentUserId: Number(userId) }));
  const signOut = ()       => setOrg((prev) => ({ ...prev, currentUserId: null }));

  const value = useMemo(
    () => ({
      products, setProducts,
      rfqs, setRfqs,
      orders, setOrders,
      lists, setLists,
      messages, setMessages,
      addresses, setAddresses,
      org, setOrg,
      currentUser,
      getTierPrice,
      addProduct, updateProduct, deleteProduct,
      signIn, signOut,
    }),
    [products, rfqs, orders, lists, messages, addresses, org, currentUser]
  );

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

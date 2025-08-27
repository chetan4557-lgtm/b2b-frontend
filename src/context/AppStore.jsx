import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppStore = createContext();
export const useAppStore = () => useContext(AppStore);

const defaultProducts = [
  {
    id: 1,
    name: "Industrial Mixer",
    description: "Heavy duty mixer",
    hsn: "850940",
    moq: 1,
    cartonMultiple: 1,
    tiers: [
      { min: 1, max: 9, price: 15000 },
      { min: 10, max: 49, price: 14250 },
      { min: 50, max: 9999, price: 13500 },
    ],
    leadDays: 2,
    image: "/images/mixer.jpg",
  },
  {
    id: 2,
    name: "Oven",
    description: "Commercial baking oven",
    hsn: "851660",
    moq: 1,
    cartonMultiple: 1,
    tiers: [
      { min: 1, max: 4, price: 25000 },
      { min: 5, max: 19, price: 23800 },
      { min: 20, max: 9999, price: 22900 },
    ],
    leadDays: 3,
    image: "/images/oven.jpg",
  },
  {
    id: 3,
    name: "Cutting Machine",
    description: "Automatic cutter",
    hsn: "846510",
    moq: 2,
    cartonMultiple: 2,
    tiers: [
      { min: 2, max: 9, price: 10000 },
      { min: 10, max: 49, price: 9500 },
      { min: 50, max: 9999, price: 9000 },
    ],
    leadDays: 5,
    image: "/images/cutter.jpg",
  },
];

const load = (k, v) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : v;
  } catch {
    return v;
  }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const AppStoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() =>
    load("products", defaultProducts)
  );
  const [rfqs, setRfqs] = useState(() => load("rfqs", []));
  const [orders, setOrders] = useState(() => load("orders", []));
  const [messages, setMessages] = useState(() => load("messages", []));
  const [lists, setLists] = useState(() => load("lists", []));
  const [addresses, setAddresses] = useState(() =>
    load("addresses", [{ id: 1, name: "Main Warehouse", pincode: "560037", line1: "KR Puram", city: "Bengaluru", state: "KA" }])
  );
  const [org, setOrg] = useState(() =>
    load("org", {
      name: "Acme Kitchens Pvt Ltd",
      gstin: "",
      users: [
        { id: 1, name: "Buyer A", role: "buyer" },
        { id: 2, name: "Approver B", role: "approver" },
        { id: 3, name: "Accounting C", role: "accounting" },
      ],
      currentUserId: 1,
      approvalLimit: 50000, // INR
      netTerms: "Net-30",
      creditLimit: 500000,
    })
  );

  useEffect(() => save("products", products), [products]);
  useEffect(() => save("rfqs", rfqs), [rfqs]);
  useEffect(() => save("orders", orders), [orders]);
  useEffect(() => save("messages", messages), [messages]);
  useEffect(() => save("lists", lists), [lists]);
  useEffect(() => save("addresses", addresses), [addresses]);
  useEffect(() => save("org", org), [org]);

  const currentUser = useMemo(
    () => org.users.find((u) => u.id === org.currentUserId),
    [org]
  );

  const getTierPrice = (product, qty) => {
    if (!product?.tiers?.length) return 0;
    const t = product.tiers.find((ti) => qty >= ti.min && qty <= ti.max) || product.tiers.at(-1);
    return t.price;
  };

  const api = {
    products,
    setProducts,
    rfqs,
    setRfqs,
    orders,
    setOrders,
    messages,
    setMessages,
    lists,
    setLists,
    addresses,
    setAddresses,
    org,
    setOrg,
    currentUser,
    getTierPrice,
    // RFQ helpers
    createRFQ: ({ productId, qty, specs, targetPrice }) => {
      const id = Date.now();
      setRfqs((r) => [
        ...r,
        {
          id,
          productId,
          qty,
          specs,
          targetPrice,
          status: "OPEN",
          quotes: [], // seller quotes / counters
          createdAt: new Date().toISOString(),
        },
      ]);
      return id;
    },
    addQuote: ({ rfqId, price, validUntil, note }) => {
      setRfqs((r) =>
        r.map((x) =>
          x.id === rfqId
            ? {
                ...x,
                quotes: [...x.quotes, { price, validUntil, note, at: new Date().toISOString() }],
                status: "QUOTED",
              }
            : x
        )
      );
    },
    acceptQuoteToOrder: ({ rfqId, quoteIndex, addressId, poInfo }) => {
      const rfq = rfqs.find((r) => r.id === rfqId);
      if (!rfq) return;
      const quote = rfq.quotes[quoteIndex];
      const product = products.find((p) => p.id === rfq.productId);
      const orderId = Date.now();
      setOrders((o) => [
        ...o,
        {
          id: orderId,
          from: "RFQ",
          rfqId,
          items: [
            { productId: product.id, name: product.name, hsn: product.hsn, qty: rfq.qty, unit: quote.price, image: product.image },
          ],
          addressId,
          status: "CONFIRMED",
          timeline: [{ at: new Date().toISOString(), status: "CONFIRMED" }],
          poInfo,
        },
      ]);
      setRfqs((r) => r.map((x) => (x.id === rfqId ? { ...x, status: "ORDERED" } : x)));
    },
  };

  return <AppStore.Provider value={api}>{children}</AppStore.Provider>;
};

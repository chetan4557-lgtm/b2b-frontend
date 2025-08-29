// Central place to pick the right image URL for categories & products.
// Strategy order: Unsplash Source (relevant keywords) -> Picsum -> Placeholder.

const SIZE_CAT = { w: 1200, h: 675 }; // 16:9 for category tiles
const SIZE_PROD = { w: 800, h: 600 }; // 4:3 for product cards

const KWORDS = {
  mixers: "kitchen-mixer,stand-mixer,commercial",
  ovens: "oven,bakery-oven,commercial-kitchen",
  fridges: "fridge,freezer,walk-in-cooler,commercial",
  dishwashers: "dishwasher,industrial,pass-through",
  cooktops: "stove,cooktop,range,gas-burner",
  prep: "stainless,worktable,kitchen-sink,prep-table",
  storage: "storage,shelf,rack,pantry,restaurant",
  smallwares: "kitchen,utensils,tools,gastronorm,pans",
};

// Pick keywords for a category; default to smallwares if unknown
export function keywordsForCategory(cat = "") {
  const k = String(cat || "").toLowerCase();
  return KWORDS[k] || KWORDS.smallwares;
}

// Deterministic seed so the same category/product shows the same photo
function seedFrom(obj) {
  try {
    const s = typeof obj === "string" ? obj : JSON.stringify(obj);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  } catch {
    return Math.floor(Math.random() * 1e9);
  }
}

// Primary Unsplash Source URL
function unsplashSource(keywords, w, h, seed) {
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keywords)}&sig=${seed}`;
}

// -------------- Public helpers --------------

// Category image (16:9)
export function getCategoryImage(cat) {
  const kw = keywordsForCategory(cat);
  const seed = seedFrom(`cat:${cat}`);
  const { w, h } = SIZE_CAT;
  return unsplashSource(kw, w, h, seed);
}

// Product image (4:3). If product.image exists, prefer that; else generate.
export function getProductImage(product = {}) {
  if (product?.image) return product.image;
  const kw = keywordsForCategory(product?.category);
  const seed = seedFrom(`prod:${product?.id || product?.name || "x"}`);
  const { w, h } = SIZE_PROD;
  return unsplashSource(kw, w, h, seed);
}

// Generic fallbacks for <img onError> handlers
export function fallbackPicsum(width, height, seed = "fallback") {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
export function fallbackPlaceholder(width, height, text = "Image") {
  return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(text)}`;
}

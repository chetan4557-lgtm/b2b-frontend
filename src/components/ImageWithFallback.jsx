import { useMemo, useState } from "react";

/**
 * A resilient <img> that tries:
 * 1) src (primary)
 * 2) picsum.photos (semantic size + seed)
 * 3) placehold.co with text
 */
export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  width = 1200,
  height = 675,
  seed = "fallback",
  text = "Image",
}) {
  // Ensure numeric
  const w = Number(width) || 1200;
  const h = Number(height) || 675;

  const fallbacks = useMemo(
    () => [
      src,
      `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`,
      `https://placehold.co/${w}x${h}?text=${encodeURIComponent(text)}`,
    ],
    [src, w, h, seed, text]
  );

  const [idx, setIdx] = useState(0);
  const current = fallbacks[idx];

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        setIdx((i) => (i + 1 < fallbacks.length ? i + 1 : i));
      }}
    />
  );
}

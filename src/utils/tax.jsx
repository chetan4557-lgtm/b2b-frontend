// src/utils/tax.js

// GSTIN structure validation (commonly used regex)
export function isValidGSTIN(gstin) {
  if (!gstin) return false;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  return re.test(String(gstin).toUpperCase());
}

// --- HSN → GST rate mapping (very simplified demo) ---
// In production, keep a proper table for your SKUs.
const HSN_RATE_MAP = [
  { match: /^84/, rate: 18 }, // Machinery etc.
  { match: /^85/, rate: 18 }, // Electrical machinery
  { match: /^90/, rate: 18 }, // Instruments
  { match: /^94/, rate: 18 }, // Furniture, lighting
  { match: /^96/, rate: 18 },
];

export function getHSNRate(hsn) {
  const s = String(hsn || "").trim();
  if (!s) return null;
  const row = HSN_RATE_MAP.find((r) => r.match.test(s));
  return row ? row.rate : null;
}

// Place-of-supply rule: same state => CGST+SGST, else IGST
export function splitTax(taxableAmount, gstRate, sellerState, buyerState) {
  const rate = Number(gstRate) || 0;
  const base = Number(taxableAmount) || 0;
  if (!buyerState) return { cgst: 0, sgst: 0, igst: base * (rate / 100) };
  if (String(buyerState).toUpperCase() === String(sellerState).toUpperCase()) {
    const half = (base * (rate / 100)) / 2;
    return { cgst: half, sgst: half, igst: 0 };
  }
  return { cgst: 0, sgst: 0, igst: base * (rate / 100) };
}

/**
 * Calculate taxes per line (supports per-line gstRate or inferred from HSN).
 *
 * @param {Array} items - [{ qty, unitPrice, hsn, name, gstRate? }, ...]
 * @param {Object} opts - { sellerState, buyerState, defaultRate=18 }
 */
export function calcOrderTaxes(items, opts = {}) {
  const {
    sellerState = "KA",
    buyerState,
    defaultRate = 18,
  } = opts;

  const lines = [];
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  for (const it of items) {
    const qty = Number(it.qty) || 0;
    const unit = Number(it.unitPrice);
    const taxable = Number.isFinite(unit) ? unit * qty : 0;

    // choose rate: explicit gstRate > inferred from HSN > default
    const inferred = getHSNRate(it.hsn);
    const rate = Number.isFinite(Number(it.gstRate))
      ? Number(it.gstRate)
      : (inferred ?? defaultRate);

    const { cgst, sgst, igst } = splitTax(taxable, rate, sellerState, buyerState);

    lines.push({
      ...it,
      gstRate: rate,
      taxableValue: taxable,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
    });

    taxableTotal += taxable;
    cgstTotal += cgst;
    sgstTotal += sgst;
    igstTotal += igst;
  }

  const taxTotal = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = taxableTotal + taxTotal;

  return {
    lines,
    totals: {
      taxableTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      taxTotal,
      grandTotal,
    },
  };
}

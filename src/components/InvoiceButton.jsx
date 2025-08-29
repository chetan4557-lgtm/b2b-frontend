// src/components/InvoiceButton.jsx
import { jsPDF } from "jspdf";

export default function InvoiceButton({ order, org, address, taxes }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    const y0 = 14;
    let y = y0;

    doc.setFontSize(14);
    doc.text("TAX INVOICE", 105, y, { align: "center" }); y += 8;

    doc.setFontSize(10);
    // Seller (you)
    doc.text(`Supplier: ${org?.name || "Your Company"}`, 14, y); y += 5;
    if (org?.gstin) { doc.text(`GSTIN: ${org.gstin}`, 14, y); y += 5; }

    // Buyer (shipping)
    doc.text(`Bill To: ${address?.name || "-"}`, 14, y); y += 5;
    doc.text(`Address: ${address?.line1 || "-"}, ${address?.city || "-"}, ${address?.state || "-"}`, 14, y); y += 5;

    // Order meta
    doc.text(`Order #: ${order?.id || "-"}`, 150, y0 + 8);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, y0 + 13);

    y += 3;
    doc.line(14, y, 196, y); y += 6;

    // Table header
    doc.setFont(undefined, "bold");
    doc.text("Item", 14, y);
    doc.text("HSN", 90, y);
    doc.text("Qty", 120, y);
    doc.text("Rate", 140, y);
    doc.text("Amount", 170, y);
    doc.setFont(undefined, "normal");
    y += 4; doc.line(14, y, 196, y); y += 5;

    // Lines
    for (const ln of taxes.lines) {
      const name = ln.name || ln.productId;
      doc.text(String(name).slice(0, 40), 14, y);
      doc.text(String(ln.hsn || "-"), 90, y);
      doc.text(String(ln.qty), 120, y);
      doc.text(Number.isFinite(+ln.unitPrice) ? `₹${ln.unitPrice}` : "POR", 140, y);
      doc.text(`₹${ln.taxableValue}`, 170, y);
      y += 6;

      // page break
      if (y > 270) {
        doc.addPage(); y = 14;
      }
    }

    y += 3; doc.line(14, y, 196, y); y += 6;

    // Taxes
    doc.text(`Taxable Value: ₹${taxes.totals.taxableTotal}`, 140, y); y += 6;
    doc.text(`CGST: ₹${taxes.totals.cgstTotal}`, 140, y); y += 6;
    doc.text(`SGST: ₹${taxes.totals.sgstTotal}`, 140, y); y += 6;
    doc.text(`IGST: ₹${taxes.totals.igstTotal}`, 140, y); y += 6;
    doc.setFont(undefined, "bold");
    doc.text(`Grand Total: ₹${taxes.totals.grandTotal}`, 140, y); y += 8;
    doc.setFont(undefined, "normal");

    doc.text("Thank you for your business!", 14, y);

    doc.save(`invoice_${order?.id || "draft"}.pdf`);
  };

  return (
    <button onClick={handleDownload} className="border px-3 py-1 rounded">
      Download Tax Invoice (PDF)
    </button>
  );
}

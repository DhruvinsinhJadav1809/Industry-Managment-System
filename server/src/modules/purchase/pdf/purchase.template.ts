import PDFDocument from "pdfkit";
import { PdfHelper } from "../../../shared/pdf/pdf.helper";
import { PdfTheme } from "../../../shared/pdf/pdf.theme";

export const buildPurchasePdf = (doc: PDFKit.PDFDocument, purchase: any) => {
  const left = PdfTheme.pageMargin;
  const right = doc.page.width - PdfTheme.pageMargin;
  const pageWidth = right - left;
  const center = doc.page.width / 2;

  let currentY = PdfTheme.headerHeight + 20;

  // ============================================================
  // STYLING HELPERS
  // ============================================================

  const drawHorizontalRule = (
    y: number,
    color: string = "#E5E7EB",
    width: number = pageWidth,
  ) => {
    doc
      .moveTo(left, y)
      .lineTo(left + width, y)
      .strokeColor(color)
      .lineWidth(0.5)
      .stroke();
  };

  const drawDottedRule = (y: number, color: string = "#D1D5DB") => {
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .dash(3, { space: 3 })
      .strokeColor(color)
      .lineWidth(0.5)
      .stroke();
    doc.undash();
  };

  // ============================================================
  // HEADER SECTION
  // ============================================================

  // Document title badge
  const titleWidth = 180;
  const titleHeight = 32;
  doc
    .roundedRect(center - titleWidth / 2, currentY, titleWidth, titleHeight, 4)
    .fill(PdfTheme.primary);

  doc.fillColor("white");
  doc.font("Helvetica-Bold");
  doc.fontSize(14);
  doc.text("PURCHASE INVOICE", center - titleWidth / 2, currentY + 9, {
    width: titleWidth,
    align: "center",
  });

  currentY += titleHeight + 20;

  // Company & Document Info Row
  const infoRowY = currentY;

  // Left: Company branding area (placeholder for logo/company name)
  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(16);
  doc.text("Industry Management System", left, infoRowY);

  doc.font("Helvetica");
  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);

  // Right: Invoice metadata box
  const metaBoxWidth = 200;
  const metaBoxX = right - metaBoxWidth;

  doc
    .roundedRect(metaBoxX, infoRowY - 5, metaBoxWidth, 85, 4)
    .fill("#F8FAFC")
    .strokeColor(PdfTheme.primary)
    .lineWidth(1)
    .stroke();

  doc.fillColor(PdfTheme.text);
  doc.fontSize(9);

  const metaLabelX = metaBoxX + 12;
  const metaValueX = metaBoxX + 85;

  doc.font("Helvetica-Bold");
  doc.text("Invoice #", metaLabelX, infoRowY + 8);
  doc.text("Purchase #", metaLabelX, infoRowY + 24);
  doc.text("Date", metaLabelX, infoRowY + 40);
  doc.text("Status", metaLabelX, infoRowY + 56);

  doc.font("Helvetica");
  doc.text(purchase.invoiceNumber ?? "-", metaValueX, infoRowY + 8);
  doc.text(purchase.purchaseNumber ?? "-", metaValueX, infoRowY + 24);
  doc.text(
    PdfHelper.date(new Date(purchase.purchaseDate)),
    metaValueX,
    infoRowY + 40,
  );

  // Status with color
  const status = purchase.status ?? "Pending";
  const statusColor =
    status === "Paid"
      ? "#059669"
      : status === "Cancelled"
        ? "#DC2626"
        : "#D97706";
  doc.fillColor(statusColor);
  doc.text(status, metaValueX, infoRowY + 56);

  currentY = infoRowY + 100;

  drawHorizontalRule(currentY);
  currentY += 15;

  // ============================================================
  // BILL TO / SUPPLIER SECTION
  // ============================================================

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  doc.text("SUPPLIER / BILL TO", left, currentY);

  doc.font("Helvetica");
  doc.fontSize(11);
  doc.fillColor("#111827");
  doc.text(
    purchase.supplierId?.name ?? purchase.supplier ?? "-",
    left,
    currentY + 16,
  );

  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);
  if (purchase.supplierId?.address) {
    doc.text(purchase.supplierId.address, left, currentY + 32);
  }
  if (purchase.supplierId?.phone || purchase.supplierId?.email) {
    const contact = [];
    if (purchase.supplierId?.phone) contact.push(purchase.supplierId.phone);
    if (purchase.supplierId?.email) contact.push(purchase.supplierId.email);
    doc.text(contact.join(" | "), left, currentY + 44);
  }

  // Remarks on the right
  if (purchase.remarks) {
    doc.fillColor(PdfTheme.text);
    doc.font("Helvetica-Bold");
    doc.fontSize(10);
    doc.text("REMARKS", metaBoxX, currentY);

    doc.font("Helvetica");
    doc.fontSize(9);
    doc.fillColor(PdfTheme.muted);
    doc.text(purchase.remarks, metaBoxX, currentY + 16, {
      width: metaBoxWidth,
      align: "left",
    });
  }

  currentY += 65;

  drawHorizontalRule(currentY);
  currentY += 20;

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  const tableWidth = pageWidth;
  const rowHeight = 32;
  const headerHeight = 36;

  // Column definitions (right-aligned for numeric columns)
  const colProduct = { x: left + 12, width: 210, align: "left" as const };
  const colQty = { x: left + 232, width: 35, align: "right" as const };
  const colRate = { x: left + 275, width: 75, align: "right" as const };
  const colGst = { x: left + 358, width: 35, align: "right" as const };
  const colTotal = { x: left + 390, width: 100, align: "right" as const };

  // Table Header
  doc
    .roundedRect(left, currentY, tableWidth, headerHeight, 4)
    .fill(PdfTheme.primary);

  doc.fillColor("white");
  doc.font("Helvetica-Bold");
  doc.fontSize(10);

  doc.text("PRODUCT", colProduct.x, currentY + 11, {
    width: colProduct.width,
    align: colProduct.align,
  });
  doc.text("QTY", colQty.x, currentY + 11, {
    width: colQty.width,
    align: colQty.align,
  });
  doc.text("RATE", colRate.x, currentY + 11, {
    width: colRate.width,
    align: colRate.align,
  });
  doc.text("GST", colGst.x, currentY + 11, {
    width: colGst.width,
    align: colGst.align,
  });
  doc.text("TOTAL", colTotal.x, currentY + 11, {
    width: colTotal.width,
    align: colTotal.align,
  });

  currentY += headerHeight;

  // Table Rows
  const items = purchase.items ?? [];

  items.forEach((item: any, index: number) => {
    const isLast = index === items.length - 1;
    const isEven = index % 2 === 0;

    // Background
    if (isEven) {
      const radius = isLast ? 4 : 0;
      if (radius) {
        doc
          .roundedRect(left, currentY, tableWidth, rowHeight, radius)
          .fill("#F9FAFB");
      } else {
        doc.rect(left, currentY, tableWidth, rowHeight).fill("#F9FAFB");
      }
    } else if (isLast) {
      doc.roundedRect(left, currentY, tableWidth, rowHeight, 4).fill("white");
    }

    // Bottom border for each row
    if (!isLast) {
      doc
        .moveTo(left + 10, currentY + rowHeight)
        .lineTo(right - 10, currentY + rowHeight)
        .strokeColor("#E5E7EB")
        .lineWidth(0.5)
        .stroke();
    }

    // Text content
    doc.fillColor(PdfTheme.text);
    doc.font("Helvetica");
    doc.fontSize(9.5);

    const productName =
      item.productName ?? item.product?.name ?? item.productId?.name ?? "-";
    const qty = String(item.quantity ?? 0);
    const rate = PdfHelper.money(item.unitPrice ?? 0);
    const gst = `${item.taxPercentage ?? 0}%`;
    const total = PdfHelper.money(
      item.total ?? item.totalAmount ?? item.lineTotal ?? 0,
    );

    // Product name with wrapping protection
    doc.text(productName, colProduct.x, currentY + 9, {
      width: colProduct.width,
      align: colProduct.align,
      lineBreak: false,
      ellipsis: true,
    });

    doc.font("Helvetica");
    doc.text(qty, colQty.x, currentY + 9, {
      width: colQty.width,
      align: colQty.align,
    });
    doc.text(rate, colRate.x, currentY + 9, {
      width: colRate.width,
      align: colRate.align,
    });
    doc.text(gst, colGst.x, currentY + 9, {
      width: colGst.width,
      align: colGst.align,
    });

    // Total in bold
    doc.font("Helvetica-Bold");
    doc.text(total, colTotal.x, currentY + 9, {
      width: colTotal.width,
      align: colTotal.align,
    });

    currentY += rowHeight;
  });

  // If no items, show empty state
  if (items.length === 0) {
    doc.roundedRect(left, currentY, tableWidth, rowHeight, 4).fill("#F9FAFB");
    doc.fillColor(PdfTheme.muted);
    doc.font("Helvetica-Oblique");
    doc.fontSize(10);
    doc.text("No items found", left, currentY + 10, {
      width: tableWidth,
      align: "center",
    });
    currentY += rowHeight;
  }

  currentY += 30;

  // ============================================================
  // TOTALS SECTION
  // ============================================================

  const totalsWidth = 240;
  const totalsX = right - totalsWidth;

  // Subtotal row
  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text("Subtotal", totalsX, currentY);
  doc.text(PdfHelper.money(purchase.subtotal ?? 0), totalsX + 140, currentY, {
    width: 90,
    align: "right",
  });

  currentY += 20;

  // Tax row
  doc.text("Tax", totalsX, currentY);
  doc.text(PdfHelper.money(purchase.taxAmount ?? 0), totalsX + 140, currentY, {
    width: 90,
    align: "right",
  });

  currentY += 20;

  // Discount row (only if > 0)
  const discount = purchase.discount ?? 0;
  if (discount > 0) {
    doc.fillColor("#DC2626"); // Red for discount
    doc.text("Discount", totalsX, currentY);
    doc.text(`-${PdfHelper.money(discount)}`, totalsX + 140, currentY, {
      width: 90,
      align: "right",
    });
    doc.fillColor(PdfTheme.text);
    currentY += 20;
  }

  // Separator line before grand total
  drawHorizontalRule(currentY, "#D1D5DB", totalsWidth);
  currentY += 12;

  // Grand Total Box
  const grandTotalBoxHeight = 38;
  doc
    .roundedRect(
      totalsX - 10,
      currentY - 6,
      totalsWidth + 10,
      grandTotalBoxHeight,
      5,
    )
    .fill(PdfTheme.primary);

  doc.fillColor("white");
  doc.font("Helvetica-Bold");
  doc.fontSize(12);
  doc.text("Grand Total", totalsX, currentY + 6);

  doc.fontSize(13);
  doc.text(
    PdfHelper.money(purchase.grandTotal ?? 0),
    totalsX + 140,
    currentY + 5,
    {
      width: 90,
      align: "right",
    },
  );

  currentY += grandTotalBoxHeight + 15;

  // ============================================================
  // AMOUNT IN WORDS (Optional but professional)
  // ============================================================

  if (purchase.grandTotal) {
    doc.fillColor(PdfTheme.muted);
    doc.font("Helvetica");
    doc.fontSize(9);
    const amountInWords = numberToWords(purchase.grandTotal);
    doc.text(`Amount in words: ${amountInWords}`, left, currentY, {
      width: pageWidth - totalsWidth - 30,
      align: "left",
    });
    currentY += 25;
  }

  // ============================================================
  // TERMS & SIGNATURE SECTION
  // ============================================================

  drawHorizontalRule(currentY);
  currentY += 20;

  // Two column layout for terms and signature
  const termsWidth = pageWidth * 0.55;

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  doc.text("Terms & Conditions", left, currentY);

  doc.font("Helvetica");
  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);
  doc.text(
    "Payment is due within 30 days of invoice date. Late payments subject to 1.5% monthly service charge. Goods remain property of seller until paid in full.",
    left,
    currentY + 16,
    { width: termsWidth, align: "left" },
  );

  // Signature area
  const sigX = right - 160;
  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  doc.text("Authorized Signature", sigX, currentY + 40, {
    width: 150,
    align: "center",
  });

  drawHorizontalRule(currentY + 35, PdfTheme.text, 150);

  currentY += 90;

  // ============================================================
  // FOOTER
  // ============================================================

  drawHorizontalRule(currentY, "#E5E7EB");
  currentY += 12;

  doc.fillColor(PdfTheme.muted);
  doc.font("Helvetica");
  doc.fontSize(8);

  doc.text("Generated by Industry Management System", left, currentY, {
    width: pageWidth,
    align: "center",
  });

  doc.text(
    `Generated On: ${PdfHelper.date(new Date())} | Page 1 of 1`,
    left,
    currentY + 14,
    {
      width: pageWidth,
      align: "center",
    },
  );
};

// ============================================================
// HELPER: Number to Words
// ============================================================

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanOneThousand(n % 100) : "")
    );
  };

  let result = "";
  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  if (wholePart >= 100000) {
    result +=
      convertLessThanOneThousand(Math.floor(wholePart / 100000)) + " Lakh ";
    num = wholePart % 100000;
  } else {
    num = wholePart;
  }

  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + " Thousand ";
    num = num % 1000;
  }

  result += convertLessThanOneThousand(num);

  if (decimalPart > 0) {
    result += ` and ${decimalPart} paisa`;
  }

  return result.trim() + " Only";
}

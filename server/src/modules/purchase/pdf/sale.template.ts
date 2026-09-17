import PDFKit from "pdfkit";
import { PdfHelper } from "../../../shared/pdf/pdf.helper";
import { PdfTheme } from "../../../shared/pdf/pdf.theme";

export const buildSalePdf = (doc: PDFKit.PDFDocument, sale: any) => {
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

  // ============================================================
  // HEADER SECTION
  // ============================================================

  const titleWidth = 180;
  const titleHeight = 32;

  doc
    .roundedRect(center - titleWidth / 2, currentY, titleWidth, titleHeight, 4)
    .fill(PdfTheme.primary);

  doc.fillColor("white");
  doc.font("Helvetica-Bold");
  doc.fontSize(14);

  doc.text("SALES INVOICE", center - titleWidth / 2, currentY + 9, {
    width: titleWidth,
    align: "center",
  });

  currentY += titleHeight + 20;

  // ============================================================
  // COMPANY & DOCUMENT INFO
  // ============================================================

  const infoRowY = currentY;

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(16);

  doc.text("Industry Management System", left, infoRowY);

  doc.font("Helvetica");
  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);

  // ============================================================
  // INVOICE META BOX
  // ============================================================

  const metaBoxWidth = 200;
  const metaBoxX = right - metaBoxWidth;

  doc
    .roundedRect(metaBoxX, infoRowY - 5, metaBoxWidth, 105, 4)
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
  doc.text("Sale #", metaLabelX, infoRowY + 24);
  doc.text("Date", metaLabelX, infoRowY + 40);
  doc.text("Payment", metaLabelX, infoRowY + 56);
  doc.text("Status", metaLabelX, infoRowY + 72);

  doc.font("Helvetica");

  doc.text(sale.invoiceNumber ?? "-", metaValueX, infoRowY + 8);

  doc.text(sale.saleNumber ?? "-", metaValueX, infoRowY + 24);

  doc.text(PdfHelper.date(new Date(sale.saleDate)), metaValueX, infoRowY + 40);

  doc.text(sale.paymentMethod ?? "-", metaValueX, infoRowY + 56);

  // ============================================================
  // PAYMENT STATUS
  // ============================================================

  const paymentStatus = sale.paymentStatus ?? "PENDING";

  const statusColor =
    paymentStatus === "PAID"
      ? "#059669"
      : paymentStatus === "PENDING"
        ? "#D97706"
        : "#2563EB";

  doc.fillColor(statusColor);

  doc.text(paymentStatus, metaValueX, infoRowY + 72);

  currentY = infoRowY + 120;

  drawHorizontalRule(currentY);

  currentY += 15;

  // ============================================================
  // CUSTOMER / BILL TO SECTION
  // ============================================================

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);

  doc.text("CUSTOMER / BILL TO", left, currentY);

  doc.font("Helvetica");
  doc.fontSize(11);
  doc.fillColor("#111827");

  doc.text(sale.customerName ?? "-", left, currentY + 16);

  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);

  if (sale.customerPhone) {
    doc.text(`Phone: ${sale.customerPhone}`, left, currentY + 34);
  }

  // ============================================================
  // NOTES
  // ============================================================

  if (sale.notes) {
    doc.fillColor(PdfTheme.text);
    doc.font("Helvetica-Bold");
    doc.fontSize(10);

    doc.text("NOTES", metaBoxX, currentY);

    doc.font("Helvetica");
    doc.fontSize(9);
    doc.fillColor(PdfTheme.muted);

    doc.text(sale.notes, metaBoxX, currentY + 16, {
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

  const colProduct = {
    x: left + 12,
    width: 210,
    align: "left" as const,
  };

  const colQty = {
    x: left + 232,
    width: 35,
    align: "right" as const,
  };

  const colRate = {
    x: left + 275,
    width: 75,
    align: "right" as const,
  };

  const colGst = {
    x: left + 358,
    width: 35,
    align: "right" as const,
  };

  const colTotal = {
    x: left + 390,
    width: 100,
    align: "right" as const,
  };

  // ============================================================
  // TABLE HEADER
  // ============================================================

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

  // ============================================================
  // TABLE ROWS
  // ============================================================

  const items = sale.items ?? [];

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

    // Bottom border
    if (!isLast) {
      doc
        .moveTo(left + 10, currentY + rowHeight)
        .lineTo(right - 10, currentY + rowHeight)
        .strokeColor("#E5E7EB")
        .lineWidth(0.5)
        .stroke();
    }

    // Text
    doc.fillColor(PdfTheme.text);
    doc.font("Helvetica");
    doc.fontSize(9.5);

    const productName =
      item.productName ?? item.product?.name ?? item.productId?.name ?? "-";

    const qty = String(item.quantity ?? 0);

    const rate = PdfHelper.money(item.rate ?? 0);

    const gst = `${item.gstPercentage ?? 0}%`;

    const total = PdfHelper.money(item.total ?? 0);

    // Product
    doc.text(productName, colProduct.x, currentY + 9, {
      width: colProduct.width,
      align: colProduct.align,
      lineBreak: false,
      ellipsis: true,
    });

    // Quantity
    doc.font("Helvetica");

    doc.text(qty, colQty.x, currentY + 9, {
      width: colQty.width,
      align: colQty.align,
    });

    // Rate
    doc.text(rate, colRate.x, currentY + 9, {
      width: colRate.width,
      align: colRate.align,
    });

    // GST
    doc.text(gst, colGst.x, currentY + 9, {
      width: colGst.width,
      align: colGst.align,
    });

    // Total
    doc.font("Helvetica-Bold");

    doc.text(total, colTotal.x, currentY + 9, {
      width: colTotal.width,
      align: colTotal.align,
    });

    currentY += rowHeight;
  });

  // ============================================================
  // EMPTY ITEMS
  // ============================================================

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

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica");
  doc.fontSize(10);

  // Subtotal
  doc.text("Subtotal", totalsX, currentY);

  doc.text(PdfHelper.money(sale.subTotal ?? 0), totalsX + 140, currentY, {
    width: 90,
    align: "right",
  });

  currentY += 20;

  // Tax
  doc.text("Tax", totalsX, currentY);

  doc.text(PdfHelper.money(sale.totalTax ?? 0), totalsX + 140, currentY, {
    width: 90,
    align: "right",
  });

  currentY += 20;

  // Discount
  const discount = sale.discountAmount ?? 0;

  if (discount > 0) {
    doc.fillColor("#DC2626");

    doc.text("Discount", totalsX, currentY);

    doc.text(`-${PdfHelper.money(discount)}`, totalsX + 140, currentY, {
      width: 90,
      align: "right",
    });

    doc.fillColor(PdfTheme.text);

    currentY += 20;
  }

  // ============================================================
  // GRAND TOTAL
  // ============================================================

  drawHorizontalRule(currentY, "#D1D5DB", totalsWidth);

  currentY += 12;

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

  doc.text(PdfHelper.money(sale.grandTotal ?? 0), totalsX + 140, currentY + 5, {
    width: 90,
    align: "right",
  });

  currentY += grandTotalBoxHeight + 15;

  // ============================================================
  // AMOUNT IN WORDS
  // ============================================================

  if (sale.grandTotal) {
    doc.fillColor(PdfTheme.muted);
    doc.font("Helvetica");
    doc.fontSize(9);

    const amountInWords = numberToWords(sale.grandTotal);

    doc.text(`Amount in words: ${amountInWords}`, left, currentY, {
      width: pageWidth - totalsWidth - 30,
      align: "left",
    });

    currentY += 25;
  }

  // ============================================================
  // TERMS & SIGNATURE
  // ============================================================

  drawHorizontalRule(currentY);

  currentY += 20;

  const termsWidth = pageWidth * 0.55;

  doc.fillColor(PdfTheme.text);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);

  doc.text("Terms & Conditions", left, currentY);

  doc.font("Helvetica");
  doc.fontSize(9);
  doc.fillColor(PdfTheme.muted);

  doc.text(
    "Goods once sold cannot be returned unless agreed otherwise. Payment is subject to the agreed terms. Please retain this invoice for your records.",
    left,
    currentY + 16,
    {
      width: termsWidth,
      align: "left",
    },
  );

  // ============================================================
  // SIGNATURE
  // ============================================================

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

  if (num === 0) {
    return "Zero";
  }

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return "";

    if (n < 10) {
      return ones[n];
    }

    if (n < 20) {
      return teens[n - 10];
    }

    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    }

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

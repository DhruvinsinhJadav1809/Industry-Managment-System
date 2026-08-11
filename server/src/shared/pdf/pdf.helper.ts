import PDFDocument from "pdfkit";
import { PdfTheme } from "./pdf.theme";

export class PdfHelper {
  static drawHeader(doc: PDFKit.PDFDocument, title: string) {
    doc
      .rect(0, 0, doc.page.width, PdfTheme.headerHeight)
      .fill(PdfTheme.primary);

    doc
      .fillColor("white")
      .fontSize(PdfTheme.font.title)
      .font("Helvetica-Bold")
      .text("Industry Management System", 0, 20, {
        align: "center",
      });

    doc.fontSize(PdfTheme.font.heading).text(title, {
      align: "center",
    });

    doc.moveDown(4);

    doc.fillColor(PdfTheme.text);
  }

  static drawLine(doc: PDFKit.PDFDocument) {
    const y = doc.y;

    doc
      .moveTo(PdfTheme.pageMargin, y)
      .lineTo(doc.page.width - PdfTheme.pageMargin, y)
      .strokeColor(PdfTheme.border)
      .stroke();

    doc.moveDown();
  }

  static labelValue(doc: PDFKit.PDFDocument, label: string, value: string) {
    doc.font("Helvetica-Bold").text(`${label} : `, {
      continued: true,
    });

    doc.font("Helvetica").text(value);
  }

  static money(value: number) {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  static date(date: Date) {
    return new Intl.DateTimeFormat("en-IN").format(date);
  }
}

import PDFDocument from "pdfkit";

class PdfService {
  createDocument() {
    return new PDFDocument({
      size: "A4",
      margin: 50,
    });
  }
}

export const pdfService = new PdfService();

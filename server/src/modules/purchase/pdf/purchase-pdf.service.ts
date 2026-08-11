import PDFDocument from "pdfkit";
import { Response } from "express";
import { pdfService } from "../../../shared/pdf/pdf.service";
import { buildPurchasePdf } from "./purchase.template";

export const generatePurchasePdf = (purchase: any, res: Response) => {
  const doc = pdfService.createDocument();

  buildPurchasePdf(doc, purchase);

  doc.pipe(res);

  doc.end();
};

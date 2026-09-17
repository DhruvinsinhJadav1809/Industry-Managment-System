import PDFDocument from "pdfkit";
import { Response } from "express";
import { pdfService } from "../../../shared/pdf/pdf.service";
import { buildSalePdf } from "./sale.template";

export const generateSalePdf = (sale: any, res: Response) => {
  const doc = pdfService.createDocument();

  buildSalePdf(doc, sale);

  doc.pipe(res);

  doc.end();
};

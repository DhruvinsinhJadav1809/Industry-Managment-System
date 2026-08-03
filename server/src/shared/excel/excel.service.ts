import ExcelJS from "exceljs";
import { Response as ExpressResponse } from "express";
import { ExcelOptions } from "./excel.types";

export class ExcelService {
  static async generateExcel<T>(
    options: ExcelOptions<T>,
    res: ExpressResponse,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Industry Management System";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(options.sheetName);

    worksheet.columns = options.columns.map((column) => ({
      ...column,
      width: column.width ?? 25,
    }));
    const headerRow = worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "4472C4",
      },
    };

    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    headerRow.height = 25;
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];
    worksheet.autoFilter = {
      from: "A1",
      to: String.fromCharCode(64 + options.columns.length) + "1",
    };
    worksheet.addRows(options.data);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${options.fileName}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }
}

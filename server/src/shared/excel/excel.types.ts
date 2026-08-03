export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelOptions<T> {
  sheetName: string;
  fileName: string;
  columns: ExcelColumn[];
  data: T[];
}

import "server-only";
import ExcelJS from "exceljs";
// Import the implementation entry point directly to avoid pdf-parse's index
// debug harness, which reads a bundled sample PDF when required without a parent.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export interface PdfToExcelResult {
  buffer: Buffer;
  rowCount: number;
  columnCount: number;
}

/**
 * Convert a PDF buffer into an .xlsx workbook. Text is extracted with pdf-parse,
 * then each non-empty line is split into columns on runs of 2+ spaces or tabs —
 * a pragmatic tabular extraction that suits waybill / report-style PDFs. This is
 * the server-side source of truth for the lead-gen PDF→Excel tool.
 */
export async function convertPdfToExcel(
  pdfBuffer: Buffer,
  sheetName = "Extracted"
): Promise<PdfToExcelResult> {
  const parsed = await pdfParse(pdfBuffer);

  const rows = parsed.text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(/\s{2,}|\t+/).map((cell) => cell.trim()));

  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Charm Systems";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetName);
  rows.forEach((row) => sheet.addRow(row));

  const arrayBuffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    rowCount: rows.length,
    columnCount,
  };
}

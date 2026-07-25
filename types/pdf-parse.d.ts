// pdf-parse ships no types for its internal implementation entry point.
// We import from the lib subpath to avoid the package index's debug harness
// (which tries to read a bundled test PDF when required without a parent module).
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }
  function pdfParse(
    data: Buffer | Uint8Array,
    options?: Record<string, unknown>
  ): Promise<PdfParseResult>;
  export default pdfParse;
}

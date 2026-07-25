import { NextResponse, type NextRequest } from "next/server";
import { convertPdfToExcel } from "@/lib/server/pdf-to-excel";

export const runtime = "nodejs";
// PDF parsing + xlsx generation can exceed the default edge/serverless budget.
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * PDF → Excel conversion endpoint (lead-gen tool). Accepts a multipart upload
 * under the `file` field, returns an .xlsx attachment. All processing happens
 * server-side; the client only sends the file and downloads the result.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded under the 'file' field." },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds the 10 MB limit." }, { status: 413 });
    }
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: xlsx, rowCount, columnCount } = await convertPdfToExcel(buffer);
    const outName = file.name.replace(/\.pdf$/i, "") + ".xlsx";

    // Wrap in a Uint8Array so it satisfies the Web BodyInit type.
    const bytes = new Uint8Array(xlsx);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${outName}"`,
        "X-Row-Count": String(rowCount),
        "X-Column-Count": String(columnCount),
      },
    });
  } catch (err) {
    console.error("[convert] conversion failed", err);
    return NextResponse.json({ error: "Conversion failed." }, { status: 500 });
  }
}

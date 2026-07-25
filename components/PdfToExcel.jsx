"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud } from "lucide-react";

/**
 * Client uploader for the PDF → Excel lead-gen tool. Posts the chosen PDF to the
 * server-side `/api/convert` route and triggers a download of the returned
 * .xlsx. No parsing happens on the client.
 */
export default function PdfToExcel() {
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setOk(false);
      setStatus("Please choose a PDF first.");
      return;
    }

    setBusy(true);
    setOk(false);
    setStatus("Converting...");

    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/convert", { method: "POST", body });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setOk(false);
        setStatus(err.error || "Conversion failed.");
        return;
      }

      const rows = res.headers.get("X-Row-Count");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name.replace(/\.pdf$/i, "") + ".xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setOk(true);
      setStatus(`Done — ${rows ?? "?"} rows exported to Excel and downloaded.`);
    } catch {
      setOk(false);
      setStatus("Conversion failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center backdrop-blur-md transition-colors hover:border-accent/50">
        <UploadCloud className="h-8 w-8 text-accent" />
        <span className="text-sm text-body">
          {fileName || "Click to choose a PDF to convert"}
        </span>
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="btn-accent w-full disabled:opacity-60"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {busy ? "Converting..." : "Convert to Excel"}
      </button>

      {status && (
        <p role="status" className={`text-sm ${ok ? "text-accent" : "text-red-400"}`}>
          {status}
        </p>
      )}
    </form>
  );
}

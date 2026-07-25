import { NextResponse, type NextRequest } from "next/server";
import { submitLead } from "@/app/actions/contact";
import { initialContactState } from "@/app/actions/contact-state";

export const runtime = "nodejs";

/**
 * JSON API alternative to the `submitLead` Server Action, for external clients
 * or programmatic lead capture. Reuses the same validation + persistence logic.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const formData = new FormData();
  for (const key of ["name", "email", "message", "tier"] as const) {
    const value = (body as Record<string, unknown>)[key];
    if (value != null) formData.set(key, String(value));
  }

  const result = await submitLead(initialContactState, formData);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

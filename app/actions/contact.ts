"use server";

import { getDb, isFirebaseConfigured } from "@/lib/server/firebase/admin";
import type { ContactState } from "./contact-state";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Server Action for creative-side lead / contact submissions. Validates input,
 * then persists to Firestore when Firebase is configured; otherwise it logs the
 * lead server-side so the flow still works locally without credentials.
 */
export async function submitLead(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const tier = String(formData.get("tier") ?? "").trim();

  if (name.length < 2) return { ok: false, message: "Please enter your name." };
  if (!isEmail(email)) return { ok: false, message: "Please enter a valid email address." };
  if (message.length < 5) return { ok: false, message: "Please add a short message." };

  const lead = {
    name,
    email,
    message,
    tier: tier || "unspecified",
    createdAt: new Date().toISOString(),
  };

  try {
    const db = getDb();
    if (db) {
      await db.collection("leads").add(lead);
    } else {
      console.info("[lead] Firebase not configured — captured lead locally:", lead);
    }
  } catch (err) {
    console.error("[lead] failed to persist", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const suffix = isFirebaseConfigured() ? "" : " (saved locally in dev)";
  return { ok: true, message: `Thanks ${name}, we'll be in touch soon!${suffix}` };
}

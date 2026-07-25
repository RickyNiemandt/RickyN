// Shared types/values for the contact flow. Kept separate from contact.ts
// because a "use server" module may only export async functions.
export interface ContactState {
  ok: boolean;
  message: string;
}

export const initialContactState: ContactState = { ok: false, message: "" };

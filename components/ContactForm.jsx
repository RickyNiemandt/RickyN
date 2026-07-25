"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { submitLead } from "@/app/actions/contact";
import { initialContactState } from "@/app/actions/contact-state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-accent w-full disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      {pending ? "Sending..." : "Send message"}
    </button>
  );
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white " +
  "placeholder:text-body outline-none backdrop-blur-md focus:border-accent/60";

/**
 * Lead capture form wired to the `submitLead` Server Action via useFormState,
 * so submission is handled server-side (validation + Firestore/log) with no
 * client-exposed credentials.
 */
export default function ContactForm() {
  const [state, formAction] = useFormState(submitLead, initialContactState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="name" placeholder="Your name" className={fieldClass} />
      <input name="email" type="email" placeholder="you@company.com" className={fieldClass} />
      <select name="tier" defaultValue="" className={fieldClass}>
        <option value="" className="bg-black">Interested tier (optional)</option>
        <option value="basic" className="bg-black">Basic — R2,950</option>
        <option value="growth" className="bg-black">Growth — R6,950</option>
        <option value="premium" className="bg-black">Premium — R28,500</option>
      </select>
      <textarea
        name="message"
        rows={4}
        placeholder="Tell us about your project..."
        className={fieldClass}
      />
      <SubmitButton />
      {state.message && (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-accent" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

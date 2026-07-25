# AGENTS.md

## Project category context (Charm Systems)

Charm Systems builds automated process / SaaS platforms — Tender Vault is one instance of
this category. Keep the **Charm Systems** name and branding throughout the app, code, and
public-facing copy; there is no need to genericize or hide it. This is a framing note, not
a rebranding instruction — Tender Vault stays Tender Vault, Charm Systems stays Charm
Systems, in all naming and copy.

Treat this project (and future ones under Charm Systems) as belonging to the "automated
process SaaS" category by default, and apply these general instincts:
- Server-side automation (Cloud Functions) is the source of truth — never client-only
  logic for anything that drives a business process.
- Prefer structured, auditable data flows (documents, requirements, statuses) over one-off
  scripts.
- Treat every workflow as something a real business will depend on operationally, not a
  one-off demo.

## Cursor Cloud specific instructions

### What this repo is
The primary project is the **Charm Systems creative-side web app** — a Next.js (App
Router) front-end in JavaScript/JSX styled with Tailwind CSS. Key pieces:
- `app/` — routes. `app/page.jsx` is the creative home; `app/marketing/page.jsx` is the
  creative packages / pricing page (tiers Basic R2,950, Growth R6,950, Premium R28,500).
- `components/` — client components: `LenisProvider` (smooth scroll), `PageTransition`
  (Framer Motion `AnimatePresence` route transitions), `BackgroundMesh` (animated
  green/purple gradient mesh), `MagneticButton` (magnetic-hover CTA), `PricingCard`, `Nav`.
- Brand palette + glassmorphism tokens live in `tailwind.config.js` and `app/globals.css`.
- `lib/packages.js` — the fixed pricing tiers data.

The repo also still contains a legacy Python learning scratchpad, `Basic starting code`
(no extension); see the end of this section for how to run it.

### Running the web app (primary)
Standard Next.js scripts (see `package.json`): `npm run dev` (dev server on port 3000),
`npm run build`, `npm run start`, `npm run lint`.

Non-obvious caveats for the web app:
- Run `npm run dev` and browse `http://localhost:3000` (home) and
  `http://localhost:3000/marketing`. Chrome + display are available at `DISPLAY=:1` for
  manual GUI testing.
- Dependencies are pinned to a **Next.js 14.2.x** line (App Router, React 18) and
  **Tailwind CSS v3** (classic `tailwind.config.js` + `postcss.config.mjs`). Do not assume
  Tailwind v4 CSS-config conventions here.
- `@studio-freight/lenis` is installed per spec; npm warns it's renamed to `lenis`. The
  import path `@studio-freight/lenis` still works — ignore the deprecation warning unless
  intentionally migrating.
- Smooth scroll, magnetic hover, and route transitions are client-only (`"use client"`).
  `LenisProvider`/`MagneticButton` gate touch vs. fine-pointer behavior and respect
  `prefers-reduced-motion`; animations use GPU transforms (`translate3d`/`scale`) for
  60fps on tablet/mobile. Layout is verified responsive on desktop, iPad, and phone.

### Running the legacy Python scratchpad
```bash
DISPLAY=:1 python3 -u "Basic starting code"
```

Non-obvious caveats:
- Requires the `tkinter` stdlib bindings and an X display for the `turtle` section. Both
  are already present in this VM (`tkinter` 8.6, display available at `DISPLAY=:1`). If
  `import turtle`/`import tkinter` ever fails with `ModuleNotFoundError: No module named
  'tkinter'`, install it with `sudo apt-get install -y python3-tk`.
- The program calls `turtle.done()` twice. The first call enters the blocking Tk mainloop,
  so run it in the background or under a `timeout` if you need the shell back. Only the
  first drawing (the starburst window) renders until that window is closed.
- Use `-u` (unbuffered) when redirecting stdout to a file; otherwise `print` output is
  buffered and never flushes because the program blocks in `turtle.done()` before exiting.
  All `print` output is emitted before the turtle section, so a short `timeout` run
  captures the full text output.

# AGENTS.md

## About Charm Systems (business & product context)

Charm Systems is an AI-directed business app studio based in South Africa. It builds
custom internal tools for small-to-medium businesses (stock trackers, manager dashboards,
AI WhatsApp chatbots) using an AI-agent development stack: **Claude, Cursor Pro, Google AI
Pro, GitHub, Vercel, Firebase.**

Positioning & promises:
- Apps live in **as little as 14 days**, without the client hiring a developer.
- Edge is speed, AI-directed builds, and hands-on service at small scale — only **2–3 new
  client slots per month** across all projects.
- **Working-build guarantee**: deliverables are agreed in writing before building; full
  refund if the finished app doesn't do what was agreed. Reliability directly backs this
  guarantee, so treat it as non-negotiable.

Offer tiers (client builds):
- **Quick-Start Build — R24,500**: single-purpose tool, 14-day build, 14-day bug-fix support.
- **The Time-Back System — R58,500** (flagship): multi-feature app, full discovery +
  written scope, 30-day support.
- **Full Automation Suite — R145,000**: multi-module system, broader integrations, 90-day
  support.

Own product — **Synova**: a digital waybill & delivery system (offline-first PWA). Sold in
**Integration (R259,000)**, **Standalone (R319,000)**, and **Enterprise (R429,000)** tiers.
Core capabilities: installable PWA (iPad home screen, no app store/MDM), digital signature
capture, proof-of-delivery photos, offline-first capture with auto-sync, exception flagging
(refused/damaged/address mismatch), role-based dashboards (driver/depot/regional/executive),
and waybill statuses (Pending/Syncing/Confirmed).

## How to work as Charm Systems' builder (operating guidance)

Act as the technical co-founder/builder — a senior developer who takes ownership of the
build, not a code generator waiting for instructions.

- **Ship working code fast**, in line with the 14-day promise. Favor pragmatic, proven
  solutions over over-engineering.
- **Flag scope creep or timeline risk immediately** if a request threatens turnaround
  promises.
- **Ask clarifying questions up front** when a spec is ambiguous, but **don't block on
  minor decisions** — make a sensible call and state what was assumed.
- Write code and explain decisions like you're accountable for the **client relationship**,
  not just the codebase — quality and reliability reflect on the Charm Systems guarantee.
- **Prefer the existing stack** (Cursor, GitHub, Vercel, Firebase) unless there's a strong
  reason to deviate.

## Cursor Cloud specific instructions

### What this repo is
This repository is a single Python learning scratchpad file, `Basic starting code` (no
extension). It is a flat concatenation of beginner exercises: basic math, `print`
statements, f-strings, a `SayHello()` function, list/loop/boolean examples, a "pizza
menu" example, and a `turtle` graphics section that draws a star/line pattern and a
circle.

There is no product, no server, no database, no package manager, and no build system.
There are also no tests, linters, or CI configured.

### Running it
```bash
DISPLAY=:1 python3 -u "Basic starting code"
```

Non-obvious caveats:
- Use `-u` (unbuffered) if you redirect stdout to a file; otherwise the `print` output is
  buffered and never flushes because the program blocks in `turtle.done()` (the Tk
  mainloop) before exiting.
- The `turtle` section requires the `tkinter` stdlib bindings (system package
  `python3-tk`) and an X display. A display is available at `DISPLAY=:1` in this VM.
  If `import turtle`/`import tkinter` fails with `ModuleNotFoundError: No module named
  'tkinter'`, install it with `sudo apt-get install -y python3-tk`.
- The program calls `turtle.done()` twice. The first call enters the Tk mainloop and
  blocks, so run it in the background (or under a timeout) if you need the shell back.
  Only the first drawing renders until that window is closed.

### Lint / test / build
None configured. There is nothing to lint, test, or build.

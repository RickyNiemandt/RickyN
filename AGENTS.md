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
This repository is a single Python learning scratchpad file, `Basic starting code` (no
file extension). It is a flat concatenation of beginner exercises: basic math, `print`
statements, f-strings, a `SayHello()` function, list/loop/boolean examples, a "pizza
menu" example, and a `turtle` graphics section that draws a star/line pattern and a
filled circle.

There is no product, server, database, package manager, or build system, and there are
no tests, linters, or CI configured. Nothing to lint, test, or build.

### Running it
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

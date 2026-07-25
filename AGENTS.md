# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This repository is a single Python 3 learning scratchpad: `Basic starting code` (note:
no `.py` extension and a space in the filename). It is a flat sequence of beginner
exercises — basic math, `print`/f-strings, a `SayHello()` function, list/loop/boolean
examples, a "pizza menu" example, and a `turtle` graphics section that draws a
starburst/line pattern and a filled circle.

There is no package manager, build system, server, database, tests, linter, or CI.
Nothing to lint, test, or build.

### Running it
```bash
DISPLAY=:1 python3 -u "Basic starting code"
```

Non-obvious caveats:
- The `turtle` section needs the `tkinter` stdlib bindings (system package
  `python3-tk`) and an X display. Both are already present in this VM (`tkinter` 8.6,
  display at `DISPLAY=:1`). If `import turtle`/`import tkinter` ever fails with
  `ModuleNotFoundError: No module named 'tkinter'`, install it with
  `sudo apt-get install -y python3-tk`.
- The program calls `turtle.done()`, which enters the blocking Tk mainloop, so the
  process appears to "hang" after the console output — this is expected, not a crash.
  Run it in the background or under a `timeout` if you need the shell back. Only the
  first drawing (the starburst window) renders until that window is closed.
- Use `-u` (unbuffered) when redirecting stdout to a file; otherwise `print` output is
  buffered and never flushes because the program blocks in `turtle.done()`. All
  console output is emitted before the turtle section, so a short `timeout` run captures
  the full text output.

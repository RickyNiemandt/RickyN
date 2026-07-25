# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This repository contains a single file, `Basic starting code`, which is a collection of
beginner Python learning snippets (arithmetic, `print`/f-strings, a `SayHello()` function,
list operations, a for/if loop, a small pizza-menu formatter, and two `turtle` graphics demos).
It has no extension but is Python. There is no package manager, no dependencies, no services,
and no lint/test/build tooling.

### Running it
- Python 3 (with the standard-library `turtle` and `tkinter`) is preinstalled; no install step is needed.
- The file mixes plain console snippets with `turtle` graphics. Running it whole opens turtle windows.
- The two `turtle.done()` calls run the Tk `mainloop`, which **blocks** until the window is closed.
  Because of this, running the full file will pause at the first drawing until its window is closed.
- `turtle` needs an X display. In this environment a display is available at `DISPLAY=:1` (the Desktop pane).
  Run turtle code with `DISPLAY=:1 python3 "Basic starting code"`. Headless runs without a display will fail.
- To exercise just the non-GUI logic without blocking, run the pre-`turtle` portion, e.g.
  `head -97 "Basic starting code" > /tmp/console.py && python3 /tmp/console.py`.

### Lint / test / build
None exist. There is nothing to lint, test, or build.

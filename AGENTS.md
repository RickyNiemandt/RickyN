# AGENTS.md

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

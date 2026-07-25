# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This repository currently contains a single Python practice/learning script:
`Basic starting code` (note: no file extension). There is no package manifest,
no build system, no tests, and no services. The script mixes REPL-style bare
expressions (e.g. `2 + 1`, `type(x)`) with executable statements and turtle
graphics.

### Running it
- Python 3 runs the file directly despite the missing extension:
  `python3 "Basic starting code"`.
- stdout is block-buffered when not attached to a TTY. Use `python3 -u "Basic starting code"`
  to see the text output (Hello World, pizza menu, etc.) promptly.

### Turtle graphics caveats (non-obvious)
- The script's second half does `import turtle`, which requires `tkinter`
  (system package `python3-tk`) plus an X display. A live X server is available
  on `DISPLAY=:1`.
- The script BLOCKS at the first `turtle.done()` (it enters the Tk mainloop and
  never returns). As written, the second turtle drawing (the circle) is
  therefore never reached. To run it non-interactively, launch it detached
  (e.g. `setsid ... &`) or wrap it with a timeout, then stop the process when
  finished. Running the whole file to completion in the foreground will hang.

### Lint / test / build
None exist. There is no linter, test runner, or build step configured for this repo.

# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Python 3 learning script; there is no package manager, build
step, test suite, or lint config.

- Main file: `Basic starting code` (note: no `.py` extension and a space in the
  name). Run it with `python3 "Basic starting code"`.
- Running the script prints a series of console exercises (math/strings/lists/
  functions), then opens Python `turtle` GUI windows. Each turtle section ends with
  `turtle.done()`, which **blocks** until the window is closed, so the process will
  appear to hang after the console output — this is expected, not a crash.
- The `turtle` module requires `tkinter` (system package `python3-tk`). The update
  script installs it when missing.
- A desktop/X display is available at `DISPLAY=:1`. Use `DISPLAY=:1 python3 "Basic starting code"`
  to render the turtle windows; for console-only output, pipe/inspect stdout before
  the first turtle window opens (use `python3 -u` to avoid buffering) since the
  process blocks on `turtle.done()`.

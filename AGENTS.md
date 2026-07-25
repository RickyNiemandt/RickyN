# AGENTS.md

## Cursor Cloud specific instructions

This repository currently contains a single beginner Python learning script named
`Basic starting code` (no file extension). There is no package manager, build
system, lockfile, tests, or CI — so there are no dependencies to install.

- Runtime: Python 3 (verified with Python 3.12.3). Use `python3` (there is no `python` on PATH).
- Run it: `python3 "Basic starting code"`.
- The final section uses `turtle` graphics, which requires Tk and a display. `tkinter`
  is available and a display is present at `DISPLAY=:1`. Running the whole file will
  draw into a GUI window and then **block** on `turtle.done()` (Tk mainloop) until the
  window is closed, so run it in the background / a separate session if you need the shell back.
- To exercise only the console output (no GUI/blocking), run the portion before
  `import turtle`, e.g. `awk '/^import turtle/{exit} {print}' "Basic starting code" | python3 -`.
- There are no lint/test/build commands configured for this repository.

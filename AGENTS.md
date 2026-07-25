# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This repository is a single beginner-Python learning script named `Basic starting code`
(note: **no `.py` extension** and a **space in the filename**, so always quote it). It contains
introductory exercises (math, `print`, variables, f-strings, lists, loops, functions) followed by a
`turtle` graphics section that draws a line/star pattern and a filled circle. There is no
`package.json`/`requirements.txt`, no database, no web service, no tests, and no lint/build config.

### Running it
```bash
python3 "Basic starting code"
```
The console exercises print immediately. The `turtle` section then opens GUI windows.

### Non-obvious caveats
- **Turtle needs a GUI stack.** The `turtle` module requires Tkinter (`python3-tk`) and an X display.
  Both are present in the Cloud VM base image (`tkinter` 8.6, `DISPLAY=:1`); no install step is needed.
- **The script blocks and only shows the first drawing by default.** It calls `turtle.done()` twice.
  The first `turtle.done()` blocks until you close the first window ("Drawning line Practice"); only
  after closing it does the second window ("Drawing Circles Practice") appear. This is a property of the
  script, not an environment problem.
- **No package dependencies.** There is nothing to `pip install`; the only imports are the standard
  library. The startup update script therefore just verifies the Python interpreter.

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

### Node / Firebase tooling

- Node.js and npm are preinstalled (npm is managed by nvm; the active `node` global
  prefix is root-owned, so global installs need `sudo`). The `firebase` CLI is
  installed globally by the update script (`firebase-tools`).
- On this VM, `sudo` does not inherit npm/node on PATH, so global installs must
  preserve it: `sudo env "PATH=$PATH" npm install -g <pkg>`.
- Firebase commands beyond `firebase --version`/`--help` (e.g. `projects:list`,
  `deploy`, `init`) require authentication via `firebase login` (or a
  `FIREBASE_TOKEN`/service-account credential); without it they fail with an auth
  error.

# Tender Vault

**by Charm Systems**

Tender Vault is an automated-process SaaS platform for managing tender/RFP
compliance documents. Companies keep a vault of their compliance documents
(SARS Tax PIN, CSD profile, B-BBEE certificate, COIDA letter, pricing
schedule, company registration, tax clearance, letter of good standing),
upload a tender, and Tender Vault parses its requirements (via the Claude API,
server-side only), cross-references them against the vault, and produces a
confirm-and-download checklist. Server-side automation is the source of truth.

## Architecture

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React (Vite) — `frontend/`                             |
| Auth      | Firebase Authentication (email/password)               |
| Database  | Cloud Firestore                                        |
| Storage   | Firebase Storage                                       |
| Functions | Firebase Cloud Functions (Node.js) — `functions/`      |
| Parsing   | Claude API (Anthropic), **only** from a Cloud Function |

Web app only — no native mobile.

## Repository layout

```
tender-vault/
├── frontend/            React (Vite) web app
├── functions/           Firebase Cloud Functions (Node.js)
├── firebase.json        Firebase project config (hosting, functions, rules, emulators)
├── firestore.rules      Firestore security rules (tenant-scoped)
├── firestore.indexes.json
├── storage.rules        Storage security rules (tenant-scoped)
└── .env.example         Reference for all environment variables
```

## Environment variables

Never commit real secrets. Copy the example files and fill in real values:

- `frontend/.env.example` → `frontend/.env.local`
- `functions/.env.example` → `functions/.env`

The client uses only public Firebase web config (`VITE_*`). Secrets
(`ANTHROPIC_API_KEY`, provider keys, service account) live only in the
Functions environment and are never exposed to the client.

## Local development

```bash
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173

# Functions
cd ../functions
npm install
npm run lint
```

## Manual setup checklist (operator steps)

These are run by the project operator against a real Firebase project — the
scaffold uses placeholders only.

- [ ] Create a Firebase project in the Firebase console.
- [ ] Enable **Authentication** → Email/Password sign-in.
- [ ] Enable **Cloud Firestore** (production mode).
- [ ] Enable **Cloud Storage**.
- [ ] Register a **Web app** and copy its config into `frontend/.env.local`.
- [ ] Put `ANTHROPIC_API_KEY` (and any provider keys) into `functions/.env`.
- [ ] `firebase login`
- [ ] `firebase init` (or set the project id in `.firebaserc`).
- [ ] `firebase deploy --only firestore:rules`
- [ ] `firebase deploy --only storage:rules`
- [ ] `firebase deploy --only firestore:indexes`
- [ ] `firebase deploy --only functions`
- [ ] Build and deploy hosting: `cd frontend && npm run build && firebase deploy --only hosting`

## Security & compliance baseline

- Every Firestore/Storage rule is scoped by
  `request.auth.token.companyId == companyId` — no tenant data commingling.
- No client-side RBAC or matching logic — enforced server-side in Functions.
- Secrets are never hardcoded and never committed.
- All input is validated/sanitized server-side regardless of client checks.
- Least-privilege on every rule and service account.
- No automated verification against SARS/CSD or any regulator/bank system.
- Compliance ambiguity is surfaced to the user, never silently corrected.
- Cross-tenant expiry scans use a Firestore **collection group query** with a
  composite index — not a per-company loop.

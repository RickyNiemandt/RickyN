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
├── firestore.rules      Firestore security rules (tenant-scoped + RBAC)
├── firestore.indexes.json
├── storage.rules        Storage security rules (tenant-scoped)
└── .env.example         Reference for all environment variables
```

## Phase status

| Phase | Scope                                              | Status   |
| ----- | -------------------------------------------------- | -------- |
| 1     | Scaffold — Firebase init, project structure, CI    | ✅ Done  |
| 2     | Core product — auth, vault, parse, match, download | ✅ Done  |

### Phase 2 — what was built

**Security (Firestore + Storage rules)**
- Every path scoped by `request.auth.token.companyId == companyId`.
- Role-based: `admin` can delete documents + read audit log; `member` can upload + confirm.
- `auditLog` is write-only from Cloud Functions (no client writes ever).
- `requirements` may only have `confirmedAt`/`confirmedBy`/`acknowledgedExpiry` updated by clients — all other fields are server-only.

**Cloud Functions** (`functions/index.js`)
| Function              | Role    | Description                                             |
| --------------------- | ------- | ------------------------------------------------------- |
| `provisionCompany`    | member  | Creates company, grants admin claims (one-shot)         |
| `addUser`             | admin   | Assigns an existing user to the company with a role     |
| `registerVaultDoc`    | member  | Creates Firestore vault record + audit log after upload |
| `deleteVaultDoc`      | admin   | Deletes Firestore record + Storage file                 |
| `registerTender`      | member  | Creates tender Firestore record after upload            |
| `parseTender`         | member  | Downloads tender → Claude API → writes requirements     |
| `matchRequirements`   | member  | Cross-references requirements vs vault (normalised)     |
| `confirmRequirement`  | member  | Records confirmation; blocks missing, warns expired     |
| `issueDownloadUrl`    | member  | 15-min signed URL after confirmation; writes audit log  |
| `scanExpiries`        | system  | Scheduled daily — alerts for expired/expiring docs      |

**Frontend** (`frontend/src/`)
- `AuthContext` — Firebase auth state + custom claims + `refreshClaims()`.
- Login / Signup / Onboard wizard (company provisioning).
- Vault page — list, upload (with progress bar), delete (admin), expiry tracking.
- Tenders page — list, upload, navigate to detail.
- Tender detail page — parse, match, confirm, download (per requirement).
- Status chips: Found (green), Expired (amber), Missing (red).
- Expiry acknowledgment flow for expired documents.
- Audit trail written for every significant action (server IP captured).

**Firestore schema**
```
/companies/{companyId}
  /users/{uid}
  /vault/{docId}
  /tenders/{tenderId}
    /requirements/{reqId}
  /auditLog/{logId}
```

## Environment variables

Never commit real secrets. Copy the example files and fill in real values:

- `frontend/.env.example` → `frontend/.env.local`
- `functions/.env.example` → `functions/.env`

The client uses only public Firebase web config (`VITE_*`). Secrets
(`ANTHROPIC_API_KEY`, service account) live only in the Functions environment.

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

These are run by the project operator against a real Firebase project.

- [ ] Create a Firebase project in the Firebase console.
- [ ] Enable **Authentication** → Email/Password sign-in.
- [ ] Enable **Cloud Firestore** (production mode).
- [ ] Enable **Cloud Storage**.
- [ ] Register a **Web app** and copy its config into `frontend/.env.local`.
- [ ] Put `ANTHROPIC_API_KEY` into `functions/.env`.
- [ ] `firebase login`
- [ ] Update `.firebaserc` with your project ID.
- [ ] `firebase deploy --only firestore:rules`
- [ ] `firebase deploy --only storage:rules`
- [ ] `firebase deploy --only firestore:indexes`
- [ ] `firebase deploy --only functions`
- [ ] Build and deploy hosting: `cd frontend && npm run build && firebase deploy --only hosting`
- [ ] The first user to sign up and complete the onboarding wizard becomes the company admin.

## Security & compliance baseline

- Every Firestore/Storage rule is scoped by `request.auth.token.companyId` — no cross-tenant data access.
- No client-side RBAC or matching logic — enforced server-side in Functions.
- `auditLog` is append-only from the server; captures action, userId, IP, resource, metadata, timestamp.
- Expired/missing semantics:
  - `missing` = hard block — document type not in vault; confirmation refused.
  - `expired` = soft block — confirmation allowed only with explicit `acknowledgedExpiry: true`.
  - `found` = pre-checkable; normal flow.
- Secrets are never hardcoded and never committed.
- All writes validated server-side regardless of client checks.
- Cross-tenant expiry scans use a Firestore collection group query with a composite index.
- Signed download URLs expire after 15 minutes; URL + expiry stored in the requirement record.

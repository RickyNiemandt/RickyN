// ============================================================
// Tender Vault — Cloud Functions entrypoint (Charm Systems)
// ============================================================
// SCAFFOLD: exported functions are added in subsequent chunks:
//   - provisioning (company + first user, sets companyId/role custom claims)
//   - parseTender (Claude API, server-side only)
//   - matchRequirements (server-side matching against the vault)
//   - issueDownloadUrl (per-file signed URLs after confirmation)
//   - scanExpiries (collection group query, writes alert stubs)
//   - audit logging helpers (append-only)
//
// All secrets are read from the environment; nothing is hardcoded.

import { initializeApp } from 'firebase-admin/app';

initializeApp();

// Function exports are wired up in later chunks once the security model is
// confirmed. Keeping this file importable and lint-clean in the meantime.

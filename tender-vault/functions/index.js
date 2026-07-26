// ============================================================
// Tender Vault — Cloud Functions (Charm Systems)
// Node 20, Firebase Functions v2, ESM
// ============================================================

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

initializeApp();

const auth = getAuth();
const db = getFirestore();
const bucket = () => getStorage().bucket();
const anthropic = () =>
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Guards ────────────────────────────────────────────────────

function assertAuth(req) {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
}

function assertCompany(req) {
  assertAuth(req);
  if (!req.auth.token.companyId)
    throw new HttpsError('permission-denied', 'No company assigned to this account.');
}

function assertAdmin(req) {
  assertCompany(req);
  if (req.auth.token.role !== 'admin')
    throw new HttpsError('permission-denied', 'Admin access required.');
}

// ── Audit helper ──────────────────────────────────────────────

async function audit(companyId, action, uid, email, ip, resource, meta = {}) {
  await db.collection(`companies/${companyId}/auditLog`).add({
    action,
    userId: uid,
    userEmail: email || '',
    ip: ip || 'unknown',
    resource,
    metadata: meta,
    timestamp: FieldValue.serverTimestamp(),
  });
}

// ── provisionCompany ──────────────────────────────────────────
// Creates a new company and grants the calling user admin claims.
// One-shot: rejects if the user already has a companyId claim.

export const provisionCompany = onCall(async (req) => {
  assertAuth(req);

  const { companyName } = req.data;
  if (!companyName || typeof companyName !== 'string' || !companyName.trim())
    throw new HttpsError('invalid-argument', 'companyName is required.');

  if (req.auth.token.companyId)
    throw new HttpsError('already-exists', 'You already belong to a company.');

  const companyId = randomUUID();
  const uid = req.auth.uid;
  const email = req.auth.token.email || '';

  await db.collection('companies').doc(companyId).set({
    name: companyName.trim(),
    createdAt: FieldValue.serverTimestamp(),
    createdBy: uid,
  });

  await db.collection(`companies/${companyId}/users`).doc(uid).set({
    email,
    role: 'admin',
    addedAt: FieldValue.serverTimestamp(),
    addedBy: uid,
  });

  await auth.setCustomUserClaims(uid, { companyId, role: 'admin' });

  const ip = req.rawRequest?.ip;
  await audit(companyId, 'provisionCompany', uid, email, ip, 'company', {
    companyName: companyName.trim(),
  });

  return { companyId };
});

// ── addUser ────────────────────────────────────────────────────
// Admin-only: assigns an existing Firebase Auth user to this company
// with the given role (admin | member). The user must sign up first.

export const addUser = onCall(async (req) => {
  assertAdmin(req);

  const { email, role } = req.data;
  if (!email || typeof email !== 'string')
    throw new HttpsError('invalid-argument', 'email is required.');
  if (!['admin', 'member'].includes(role))
    throw new HttpsError('invalid-argument', 'role must be "admin" or "member".');

  const companyId = req.auth.token.companyId;

  let target;
  try {
    target = await auth.getUserByEmail(email);
  } catch {
    throw new HttpsError(
      'not-found',
      `No user account found for ${email}. They must sign up first.`,
    );
  }

  const existingClaims = target.customClaims || {};
  if (existingClaims.companyId && existingClaims.companyId !== companyId)
    throw new HttpsError('already-exists', 'User belongs to a different company.');

  await auth.setCustomUserClaims(target.uid, { companyId, role });

  await db
    .collection(`companies/${companyId}/users`)
    .doc(target.uid)
    .set({ email, role, addedAt: FieldValue.serverTimestamp(), addedBy: req.auth.uid }, { merge: true });

  await audit(companyId, 'addUser', req.auth.uid, req.auth.token.email, req.rawRequest?.ip, `users/${target.uid}`, { email, role });

  return { uid: target.uid };
});

// ── registerVaultDoc ──────────────────────────────────────────
// Called after the client uploads a file to Storage.
// Creates the Firestore record and writes the audit log.
// Increments version if a prior doc of the same type exists.

export const registerVaultDoc = onCall(async (req) => {
  assertCompany(req);

  const { type, fileName, storagePath, fileSize, mimeType, expiresAt, notes } =
    req.data;
  if (!type || !fileName || !storagePath)
    throw new HttpsError(
      'invalid-argument',
      'type, fileName, and storagePath are required.',
    );

  const companyId = req.auth.token.companyId;

  const existing = await db
    .collection(`companies/${companyId}/vault`)
    .where('type', '==', type)
    .orderBy('version', 'desc')
    .limit(1)
    .get();

  const version = existing.empty ? 1 : (existing.docs[0].data().version || 0) + 1;

  const docRef = await db.collection(`companies/${companyId}/vault`).add({
    type,
    fileName,
    storagePath,
    fileSize: fileSize || 0,
    mimeType: mimeType || 'application/octet-stream',
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    uploadedAt: FieldValue.serverTimestamp(),
    uploadedBy: req.auth.uid,
    version,
    notes: notes || '',
  });

  await audit(
    companyId,
    'uploadVaultDoc',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `vault/${docRef.id}`,
    { type, fileName, version },
  );

  return { docId: docRef.id, version };
});

// ── deleteVaultDoc ─────────────────────────────────────────────
// Admin-only. Deletes the Firestore record and the Storage file.

export const deleteVaultDoc = onCall(async (req) => {
  assertAdmin(req);

  const { docId } = req.data;
  if (!docId) throw new HttpsError('invalid-argument', 'docId is required.');

  const companyId = req.auth.token.companyId;
  const ref = db.collection(`companies/${companyId}/vault`).doc(docId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Document not found.');

  const { storagePath, type, fileName } = snap.data();
  await ref.delete();

  if (storagePath) {
    try {
      await bucket().file(storagePath).delete();
    } catch {
      // Already gone from Storage; ignore.
    }
  }

  await audit(
    companyId,
    'deleteVaultDoc',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `vault/${docId}`,
    { type, fileName },
  );

  return { deleted: true };
});

// ── registerTender ─────────────────────────────────────────────
// Called after the client uploads the tender file to Storage.
// Creates the Firestore tender record.

export const registerTender = onCall(async (req) => {
  assertCompany(req);

  const { name, fileName, storagePath, fileSize } = req.data;
  if (!name || !fileName || !storagePath)
    throw new HttpsError(
      'invalid-argument',
      'name, fileName, and storagePath are required.',
    );

  const companyId = req.auth.token.companyId;

  const docRef = await db.collection(`companies/${companyId}/tenders`).add({
    name,
    fileName,
    storagePath,
    fileSize: fileSize || 0,
    uploadedAt: FieldValue.serverTimestamp(),
    uploadedBy: req.auth.uid,
    status: 'pending',
  });

  await audit(
    companyId,
    'uploadTender',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `tenders/${docRef.id}`,
    { name, fileName },
  );

  return { tenderId: docRef.id };
});

// ── parseTender ───────────────────────────────────────────────
// Downloads the tender from Storage, sends it to Claude (Anthropic)
// as a document message, and writes the parsed requirements to
// the tenders/{tenderId}/requirements sub-collection.

const PARSE_SYSTEM = `You are an expert South African procurement analyst.
Extract all required compliance documents from the tender/RFP document provided.
Return ONLY a valid JSON array of objects — no markdown, no explanation — using these fields:
  documentType (string): exact name of the required document
  description  (string): one-sentence description of what is required
  mandatory    (boolean): true if explicitly required/mandatory, false if optional

Common South African compliance documents:
Tax Clearance Certificate, B-BBEE Certificate, CIPC Company Registration, CSD Profile,
COIDA Letter of Good Standing, SARS VAT Registration, Bank Confirmation Letter,
Letter of Good Standing, Pricing Schedule, Method Statement,
Professional Indemnity Insurance, Public Liability Insurance.`;

export const parseTender = onCall(
  { timeoutSeconds: 180, memory: '512MiB' },
  async (req) => {
    assertCompany(req);

    const { tenderId } = req.data;
    if (!tenderId) throw new HttpsError('invalid-argument', 'tenderId is required.');

    const companyId = req.auth.token.companyId;
    const tenderRef = db
      .collection(`companies/${companyId}/tenders`)
      .doc(tenderId);
    const tenderSnap = await tenderRef.get();

    if (!tenderSnap.exists) throw new HttpsError('not-found', 'Tender not found.');

    const { storagePath, name, status } = tenderSnap.data();
    if (status === 'parsing')
      throw new HttpsError('already-exists', 'Tender is already being parsed.');

    await tenderRef.update({ status: 'parsing' });

    try {
      const [fileBuffer] = await bucket().file(storagePath).download();
      const base64 = fileBuffer.toString('base64');
      const isPdf = /\.pdf$/i.test(storagePath);
      const isText = /\.(txt|text|md|csv)$/i.test(storagePath);

      let userContent;
      if (isPdf) {
        userContent = [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: 'Extract all required compliance documents from this tender/RFP.',
          },
        ];
      } else if (isText) {
        userContent = [
          {
            type: 'text',
            text: `Tender document:\n\n${fileBuffer.toString('utf8')}\n\nExtract all required compliance documents.`,
          },
        ];
      } else {
        userContent = [
          {
            type: 'text',
            text: `Tender name: "${name}". File format unsupported for automatic extraction. List the most common South African tender compliance documents.`,
          },
        ];
      }

      const response = await anthropic().messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: PARSE_SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      });

      const raw = response.content[0].text.trim();
      let requirements;
      try {
        requirements = JSON.parse(raw);
      } catch {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match)
          throw new Error(`Claude returned non-JSON: ${raw.slice(0, 200)}`);
        requirements = JSON.parse(match[0]);
      }

      if (!Array.isArray(requirements))
        throw new Error('Parsed requirements is not an array.');

      const batch = db.batch();
      for (const r of requirements) {
        const ref = tenderRef.collection('requirements').doc();
        batch.set(ref, {
          documentType: String(r.documentType || 'Unknown').trim(),
          description: String(r.description || '').trim(),
          mandatory: !!r.mandatory,
          matchStatus: 'missing',
          vaultDocId: null,
          confirmedAt: null,
          confirmedBy: null,
          acknowledgedExpiry: false,
          downloadUrl: null,
          downloadUrlExpiresAt: null,
        });
      }
      await batch.commit();

      await tenderRef.update({
        status: 'parsed',
        parsedAt: FieldValue.serverTimestamp(),
        requirementsCount: requirements.length,
      });

      await audit(
        companyId,
        'parseTender',
        req.auth.uid,
        req.auth.token.email,
        req.rawRequest?.ip,
        `tenders/${tenderId}`,
        { requirementsCount: requirements.length },
      );

      return { requirementsCount: requirements.length };
    } catch (err) {
      await tenderRef.update({ status: 'error', errorMessage: err.message });
      throw new HttpsError('internal', `Parsing failed: ${err.message}`);
    }
  },
);

// ── matchRequirements ─────────────────────────────────────────
// Cross-references tender requirements against the vault.
// Normalises document type names for matching (case-insensitive, trimmed).
// Sets matchStatus: "found" | "expired" | "missing" on each requirement.

function normalise(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const matchRequirements = onCall(async (req) => {
  assertCompany(req);

  const { tenderId } = req.data;
  if (!tenderId) throw new HttpsError('invalid-argument', 'tenderId is required.');

  const companyId = req.auth.token.companyId;
  const tenderRef = db
    .collection(`companies/${companyId}/tenders`)
    .doc(tenderId);
  const tenderSnap = await tenderRef.get();
  if (!tenderSnap.exists) throw new HttpsError('not-found', 'Tender not found.');

  // Build vault index keyed by normalised type, keeping latest version.
  const vaultSnap = await db
    .collection(`companies/${companyId}/vault`)
    .get();

  const now = new Date();
  const vaultIndex = {};

  for (const doc of vaultSnap.docs) {
    const d = doc.data();
    const key = normalise(d.type);
    const existing = vaultIndex[key];
    if (!existing || (d.version || 0) > (existing.version || 0)) {
      const exp = d.expiresAt ? d.expiresAt.toDate() : null;
      vaultIndex[key] = {
        docId: doc.id,
        version: d.version || 1,
        expired: exp ? exp < now : false,
      };
    }
  }

  // Update each requirement's matchStatus.
  const reqSnap = await tenderRef.collection('requirements').get();
  const batch = db.batch();

  for (const reqDoc of reqSnap.docs) {
    const { documentType } = reqDoc.data();
    const hit = vaultIndex[normalise(documentType)];

    let matchStatus = 'missing';
    let vaultDocId = null;

    if (hit) {
      vaultDocId = hit.docId;
      matchStatus = hit.expired ? 'expired' : 'found';
    }

    batch.update(reqDoc.ref, { matchStatus, vaultDocId });
  }

  await batch.commit();

  await tenderRef.update({
    status: 'matched',
    matchedAt: FieldValue.serverTimestamp(),
  });

  await audit(
    companyId,
    'matchRequirements',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `tenders/${tenderId}`,
    { vaultSize: vaultSnap.size, requirementsCount: reqSnap.size },
  );

  return { matched: reqSnap.size };
});

// ── confirmRequirement ─────────────────────────────────────────
// Records explicit confirmation by the user. For expired documents
// the caller must set acknowledgedExpiry: true. Missing documents
// cannot be confirmed.

export const confirmRequirement = onCall(async (req) => {
  assertCompany(req);

  const { tenderId, requirementId, acknowledgedExpiry } = req.data;
  if (!tenderId || !requirementId)
    throw new HttpsError(
      'invalid-argument',
      'tenderId and requirementId are required.',
    );

  const companyId = req.auth.token.companyId;
  const reqRef = db
    .collection(`companies/${companyId}/tenders/${tenderId}/requirements`)
    .doc(requirementId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new HttpsError('not-found', 'Requirement not found.');

  const { matchStatus } = reqSnap.data();

  if (matchStatus === 'missing')
    throw new HttpsError(
      'failed-precondition',
      'Cannot confirm a missing document — upload it to the vault first.',
    );

  if (matchStatus === 'expired' && !acknowledgedExpiry)
    throw new HttpsError(
      'failed-precondition',
      'You must acknowledge that this document is expired before confirming.',
    );

  await reqRef.update({
    confirmedAt: FieldValue.serverTimestamp(),
    confirmedBy: req.auth.uid,
    acknowledgedExpiry: !!acknowledgedExpiry,
  });

  await audit(
    companyId,
    'confirmRequirement',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `tenders/${tenderId}/requirements/${requirementId}`,
    { matchStatus },
  );

  return { confirmed: true };
});

// ── issueDownloadUrl ───────────────────────────────────────────
// Generates a 15-minute signed URL for a confirmed requirement's
// vault document. Stores the URL + expiry in the requirement record.

export const issueDownloadUrl = onCall(async (req) => {
  assertCompany(req);

  const { tenderId, requirementId } = req.data;
  if (!tenderId || !requirementId)
    throw new HttpsError(
      'invalid-argument',
      'tenderId and requirementId are required.',
    );

  const companyId = req.auth.token.companyId;
  const reqRef = db
    .collection(`companies/${companyId}/tenders/${tenderId}/requirements`)
    .doc(requirementId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new HttpsError('not-found', 'Requirement not found.');

  const { confirmedAt, vaultDocId, matchStatus } = reqSnap.data();

  if (!confirmedAt)
    throw new HttpsError(
      'failed-precondition',
      'Requirement must be confirmed before downloading.',
    );

  if (!vaultDocId)
    throw new HttpsError('failed-precondition', 'No vault document linked.');

  const vaultRef = db
    .collection(`companies/${companyId}/vault`)
    .doc(vaultDocId);
  const vaultSnap = await vaultRef.get();
  if (!vaultSnap.exists)
    throw new HttpsError('not-found', 'Vault document not found.');

  const { storagePath, fileName } = vaultSnap.data();
  const TTL_MS = 15 * 60 * 1000;

  const [url] = await bucket().file(storagePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + TTL_MS,
    responseDisposition: `attachment; filename="${fileName}"`,
  });

  const expiresAt = new Date(Date.now() + TTL_MS);
  await reqRef.update({ downloadUrl: url, downloadUrlExpiresAt: expiresAt });

  await audit(
    companyId,
    'issueDownloadUrl',
    req.auth.uid,
    req.auth.token.email,
    req.rawRequest?.ip,
    `tenders/${tenderId}/requirements/${requirementId}`,
    { vaultDocId, matchStatus, fileName },
  );

  return { downloadUrl: url, expiresAt: expiresAt.toISOString() };
});

// ── scanExpiries (scheduled daily) ────────────────────────────
// Collection-group query across all vault sub-collections.
// Writes alert stubs to the relevant company's auditLog for:
//   - documents already expired
//   - documents expiring within 30 days

export const scanExpiries = onSchedule('every 24 hours', async () => {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [expiringSoon, alreadyExpired] = await Promise.all([
    db
      .collectionGroup('vault')
      .where('expiresAt', '>', now)
      .where('expiresAt', '<=', in30)
      .get(),
    db.collectionGroup('vault').where('expiresAt', '<=', now).get(),
  ]);

  const writes = [];

  for (const doc of [...expiringSoon.docs, ...alreadyExpired.docs]) {
    const d = doc.data();
    // Path: companies/{companyId}/vault/{docId}
    const pathParts = doc.ref.path.split('/');
    const companyId = pathParts[1];
    const isExpired = d.expiresAt.toDate() <= now;

    writes.push(
      db.collection(`companies/${companyId}/auditLog`).add({
        action: isExpired ? 'documentExpired' : 'documentExpiringSoon',
        userId: 'system',
        userEmail: 'system',
        ip: 'system',
        resource: `vault/${doc.id}`,
        metadata: {
          type: d.type,
          fileName: d.fileName,
          expiresAt: d.expiresAt,
          daysUntilExpiry: isExpired
            ? 0
            : Math.ceil((d.expiresAt.toDate() - now) / (1000 * 60 * 60 * 24)),
        },
        timestamp: FieldValue.serverTimestamp(),
      }),
    );
  }

  await Promise.all(writes);

  console.log(
    `scanExpiries: ${expiringSoon.size} expiring soon, ${alreadyExpired.size} expired.`,
  );
});

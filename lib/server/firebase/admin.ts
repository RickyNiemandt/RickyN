import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

/**
 * Reads the service account from FIREBASE_SERVICE_ACCOUNT_KEY. Accepts either
 * raw JSON or base64-encoded JSON so it can live safely in a single secret.
 * Returns null when unset — callers must handle the "not configured" case so
 * the app runs locally without Firebase credentials.
 */
function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const tryParse = (value: string): ServiceAccount | null => {
    try {
      return JSON.parse(value) as ServiceAccount;
    } catch {
      return null;
    }
  };

  return tryParse(raw) ?? tryParse(Buffer.from(raw, "base64").toString("utf8"));
}

export function getFirebaseApp(): App | null {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) return null;
  cachedApp = initializeApp({ credential: cert(serviceAccount) });
  return cachedApp;
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

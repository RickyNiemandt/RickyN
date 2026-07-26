import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.warn(
    `[Tender Vault] Missing Firebase config values: ${missing.join(', ')}. ` +
      'Populate frontend/.env.local from frontend/.env.example.',
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// ── Callable Cloud Functions ───────────────────────────────────

const call = (name) => (data) => httpsCallable(functions, name)(data);

export const callProvisionCompany  = call('provisionCompany');
export const callAddUser           = call('addUser');
export const callRegisterVaultDoc  = call('registerVaultDoc');
export const callDeleteVaultDoc    = call('deleteVaultDoc');
export const callRegisterTender    = call('registerTender');
export const callParseTender       = call('parseTender');
export const callMatchRequirements = call('matchRequirements');
export const callConfirmRequirement = call('confirmRequirement');
export const callIssueDownloadUrl  = call('issueDownloadUrl');

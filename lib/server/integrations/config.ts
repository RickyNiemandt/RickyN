import "server-only";

/**
 * Central, server-only accessor for third-party credentials.
 *
 * Nothing here is prefixed NEXT_PUBLIC_*, so these values are never inlined into
 * the client bundle. Import this module only from server code (API route
 * handlers, Server Actions). The `server-only` import above turns any accidental
 * client import into a build-time error.
 */
export interface IntegrationConfig {
  firebaseServiceAccount: string | null;
  webhookSecret: string | null;
  emailApiKey: string | null;
}

export function getIntegrationConfig(): IntegrationConfig {
  return {
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? null,
    webhookSecret: process.env.WEBHOOK_SECRET ?? null,
    emailApiKey: process.env.EMAIL_API_KEY ?? null,
  };
}

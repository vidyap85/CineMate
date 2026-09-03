import dotenv from 'dotenv';
dotenv.config();

/**
 * CineGemini Secure Secret Retrieval Layer
 * 
 * In production, this module dynamically retrieves sensitive credentials
 * from Google Cloud Secret Manager (or container environment injection).
 * 
 * ZERO HARDCODED SECRETS POLICY:
 * Keys are never committed or exposed to the client.
 */

const secretCache: Record<string, { value: string; fetchedAt: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute secret cache

export async function getSecret(secretName: string): Promise<string> {
  // Check in-memory cache first
  const cached = secretCache[secretName];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  // 1. Check environment variable (Standard Cloud Run / Container injection)
  const envVal = process.env[secretName];
  if (envVal && envVal.trim() !== '' && !envVal.startsWith('REPLACE_WITH_')) {
    secretCache[secretName] = { value: envVal, fetchedAt: Date.now() };
    return envVal;
  }

  // 2. Google Cloud Secret Manager fallback (if GCP SDK is available in production)
  const projectId = process.env.GCP_PROJECT_ID;
  if (projectId && process.env.NODE_ENV === 'production') {
    try {
      // Dynamic import to avoid crash if SDK is not present in local dev
      const pkgName = '@google-cloud/secret-manager';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* @vite-ignore */ pkgName);
      const client = new mod.SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      if (payload) {
        secretCache[secretName] = { value: payload, fetchedAt: Date.now() };
        return payload;
      }
    } catch {
      // Fallback to environment variable or empty string if Secret Manager is not configured
    }
  }

  return envVal || '';
}

export function isSecretConfigured(secretName: string): boolean {
  const val = process.env[secretName];
  return Boolean(val && val.trim() !== '' && !val.startsWith('REPLACE_WITH_') && val !== `MY_${secretName}`);
}

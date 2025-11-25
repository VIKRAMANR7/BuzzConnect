import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value;
}

const requiredEnvs = [
  "MONGODB_URI",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "INNGEST_EVENT_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "SMTP_USER",
  "SMTP_PASS",
  "SENDER_EMAIL",
] as const;

export function validateEnv(): void {
  requiredEnvs.forEach(requireEnv);
}

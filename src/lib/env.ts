const SERVER_ENV_KEYS = {
  databaseUrl: "DATABASE_URL",
  directUrl: "DIRECT_URL",
  nextAuthUrl: "NEXTAUTH_URL",
  nextAuthSecret: "NEXTAUTH_SECRET",
  googleClientId: "GOOGLE_CLIENT_ID",
  googleClientSecret: "GOOGLE_CLIENT_SECRET",
  resendApiKey: "RESEND_API_KEY",
  mailFrom: "MAIL_FROM",
  openAiApiKey: "OPENAI_API_KEY",
  openAiModel: "OPENAI_MODEL",
  vercelUrl: "VERCEL_URL",
} as const;

export class ConfigurationError extends Error {
  readonly missingKeys: string[];

  constructor(message: string, missingKeys: string[] = []) {
    super(message);
    this.name = "ConfigurationError";
    this.missingKeys = missingKeys;
  }
}

function readOptionalEnv(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export const serverEnv = {
  databaseUrl: readOptionalEnv(SERVER_ENV_KEYS.databaseUrl),
  directUrl: readOptionalEnv(SERVER_ENV_KEYS.directUrl),
  nextAuthUrl: readOptionalEnv(SERVER_ENV_KEYS.nextAuthUrl),
  nextAuthSecret: readOptionalEnv(SERVER_ENV_KEYS.nextAuthSecret),
  googleClientId: readOptionalEnv(SERVER_ENV_KEYS.googleClientId),
  googleClientSecret: readOptionalEnv(SERVER_ENV_KEYS.googleClientSecret),
  resendApiKey: readOptionalEnv(SERVER_ENV_KEYS.resendApiKey),
  mailFrom: readOptionalEnv(SERVER_ENV_KEYS.mailFrom),
  openAiApiKey: readOptionalEnv(SERVER_ENV_KEYS.openAiApiKey),
  openAiModel: readOptionalEnv(SERVER_ENV_KEYS.openAiModel),
  vercelUrl: readOptionalEnv(SERVER_ENV_KEYS.vercelUrl),
};

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function getMissingEnv(keys: string[]) {
  return keys.filter((key) => !readOptionalEnv(key));
}

export function hasGoogleOAuthConfig() {
  return Boolean(serverEnv.googleClientId && serverEnv.googleClientSecret);
}

export function hasPasswordResetEmailConfig() {
  return Boolean(serverEnv.resendApiKey && serverEnv.mailFrom);
}

export function requireEnv(keys: string[], message: string) {
  const missingKeys = getMissingEnv(keys);

  if (missingKeys.length) {
    throw new ConfigurationError(message, missingKeys);
  }
}

export function getServerBaseUrl() {
  if (serverEnv.nextAuthUrl) {
    return serverEnv.nextAuthUrl;
  }

  if (serverEnv.vercelUrl) {
    return `https://${serverEnv.vercelUrl}`;
  }

  return "http://localhost:3000";
}


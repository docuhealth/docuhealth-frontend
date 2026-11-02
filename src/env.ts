import { z } from "zod";

// Every VITE_* var is inlined into the client bundle at build time — never put secrets here.
const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_SENTRY_DSN: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  VITE_ENABLE_MOCKS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  // Main domain, e.g. docuhealthservices.net; its subdomains pick the app section (src/lib/sections.ts).
  VITE_ROOT_DOMAIN: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  VITE_PREFILL_FORMS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;

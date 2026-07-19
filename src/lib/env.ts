import { z } from "zod";

// Scoped to what this codebase actually reads today. CLOUDINARY_* etc. are
// declared in .env.example but have zero consumers until that code is
// written — add them here when it is, not ahead of it. AUTH_SECRET/AUTH_URL
// are now consumed by src/lib/auth/ (Sprint B1).
const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

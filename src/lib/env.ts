import { z } from "zod";

// Scoped to what this codebase actually reads today (database connection only).
// AUTH_SECRET/CLOUDINARY_* etc. are declared in .env.example but have zero
// consumers until Auth.js/Cloudinary are wired in — add them here when that
// code is written, not ahead of it.
const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

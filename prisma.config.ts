// Migrations use DIRECT_URL (unpooled) — Prisma Migrate needs a direct
// connection, not one behind a pooler. The runtime client uses DATABASE_URL
// (pooled) via a driver adapter instead — see src/lib/db.ts and
// docs/database/PRISMA_IMPLEMENTATION_GUIDE.md § 2.
//
// Plain `dotenv/config` only reads `.env`, not `.env.local` — but
// .env.example's own instructions (and Next.js's own convention, which the
// app already relies on) put real local values in `.env.local`. Load both,
// `.env.local` first, so it wins where both are set.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});

import { hash, verify } from "@node-rs/argon2";
import type { Options } from "@node-rs/argon2";

// Argon2id — this project's permanent architectural decision (D-030). Deliberately
// no dependency on Auth.js anywhere in this file — password hashing is a general
// security primitive, reusable by anything that ever needs to set or check a
// password (the Credentials provider today, a future Admin-mediated password
// reset, a future Import Engine setting temp passwords for bulk-imported
// Teachers), not something that should require pulling in Auth.js itself.
//
// `algorithm: 2` is `Algorithm.Argon2id` — the library exports that value as
// a `const enum`, which Next.js's `isolatedModules` TypeScript setting
// cannot resolve (each file is transpiled independently, and const enums
// need whole-program type info) — see @node-rs/argon2's own index.d.ts.
const ARGON2ID_OPTIONS: Options = {
  algorithm: 2, // Algorithm.Argon2id
  memoryCost: 19456, // 19 MiB — OWASP's current minimum recommendation for Argon2id
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2ID_OPTIONS);
}

export async function verifyPassword(plain: string, hashedPassword: string): Promise<boolean> {
  return verify(hashedPassword, plain, ARGON2ID_OPTIONS);
}

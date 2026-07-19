import { randomInt } from "node:crypto";
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

// Excludes visually ambiguous characters (0/O, 1/l/I) — this password is
// meant to be read off a screen by an Admin and typed or relayed by phone/
// WhatsApp to a Teacher (docs/product/ADMINISTRATION_STRATEGY.md § 2.2),
// not entered by the same person who generated it.
const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const TEMP_PASSWORD_LENGTH = 12;

// Uses node:crypto's randomInt (CSPRNG-backed), not Math.random() — a
// temporary password is a real credential, not cosmetic data, so it needs
// the same randomness quality as any other security-relevant value.
export function generateTemporaryPassword(): string {
  let password = "";
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)];
  }
  return password;
}

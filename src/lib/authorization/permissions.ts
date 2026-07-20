import type { AccessLevel } from "@/generated/prisma/enums";

// The one canonical place a permission question gets answered — every
// Server Action doing something administrative should call one of these,
// never inline `session.user.accessLevel === "ADMIN"` itself. Per
// docs/domain/PERMISSION_MATRIX.md, every capability below is Admin-only
// today (only two access levels exist, D-001) — the helpers exist as named,
// intention-revealing checks now specifically so a future finer-grained
// permission model (e.g., a Principal-only capability distinct from
// ordinary Administrator) only ever requires editing this one file, not
// hunting down every scattered `=== "ADMIN"` comparison across the codebase.

export interface AuthorizationSubject {
  accessLevel?: AccessLevel;
}

export function canManageUsers(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canManageTeachers(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canResetPasswords(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canDeactivateUsers(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canManageSystemSetup(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

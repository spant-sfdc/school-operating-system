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

// AuditLog is Admin-only, no exceptions — docs/database/AUDIT_STRATEGY.md
// § 7 / docs/domain/PERMISSION_MATRIX.md § 7 ("R, Admin-only, never
// editable by anyone").
export function canViewAuditLog(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

// Client Configuration Framework (Sprint C1, Epic C) — School Identity is
// the same class of sensitive, deployment-wide fact as System Setup
// (D-039); Admin-only, same reasoning.
export function canManageConfiguration(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

// Import Engine (Sprint D1, Epic D) — bulk data mutation at deployment
// scale is at least as sensitive as any single User Management action;
// Admin-only, same reasoning as every other administrative capability
// above.
export function canManageImports(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

// Student Workspace (Sprint E1, Epic E) — four named capabilities per
// docs/domain/PERMISSION_MATRIX.md § 2, kept distinct (not one collapsed
// canManageStudents()) even though all four are Admin-only today, per
// this file's own stated reason for existing: PERMISSION_MATRIX.md
// already describes a scoped Teacher "R (assigned classes only)" row for
// Student — a future /teacher/students route reads canViewStudents()
// unchanged and adds its own scoping, without touching any of the other
// three, if that capability is ever built.
export function canViewStudents(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canManageStudents(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canTransferStudents(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

export function canDeactivateStudents(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

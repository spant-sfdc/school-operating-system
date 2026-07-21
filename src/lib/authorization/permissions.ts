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
// canManageStudents()). canViewStudents() was Admin-only through Sprint
// E1; Sprint E3's own /teacher/students route is exactly the extension
// D-048 named in advance — PERMISSION_MATRIX.md § 2's own scoped Teacher
// "R (assigned classes only)" row for Student — so this function's own
// logic changes here to admit TEACHER, while the other three (mutation
// capabilities) stay Admin-only, untouched. Section-level scoping is
// enforced separately, in the service layer (the same pattern
// canViewAttendance() below already established) — this function only
// answers "does this role participate at all."
export function canViewStudents(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN" || subject.accessLevel === "TEACHER";
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

// Attendance Operations Workspace (Sprint E2, Epic E) — the first
// capability in this codebase genuinely granted to Teacher, not
// Admin-only, per docs/domain/PERMISSION_MATRIX.md § 5 ("AttendanceSession
// | Admin: RU, oversight, all sections | Teacher: CRU, assigned sections
// only"). Section-level scoping ("assigned sections only" for a Teacher)
// is enforced separately, in the service layer, by checking the caller's
// own TeacherAssignment rows — the same "server-side enforcement, never
// only hidden in the UI" principle ARCHITECTURE.md § 7 already states;
// these functions answer only "does this role participate at all."
export function canViewAttendance(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN" || subject.accessLevel === "TEACHER";
}

export function canTakeAttendance(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN" || subject.accessLevel === "TEACHER";
}

export function canSubmitAttendance(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN" || subject.accessLevel === "TEACHER";
}

export function canViewAttendanceHistory(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN" || subject.accessLevel === "TEACHER";
}

// The extension point Sprint E2's own instruction asks for: once a session
// is locked (every enrolled student marked, see
// src/services/attendance/attendanceSessionWorkspace.service.ts's own
// `locked` computation), editing requires this permission. Admin-only and
// not wired to any real override control yet — no UI calls this today; it
// exists so a future "Admin can reopen a locked day" capability is one
// function to change, not a new permission to invent then.
export function canOverrideAttendanceLock(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "ADMIN";
}

// Teacher Workspace (Sprint E3, Epic E) — a self-service view (the "8:00
// AM login" workflow), Teacher-only by design, not Admin — this mirrors
// the existing /teacher/* layout guard's own accessLevel === "TEACHER"
// requirement (src/app/teacher/layout.tsx already blocks Admin before
// this function is ever reached); an Admin-facing cross-teacher oversight
// view is a distinct, unbuilt future capability (the same reasoning
// D-049 already applied to Attendance oversight), not this permission.
export function canViewTeacherWorkspace(subject: AuthorizationSubject): boolean {
  return subject.accessLevel === "TEACHER";
}

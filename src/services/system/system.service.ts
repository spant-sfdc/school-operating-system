import { db } from "@/lib/db";
import {
  checkDatabaseHealth,
  checkMigrationsApplied,
  getDatabaseVersion,
  writeAuditLog,
} from "@/lib/db-utils";
import { getFrameworkVersion } from "@/lib/version";
import { findFirstSchool, updateSchool } from "@/repositories/school";
import { findCurrentAcademicYear, updateAcademicYear } from "@/repositories/academicYear";
import { findRoleByName } from "@/repositories/role";
import { findFirstActiveAdminUser } from "@/repositories/user";
import {
  findFrameworkConfig,
  createFrameworkConfig,
  updateFrameworkConfig,
} from "@/repositories/frameworkConfig";
import {
  updateSchoolDetailsInputSchema,
  type UpdateSchoolDetailsInput,
} from "@/lib/validations/setup";
import { toUserAccountDTO, type UserAccountDTO } from "@/services/administration";
import {
  toSchoolDetailsDTO,
  toFrameworkConfigDTO,
  type SchoolDetailsDTO,
  type SystemReadinessDTO,
  type FrameworkConfigDTO,
} from "@/services/system/dto";

// The Role rows every deployment must have — matches prisma/seed.ts's own
// roleSeeds list exactly (not re-derived or duplicated as a separate
// constant elsewhere; both name this same set because both answer "what
// does D-028's Role design require," not because one copies the other).
const REQUIRED_ROLE_NAMES = ["Administrator", "Principal", "Teacher"];

/**
 * The single source of truth for "is this deployment production-ready" —
 * computed fresh on every call from the actual current state of the
 * database, never from a cached flag. Reused by the Setup Wizard (to decide
 * whether Finalize is allowed), the Admin Home page, and
 * src/app/admin/system/page.tsx's Developer Information view — one
 * function, three consumers, per this sprint's own "one reusable service"
 * instruction.
 */
export async function checkSystemReadiness(): Promise<SystemReadinessDTO> {
  const [dbHealth, migrations] = await Promise.all([
    checkDatabaseHealth(),
    checkMigrationsApplied(),
  ]);

  const school = await findFirstSchool();
  const academicYear = school ? await findCurrentAcademicYear(school.schoolId) : null;
  const adminUser = school ? await findFirstActiveAdminUser(school.schoolId) : null;

  const roles = await Promise.all(REQUIRED_ROLE_NAMES.map((name) => findRoleByName(name)));
  const missingRoles = REQUIRED_ROLE_NAMES.filter((_, index) => !roles[index]);

  const bootstrapReady = adminUser !== null;
  const authenticationReady = adminUser !== null && adminUser.passwordHash !== null;

  const database = {
    ready: dbHealth.healthy,
    detail: dbHealth.healthy ? "Database reachable" : (dbHealth.error ?? "Database unreachable"),
  };
  const schema = {
    ready: migrations.applied,
    detail: migrations.applied
      ? `Latest migration: ${migrations.latestMigration}`
      : (migrations.error ?? "No migrations have been applied"),
  };
  const bootstrap = {
    ready: bootstrapReady,
    detail: bootstrapReady
      ? `Administrator account exists (${adminUser?.email})`
      : "No Administrator account exists yet",
  };
  const rolesCheck = {
    ready: missingRoles.length === 0,
    detail:
      missingRoles.length === 0
        ? REQUIRED_ROLE_NAMES.join(", ")
        : `Missing role(s): ${missingRoles.join(", ")}`,
  };
  const schoolCheck = {
    ready: school !== null,
    detail: school ? school.name : "No School record exists yet",
  };
  const academicYearCheck = {
    ready: academicYear !== null,
    detail: academicYear ? academicYear.label : "No current Academic Year exists yet",
  };
  const authentication = {
    ready: authenticationReady,
    detail: authenticationReady
      ? "Administrator account has a password set"
      : "Administrator account cannot yet authenticate",
  };

  const overallReady =
    database.ready &&
    schema.ready &&
    bootstrap.ready &&
    rolesCheck.ready &&
    schoolCheck.ready &&
    academicYearCheck.ready &&
    authentication.ready;

  return {
    database,
    schema,
    bootstrap,
    roles: rolesCheck,
    school: schoolCheck,
    academicYear: academicYearCheck,
    authentication,
    version: getFrameworkVersion(),
    overallReady,
  };
}

/**
 * Setup Wizard Step 2's read side — School + its current AcademicYear,
 * composed. Returns null if either doesn't exist yet (a deployment that
 * hasn't been seeded at all) — the wizard's own Step 1 result already tells
 * the caller this, so this function doesn't duplicate that explanation.
 */
export async function getSchoolDetails(): Promise<SchoolDetailsDTO | null> {
  const school = await findFirstSchool();
  if (!school) return null;
  const academicYear = await findCurrentAcademicYear(school.schoolId);
  if (!academicYear) return null;
  return toSchoolDetailsDTO(school, academicYear);
}

/**
 * Setup Wizard Step 2's write side — corrects School.name/affiliationBoard
 * and the current AcademicYear.label, the fields actually shown on that
 * step. Not a general School/AcademicYear editing capability (see
 * lib/validations/setup.ts's own scope note) — narrowly what first-time
 * setup verification plausibly needs to fix.
 */
export async function updateSchoolDetails(
  input: UpdateSchoolDetailsInput,
  actorUserId: string,
): Promise<SchoolDetailsDTO> {
  const validated = updateSchoolDetailsInputSchema.parse(input);

  await db.$transaction(async (tx) => {
    const school = await updateSchool(
      validated.schoolId,
      { name: validated.name, affiliationBoard: validated.affiliationBoard },
      tx,
    );
    const academicYear = await updateAcademicYear(
      validated.academicYearId,
      { label: validated.academicYearLabel },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: "School",
      entityId: school.schoolId,
      actorUserId,
      action: "UPDATE",
      afterValue: { name: school.name, affiliationBoard: school.affiliationBoard },
    });
    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: "AcademicYear",
      entityId: academicYear.id,
      actorUserId,
      action: "UPDATE",
      afterValue: { label: academicYear.label },
    });
  });

  const details = await getSchoolDetails();
  if (!details) throw new Error("Failed to reload school details after update.");
  return details;
}

/**
 * Setup Wizard Step 3's read side — reuses administration's own
 * UserAccountDTO (Sprint B2) rather than inventing a parallel "admin user"
 * shape; Step 3's "allow password reset" links directly to the existing
 * /admin/users/[id]/reset-password page and resetUserPassword() Server
 * Action, not a new reset mechanism.
 */
export async function getBootstrapAdminDetails(): Promise<UserAccountDTO | null> {
  const school = await findFirstSchool();
  if (!school) return null;
  const admin = await findFirstActiveAdminUser(school.schoolId);
  return admin ? toUserAccountDTO(admin) : null;
}

export async function getFrameworkConfig(): Promise<FrameworkConfigDTO | null> {
  const row = await findFrameworkConfig();
  return row ? toFrameworkConfigDTO(row) : null;
}

/**
 * A light, single-query check the Admin layout guard calls on every
 * request (the same pattern as the existing mustChangePassword check) — not
 * the full checkSystemReadiness() sweep, which does several reads and is
 * meant for the Wizard/Developer Information views, not every page load.
 */
export async function isSetupComplete(): Promise<boolean> {
  const config = await findFrameworkConfig();
  return config?.setupCompleted === true;
}

/**
 * Setup Wizard Step 4 — marks setup complete, permanently (the Admin layout
 * guard never shows the wizard again once this succeeds). Refuses to
 * complete if checkSystemReadiness() isn't fully green — finalizing an
 * incomplete deployment would defeat the entire purpose of this wizard.
 */
export async function completeSetup(actorUserId: string): Promise<FrameworkConfigDTO> {
  const readiness = await checkSystemReadiness();
  if (!readiness.overallReady) {
    throw new Error("Cannot finalize setup: one or more system readiness checks are not passing.");
  }

  const school = await findFirstSchool();
  if (!school) throw new Error("Cannot finalize setup: no School record exists.");

  const [databaseVersion, migrations, existing] = await Promise.all([
    getDatabaseVersion(),
    checkMigrationsApplied(),
    findFrameworkConfig(),
  ]);

  const snapshot = {
    frameworkVersion: getFrameworkVersion(),
    databaseVersion: databaseVersion ?? null,
    migrationVersion: migrations.latestMigration ?? null,
    setupCompleted: true,
    setupCompletedAt: new Date(),
    setupCompletedBy: actorUserId,
  };

  const row = await db.$transaction(async (tx) => {
    const config = existing
      ? await updateFrameworkConfig(existing.id, snapshot, tx)
      : await createFrameworkConfig(snapshot, tx);

    await writeAuditLog(tx, {
      schoolId: school.schoolId,
      entityType: "FrameworkConfig",
      entityId: config.id,
      actorUserId,
      action: existing ? "UPDATE" : "CREATE",
      afterValue: { setupCompleted: true, frameworkVersion: snapshot.frameworkVersion },
    });

    return config;
  });

  return toFrameworkConfigDTO(row);
}

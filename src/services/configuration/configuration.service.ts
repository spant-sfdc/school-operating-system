import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/db-utils";
import { findFirstSchool, updateSchool } from "@/repositories/school";
import { findCurrentAcademicYear, updateAcademicYear } from "@/repositories/academicYear";
import { BRANDING } from "@/config/branding";
import { SEO_DEFAULTS } from "@/config/seo";
import { SOCIAL_LINKS } from "@/config/social";
import {
  updateSchoolConfigurationInputSchema,
  type UpdateSchoolConfigurationInput,
} from "@/lib/validations/configuration";
import {
  toSchoolConfigurationDTO,
  classifyFieldValue,
  type SchoolConfigurationDTO,
  type ConfigurationSummaryDTO,
  type ConfigurationFieldEntry,
  type ConfigurationPriority,
} from "@/services/configuration/dto";

/**
 * The Client Configuration Framework's one read function — School
 * (extended, Migration 009) + its current AcademicYear, composed. Reused
 * by the Configuration Module's own page and by getConfigurationSummary()
 * below; future consumers (Import Engine, a future Deployment Engine, per
 * this sprint's own "must reuse this" instruction) call this same
 * function rather than querying School/AcademicYear directly.
 */
export async function getSchoolConfiguration(): Promise<SchoolConfigurationDTO | null> {
  const school = await findFirstSchool();
  if (!school) return null;
  const academicYear = await findCurrentAcademicYear(school.schoolId);
  if (!academicYear) return null;
  return toSchoolConfigurationDTO(school, academicYear);
}

/**
 * The Configuration Module's write side. Writes to the *existing* School/
 * AcademicYear repositories (updateSchool()/updateAcademicYear(), both
 * already generic over Prisma.SchoolUpdateInput/AcademicYearUpdateInput
 * since Sprint B3 — zero repository changes needed for this sprint's new
 * fields). Deliberately does not call into src/services/system/ or
 * src/services/administration/ (Epic B, frozen) — this is a new, separate
 * Epic C service reusing the same foundational repositories, not modifying
 * or routing through Epic B's own business logic.
 */
export async function updateSchoolConfiguration(
  input: UpdateSchoolConfigurationInput,
  actorUserId: string,
): Promise<SchoolConfigurationDTO> {
  const validated = updateSchoolConfigurationInputSchema.parse(input);

  await db.$transaction(async (tx) => {
    const school = await updateSchool(
      validated.schoolId,
      {
        name: validated.name,
        shortName: validated.shortName,
        tagline: validated.tagline,
        affiliationBoard: validated.affiliationBoard,
        medium: validated.medium,
        principalName: validated.principalName,
        principalTitle: validated.principalTitle,
        email: validated.email,
        phone: validated.phone,
        address: validated.address,
        schoolTimings: validated.schoolTimings,
        officeTimings: validated.officeTimings,
        logoUrl: validated.logoUrl,
        faviconUrl: validated.faviconUrl,
      },
      tx,
    );
    const academicYear = await updateAcademicYear(
      validated.academicYearId,
      { label: validated.academicYearLabel },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: "SchoolConfiguration",
      entityId: school.schoolId,
      actorUserId,
      action: "UPDATE",
      afterValue: {
        name: school.name,
        shortName: school.shortName,
        tagline: school.tagline,
        affiliationBoard: school.affiliationBoard,
        medium: school.medium,
        principalName: school.principalName,
        email: school.email,
        phone: school.phone,
        academicYearLabel: academicYear.label,
      },
    });
  });

  const details = await getSchoolConfiguration();
  if (!details) throw new Error("Failed to reload school configuration after update.");
  return details;
}

interface FieldSpec {
  key: string;
  label: string;
  section: ConfigurationFieldEntry["section"];
  editable: boolean;
  priority: ConfigurationPriority;
  value: string | null;
  note?: string;
}

function buildFieldEntries(config: SchoolConfigurationDTO | null): ConfigurationFieldEntry[] {
  const socialConfiguredCount = Object.values(SOCIAL_LINKS).filter((url) => url !== null).length;

  const specs: FieldSpec[] = [
    // School Identity — editable, database-backed (Migration 009).
    {
      key: "name",
      label: "School Name",
      section: "School Identity",
      editable: true,
      priority: "P0",
      value: config?.name ?? null,
    },
    {
      key: "shortName",
      label: "Short Name",
      section: "School Identity",
      editable: true,
      priority: "P2",
      value: config?.shortName ?? null,
    },
    {
      key: "tagline",
      label: "Tagline",
      section: "School Identity",
      editable: true,
      priority: "P2",
      value: config?.tagline ?? null,
    },
    {
      key: "affiliationBoard",
      label: "Board",
      section: "School Identity",
      editable: true,
      priority: "P0",
      value: config?.affiliationBoard ?? null,
    },
    {
      key: "medium",
      label: "Medium of Instruction",
      section: "School Identity",
      editable: true,
      priority: "P2",
      value: config?.medium ?? null,
    },
    {
      key: "principalName",
      label: "Principal Name",
      section: "School Identity",
      editable: true,
      priority: "P0",
      value: config?.principalName ?? null,
    },
    {
      key: "principalTitle",
      label: "Principal Title",
      section: "School Identity",
      editable: true,
      priority: "P2",
      value: config?.principalTitle ?? null,
    },
    {
      key: "email",
      label: "Contact Email",
      section: "School Identity",
      editable: true,
      priority: "P0",
      value: config?.email ?? null,
    },
    {
      key: "phone",
      label: "Contact Phone",
      section: "School Identity",
      editable: true,
      priority: "P0",
      value: config?.phone ?? null,
    },
    {
      key: "address",
      label: "Address",
      section: "School Identity",
      editable: true,
      priority: "P1",
      value: config?.address ?? null,
    },
    {
      key: "logoUrl",
      label: "Logo URL",
      section: "School Identity",
      editable: true,
      priority: "P2",
      value: config?.logoUrl ?? null,
    },
    {
      key: "faviconUrl",
      label: "Favicon URL",
      section: "School Identity",
      editable: true,
      priority: "P1",
      value: config?.faviconUrl ?? null,
    },

    // Academic — editable, database-backed.
    {
      key: "academicYearLabel",
      label: "Academic Year",
      section: "Academic",
      editable: true,
      priority: "P1",
      value: config?.academicYearLabel ?? null,
    },
    {
      key: "schoolTimings",
      label: "School Timings",
      section: "Academic",
      editable: true,
      priority: "P0",
      value: config?.schoolTimings ?? null,
    },
    {
      key: "officeTimings",
      label: "Office Timings",
      section: "Academic",
      editable: true,
      priority: "P1",
      value: config?.officeTimings ?? null,
    },

    // Theme / Website / Social — read-only, framework- or website-owned
    // (src/config/*.ts) — displayed for visibility per this sprint's own
    // instruction, not editable here (see the Branding Review reasoning
    // in docs/DECISIONS.md's Sprint C1 entry).
    {
      key: "primaryColor",
      label: "Primary Brand Color",
      section: "Theme",
      editable: false,
      priority: "P2",
      value: BRANDING.primaryColor.isPlaceholder ? null : BRANDING.primaryColor.token,
      note: `Token: ${BRANDING.primaryColor.token} — edit src/app/globals.css to change the actual color (D-010)`,
    },
    {
      key: "seoMetadata",
      label: "SEO Metadata",
      section: "Website",
      editable: false,
      priority: "P2",
      value: SEO_DEFAULTS.siteName,
      note: "Derived from School Name — edit src/config/seo.ts for OpenGraph/Twitter defaults",
    },
    {
      key: "socialLinks",
      label: "Social Media Links",
      section: "Social",
      editable: false,
      priority: "P2",
      value: socialConfiguredCount > 0 ? `${socialConfiguredCount} of 4 configured` : null,
      note: "Edit src/config/social.ts — not yet wired to SiteFooter (see that config's own README)",
    },
  ];

  return specs.map((spec) => ({
    key: spec.key,
    label: spec.label,
    section: spec.section,
    editable: spec.editable,
    priority: spec.priority,
    value: spec.value,
    status: classifyFieldValue(spec.value, spec.priority),
    note: spec.note,
  }));
}

/**
 * Client Configuration Service's "summarize completion" capability — the
 * Configuration Module's own status column and Developer Information's
 * "Configuration Completion"/"Placeholder Count" extension both call this
 * one function, per this sprint's own "one reusable service... future
 * Import Engine and Deployment Engine must reuse this" instruction.
 */
export async function getConfigurationSummary(): Promise<ConfigurationSummaryDTO> {
  const config = await getSchoolConfiguration();
  const fields = buildFieldEntries(config);

  const configuredCount = fields.filter((f) => f.status === "Configured").length;
  const missingCount = fields.filter((f) => f.status === "Missing").length;
  const placeholderCount = fields.filter((f) => f.status === "Placeholder").length;
  const needsAttentionCount = fields.filter((f) => f.status === "NeedsAttention").length;

  return {
    fields,
    totalFields: fields.length,
    configuredCount,
    missingCount,
    placeholderCount,
    needsAttentionCount,
    completionPercent: Math.round((configuredCount / fields.length) * 100),
  };
}

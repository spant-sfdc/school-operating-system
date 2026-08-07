"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import {
  createSchoolClassWithSections,
  updateSchoolClass,
  deactivateSchoolClass,
  reactivateSchoolClass,
  createStandaloneSection,
  updateSection,
  deactivateSection,
  reactivateSection,
} from "@/services/academic";
import { assignGradeScaleToSchoolClass } from "@/services/examination";
import { findCurrentAcademicYear } from "@/repositories/academicYear";

const LIST_PATH = "/admin/settings/classes";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}
function detailPath(schoolClassId: string): string {
  return `${LIST_PATH}/${schoolClassId}`;
}

export async function createSchoolClassAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const currentYear = await findCurrentAcademicYear(session.schoolId);
  if (!currentYear) {
    redirect(`${LIST_PATH}?error=${encodeURIComponent("No current Academic Year is active.")}`);
  }

  const sectionNames = field(formData, "sectionNames")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  try {
    await createSchoolClassWithSections(
      {
        schoolId: session.schoolId,
        academicYearId: currentYear.id,
        className: field(formData, "className"),
        sortOrder: Number(field(formData, "sortOrder") || "0"),
        sectionNames,
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create class.";
    redirect(`${LIST_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${LIST_PATH}?created=1`);
}

export async function updateSchoolClassAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  try {
    await updateSchoolClass(
      {
        schoolClassId,
        name: field(formData, "name"),
        sortOrder: Number(field(formData, "sortOrder") || "0"),
      },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update class.";
    redirect(`${detailPath(schoolClassId)}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${detailPath(schoolClassId)}?updated=1`);
}

export async function deactivateSchoolClassAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  await deactivateSchoolClass(schoolClassId, session.userId, session.schoolId);
  redirect(`${detailPath(schoolClassId)}?deactivated=1`);
}

export async function reactivateSchoolClassAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  await reactivateSchoolClass(schoolClassId, session.userId, session.schoolId);
  redirect(`${detailPath(schoolClassId)}?reactivated=1`);
}

export async function createSectionAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  const currentYear = await findCurrentAcademicYear(session.schoolId);
  if (!currentYear) {
    redirect(
      `${detailPath(schoolClassId)}?error=${encodeURIComponent("No current Academic Year is active.")}`,
    );
  }
  try {
    await createStandaloneSection(
      {
        schoolClassId,
        academicYearId: currentYear.id,
        name: field(formData, "name"),
        capacity: field(formData, "capacity") ? Number(field(formData, "capacity")) : undefined,
      },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create section.";
    redirect(`${detailPath(schoolClassId)}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${detailPath(schoolClassId)}?sectionCreated=1`);
}

export async function updateSectionAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  try {
    await updateSection(
      {
        sectionId: field(formData, "sectionId"),
        name: field(formData, "name"),
        capacity: field(formData, "capacity") ? Number(field(formData, "capacity")) : undefined,
      },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update section.";
    redirect(`${detailPath(schoolClassId)}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${detailPath(schoolClassId)}?sectionUpdated=1`);
}

export async function deactivateSectionAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  await deactivateSection(field(formData, "sectionId"), session.userId, session.schoolId);
  redirect(`${detailPath(schoolClassId)}?sectionDeactivated=1`);
}

export async function reactivateSectionAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  await reactivateSection(field(formData, "sectionId"), session.userId, session.schoolId);
  redirect(`${detailPath(schoolClassId)}?sectionReactivated=1`);
}

export async function assignGradeScaleAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const schoolClassId = field(formData, "schoolClassId");
  const gradeScaleId = field(formData, "gradeScaleId") || null;
  try {
    await assignGradeScaleToSchoolClass(
      schoolClassId,
      gradeScaleId,
      session.schoolId,
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign grade scale.";
    redirect(`${detailPath(schoolClassId)}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${detailPath(schoolClassId)}?gradeScaleAssigned=1`);
}

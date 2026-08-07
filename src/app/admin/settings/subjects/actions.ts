"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import {
  createAcademicSubject,
  updateSubject,
  deactivateSubject,
  reactivateSubject,
  assignSubjectToClasses,
} from "@/services/academic";

const LIST_PATH = "/admin/settings/subjects";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

export async function createSubjectAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  try {
    await createAcademicSubject(
      {
        schoolId: session.schoolId,
        name: field(formData, "name"),
        code: field(formData, "code") || undefined,
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subject.";
    redirect(`${LIST_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${LIST_PATH}?created=1`);
}

export async function updateSubjectAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  try {
    await updateSubject(
      {
        subjectId: field(formData, "subjectId"),
        name: field(formData, "name"),
        code: field(formData, "code") || undefined,
      },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update subject.";
    redirect(`${LIST_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${LIST_PATH}?updated=1`);
}

export async function deactivateSubjectAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  await deactivateSubject(field(formData, "subjectId"), session.userId, session.schoolId);
  redirect(`${LIST_PATH}?deactivated=1`);
}

export async function reactivateSubjectAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  await reactivateSubject(field(formData, "subjectId"), session.userId, session.schoolId);
  redirect(`${LIST_PATH}?reactivated=1`);
}

export async function assignSubjectToClassesAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const subjectId = field(formData, "subjectId");
  const schoolClassIds = formData.getAll("schoolClassIds").map(String);
  try {
    await assignSubjectToClasses({ subjectId, schoolClassIds }, session.userId, session.schoolId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign classes.";
    redirect(`${LIST_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${LIST_PATH}?assigned=1`);
}

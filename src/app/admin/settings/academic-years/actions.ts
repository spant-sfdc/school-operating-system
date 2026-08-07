"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import {
  createAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  setAcademicYearStatus,
} from "@/services/academic";

const BASE_PATH = "/admin/settings/academic-years";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

export async function createAcademicYearAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  try {
    await createAcademicYear(
      {
        schoolId: session.schoolId,
        label: field(formData, "label"),
        startDate: field(formData, "startDate"),
        endDate: field(formData, "endDate"),
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create academic year.";
    redirect(`${BASE_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${BASE_PATH}?created=1`);
}

export async function updateAcademicYearAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  try {
    await updateAcademicYear(
      {
        academicYearId: field(formData, "academicYearId"),
        label: field(formData, "label"),
        startDate: field(formData, "startDate"),
        endDate: field(formData, "endDate"),
      },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update academic year.";
    redirect(`${BASE_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${BASE_PATH}?updated=1`);
}

export async function activateAcademicYearAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  try {
    await activateAcademicYear(
      { academicYearId: field(formData, "academicYearId") },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to activate academic year.";
    redirect(`${BASE_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${BASE_PATH}?activated=1`);
}

export async function setAcademicYearStatusAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageAcademicStructure);
  const status = field(formData, "status") === "CLOSED" ? "CLOSED" : "ACTIVE";
  try {
    await setAcademicYearStatus(
      { academicYearId: field(formData, "academicYearId"), status },
      session.userId,
      session.schoolId,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update academic year status.";
    redirect(`${BASE_PATH}?error=${encodeURIComponent(message)}`);
  }
  redirect(`${BASE_PATH}?statusUpdated=1`);
}

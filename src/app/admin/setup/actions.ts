"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageSystemSetup } from "@/lib/authorization";
import { updateSchoolDetails, completeSetup } from "@/services/system";

export async function updateSchoolDetailsAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageSystemSetup);

  const schoolId = formData.get("schoolId");
  const academicYearId = formData.get("academicYearId");
  const name = formData.get("name");
  const affiliationBoard = formData.get("affiliationBoard");
  const academicYearLabel = formData.get("academicYearLabel");

  try {
    await updateSchoolDetails(
      {
        schoolId: typeof schoolId === "string" ? schoolId : "",
        academicYearId: typeof academicYearId === "string" ? academicYearId : "",
        name: typeof name === "string" ? name : "",
        affiliationBoard:
          typeof affiliationBoard === "string" && affiliationBoard.length > 0
            ? affiliationBoard
            : undefined,
        academicYearLabel: typeof academicYearLabel === "string" ? academicYearLabel : "",
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update school details.";
    redirect(`/admin/setup?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/setup?updated=1");
}

export async function finalizeSetupAction(): Promise<void> {
  const session = await requirePermission(canManageSystemSetup);

  try {
    await completeSetup(session.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to finalize setup.";
    redirect(`/admin/setup?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin");
}

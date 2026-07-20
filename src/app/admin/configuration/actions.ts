"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageConfiguration } from "@/lib/authorization";
import { updateSchoolConfiguration } from "@/services/configuration";

export async function updateConfigurationAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageConfiguration);

  const field = (name: string): string | undefined => {
    const value = formData.get(name);
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };

  const schoolId = String(formData.get("schoolId") ?? "");
  const academicYearId = String(formData.get("academicYearId") ?? "");

  try {
    await updateSchoolConfiguration(
      {
        schoolId,
        academicYearId,
        name: field("name") ?? "",
        shortName: field("shortName"),
        tagline: field("tagline"),
        affiliationBoard: field("affiliationBoard"),
        medium: field("medium"),
        principalName: field("principalName"),
        principalTitle: field("principalTitle"),
        email: field("email"),
        phone: field("phone"),
        address: field("address"),
        academicYearLabel: field("academicYearLabel") ?? "",
        schoolTimings: field("schoolTimings"),
        officeTimings: field("officeTimings"),
        logoUrl: field("logoUrl"),
        faviconUrl: field("faviconUrl"),
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update configuration.";
    redirect(`/admin/configuration?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/configuration?updated=1");
}

"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageTeachers } from "@/lib/authorization";
import { editTeacherProfile, reactivateTeacher, deactivateTeacher } from "@/services/teacher";

// Reset Password is deliberately not a Server Action here — it's a real
// Quick Action that navigates straight to the already-existing
// /admin/users/[userId]/reset-password page (Sprint B2, unchanged), per
// this sprint's own "No duplicated screens" reuse rule. Activate/
// Deactivate/Edit below are the three genuinely Teacher-domain-owned
// mutations (Teacher.status, Teacher's own profile fields) that have no
// equivalent anywhere else.

export async function editTeacherAction(teacherId: string, formData: FormData): Promise<void> {
  const session = await requirePermission(canManageTeachers);

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phone = formData.get("phone");
  const gender = formData.get("gender");
  const dateOfBirth = formData.get("dateOfBirth");
  const photoUrl = formData.get("photoUrl");

  try {
    await editTeacherProfile(
      {
        teacherId,
        firstName: typeof firstName === "string" && firstName.length > 0 ? firstName : undefined,
        lastName: typeof lastName === "string" && lastName.length > 0 ? lastName : undefined,
        phone: typeof phone === "string" && phone.length > 0 ? phone : undefined,
        gender: typeof gender === "string" && gender.length > 0 ? gender : undefined,
        dateOfBirth:
          typeof dateOfBirth === "string" && dateOfBirth.length > 0
            ? new Date(dateOfBirth)
            : undefined,
        photoUrl: typeof photoUrl === "string" && photoUrl.length > 0 ? photoUrl : undefined,
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to edit teacher.";
    redirect(`/admin/teachers/${teacherId}/edit?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/teachers/${teacherId}`);
}

export async function activateTeacherAction(teacherId: string): Promise<void> {
  const session = await requirePermission(canManageTeachers);
  await reactivateTeacher({ teacherId }, session.userId);
  redirect(`/admin/teachers/${teacherId}`);
}

export async function deactivateTeacherAction(teacherId: string): Promise<void> {
  const session = await requirePermission(canManageTeachers);
  await deactivateTeacher({ teacherId }, session.userId);
  redirect(`/admin/teachers/${teacherId}`);
}

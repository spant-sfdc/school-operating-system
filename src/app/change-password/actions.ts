"use server";

import { redirect } from "next/navigation";

import { requireSession } from "@/lib/authorization";
import { changeOwnPassword } from "@/services/administration";

export async function changePasswordAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  try {
    await changeOwnPassword(
      {
        currentPassword: typeof currentPassword === "string" ? currentPassword : "",
        newPassword: typeof newPassword === "string" ? newPassword : "",
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password.";
    redirect(`/change-password?error=${encodeURIComponent(message)}`);
  }

  redirect(session.accessLevel === "ADMIN" ? "/admin" : "/teacher");
}

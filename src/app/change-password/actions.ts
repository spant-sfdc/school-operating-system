"use server";

import { redirect } from "next/navigation";

import { requireSession, resolvePostLoginRedirect } from "@/lib/authorization";
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

  // changeOwnPassword() above just cleared mustChangePassword — the same
  // resolver the login page uses computes the role landing page here too,
  // so the two never independently define "where does this role belong"
  // — see D-038.
  redirect(
    resolvePostLoginRedirect({ accessLevel: session.accessLevel, mustChangePassword: false }),
  );
}

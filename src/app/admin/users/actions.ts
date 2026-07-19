"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requirePermission, canManageUsers } from "@/lib/authorization";
import {
  createUserAccount,
  editUserAccount,
  activateUserAccount,
  deactivateUserAccount,
  resetUserPassword,
  type ProvisionedCredentialDTO,
} from "@/services/administration";

// The one-time temporary password is handed off via a short-lived,
// httpOnly cookie rather than a useActionState result or a URL query
// param — a URL would leave it in browser history and server access logs,
// and a plain Server Component destination page (User Details) can read a
// cookie during render without needing a Client Component just to display
// a value once. It expires on its own after
// TEMP_PASSWORD_FLASH_MAX_AGE_SECONDS, which stands in for "shown once".
const TEMP_PASSWORD_FLASH_COOKIE = "flash_temp_password";
const TEMP_PASSWORD_FLASH_MAX_AGE_SECONDS = 60;

async function setTemporaryPasswordFlash(password: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TEMP_PASSWORD_FLASH_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TEMP_PASSWORD_FLASH_MAX_AGE_SECONDS,
    path: "/admin/users",
  });
}

export async function readTemporaryPasswordFlash(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TEMP_PASSWORD_FLASH_COOKIE)?.value;
}

export async function createUserAction(formData: FormData): Promise<void> {
  const session = await requirePermission(canManageUsers);

  let result: ProvisionedCredentialDTO;
  try {
    result = await createUserAccount(
      {
        schoolId: session.schoolId,
        roleId: String(formData.get("roleId") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    redirect(`/admin/users/new?error=${encodeURIComponent(message)}`);
  }

  await setTemporaryPasswordFlash(result.temporaryPassword);
  redirect(`/admin/users/${result.user.id}?created=1`);
}

export async function resetPasswordAction(userId: string): Promise<void> {
  const session = await requirePermission(canManageUsers);

  let result: ProvisionedCredentialDTO;
  try {
    result = await resetUserPassword({ userId }, session.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password.";
    redirect(`/admin/users/${userId}/reset-password?error=${encodeURIComponent(message)}`);
  }

  await setTemporaryPasswordFlash(result.temporaryPassword);
  redirect(`/admin/users/${result.user.id}?created=1`);
}

// No secret to display — a plain redirect-on-success, error-via-query-param
// pattern is sufficient (matches src/app/(auth)/login/page.tsx's own
// established shape from Sprint B1).
export async function editUserAction(userId: string, formData: FormData): Promise<void> {
  const session = await requirePermission(canManageUsers);

  const name = formData.get("name");
  const roleId = formData.get("roleId");

  try {
    await editUserAccount(
      {
        userId,
        name: typeof name === "string" && name.length > 0 ? name : undefined,
        roleId: typeof roleId === "string" && roleId.length > 0 ? roleId : undefined,
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to edit user.";
    redirect(`/admin/users/${userId}/edit?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/users/${userId}`);
}

export async function activateUserAction(userId: string): Promise<void> {
  const session = await requirePermission(canManageUsers);
  await activateUserAccount({ userId }, session.userId);
  redirect(`/admin/users/${userId}`);
}

export async function deactivateUserAction(userId: string): Promise<void> {
  const session = await requirePermission(canManageUsers);
  await deactivateUserAccount({ userId }, session.userId);
  redirect(`/admin/users/${userId}`);
}

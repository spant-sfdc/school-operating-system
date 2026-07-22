import { notFound } from "next/navigation";

import { requirePermission, canManageTeachers } from "@/lib/authorization";
import { findTeacherById } from "@/repositories/teacher";
import { editTeacherAction } from "@/app/admin/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mirrors src/app/admin/users/[id]/edit/page.tsx's own shape exactly
// (Sprint E5) — profile fields only; `status` (Active/On Leave/Exited)
// stays out of this form entirely, changed only via the Teacher 360's own
// Activate/Deactivate Quick Actions, never bundled into a plain field edit.
export default async function EditTeacherPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission(canManageTeachers);
  const { id } = await params;
  const { error } = await searchParams;

  const teacher = await findTeacherById(id);
  if (!teacher) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Teacher</h1>

      <form action={editTeacherAction.bind(null, teacher.id)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={teacher.firstName} maxLength={80} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={teacher.lastName} maxLength={80} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={teacher.phone} maxLength={20} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" name="gender" defaultValue={teacher.gender ?? ""} maxLength={20} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={teacher.dateOfBirth ? teacher.dateOfBirth.toISOString().slice(0, 10) : ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="photoUrl">Photo URL</Label>
          <Input id="photoUrl" name="photoUrl" defaultValue={teacher.photoUrl ?? ""} type="url" />
        </div>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <Button type="submit">Save</Button>
      </form>
    </main>
  );
}

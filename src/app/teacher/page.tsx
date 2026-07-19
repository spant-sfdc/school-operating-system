import { auth } from "@/lib/auth";

// A guard-verification stub, not a dashboard — see src/app/admin/page.tsx's
// own comment for why this is necessary infrastructure, not scope creep.
export default async function TeacherPlaceholderPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <p>Teacher area — signed in as {session?.user?.email}.</p>
    </main>
  );
}

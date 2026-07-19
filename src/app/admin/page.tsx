import { auth } from "@/lib/auth";

// A guard-verification stub, not a dashboard — Next.js only ever invokes a
// segment's layout.tsx (src/app/admin/layout.tsx) while resolving an actual
// matched route within that segment; with zero page.tsx files under
// src/app/admin/, every request to /admin/* 404s before the layout's guard
// ever runs, making the guard untestable and, in effect, not really route
// protection at all. This is the minimum needed to make it real. Real
// dashboard content is explicitly out of this sprint's scope.
export default async function AdminPlaceholderPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <p>Admin area — signed in as {session?.user?.email}.</p>
    </main>
  );
}

import Link from "next/link";

import { auth } from "@/lib/auth";

// Still not a dashboard (Sprint B2's own "no polished UI, focus on
// functionality" instruction) — a bare link list to the one real feature
// this sprint built. Real dashboard content remains out of scope.
export default async function AdminPlaceholderPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p>Admin area — signed in as {session?.user?.email}.</p>
      <Link href="/admin/users" className="text-primary underline">
        Manage Users
      </Link>
    </main>
  );
}

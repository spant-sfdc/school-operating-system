import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Deliberately does NOT import from @/lib/auth (the full config, with the
// PrismaAdapter and the session callback's live deactivation check) — that
// combination needs a Node.js runtime, and this file runs on the default
// Edge runtime. `getToken()` verifies the JWT's signature directly (Edge-
// compatible, no database) without running any callback, giving a fast
// "is there a plausible session at all" gate here. The authoritative check
// — is this specific role allowed here, is the account still active — runs
// in src/app/admin/layout.tsx and src/app/teacher/layout.tsx, which call the
// real auth() (Node runtime, Server Components always run there) and do hit
// the database via resolveActiveSessionUser() on every request. This two-
// tier split (cheap Edge pre-check, authoritative Node check) is Auth.js's
// own documented pattern for JWT sessions plus database-backed authorization
// data, not a shortcut around real protection — a deactivated or wrong-role
// user still cannot reach protected content, they are just caught one layer
// later than an unauthenticated user is.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\..*).*)"],
};

// Public website routes — no authentication required. Matched by prefix,
// not exact path, since several of these have dynamic segments
// (/notices/[id]) or planned-but-unbuilt children (/admissions/enquiry).
const PUBLIC_PATH_PREFIXES = [
  "/about",
  "/academics",
  "/campus",
  "/facilities",
  "/school-life",
  "/admissions",
  "/notices",
  "/gallery",
  "/documents",
  "/contact",
  "/dev",
  "/login",
  "/unauthorized",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Coarse admin-vs-teacher path authorization deliberately not implemented
  // here — see docs/DECISIONS.md's Sprint B1 entry: (admin)/(teacher) were
  // renamed from colliding route groups to real /admin, /teacher path
  // segments this sprint specifically so this becomes possible, but no
  // Admin/Teacher page exists yet to protect differently ("do not build
  // dashboards yet"). src/app/admin/layout.tsx and src/app/teacher/layout.tsx
  // enforce the actual accessLevel-specific, deactivation-aware guard once
  // real pages land under them; this middleware's job is only the coarse
  // "is there a plausible session at all" gate for every non-public path.
  return NextResponse.next();
}

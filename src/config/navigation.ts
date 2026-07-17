export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Campus", href: "/campus" },
  { label: "School Life", href: "/school-life" },
  { label: "Admissions", href: "/admissions" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/notices" },
  { label: "Downloads", href: "/documents" },
  { label: "Contact", href: "/contact" },
];

// Footer and mobile nav currently render the same items as the public header
// nav — kept as aliases rather than copies so the three stay in sync by
// construction. Split into their own arrays only if their content genuinely
// needs to diverge.
export const FOOTER_NAV_LINKS: NavLink[] = NAV_LINKS;
export const MOBILE_NAV_LINKS: NavLink[] = NAV_LINKS;

// Teacher/Admin route groups exist in ROUTES.md but have no nav UI yet
// (Phase 2+) — empty placeholders so that work has a single, already-known
// place to add them, rather than a new ad hoc file per role.
export const TEACHER_NAV_LINKS: NavLink[] = [];
export const ADMIN_NAV_LINKS: NavLink[] = [];

import { SCHOOL } from "./school";

// No logo/favicon assets exist yet — src fields are null until School Admin
// or a design pass provides real files. Do not point these at a fabricated
// path; a null src is the honest state today.
export const BRANDING = {
  logo: {
    src: null as string | null,
    alt: `${SCHOOL.name} logo`,
  },
  favicon: {
    src: null as string | null,
  },
  // The enforced source of truth for color is src/app/globals.css's CSS custom
  // properties (Tailwind v4 @theme) — see DECISIONS.md § D-010. Intentionally
  // not duplicating the raw oklch() values here; that would create a second,
  // driftable source of truth for the same colors. `token` names the CSS
  // variable so other config/consumers can point at the right one by name.
  primaryColor: {
    token: "--primary",
    isPlaceholder: true,
  },
  accentColor: {
    token: "--primary",
    isPlaceholder: true,
  },
  theme: {
    modes: ["light", "dark"] as const,
    default: "light" as const,
    storageKey: "pps-theme",
  },
} as const;

// No real social profiles confirmed yet — all null until School Admin
// provides them. src/components/website/SiteFooter.tsx renders its own
// disabled "coming soon" icons today and does not yet read these URLs; see
// that component's README/IMPLEMENTATION_LOG for why they aren't wired
// together yet.
export const SOCIAL_LINKS = {
  facebook: null as string | null,
  instagram: null as string | null,
  youtube: null as string | null,
  linkedin: null as string | null,
} as const;

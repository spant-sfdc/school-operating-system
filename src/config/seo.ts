import { SCHOOL } from "./school";

export const SEO_DEFAULTS = {
  siteName: SCHOOL.name,
  defaultTitle: SCHOOL.name,
  defaultDescription: `${SCHOOL.name} Digital Platform`,
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  openGraph: {
    type: "website" as const,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image" as const,
  },
} as const;

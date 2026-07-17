import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/admissions";
const PAGE_TITLE = `Admissions | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Admissions at ${SEO_DEFAULTS.siteName} — process, eligibility, required documents, fees, and answers to common questions for Nursery through Class 8.`;

export const admissionsMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const admissionsJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

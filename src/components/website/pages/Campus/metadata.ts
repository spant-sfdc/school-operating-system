import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/campus";
const PAGE_TITLE = `Campus | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `The ${SEO_DEFAULTS.siteName} campus — classrooms, library, computer learning, sports facilities, and student wellbeing, where students spend their day.`;

export const campusMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const campusJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/contact";
const PAGE_TITLE = `Contact & Visit | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Contact details, office and visit hours, and how to plan a campus visit at ${SEO_DEFAULTS.siteName}.`;

export const contactMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const contactJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

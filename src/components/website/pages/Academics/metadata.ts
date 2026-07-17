import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/academics";
const PAGE_TITLE = `Academics | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Academics at ${SEO_DEFAULTS.siteName} — our teaching philosophy, learning stages from Nursery to Class 8, subjects, methodology, co-curricular activities, and assessment approach.`;

export const academicsMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const academicsJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/school-life";
const PAGE_TITLE = `School Life | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Life beyond the classroom at ${SEO_DEFAULTS.siteName} — annual events, sports, cultural activities, celebrations, and student achievements.`;

export const schoolLifeMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const schoolLifeJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

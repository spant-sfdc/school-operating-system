import { SCHOOL } from "@/config/school";
import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/about";
const PAGE_TITLE = `About Us | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Learn about ${SEO_DEFAULTS.siteName}'s story, mission, values, and the people behind a calmer, more considered approach to education in ${SCHOOL.locationShort}.`;

export const aboutMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const aboutJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  type: "AboutPage",
});

import { SEO_DEFAULTS } from "@/config/seo";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_PATH = "/documents";
const PAGE_TITLE = `Document Center | ${SEO_DEFAULTS.siteName}`;
const PAGE_DESCRIPTION = `Official forms, academic documents, mandatory public disclosures, and policies from ${SEO_DEFAULTS.siteName}.`;

export const documentCenterMetadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

export const documentCenterJsonLd = buildPageJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
});

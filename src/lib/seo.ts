import type { Metadata } from "next";

import { SEO_DEFAULTS } from "@/config/seo";

interface PageSeoInput {
  path: string;
  title: string;
  description: string;
}

export function buildPageMetadata({ path, title, description }: PageSeoInput): Metadata {
  const url = `${SEO_DEFAULTS.siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SEO_DEFAULTS.siteName,
      type: SEO_DEFAULTS.openGraph.type,
      locale: SEO_DEFAULTS.openGraph.locale,
    },
    twitter: {
      card: SEO_DEFAULTS.twitter.card,
      title,
      description,
    },
  };
}

export function buildPageJsonLd({
  path,
  title,
  description,
  type = "WebPage",
}: PageSeoInput & { type?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url: `${SEO_DEFAULTS.siteUrl}${path}`,
    isPartOf: {
      "@type": "EducationalOrganization",
      name: SEO_DEFAULTS.siteName,
    },
  };
}

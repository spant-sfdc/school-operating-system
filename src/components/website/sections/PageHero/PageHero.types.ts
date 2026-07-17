import type { SectionCta } from "@/components/website/sections/shared/types";

export interface PageHeroBreadcrumb {
  label: string;
  href?: string;
}

export type PageHeroVariant = "default" | "compact" | "image" | "minimal";

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: PageHeroBreadcrumb[];
  cta?: SectionCta;
  secondaryCta?: SectionCta;
  backgroundImage?: {
    src: string;
    alt: string;
  };
  overlay?: boolean;
  variant?: PageHeroVariant;
  className?: string;
}

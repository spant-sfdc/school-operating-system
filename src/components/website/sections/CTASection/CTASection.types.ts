import type { SectionCta } from "@/components/website/sections/shared/types";

export type CTASectionLayout = "centered" | "split";

export interface CTASectionProps {
  title: string;
  description?: string;
  primaryCta: SectionCta;
  secondaryCta?: SectionCta;
  layout?: CTASectionLayout;
  className?: string;
}

import type { SectionCta } from "@/components/website/sections/shared/types";
import type { ResponsiveImageAspect } from "@/components/website/sections/ResponsiveImage";

export type ImageTextImagePosition = "left" | "right";
export type ImageTextVariant = "default" | "compact" | "boxed";

export interface ImageTextProps {
  eyebrow?: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    aspect?: ResponsiveImageAspect;
  };
  imagePosition?: ImageTextImagePosition;
  cta?: SectionCta;
  variant?: ImageTextVariant;
  className?: string;
}

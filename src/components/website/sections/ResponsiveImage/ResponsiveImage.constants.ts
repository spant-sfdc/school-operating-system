import type { ResponsiveImageAspect } from "./ResponsiveImage.types";

export const RESPONSIVE_IMAGE_ASPECT_CLASSES: Record<ResponsiveImageAspect, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
};

export const RESPONSIVE_IMAGE_DEFAULT_SIZES =
  "(min-width: 1024px) 50vw, (min-width: 640px) 80vw, 100vw";

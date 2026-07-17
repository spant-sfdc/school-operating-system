import type { PageHeroVariant } from "./PageHero.types";

export const PAGE_HERO_PADDING_CLASSES: Record<PageHeroVariant, string> = {
  default: "pt-40 pb-20 sm:pt-48 sm:pb-24",
  compact: "pt-32 pb-12 sm:pt-36 sm:pb-16",
  image: "pt-40 pb-24 sm:pt-52 sm:pb-32",
  minimal: "pt-32 pb-8 sm:pt-36 sm:pb-10",
};

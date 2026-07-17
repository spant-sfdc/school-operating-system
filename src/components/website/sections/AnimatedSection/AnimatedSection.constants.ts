import type { Variants } from "framer-motion";

import type { AnimatedSectionVariant } from "./AnimatedSection.types";

export function getAnimatedSectionVariants(
  variant: AnimatedSectionVariant,
  reduced: boolean,
): Variants {
  if (reduced) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
  }

  switch (variant) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
      };
    case "scaleIn":
      return {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
      };
    case "fadeUp":
    default:
      return {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
      };
  }
}

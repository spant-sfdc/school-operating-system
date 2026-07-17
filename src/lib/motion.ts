import type { Variants } from "framer-motion";

export const DURATION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
} as const;

export const EASE = [0.16, 1, 0.3, 1] as const;

export function fadeInUp(reduced: boolean, delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : DURATION.slow, delay: reduced ? 0 : delay, ease: EASE },
    },
  };
}

export function staggerContainer(reduced: boolean, stagger = 0.08): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : stagger },
    },
  };
}

import type { ReactNode } from "react";

export type AnimatedSectionVariant = "fadeUp" | "fade" | "scaleIn";

export interface AnimatedSectionProps {
  children: ReactNode;
  variant?: AnimatedSectionVariant;
  delay?: number;
  as?: "div" | "section" | "li";
  className?: string;
}

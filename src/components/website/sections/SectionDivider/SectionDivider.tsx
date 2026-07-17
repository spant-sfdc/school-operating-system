import { cn } from "@/lib/utils";

import { SECTION_DIVIDER_LINE_CLASSES } from "./SectionDivider.constants";
import type { SectionDividerProps } from "./SectionDivider.types";

export function SectionDivider({ variant = "light", className }: SectionDividerProps) {
  return <hr className={cn("my-8 border-t", SECTION_DIVIDER_LINE_CLASSES[variant], className)} />;
}

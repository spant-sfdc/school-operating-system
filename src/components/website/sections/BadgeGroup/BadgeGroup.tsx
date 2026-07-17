import { cn } from "@/lib/utils";

import { BADGE_VARIANT_CLASSES } from "./BadgeGroup.constants";
import type { BadgeGroupProps } from "./BadgeGroup.types";

export function BadgeGroup({ badges, className }: BadgeGroupProps) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {badges.map(({ label, variant = "neutral" }) => (
        <li
          key={label}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            BADGE_VARIANT_CLASSES[variant],
          )}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

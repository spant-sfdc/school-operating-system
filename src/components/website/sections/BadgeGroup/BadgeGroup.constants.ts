import type { BadgeVariant } from "./BadgeGroup.types";

export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

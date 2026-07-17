import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CalloutVariant } from "./Callout.types";

interface CalloutVariantConfig {
  icon: LucideIcon;
  border: string;
  iconColor: string;
  background: string;
  label: string;
}

export const CALLOUT_VARIANT_CONFIG: Record<CalloutVariant, CalloutVariantConfig> = {
  info: {
    icon: Info,
    border: "border-info",
    iconColor: "text-info",
    background: "bg-info/5",
    label: "Information",
  },
  warning: {
    icon: TriangleAlert,
    border: "border-warning",
    iconColor: "text-warning",
    background: "bg-warning/5",
    label: "Warning",
  },
  success: {
    icon: CheckCircle2,
    border: "border-success",
    iconColor: "text-success",
    background: "bg-success/5",
    label: "Success",
  },
};

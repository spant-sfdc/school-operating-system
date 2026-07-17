import type { ReactNode } from "react";

export type CalloutVariant = "info" | "warning" | "success";

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

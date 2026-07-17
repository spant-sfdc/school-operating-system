import type { LucideIcon } from "lucide-react";

export interface FeatureGridItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export type FeatureGridColumns = 2 | 3 | 4;

export interface FeatureGridProps {
  items: FeatureGridItem[];
  columns?: FeatureGridColumns;
  className?: string;
}

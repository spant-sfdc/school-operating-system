import type { FeatureGridColumns } from "./FeatureGrid.types";

export const FEATURE_GRID_COLUMN_CLASSES: Record<FeatureGridColumns, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

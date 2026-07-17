import type { StatisticsGridColumns } from "./StatisticsGrid.types";

export const STATISTICS_GRID_COLUMN_CLASSES: Record<StatisticsGridColumns, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export const STATISTICS_GRID_COUNT_DURATION_SECONDS = 1.4;

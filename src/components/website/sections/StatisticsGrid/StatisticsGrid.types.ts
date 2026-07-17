export interface StatisticsGridItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export type StatisticsGridColumns = 2 | 3 | 4;

export interface StatisticsGridProps {
  items: StatisticsGridItem[];
  columns?: StatisticsGridColumns;
  className?: string;
}

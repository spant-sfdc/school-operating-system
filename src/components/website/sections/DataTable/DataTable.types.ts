export interface DataTableRow {
  label: string;
  value: string;
}

export interface DataTableProps {
  caption: string;
  rows: DataTableRow[];
  className?: string;
}

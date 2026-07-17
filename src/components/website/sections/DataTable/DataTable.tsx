import { cn } from "@/lib/utils";

import type { DataTableProps } from "./DataTable.types";

export function DataTable({ caption, rows, className }: DataTableProps) {
  return (
    <table className={cn("w-full text-left text-sm", className)}>
      <caption className="sr-only">{caption}</caption>
      <tbody className="divide-border divide-y">
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="text-foreground w-1/2 py-3 pr-4 align-top font-medium">
              {row.label}
            </th>
            <td className="text-muted-foreground py-3">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

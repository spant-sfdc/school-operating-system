# DataTable

## Purpose

A plain, accessible label/value table for genuinely tabular static data — school timings, eligibility rows, office contact details. Promoted from a page-local helper in `Admissions/page.tsx` to a shared component once `Contact` needed the identical shape — see [DECISIONS.md § D-023](../../../../../docs/DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component), the same promotion reasoning already applied to `Prose` ([D-020](../../../../../docs/DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component)). `Admissions`' own README named this exact possibility in advance: "promotable to `components/website/sections/` only if a second, genuinely distinct page needs the same shape."

## Props

| Prop        | Type             | Default | Description                                                     |
| ----------- | ---------------- | ------- | --------------------------------------------------------------- |
| `caption`   | `string`         | —       | Screen-reader-only table caption, required for a real `<table>` |
| `rows`      | `DataTableRow[]` | —       | `{ label: string; value: string }[]`                            |
| `className` | `string`         | —       | Additional classes on the `<table>`                             |

## Variants

None — deliberately minimal, matching `Prose`'s precedent. Both current consumers (`Admissions`, `Contact`) only need a two-column label/value layout.

## Accessibility Notes

A real `<table>`, not a div-grid pretending to be tabular data — a screen-reader-only `<caption>` names the table, and each row's label is a `<th scope="row">`, not a plain cell, so assistive technology announces "Phone: [value]" as a genuine header/value pair rather than two unrelated cells.

## Usage Example

```tsx
import { DataTable } from "@/components/website/sections/DataTable";

<DataTable
  caption="Office Information"
  rows={[{ label: "Phone", value: "[Phone number — to be confirmed by School Admin]" }]}
/>;
```

## Future Enhancements

- None anticipated. Promote further (e.g., a sortable/striped variant) only if a third consumer's data shape genuinely needs it — this component exists to render two columns of static facts, not to become a data-grid.

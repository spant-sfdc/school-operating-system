# SectionHeader

## Purpose

The standard header pattern for a content section: an optional eyebrow label, a title, and an optional description. Used to introduce a `FeatureGrid`, `Timeline`, `FAQAccordion`, or any other section — one consistent heading pattern instead of every page inventing its own.

## Props

| Prop          | Type                 | Default  | Description                                    |
| ------------- | -------------------- | -------- | ---------------------------------------------- |
| `eyebrow`     | `string`             | —        | Small label above the title (e.g. "ACADEMICS") |
| `title`       | `string` (required)  | —        | Section heading (rendered as `<h2>`)           |
| `description` | `string`             | —        | Supporting copy below the title                |
| `align`       | `"left" \| "center"` | `"left"` | Text alignment                                 |
| `className`   | `string`             | —        | Additional classes                             |

## Variants

Controlled via `align`: `"left"` (default, for content-adjacent headers) and `"center"` (for standalone section intros, matches the homepage Hero's centered treatment).

## Accessibility Notes

- Renders a real `<h2>` via the shared `Heading` primitive — maintains document heading hierarchy. Do not use `SectionHeader` for the page's single `<h1>` (see `PageHero` for that).
- Eyebrow and description are supplementary text, not headings — correctly not part of the heading hierarchy.

## Usage Example

```tsx
import { SectionHeader } from "@/components/website/sections/SectionHeader";

<SectionHeader
  eyebrow="Academics"
  title="A curriculum built around depth"
  description="Every subject is taught for understanding, not just for the exam."
  align="center"
/>;
```

## Future Enhancements

- A `right`-aligned action slot (e.g., a "View all" link next to the title) if a future page needs a header + inline CTA pattern — not built now since no current usage needs it.

# Callout

## Purpose

An inline admonition box — information, warning, or success — for calling out a specific detail within page content (e.g. "Applications close March 15" on the Admissions page). Distinct from `success`/`warning`/`info` toast-style notifications (not built in this phase); this is a static, in-page content block.

## Props

| Prop        | Type                               | Default  | Description                                              |
| ----------- | ---------------------------------- | -------- | -------------------------------------------------------- |
| `variant`   | `"info" \| "warning" \| "success"` | `"info"` | See Variants                                             |
| `title`     | `string`                           | —        | Optional bold lead-in line                               |
| `children`  | `ReactNode` (required)             | —        | Body content — plain text or rich content (links, lists) |
| `className` | `string`                           | —        | Additional classes                                       |

## Variants

| Variant   | Icon            | Token used               |
| --------- | --------------- | ------------------------ |
| `info`    | `Info`          | `info` semantic token    |
| `warning` | `TriangleAlert` | `warning` semantic token |
| `success` | `CheckCircle2`  | `success` semantic token |

Each variant uses a subtle tinted background (`bg-{variant}/5`) and a solid left border accent — body text stays in `foreground`/`muted-foreground` regardless of variant, so contrast never depends on which accent color is active.

## Accessibility Notes

- `role="note"` with `aria-label` (the `title` if provided, otherwise a generic label per variant: "Information"/"Warning"/"Success") — identifies the block to assistive technology without requiring visual color perception to understand its category.
- Icon is `aria-hidden`; the variant is conveyed through the accessible label and text, never color alone.

## Usage Example

```tsx
import { Callout } from "@/components/website/sections/Callout";

<Callout variant="warning" title="Applications close March 15">
  Enquiries received after this date will be waitlisted for the following academic year.
</Callout>;
```

## Future Enhancements

- A dismissible/toast variant for transient UI messages (form submission feedback, etc.) is a separate concern — not this component, and not built this phase (no forms exist yet per Phase 1B scope).

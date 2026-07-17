# Timeline

## Purpose

A vertical timeline for the school's journey, history, or milestones — a dated list with a connecting line and markers. Single-column/vertical only, by design: it reads correctly at every viewport width without a separate mobile layout, which a horizontal timeline would require.

## Props

| Prop        | Type                                                                 | Default | Description                                 |
| ----------- | -------------------------------------------------------------------- | ------- | ------------------------------------------- |
| `items`     | `{ date: string; title: string; description?: string }[]` (required) | —       | Chronological entries — pass already sorted |
| `className` | `string`                                                             | —       | Additional classes                          |

## Variants

None — one visual treatment. `date` accepts any string (`"1998"`, `"March 2020"`, `"Founded"`), not a strict date type, since a school history often mixes years and named milestones.

## Accessibility Notes

- Renders as a semantic `<ol>`/`<li>` list — chronological order is structurally meaningful, so an ordered list is correct (not a `<ul>`).
- The connecting line and dot markers are `aria-hidden` — purely decorative; the text content alone fully conveys each entry.
- Each entry reveals via `AnimatedSection` (respects `prefers-reduced-motion`).

## Usage Example

```tsx
import { Timeline } from "@/components/website/sections/Timeline";

<Timeline
  items={[
    { date: "1998", title: "Founded", description: "Pant Public School opens in Vidyadhar Nagar." },
    { date: "2010", title: "New campus wing", description: "Science and computer labs added." },
  ]}
/>;
```

## Future Enhancements

- A horizontal/alternating-side variant for wide desktop viewports, if a future page design calls for it — not built speculatively.

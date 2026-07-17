# BadgeGroup

## Purpose

A row of small labeled pills — tags, categories, or short attributes (e.g. subject tags on an Academics page, facility labels on a Facilities page).

## Props

| Prop        | Type                                                     | Default | Description          |
| ----------- | -------------------------------------------------------- | ------- | -------------------- |
| `badges`    | `{ label: string; variant?: BadgeVariant }[]` (required) | —       | The badges to render |
| `className` | `string`                                                 | —       | Additional classes   |

## Variants

Per-badge, via `variant`: `"neutral"` (default), `"primary"`, `"success"`, `"warning"`, `"info"` — all use solid semantic-token backgrounds with their paired `*-foreground` text color, guaranteeing contrast regardless of which accent color is active.

## Accessibility Notes

- Renders as `<ul>`/`<li>` — a list of labels, not a list of interactive controls (no `<button>`/`<a>` semantics implied). If a future use case needs clickable/removable badges, extend deliberately rather than assuming this component supports it.
- Color is never the only signal — each badge always carries its text label; no color-only badges.

## Usage Example

```tsx
import { BadgeGroup } from "@/components/website/sections/BadgeGroup";

<BadgeGroup
  badges={[
    { label: "CBSE", variant: "primary" },
    { label: "Grades 1–8" },
    { label: "Co-educational" },
  ]}
/>;
```

## Future Enhancements

- A dismissible/interactive variant if a future filtering UI needs it — not built speculatively.

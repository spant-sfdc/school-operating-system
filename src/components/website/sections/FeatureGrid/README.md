# FeatureGrid

## Purpose

A responsive grid of icon + title + description cards — for "what we offer" style sections (facilities, programs, values). Each card staggers into view via `AnimatedSection`.

## Props

| Prop        | Type                                                                    | Default | Description                           |
| ----------- | ----------------------------------------------------------------------- | ------- | ------------------------------------- |
| `items`     | `{ icon: LucideIcon; title: string; description: string }[]` (required) | —       | The cards to render                   |
| `columns`   | `2 \| 3 \| 4`                                                           | `3`     | Column count at `sm`/`lg` breakpoints |
| `className` | `string`                                                                | —       | Additional classes                    |

## Variants

Controlled via `columns` — 2 (paired features), 3 (default), or 4 (dense grids). Always a single column below `sm`.

## Accessibility Notes

- Icons are `aria-hidden` — the `title` text is what's announced, not the icon.
- Card titles are `<h3>` — use `FeatureGrid` under a `SectionHeader` (which renders `<h2>`) to keep heading levels sequential; don't use `FeatureGrid` as a page's only heading source.
- Reveal animation respects `prefers-reduced-motion` via `AnimatedSection`.

## Usage Example

```tsx
import { BookOpen, Trophy, Users } from "lucide-react";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";

<FeatureGrid
  columns={3}
  items={[
    { icon: BookOpen, title: "Modern Curriculum", description: "…" },
    { icon: Users, title: "Small Class Sizes", description: "…" },
    { icon: Trophy, title: "Sports & Arts", description: "…" },
  ]}
/>;
```

## Future Enhancements

- If content ever comes from a CMS that stores icon choice as a string (not a component reference), add a name-to-`LucideIcon` lookup map at the page level before passing `items` in — not built speculatively now.

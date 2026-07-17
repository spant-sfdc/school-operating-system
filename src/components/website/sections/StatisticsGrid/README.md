# StatisticsGrid

## Purpose

A grid of large numbers that count up from 0 when scrolled into view — for real, confirmed statistics (student count, years established, results). **Structure only**: this component ships with genuine count-up animation, but no page currently passes it real data, since no school statistics have been confirmed yet (see [CONTENT_GUIDELINES.md § 12](../../../../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says) — never fabricate numbers). It is distinct from the homepage's `StatStrip` (`src/components/website/StatStrip.tsx`), which deliberately uses qualitative, non-numeric highlights for exactly this reason. Once real figures are confirmed, `StatisticsGrid` is what should render them.

## Props

| Prop        | Type                                                                              | Default | Description                       |
| ----------- | --------------------------------------------------------------------------------- | ------- | --------------------------------- |
| `items`     | `{ value: number; label: string; prefix?: string; suffix?: string }[]` (required) | —       | The statistics to render          |
| `columns`   | `2 \| 3 \| 4`                                                                     | `4`     | Column count (2 on mobile always) |
| `className` | `string`                                                                          | —       | Additional classes                |

## Variants

Controlled via `columns`. `suffix`/`prefix` on each item render as static text alongside the animated number (e.g. `suffix: "+"` → "500+", `prefix: "₹"` → "₹500").

## Accessibility Notes

- The animated count is purely decorative motion around a final, correct value — screen readers reading the live DOM at any point get a number, not an error state; the final settled value is always correct.
- Respects `prefers-reduced-motion`: the number jumps straight to its final value with no counting animation.
- Counts only once, when scrolled into view (`useInView({ once: true })`) — never re-triggers on repeated scroll.

## Usage Example

```tsx
import { StatisticsGrid } from "@/components/website/sections/StatisticsGrid";

<StatisticsGrid
  columns={3}
  items={[
    { value: 25, label: "Years established", suffix: "+" },
    { value: 40, label: "Faculty members" },
    { value: 98, label: "Board result rate", suffix: "%" },
  ]}
/>;
```

## Future Enhancements

- None structurally — this component is complete. What's missing is real data, which is a content/School Admin dependency (tracked in [TASKS.md](../../../../../docs/TASKS.md)), not a code gap.

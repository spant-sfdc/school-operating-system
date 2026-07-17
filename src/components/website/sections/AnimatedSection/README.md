# AnimatedSection

## Purpose

A reusable scroll-reveal wrapper — fades/slides its children into view once when they enter the viewport. The single place reveal-on-scroll animation is defined, so other section components (`FeatureGrid`, `Timeline`, `StatisticsGrid`) compose it instead of each re-implementing Framer Motion variants. Always respects `prefers-reduced-motion` per [UI_DESIGN_SYSTEM.md § 10](../../../../../docs/UI_DESIGN_SYSTEM.md#10-animation--motion-guidelines).

## Props

| Prop        | Type                              | Default    | Description                                     |
| ----------- | --------------------------------- | ---------- | ----------------------------------------------- |
| `children`  | `ReactNode`                       | —          | Content to reveal                               |
| `variant`   | `"fadeUp" \| "fade" \| "scaleIn"` | `"fadeUp"` | Reveal style — see Variants                     |
| `delay`     | `number`                          | `0`        | Seconds to delay the animation (for staggering) |
| `as`        | `"div" \| "section" \| "li"`      | `"div"`    | Rendered element                                |
| `className` | `string`                          | —          | Additional classes                              |

## Variants

| Variant   | Motion                                   |
| --------- | ---------------------------------------- |
| `fadeUp`  | Opacity 0→1, translateY 20px→0 (default) |
| `fade`    | Opacity 0→1 only                         |
| `scaleIn` | Opacity 0→1, scale 0.96→1                |

## Accessibility Notes

- Animation triggers once (`viewport={{ once: true }}`) — content never disappears again on scroll-out, avoiding repeated motion that can distract or disorient.
- When the user has `prefers-reduced-motion` enabled, content renders at full opacity immediately — no animation runs at all, not just a shortened one.
- This is a `"use client"` component (Framer Motion requirement) — keep it at the leaf level; don't wrap entire pages in it.

## Usage Example

```tsx
import { AnimatedSection } from "@/components/website/sections/AnimatedSection";

<AnimatedSection variant="fadeUp" delay={0.1}>
  <FeatureCard {...props} />
</AnimatedSection>;
```

Staggering a list:

```tsx
{
  items.map((item, index) => (
    <AnimatedSection key={item.id} as="li" delay={index * 0.08}>
      <TimelineEntry {...item} />
    </AnimatedSection>
  ));
}
```

## Future Enhancements

- Additional variants (e.g., `slideLeft`/`slideRight`) if a future page design needs them — add only when a real usage requires it.

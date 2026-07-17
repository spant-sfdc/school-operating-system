# ContentContainer

## Purpose

The single source of consistent horizontal spacing and max-width for public-site content. Every other section in this library composes `ContentContainer` internally rather than repeating `mx-auto max-w-* px-6 lg:px-8` — this is the one place that pattern is defined, per [UI_DESIGN_SYSTEM.md § 4](../../../../../docs/UI_DESIGN_SYSTEM.md#4-spacing).

## Props

| Prop        | Type                                     | Default | Description                                      |
| ----------- | ---------------------------------------- | ------- | ------------------------------------------------ |
| `children`  | `ReactNode`                              | —       | Content to constrain                             |
| `width`     | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"xl"`  | Max-width tier — see Variants                    |
| `as`        | `ElementType`                            | `"div"` | Render as a different element (e.g. `"section"`) |
| `className` | `string`                                 | —       | Additional classes, merged via `cn()`            |

## Variants

| Width  | Max-width    | Typical use                           |
| ------ | ------------ | ------------------------------------- |
| `sm`   | `max-w-3xl`  | Narrow reading content (FAQ, quote)   |
| `md`   | `max-w-5xl`  | Standard prose sections               |
| `lg`   | `max-w-6xl`  | Grids, feature sections               |
| `xl`   | `max-w-7xl`  | Default — matches header/footer width |
| `full` | `max-w-none` | Full-bleed content                    |

## Accessibility Notes

Purely a layout primitive — no semantics of its own. Use the `as` prop to render the correct landmark element (`"section"`, `"main"`) where appropriate; do not rely on the default `<div>` when a semantic element is called for.

## Usage Example

```tsx
import { ContentContainer } from "@/components/website/sections/ContentContainer";

<ContentContainer width="md">
  <p>Constrained, centered content.</p>
</ContentContainer>;
```

## Future Enhancements

- None anticipated — intentionally minimal.

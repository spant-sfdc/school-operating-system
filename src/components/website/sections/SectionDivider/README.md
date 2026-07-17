# SectionDivider

## Purpose

A visual separator between page sections. Renders a semantic `<hr>` — two variants for the two real contexts it's used in, per [UI_DESIGN_SYSTEM.md § Design Principles](../../../../../docs/UI_DESIGN_SYSTEM.md#1-design-principles) ("Calm, not loud").

## Props

| Prop        | Type                | Default   | Description        |
| ----------- | ------------------- | --------- | ------------------ |
| `variant`   | `"light" \| "dark"` | `"light"` | See Variants       |
| `className` | `string`            | —         | Additional classes |

## Variants

| Variant | Appearance                                                                        |
| ------- | --------------------------------------------------------------------------------- |
| `light` | Thin line at `border` token opacity (default) — for use on `background`/`surface` |
| `dark`  | Higher-contrast line — use on `surface-muted` backgrounds where `light` fades out |

## Accessibility Notes

- Renders a semantic `<hr>` in both variants — announced correctly by screen readers as a thematic break.

## Usage Example

```tsx
import { SectionDivider } from "@/components/website/sections/SectionDivider";

<SectionDivider variant="dark" />;
```

## Future Enhancements

- None anticipated.

## Revision History

- **Phase 1B.1 architecture review:** originally shipped with two additional variants (`minimal`, `decorative`) invented without a spec or a consumer. Both rendered the identical `border-border` color as `light` — the only actual differentiation was DOM shape, not the light/dark semantic the `variant` name implied. Removed as unjustified speculative surface area (YAGNI) rather than kept "in case a future page wants them" — see [DECISIONS.md § D-014](../../../../../docs/DECISIONS.md#d-014--sectiondivider-yagni-simplification).

# Prose

## Purpose

Renders a list of body paragraphs with consistent spacing — the narrative counterpart to `FeatureGrid`'s card-list, used wherever a section is better told as a short passage than broken into parallel items. Promoted from a page-local helper in `Campus/page.tsx` to a shared component once `SchoolLife` needed the identical pattern — see [DECISIONS.md § D-020](../../../../../docs/DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component).

## Props

| Prop         | Type       | Default | Description                               |
| ------------ | ---------- | ------- | ----------------------------------------- |
| `paragraphs` | `string[]` | —       | One or more paragraphs, rendered in order |
| `className`  | `string`   | —       | Additional classes on the wrapper         |

## Variants

None — deliberately minimal. Both current consumers (`Campus`, `SchoolLife`) only need a plain paragraph list; no variant prop was added speculatively.

## Accessibility Notes

Each paragraph renders as a semantic `<p>` (via `Text variant="body"`) — no additional ARIA needed; screen readers read the passage in document order like any other body text.

## Usage Example

```tsx
import { Prose } from "@/components/website/sections/Prose";

<Prose paragraphs={["First paragraph.", "Second paragraph."]} />;
```

## Future Enhancements

- None anticipated. Promote further (e.g., a `variant="lead"` for an intro paragraph) only if a third consumer genuinely needs it.

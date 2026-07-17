# FAQAccordion

## Purpose

An expand/collapse list of question-and-answer pairs — for Admissions FAQs, policy pages, or any page needing a scannable Q&A section.

## Props

| Prop            | Type                                                | Default | Description                                                                          |
| --------------- | --------------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `items`         | `{ question: string; answer: string }[]` (required) | —       | The FAQ entries, in display order                                                    |
| `allowMultiple` | `boolean`                                           | `false` | If `true`, multiple items can be open at once; otherwise opening one closes the rest |
| `className`     | `string`                                            | —       | Additional classes                                                                   |

## Variants

None — one visual treatment. `allowMultiple` changes behavior, not appearance.

## Accessibility Notes

- Each question is a native `<button>` inside an `<h3>` — fully keyboard operable (Tab to focus, Enter/Space to toggle) with no custom key handling needed.
- `aria-expanded` on the button and `aria-controls`/`id` pairing with the answer panel follow the [WAI-ARIA Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).
- The answer panel has `role="region"` and `aria-labelledby` pointing back to its question button.
- Expand/collapse animates via a CSS `grid-template-rows` transition (no JS height measurement) and is skipped entirely under `prefers-reduced-motion` (`motion-reduce:transition-none`).
- Visible focus ring on the question button (`focus-visible:ring-2`).

## Usage Example

```tsx
import { FAQAccordion } from "@/components/website/sections/FAQAccordion";

<FAQAccordion
  items={[
    { question: "When do admissions open?", answer: "…" },
    { question: "What documents are required?", answer: "…" },
  ]}
/>;
```

## Future Enhancements

- None anticipated — the accordion pattern is complete and standard.

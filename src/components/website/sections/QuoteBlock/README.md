# QuoteBlock

## Purpose

A single testimonial — from a Principal, Chairman, student, parent, or anyone else the school wants to quote. `role` is free text rather than a fixed enum, since real attributions vary ("Principal", "Parent, Class 4", "Alumnus, Batch of 2015") more than a closed list would allow.

## Props

| Prop        | Type                             | Default     | Description                                                              |
| ----------- | -------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `quote`     | `string` (required)              | —           | The quotation (rendered without you needing to add quote marks yourself) |
| `author`    | `string` (required)              | —           | Who said it                                                              |
| `role`      | `string`                         | —           | Their role/relationship to the school                                    |
| `avatar`    | `{ src: string; alt: string }`   | —           | Optional headshot                                                        |
| `variant`   | `"default" \| "card" \| "large"` | `"default"` | See Variants                                                             |
| `className` | `string`                         | —           | Additional classes                                                       |

## Variants

| Variant   | Appearance                                                            |
| --------- | --------------------------------------------------------------------- |
| `default` | Plain text, no border/background                                      |
| `card`    | Bordered, padded card — for grids of multiple testimonials            |
| `large`   | Larger, medium-weight quote text — for a single standalone hero quote |

## Accessibility Notes

- Uses semantic `<figure>`/`<blockquote>`/`<figcaption>` — screen readers correctly identify this as a quotation with attribution.
- Avatar `alt` should name the person (e.g., `"Photo of [Author Name]"`), not just say "avatar".

## Usage Example

```tsx
import { QuoteBlock } from "@/components/website/sections/QuoteBlock";

<QuoteBlock
  variant="large"
  quote="We chose this school because every teacher knows our daughter by name."
  author="A Grade 3 Parent"
  role="Parent"
/>;
```

## Future Enhancements

- A multi-quote carousel/grid wrapper if a future page needs several testimonials together — compose multiple `QuoteBlock` (`variant="card"`) inside a grid for now; a dedicated carousel is not built until a real need for auto-rotation appears.

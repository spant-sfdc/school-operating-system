# ImageText

## Purpose

A photo paired with a title, description, and optional CTA — the standard "tell a story next to a picture" pattern for About/Academics/Facilities-style pages. Image side is swappable; content never hardcoded.

## Props

| Prop            | Type                                                                      | Default     | Description                               |
| --------------- | ------------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `eyebrow`       | `string`                                                                  | —           | Small label above the title               |
| `title`         | `string` (required)                                                       | —           | Section heading                           |
| `description`   | `string` (required)                                                       | —           | Body copy                                 |
| `image`         | `{ src: string; alt: string; aspect?: ResponsiveImageAspect }` (required) | —           | Passed through to `ResponsiveImage`       |
| `imagePosition` | `"left" \| "right"`                                                       | `"left"`    | Which side the image renders on (desktop) |
| `cta`           | `{ label: string; href: string }`                                         | —           | Optional text link below the description  |
| `variant`       | `"default" \| "compact" \| "boxed"`                                       | `"default"` | See Variants                              |
| `className`     | `string`                                                                  | —           | Additional classes                        |

## Variants

| Variant   | Difference from default                             |
| --------- | --------------------------------------------------- |
| `default` | Standard spacing                                    |
| `compact` | Tighter gap between image and content               |
| `boxed`   | Image gets `shadow-elevated` for more visual weight |

## Accessibility Notes

- On mobile, the image always renders above the text regardless of `imagePosition` (single-column stack) — `imagePosition` only affects desktop (`lg:`) left/right order, via `order` utilities that don't affect DOM/reading order for screen readers.
- Inherits `ResponsiveImage`'s required-`alt` guarantee.

## Usage Example

```tsx
import { ImageText } from "@/components/website/sections/ImageText";

<ImageText
  eyebrow="Facilities"
  title="A library built for browsing, not just studying"
  description="Open shelves, reading nooks, and a librarian who knows every student's taste."
  image={{ src: "/campus/library.jpg", alt: "Reading nook in the school library" }}
  imagePosition="right"
/>;
```

## Future Enhancements

- None anticipated — a small, composition-first primitive.

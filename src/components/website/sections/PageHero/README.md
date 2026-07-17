# PageHero

## Purpose

The large banner every interior public page (About, Academics, Admissions, Gallery, Contact…) uses at its top — title, optional subtitle, breadcrumbs, and CTAs, with or without a background image. This is distinct from the homepage-only `Hero` component (`src/components/website/Hero.tsx`), which has bespoke homepage copy and the animated gradient background; `PageHero` is the generic, reusable, prop-driven version for every other page.

## Props

| Prop              | Type                                                                  | Default     | Description                                              |
| ----------------- | --------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `title`           | `string` (required)                                                   | —           | Page `<h1>`, rendered via `Display`                      |
| `subtitle`        | `string`                                                              | —           | Supporting copy below the title                          |
| `breadcrumbs`     | `{ label: string; href?: string }[]`                                  | —           | Breadcrumb trail; last item has no `href`                |
| `cta`             | `{ label: string; href: string; variant?: "primary" \| "secondary" }` | —           | Primary CTA button                                       |
| `secondaryCta`    | Same shape as `cta`                                                   | —           | Secondary CTA button                                     |
| `backgroundImage` | `{ src: string; alt: string }`                                        | —           | Only rendered when `variant="image"`                     |
| `overlay`         | `boolean`                                                             | `true`      | Dark overlay over the background image for text contrast |
| `variant`         | `"default" \| "compact" \| "image" \| "minimal"`                      | `"default"` | See Variants                                             |
| `className`       | `string`                                                              | —           | Additional classes                                       |

## Variants

| Variant   | Use case                                                                           |
| --------- | ---------------------------------------------------------------------------------- |
| `default` | Standard interior page banner                                                      |
| `compact` | Secondary/utility pages (Contact, legal pages) — less vertical space               |
| `image`   | Pages with a real photo (e.g. campus/Gallery landing) — requires `backgroundImage` |
| `minimal` | Simplest treatment — smaller title, minimal padding                                |

## Accessibility Notes

- Renders the page's `<h1>` — only one `PageHero` per page.
- Breadcrumb trail uses `<nav aria-label="Breadcrumb">` with an ordered list and `aria-current="page"` on the final (current-page) item.
- `image` variant CTA and breadcrumb colors automatically switch to light-on-dark for contrast against the overlay — verify actual contrast once a real photo is supplied (contrast depends on the image content itself, not just the overlay).
- `backgroundImage` requires a real `alt`; there is no unlabeled-image escape hatch by design.

## Usage Example

```tsx
import { PageHero } from "@/components/website/sections/PageHero";

<PageHero
  variant="default"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Academics" }]}
  title="Academics"
  subtitle="A curriculum built around depth, not just pace."
  cta={{ label: "Apply for admission", href: "/admissions" }}
/>;
```

## Future Enhancements

- Background video support (explicitly deferred — not built this phase; would need a `backgroundVideo` prop, poster-frame fallback, and `prefers-reduced-motion` handling for autoplay).
- Configure `next.config.ts` `images.remotePatterns` once a real image/CMS host is known, so `backgroundImage.src` can point to remote URLs in production.

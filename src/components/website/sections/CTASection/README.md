# CTASection

## Purpose

A closing call-to-action block — title, optional description, and one or two buttons on a `surface-muted` panel. The standard "ready to apply?" pattern that belongs near the bottom of most public pages.

## Props

| Prop           | Type                                         | Default      | Description            |
| -------------- | -------------------------------------------- | ------------ | ---------------------- |
| `title`        | `string` (required)                          | —            | Section heading        |
| `description`  | `string`                                     | —            | Supporting copy        |
| `primaryCta`   | `{ label: string; href: string }` (required) | —            | Main action button     |
| `secondaryCta` | `{ label: string; href: string }`            | —            | Optional second action |
| `layout`       | `"centered" \| "split"`                      | `"centered"` | See Variants           |
| `className`    | `string`                                     | —            | Additional classes     |

## Variants

| Layout     | Appearance                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| `centered` | Title, description, and buttons all centered (default)                                |
| `split`    | Title/description on the left, buttons on the right (desktop only — stacks on mobile) |

## Accessibility Notes

- Renders a real `<h2>` via `Heading` — place `CTASection` appropriately within the page's heading hierarchy.
- Primary CTA visually leads with an arrow icon (decorative, `aria-hidden`) — the button's accessible name is still just its `label` text.

## Usage Example

```tsx
import { CTASection } from "@/components/website/sections/CTASection";

<CTASection
  title="Ready to see the campus?"
  description="Schedule a visit and meet the team before you apply."
  primaryCta={{ label: "Apply for admission", href: "/admissions" }}
  secondaryCta={{ label: "Contact us", href: "/contact" }}
/>;
```

## Future Enhancements

- None anticipated.

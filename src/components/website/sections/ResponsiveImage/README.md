# ResponsiveImage

## Purpose

The single, opinionated wrapper around `next/image` for all marketing-section imagery — consistent aspect ratios, a muted background while loading, optional blur placeholder, and rounded corners by default (matching [UI_DESIGN_SYSTEM.md § 6](../../../../../docs/UI_DESIGN_SYSTEM.md#6-cards) card-radius conventions). Used internally by `ImageText` and available standalone anywhere else a page needs a photo.

## Props

| Prop          | Type                                          | Default                                                      | Description                                                       |
| ------------- | --------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `src`         | `string` (required)                           | —                                                            | Image source                                                      |
| `alt`         | `string` (required)                           | —                                                            | Alt text — no default, must always be provided                    |
| `aspect`      | `"square" \| "video" \| "portrait" \| "wide"` | `"video"`                                                    | Aspect ratio — see Variants                                       |
| `priority`    | `boolean`                                     | `false`                                                      | Passed to `next/image`; set `true` only for above-the-fold images |
| `sizes`       | `string`                                      | `"(min-width: 1024px) 50vw, (min-width: 640px) 80vw, 100vw"` | Responsive `sizes` attribute                                      |
| `blurDataURL` | `string`                                      | —                                                            | Enables `placeholder="blur"` when provided                        |
| `rounded`     | `boolean`                                     | `true`                                                       | Applies `rounded-2xl`                                             |
| `className`   | `string`                                      | —                                                            | Additional classes on the wrapping element                        |

## Variants

| Aspect     | Ratio | Typical use                    |
| ---------- | ----- | ------------------------------ |
| `square`   | 1:1   | Avatars, icon-style imagery    |
| `video`    | 16:9  | Default — general photography  |
| `portrait` | 3:4   | People-focused imagery         |
| `wide`     | 16:7  | Full-bleed banner-style images |

## Accessibility Notes

- `alt` is a required prop with no fallback — a decorative-only image should not use this component (use a plain styled `<div>` or CSS background instead so intent stays honest).
- Uses `fill` layout inside an explicitly aspect-ratioed container, avoiding layout shift while the image loads.

## Usage Example

```tsx
import { ResponsiveImage } from "@/components/website/sections/ResponsiveImage";

<ResponsiveImage
  src="/campus/library.jpg"
  alt="Students reading in the school library"
  aspect="wide"
/>;
```

## Future Enhancements

- Once a media host (Cloudinary, per [PROJECT_CONTEXT.md § Tech Stack](../../../../../docs/PROJECT_CONTEXT.md#8-tech-stack)) is wired in, `src` will typically be a Cloudinary URL — no change to this component's API is expected, only to `next.config.ts` `images.remotePatterns`.

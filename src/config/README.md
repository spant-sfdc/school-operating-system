# Configuration Layer

## Purpose

Centralizes school-identity, branding, navigation, contact, social, and SEO values that were previously duplicated as literal strings across multiple components — the school's name alone appeared in 9+ files before this layer existed. Nothing here is a component or a page; it's plain, framework-free data other code imports.

## Files

| File            | Holds                                                                                                                                          | Depends on  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `school.ts`     | Canonical identity facts — name, affiliation, classes, location, address, email, phone, principal, academic session, motto                     | none        |
| `branding.ts`   | Logo/favicon placeholders, a pointer to the CSS color token (not a duplicate of it), theme mode list + the `localStorage` key                  | `school.ts` |
| `navigation.ts` | `NAV_LINKS` (public nav) plus `FOOTER_NAV_LINKS`/`MOBILE_NAV_LINKS` aliases and empty `TEACHER_NAV_LINKS`/`ADMIN_NAV_LINKS` placeholders       | none        |
| `contact.ts`    | Contact-page-specific values — re-shapes `school.ts`'s address/email/phone and adds emergency phone, Google Maps URL, and timings placeholders | `school.ts` |
| `social.ts`     | Facebook/Instagram/YouTube/LinkedIn URLs — all `null` today, no real profiles confirmed yet                                                    | none        |
| `seo.ts`        | `SEO_DEFAULTS` — site name, default title/description, canonical base URL, OpenGraph/Twitter defaults                                          | `school.ts` |

`school.ts` is the root of the dependency graph — everything else either imports from it directly or is independent. This keeps exactly one place to update when real information arrives, instead of several files needing simultaneous, easy-to-miss edits.

## Placeholder Discipline

Per [CONTENT_GUIDELINES.md § 12](../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says): every fact not yet confirmed by School Admin is an explicit bracketed string (`"[... — to be confirmed by School Admin]"`), never a fabricated plausible-sounding value. `school.ts`'s `name`, `classes`, `location`, and `locationShort` are the exceptions — they're already public, already-published facts (the school's actual name and neighborhood), not unconfirmed claims, so they're written as real values, matching the same real-vs-placeholder distinction already established in `About`/`Admissions`/`Academics`' own `content.ts` files.

## What Deliberately Isn't Wired Up Yet

- **`SiteFooter.tsx`'s social icons** still render their own local, hardcoded three-icon array (Facebook/Instagram/YouTube, always disabled/"coming soon"), not sourced from `social.ts`. `social.ts` defines four placeholder URLs (adding LinkedIn) as the task specified, but connecting them would mean deciding new behavior — showing a real link once a URL exists vs. staying disabled — which is a product decision, not a literal-replacement refactor, and out of this milestone's scope ("no business features," "UI should appear identical").
- **Per-page prose** that merely _contains_ a word matching a config value (e.g. Hero's body copy mentioning "Vidyadhar Nagar" mid-sentence, or `About`'s founding-story paragraph) was left as local text. Forcing every substring match through `SCHOOL.locationShort` would either change the visible sentence (if the config value doesn't match the prose exactly) or add fragile, unreadable template-splicing for no real benefit — only exact, standalone-value duplicates were replaced.
- **`Admissions`'s and `Academics`' own timings/eligibility/co-curricular content** stays local to those pages' `content.ts` files. Each value appears exactly once in the codebase today (not duplicated), so per this milestone's own instruction to replace _duplicated_ literals, forcing them through `contact.ts` now would be speculative coupling to a config shape that hasn't proven it's needed by a second consumer yet.

## Usage Example

```tsx
import { SCHOOL } from "@/config/school";

<span>{SCHOOL.name}</span>;
```

## Future Enhancements

- Once School Admin provides real contact/social/branding information, update `school.ts`/`contact.ts`/`social.ts`/`branding.ts` in place — every consumer picks up the change automatically.
- Decide how `SiteFooter`'s social icons should behave once real URLs exist (real link vs. still-disabled), then wire them to `social.ts`.
- `TEACHER_NAV_LINKS`/`ADMIN_NAV_LINKS` are empty placeholders — populate them when Teacher/Admin nav UI is actually built (Phase 2+).

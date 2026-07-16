# UI Design System

**Status:** Design bible for Version 1. This document governs every visual and interaction decision. If a component doesn't match this document, the component is wrong, not the document.

**Reference points:** Stripe Dashboard, Linear, Vercel Dashboard, Notion — premium, restrained, functional.

---

## 1. Design Principles

1. **Calm, not loud.** No gratuitous color, no busy gradients, no decorative illustrations competing with content.
2. **Content-first.** Chrome (navigation, borders, shadows) recedes; data and actions lead.
3. **One way to do each thing.** One table style, one modal pattern, one empty state pattern — used everywhere.
4. **Motion is feedback, not decoration.** Every animation communicates a state change.
5. **Accessible is the baseline**, not an enhancement pass.

---

## 2. Color

Colors are defined as semantic tokens (via Tailwind CSS v4 theme + CSS variables), never hardcoded hex values in components.

| Token                | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `background`         | Page background                                        |
| `surface`            | Card/panel background                                  |
| `surface-muted`      | Subtle secondary surface (e.g., table stripe, sidebar) |
| `border`             | Default border color                                   |
| `foreground`         | Primary text                                           |
| `foreground-muted`   | Secondary/tertiary text                                |
| `primary`            | Brand action color (buttons, links, active states)     |
| `primary-foreground` | Text/icon color on `primary`                           |
| `success`            | Positive states (present, submitted, approved)         |
| `warning`            | Caution states (pending, incomplete)                   |
| `destructive`        | Errors, absent, rejected, delete actions               |
| `info`               | Neutral informational highlights                       |

**Rules:**

- Exact brand hex values are pending school input on visual identity (see Open Questions in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)). Until finalized, use a neutral slate-based palette with a single accent color for `primary`.
- Color is never the only signal for state — always pair with an icon or label (e.g., attendance status uses both color and text/icon).
- Maximum one accent color. Status colors (success/warning/destructive) are reserved for state, not decoration.

---

## 3. Typography

| Role           | Guidance                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Typeface       | A single modern, geometric/humanist sans-serif (e.g., Inter or system-ui stack) across the entire product                 |
| Scale          | Use a constrained type scale — no more than 6 sizes across the whole app                                                  |
| Weight         | Regular (400) for body, Medium (500) for emphasis/labels, Semibold (600) for headings — avoid Bold (700) except sparingly |
| Line height    | Generous — 1.5 for body text, 1.2–1.3 for headings                                                                        |
| Letter spacing | Default; slightly tightened only for large display headings                                                               |

**Type Scale (indicative):**

| Token       | Size    | Usage                                    |
| ----------- | ------- | ---------------------------------------- |
| `text-xs`   | 12px    | Metadata, captions, table footnotes      |
| `text-sm`   | 14px    | Secondary text, form labels              |
| `text-base` | 16px    | Body text, table content                 |
| `text-lg`   | 18px    | Section subheadings                      |
| `text-xl`   | 20–24px | Page titles                              |
| `text-2xl+` | 30px+   | Marketing/public site hero headings only |

---

## 4. Spacing

- Base unit: **4px**, following Tailwind's default spacing scale.
- Components use spacing multiples of 4 — no arbitrary pixel values.
- Consistent vertical rhythm: page sections separated by `space-y-8` (32px) or greater; related elements within a card by `space-y-4` (16px).
- Cards/panels use consistent internal padding — `p-6` (24px) as the default container padding.

---

## 5. Buttons

| Variant       | Usage                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `primary`     | The single most important action on a screen (e.g., "Save Student")                               |
| `secondary`   | Standard actions (e.g., "Cancel", "Export")                                                       |
| `outline`     | Lower-emphasis actions alongside a primary                                                        |
| `ghost`       | Icon-only or low-emphasis inline actions (e.g., table row actions)                                |
| `destructive` | Irreversible/dangerous actions (e.g., "Delete Teacher"), always paired with a confirmation dialog |

**Rules:**

- One `primary` button per view/section — never two competing primary actions.
- Destructive actions always require confirmation (dialog), never a single click.
- Buttons always show a loading state (spinner + disabled) during async actions — no double-submits.

---

## 6. Cards

- Used to group related content (a student record, a stat, a form section).
- Consistent structure: optional header (title + optional action), body, optional footer.
- Border + subtle shadow, not heavy drop shadows. Flat, not skeuomorphic.
- Rounded corners: consistent radius token across all cards, inputs, and buttons (e.g., `rounded-lg`).

---

## 7. Forms

- Labels always visible above the field — no placeholder-as-label pattern.
- Required fields marked consistently (e.g., subtle asterisk), not colored red by default.
- Inline validation errors appear directly below the field, in `destructive` color, with clear language (not "Invalid input" — say what's wrong).
- Multi-step or long forms (e.g., Student creation) use grouped sections with clear headings rather than one long unbroken list.
- Submit actions always reflect state: idle → loading → success/error.

---

## 8. Tables

Tables are a primary surface in this product (student lists, attendance, marks, reports) and must be treated as first-class.

- Sticky header row for scrollable tables.
- Row hover state for scannability.
- Right-align numeric columns (marks, counts); left-align text.
- Row-level actions live in a trailing "actions" column using `ghost` icon buttons, revealed on hover on desktop, always visible on touch.
- Dense but legible — sufficient row padding to remain touch-friendly for tablet use (teachers may use tablets in classrooms).
- Pagination (not infinite scroll) for long lists — predictable and reportable.

---

## 9. Icons

- **Lucide Icons exclusively.** No mixed icon libraries, no custom SVG icon sets outside Lucide, no emoji-as-icon in the product UI.
- Consistent sizing: 16px for inline/table icons, 20px for buttons, 24px for standalone/navigation icons.
- Icons always paired with a text label in navigation and primary actions — icon-only usage limited to dense contexts (tables, toolbars) and must include an accessible label (`aria-label`).

---

## 10. Animation & Motion Guidelines

Framer Motion is used deliberately, governed by these rules:

| Use case                    | Guidance                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Page/route transitions      | Subtle fade/slide, ≤200ms — never blocks perceived load time                                   |
| Modal/dialog open-close     | Scale + fade, ~150–200ms                                                                       |
| List item add/remove        | Height + opacity transition so layout shifts feel natural, not jarring                         |
| Button/interactive feedback | Micro-interactions only (e.g., subtle scale on press) — no bouncy/elastic easing               |
| Loading                     | Skeletons, not spinners, for content areas; spinners reserved for buttons/small inline actions |

**Rules:**

- No animation exceeding ~300ms for functional UI (non-marketing).
- Respect `prefers-reduced-motion` — all non-essential motion must be disabled for users who request it.
- The public marketing site may use slightly more expressive motion (hero sections) than the Admin/Teacher dashboards, which stay utilitarian.

---

## 11. Empty States

Every list/table view must define an empty state. An empty state includes:

1. A short, clear message (not just "No data")
2. Context on why it might be empty
3. A primary action where applicable (e.g., "No students yet" → "Add Student")

Empty states must never be a blank white area with no explanation.

---

## 12. Loading States & Skeletons

- Skeleton loaders match the shape of the content they replace (a table skeleton looks like table rows, not a generic spinner).
- Use React Suspense boundaries with skeleton fallbacks for server-fetched sections.
- Avoid full-page spinners once the app shell has loaded — prefer localized skeletons so navigation feels instant.

---

## 13. Responsive Breakpoints

Aligned to Tailwind CSS v4 defaults:

| Breakpoint | Width    | Primary target                                                   |
| ---------- | -------- | ---------------------------------------------------------------- |
| `base`     | < 640px  | Mobile (Guest browsing, occasional Teacher use)                  |
| `sm`       | ≥ 640px  | Large mobile / small tablet                                      |
| `md`       | ≥ 768px  | Tablet (Teacher classroom use — treated as a first-class target) |
| `lg`       | ≥ 1024px | Small desktop / Admin primary target                             |
| `xl`       | ≥ 1280px | Desktop                                                          |

**Rule:** Teacher-facing screens (Attendance, Marks Entry) must be validated at `md` (tablet) as a primary breakpoint, not just mobile and desktop extremes — this is the realistic in-classroom device.

---

## 14. Accessibility

- Minimum WCAG 2.1 AA contrast ratios for all text and meaningful UI elements.
- Full keyboard navigability — every interactive element reachable and operable via keyboard, with visible focus states.
- Semantic HTML first (`button`, `table`, `label`, `nav`) — ARIA attributes supplement, not replace, semantics.
- Form inputs always programmatically associated with labels.
- Color never the sole indicator of state or meaning.
- Motion respects `prefers-reduced-motion`.

---

## 15. Dark Mode Strategy

- Dark mode is supported via the same semantic token system (Section 2) — components reference tokens, never raw colors, so themes swap without component changes.
- Theme follows system preference by default (`prefers-color-scheme`), with a manual override control available in Admin/Teacher settings.
- The public marketing site may default to light mode for brand consistency, while Admin/Teacher dashboards fully support both.
- Dark mode is a Version 1 requirement for the Admin and Teacher dashboards, not a future enhancement.

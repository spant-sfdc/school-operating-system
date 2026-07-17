# Go-Live Checklist

**Purpose:** Everything required before the public website launches for real visitors — the final, narrow gate. Broader onboarding context: [SCHOOL_ONBOARDING_CHECKLIST.md](./SCHOOL_ONBOARDING_CHECKLIST.md). **As of 2026-07-17, none of this is complete** — this checklist exists so "go live" has a precise, checkable definition the moment content collection finishes, not so it looks done today.

---

## Content — P0 Items (Launch-Blocking)

Every **P0** item from [CONTENT_DASHBOARD.md § Priority Breakdown](./CONTENT_DASHBOARD.md#priority-breakdown) must be at status **Published**:

- [ ] TXT-001 — Government affiliation status (Admissions)
- [ ] TXT-005 — Principal's name (About)
- [ ] TXT-011 — Founding story (About)
- [ ] TXT-012 — Principal's message (About)
- [ ] TXT-013 — Journey Timeline founding year (About)
- [ ] TXT-017 through TXT-020 — Class-wise eligibility ages, all four (Admissions)
- [ ] TXT-023, TXT-024 — Minimum-age and entrance-test FAQ answers (Admissions)
- [ ] TXT-034 — Safety measures (Campus)
- [ ] IMG-005 through IMG-008 — Campus Gallery photos, all four (Campus)

**16 of 16 P0 items must be Published.** P1/P2 items should be resolved where possible but do not block launch by themselves — see § "What Can Ship With P1/P2 Still Open" below.

## Content — Process Notes Removed

Every `Callout` "Before this goes live" warning is, by design, visible in the working tree today. **All four must be removed before launch** — they are development-time reminders, not intended end-user content:

- [ ] TXT-022 removed (Admissions § Required Documents)
- [ ] TXT-032 removed (Academics § Co-Curricular Activities)
- [ ] TXT-033 removed (Academics § Assessment Approach)
- [ ] TXT-040 removed (Campus § Gallery Preview)

## Content — Sitewide

- [ ] IMG-001 — Favicon replaced with real school branding (currently the default Next.js scaffold icon)
- [ ] IMG-003 — Open Graph image set on at least the homepage and, ideally, every page (currently unset everywhere)
- [ ] Final sweep: `grep -rE "\[Placeholder|\[Time\]|\[Year\]|\[Achievement\]|\[Milestone|\[Additional Activities\]|\[Sports Facilities\]|\[Digital Learning Aids\]|\[Government affiliation" src/components/website/pages/` returns **zero matches**

## Technical

- [ ] `pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run build` all pass clean
- [ ] `NEXT_PUBLIC_APP_URL` set to the real production domain (currently defaults to `localhost` per `.env.example`) — every canonical URL, Open Graph URL, and JSON-LD `url` field depends on this
- [ ] Real hosting/domain configured (Vercel deployment target, DNS)
- [ ] A production build (`pnpm build && pnpm start`, not `pnpm dev`) manually spot-checked in a real browser, matching the verification standard already used for every page during development (see each page's [IMPLEMENTATION_LOG.md](../IMPLEMENTATION_LOG.md) entry)

## Content Accuracy Sign-Off

- [ ] School Admin has explicitly reviewed and approved every Published item — "Approved" in the registries means School Admin confirmed it, not that Engineering guessed correctly
- [ ] No claim on the site violates [CONTENT_GUIDELINES.md § 12](../CONTENT_GUIDELINES.md#12-what-this-platform-never-says) — no fabricated statistics, no unconfirmed policy stated as fact, no superlative without a concrete claim behind it

---

## What Can Ship With P1/P2 Still Open

Per [CONTENT_DASHBOARD.md](./CONTENT_DASHBOARD.md), 20 P1 and 8 P2 items exist beyond the 16 P0 items above. A P1/P2 item left at **Required** does not block launch **only if** it stays exactly as it is today — a clearly-worded bracketed placeholder is honest; a half-finished or vague-but-unbracketed sentence is not. Before launching with any P1/P2 item unresolved, confirm:

- [ ] The remaining placeholder text is still the original, clear `[Placeholder — ...]` wording (not edited into something that reads as real but isn't)
- [ ] The item genuinely doesn't undermine trust if left open a little longer (e.g., "Campus Visit Hours" pending is a minor inconvenience; "Principal's message" pending would not be acceptable — which is exactly why the latter is P0 and the former is P1)

## Latent Items — Explicitly Not a Launch Blocker

The 10 **Latent** items in [CONTENT_DASHBOARD.md § Active vs. Latent](./CONTENT_DASHBOARD.md#active-vs-latent-requirements) (address, email, phone, academic session, motto, emergency contact, general office/visit hours) are not rendered by any of the four built pages and do not block this launch. They become relevant the moment `/contact` or another consuming page is built — track them there, not here.

---

## Final Gate

**Launch when, and only when:** every checkbox above under "Content — P0 Items," "Content — Process Notes Removed," "Content — Sitewide," and "Technical" is checked. This is a hard gate, not a target — a launch with an unresolved P0 item or a visible "Before this goes live" note is not ready, regardless of how much else is done.

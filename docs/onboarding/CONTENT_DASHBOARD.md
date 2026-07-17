# Content Readiness Dashboard

**Purpose:** The single readiness snapshot for Pant Public School's content — the numbers below are computed directly from [TEXT_REGISTRY.md](./TEXT_REGISTRY.md), [IMAGE_REGISTRY.md](./IMAGE_REGISTRY.md), [DOCUMENT_REGISTRY.md](./DOCUMENT_REGISTRY.md), and [VIDEO_REGISTRY.md](./VIDEO_REGISTRY.md) — every count here can be re-derived by counting rows in those tables. Nothing below is estimated.

**Generated:** 2026-07-17, at the moment the Content Readiness Framework itself was first created. This is a **day-zero baseline** — no outreach to School Admin has happened yet, so every item is at the first stage of the lifecycle (`Required → Requested → Received → Approved → Optimized → Published`). Re-run this dashboard's math after every content-collection round.

---

## Overall Readiness

| Metric                                  | Count                                            |
| --------------------------------------- | ------------------------------------------------ |
| Total content items identified          | **97**                                           |
| Text items                              | 71                                               |
| Image items                             | 13                                               |
| Document items                          | 13                                               |
| Video items                             | 0 (see [VIDEO_REGISTRY.md](./VIDEO_REGISTRY.md)) |
| Items at status **Required**            | 97 (100%)                                        |
| Items at status **Published**           | 0 (0%)                                           |
| Content items owned by **School Admin** | 88                                               |
| Process Notes owned by **Engineering**  | 9                                                |

**Overall content readiness: 0%.** This is expected and not alarming for a day-zero baseline — see § Structural Completeness below for the metric that actually matters at this stage.

## Structural Completeness (a different, better-news metric)

"Content readiness" (above) measures _outstanding_ items. It does not measure whether the pages themselves are built and working — they are. Both are true at once, and conflating them would misrepresent the project's actual state:

| Page           | Built & Verified                 | Console Errors | Heading Hierarchy | Responsive | Structural Completeness |
| -------------- | -------------------------------- | -------------- | ----------------- | ---------- | ----------------------- |
| `/about`       | Yes (Phase 1C)                   | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/admissions`  | Yes (Milestone 4)                | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/academics`   | Yes (Milestone 5)                | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/campus`      | Yes (Milestone 6B)               | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/school-life` | Yes (School Life Experience)     | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/contact`     | Yes (Contact & Visit Experience) | 0 (verified)   | Correct           | Verified   | **100%**                |
| `/documents`   | Yes (Document Center Experience) | 0 (verified)   | Correct           | Verified   | **100%**                |

Source: each page's own manual-verification record in [IMPLEMENTATION_LOG.md](../IMPLEMENTATION_LOG.md). Every page is production-quality _structure_ wrapped around placeholder _content_ — the two are genuinely independent, and this framework exists specifically to track the second without needing to re-litigate the first.

## Active vs. Latent Requirements

Not every "Required" item is equally urgent. **Active** items are visible on a live route today; **Latent** items exist in config but nothing currently renders them (they matter once a future page/feature is built); **Silently absent** items are optional and don't visibly break anything.

| Bucket                    | Count | What it means                                                                                                                                                         |
| ------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active (visible now)      | 91    | A visitor to `/about`, `/admissions`, `/academics`, `/campus`, `/school-life`, `/contact`, or `/documents` today would see this placeholder or missing image/document |
| Latent (not yet rendered) | 5     | Defined in `src/config/`, not consumed by any built page yet — no visible defect today                                                                                |
| Silently absent           | 1     | `IMG-004` (Principal's portrait) — optional prop, page renders correctly without it                                                                                   |

**The persistent site chrome (header, footer, homepage) has zero visible placeholders** — `SiteHeader`/`SiteFooter`/`Hero` only consume `SCHOOL.name` and `SCHOOL.location`, both real, confirmed values. Every Active item is scoped to a specific page section, not the sitewide shell.

## Per-Page Readiness

| Page / Scope             | Text Items | Image Items | Document Items | Total  | % of All 97 |
| ------------------------ | ---------- | ----------- | -------------- | ------ | ----------- |
| Sitewide / Configuration | 11         | 3           | 0              | 14     | 14%         |
| About                    | 6          | 1           | 0              | 7      | 7%          |
| Admissions               | 14         | 0           | 0              | 14     | 14%         |
| Academics                | 3          | 0           | 0              | 3      | 3%          |
| Campus                   | 7          | 4           | 0              | 11     | 11%         |
| School Life              | 18         | 4           | 0              | 22     | 23%         |
| Contact                  | 6          | 1           | 0              | 7      | 7%          |
| Document Center          | 6          | 0           | 13             | 19     | 20%         |
| **Total**                | **71**     | **13**      | **13**         | **97** | **100%**    |

**Document Center now carries the single largest per-page count (19)** — the first page whose content requirements are dominated by documents rather than text or images, consistent with its purpose: 13 named, empty document slots plus 6 supporting text items (2 process notes, 4 FAQ answers). **School Life carries the most text-heavy outstanding count (22)** — consistent with it being the least-confirmable-by-generalization page built: events, sports, cultural activities, celebrations, and achievements are all genuinely school-specific and explicitly barred from being invented. **Academics carries the fewest (3)** — consistent with its content being mostly platform-voice philosophy/methodology copy that didn't need bracketing in the first place (see [CONTENT_GUIDELINES.md § 12](../CONTENT_GUIDELINES.md#12-what-this-platform-never-says)'s values-statement-vs-verifiable-fact distinction, applied when each page was built). **Contact's count (7) still understates its actual weight** — six previously-Latent Cross-Cutting items (`TXT-002`–`TXT-010`) became Active because of that page and are counted under Sitewide / Configuration, not duplicated here.

## Per-Category Readiness

| Category             | Items | % of All 97 | Notes                                                                                                                                                                                |
| -------------------- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Text — Content       | 62    | 64%         | Owned by School Admin                                                                                                                                                                |
| Text — Process Notes | 9     | 9%          | Owned by Engineering — removed on resolution, not collected                                                                                                                          |
| Image                | 13    | 13%         | 9 Active placeholders (Campus Gallery ×4, School Life Gallery ×4, Contact Map ×1), 1 wrong-default (favicon), 3 latent/optional                                                      |
| Document             | 13    | 13%         | 13 Active placeholders (Document Center — Admission Documents ×3, Academic Documents ×3, Mandatory Public Disclosures ×4, Policies ×3) — first page to reference any document at all |
| Video                | 0     | 0%          | No video requirement exists in any built page                                                                                                                                        |

## Priority Breakdown

| Priority         | Count | Meaning                                                                                                                                                                                                                                                                   |
| ---------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0               | 34    | Launch-blocking — highly visible, core identity/trust content (Principal, founding story, eligibility ages, Campus/School Life Gallery photos, Contact phone/email/office hours, admission forms, affiliation/fire-safety/fee-structure disclosures, child safety policy) |
| P1               | 41    | Important — page-central detail (timings, remaining FAQ, Contact address/emergency contact/visit hours/map photo, prospectus, academic calendar, holiday list, trust registration, fee refund policy)                                                                     |
| P2               | 13    | Lower urgency — latent config fields not yet rendered anywhere, optional enhancements, third achievement slot, Google Maps URL, syllabus overview, uniform policy                                                                                                         |
| Process Note (—) | 9     | Not prioritized the same way — engineering removes these, doesn't wait on them                                                                                                                                                                                            |

---

## What Would Move This Number

Nothing here moves until content is actually collected. See [CONTENT_COLLECTION_GUIDE.md](./CONTENT_COLLECTION_GUIDE.md) for how School Admin should approach gathering it, and [SCHOOL_ONBOARDING_CHECKLIST.md](./SCHOOL_ONBOARDING_CHECKLIST.md) / [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) for the process this dashboard feeds into.

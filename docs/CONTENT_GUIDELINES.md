# Content Guidelines

**Purpose:** Every word on this platform is a design decision, not filler. This document governs how the platform writes to Guests, Admins, and Teachers — voice, tone, and concrete rules for the recurring copy patterns (CTAs, headlines, error and success messages). It exists so copy stays consistent whether it's written by a human or an AI, this session or six months from now.

Pairs with [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) (how it looks) and [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md) (what the product is). If copy and design ever disagree about how "premium and calm" should feel, this document and the design system should agree with each other before either ships.

---

## 1. Voice

The platform speaks the way a genuinely excellent school administrator would speak to a family in person: warm, direct, unhurried, and competent. Not a marketing department. Not a government office.

- **Confident, not boastful.** State what's true plainly. Never oversell ("world-class", "best-in-class", "state-of-the-art").
- **Human, not corporate.** Write the way you'd explain something to a parent standing at the front desk, not the way a brochure would.
- **Precise, not vague.** "Submit your enquiry and we'll respond within 2 working days" beats "We'll get back to you soon."
- **Warm, not saccharine.** Friendly enough for the context (children, families) without slipping into forced cheerfulness or excessive exclamation points.

## 2. Tone by Audience

Voice stays constant; tone shifts slightly by who's reading.

| Audience                         | Tone                                                                                | Example                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Guest / Parent (public site)** | Reassuring, respectful of their time, a little proud of the school without bragging | "A modern school built around how your child actually learns." |
| **Admin**                        | Efficient, neutral, professional — this is a workspace, not a marketing surface     | "3 new admission enquiries since yesterday."                   |
| **Teacher**                      | Supportive, brisk, respectful of classroom time pressure                            | "Attendance saved. 28 of 30 students marked present."          |

## 3. Calls to Action (CTAs)

- CTA text is a verb phrase describing what happens next, never a vague noun ("Submit" alone is weaker than "Send Enquiry").
- Primary CTA per view is specific to the action: **"Apply for Admission"**, not "Learn More" or "Click Here."
- Secondary CTAs are genuinely secondary in wording too: **"Explore Academics"**, **"See the Campus"** — an invitation, not a competing demand.
- Never use "Click here", "Submit", "Go", or "Learn More" in isolation — always name the destination or outcome.
- Sentence case for buttons ("Apply for admission"), not Title Case or ALL CAPS, per [UI_DESIGN_SYSTEM.md § 5](./UI_DESIGN_SYSTEM.md#5-buttons).

## 4. Headlines

- Lead with the outcome for the family, not a feature of the software or the school's self-description.
- Avoid clichés: banned phrases include "nurturing tomorrow's leaders", "excellence in education", "home away from home", "holistic development" used as a standalone claim with nothing concrete behind it.
- A headline should survive being read out loud to a parent without sounding like every other school's website.
- Prefer concrete and specific over abstract and grand. "Every child, known by name" beats "A community of excellence."

## 5. Buttons

- Sentence case, verb-first: "Send enquiry", "View notice", "Download form".
- Destructive actions name the consequence where space allows: "Delete teacher" not just "Delete" — full rule in [UI_DESIGN_SYSTEM.md § 5](./UI_DESIGN_SYSTEM.md#5-buttons).
- Loading state text (when space allows a label change, not just a spinner): present-progressive — "Sending…", "Saving…".

## 6. Error Messages

- State what went wrong and, where possible, what to do about it. Never just "Something went wrong."
- No blame language ("You entered an invalid…"). Describe the state, not the user's mistake: "This field can't be empty" rather than "You forgot to fill this in."
- Specific over generic: "Marks cannot exceed 100 for this subject" (already the standard set in [DEVELOPMENT_CONVENTIONS.md § 8](./DEVELOPMENT_CONVENTIONS.md#8-error-handling)) — every error message in the product follows this pattern.
- Reserve genuinely generic language ("Something went wrong. Please try again.") for truly unexpected failures (network errors, server errors) — never for validation.

## 7. Success Messages

- Confirm the specific thing that happened, not a generic acknowledgment: "Enquiry sent — we'll reach out within 2 working days" rather than "Success!"
- No exclamation points by default. Warmth comes from specificity, not punctuation.
- Where the outcome has a next step, name it: "Attendance saved. You can still edit today's record until midnight."

## 8. Notices (Public Notice Board)

- Notices are written as the school office would write a circular: dated, direct, no marketing tone.
- Lead with the subject, not the greeting: "Republic Day Holiday — 26 January" not "Dear Parents, We are pleased to inform you…"
- Keep to what changed and what action (if any) is required, by when.

## 9. Admissions Copy

- Never pressure ("Limited seats!", "Apply now before it's too late!"). State facts and process; let the school's quality speak for itself.
- Be explicit about process and timeline wherever known ("Applications for the next academic year open in [month]"); if a fact is not yet confirmed by the school, do not invent a date, number, or policy — flag it for School Admin input rather than guessing (see [TASKS.md](./TASKS.md) for tracked open content items).

## 10. Teacher-Facing Wording

- Brisk and respectful of time — a teacher is reading this between classes, not in a quiet moment.
- Confirm outcomes in numbers where useful ("28 of 30 marked present") rather than vague confirmations.
- Never cute or jokey. This is a work tool.

## 11. Parent-Facing Wording

- Warmer and more spacious than teacher-facing copy — a parent has more time and more emotional stake.
- Always plain language over administrative jargon: "your child's class teacher," not "the assigned pedagogical resource."
- Respect that this may be a parent's first digital interaction with the school — never assume familiarity with the platform.

## 12. What This Platform Never Says

- No Lorem Ipsum or placeholder text of any kind in anything that could ship — see [AI_RULES.md § 5](./AI_RULES.md#5-quality-bar) and [DEFINITION_OF_DONE.md § 1](./DEFINITION_OF_DONE.md#1-code-quality).
- No fabricated statistics, dates, or facts about the school (student counts, founding year, results) unless confirmed by School Admin — an unconfirmed number is worse than no number. Track the gap in [TASKS.md](./TASKS.md) instead of inventing a placeholder that looks authoritative.
- No superlatives without a concrete claim behind them ("the best", "#1") — this school's website earns trust through specificity, not assertion.
- No urgency manufactured through scarcity language directed at families (see § 9).

## 13. Future AI Writing Rules

Any AI assistant writing copy for this project must:

1. **Read this document before writing any user-facing string** — headline, button label, error message, empty state, or notice.
2. **Never invent a fact.** If a real number, date, or policy is needed and not confirmed, write the structure/component to accept it as data and flag the gap in [TASKS.md](./TASKS.md) rather than filling it with a plausible-sounding guess.
3. **Match tone to audience** per § 2 — do not carry Guest-facing warmth into Teacher-facing UI or vice versa.
4. **Prefer the specific word over the safe one.** "Send enquiry" over "Submit"; "28 of 30 marked present" over "Attendance saved successfully."
5. **When in doubt, read it aloud as if to a parent at the front desk.** If it sounds like brochure copy or software-vendor copy, rewrite it.

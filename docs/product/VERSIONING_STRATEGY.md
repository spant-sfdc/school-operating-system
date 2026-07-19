# Versioning Strategy

**Purpose:** How version numbers work across a Master Repository and an unknown-but-growing number of independent client repos, given [FRAMEWORK_STRATEGY.md § 4](./FRAMEWORK_STRATEGY.md#4-version-upgrades--pull-never-push)'s "pull, never push" model. **This is a design document — nothing here is implemented**, and the versioning scheme already in use (semantic `0.x.y`, per [CHANGELOG.md](../CHANGELOG.md)'s own stated convention) is not being replaced, only extended to a multi-repository reality it didn't previously need to account for.

---

## 1. What Already Exists, Unchanged

`package.json`'s `version` field and `CHANGELOG.md` already follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic `0.x.y` versioning, with `1.0.0` reserved for the Version 1 production launch — this convention is correct and continues exactly as-is **for the Master Repository**. Nothing about the clone-per-client model changes how the Master Repository itself is versioned internally.

## 2. The New Question: What Does a Client Repo's Version Mean?

Once a client repo exists, it needs to answer two questions independently, not one:

1. **"What Master Repository version was I cloned from / last merged from?"** — a pointer into the framework's own version history.
2. **"What is my own local state?"** — since a client repo has its own commits (config, content, and — occasionally, per [FRAMEWORK_STRATEGY.md § 5](./FRAMEWORK_STRATEGY.md#5-framework-change-discipline)'s discriminating question — a genuine one-off local fix that never gets proposed upstream).

**Recommendation:** a client repo's own `package.json` `version` field tracks its own local releases (e.g., "this client's own v1.3.0," incremented whenever _that client's_ repo ships a change — a branding update, a content edit); a new field or `CHANGELOG.md` header records the Master Repository tag it's currently synced to (e.g., `Synced with framework v0.24.0`). These are two different numbers answering two different questions, and conflating them into one version number would make neither answerable cleanly.

## 3. Master Repository Release Tags

Recommend the Master Repository tag real releases (`git tag v0.24.0`) at points a client repo would plausibly want to sync to — not every commit, but every coherent unit of framework work (an Epic's completion, a significant bug fix). This gives "how far behind is client X" a concrete, answerable unit: a count of tags between what they're synced to and `HEAD`, not a vague sense of staleness.

## 4. No Central Registry — By Design

Per [FRAMEWORK_STRATEGY.md § 1](./FRAMEWORK_STRATEGY.md#1-the-model-upstream-not-control-plane), there is deliberately no database, dashboard, or service tracking which client repos exist or what version each is on — building one would be exactly the control-plane pattern this whole planning sprint's constraints rule out. Version tracking is **per-repository, human-readable, and manually maintained** (§ 2's `CHANGELOG.md` header convention) — a real trade-off (no automated fleet-wide visibility) accepted deliberately in exchange for genuinely not being a SaaS.

If TechPulse's client count eventually grows large enough that manually checking each repo's `CHANGELOG.md` header becomes impractical, the honest fix is a very small, **read-only**, manually-updated internal spreadsheet or document TechPulse maintains for itself (client name → last-known synced version) — not a system any client repo's code talks to at runtime. That distinction is the whole point: it's an internal bookkeeping aid for TechPulse, never a live dependency any client's production deployment relies on.

## 5. Upgrade Cadence — Not Prescribed Here

How _often_ a given client repo should pull framework updates (immediately, quarterly, only when a specific fix is needed) is a support/business relationship decision per client, not a technical constraint this document should prescribe. What this document does establish is that the _mechanism_ (§ [FRAMEWORK_STRATEGY.md § 4](./FRAMEWORK_STRATEGY.md#4-version-upgrades--pull-never-push)) and the _bookkeeping_ (§ 2–3 above) both exist and work the same way regardless of cadence.

## 6. Breaking Changes

A framework change that would require a **manual, non-mechanical** intervention in every client repo to adopt safely (a Prisma migration that isn't purely additive, a config schema change with no backward-compatible default) should be called out explicitly in the Master Repository's own `CHANGELOG.md` under its own clearly-marked heading — the same discipline `1.0.0`'s reservation already signals for the single biggest breaking-change boundary this project has, extended to smaller breaking changes along the way. A client repo merging an upstream change should never discover a breaking change by having their build fail; the changelog entry should have told them what to expect first.

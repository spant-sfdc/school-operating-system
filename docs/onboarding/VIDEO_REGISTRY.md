# Video Content Registry

**Purpose:** Every video (embedded player, background video, welcome message) the built pages currently require. See [README.md](./README.md) for how this registry was generated.

## Finding: Zero video requirements identified

Searched all four built pages' `content.ts`/`page.tsx`/`sections.ts` files, and the Marketing Section Library itself, for any video component, embed, or reference. **None exist.** Specifically checked and ruled out:

- No `<video>` element, video-embed component, or video-hosting reference (YouTube/Vimeo ID, etc.) appears anywhere in `src/components/website/`.
- The Marketing Section Library (15 components) has no video-playback component — `FeatureGrid`, `ImageText`, `ResponsiveImage`, etc. are all still-image-oriented; none were built with video in mind, and none were asked for.
- Campus's Gallery Preview (the section most likely to eventually want video — a campus walkthrough, for instance) was explicitly scoped to still photography only ("[Photo pending]," not "[Photo/video pending]") — see [Campus's own README](../../src/components/website/pages/Campus/README.md).

This registry is intentionally empty rather than populated with a plausible-sounding future item (a "Principal's welcome video," a campus tour video) that no current page actually asks for — the same discipline `DOCUMENT_REGISTRY.md` applies. If a future page genuinely wants video, that's a real scope decision (which Marketing Section Library component would render it doesn't exist yet either) — not something to pre-populate here speculatively.

## When this registry becomes populated

The moment a future page or milestone explicitly asks for video content, or a video-capable component is added to the Marketing Section Library, re-run the derivation this registry came from and add real entries.

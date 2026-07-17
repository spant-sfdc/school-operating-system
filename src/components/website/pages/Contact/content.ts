// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.
// Registry cross-reference: docs/onboarding/TEXT_REGISTRY.md § Cross-Cutting / Contact,
// docs/onboarding/IMAGE_REGISTRY.md § IMG-013.

import { CONTACT } from "@/config/contact";
import { SCHOOL } from "@/config/school";

export const CONTACT_HERO_CONTENT = {
  title: "Contact & Visit",
  subtitle: `Reach ${SCHOOL.name} directly, or plan a campus visit before you apply.`,
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Contact" }],
  primaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
};

export const CONTACT_OVERVIEW_CONTENT = {
  eyebrow: "Get in Touch",
  title: "We're Happy to Help",
  description:
    "Whether you're exploring admissions or already a part of the school, the details below are the fastest way to reach us — no forms, no waiting on a callback request.",
  badges: [
    { label: SCHOOL.locationShort, variant: "neutral" as const },
    { label: SCHOOL.classes, variant: "primary" as const },
  ],
};

export const CONTACT_OFFICE_CONTENT = {
  eyebrow: "Office Information",
  title: "How to Reach Us",
  rows: [
    { label: "Address", value: CONTACT.address },
    { label: "Phone", value: CONTACT.phone },
    { label: "Email", value: CONTACT.email },
    { label: "Emergency Contact", value: CONTACT.emergencyPhone },
  ],
};

export const CONTACT_TIMINGS_CONTENT = {
  eyebrow: "School Timings",
  title: "Office & Visit Hours",
  rows: [
    { label: "Office Hours", value: CONTACT.timings.officeHours },
    { label: "Campus Visit Hours", value: CONTACT.timings.visitHours },
  ],
};

export const CONTACT_VISIT_CONTENT = {
  eyebrow: "Visit the Campus",
  title: "See It for Yourself Before You Decide",
  paragraphs: [
    `Photos and descriptions only go so far. If you're considering ${SCHOOL.name} for your child, the most useful next step is walking the campus during Visit Hours above — see the classrooms in session, not just in a brochure.`,
    "Visits during school hours are by prior appointment, so a staff member can actually walk you through rather than leaving you to wander a working campus alone.",
  ],
  cta: { label: "See the campus", href: "/campus" },
};

export const CONTACT_MAP_CONTENT = {
  eyebrow: "Find Us",
  title: "Location",
  disclaimer:
    "[Placeholder — a location map or campus exterior photo is pending. School Admin to provide a Google Maps screenshot, embeddable map link, or a labeled photo showing how to find the campus. See docs/onboarding/IMAGE_REGISTRY.md § IMG-013. No map is embedded on this page yet — CONTACT.googleMapsUrl is not set.]",
};

export const CONTACT_FAQ_CONTENT = {
  eyebrow: "Frequently Asked Questions",
  title: "Common Questions",
  items: [
    {
      question: "What's the best way to reach the school office?",
      answer:
        "[Placeholder — confirm the school's preferred first-contact channel: phone, email, or in person. Source: School Admin.]",
    },
    {
      question: "Do I need an appointment to visit the campus?",
      answer:
        "[Placeholder — confirm whether walk-in visits are accepted or an appointment is required. Source: School Admin.]",
    },
    {
      question: "How quickly will I hear back after reaching out?",
      answer:
        "[Placeholder — confirm the school's typical response time for enquiries. Source: School Admin.]",
    },
    {
      question: "Who do I contact about an existing student's attendance or records?",
      answer:
        "[Placeholder — confirm whether this routes to the same office contact above or a different one. Source: School Admin.]",
    },
  ],
};

export const CONTACT_CTA_CONTENT = {
  title: "Ready to Take the Next Step?",
  description:
    "If you're exploring admission for your child, starting an enquiry is faster than waiting for a callback.",
  primaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
  secondaryCta: { label: "View admissions", href: "/admissions" },
};

export const CONTACT_SUMMARY_CONTENT = {
  eyebrow: "Quick Reference",
  title: "At a Glance",
  badges: [
    { label: `Phone: ${CONTACT.phone}`, variant: "neutral" as const },
    { label: `Email: ${CONTACT.email}`, variant: "neutral" as const },
    { label: "In person: see Visit Hours above", variant: "neutral" as const },
  ],
  socialNote:
    "[Process note — social media channels are not yet live; see src/config/social.ts. This note is removed once at least one SOCIAL_LINKS value is confirmed and the footer's icons go live.]",
};

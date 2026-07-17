// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.
// Registry cross-reference: docs/onboarding/TEXT_REGISTRY.md § School Life,
// docs/onboarding/IMAGE_REGISTRY.md IMG-009–IMG-012.

import { SCHOOL } from "@/config/school";

export const SCHOOL_LIFE_HERO_CONTENT = {
  title: "School Life",
  subtitle: "The events, activities, and everyday moments that happen alongside the classroom.",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "School Life" }],
  primaryCta: { label: "Explore admissions", href: "/admissions" },
};

export const SCHOOL_LIFE_NARRATIVE_CONTENT = {
  eyebrow: "Life Beyond Classrooms",
  title: "School Is More Than a Syllabus",
  paragraphs: [
    `A child's school memories are rarely about a single lesson — they're about the sports day they trained for, the play they performed in, the friend they made backstage. ${SCHOOL.name} treats these moments as part of a real education, not a break from one.`,
  ],
};

export const SCHOOL_LIFE_EVENTS_CONTENT = {
  eyebrow: "Annual Events",
  title: "Milestones Through the Year",
  description: "The occasions that mark the school calendar, year after year.",
  items: [
    {
      title: "[Annual Day]",
      description:
        "[Placeholder — replace with the school's confirmed Annual Day details: timing, format, what it celebrates. Source: School Admin.]",
    },
    {
      title: "[Founder's Day]",
      description:
        "[Placeholder — confirm whether the school observes a Founder's Day or founding anniversary, and its details.]",
    },
    {
      title: "[Graduation / Farewell]",
      description:
        "[Placeholder — confirm details of any graduation or farewell tradition for outgoing students.]",
    },
  ],
};

export const SCHOOL_LIFE_SPORTS_CONTENT = {
  eyebrow: "Sports & Competitions",
  title: "Room to Compete and Grow",
  description:
    "Beyond daily physical activity (see the Campus page), students take part in organized sport and competition.",
  badges: [
    { label: "[Sport 1 — to be confirmed]" },
    { label: "[Sport 2 — to be confirmed]" },
    { label: "[Inter-School Competitions — to be confirmed]" },
  ],
};

export const SCHOOL_LIFE_CULTURAL_CONTENT = {
  eyebrow: "Cultural Activities",
  title: "Creative Expression, Encouraged",
  description: "The arts a child can explore here, beyond the required curriculum.",
  items: [
    {
      title: "[Music]",
      description:
        "[Placeholder — confirm whether the school offers music instruction or ensembles, and details.]",
    },
    {
      title: "[Dance]",
      description:
        "[Placeholder — confirm whether the school offers dance instruction or performance opportunities.]",
    },
    {
      title: "[Art & Drama]",
      description:
        "[Placeholder — confirm whether the school offers visual art or drama/theatre activities.]",
    },
  ],
};

export const SCHOOL_LIFE_CELEBRATIONS_CONTENT = {
  eyebrow: "Celebrations",
  title: "The Days We Mark Together",
  description: "The festivals and occasions the school community celebrates as one.",
  badges: [
    { label: "[Celebration 1 — to be confirmed]" },
    { label: "[Celebration 2 — to be confirmed]" },
    { label: "[Celebration 3 — to be confirmed]" },
  ],
};

export const SCHOOL_LIFE_ACHIEVEMENTS_CONTENT = {
  eyebrow: "Student Achievements",
  title: "What Our Students Have Accomplished",
  description:
    "Real results, not superlatives — every item here is a specific, verifiable achievement, not a claim.",
  items: [
    {
      title: "[Achievement 1]",
      description:
        "[Placeholder — replace with a specific, real student or school achievement: a competition result, an exam result, a recognition. Source: School Admin.]",
    },
    {
      title: "[Achievement 2]",
      description:
        "[Placeholder — replace with another specific, real achievement. Do not restate Achievement 1.]",
    },
    {
      title: "[Achievement 3]",
      description:
        "[Placeholder — replace with another specific, real achievement, or remove this card if only two exist.]",
    },
  ],
};

export const SCHOOL_LIFE_GALLERY_CONTENT = {
  eyebrow: "Gallery Preview",
  title: "A Glimpse of School Life",
  description:
    "Photography is still pending — a full gallery is coming once real images are approved.",
  items: [
    {
      title: "Annual Events",
      description: "[Photo pending — see docs/onboarding/IMAGE_REGISTRY.md § IMG-009.]",
    },
    {
      title: "Sports & Competitions",
      description: "[Photo pending — see docs/onboarding/IMAGE_REGISTRY.md § IMG-010.]",
    },
    {
      title: "Cultural Activities",
      description: "[Photo pending — see docs/onboarding/IMAGE_REGISTRY.md § IMG-011.]",
    },
    {
      title: "Celebrations",
      description: "[Photo pending — see docs/onboarding/IMAGE_REGISTRY.md § IMG-012.]",
    },
  ],
  disclaimer:
    "[Placeholder — this section shows planned categories only, referencing IMG-009 through IMG-012 in the Content Readiness Framework. Replace with real, School Admin-approved photography before publishing. See the full gallery at /gallery once it's built.]",
  cta: { label: "View full gallery", href: "/gallery" },
};

export const SCHOOL_LIFE_TESTIMONIAL_CONTENT = {
  eyebrow: "In Parents' Words",
  title: "What Families Say",
  quote:
    "[Placeholder — this space will hold a real, approved parent testimonial once School Admin provides and confirms one. No testimonial has been fabricated or implied — this text is a placeholder, not a paraphrase of anything anyone actually said.]",
  author: "[Parent Name — pending approval]",
  role: "[Relationship — e.g., Parent of a Class III student — pending approval]",
};

export const SCHOOL_LIFE_CTA_CONTENT = {
  title: "Come See School Life for Yourself",
  description: "The best way to understand what daily life here is like is to visit.",
  primaryCta: { label: "Explore admissions", href: "/admissions" },
  secondaryCta: { label: "See the campus", href: "/campus" },
};

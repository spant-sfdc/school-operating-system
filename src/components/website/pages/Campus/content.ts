// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.

import { SCHOOL } from "@/config/school";

export const CAMPUS_HERO_CONTENT = {
  title: `The ${SCHOOL.name} Campus`,
  subtitle:
    "Where students spend their day — the classrooms, the library, the playground, and everything in between.",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Campus" }],
  primaryCta: { label: "Explore admissions", href: "/admissions" },
};

export const CAMPUS_SAFETY_CONTENT = {
  eyebrow: "A Safe Learning Environment",
  title: "Safety Is the Starting Point",
  paragraphs: [
    "Before a child can focus on learning, they need to feel secure. Every part of the campus — from the gate to the classroom — is designed around that idea first, and everything else second.",
    "[Placeholder — replace with the school's confirmed safety measures: entry/exit protocols, supervision ratios, emergency procedures, and any relevant certifications. Source: School Admin.]",
  ],
};

export const CAMPUS_CLASSROOMS_CONTENT = {
  eyebrow: "Modern Classrooms",
  title: "Rooms Built for Attention, Not Just Instruction",
  description:
    "A classroom's design shapes how a child learns in it — small details, considered on purpose.",
  items: [
    {
      title: "Natural Light",
      description: "Classrooms designed to reduce the fatigue of a full day indoors.",
    },
    {
      title: "Age-Appropriate Furniture",
      description:
        "Seating and desks sized for the students actually using them, not a one-size-fits-all room.",
    },
    {
      title: "Focused, Uncluttered Spaces",
      description: "Fewer distractions, more room for a teacher's attention to reach every child.",
    },
    {
      title: "[Digital Learning Aids]",
      description:
        "[Placeholder — confirm what digital tools, if any, are available in classrooms, with School Admin.]",
    },
  ],
};

export const CAMPUS_LIBRARY_CONTENT = {
  eyebrow: "Library & Reading",
  title: "A Room That Makes Reading Feel Like a Choice",
  paragraphs: [
    "A library only works if children actually want to be in it. The goal isn't a room full of books nobody opens — it's a quiet, inviting space where reading becomes something a child chooses, not an assignment.",
    "[Placeholder — replace with the library's confirmed details: collection size, reading programs, and borrowing policy. Source: School Admin.]",
  ],
};

export const CAMPUS_COMPUTER_CONTENT = {
  eyebrow: "Computer Learning",
  title: "Comfortable with Technology, Not Dependent on It",
  paragraphs: [
    "Computer learning here is treated as one more skill a child builds, alongside reading and arithmetic — not a novelty, and not the centerpiece of every lesson.",
    "[Placeholder — replace with confirmed computer lab details: hardware, software/curriculum used, and class frequency. Source: School Admin.]",
  ],
};

export const CAMPUS_SPORTS_CONTENT = {
  eyebrow: "Sports & Physical Development",
  title: "Room to Move, Every Day",
  description:
    "Physical development isn't an afterthought scheduled around academics — it's part of how a child actually grows.",
  items: [
    {
      title: "Outdoor Play Area",
      description: "Space for unstructured play as well as organized activity — both matter.",
    },
    {
      title: "[Sports Facilities]",
      description:
        "[Placeholder — confirm which specific sports facilities exist on campus, with School Admin.]",
    },
    {
      title: "Daily Physical Activity",
      description: "Movement built into the regular school day, not treated as optional.",
    },
  ],
};

export const CAMPUS_WELLBEING_CONTENT = {
  eyebrow: "Student Wellbeing",
  title: "Known, Not Just Enrolled",
  paragraphs: [
    "A child who feels unseen doesn't learn well, no matter how good the classroom is. Staff are expected to notice when something's wrong with a student, not just when their marks slip.",
    "[Placeholder — replace with confirmed wellbeing support details: counseling availability, health/first-aid provisions, and how concerns reach a parent. Source: School Admin.]",
  ],
};

export const CAMPUS_GALLERY_CONTENT = {
  eyebrow: "Campus Gallery Preview",
  title: "See the Campus for Yourself",
  description:
    "Real photography is still pending — the categories below show what's coming, not a finished gallery.",
  items: [
    { title: "Classrooms", description: "[Photo pending — real classroom photography required.]" },
    { title: "Library", description: "[Photo pending — real library photography required.]" },
    { title: "Playground", description: "[Photo pending — real playground photography required.]" },
    { title: "School Events", description: "[Photo pending — real event photography required.]" },
  ],
  disclaimer:
    "[Placeholder — this section shows planned categories only. Replace with real, School Admin-approved campus photography before publishing. See the full gallery at /gallery once it's built.]",
  cta: { label: "View full gallery", href: "/gallery" },
};

export const CAMPUS_CTA_CONTENT = {
  title: "Come See It in Person",
  description:
    "Photos and descriptions only go so far — the best way to understand the campus is to visit it.",
  primaryCta: { label: "Explore admissions", href: "/admissions" },
  secondaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
};

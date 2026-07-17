// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.

import { SCHOOL } from "@/config/school";

export const ACADEMICS_HERO_CONTENT = {
  title: `Academics at ${SCHOOL.name}`,
  subtitle: "How we teach, what your child learns at each stage, and the philosophy behind it.",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Academics" }],
  primaryCta: { label: "Explore admissions", href: "/admissions" },
};

export const ACADEMICS_PHILOSOPHY_CONTENT = {
  eyebrow: "Our Philosophy",
  title: "How We Think About Learning",
  paragraphs: [
    "We believe a child's early relationship with learning matters more than how quickly they cover a syllabus. Our approach favors understanding over memorization, curiosity over compliance, and steady progress over rigid pacing — the same philosophy at every stage, adapted to how a five-year-old and a thirteen-year-old actually learn differently.",
  ],
};

export const ACADEMICS_STAGES_CONTENT = {
  eyebrow: "Learning Stages",
  title: "Nursery Through Class 8",
  description: "The same philosophy, expressed differently at each stage of growing up.",
  stages: [
    {
      title: "Nursery",
      description:
        "The earliest stage — play-based learning, motor skills, and first steps toward structured classroom routines.",
    },
    {
      title: "Kindergarten",
      description:
        "Building on Nursery with early literacy, numeracy, and social skills, still rooted in play.",
    },
    {
      title: "Primary (Class 1–5)",
      description:
        "Structured academics begin — reading, writing, mathematics, and an expanding view of the world.",
    },
    {
      title: "Upper Primary (Class 6–8)",
      description:
        "Greater subject depth and independence, preparing students for the next stage of their education.",
    },
  ],
};

export const ACADEMICS_SUBJECTS_CONTENT = {
  eyebrow: "Subjects & Learning Areas",
  title: "What Students Learn",
  description:
    "Broad categories covered across every stage — depth and specifics vary by class, not listed here.",
  areas: [
    "Language & Literacy",
    "Mathematics & Logical Thinking",
    "Science & Environmental Awareness",
    "Social Studies & Civic Understanding",
    "Arts & Creative Expression",
    "Physical Education & Well-Being",
    "Life Skills & Values",
  ],
};

export const ACADEMICS_METHODOLOGY_CONTENT = {
  eyebrow: "Teaching Methodology",
  title: "How We Teach",
  description:
    "A philosophy is only real if it shows up in the classroom. Here's what that looks like day to day.",
  items: [
    {
      title: "Small Group Attention",
      description:
        "Class sizes are kept small enough that a teacher can adapt to individual students, not just the average of the room.",
    },
    {
      title: "Question-Led Classrooms",
      description:
        "Students are encouraged to ask questions and explain their thinking, not just produce the right answer.",
    },
    {
      title: "Learn by Doing",
      description:
        "Hands-on activities and real examples wherever a concept allows it, rather than abstraction alone.",
    },
  ],
};

export const ACADEMICS_COCURRICULAR_CONTENT = {
  eyebrow: "Co-Curricular Activities",
  title: "Beyond the Classroom",
  description: "Illustrative examples of common categories — not a confirmed list.",
  items: [
    {
      title: "Sports",
      description: "Physical activity and team sports as a regular part of school life.",
    },
    {
      title: "Art & Craft",
      description: "Creative expression through drawing, craft, and hands-on projects.",
    },
    {
      title: "Music",
      description: "Exposure to music as part of a well-rounded school experience.",
    },
    {
      title: "[Additional Activities]",
      description:
        "[Placeholder — replace with the school's confirmed co-curricular offerings: clubs, competitions, events, etc.]",
    },
  ],
  disclaimer: `[Placeholder — the activities above are illustrative examples of common co-curricular categories, not a confirmed list. Replace with ${SCHOOL.name}'s actual co-curricular program, confirmed by School Admin, before publishing.]`,
};

export const ACADEMICS_ASSESSMENT_CONTENT = {
  eyebrow: "Assessment Approach",
  title: "How We Assess Progress",
  description:
    "Assessment blends everyday classroom observation with periodic evaluations — designed to track a child's growth over time, not to rank students against each other.",
  disclaimer:
    "[Placeholder — specific assessment/examination policy, frequency, and format to be confirmed by School Admin. This page intentionally does not state board-specific examination rules or grading systems.]",
};

export const ACADEMICS_WHY_CONTENT = {
  eyebrow: "Why This Approach",
  title: "Why Families Choose Our Academic Approach",
  items: [
    {
      title: "Consistency Across Stages",
      description:
        "The same philosophy from Nursery through Class 8 — no jarring shift in approach as your child grows.",
    },
    {
      title: "Teachers Who Know the Curriculum and the Child",
      description:
        "Subject knowledge paired with real attention to how each student is actually doing.",
    },
    {
      title: "Depth Over Speed",
      description:
        "We'd rather a child understand fewer things well than move quickly through many things shallowly.",
    },
  ],
};

export const ACADEMICS_CTA_CONTENT = {
  title: "See Our Academic Approach in Person",
  description:
    "The best way to understand how we teach is to visit — meet our teachers and see a classroom in session.",
  primaryCta: { label: "Explore admissions", href: "/admissions" },
  secondaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
};

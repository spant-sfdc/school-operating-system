// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.

import { SCHOOL } from "@/config/school";

export const ABOUT_HERO_CONTENT = {
  title: `About ${SCHOOL.name}`,
  subtitle: "A closer look at how we teach, what we believe, and the people behind it.",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "About" }],
};

export const ABOUT_STORY_CONTENT = {
  eyebrow: "Our Story",
  title: `How ${SCHOOL.name} Began`,
  paragraphs: [
    `${SCHOOL.name} began with a straightforward belief: that a child learns best in a place where every teacher knows their name, their pace, and their potential. That belief still shapes how classrooms run today — smaller groups, closer attention, and a curriculum built around the student in front of us, not a syllabus in the abstract.`,
    "[Placeholder — replace with the school's official founding story: founding year, founders, and the original motivation for establishing the school in Vidyadhar Nagar. Source: School Admin.]",
  ],
};

export const ABOUT_MISSION_VISION_CONTENT = {
  title: "Mission & Vision",
  description: "What we're working toward, and how we think about getting there.",
  items: [
    {
      title: "Our Mission",
      description:
        "To give every child individual attention, a curriculum that respects how they actually learn, and a campus where they feel known, not just enrolled.",
    },
    {
      title: "Our Vision",
      description:
        "A school families trust for the long term, because it treats education as a relationship with each child, not a fixed program applied to all of them equally.",
    },
  ],
};

export const ABOUT_VALUES_CONTENT = {
  title: "What We Value",
  description: "The principles that guide every decision, from the classroom to the front office.",
  items: [
    {
      title: "Every Child, Known by Name",
      description:
        "Small class sizes mean teachers notice when a student is struggling, or ready for more, long before a report card would show it.",
    },
    {
      title: "Respect, Both Ways",
      description:
        "Students are held to high standards and treated with the same respect we'd want for our own children.",
    },
    {
      title: "Safety Without Anxiety",
      description:
        "A calm, secure campus where children can focus on learning, not on navigating chaos.",
    },
    {
      title: "Curiosity Over Memorization",
      description: "We'd rather a child ask a good question than recite a perfect answer.",
    },
  ],
};

export const ABOUT_PRINCIPAL_CONTENT = {
  title: "A Message from Our Principal",
  quote:
    "[Placeholder — replace with the Principal's verified message to prospective and current families. Source: School Admin.]",
  author: SCHOOL.principal.name,
  role: SCHOOL.principal.title,
};

export const ABOUT_TIMELINE_CONTENT = {
  eyebrow: "Our Journey",
  title: "Milestones Along the Way",
  items: [
    {
      date: "[Year]",
      title: "School Founded",
      description: "Replace with the school's official founding story and year.",
    },
    {
      date: "[Year]",
      title: "[Milestone 1]",
      description:
        "Replace with a real institutional milestone — for example a new campus wing, an accreditation, or a notable expansion.",
    },
    {
      date: "[Year]",
      title: "[Milestone 2]",
      description: "Replace with another confirmed milestone from the school's history.",
    },
  ],
};

export const ABOUT_WHY_CHOOSE_CONTENT = {
  title: `Why Parents Choose ${SCHOOL.name}`,
  description: "Reasons families give us, in their own words and our own observation.",
  items: [
    {
      title: "Considered, Not Crammed",
      description:
        "A curriculum designed for depth over speed, so children actually retain what they learn.",
    },
    {
      title: "Guidance That Adapts",
      description: "Teachers who adjust their approach to the child, not the other way around.",
    },
    {
      title: "[Achievement]",
      description:
        "Replace with a specific, real achievement supplied by the school — for example an academic result, an accreditation, or an award.",
    },
  ],
};

export const ABOUT_CTA_CONTENT = {
  title: "See It for Yourself",
  description: `The best way to understand ${SCHOOL.name} is to visit — meet the teachers, see a classroom in session, ask us anything.`,
  primaryCta: { label: "Apply for admission", href: "/admissions" },
  secondaryCta: { label: "Contact us", href: "/contact" },
};

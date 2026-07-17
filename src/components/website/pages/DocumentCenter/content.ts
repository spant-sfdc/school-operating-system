// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.
// Registry cross-reference: docs/onboarding/TEXT_REGISTRY.md § Document Center,
// docs/onboarding/DOCUMENT_REGISTRY.md § DOC-001–DOC-013.
//
// DOCUMENT_CENTER_CATEGORIES is deliberately data-driven (an array, not one export per
// category) so a future category can be added without touching page.tsx — see README.md
// "Designed for Configuration, Not Yet Configuration-Driven".

import { SCHOOL } from "@/config/school";

export const DOCUMENT_CENTER_HERO_CONTENT = {
  title: "Document Center",
  subtitle: `Official forms, policies, and public disclosures from ${SCHOOL.name} — in one place.`,
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Document Center" }],
  primaryCta: { label: "Contact the school", href: "/contact" },
};

export const DOCUMENT_CENTER_OVERVIEW_CONTENT = {
  eyebrow: "Document Categories Overview",
  title: "What You'll Find Here",
  description:
    "Standing documents the school publishes — not time-sensitive notices. Each category below is covered in its own section.",
  categories: [
    {
      title: "Admission Documents",
      description: "Forms and the prospectus you'll need when applying.",
    },
    {
      title: "Academic Documents",
      description: "Calendar, syllabus overview, and the school's holiday list.",
    },
    {
      title: "Mandatory Public Disclosures",
      description:
        "Affiliation, registration, and safety certificates a recognized school publishes.",
    },
    {
      title: "School Policies",
      description: "Child safety, fee, and conduct policies governing how the school operates.",
    },
  ],
};

export const DOCUMENT_CENTER_CATEGORIES = [
  {
    id: "admission-documents",
    eyebrow: "Admission Documents",
    title: "Forms & Prospectus",
    description: "The forms and prospectus a family needs before submitting an enquiry.",
    documents: [
      {
        title: "Admission Form — Nursery to UKG",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-001.]",
      },
      {
        title: "Admission Form — Class I to VIII",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-002.]",
      },
      {
        title: "School Prospectus",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-003.]",
      },
    ],
    disclaimer: null as string | null,
  },
  {
    id: "academic-documents",
    eyebrow: "Academic Documents",
    title: "Calendar & Syllabus",
    description: "What the school year looks like, at a glance.",
    documents: [
      {
        title: "Academic Calendar",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-004.]",
      },
      {
        title: "Syllabus Overview",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-005.]",
      },
      {
        title: "Holiday List",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-006.]",
      },
    ],
    disclaimer: null as string | null,
  },
  {
    id: "mandatory-disclosures",
    eyebrow: "Mandatory Public Disclosures",
    title: "Affiliation, Registration & Safety",
    description:
      "The certificates and disclosures a recognized Indian school is generally expected to publish.",
    documents: [
      {
        title: "Affiliation / Recognition Certificate",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-007.]",
      },
      {
        title: "Society / Trust Registration Certificate",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-008.]",
      },
      {
        title: "Fire & Building Safety Certificate",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-009.]",
      },
      {
        title: "Fee Structure",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-010.]",
      },
    ],
    disclaimer:
      `[Placeholder — the specific disclosures required depend on this school's confirmed affiliation/recognition status (SCHOOL.affiliation: "${SCHOOL.affiliation}" is not yet confirmed). The categories above are commonly published by CBSE-affiliated and state-recognized schools in India — confirm with School Admin which apply to this school before publishing any of them.]` as
        string | null,
  },
  {
    id: "school-policies",
    eyebrow: "School Policies",
    title: "How the School Operates",
    description: "The policies governing safety, fees, and conduct.",
    documents: [
      {
        title: "Child Safety & Anti-Ragging Policy",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-011.]",
      },
      {
        title: "Fee Refund & Withdrawal Policy",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-012.]",
      },
      {
        title: "Uniform & Code of Conduct Policy",
        description:
          "[Placeholder — PDF pending. See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-013.]",
      },
    ],
    disclaimer: null as string | null,
  },
];

export const DOCUMENT_CENTER_CIRCULARS_CONTENT = {
  eyebrow: "Circulars & Notices",
  title: "More Documents, As They're Needed",
  description:
    "This page covers standing documents — forms, policies, and disclosures that don't change often. Time-sensitive circulars and notices (a holiday announcement, an event update) belong on the school's Notice Board instead, so they don't get buried among documents that rarely change.",
  disclaimer:
    "[Process note — the Notice Board (/notices) is planned but not yet built. No circular or notice is fabricated here; once /notices exists, this section will link to it rather than list anything itself.]",
};

export const DOCUMENT_CENTER_FAQ_CONTENT = {
  eyebrow: "Frequently Asked Questions",
  title: "Common Questions",
  items: [
    {
      question: "What if a document I need isn't listed here?",
      answer:
        "[Placeholder — confirm the school's preferred process for a document request that isn't yet published. Source: School Admin.]",
    },
    {
      question: "Are these documents available in languages other than English?",
      answer:
        "[Placeholder — confirm whether any documents are, or will be, available in Hindi or another regional language. Source: School Admin.]",
    },
    {
      question: "Do I need to visit the office, or can everything be downloaded?",
      answer:
        "[Placeholder — confirm which documents (if any) require an in-person visit versus a direct download. Source: School Admin.]",
    },
    {
      question: "How often are these documents updated?",
      answer:
        "[Placeholder — confirm the school's update cadence for time-bound documents like the Academic Calendar and Fee Structure. Source: School Admin.]",
    },
  ],
};

export const DOCUMENT_CENTER_CTA_CONTENT = {
  title: "Can't Find What You Need?",
  description:
    "If a required document isn't available here yet, the school office can help directly.",
  primaryCta: { label: "Contact the school", href: "/contact" },
  secondaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
};

// Bracketed copy is an explicit placeholder pending School Admin sign-off — see README.md.

import { SCHOOL } from "@/config/school";

export const ADMISSIONS_HERO_CONTENT = {
  title: `Admissions at ${SCHOOL.name}`,
  subtitle:
    "Everything a family needs to know before submitting an enquiry — process, eligibility, documents, and what to expect.",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Admissions" }],
  primaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
  secondaryCta: { label: "Contact us", href: "/contact" },
};

export const ADMISSIONS_OVERVIEW_CONTENT = {
  eyebrow: "Admissions Overview",
  title: "Who Can Apply",
  description: `${SCHOOL.name} welcomes enquiries for Nursery through Class 8. The process below is the same for every class — the specifics of documents and interaction vary by age.`,
  facts: [
    { label: SCHOOL.classes, variant: "primary" as const },
    {
      label: SCHOOL.affiliation,
      variant: "neutral" as const,
    },
  ],
};

export const ADMISSIONS_JOURNEY_CONTENT = {
  eyebrow: "Admission Journey",
  title: "How the Process Works",
  steps: [
    {
      step: "1",
      title: "Enquiry",
      description:
        "Share your child's details through an enquiry — online or at the school office.",
    },
    {
      step: "2",
      title: "Campus Visit",
      description: "Visit the campus, see classrooms in session, and meet the team.",
    },
    {
      step: "3",
      title: "Document Submission",
      description: "Submit the required documents — see Required Documents below.",
    },
    {
      step: "4",
      title: "Interaction (if applicable)",
      description:
        "For some classes, a short, age-appropriate interaction with the child and/or parents.",
    },
    {
      step: "5",
      title: "Confirmation",
      description: "The school confirms the outcome and next steps directly with the family.",
    },
    {
      step: "6",
      title: "Admission",
      description: "Complete the formalities and your child is enrolled.",
    },
  ],
};

export const ADMISSIONS_ELIGIBILITY_CONTENT = {
  eyebrow: "Eligibility",
  title: "Class-Wise Eligibility",
  description:
    "Age criteria below are placeholders — confirm against the current academic year before publishing.",
  rows: [
    { label: "Nursery", value: "[Age criteria — to be confirmed by School Admin]" },
    { label: "LKG", value: "[Age criteria — to be confirmed by School Admin]" },
    { label: "UKG", value: "[Age criteria — to be confirmed by School Admin]" },
    {
      label: "Class I – VIII",
      value:
        "[Age as per class, per current academic year guidelines — to be confirmed by School Admin]",
    },
  ],
};

export const ADMISSIONS_DOCUMENTS_CONTENT = {
  eyebrow: "Required Documents",
  title: "What to Bring",
  description:
    "A structured starting checklist — confirm the final list against current requirements before publishing.",
  items: [
    { title: "Birth Certificate", description: "Original and one photocopy." },
    { title: "Photographs", description: "Recent passport-size photographs of the child." },
    {
      title: "Transfer Certificate (if applicable)",
      description: "Required when transferring from another school.",
    },
    {
      title: "Aadhaar (placeholder)",
      description:
        "[Placeholder — confirm whether Aadhaar is required, and in what form, with School Admin.]",
    },
  ],
  disclaimer:
    "[Government/board document requirements may change — confirm the current list with School Admin before publishing. This page does not represent official admissions policy until reviewed.]",
};

export const ADMISSIONS_FEES_CONTENT = {
  eyebrow: "Fee Information",
  title: "Fees",
  description: "Official fee structure will be shared by the school administration.",
  groups: [
    {
      title: "Nursery – KG",
      description: "Fee details available on request from the school office.",
    },
    {
      title: "Classes I – V",
      description: "Fee details available on request from the school office.",
    },
    {
      title: "Classes VI – VIII",
      description: "Fee details available on request from the school office.",
    },
  ],
};

export const ADMISSIONS_FAQ_CONTENT = {
  eyebrow: "Frequently Asked Questions",
  title: "Common Questions",
  items: [
    {
      question: "What is the minimum age for Nursery admission?",
      answer: "[Placeholder — replace with the school's confirmed minimum-age policy.]",
    },
    {
      question: "Is there an entrance test?",
      answer:
        "[Placeholder — replace with the school's confirmed admission-assessment policy, if any.]",
    },
    {
      question: "Can I apply if we're relocating mid-year?",
      answer: "[Placeholder — replace with the school's confirmed mid-year admission policy.]",
    },
    {
      question: "How long does the admission process take?",
      answer: "[Placeholder — replace with the school's confirmed typical timeline.]",
    },
  ],
};

export const ADMISSIONS_TIMINGS_CONTENT = {
  eyebrow: "School Timings",
  title: "Hours",
  rows: [
    { label: "School Office Hours", value: "[Time] – [Time], Monday–Saturday" },
    { label: "Class Hours (Nursery – KG)", value: "[Time] – [Time]" },
    { label: "Class Hours (Class I – VIII)", value: "[Time] – [Time]" },
    { label: "Campus Visit Hours", value: "[Time] – [Time], by prior appointment" },
  ],
};

export const ADMISSIONS_CTA_CONTENT = {
  title: "Ready to Begin?",
  description:
    "Start with a simple enquiry — our admissions team will get in touch with next steps.",
  primaryCta: { label: "Start an enquiry", href: "/admissions/enquiry" },
  secondaryCta: { label: "Contact us", href: "/contact" },
};

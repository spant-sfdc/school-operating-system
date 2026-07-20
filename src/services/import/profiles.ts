import type { ImportEntityType } from "@/generated/prisma/enums";

/**
 * An Import Profile — the reusable, declarative definition this sprint's
 * own instruction asks for: "Expected columns, Aliases, Required fields,
 * Validation rules, Default mapping." A profile is pure data, not logic —
 * "validation rules" here names *which* fields are required and nothing
 * deeper (the actual Business/Database Validation logic still lives in
 * each importer's own validator, e.g.
 * src/services/import/importers/academicStructure/validator.ts — a
 * profile doesn't duplicate that, it only describes the shape).
 * Deliberately small (per this sprint's own "do not over-engineer"
 * instruction): two profiles, one fully wired to a real importer
 * (Academic Structure), one metadata-only naming a future importer's
 * expected shape without implying it works yet (Student Register) — not a
 * speculative catalog of every future format.
 */
export interface ImportProfile {
  id: string;
  importType: ImportEntityType;
  label: string;
  description: string;
  // Canonical field name -> whether a working importer exists for this
  // profile yet. Only ACADEMIC_STRUCTURE's profile has one — see
  // src/services/import/importerRegistry.ts, the single place that answers
  // "is this import type actually supported today."
  expectedColumns: string[];
  requiredFields: string[];
  // Lowercase, whitespace/punctuation-stripped source header -> canonical
  // field name — the same normalization suggestColumnMapping() (Sprint
  // D3) applies at lookup time.
  aliases: Record<string, string>;
}

export const ACADEMIC_STRUCTURE_PROFILE: ImportProfile = {
  id: "generic-academic-structure",
  importType: "ACADEMIC_STRUCTURE",
  label: "Generic Academic Structure",
  description:
    "Classes, Sections, and Subjects for an existing Academic Year — the shape any Indian K-8 school's own class/section/subject list naturally has, not board- or state-specific.",
  expectedColumns: [
    "academicYearLabel",
    "className",
    "sectionName",
    "sortOrder",
    "subjectName",
    "subjectCode",
  ],
  requiredFields: ["academicYearLabel"],
  aliases: {
    class: "className",
    std: "className",
    standard: "className",
    classname: "className",
    section: "sectionName",
    division: "sectionName",
    sectionname: "sectionName",
    subject: "subjectName",
    course: "subjectName",
    subjectname: "subjectName",
    subjectcode: "subjectCode",
    code: "subjectCode",
    academicyear: "academicYearLabel",
    year: "academicYearLabel",
    session: "academicYearLabel",
    academicyearlabel: "academicYearLabel",
    order: "sortOrder",
    sortorder: "sortOrder",
  },
};

/**
 * Metadata-only — named per this sprint's own alias examples ("Admission
 * No / Adm No / Admission Number → admissionNumber"), but no
 * ImportRowValidator/ImportRowCommitHandler/grouper exists for STUDENT
 * (building one is explicitly out of this sprint's "Do NOT build: Student
 * importer" scope). Detection can still recognize a file that *looks* like
 * a student register and Mapping can still suggest a sensible column
 * mapping for it, but src/services/import/importerRegistry.ts's own
 * `isImportTypeSupported()` returns false for STUDENT, and the Mapping
 * page tells the Admin plainly that committing isn't available yet rather
 * than silently pretending it would work.
 */
export const STUDENT_REGISTER_PROFILE: ImportProfile = {
  id: "generic-student-register",
  importType: "STUDENT",
  label: "Generic Student Register",
  description:
    "A school's existing student roster — admission number, name, date of birth, class/section, guardian contact. Not yet a working import (Epic D's own roadmap, not this sprint's scope).",
  expectedColumns: [
    "admissionNumber",
    "firstName",
    "lastName",
    "dateOfBirth",
    "className",
    "sectionName",
    "guardianPhone",
  ],
  requiredFields: ["admissionNumber", "firstName", "className", "sectionName"],
  aliases: {
    admissionno: "admissionNumber",
    admno: "admissionNumber",
    admissionnumber: "admissionNumber",
    firstname: "firstName",
    givenname: "firstName",
    lastname: "lastName",
    surname: "lastName",
    dob: "dateOfBirth",
    dateofbirth: "dateOfBirth",
    class: "className",
    std: "className",
    standard: "className",
    section: "sectionName",
    division: "sectionName",
    guardianphone: "guardianPhone",
    parentphone: "guardianPhone",
    contactnumber: "guardianPhone",
  },
};

export const IMPORT_PROFILES: ImportProfile[] = [
  ACADEMIC_STRUCTURE_PROFILE,
  STUDENT_REGISTER_PROFILE,
];

export function getImportProfile(importType: ImportEntityType): ImportProfile | undefined {
  return IMPORT_PROFILES.find((profile) => profile.importType === importType);
}

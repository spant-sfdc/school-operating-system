import { z } from "zod";

// Client Configuration Framework (Sprint C1) — the fields School.tagline/
// medium/principalName/principalTitle/email/phone/address/schoolTimings/
// officeTimings/logoUrl/faviconUrl (Migration 009) plus the existing
// name/shortName/affiliationBoard (already editable since Sprint B3's
// Setup Wizard, reused here) and the current AcademicYear's label. Every
// field is optional at the schema level — an Admin filling in the
// Configuration Module incrementally, field by field, is the expected
// workflow, not a single all-at-once form.
export const updateSchoolConfigurationInputSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  name: z.string().min(1).max(200),
  shortName: z.string().max(50).optional(),
  tagline: z.string().max(200).optional(),
  affiliationBoard: z.string().max(100).optional(),
  medium: z.string().max(100).optional(),
  principalName: z.string().max(150).optional(),
  principalTitle: z.string().max(150).optional(),
  email: z.email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  academicYearLabel: z.string().min(1).max(20),
  schoolTimings: z.string().max(200).optional(),
  officeTimings: z.string().max(200).optional(),
  logoUrl: z.url().max(500).optional(),
  faviconUrl: z.url().max(500).optional(),
});
export type UpdateSchoolConfigurationInput = z.infer<typeof updateSchoolConfigurationInputSchema>;

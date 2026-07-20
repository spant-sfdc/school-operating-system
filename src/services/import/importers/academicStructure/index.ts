// The Academic Structure Importer — Epic D's first real importer, built as
// the reference implementation every future importer (Student, Teacher,
// Attendance, Admission, Result) should follow. Preview, Skip, Report, and
// History need no importer-specific code at all — reuse
// src/services/import/'s own previewImportBatch()/skipInvalidRows()/
// getImportReport()/listImportBatches()/getImportBatchDetail() directly,
// per this sprint's own "No special handling. Reuse D1." instruction.
export * from "@/services/import/importers/academicStructure/rows";
export * from "@/services/import/importers/academicStructure/aliases";
export * from "@/services/import/importers/academicStructure/profile";
export * from "@/services/import/importers/academicStructure/validator";
export * from "@/services/import/importers/academicStructure/commitHandler";
export * from "@/services/import/importers/academicStructure/importer";

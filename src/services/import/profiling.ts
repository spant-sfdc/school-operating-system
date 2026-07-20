// Data Profiling — Import Engine foundation, reusable by every future
// importer (Sprint D2's own explicit requirement: "this becomes reusable
// across all future importers"). Deliberately entity-agnostic and pure
// (no I/O): duplicate detection operates on a caller-supplied key, missing-
// value detection on a caller-supplied required-field list, and "unknown
// value" detection on a caller-supplied set of known-good values per field
// — the caller (an entity-specific importer) resolves what's "known" via
// its own repository lookups *before* calling this function, so the
// profiler itself never needs database access and stays trivially testable
// and reusable regardless of which entity is being imported.

export interface DataProfileOptions {
  // Fields whose combined value identifies a row as a duplicate of another
  // row in the same file — e.g. ["academicYearLabel", "className"] for
  // Academic Structure's class rows.
  keyFields: string[];
  // Fields that must have a non-empty value on every row.
  requiredFields: string[];
  // fieldName -> set of known-good values for that field, resolved by the
  // caller from the database (e.g. existing AcademicYear labels). A row
  // whose value for a profiled field isn't in the corresponding set is
  // counted as "unknown" — informational at profiling time, not itself a
  // validation failure (Business/Database Validation, a separate stage,
  // decides what's actually an error).
  knownValues?: Record<string, Set<string>>;
}

export interface DataProfile {
  totalRows: number;
  duplicateRows: number;
  missingValueCounts: Record<string, number>;
  unknownValueCounts: Record<string, number>;
  warnings: string[];
  errors: string[];
}

function fieldValue(row: Record<string, unknown>, field: string): string {
  const value = row[field];
  return value == null ? "" : String(value).trim();
}

export function buildDataProfile(
  rows: Record<string, unknown>[],
  options: DataProfileOptions,
): DataProfile {
  const { keyFields, requiredFields, knownValues = {} } = options;

  const seenKeys = new Set<string>();
  let duplicateRows = 0;

  const missingValueCounts: Record<string, number> = {};
  for (const field of requiredFields) missingValueCounts[field] = 0;

  const unknownValueCounts: Record<string, number> = {};
  for (const field of Object.keys(knownValues)) unknownValueCounts[field] = 0;

  const warnings: string[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const key = keyFields.map((field) => fieldValue(row, field)).join("::");
    if (seenKeys.has(key)) {
      duplicateRows++;
    } else {
      seenKeys.add(key);
    }

    for (const field of requiredFields) {
      if (fieldValue(row, field) === "") missingValueCounts[field]++;
    }

    for (const [field, known] of Object.entries(knownValues)) {
      const value = fieldValue(row, field);
      if (value !== "" && !known.has(value)) unknownValueCounts[field]++;
    }
  }

  if (rows.length === 0) {
    errors.push("The file contains no rows.");
  }
  if (duplicateRows > 0) {
    warnings.push(
      `${duplicateRows} row(s) share the same ${keyFields.join("+")} as another row in this file.`,
    );
  }
  for (const [field, count] of Object.entries(missingValueCounts)) {
    if (count > 0) warnings.push(`${count} row(s) are missing a value for "${field}".`);
  }
  for (const [field, count] of Object.entries(unknownValueCounts)) {
    if (count > 0) {
      warnings.push(
        `${count} row(s) reference a value for "${field}" not found in this school's records.`,
      );
    }
  }

  return {
    totalRows: rows.length,
    duplicateRows,
    missingValueCounts,
    unknownValueCounts,
    warnings,
    errors,
  };
}

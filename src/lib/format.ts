// Shared display formatting — "ACTIVE" -> "Active", "TRANSFERRED_OUT" ->
// "Transferred Out". Used by every admin page rendering a Prisma enum
// value (Student.status, StudentGuardian.relationshipType, ...) so the
// same UPPER_SNAKE_CASE -> Title Case conversion isn't duplicated per
// page, per AI_RULES.md § 2 ("no duplicated logic").
export function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

// Reuses the exact status vocabulary docs/onboarding/'s Content Readiness
// Framework already established (Required → ... → Published lifecycle,
// P0/P1/P2 priority) rather than inventing a parallel one — see
// docs/DECISIONS.md's Sprint C1 entry. "NeedsAttention" here means
// "Missing or Placeholder AND high-priority (P0/P1)" — a field that's
// simply not filled in yet (e.g. an optional P2 tagline) is not flagged
// the same way a missing P0 contact email is.
export type ConfigurationFieldStatus = "Configured" | "Missing" | "Placeholder" | "NeedsAttention";

export type ConfigurationPriority = "P0" | "P1" | "P2";

export interface ConfigurationFieldEntry {
  key: string;
  label: string;
  section: "School Identity" | "Theme" | "Website" | "Social" | "Academic";
  editable: boolean;
  priority: ConfigurationPriority;
  value: string | null;
  status: ConfigurationFieldStatus;
  note?: string;
}

export interface ConfigurationSummaryDTO {
  fields: ConfigurationFieldEntry[];
  totalFields: number;
  configuredCount: number;
  missingCount: number;
  placeholderCount: number;
  needsAttentionCount: number;
  completionPercent: number;
}

// A bracketed string like "[Full postal address — to be confirmed by
// School Admin]" is this codebase's own established placeholder
// convention (src/config/README.md § "Placeholder Discipline") — reused
// here, not reinvented, so a field edited to a real value and a field
// still holding the src/config/*.ts-style placeholder text are both
// classified consistently.
function isBracketedPlaceholder(value: string): boolean {
  return value.trim().startsWith("[") && value.trim().endsWith("]");
}

export function classifyFieldValue(
  value: string | null,
  priority: ConfigurationPriority,
): ConfigurationFieldStatus {
  const isMissing = value === null || value.trim().length === 0;
  const isPlaceholder = !isMissing && isBracketedPlaceholder(value);

  if ((isMissing || isPlaceholder) && (priority === "P0" || priority === "P1")) {
    return "NeedsAttention";
  }
  if (isMissing) return "Missing";
  if (isPlaceholder) return "Placeholder";
  return "Configured";
}

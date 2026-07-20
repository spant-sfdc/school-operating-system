import packageJson from "../../package.json";

// The single place the running app's own version is read — package.json's
// `version` field is already this project's source of truth (see
// docs/CHANGELOG.md), not a value to duplicate into an env var.
export function getFrameworkVersion(): string {
  return packageJson.version;
}

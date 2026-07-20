// One category's live status — never cached, always computed fresh by
// checkSystemReadiness() at call time. See FrameworkConfigDTO for the
// separate, write-once "what was true at setup" snapshot this is not.
export interface ReadinessCheck {
  ready: boolean;
  detail: string;
}

export interface SystemReadinessDTO {
  database: ReadinessCheck;
  schema: ReadinessCheck;
  bootstrap: ReadinessCheck;
  roles: ReadinessCheck;
  school: ReadinessCheck;
  academicYear: ReadinessCheck;
  authentication: ReadinessCheck;
  version: string;
  overallReady: boolean;
}

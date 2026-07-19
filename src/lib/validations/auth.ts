import { z } from "zod";

// Login ID is User.email — no separate loginId field exists on the frozen
// Identity schema (Sprint 1), and adding one would be exactly the "redesign a
// completed module" this sprint is explicitly told not to do. A login
// identifier that looks like an email but isn't necessarily a deliverable
// mailbox is a common, legitimate pattern for Admin-provisioned accounts.
//
// Deliberately no minimum-length/complexity check on password here — this
// schema validates a *login attempt*, not a *new password being set*.
// Complexity rules belong at password-creation time (Epic B's later User
// Management sprint), not at verification time, where they'd risk rejecting
// an existing, legitimately-set password that satisfied an earlier rule.
export const loginInputSchema = z.object({
  loginId: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

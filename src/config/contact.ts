import { SCHOOL } from "./school";

// Bracketed fields are explicit placeholders pending School Admin sign-off — see README.md.
export const CONTACT = {
  address: SCHOOL.address,
  email: SCHOOL.email,
  phone: SCHOOL.phone,
  emergencyPhone: "[Emergency contact number — to be confirmed by School Admin]",
  googleMapsUrl: null as string | null,
  timings: {
    officeHours: "[Time] – [Time], Monday–Saturday",
    visitHours: "[Time] – [Time], by prior appointment",
  },
} as const;

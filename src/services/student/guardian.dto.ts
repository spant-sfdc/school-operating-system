import type { Guardian } from "@/generated/prisma/client";

export interface GuardianDTO {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export function toGuardianDTO(guardian: Guardian): GuardianDTO {
  return {
    id: guardian.id,
    schoolId: guardian.schoolId,
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    fullName: `${guardian.firstName} ${guardian.lastName}`,
    phone: guardian.phone,
    email: guardian.email,
    address: guardian.address,
  };
}

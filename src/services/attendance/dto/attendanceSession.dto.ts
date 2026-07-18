import type {
  AttendanceRecord,
  AttendanceSession,
  Enrollment,
  Section,
  SchoolClass,
  Student,
} from "@/generated/prisma/client";
import {
  toAttendanceRecordDTO,
  type AttendanceRecordDTO,
} from "@/services/attendance/dto/attendanceRecord.dto";

export interface AttendanceSessionDTO {
  id: string;
  schoolId: string;
  sectionId: string;
  sectionName: string;
  schoolClassName: string;
  date: string;
  markedByUserId: string;
  lastEditedByUserId: string | null;
  lastEditedAt: string | null;
  records?: AttendanceRecordDTO[];
}

type AttendanceSessionWithRelations = AttendanceSession & {
  section: Section & { schoolClass: SchoolClass };
  records?: (AttendanceRecord & { enrollment: Enrollment & { student: Student } })[];
};

export function toAttendanceSessionDTO(
  session: AttendanceSessionWithRelations,
): AttendanceSessionDTO {
  return {
    id: session.id,
    schoolId: session.schoolId,
    sectionId: session.sectionId,
    sectionName: session.section.name,
    schoolClassName: session.section.schoolClass.name,
    date: session.date.toISOString(),
    markedByUserId: session.markedByUserId,
    lastEditedByUserId: session.lastEditedByUserId,
    lastEditedAt: session.lastEditedAt ? session.lastEditedAt.toISOString() : null,
    ...(session.records ? { records: session.records.map(toAttendanceRecordDTO) } : {}),
  };
}

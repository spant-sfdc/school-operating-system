import type { AttendanceRecord, Enrollment, Student } from "@/generated/prisma/client";
import type { AttendanceStatus } from "@/generated/prisma/enums";

export interface AttendanceRecordDTO {
  id: string;
  sessionId: string;
  enrollmentId: string;
  studentName: string;
  rollNumber: string;
  status: AttendanceStatus;
}

type AttendanceRecordWithRelations = AttendanceRecord & {
  enrollment: Enrollment & { student: Student };
};

export function toAttendanceRecordDTO(record: AttendanceRecordWithRelations): AttendanceRecordDTO {
  return {
    id: record.id,
    sessionId: record.sessionId,
    enrollmentId: record.enrollmentId,
    studentName: `${record.enrollment.student.firstName} ${record.enrollment.student.lastName}`,
    rollNumber: record.enrollment.rollNumber,
    status: record.status,
  };
}

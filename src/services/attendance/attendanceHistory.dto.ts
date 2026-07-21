export interface AttendanceHistoryRowDTO {
  sessionId: string;
  date: string;
  schoolClassName: string;
  sectionName: string;
  teacherName: string;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
}

export interface AttendanceHistoryResultDTO {
  items: AttendanceHistoryRowDTO[];
  total: number;
  page: number;
  pageSize: number;
}

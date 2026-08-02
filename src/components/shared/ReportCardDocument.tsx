import type { ReportCardDataDTO } from "@/services/reportCard/reportCard.dto";

const PROMOTION_OUTCOME_LABEL: Record<string, string> = {
  PROMOTED: "Promoted",
  DETAINED: "Detained",
  TRANSFERRED_OUT: "Transferred Out",
  WITHDRAWN: "Withdrawn",
};
const PROMOTION_BASIS_LABEL: Record<string, string> = {
  NO_DETENTION_POLICY: "No-Detention Policy",
  EXAM_RESULT: "Exam Result",
  RE_EXAM: "Re-Examination",
};

/**
 * The actual printable Report Card — a pure presentational component
 * (Server Component, no data fetching of its own), shared between
 * `/admin/students/[id]/report-cards/[examinationId]` and
 * `/teacher/students/[id]/report-cards/[examinationId]` so the two routes
 * never render two different-looking documents for the same data. Print
 * CSS uses Tailwind's own `print:` variant (no new global stylesheet) —
 * this page has no persistent admin chrome/sidebar to hide (AdminLayout
 * is an auth guard only, per its own comment), so the only print-specific
 * concerns are the page's own Back link/Generate/Print buttons.
 */
export default function ReportCardDocument({ data }: { data: ReportCardDataDTO }) {
  return (
    <div className="mx-auto max-w-3xl border p-8 print:border-0 print:p-0">
      <div className="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">{data.school.name}</h1>
          {data.school.address ? (
            <p className="text-muted-foreground text-sm">{data.school.address}</p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            {[data.school.phone, data.school.email].filter(Boolean).join(" · ")}
          </p>
          {data.school.affiliationBoard ? (
            <p className="text-muted-foreground text-xs">
              Affiliation: {data.school.affiliationBoard}
            </p>
          ) : null}
        </div>
        {data.school.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.school.logoUrl} alt="" className="h-16 w-16 object-contain" />
        ) : null}
      </div>

      <h2 className="mb-4 text-center text-lg font-semibold tracking-wide uppercase">
        Report Card
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <Row label="Student Name" value={data.student.fullName} />
        <Row label="Admission No." value={data.student.admissionNumber} />
        <Row
          label="Date of Birth"
          value={new Date(data.student.dateOfBirth).toLocaleDateString()}
        />
        <Row label="Roll No." value={data.student.rollNumber} />
        <Row
          label="Class"
          value={`${data.student.schoolClassName} - ${data.student.sectionName}`}
        />
        <Row label="Academic Year" value={data.student.academicYearLabel} />
        <Row label="Examination" value={data.examination.examinationName} />
        <Row label="Term" value={data.examination.examTermName} />
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full min-w-96 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Subject</th>
              <th className="py-2">Max Marks</th>
              <th className="py-2">Pass Marks</th>
              <th className="py-2">Marks Obtained</th>
              <th className="py-2">%</th>
              <th className="py-2">Grade</th>
              <th className="py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((subject) => (
              <tr key={subject.subjectName} className="border-b">
                <td className="py-2">{subject.subjectName}</td>
                <td className="py-2">{subject.maxMarks}</td>
                <td className="py-2">{subject.passMarks}</td>
                <td className="py-2">{subject.marksObtained}</td>
                <td className="py-2">{subject.percentage}%</td>
                <td className="py-2">{subject.grade ?? "—"}</td>
                <td className="py-2">{subject.passed ? "Pass" : "Fail"}</td>
              </tr>
            ))}
            {data.subjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted-foreground py-4 text-center">
                  No published marks on record for this student in this examination.
                </td>
              </tr>
            ) : null}
          </tbody>
          {data.subjects.length > 0 ? (
            <tfoot>
              <tr className="border-t font-medium">
                <td className="py-2">Total</td>
                <td className="py-2">{data.summary.totalMaxMarks}</td>
                <td className="py-2"></td>
                <td className="py-2">{data.summary.totalMarksObtained}</td>
                <td className="py-2">{data.summary.overallPercentage}%</td>
                <td className="py-2">{data.summary.overallGrade ?? "—"}</td>
                <td className="py-2"></td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {data.attendance ? (
        <p className="mb-4 text-sm">
          <span className="font-medium">Attendance ({data.attendance.academicYearLabel}):</span>{" "}
          {data.attendance.presentCount}/{data.attendance.totalMarked} days (
          {data.attendance.attendancePercent}%)
        </p>
      ) : null}

      {data.promotion ? (
        <p className="mb-4 text-sm">
          <span className="font-medium">Promotion:</span>{" "}
          {PROMOTION_OUTCOME_LABEL[data.promotion.outcome] ?? data.promotion.outcome} (
          {PROMOTION_BASIS_LABEL[data.promotion.basis] ?? data.promotion.basis})
        </p>
      ) : null}

      <div className="mt-12 flex items-end justify-between text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Date of Issue</p>
          <p className="border-t pt-1">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-center">
          <p className="border-t px-8 pt-1">
            Principal{data.school.name ? `, ${data.school.name}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

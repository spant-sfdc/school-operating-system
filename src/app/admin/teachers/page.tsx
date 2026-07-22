import Link from "next/link";

import { requirePermission, canManageTeachers } from "@/lib/authorization";
import { searchTeacherDirectory } from "@/services/teacher/teacherDirectory.service";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listSectionsByClassAndYear } from "@/repositories/section";
import { listAcademicYearsBySchool } from "@/repositories/academicYear";
import { listDistinctQualificationTypes } from "@/repositories/teacherQualification";
import { formatEnumLabel } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SearchParams = {
  query?: string;
  status?: string;
  classTeacherOnly?: string;
  subjectTeacherOnly?: string;
  qualificationType?: string;
  schoolClassId?: string;
  sectionId?: string;
  academicYearId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: string;
};

// Teacher Directory (Sprint E5) — "find a teacher quickly," mirroring
// src/app/admin/students/page.tsx's own GET-based filter-form + table +
// buildPageHref() pattern exactly, the established convention for every
// admin list in this codebase (Sprint E1 named it, not reinvented here).
export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requirePermission(canManageTeachers);
  const params = await searchParams;

  const [academicYears, schoolClasses, qualificationTypes] = await Promise.all([
    listAcademicYearsBySchool(session.schoolId),
    listSchoolClassesBySchool(session.schoolId),
    listDistinctQualificationTypes(session.schoolId),
  ]);

  const result = await searchTeacherDirectory(session.schoolId, {
    query: params.query,
    status: isStatus(params.status) ? params.status : undefined,
    classTeacherOnly: params.classTeacherOnly === "1",
    subjectTeacherOnly: params.subjectTeacherOnly === "1",
    qualificationType: params.qualificationType || undefined,
    schoolClassId: params.schoolClassId,
    sectionId: params.sectionId,
    academicYearId: params.academicYearId,
    sortBy: isSortBy(params.sortBy) ? params.sortBy : undefined,
    sortDir: params.sortDir === "desc" ? "desc" : undefined,
    page: params.page ? Number(params.page) : undefined,
  });

  const sections =
    params.schoolClassId && result.academicYearId
      ? await listSectionsByClassAndYear(params.schoolClassId, result.academicYearId)
      : [];

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const displayAcademicYear = academicYears.find((year) => year.id === result.academicYearId);

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    if (params.query) query.set("query", params.query);
    if (params.status) query.set("status", params.status);
    if (params.classTeacherOnly === "1") query.set("classTeacherOnly", "1");
    if (params.subjectTeacherOnly === "1") query.set("subjectTeacherOnly", "1");
    if (params.qualificationType) query.set("qualificationType", params.qualificationType);
    if (params.schoolClassId) query.set("schoolClassId", params.schoolClassId);
    if (params.sectionId) query.set("sectionId", params.sectionId);
    if (params.academicYearId) query.set("academicYearId", params.academicYearId);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortDir) query.set("sortDir", params.sortDir);
    query.set("page", String(targetPage));
    return `/admin/teachers?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teachers</h1>
        <span className="text-muted-foreground text-sm">
          {displayAcademicYear
            ? `Showing ${displayAcademicYear.label}`
            : "No academic year configured"}
        </span>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            name="query"
            defaultValue={params.query ?? ""}
            placeholder="Name, email, Teacher ID, subject, qualification, class/section"
            className="w-80"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? "ALL"}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="EXITED">Inactive (Exited)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="academicYearId">Academic Year</Label>
          <select
            id="academicYearId"
            name="academicYearId"
            defaultValue={params.academicYearId ?? result.academicYearId}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
                {year.isCurrent ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="schoolClassId">Class</Label>
          <select
            id="schoolClassId"
            name="schoolClassId"
            defaultValue={params.schoolClassId ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All classes</option>
            {schoolClasses.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sectionId">Section</Label>
          <select
            id="sectionId"
            name="sectionId"
            defaultValue={params.sectionId ?? ""}
            disabled={sections.length === 0}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm disabled:opacity-50"
          >
            <option value="">All sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="qualificationType">Qualification</Label>
          <select
            id="qualificationType"
            name="qualificationType"
            defaultValue={params.qualificationType ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All qualifications</option>
            {qualificationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <input
            id="classTeacherOnly"
            name="classTeacherOnly"
            type="checkbox"
            value="1"
            defaultChecked={params.classTeacherOnly === "1"}
          />
          <Label htmlFor="classTeacherOnly">Class Teacher</Label>
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <input
            id="subjectTeacherOnly"
            name="subjectTeacherOnly"
            type="checkbox"
            value="1"
            defaultChecked={params.subjectTeacherOnly === "1"}
          />
          <Label htmlFor="subjectTeacherOnly">Subject Teacher</Label>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sortBy">Sort by</Label>
          <select
            id="sortBy"
            name="sortBy"
            defaultValue={params.sortBy ?? "name"}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sortDir">Order</Label>
          <select
            id="sortDir"
            name="sortDir"
            defaultValue={params.sortDir ?? "asc"}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Class Teacher</th>
              <th className="py-2">Subjects</th>
              <th className="py-2">Qualification</th>
              <th className="py-2">Status</th>
              <th className="py-2">Account</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((teacher) => (
              <tr key={teacher.id} className="border-b align-top">
                <td className="py-2">{teacher.fullName}</td>
                <td className="py-2">{teacher.email}</td>
                <td className="py-2">
                  {teacher.classTeacherFor.length > 0 ? teacher.classTeacherFor.join(", ") : "—"}
                </td>
                <td className="py-2">
                  {teacher.subjectTeacherFor.length > 0
                    ? teacher.subjectTeacherFor.join(", ")
                    : "—"}
                </td>
                <td className="py-2">{teacher.highestQualification ?? "—"}</td>
                <td className="py-2">{formatEnumLabel(teacher.status)}</td>
                <td className="py-2">{teacher.isAccountActive ? "Active" : "Deactivated"}</td>
                <td className="py-2">
                  <Link href={`/admin/teachers/${teacher.id}`} className="text-primary underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground py-4 text-center">
                  No teachers found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span>
          Page {result.page} of {totalPages} ({result.total} total)
        </span>
        <div className="flex gap-2">
          {result.page > 1 ? <Link href={buildPageHref(result.page - 1)}>Previous</Link> : null}
          {result.page < totalPages ? (
            <Link href={buildPageHref(result.page + 1)}>Next</Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function isStatus(value: string | undefined): value is "ACTIVE" | "ON_LEAVE" | "EXITED" | "ALL" {
  return value === "ACTIVE" || value === "ON_LEAVE" || value === "EXITED" || value === "ALL";
}

function isSortBy(value: string | undefined): value is "name" | "status" | "recent" {
  return value === "name" || value === "status" || value === "recent";
}

import Link from "next/link";

import { requirePermission, canViewStudents } from "@/lib/authorization";
import { searchStudentDirectory } from "@/services/student/studentDirectory.service";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listSectionsByClassAndYear } from "@/repositories/section";
import { listAcademicYearsBySchool } from "@/repositories/academicYear";
import { formatEnumLabel } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SearchParams = {
  query?: string;
  status?: string;
  schoolClassId?: string;
  sectionId?: string;
  academicYearId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: string;
};

// Student Directory (Sprint E1) — the entry point to "understand
// everything about one student in under 30 seconds": search/filter down
// to one row, then follow it to the Profile. Functional only, mirrors
// src/app/admin/users/page.tsx's own GET-based filter-form + table +
// buildPageHref() pattern exactly — the established convention for every
// admin list in this codebase, not reinvented here.
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requirePermission(canViewStudents);
  const params = await searchParams;

  const academicYears = await listAcademicYearsBySchool(session.schoolId);
  const schoolClasses = await listSchoolClassesBySchool(session.schoolId);

  const result = await searchStudentDirectory(session.schoolId, {
    query: params.query,
    status: isStatus(params.status) ? params.status : undefined,
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
    if (params.schoolClassId) query.set("schoolClassId", params.schoolClassId);
    if (params.sectionId) query.set("sectionId", params.sectionId);
    if (params.academicYearId) query.set("academicYearId", params.academicYearId);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortDir) query.set("sortDir", params.sortDir);
    query.set("page", String(targetPage));
    return `/admin/students?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Students</h1>
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
            placeholder="Name, admission no., UDISE, guardian name/phone"
            className="w-72"
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
            <option value="ALUMNI">Alumni</option>
            <option value="TRANSFERRED_OUT">Transferred Out</option>
            <option value="WITHDRAWN">Withdrawn</option>
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
          <Label htmlFor="sortBy">Sort by</Label>
          <select
            id="sortBy"
            name="sortBy"
            defaultValue={params.sortBy ?? "name"}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="name">Name</option>
            <option value="admissionNumber">Admission No.</option>
            <option value="status">Status</option>
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
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Admission No.</th>
              <th className="py-2">Class</th>
              <th className="py-2">Roll No.</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="py-2">{student.fullName}</td>
                <td className="py-2">{student.admissionNumber}</td>
                <td className="py-2">
                  {student.schoolClassName
                    ? `${student.schoolClassName} - ${student.sectionName}`
                    : "Not enrolled"}
                </td>
                <td className="py-2">{student.rollNumber ?? "—"}</td>
                <td className="py-2">{formatEnumLabel(student.status)}</td>
                <td className="py-2">
                  <Link href={`/admin/students/${student.id}`} className="text-primary underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground py-4 text-center">
                  No students found.
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

function isStatus(
  value: string | undefined,
): value is "ACTIVE" | "ALUMNI" | "TRANSFERRED_OUT" | "WITHDRAWN" | "ALL" {
  return (
    value === "ACTIVE" ||
    value === "ALUMNI" ||
    value === "TRANSFERRED_OUT" ||
    value === "WITHDRAWN" ||
    value === "ALL"
  );
}

function isSortBy(value: string | undefined): value is "name" | "admissionNumber" | "status" {
  return value === "name" || value === "admissionNumber" || value === "status";
}

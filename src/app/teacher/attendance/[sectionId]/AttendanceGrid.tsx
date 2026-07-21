"use client";

import { useMemo, useState, useTransition } from "react";

import type { AttendanceStatus } from "@/generated/prisma/enums";
import type { AttendanceGridRowDTO } from "@/services/attendance/attendanceSessionWorkspace.dto";
import { submitAttendanceGridAction } from "@/app/teacher/attendance/[sectionId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LEAVE", label: "Leave" },
];

interface AttendanceGridProps {
  sectionId: string;
  sessionId: string;
  rows: AttendanceGridRowDTO[];
  locked: boolean;
}

/**
 * The interactive Attendance Grid — the one Client Component this sprint
 * adds. Everything here (search, sort, bulk mark, reset, per-row status)
 * is local `useState`, never a server round trip; Submit is the single
 * point that calls the server, via submitAttendanceGridAction() imported
 * directly (not a native `<form>` — the payload is a structured array).
 * Deliberately no auto-save-per-click: with a realistic section size
 * (up to ~40 students, PRODUCT_VISION.md § 3), one batch submit is both
 * simpler and matches submitAttendance()'s own one-transaction design
 * (TRANSACTION_BOUNDARIES.md § 2) more naturally than 40 individual
 * round trips would.
 */
export default function AttendanceGrid({
  sectionId,
  sessionId,
  rows,
  locked,
}: AttendanceGridProps) {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus | null>>(() =>
    Object.fromEntries(rows.map((row) => [row.enrollmentId, row.currentStatus])),
  );
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"roll" | "name">("roll");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleRows = useMemo(() => {
    const filtered = query
      ? rows.filter(
          (row) =>
            row.fullName.toLowerCase().includes(query.toLowerCase()) ||
            row.admissionNumber.toLowerCase().includes(query.toLowerCase()),
        )
      : rows;
    const sorted = [...filtered];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else {
      sorted.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));
    }
    return sorted;
  }, [rows, query, sortBy]);

  const markedCount = Object.values(statuses).filter((s) => s !== null).length;

  function setAll(status: AttendanceStatus) {
    setStatuses(Object.fromEntries(rows.map((row) => [row.enrollmentId, status])));
  }

  function resetAll() {
    setStatuses(Object.fromEntries(rows.map((row) => [row.enrollmentId, null])));
  }

  function handleSubmit() {
    setError(null);
    const records = Object.entries(statuses)
      .filter((entry): entry is [string, AttendanceStatus] => entry[1] !== null)
      .map(([enrollmentId, status]) => ({ enrollmentId, status }));

    startTransition(async () => {
      const result = await submitAttendanceGridAction({ sectionId, sessionId, records });
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {locked ? (
        <div
          role="status"
          className="rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm"
        >
          This session is fully marked and locked. Ask an Administrator to reopen it to make further
          changes.
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="grid-search" className="text-muted-foreground text-xs">
            Search
          </label>
          <Input
            id="grid-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or admission no."
            className="w-56"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="grid-sort" className="text-muted-foreground text-xs">
            Sort by
          </label>
          <select
            id="grid-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value === "name" ? "name" : "roll")}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="roll">Roll No.</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => setAll("PRESENT")}
          >
            Bulk Present
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => setAll("ABSENT")}
          >
            Bulk Absent
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={locked} onClick={resetAll}>
            Reset Session
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Student</th>
              <th className="py-2">Admission No.</th>
              <th className="py-2">Guardian</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.enrollmentId} className="border-b">
                <td className="py-2">
                  <span
                    aria-hidden
                    className="bg-muted mr-2 inline-block size-6 rounded-full align-middle"
                  />
                  {row.fullName}
                </td>
                <td className="py-2">{row.admissionNumber}</td>
                <td className="py-2 text-xs">{row.guardianSummary}</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {STATUS_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="xs"
                        disabled={locked}
                        variant={
                          statuses[row.enrollmentId] === option.value ? "default" : "outline"
                        }
                        onClick={() =>
                          setStatuses((prev) => ({ ...prev, [row.enrollmentId]: option.value }))
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground py-4 text-center">
                  No students match this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {markedCount}/{rows.length} marked
        </span>
        <Button
          type="button"
          disabled={locked || isPending || markedCount === 0}
          onClick={handleSubmit}
        >
          {isPending ? "Submitting…" : "Submit Attendance"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";

import type { MarksGridRowDTO } from "@/services/marks/marksEntryWorkspace.dto";
import {
  saveDraftMarksAction,
  submitMarksGridAction,
} from "@/app/teacher/marks/[scheduleId]/[sectionId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MarksGridProps {
  scheduleId: string;
  sectionId: string;
  rows: MarksGridRowDTO[];
  maxMarks: number;
  passMarks: number;
  locked: boolean;
}

/**
 * The interactive Marks Entry Grid — mirrors AttendanceGrid.tsx's own
 * shape exactly (Sprint E2): all local `useState`, no server round trip
 * until an explicit action button. Two distinct server actions, not one —
 * "Save Draft" (partial work, no lifecycle change) and "Submit" (final,
 * requires every row filled) are genuinely different operations per this
 * sprint's own explicit requirement, so they're two buttons calling two
 * different Server Actions, not one button with a mode flag.
 */
export default function MarksGrid({
  scheduleId,
  sectionId,
  rows,
  maxMarks,
  passMarks,
  locked,
}: MarksGridProps) {
  const initialMarks = useMemo(
    () =>
      Object.fromEntries(
        rows.map((row) => [
          row.enrollmentId,
          row.marksObtained !== null ? String(row.marksObtained) : "",
        ]),
      ),
    [rows],
  );
  const [marks, setMarks] = useState<Record<string, string>>(initialMarks);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleRows = useMemo(() => {
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.fullName.toLowerCase().includes(query.toLowerCase()) ||
        row.admissionNumber.toLowerCase().includes(query.toLowerCase()),
    );
  }, [rows, query]);

  // Unsaved-changes detection — compares the current input state against
  // the last-loaded-from-server snapshot, this sprint's own explicit
  // requirement. A page reload always re-fetches the workspace, so
  // `initialMarks` is always "what the server currently has."
  const hasUnsavedChanges = useMemo(
    () =>
      rows.some(
        (row) => (marks[row.enrollmentId] ?? "") !== (initialMarks[row.enrollmentId] ?? ""),
      ),
    [rows, marks, initialMarks],
  );

  const enteredCount = Object.values(marks).filter((v) => v.trim() !== "").length;

  function rowError(enrollmentId: string): string | null {
    const raw = marks[enrollmentId];
    if (!raw || raw.trim() === "") return null;
    const value = Number(raw);
    if (Number.isNaN(value) || value < 0) return "Invalid";
    if (value > maxMarks) return `Exceeds max (${maxMarks})`;
    return null;
  }

  const hasRowErrors = rows.some((row) => rowError(row.enrollmentId) !== null);

  function collectRecords(): { enrollmentId: string; marksObtained: number }[] {
    return Object.entries(marks)
      .filter(([, v]) => v.trim() !== "" && !Number.isNaN(Number(v)))
      .map(([enrollmentId, v]) => ({ enrollmentId, marksObtained: Number(v) }));
  }

  function handleSaveDraft() {
    setError(null);
    const records = collectRecords();
    startTransition(async () => {
      const result = await saveDraftMarksAction({ scheduleId, sectionId, records });
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  function handleSubmit() {
    setError(null);
    const records = collectRecords();
    startTransition(async () => {
      const result = await submitMarksGridAction({ scheduleId, sectionId, records });
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
          This section is locked — either fully submitted, or the examination is no longer ACTIVE.
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
      {hasUnsavedChanges && !locked ? (
        <div
          role="status"
          className="rounded-md border border-amber-600/30 bg-amber-600/5 p-2 text-xs"
        >
          You have unsaved changes.
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="marks-grid-search" className="text-muted-foreground text-xs">
            Search
          </label>
          <Input
            id="marks-grid-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or admission no."
            className="w-56"
          />
        </div>
        <div className="text-muted-foreground ml-auto text-xs">
          Max marks: {maxMarks} · Pass marks: {passMarks}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Roll No.</th>
              <th className="py-2">Student</th>
              <th className="py-2">Admission No.</th>
              <th className="py-2">Marks</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const err = rowError(row.enrollmentId);
              return (
                <tr key={row.enrollmentId} className="border-b">
                  <td className="py-2">{row.rollNumber}</td>
                  <td className="py-2">{row.fullName}</td>
                  <td className="py-2">{row.admissionNumber}</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      min={0}
                      max={maxMarks}
                      disabled={locked || row.status === "SUBMITTED"}
                      value={marks[row.enrollmentId] ?? ""}
                      onChange={(e) =>
                        setMarks((prev) => ({ ...prev, [row.enrollmentId]: e.target.value }))
                      }
                      className={`w-24 ${err ? "border-destructive" : ""}`}
                    />
                    {err ? <p className="text-destructive mt-1 text-xs">{err}</p> : null}
                  </td>
                  <td className="py-2 text-xs">
                    {row.status === "SUBMITTED"
                      ? "Submitted"
                      : row.status === "DRAFT"
                        ? "Draft"
                        : "Not entered"}
                  </td>
                </tr>
              );
            })}
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground py-4 text-center">
                  No students match this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {enteredCount}/{rows.length} entered
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={locked || isPending || hasRowErrors || enteredCount === 0}
            onClick={handleSaveDraft}
          >
            {isPending ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={locked || isPending || hasRowErrors || enteredCount !== rows.length}
            onClick={handleSubmit}
            title={
              enteredCount !== rows.length
                ? "Every student needs marks before you can submit."
                : undefined
            }
          >
            {isPending ? "Submitting…" : "Submit Marks"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

import type { PromotionReviewRowDTO } from "@/services/promotion/promotionReviewWorkspace.dto";
import {
  finalizePromotionsAction,
  type FinalizePromotionsResult,
} from "@/app/admin/promotions/[schoolClassId]/[sectionId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TargetClassOption {
  id: string;
  name: string;
}
interface TargetSectionOption {
  id: string;
  name: string;
  schoolClassId: string;
}

interface RowDecision {
  outcome: "PROMOTED" | "DETAINED" | "";
  basis: "NO_DETENTION_POLICY" | "EXAM_RESULT" | "RE_EXAM" | "";
  targetSchoolClassId: string;
  targetSectionId: string;
  targetRollNumber: string;
}

const EMPTY_DECISION: RowDecision = {
  outcome: "",
  basis: "",
  targetSchoolClassId: "",
  targetSectionId: "",
  targetRollNumber: "",
};

const BASIS_LABEL: Record<string, string> = {
  NO_DETENTION_POLICY: "No-Detention Policy",
  EXAM_RESULT: "Exam Result",
  RE_EXAM: "Re-Examination",
};

/**
 * The interactive Promotion Review Grid — mirrors MarksGrid.tsx's own
 * shape (local state per row, one Server Action for the real mutation).
 * Each already-finalized row (existingDecision !== null) renders
 * read-only, per this sprint's own "already-finalized rows stay finished,
 * not re-editable" requirement (Q15). Every other row collects a decision
 * locally; "Finalize Ready Decisions" submits every row with a complete
 * decision in one Server Action call, which itself processes each
 * student as an independent transaction (see actions.ts's own comment) —
 * one student's failure never blocks or reverts another's.
 */
export default function PromotionReviewGrid({
  rows,
  sourceSchoolClassId,
  targetAcademicYearId,
  targetSchoolClasses,
  targetSections,
}: {
  rows: PromotionReviewRowDTO[];
  sourceSchoolClassId: string;
  targetAcademicYearId: string | null;
  targetSchoolClasses: TargetClassOption[];
  targetSections: TargetSectionOption[];
}) {
  const [decisions, setDecisions] = useState<Record<string, RowDecision>>({});
  const [results, setResults] = useState<FinalizePromotionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingRows = rows.filter((row) => !row.existingDecision);

  function updateDecision(sourceEnrollmentId: string, patch: Partial<RowDecision>) {
    setDecisions((prev) => ({
      ...prev,
      [sourceEnrollmentId]: { ...(prev[sourceEnrollmentId] ?? EMPTY_DECISION), ...patch },
    }));
  }

  function applyRepeatSameClass(sourceEnrollmentId: string) {
    updateDecision(sourceEnrollmentId, {
      outcome: "DETAINED",
      targetSchoolClassId: sourceSchoolClassId,
      targetSectionId: "",
    });
  }

  function isReady(decision: RowDecision | undefined): decision is RowDecision {
    return !!(
      decision &&
      decision.outcome &&
      decision.basis &&
      decision.targetSchoolClassId &&
      decision.targetSectionId &&
      decision.targetRollNumber.trim()
    );
  }

  const readyCount = pendingRows.filter((row) => isReady(decisions[row.sourceEnrollmentId])).length;

  function handleFinalize() {
    setError(null);
    if (!targetAcademicYearId) {
      setError("Select a Target Academic Year on the Promotion Home page first.");
      return;
    }
    const payload = pendingRows
      .filter((row) => isReady(decisions[row.sourceEnrollmentId]))
      .map((row) => {
        const decision = decisions[row.sourceEnrollmentId] as RowDecision;
        return {
          sourceEnrollmentId: row.sourceEnrollmentId,
          studentName: row.studentName,
          outcome: decision.outcome,
          basis: decision.basis,
          targetAcademicYearId,
          targetSchoolClassId: decision.targetSchoolClassId,
          targetSectionId: decision.targetSectionId,
          targetRollNumber: decision.targetRollNumber,
        };
      });
    if (payload.length === 0) {
      setError(
        "No rows are ready to finalize yet — fill in Outcome, Basis, Target Class/Section and Roll Number.",
      );
      return;
    }
    startTransition(async () => {
      const result = await finalizePromotionsAction(payload);
      setResults(result);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {!targetAcademicYearId ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm"
        >
          No Target Academic Year selected — go back to Promotion Home and select one before
          recording decisions.
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
      {results ? (
        <div role="status" className="flex flex-col gap-2 rounded-md border p-3 text-sm">
          <p className="font-medium">
            {results.succeeded.length} finalized, {results.failed.length} failed.
          </p>
          {results.failed.length > 0 ? (
            <ul className="text-destructive flex flex-col gap-1 text-xs">
              {results.failed.map((f) => (
                <li key={f.sourceEnrollmentId}>
                  {f.studentName}: {f.error}
                </li>
              ))}
            </ul>
          ) : null}
          {results.succeeded.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              Refresh this page to see finalized rows move to their read-only state.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-240 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Roll No.</th>
              <th className="py-2">Student</th>
              <th className="py-2">Academic Result</th>
              <th className="py-2">Recommendation</th>
              <th className="py-2">Outcome</th>
              <th className="py-2">Basis</th>
              <th className="py-2">Target Class</th>
              <th className="py-2">Target Section</th>
              <th className="py-2">Target Roll No.</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.existingDecision) {
                const d = row.existingDecision;
                return (
                  <tr key={row.sourceEnrollmentId} className="border-b align-top">
                    <td className="py-2">{row.rollNumber}</td>
                    <td className="py-2">{row.studentName}</td>
                    <td className="py-2">
                      <ResultSummary row={row} />
                    </td>
                    <td className="text-muted-foreground py-2 text-xs">—</td>
                    <td className="py-2">{d.outcome}</td>
                    <td className="py-2">{BASIS_LABEL[d.basis] ?? d.basis}</td>
                    <td className="py-2">{d.targetSchoolClassName ?? "—"}</td>
                    <td className="py-2">{d.targetSectionName ?? "—"}</td>
                    <td className="py-2">{d.targetRollNumber ?? "—"}</td>
                    <td className="py-2 text-xs">
                      Finalized {new Date(d.decidedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              }

              const decision = decisions[row.sourceEnrollmentId] ?? EMPTY_DECISION;
              const availableTargetSections = targetSections.filter(
                (s) => s.schoolClassId === decision.targetSchoolClassId,
              );

              return (
                <tr key={row.sourceEnrollmentId} className="border-b align-top">
                  <td className="py-2">{row.rollNumber}</td>
                  <td className="py-2">{row.studentName}</td>
                  <td className="py-2">
                    <ResultSummary row={row} />
                  </td>
                  <td className="text-muted-foreground py-2 text-xs">
                    {row.recommendation.reason}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col gap-1">
                      <select
                        disabled={!targetAcademicYearId}
                        value={decision.outcome}
                        onChange={(e) =>
                          updateDecision(row.sourceEnrollmentId, {
                            outcome: e.target.value as RowDecision["outcome"],
                          })
                        }
                        className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="PROMOTED">Promoted</option>
                        <option value="DETAINED">Detained</option>
                      </select>
                      {decision.outcome === "DETAINED" ? (
                        <button
                          type="button"
                          className="text-primary text-left text-xs underline"
                          onClick={() => applyRepeatSameClass(row.sourceEnrollmentId)}
                        >
                          Repeat Same Class
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2">
                    <select
                      disabled={!targetAcademicYearId}
                      value={decision.basis}
                      onChange={(e) =>
                        updateDecision(row.sourceEnrollmentId, {
                          basis: e.target.value as RowDecision["basis"],
                        })
                      }
                      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="NO_DETENTION_POLICY">No-Detention Policy</option>
                      <option value="EXAM_RESULT">Exam Result</option>
                      <option value="RE_EXAM">Re-Examination</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <select
                      disabled={!targetAcademicYearId}
                      value={decision.targetSchoolClassId}
                      onChange={(e) =>
                        updateDecision(row.sourceEnrollmentId, {
                          targetSchoolClassId: e.target.value,
                          targetSectionId: "",
                        })
                      }
                      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                    >
                      <option value="">Select</option>
                      {targetSchoolClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <select
                      disabled={!targetAcademicYearId || !decision.targetSchoolClassId}
                      value={decision.targetSectionId}
                      onChange={(e) =>
                        updateDecision(row.sourceEnrollmentId, { targetSectionId: e.target.value })
                      }
                      className="border-input bg-background h-8 rounded-md border px-2 text-sm disabled:opacity-50"
                    >
                      <option value="">Select</option>
                      {availableTargetSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <Input
                      disabled={!targetAcademicYearId}
                      value={decision.targetRollNumber}
                      onChange={(e) =>
                        updateDecision(row.sourceEnrollmentId, { targetRollNumber: e.target.value })
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="py-2 text-xs">
                    {isReady(decisions[row.sourceEnrollmentId]) ? "Ready" : "Pending"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {readyCount}/{pendingRows.length} ready to finalize
        </span>
        <Button
          type="button"
          disabled={!targetAcademicYearId || isPending || readyCount === 0}
          onClick={handleFinalize}
        >
          {isPending ? "Finalizing…" : `Finalize Ready Decisions (${readyCount})`}
        </Button>
      </div>
    </div>
  );
}

function ResultSummary({ row }: { row: PromotionReviewRowDTO }) {
  if (row.publishedExaminations.length === 0) {
    return <span className="text-muted-foreground text-xs">No published results</span>;
  }
  const latest = row.publishedExaminations[row.publishedExaminations.length - 1];
  const passed = latest.subjects.filter((s) => s.passed).length;
  return (
    <span className="text-xs">
      {latest.examinationName}: {passed}/{latest.subjects.length} passed
    </span>
  );
}

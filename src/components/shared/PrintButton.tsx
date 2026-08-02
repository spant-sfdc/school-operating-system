"use client";

import { Button } from "@/components/ui/button";

// The entire "PDF strategy" for Sprint E12's own Report Card (Q21) —
// print-optimized HTML plus the browser's own Print -> Save as PDF, not a
// new PDF-generation dependency. This is the one piece of client
// interactivity a Server-Component-rendered report card page needs.
export default function PrintButton() {
  return (
    <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}>
      Print
    </Button>
  );
}

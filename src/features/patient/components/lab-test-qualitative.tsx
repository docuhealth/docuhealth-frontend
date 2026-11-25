import { ClipboardTextIcon, FlagIcon } from "@phosphor-icons/react";
import { DetailRows, SectionLabel } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { VisitNoteCard } from "@/features/patient/components/visit-note-card";
import { notYet } from "@/features/patient/lib/not-yet";
import { type LabTest, specimenLine } from "@/features/patient/lib/results";

/** A result that's a word ("Negative"), what it means, and how the test was done. */
export function LabTestQualitative({ test }: { test: LabTest }) {
  const result = test.report?.qualitative;
  if (!result) return null;
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <VisitNoteCard icon={<ClipboardTextIcon />} label="Result" tone="info">
        <span className="mb-1 flex flex-wrap items-center gap-2">
          <span className="type-title text-fg-heading">{result.result}</span>
          <Tag tone={result.normal ? "success" : "warning"}>{result.finding}</Tag>
        </span>
        {result.explanation && (
          <span className="type-caption text-fg-caption">{result.explanation}</span>
        )}
      </VisitNoteCard>
      <div className="flex flex-col gap-2">
        <SectionLabel>Details</SectionLabel>
        <DetailRows
          rows={[
            ["Method", test.report?.method ?? "—"],
            ["Specimen", specimenLine(test) ?? "—"],
            ["Ordered by", test.orderedBy ?? "—"],
            ["Visit", test.visit ?? "—"],
          ]}
        />
        {/* TODO(api): nowhere to send a correction yet. */}
        <button
          type="button"
          onClick={notYet("Reporting a problem with a result")}
          className="mt-2 flex items-center justify-center gap-1.5 self-center type-body-sm-medium text-error-500 hover:underline"
        >
          <FlagIcon aria-hidden className="size-4" />
          Something not right? Report it
        </button>
      </div>
    </div>
  );
}

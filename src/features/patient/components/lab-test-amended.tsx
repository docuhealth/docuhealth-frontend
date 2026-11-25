import { CaretRightIcon, ClockCounterClockwiseIcon, FileTextIcon } from "@phosphor-icons/react";
import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { VisitNoteCard } from "@/features/patient/components/visit-note-card";
import { notYet } from "@/features/patient/lib/not-yet";
import { flagTag, type LabTest, valueWithUnit } from "@/features/patient/lib/results";
import { formatDayMonth } from "@/lib/format";

/** A result the lab corrected: when and why, what changed, and the values as they are now. */
export function LabTestAmended({ test }: { test: LabTest }) {
  const amendment = test.report?.amendment;
  if (!amendment) return null;
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-4">
        <VisitNoteCard icon={<ClockCounterClockwiseIcon />} label="Result update" tone="success">
          <span className="mb-1 block type-title text-fg-heading">
            Corrected on {formatDayMonth(new Date(amendment.at))}
          </span>
          <span className="type-caption text-fg-caption">{amendment.summary}</span>
        </VisitNoteCard>
        {amendment.changes.length > 0 && (
          <VisitNoteCard icon={<FileTextIcon />} label="What changed" tone="info">
            {amendment.changes.map((change) => (
              <span key={change.name} className="mb-1 flex items-center justify-between gap-3">
                <span className="type-title text-fg-heading">{change.name}</span>
                <span className="flex items-center gap-2 type-body-sm-regular">
                  <span className="text-fg-caption line-through">
                    <span className="sr-only">was </span>
                    {change.from}
                  </span>
                  <span aria-hidden className="text-fg-caption">
                    →
                  </span>
                  <span className="text-fg-heading">
                    <span className="sr-only">now </span>
                    {change.to}
                  </span>
                </span>
              </span>
            ))}
            {(amendment.reason || amendment.by) && (
              <span className="type-caption text-fg-caption">
                {[amendment.reason && `Reason: ${amendment.reason.toLowerCase()}`, amendment.by]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </VisitNoteCard>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {test.values.length > 0 && (
          <RecordList label="Results">
            {test.values.map((value) => (
              <RecordRow
                key={value.id}
                title={value.name}
                meta={valueWithUnit(value)}
                status={<Tag tone={flagTag(value.flag).tone}>{flagTag(value.flag).label}</Tag>}
              />
            ))}
          </RecordList>
        )}
        {/* TODO(api): earlier versions of a result aren't served to patients. */}
        <button
          type="button"
          onClick={notYet("Viewing the original version")}
          className="flex items-center justify-center gap-1 self-center type-body-sm-medium text-primary hover:underline"
        >
          View original version
          <CaretRightIcon aria-hidden className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

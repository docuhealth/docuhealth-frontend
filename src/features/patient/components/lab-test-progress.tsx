import { FlaskIcon } from "@phosphor-icons/react";
import { DetailRows, SectionLabel } from "@/features/patient/components/patient-ui";
import { ScanProgressSteps } from "@/features/patient/components/scan-progress-steps";
import { VisitNoteCard } from "@/features/patient/components/visit-note-card";
import { type LabTest, labProgressSteps } from "@/features/patient/lib/results";

/** A test still being processed: how far along it is, what it's for and the sample. */
export function LabTestProgress({ test }: { test: LabTest }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-2">
        <SectionLabel>Progress</SectionLabel>
        <div className="rounded-xl border bg-card p-4">
          <ScanProgressSteps steps={labProgressSteps(test)} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {test.report?.about && (
          <VisitNoteCard icon={<FlaskIcon />} label="Test details" tone="success">
            {test.report.about}
          </VisitNoteCard>
        )}
        <DetailRows
          rows={[
            ["Ordered by", test.orderedBy ?? "—"],
            ["Sample", test.report?.specimen ?? "—"],
          ]}
        />
      </div>
    </div>
  );
}

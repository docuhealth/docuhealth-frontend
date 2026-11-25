import { DetailRows } from "@/features/patient/components/patient-ui";
import { ScanCard } from "@/features/patient/components/scan-card";
import { ScanNote } from "@/features/patient/components/scan-note";
import { ScanProgressSteps } from "@/features/patient/components/scan-progress-steps";
import { progressSteps, type ScanView } from "@/features/patient/lib/scans";

/** A scan still waiting for its report: how far along it is, and why there are no images yet. */
export function ScanProgress({ scan }: { scan: ScanView }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <ScanCard title="Progress">
        <ScanProgressSteps steps={progressSteps(scan)} />
      </ScanCard>
      <div className="flex flex-col gap-4">
        <ScanNote>
          Images are only shared once the report is ready, so you and your doctor see them together.
        </ScanNote>
        <DetailRows
          rows={[
            ["Type", scan.report?.type ?? "—"],
            ["Ordered by", scan.orderedBy ?? "—"],
          ]}
        />
      </div>
    </div>
  );
}

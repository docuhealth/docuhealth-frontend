import { DetailRows } from "@/features/patient/components/patient-ui";
import { ScanCard } from "@/features/patient/components/scan-card";
import { ScanFullReport } from "@/features/patient/components/scan-full-report";
import { ScanImagesCard } from "@/features/patient/components/scan-images-card";
import { ScanNote } from "@/features/patient/components/scan-note";
import type { ScanView } from "@/features/patient/lib/scans";
import { formatDateCommaTime } from "@/lib/format";

/**
 * A scan whose report is out: its images, the impression and the full report, and who did what.
 * Without a report record (TODO(api)) only the order is known, so it says they're on the way.
 */
export function ScanReportReady({ scan }: { scan: ScanView }) {
  const report = scan.report;
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-4">
        {!report ? (
          <ScanCard title="Report">
            <ScanNote>Images and the report will show here once they’re shared with you.</ScanNote>
          </ScanCard>
        ) : (
          <>
            {report.images > 0 && <ScanImagesCard scanId={scan.id} images={report.images} />}
            {report.impression && (
              <ScanCard title="Impression">
                <p className="type-body-sm-regular">{report.impression}</p>
                <ScanNote>
                  Your doctor will go through this report with you at your next visit.
                </ScanNote>
              </ScanCard>
            )}
            {report.findings && <ScanFullReport findings={report.findings} />}
          </>
        )}
      </div>
      <DetailRows
        rows={[
          ["Body part", report?.bodyPart ?? "—"],
          ["Type", report?.type ?? "—"],
          ["Ordered by", scan.orderedBy ?? "—"],
          ["Reported by", report?.reportedBy ?? "—"],
          ["Reported", report?.reportedAt ? formatDateCommaTime(new Date(report.reportedAt)) : "—"],
        ]}
      />
    </div>
  );
}

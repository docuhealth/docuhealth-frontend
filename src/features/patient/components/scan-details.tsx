import { HospitalIcon, ScanIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { ScanProgress } from "@/features/patient/components/scan-progress";
import { ScanReportReady } from "@/features/patient/components/scan-report-ready";
import { Tag } from "@/features/patient/components/tag";
import { scanTag, scanTime } from "@/features/patient/lib/scans";
import { useScans } from "@/features/patient/lib/use-scans";
import { formatDay } from "@/lib/format";

/** One scan: its report and images once it's ready, or how far along it is. */
export function ScanDetails({ scanId }: { scanId: string }) {
  const { scans, isError } = useScans();
  const scan = scans?.find((candidate) => candidate.id === scanId);

  return (
    <div className="flex flex-col gap-5">
      <PageHeading
        title="Scan details"
        back={{ to: "/patient/health/scans", label: "Back to Scan Results" }}
      />
      {!scans && !isError ? (
        <ListSkeleton />
      ) : !scan ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="Scan not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-title text-fg-heading">{scan.name}</h1>
              <Tag tone={scanTag(scan).tone}>{scanTag(scan).label}</Tag>
            </div>
            <p className="flex items-center gap-1.5 type-caption text-fg-caption">
              <HospitalIcon aria-hidden className="size-3.5" />
              {[
                scan.state === "ready"
                  ? formatDay(new Date(scan.scannedAt))
                  : scanTime(scan.scannedAt),
                scan.facility,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {scan.state === "ready" ? <ScanReportReady scan={scan} /> : <ScanProgress scan={scan} />}
        </>
      )}
    </div>
  );
}

import { ScanIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { dated } from "@/features/patient/lib/dated";
import { orderStatusLabel, scansOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * Scans ordered at the patient's visits, by facility. TODO(api): no report status, images or
 * report text for patients; a scan shows what was ordered and where.
 */
export function ScanResultsPage() {
  const { data, isError } = useVisits();
  const scans = data ? scansOf(data) : [];
  const facilities = [...new Set(scans.map((scan) => scan.facility).filter(Boolean))] as string[];
  const [facility, setFacility] = useState<string | null>(null);
  const shown = facility ? scans.filter((scan) => scan.facility === facility) : scans;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Scan results"
        subtitle={data ? (scans.length ? `${scans.length} scans` : "No scans yet") : null}
      />
      <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
      {!data && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="No scan results yet!"
          description="Your imaging and scan results will appear here once they’re available."
        />
      ) : (
        <RecordList label="Scan results">
          {shown.map((scan) => (
            <RecordRow
              key={scan.id}
              title={scan.name}
              detail={[dated(scan.at), scan.facility].filter(Boolean).join(" · ")}
              status={
                scan.status && <StatusPill tone="info">{orderStatusLabel(scan.status)}</StatusPill>
              }
              to="/patient/health/scans/$scanId"
              params={{ scanId: scan.id }}
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}

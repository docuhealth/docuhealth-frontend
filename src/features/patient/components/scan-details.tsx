import { ScanIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { dated } from "@/features/patient/lib/dated";
import { scansOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";

/** One scan: what was ordered, where, by whom. TODO(api): images and the report aren't shared. */
export function ScanDetails({ scanId }: { scanId: string }) {
  const { data } = useVisits();
  const scan = data ? scansOf(data).find((candidate) => candidate.id === scanId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Scan details"
        back={{ to: "/patient/health/scans", label: "Back to Scan Results" }}
      />
      {!data ? (
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
            <p className="type-title text-fg-heading">{scan.name}</p>
            <p className="type-caption text-fg-caption">
              {[dated(scan.at), scan.facility].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-xl border bg-card p-5">
              <p className="type-body-sm-medium text-fg-heading">Report</p>
              <p className="mt-2 rounded-lg bg-info-100 px-3 py-2 type-body-sm-regular text-info-500">
                Images and the radiologist’s report will show here once they’re shared with you.
                Your doctor will go through them with you.
              </p>
            </div>
            <DetailRows
              rows={[
                ["Scan", scan.name],
                ["Ordered by", scan.orderedBy],
                ["Facility", scan.facility],
                ["Ordered", dated(scan.at)],
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

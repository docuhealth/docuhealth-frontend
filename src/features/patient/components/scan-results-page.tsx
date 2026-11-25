import { FunnelSimpleIcon, ScanIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { DateDivider } from "@/features/patient/components/date-divider";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { ScanRow } from "@/features/patient/components/scan-row";
import { notYet } from "@/features/patient/lib/not-yet";
import { groupByDay } from "@/features/patient/lib/scans";
import { useScans } from "@/features/patient/lib/use-scans";
import { plural } from "@/lib/format";

/** The patient's scans by day, filtered by facility, each with where its report is. */
export function ScanResultsPage() {
  const { scans, isError } = useScans();
  const [facility, setFacility] = useState<string | null>(null);
  const facilities = [
    ...new Set((scans ?? []).map((scan) => scan.facility).filter((name) => name != null)),
  ];
  const shown = (scans ?? []).filter((scan) => !facility || scan.facility === facility);
  const fresh = (scans ?? []).filter((scan) => scan.isNew).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="Scan results"
        back={{ to: "/patient/health", label: "Back to Health" }}
        subtitle={
          !scans
            ? null
            : scans.length
              ? [plural(scans.length, "scan"), fresh ? `${fresh} new` : null]
                  .filter(Boolean)
                  .join(" · ")
              : "No scans yet"
        }
      />
      <div className="flex items-start justify-between gap-3">
        <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
        {/* TODO(api): no other ways to filter scans yet. */}
        <button
          type="button"
          aria-label="More filters"
          onClick={notYet("More filters")}
          className="grid size-9 shrink-0 place-content-center rounded-full bg-card text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
        >
          <FunnelSimpleIcon className="size-4" />
        </button>
      </div>
      {!scans && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="No scan results yet!"
          description="Your imaging and scan results will appear here once they’re available."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {groupByDay(shown).map((group) => (
            <section key={group.label} aria-label={group.label} className="flex flex-col gap-3">
              <DateDivider>{group.label}</DateDivider>
              {group.scans.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

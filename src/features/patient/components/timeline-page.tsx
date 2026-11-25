import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { medicationDetailsQuery, visitDetailsQuery } from "@/features/patient/api/pending";
import { drugsQuery, vitalsQuery } from "@/features/patient/api/queries";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { TimelineGroup } from "@/features/patient/components/timeline-group";
import { VisitFilterButton } from "@/features/patient/components/visit-filter-button";
import { VitalChips } from "@/features/patient/components/vital-chips";
import {
  filterTimeline,
  groupByMonth,
  type TimelineFilter,
  timelineEntries,
  timelineFilters,
} from "@/features/patient/lib/timeline";
import { useScans } from "@/features/patient/lib/use-scans";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * Everything on the patient's record by month, newest first: visits, results, readings,
 * prescriptions and scans, filtered by kind and facility. Built from the other record pages'
 * data; TODO(api): visit types, medication facilities and scan reports are pending records.
 */
export function TimelinePage() {
  const visits = useVisits();
  const vitals = useQuery(vitalsQuery());
  const drugs = useQuery(drugsQuery());
  const { scans, isError: scansError } = useScans();
  const visitDetails = useQuery(visitDetailsQuery()).data ?? [];
  const medicationDetails = useQuery(medicationDetailsQuery()).data ?? [];
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [facility, setFacility] = useState<string | null>(null);
  const [filtering, setFiltering] = useState(false);

  const loading =
    (!visits.data && !visits.isError) ||
    (!vitals.data && !vitals.isError) ||
    (!drugs.data && !drugs.isError) ||
    (!scans && !scansError);
  const entries = timelineEntries({
    visits: visits.data ?? [],
    visitDetails,
    vitals: vitals.data ?? [],
    drugs: drugs.data ?? [],
    medicationDetails,
    scans: scans ?? [],
  });
  const facilities = [
    ...new Set(entries.map((entry) => entry.facility).filter((name) => name != null)),
  ];
  const groups = groupByMonth(filterTimeline(entries, filter, facility));

  return (
    <div className="flex flex-col gap-4">
      <PageHeading title="Timeline" back={{ to: "/patient/health", label: "Back to Health" }} />
      <div className="flex items-start justify-between gap-3">
        <VitalChips
          label="Kind of record"
          value={filter}
          options={timelineFilters}
          onChange={setFilter}
        />
        <VisitFilterButton open={filtering} onToggle={() => setFiltering((open) => !open)} />
      </div>
      {filtering && (
        <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
      )}
      {loading ? (
        <ListSkeleton />
      ) : groups.length === 0 ? (
        <PatientEmpty
          icon={<ClockCounterClockwiseIcon />}
          title="Nothing to show yet"
          description="Your health activities and updates will appear here over time."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <TimelineGroup key={group.label} label={group.label} entries={group.entries} />
          ))}
        </div>
      )}
    </div>
  );
}

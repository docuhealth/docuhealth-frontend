import { CalendarBlankIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { visitDetailsQuery } from "@/features/patient/api/pending";
import { appointmentsQuery } from "@/features/patient/api/queries";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { VisitGroup } from "@/features/patient/components/visit-group";
import { VisitTypeChips } from "@/features/patient/components/visit-type-chips";
import { useVisits } from "@/features/patient/lib/use-visits";
import {
  filterVisits,
  type VisitFilter,
  visitFilters,
  visitRows,
} from "@/features/patient/lib/visits";

/**
 * Upcoming appointments and past visits in one list, by type. TODO(api): visit type and
 * admission details come from the pending visit details; without them a visit shows only
 * under "All visits".
 */
export function VisitsPage() {
  const visits = useVisits();
  const appointments = useQuery(appointmentsQuery());
  const details = useQuery(visitDetailsQuery());
  const [filter, setFilter] = useState<VisitFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [facility, setFacility] = useState<string | null>(null);
  // When the page opened: what counts as still to come.
  const [now] = useState(() => new Date());

  const loading =
    (!visits.data && !visits.isError) || (!appointments.data && !appointments.isError);
  const rows = visitRows(visits.data ?? [], appointments.data ?? [], details.data ?? [], now);
  const shown = filterVisits(rows, filter, facility);
  const upcoming = rows.filter((row) => row.when === "upcoming").length;
  const facilities = [
    ...new Set(rows.map((row) => row.facility).filter((name): name is string => !!name)),
  ];
  const label = visitFilters.find((option) => option.value === filter)?.label;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Visits"
        subtitle={
          loading
            ? null
            : rows.length
              ? `${upcoming} upcoming · ${rows.length - upcoming} past`
              : "No visits yet"
        }
        back={{ to: "/patient/health", label: "Back to Health" }}
      />
      <div className="flex flex-col gap-3">
        <VisitTypeChips
          value={filter}
          onChange={setFilter}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
        />
        {filtersOpen && (
          <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
        )}
      </div>
      {loading ? (
        <ListSkeleton />
      ) : !rows.length ? (
        <PatientEmpty
          icon={<CalendarBlankIcon />}
          title="No visits yet"
          description="Your visits will show here after you are seen at a connected facility."
        />
      ) : !shown.length ? (
        <PatientEmpty
          icon={<CalendarBlankIcon />}
          title="No visits here"
          description={`None of your visits match “${label}”${facility ? ` at ${facility}` : ""}.`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <VisitGroup label="Upcoming" rows={shown.filter((row) => row.when === "upcoming")} />
          <VisitGroup label="Past" rows={shown.filter((row) => row.when === "past")} />
        </div>
      )}
    </div>
  );
}

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Segments } from "@/features/patient/components/patient-ui";
import { VisitFilterButton } from "@/features/patient/components/visit-filter-button";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { visitDetailsQuery } from "@/features/patient/api/pending";
import { appointmentsQuery, checkInsQuery } from "@/features/patient/api/queries";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { VisitGroup } from "@/features/patient/components/visit-group";
import { VisitTypeChips } from "@/features/patient/components/visit-type-chips";
import { type VisitView, VisitViewSwitch } from "@/features/patient/components/visit-view-switch";
import { useVisits } from "@/features/patient/lib/use-visits";
import {
  filterVisits,
  type VisitFilter,
  visitFilters,
  visitRows,
} from "@/features/patient/lib/visits";

const VIEW_KEY = "patient.visits.view";

/** The layout the patient chose last time on this device, else the list. */
function savedView(): VisitView {
  try {
    return localStorage.getItem(VIEW_KEY) === "tabs" ? "tabs" : "list";
  } catch {
    return "list";
  }
}

/**
 * Upcoming appointments and past visits in one list, by type: visit summaries, and check-ins
 * that have none. TODO(api): visit type and
 * admission details come from the pending visit details; without them a visit shows only
 * under "All visits".
 */
export function VisitsPage() {
  const visits = useVisits();
  const appointments = useQuery(appointmentsQuery());
  const details = useQuery(visitDetailsQuery());
  const checkIns = useQuery(checkInsQuery());
  const [filter, setFilter] = useState<VisitFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [facility, setFacility] = useState<string | null>(null);
  const [view, setView] = useState<VisitView>(savedView);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const changeView = (next: VisitView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Private window or storage blocked: the choice lasts this visit only.
    }
  };
  // When the page opened: what counts as still to come.
  const [now] = useState(() => new Date());

  const loading =
    (!visits.data && !visits.isError) || (!appointments.data && !appointments.isError);
  const rows = visitRows(
    visits.data ?? [],
    appointments.data ?? [],
    details.data ?? [],
    now,
    checkIns.data ?? [],
  );
  const shown = filterVisits(rows, filter, facility);
  const upcoming = rows.filter((row) => row.when === "upcoming").length;
  const facilities = [
    ...new Set(rows.map((row) => row.facility).filter((name): name is string => !!name)),
  ];
  const label = visitFilters.find((option) => option.value === filter)?.label;
  // In the tab layout the tabs choose upcoming or past, and the type chips aren't shown.
  const listed = view === "tabs" ? filterVisits(rows, "all", facility) : shown;
  const inTab = listed.filter((row) => row.when === tab);

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
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {view === "list" ? (
              <VisitTypeChips value={filter} onChange={setFilter} />
            ) : (
              <Segments
                label="Visits"
                value={tab}
                onChange={setTab}
                options={[
                  { value: "upcoming", label: `Upcoming (${upcoming})` },
                  { value: "past", label: `Past (${rows.length - upcoming})` },
                ]}
              />
            )}
          </div>
          <VisitViewSwitch value={view} onChange={changeView} />
          <VisitFilterButton open={filtersOpen} onToggle={() => setFiltersOpen((open) => !open)} />
        </div>
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
      ) : view === "tabs" ? (
        inTab.length ? (
          <VisitGroup
            label={tab === "upcoming" ? "Upcoming" : "Past"}
            rows={inTab}
            divider={false}
          />
        ) : (
          <PatientEmpty
            icon={<CalendarBlankIcon />}
            title={tab === "upcoming" ? "Nothing booked" : "No past visits"}
            description={
              tab === "upcoming"
                ? "Your next visit will show here once it’s booked."
                : "Your visits will show here after you are seen at a connected facility."
            }
          />
        )
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

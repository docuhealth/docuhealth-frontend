import { CalendarBlankIcon, ClipboardTextIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { appointmentsQuery } from "@/features/patient/api/queries";
import type { Appointment, VisitSummary } from "@/features/patient/api/schemas";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, RecordRow, Segments } from "@/features/patient/components/patient-ui";
import { dated } from "@/features/patient/lib/dated";
import { useVisits } from "@/features/patient/lib/use-visits";
import { formatAppointment } from "@/lib/format";

/**
 * Upcoming appointments and past visits (one per visit summary). TODO(api): no visit type
 * (outpatient, admission, emergency), so the design's type filter isn't offered.
 */
export function VisitsPage() {
  const visits = useVisits();
  const appointments = useQuery(appointmentsQuery());
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  // When the page opened: what counts as still to come.
  const [now] = useState(() => new Date());
  const upcoming = (appointments.data ?? []).filter(
    (a) => new Date(a.at) >= now && a.status !== "cancelled" && a.status !== "completed",
  );
  const past = visits.data ?? [];
  const loading =
    (!visits.data && !visits.isError) || (!appointments.data && !appointments.isError);
  const nothing = !loading && upcoming.length === 0 && past.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Visits"
        subtitle={
          loading
            ? null
            : nothing
              ? "No visits yet"
              : `${upcoming.length} upcoming · ${past.length} past`
        }
      />
      {!nothing && (
        <Segments
          label="Visits"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: `Upcoming (${upcoming.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
        />
      )}
      {loading ? (
        <ListSkeleton />
      ) : nothing ? (
        <PatientEmpty
          icon={<CalendarBlankIcon />}
          title="No visits yet"
          description="Your visits will show here after you are seen at a connected facility."
        />
      ) : tab === "upcoming" ? (
        <UpcomingVisits appointments={upcoming} />
      ) : (
        <PastVisits visits={past} />
      )}
    </div>
  );
}

function UpcomingVisits({ appointments }: { appointments: Appointment[] }) {
  if (!appointments.length) {
    return (
      <PatientEmpty
        icon={<CalendarBlankIcon />}
        title="Nothing booked"
        description="Your next visit will show here once it’s booked."
      />
    );
  }
  return (
    <RecordList label="Upcoming visits">
      {appointments.map((appointment) => (
        <RecordRow
          key={appointment.id}
          title={
            [appointment.type, appointment.clinician?.specialty].filter(Boolean).join(" · ") ||
            "Appointment"
          }
          detail={[formatAppointment(new Date(appointment.at)), appointment.facility]
            .filter(Boolean)
            .join(" · ")}
          status={<StatusPill tone="info">Booked</StatusPill>}
        />
      ))}
    </RecordList>
  );
}

function PastVisits({ visits }: { visits: VisitSummary[] }) {
  if (!visits.length) {
    return (
      <PatientEmpty
        icon={<ClipboardTextIcon />}
        title="No past visits"
        description="Your visits will show here after you are seen at a connected facility."
      />
    );
  }
  return (
    <RecordList label="Past visits">
      {visits.map((visit) => (
        <RecordRow
          key={visit.id}
          title={visit.complaint ?? "Visit"}
          detail={[dated(visit.at), visit.facility, visit.clinician?.name]
            .filter(Boolean)
            .join(" · ")}
          status={<StatusPill tone="neutral">Summary</StatusPill>}
          to="/patient/health/visits/$visitId"
          params={{ visitId: visit.id }}
        />
      ))}
    </RecordList>
  );
}

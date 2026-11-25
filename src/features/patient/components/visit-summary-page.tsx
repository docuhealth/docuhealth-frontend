import {
  ClipboardTextIcon,
  FlaskIcon,
  HeartbeatIcon,
  NoteIcon,
  PillIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import type { VisitSummary } from "@/features/patient/api/schemas";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, RecordRow, SectionLabel } from "@/features/patient/components/patient-ui";
import { VisitNoteCard } from "@/features/patient/components/visit-note-card";
import { useVisits } from "@/features/patient/lib/use-visits";
import { formatAppointment } from "@/lib/format";

/** One visit's summary: why they came, the doctor's note, and what came of it. */
export function VisitSummaryPage({ visitId }: { visitId: string }) {
  const { data } = useVisits();
  const visit = data?.find((candidate) => candidate.id === visitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Visit summary"
        back={{ to: "/patient/health/visits", label: "Back to Visits" }}
      />
      {!data ? (
        <ListSkeleton />
      ) : !visit ? (
        <PatientEmpty
          icon={<ClipboardTextIcon />}
          title="Visit not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="type-title text-fg-heading">{visit.complaint ?? "Visit"}</p>
            <p className="type-caption text-fg-caption">
              {[formatAppointment(new Date(visit.at)), visit.facility, visit.clinician?.name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="flex flex-col gap-4">
              <VisitNoteCard icon={<StethoscopeIcon />} label="Reason" tone="primary">
                {visit.complaint ?? "—"}
              </VisitNoteCard>
              <VisitNoteCard icon={<NoteIcon />} label="Diagnosis" tone="success">
                {visit.diagnosis ?? "—"}
              </VisitNoteCard>
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>From this visit</SectionLabel>
              <FromThisVisit visit={visit} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** The lab tests, medicines and vital signs recorded at a visit. */
function FromThisVisit({ visit }: { visit: VisitSummary }) {
  if (visit.labTests.length + visit.drugs.length === 0 && !visit.vitals) {
    return (
      <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
        Nothing else was recorded.
      </p>
    );
  }
  return (
    <RecordList label="From this visit">
      {visit.labTests.map((test) => (
        <RecordRow
          key={`lab-${test.name}`}
          icon={<FlaskIcon />}
          title={test.name}
          detail="Lab test"
        />
      ))}
      {visit.drugs.map((drug) => (
        <RecordRow
          key={`drug-${drug.name}`}
          icon={<PillIcon />}
          title={drug.name}
          detail="Medication"
        />
      ))}
      {visit.vitals && (
        <RecordRow
          icon={<HeartbeatIcon />}
          title="Vital signs"
          detail={[
            visit.vitals.bloodPressure && `BP ${visit.vitals.bloodPressure}`,
            visit.vitals.heartRate != null && `Pulse ${visit.vitals.heartRate}`,
            visit.vitals.weight != null && `${visit.vitals.weight} kg`,
          ]
            .filter(Boolean)
            .join(" · ")}
          to="/patient/health/vitals"
        />
      )}
    </RecordList>
  );
}

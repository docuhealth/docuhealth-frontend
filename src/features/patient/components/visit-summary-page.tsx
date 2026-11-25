import { ClipboardTextIcon, NoteIcon, StethoscopeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { labResultsQuery, visitDetailsQuery } from "@/features/patient/api/pending";
import { appointmentsQuery, drugsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { VisitFromThisVisit } from "@/features/patient/components/visit-from-this-visit";
import { VisitHeader } from "@/features/patient/components/visit-header";
import { VisitNextSteps } from "@/features/patient/components/visit-next-steps";
import { VisitNoSummaryCard } from "@/features/patient/components/visit-no-summary-card";
import { VisitNoteCard } from "@/features/patient/components/visit-note-card";
import { nextAppointment } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";
import { detailFor, hasSummary, visitTitle } from "@/features/patient/lib/visits";

/** One visit: why they came, the clinician's note, what came of it and what comes next. */
export function VisitSummaryPage({ visitId }: { visitId: string }) {
  const { data, isError } = useVisits();
  const details = useQuery(visitDetailsQuery());
  const results = useQuery(labResultsQuery());
  const drugs = useQuery(drugsQuery());
  const appointments = useQuery(appointmentsQuery());
  const [now] = useState(() => new Date());
  const visit = data?.find((candidate) => candidate.id === visitId);
  const detail = visit ? detailFor(details.data ?? [], visit.id) : null;
  const summary = visit ? hasSummary(visit) : true;
  const labResults = results.data ?? [];
  const steps = detail?.nextSteps ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={summary ? "Visit summary" : "Visit"}
        back={{ to: "/patient/health/visits", label: "Back to Visits" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !visit ? (
        <PatientEmpty
          icon={<ClipboardTextIcon />}
          title="Visit not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <VisitHeader visit={visit} title={visitTitle(visit, detail)} summary={summary} />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="flex flex-col gap-4">
              {!summary ? (
                <VisitNoSummaryCard
                  facility={visit.facility}
                  lab={detail?.type === "lab"}
                  hasResults={labResults.some((result) => result.visitId === visit.id)}
                />
              ) : (
                <>
                  {visit.complaint && (
                    <VisitNoteCard icon={<StethoscopeIcon />} label="Reason" tone="info">
                      {visit.complaint}
                    </VisitNoteCard>
                  )}
                  {(visit.note || visit.diagnosis) && (
                    <VisitNoteCard
                      icon={<NoteIcon />}
                      label="Note"
                      tone="success"
                      aside={
                        visit.clinician && (
                          <span className="flex items-center gap-2 type-body-sm-medium text-fg-heading">
                            <PersonAvatar name={visit.clinician.name} src={null} size="sm" />
                            {visit.clinician.name}
                          </span>
                        )
                      }
                    >
                      {/* Without a note, the diagnosis stands in for it. */}
                      {visit.note ?? `Diagnosis: ${visit.diagnosis}`}
                    </VisitNoteCard>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <SectionLabel>From this visit</SectionLabel>
                <VisitFromThisVisit
                  visit={visit}
                  results={labResults}
                  drugs={drugs.data ?? []}
                  summary={summary}
                />
              </div>
              {steps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <SectionLabel>Next steps</SectionLabel>
                  <VisitNextSteps
                    steps={steps}
                    next={nextAppointment(appointments.data ?? [], now)}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

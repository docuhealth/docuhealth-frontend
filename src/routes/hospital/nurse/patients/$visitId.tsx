import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { clinicalProfileQuery, visitQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { AdmissionCharts } from "@/features/clinical/components/admission-charts";
import { AdmissionNotePrompt } from "@/features/clinical/components/admission-note-prompt";
import { AdmissionNoteGate, NoteActions } from "@/features/clinical/components/note-actions";
import { PatientNotes } from "@/features/clinical/components/patient-notes";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { TaskQueue } from "@/features/nurse/components/task-queue";

export const Route = createFileRoute("/hospital/nurse/patients/$visitId")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(visitQuery(deps.list, params.visitId)),
  component: VisitPage,
});

/**
 * The patient page, with the nurse's notes, tasks and charts on an admission (the tasks once the
 * admission note is written), and the doctors' shared notes on a check-in.
 */
function VisitPage() {
  const { visitId } = Route.useParams();
  const { list } = Route.useSearch();
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  // A task the API refuses for a missing admission note offers to write it.
  const [needsNote, setNeedsNote] = useState<{ hin: string; name: string } | null>(null);
  return (
    <PatientPage
      list={list}
      visitId={visitId}
      actions={(visit) => <NoteActions staff="nurse" visit={visit} myId={profile.user.id} />}
      tabs={(visit) =>
        visit.kind === "admission"
          ? [
              {
                value: "tasks",
                label: "Nursing tasks",
                content: (
                  <>
                    <AdmissionNoteGate visit={visit}>
                      <TaskQueue admissionId={visit.id} onAdmissionNoteNeeded={setNeedsNote} />
                    </AdmissionNoteGate>
                    <AdmissionNotePrompt
                      patient={needsNote}
                      admissionId={visit.id}
                      onClose={() => setNeedsNote(null)}
                    />
                  </>
                ),
              },
              {
                value: "notes",
                label: "Notes",
                content: (
                  <PatientNotes
                    hin={visit.patient.hin}
                    kinds={["admission", "case", "care-plan", "vitals", "progress"]}
                  />
                ),
              },
              {
                value: "charts",
                label: "Charts",
                content: <AdmissionCharts admissionId={visit.id} />,
              },
            ]
          : [
              {
                value: "notes",
                label: "Doctors’ notes",
                content: <PatientNotes hin={visit.patient.hin} kinds={["shared", "vitals"]} />,
              },
            ]
      }
    />
  );
}

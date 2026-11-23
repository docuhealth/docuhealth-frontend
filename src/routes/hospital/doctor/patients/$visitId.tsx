import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clinicalProfileQuery, visitQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { AdmissionCharts } from "@/features/clinical/components/admission-charts";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { CareTaskHistory } from "@/features/doctor/components/care-task-history";
import { DoctorPatientActions } from "@/features/doctor/components/doctor-patient-actions";
import { EncounterNotes } from "@/features/doctor/components/encounter-notes";
import { LabResults } from "@/features/doctor/components/lab-results";
import { NoteActions } from "@/features/clinical/components/note-actions";
import { PatientNotes } from "@/features/clinical/components/patient-notes";

export const Route = createFileRoute("/hospital/doctor/patients/$visitId")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(visitQuery(deps.list, params.visitId)),
  component: VisitPage,
});

/** The patient page, with the doctor's tabs and actions (consultation, orders, moves). */
function VisitPage() {
  const { visitId } = Route.useParams();
  const { list } = Route.useSearch();
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <PatientPage
      list={list}
      visitId={visitId}
      actions={(visit) => (
        <>
          <NoteActions staff="doctor" visit={visit} myId={profile.user.id} />
          <DoctorPatientActions
            myId={profile.user.id}
            ownHospital={profile.hospital.name}
            visit={{
              kind: visit.kind,
              id: visit.id,
              hin: visit.patient.hin,
              patientName: visit.patient.name,
              status: visit.status,
            }}
          />
        </>
      )}
      tabs={(visit) => [
        {
          value: "notes",
          label: "Encounter notes",
          content: <EncounterNotes hin={visit.patient.hin} />,
        },
        { value: "lab", label: "Lab results", content: <LabResults hin={visit.patient.hin} /> },
        ...(visit.kind === "admission"
          ? [
              {
                value: "progress",
                label: "Notes",
                // TODO(api): doctors can't read care plans or the vitals history yet.
                content: (
                  <PatientNotes hin={visit.patient.hin} kinds={["progress", "admission", "case"]} />
                ),
              },
              {
                value: "tasks",
                label: "Care tasks",
                content: <CareTaskHistory admissionId={visit.id} />,
              },
              {
                value: "charts",
                label: "Charts",
                content: <AdmissionCharts admissionId={visit.id} />,
              },
            ]
          : []),
      ]}
    />
  );
}

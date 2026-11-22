import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clinicalProfileQuery, visitQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { DoctorPatientActions } from "@/features/doctor/components/doctor-patient-actions";
import { EncounterNotes } from "@/features/doctor/components/encounter-notes";
import { LabResults } from "@/features/doctor/components/lab-results";

export const Route = createFileRoute("/hospital/doctor/patients/$visitId")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(visitQuery(deps.list, params.visitId)),
  component: VisitPage,
});

/** The patient page, with the doctor's tabs and, on a check-in, the consultation's actions. */
function VisitPage() {
  const { visitId } = Route.useParams();
  const { list } = Route.useSearch();
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <PatientPage
      list={list}
      visitId={visitId}
      actions={(visit) =>
        visit.kind === "check_in" && (
          <DoctorPatientActions
            myId={profile.user.id}
            consultation={{
              checkInId: visit.id,
              hin: visit.patient.hin,
              patientName: visit.patient.name,
              status: visit.status,
            }}
          />
        )
      }
      tabs={(visit) => [
        {
          value: "notes",
          label: "Encounter notes",
          content: <EncounterNotes hin={visit.patient.hin} />,
        },
        { value: "lab", label: "Lab results", content: <LabResults hin={visit.patient.hin} /> },
      ]}
    />
  );
}

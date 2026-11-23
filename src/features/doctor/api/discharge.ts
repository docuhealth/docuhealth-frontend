import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { doctorKeys } from "@/features/doctor/api/queries";
import { anyResponseSchema, labOrderPageSchema } from "@/features/doctor/api/schemas";
import type { DischargeValues } from "@/features/doctor/lib/discharge-schema";

// The doctor's side of an inpatient discharge: the discharge summary. The admission then waits
// for the nurse's discharge checklist, which frees the bed.

/** Lab tests with a result (completed) and still in the lab (pending), as v1 split them. */
const completedStatuses = [
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
];
const pendingStatuses = ["pending", "in_progress", "sample_collected"];

export type Investigation = { id: string; name: string; orderedAt: string };

/** The patient's lab tests, for the discharge summary's investigations; newest first. */
export const dischargeInvestigationsQuery = (hin: string) =>
  queryOptions({
    queryKey: [...doctorKeys.all, "discharge-investigations", hin] as const,
    queryFn: async () => {
      const { results } = await request(labOrderPageSchema, {
        url: `/api/lab/patients/${encodeURIComponent(hin)}/test-orders`,
        params: { ordering: "-created_at", page: 1, size: 100 },
      });
      const tests = results.flatMap((order) =>
        order.tests.map((test) => ({
          id: test.id,
          name: test.name,
          orderedAt: order.at,
          status: test.status,
        })),
      );
      const pick = (statuses: string[]): Investigation[] =>
        tests
          .filter(({ status }) => statuses.includes(status))
          .map(({ id, name, orderedAt }) => ({ id, name, orderedAt }));
      return { completed: pick(completedStatuses), pending: pick(pendingStatuses) };
    },
  });

/**
 * The follow-up as the API checks it (as v1 found it on staging): at this hospital the clinic is
 * left out (the API fills it in); with none, no date, time or instructions may be sent.
 */
function followUpOf({ followUp }: DischargeValues) {
  if (followUp.plan === "none") {
    return { continue_followup_at_curr_hospital: false, follow_up_clinic: null };
  }
  return {
    continue_followup_at_curr_hospital: followUp.plan === "here",
    follow_up_clinic: followUp.plan === "here" ? null : followUp.clinic,
    follow_up_date: followUp.date,
    follow_up_time: followUp.time,
    follow_up_instructions: followUp.instructions || null,
  };
}

const investigations = (ids: string[]) =>
  ids.map((sqid) => ({ sqid, type: "lab_test_order" as const }));

/** Write the discharge summary; the admission then waits for the nurse's checklist. */
export function useDischargeAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      admissionId,
      hin,
      values,
    }: {
      admissionId: string;
      hin: string;
      values: DischargeValues;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/hospital-ops/admissions/${encodeURIComponent(admissionId)}/doctor-discharge-form`,
        data: {
          patient: hin,
          chief_complaint: values.chiefComplaint,
          primary_diagnosis: values.primaryDiagnosis,
          secondary_diagnosis: values.secondaryDiagnosis,
          comorbidities: values.comorbidities,
          treatment_plan: values.treatmentPlan,
          hospital_course_note: values.hospitalCourse,
          care_instructions: values.careInstructions,
          condition_at_discharge: values.condition,
          ...followUpOf(values),
          completed_investigations: investigations(values.completed),
          pending_investigations: investigations(values.pending),
          discharge_medications: values.drugs.map((drug) => ({
            name: drug.name,
            route: drug.route,
            quantity: Number(drug.quantity),
            unit: drug.unit,
            frequency: drug.frequency,
            duration: { value: Number(drug.durationValue), rate: drug.durationRate },
            allergies: [],
          })),
        },
      }),
    // The admission's status, the lists and the records all change.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { toVitalSignsWrite, type VitalsFormValues } from "@/lib/vitals-form";
import { nurseKeys } from "@/features/nurse/api/queries";
import { anyResponseSchema, type Triage } from "@/features/nurse/api/schemas";

const checkInUrl = (id: string, action: string) =>
  `/api/hospital-ops/check-ins/${encodeURIComponent(id)}/${action}`;

/** Refresh every nurse list: an action moves a patient between them. */
function useNurseChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: nurseKeys.all });
}

/** Take a waiting check-in (or reopen a closed one) so it's yours to assess. */
export function useReserveCheckIn() {
  return useMutation({
    mutationFn: (id: string) =>
      request(anyResponseSchema, { method: "POST", url: checkInUrl(id, "reserve"), data: {} }),
    onSuccess: useNurseChanged(),
  });
}

/**
 * Record the nursing assessment (vitals, triage, notes). `sendToDoctor` passes the patient on to
 * the doctors' queue; otherwise the check-in is closed.
 */
export function useNursingAssessment() {
  return useMutation({
    mutationFn: ({
      id,
      vitals,
      triage,
      notes,
      sendToDoctor,
    }: {
      id: string;
      vitals: VitalsFormValues;
      triage: Triage;
      notes: string;
      sendToDoctor: boolean;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: checkInUrl(id, "nursing-assessment"),
        data: {
          triage_priority: triage,
          notes: notes.trim(),
          vital_signs: toVitalSignsWrite(vitals),
          escalate: sendToDoctor,
        },
      }),
    onSuccess: useNurseChanged(),
  });
}

/** Take the vitals a doctor asked for; the doctor sees them with the patient. */
export function useProcessVitalsRequest() {
  return useMutation({
    mutationFn: ({ id, vitals, notes }: { id: string; vitals: VitalsFormValues; notes: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/records/vital-signs/requests/${encodeURIComponent(id)}/process`,
        data: toVitalSignsWrite(vitals, notes),
      }),
    onSuccess: useNurseChanged(),
  });
}

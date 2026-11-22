import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { doctorKeys } from "@/features/doctor/api/queries";
import { anyResponseSchema } from "@/features/doctor/api/schemas";
import type { EncounterNoteValues } from "@/features/doctor/lib/schemas";

const checkInUrl = (id: string, action: string) =>
  `/api/hospital-ops/check-ins/${encodeURIComponent(id)}/${action}`;

/** Refresh every doctor list and the patient's notes: an action changes what they show. */
function useDoctorChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: doctorKeys.all });
}

/** A check-in action with no body: claim (start or resume), end the encounter, or check out. */
function useCheckInAction(action: "claim" | "end-encounter" | "close") {
  return useMutation({
    mutationFn: (id: string) =>
      request(anyResponseSchema, { method: "POST", url: checkInUrl(id, action), data: {} }),
    onSuccess: useDoctorChanged(),
  });
}

/** Take a waiting patient (or resume a seen one): the consultation becomes yours. */
export const useClaimCheckIn = () => useCheckInAction("claim");

/** Finish the consultation; the patient moves to Seen. */
export const useEndEncounter = () => useCheckInAction("end-encounter");

/** Check the patient out, closing the visit. */
export const useCloseCheckIn = () => useCheckInAction("close");

/** The form's "one per line" box as a list. */
const lines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Write an encounter (SOAP) note on a check-in that's yours. TODO(api): investigation files,
 * referral and the next appointment aren't asked for yet; the latest vitals aren't attached
 * (`vital_signs` takes an integer id the API doesn't send).
 */
export function useCreateEncounterNote() {
  return useMutation({
    mutationFn: ({
      hin,
      checkInId,
      note,
    }: {
      hin: string;
      checkInId: string;
      note: EncounterNoteValues;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/soap-notes",
        data: {
          patient: hin,
          check_in: checkInId,
          chief_complaint: note.chiefComplaint,
          history_of_complain: note.historyOfComplaint,
          past_med_history: note.pastMedicalHistory,
          drug_history_allergies: lines(note.drugHistoryAllergies),
          family_history: note.familyHistory,
          social_history: note.socialHistory,
          review: note.review,
          general_exam: lines(note.generalExam),
          systemic_exam: lines(note.systemicExam),
          bedside_tests: lines(note.bedsideTests),
          investigations: lines(note.investigations),
          primary_diagnosis: note.primaryDiagnosis,
          differential_diagnosis: note.differentialDiagnosis,
          problems_list: lines(note.problems),
          treatment_plan: lines(note.treatmentPlan),
          care_instructions: lines(note.careInstructions),
          patient_education: note.patientEducation,
          is_shared: note.shareWithNurses,
        },
      }),
    onSuccess: useDoctorChanged(),
  });
}

/** Add to an encounter note after it's written. */
export function useAddToEncounterNote() {
  return useMutation({
    mutationFn: ({ noteId, note }: { noteId: string; note: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/records/soap-note/additional-notes",
        data: { soap_note: noteId, note },
      }),
    onSuccess: useDoctorChanged(),
  });
}

/** Ask a nurse (or any nurse) to take the patient's vitals during this check-in. */
export function useRequestVitals() {
  return useMutation({
    mutationFn: ({
      hin,
      checkInId,
      nurseId,
      note,
    }: {
      hin: string;
      checkInId: string;
      nurseId: string | null;
      note: string;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/records/vital-signs/requests",
        data: {
          patient_hin: hin,
          check_in: checkInId,
          staff: nurseId ?? undefined,
          note: note || undefined,
        },
      }),
    onSuccess: useDoctorChanged(),
  });
}

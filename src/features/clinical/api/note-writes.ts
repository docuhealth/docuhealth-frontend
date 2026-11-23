import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { toVitalSignsWrite, type VitalsFormValues } from "@/lib/vitals-form";
import { clinicalKeys } from "@/features/clinical/api/queries";
import type { Mobility, Nutrition, TextNoteKind } from "@/features/clinical/lib/note-schemas";

// What the doctor and the nurse write on an admission: the nurse's admission note, case notes,
// care plans and vital signs, and the doctor's progress notes. Each refreshes the patient's
// notes, their latest vitals and the admission's charts.

const anyResponse = z.unknown();

/** A list typed one item per line, as the API takes it. */
const linesOf = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** The admission a note is written for, and its patient. */
type AdmissionRef = { hin: string; admissionId: string };

function useNotesChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clinicalKeys.all });
}

export type AdmissionNoteWrite = AdmissionRef & {
  vitals: VitalsFormValues;
  allergies: string;
  mobility: Mobility | "";
  nutrition: Nutrition | "";
  fallRisk: string;
  skin: string;
  concern: string;
};

/** The nurse's admission note, written once when the patient is admitted. */
export function useWriteAdmissionNote() {
  return useMutation({
    mutationFn: (note: AdmissionNoteWrite) =>
      request(anyResponse, {
        method: "POST",
        url: `/api/records/admissions/${encodeURIComponent(note.admissionId)}/admission-note`,
        data: {
          vital_signs: toVitalSignsWrite(note.vitals),
          allergies: linesOf(note.allergies),
          mobility_assessment: note.mobility || null,
          nutritional_assessment: note.nutrition || null,
          fall_risk_assessment: note.fallRisk.trim() || null,
          skin_assessment: note.skin.trim() || null,
          initial_nursing_concern: note.concern.trim() || null,
        },
      }),
    onSuccess: useNotesChanged(),
  });
}

/** Where each text-only note goes, and its body from the form's boxes. */
const textNoteWrites: Record<
  TextNoteKind,
  (ref: AdmissionRef, value: (name: string) => string) => { url: string; data: object }
> = {
  case: ({ hin, admissionId }, value) => ({
    url: "/api/records/case-notes",
    data: {
      patient: hin,
      admission: admissionId,
      observation: linesOf(value("observation")),
      care: linesOf(value("care")),
      response: linesOf(value("response")),
      abnormalities: linesOf(value("abnormalities")),
      follow_up: linesOf(value("followUp")),
    },
  }),
  // TODO(api): goals, intervention and evaluation are untyped; they're sent as lists, as v1 did.
  "care-plan": ({ hin, admissionId }, value) => ({
    url: "/api/records/care-plans",
    data: {
      patient: hin,
      admission: admissionId,
      problem: value("problem"),
      goals: linesOf(value("goals")),
      intervention: linesOf(value("intervention")),
      evaluation: linesOf(value("evaluation")),
    },
  }),
  progress: ({ hin, admissionId }, value) => ({
    url: "/api/records/progress-notes",
    data: {
      patient: hin,
      admission: admissionId,
      subjective: value("subjective"),
      objective: value("objective"),
      assessments: value("assessment"),
      plan: value("plan"),
    },
  }),
};

/** A case note, care plan or progress note, from its form's boxes. */
export function useWriteTextNote(kind: TextNoteKind) {
  return useMutation({
    mutationFn: ({ values, ...ref }: AdmissionRef & { values: Record<string, string> }) => {
      const { url, data } = textNoteWrites[kind](ref, (name) => values[name]?.trim() ?? "");
      return request(anyResponse, { method: "POST", url, data });
    },
    onSuccess: useNotesChanged(),
  });
}

export function useRecordVitals() {
  return useMutation({
    mutationFn: ({
      hin,
      admissionId,
      vitals,
      notes,
    }: AdmissionRef & {
      vitals: VitalsFormValues;
      notes: string;
    }) =>
      request(anyResponse, {
        method: "POST",
        url: `/api/records/patients/${encodeURIComponent(hin)}/vital-signs`,
        data: { admission: admissionId, vital_signs: toVitalSignsWrite(vitals, notes) },
      }),
    onSuccess: useNotesChanged(),
  });
}

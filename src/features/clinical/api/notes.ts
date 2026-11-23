import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { keepPreviousPage } from "@/lib/keep-previous-page";
import { noteText, personSchema, soapSectionLabels, vitalSignsSchema } from "@/lib/clinical";
import { optionalText, text } from "@/lib/staff-profile";
import { clinicalKeys } from "@/features/clinical/api/queries";

// A patient's clinical notes, read the same way by the doctor and the nurse: the nursing
// admission note, the doctor's progress notes, the nurse's case notes and care plans, vital signs,
// and the encounter notes doctors share with the nurses. Each kind becomes one `Note`, so one
// list shows them all.

/** A note's kinds, as the Notes tab offers them. */
export const noteKindLabels = {
  admission: "Admission notes",
  progress: "Progress notes",
  case: "Case notes",
  "care-plan": "Care plans",
  vitals: "Vital signs",
  shared: "Doctors’ notes",
} as const;
export type NoteKind = keyof typeof noteKindLabels;

type Note = {
  id: string;
  /** What the list shows first, e.g. the diagnosis or the problem. */
  title: string;
  at: string;
  by: string | null;
  sections: { label: string; text: string }[];
  /** The admission it was written for, when the API says. */
  admissionId: string | null;
};

export type NotePage = { total: number; items: Note[] };

const dateTime = z.iso.datetime({ offset: true });

const lines = noteText.catch("");

const sections = (pairs: [string, string | null | undefined][]) =>
  pairs.flatMap(([label, value]) => (value ? [{ label, text: value }] : []));

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

const admissionNote = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    written_by_info: personSchema,
    admission_info: z.object({ sqid: z.string() }).loose().nullish().catch(null),
    allergies: lines,
    mobility_assessment_label: optionalText,
    mobility_assessment: optionalText,
    nutritional_assessment_label: optionalText,
    nutritional_assessment: optionalText,
    fall_risk_assessment: optionalText,
    skin_assessment: optionalText,
    initial_nursing_concern: optionalText,
    vital_signs_info: vitalSignsSchema.nullish().catch(null),
  })
  .transform((note): Note => ({
    id: note.sqid,
    title: note.initial_nursing_concern ?? "Nursing admission note",
    at: note.created_at,
    by: note.written_by_info,
    admissionId: note.admission_info?.sqid ?? null,
    sections: sections([
      ["Initial nursing concern", note.initial_nursing_concern],
      ["Allergies", note.allergies || "None known"],
      [
        "Mobility",
        note.mobility_assessment_label ??
          (note.mobility_assessment ? sentence(note.mobility_assessment) : null),
      ],
      [
        "Nutrition",
        note.nutritional_assessment_label ??
          (note.nutritional_assessment ? sentence(note.nutritional_assessment) : null),
      ],
      ["Fall risk", note.fall_risk_assessment],
      ["Skin", note.skin_assessment],
      [
        "Vital signs",
        note.vital_signs_info?.readings.map(({ label, value }) => `${label}: ${value}`).join("\n"),
      ],
    ]),
  }));

const progressNote = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    staff_info: personSchema.optional(),
    subjective: text,
    objective: text,
    assessments: text,
    plan: text,
  })
  .transform((note): Note => ({
    id: note.sqid,
    title: note.assessments || "Progress note",
    at: note.created_at,
    by: note.staff_info ?? null,
    admissionId: null,
    sections: sections([
      ["Subjective", note.subjective],
      ["Objective", note.objective],
      ["Assessment", note.assessments],
      ["Plan", note.plan],
    ]),
  }));

const caseNote = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    staff_info: personSchema,
    observation: lines,
    care: lines,
    response: lines,
    abnormalities: lines,
    follow_up: lines,
  })
  .transform((note): Note => ({
    id: note.sqid,
    title: note.observation.split("\n")[0] || "Case note",
    at: note.created_at,
    by: note.staff_info,
    admissionId: null,
    sections: sections([
      ["Observation", note.observation],
      ["Care given", note.care],
      ["Response", note.response],
      ["Abnormalities", note.abnormalities],
      ["Follow-up", note.follow_up],
    ]),
  }));

const carePlan = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    staff_info: personSchema,
    problem: optionalText,
    goals: lines,
    intervention: lines,
    evaluation: lines,
  })
  .transform((plan): Note => ({
    id: plan.sqid,
    title: plan.problem ?? "Care plan",
    at: plan.created_at,
    by: plan.staff_info,
    admissionId: null,
    sections: sections([
      ["Problem", plan.problem],
      ["Goals", plan.goals],
      ["Intervention", plan.intervention],
      ["Evaluation", plan.evaluation],
    ]),
  }));

const vitalsRecord = z
  .object({ sqid: z.string(), staff_info: personSchema, notes: optionalText })
  .loose()
  .transform((record, context): Note => {
    const parsed = vitalSignsSchema.safeParse(record);
    if (!parsed.success) {
      context.addIssue({ code: "custom", message: "Vital signs without a time" });
      return z.NEVER;
    }
    return {
      id: record.sqid,
      title:
        parsed.data.readings
          .filter(({ label }) => label === "Blood pressure" || label === "Temperature")
          .map(({ value }) => value)
          .join(" · ") || "Vital signs",
      at: parsed.data.at,
      by: record.staff_info,
      admissionId: null,
      sections: [
        ...parsed.data.readings.map(({ label, value }) => ({ label, text: value })),
        ...sections([["Notes", record.notes]]),
      ],
    };
  });

/** `SoapNoteRead`, as a doctor shared it with the nurses. */
const sharedNote = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    staff_info: personSchema,
    chief_complaint: text,
    primary_diagnosis: text,
    ...Object.fromEntries(soapSectionLabels.map(([key]) => [key, lines])),
  })
  .transform((note): Note => {
    const fields = note as unknown as Record<string, string>;
    return {
      id: note.sqid,
      title: note.primary_diagnosis || note.chief_complaint || "Encounter note",
      at: note.created_at,
      by: note.staff_info,
      admissionId: null,
      sections: sections([
        ["Chief complaint", note.chief_complaint],
        ["Primary diagnosis", note.primary_diagnosis],
        ...soapSectionLabels.map(([key, label]): [string, string | undefined] => [
          label,
          fields[key],
        ]),
      ]),
    };
  });

const pageOf = <T extends z.ZodType<Note>>(item: T) =>
  z.object({ count: z.number().int().nonnegative(), results: z.array(item) });

const sources = {
  admission: {
    url: (hin: string) => `/api/records/patients/${hin}/admission-notes`,
    schema: pageOf(admissionNote),
  },
  progress: {
    url: (hin: string) => `/api/records/progress-notes/${hin}`,
    schema: pageOf(progressNote),
  },
  case: {
    url: (hin: string) => `/api/records/patients/${hin}/case-notes`,
    schema: pageOf(caseNote),
  },
  "care-plan": {
    url: (hin: string) => `/api/records/patients/${hin}/care-plans`,
    schema: pageOf(carePlan),
  },
  vitals: {
    url: (hin: string) => `/api/records/patients/${hin}/vital-signs`,
    schema: pageOf(vitalsRecord),
  },
  shared: {
    url: (hin: string) => `/api/records/patients/${hin}/soap-notes/shared`,
    schema: pageOf(sharedNote),
  },
} satisfies Record<NoteKind, unknown>;

export const NOTES_PAGE_SIZE = 5;

/**
 * A page of one kind of the patient's notes, newest first. TODO(api): none can be narrowed to
 * an admission, so they span every stay.
 */
export const patientNotesQuery = (hin: string, kind: NoteKind, page: number) => {
  const queryKey = [...clinicalKeys.all, "notes", hin, kind, page] as const;
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<NotePage> => {
      const source = sources[kind];
      const { count, results } = await request(source.schema, {
        url: source.url(encodeURIComponent(hin)),
        params: { page, size: NOTES_PAGE_SIZE },
      });
      return {
        total: count,
        items: [...results].sort((a, b) => b.at.localeCompare(a.at)),
      };
    },
    placeholderData: keepPreviousPage(queryKey),
    retry: false,
  });
};

/**
 * Whether a nursing admission note has been written for this admission: by its admission when
 * the API says, else one written since the admission began.
 */
export const hasAdmissionNoteQuery = (
  hin: string,
  admissionId: string,
  admittedAt: string | null,
) =>
  queryOptions({
    queryKey: [...clinicalKeys.all, "has-admission-note", hin, admissionId] as const,
    queryFn: async () => {
      const { results } = await request(sources.admission.schema, {
        url: sources.admission.url(encodeURIComponent(hin)),
        params: { page: 1, size: 20 },
      });
      return results.some((note) =>
        note.admissionId ? note.admissionId === admissionId : !!admittedAt && note.at >= admittedAt,
      );
    },
  });

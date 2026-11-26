import { z } from "zod";
import { recordDetails } from "@/features/clinical/api/schemas";
import {
  durationOf,
  durationSchema,
  frequencyOf,
  noteText,
  personSchema,
  soapSectionLabels,
  vitalSignsSchema,
} from "@/lib/clinical";
import { formatDateCommaTime } from "@/lib/format";
import { optionalText } from "@/lib/staff-profile";

// One clinical event's record, from `GET /api/records/events/{sqid}`. TODO(api): the response has
// no schema and its shape depends on the record type (docs/backend-gaps-v2-migration.md, "Visit
// records"), so each known type is read field by field, a field that doesn't fit is left out, and
// a record that can't be read as its type (or of a type not known here) shows its fields as sent.

type Tone = "warning" | "success" | "info" | "neutral" | "error";

/** A titled part of a record (the order, one test, one drug), as label and value rows. */
export type RecordSection = {
  title: string | null;
  status: { label: string; tone: Tone } | null;
  fields: { label: string; value: string }[];
  /** What to say when `fields` is empty. */
  empty: string;
};

export type RecordEventDetail = {
  /** Read as a known record type; `false` when its fields are shown as sent. */
  typed: boolean;
  sections: RecordSection[];
};

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

/** "VitalSigns", "vital-signs" or "vital_signs" → "vital_signs". */
const typeKey = (type: string) =>
  type
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

// Field readers that never fail: anything that doesn't fit reads as missing.
const maybeText = optionalText.catch(null);
const maybeDate = z.iso.datetime({ offset: true }).nullish().catch(null);
const maybePerson = personSchema.catch(null);
const maybeNumber = z.union([z.number(), z.string()]).nullish().catch(null);
const named = z.object({ name: maybeText }).nullish().catch(null);

const when = (at: string | null | undefined) => (at ? formatDateCommaTime(new Date(at)) : null);

/** Rows for the values that are there, in order. */
const fields = (rows: [string, string | number | null | undefined][]) =>
  rows.flatMap(([label, value]) =>
    value == null || value === "" ? [] : [{ label, value: String(value) }],
  );

function statusOf(status: string | null, tones: Record<string, Tone>, suffix = "") {
  if (!status) return null;
  const key = status.toLowerCase();
  return { label: `${sentence(key)}${suffix}`, tone: tones[key] ?? "neutral" };
}

const section = (
  title: string | null,
  rows: RecordSection["fields"],
  options: Partial<Pick<RecordSection, "status" | "empty">> = {},
): RecordSection => ({
  title,
  status: options.status ?? null,
  fields: rows,
  empty: options.empty ?? "No details recorded.",
});

const admission = z
  .object({
    status: maybeText,
    ward_info: named,
    bed_info: z.object({ bed_number: maybeNumber }).nullish().catch(null),
    created_at: maybeDate,
    discharge_date: maybeDate,
    doctor_discharge_form: z.unknown(),
    nurse_discharge_form: z.unknown(),
  })
  .transform((record) => {
    const forms = [
      record.doctor_discharge_form ? "Doctor’s discharge summary" : null,
      record.nurse_discharge_form ? "Nurse’s discharge checklist" : null,
    ].filter(Boolean);
    const bed = record.bed_info?.bed_number;
    return [
      section(
        "Admission",
        fields([
          ["Ward", record.ward_info?.name ?? "Not yet assigned"],
          ["Bed", bed != null ? `Bed ${bed}` : "Not yet assigned"],
          ["Admitted", when(record.created_at) ?? "Pending confirmation"],
          ["Discharged", when(record.discharge_date)],
          ["Discharge forms", forms.join(", ")],
        ]),
        {
          status: statusOf(record.status, {
            pending: "warning",
            active: "success",
            awaiting_nurse_discharge: "info",
            discharged: "neutral",
            rejected: "error",
            cancelled: "error",
          }),
        },
      ),
    ];
  });

const admissionRequest = z
  .object({
    status: maybeText,
    ward_info: named,
    bed_info: z.object({ bed_number: maybeNumber }).nullish().catch(null),
    requested_by_info: maybePerson,
    created_at: maybeDate,
    processed_by_info: maybePerson,
    processed_at: maybeDate,
    rejection_reason: maybeText,
  })
  .transform((record) => {
    const rejected = record.status?.toLowerCase() === "rejected";
    const bed = record.bed_info?.bed_number;
    return [
      section(
        "Bed request",
        fields([
          ["Ward", record.ward_info?.name],
          ["Bed", bed != null ? `Bed ${bed}` : null],
          ["Requested by", record.requested_by_info],
          ["Requested on", when(record.created_at)],
          [rejected ? "Rejected by" : "Accepted by", record.processed_by_info],
          [rejected ? "Rejected on" : "Accepted on", when(record.processed_at)],
          ["Reason for rejection", record.rejection_reason],
        ]),
        {
          status: statusOf(record.status, {
            pending: "warning",
            accepted: "success",
            rejected: "error",
          }),
        },
      ),
    ];
  });

const labValue = z.object({
  value: maybeNumber,
  parameter_info: z
    .object({
      name: maybeText,
      unit: maybeText,
      ref_low: maybeNumber,
      ref_high: maybeNumber,
      ref_text: maybeText,
    })
    .nullish()
    .catch(null),
});

/** "13.2 g/dL (ref 12–16)". */
function labValueText({ value, parameter_info: parameter }: z.infer<typeof labValue>) {
  const range =
    parameter?.ref_text ??
    (parameter?.ref_low != null && parameter.ref_high != null
      ? `${parameter.ref_low}–${parameter.ref_high}`
      : null);
  return [value ?? "—", parameter?.unit, range && `(ref ${range})`].filter(Boolean).join(" ");
}

const labOrder = z
  .object({
    ordered_by_info: maybePerson,
    created_at: maybeDate,
    note: maybeText,
    items_info: z
      .array(
        z.object({
          test_info: z.object({ name: maybeText, category: named }).nullish().catch(null),
          status: maybeText,
          specimen_collected_at: maybeDate,
          rejection_reason: maybeText,
          result_info: z
            .object({ parameters_info: z.array(labValue).catch([]) })
            .nullish()
            .catch(null),
        }),
      )
      .catch([]),
  })
  .transform((order) => [
    section(
      "Lab test order",
      fields([
        ["Ordered by", order.ordered_by_info],
        ["Ordered on", when(order.created_at)],
        ["Note", order.note],
      ]),
    ),
    ...(order.items_info.length === 0
      ? [section("Tests", [], { empty: "No tests on this order." })]
      : order.items_info.map((item) =>
          section(
            item.test_info?.name ?? "Test",
            [
              ...fields([
                ["Category", item.test_info?.category?.name],
                ["Sample collected", when(item.specimen_collected_at)],
                ["Reason for rejection", item.rejection_reason],
              ]),
              ...(item.result_info?.parameters_info ?? []).map((value, index) => ({
                label: value.parameter_info?.name ?? `Value ${index + 1}`,
                value: labValueText(value),
              })),
            ],
            {
              status: statusOf(item.status, {
                pending: "warning",
                in_progress: "info",
                sample_collected: "info",
                result_ready: "success",
                completed: "success",
                rejected: "error",
              }),
              empty: "No result yet.",
            },
          ),
        )),
  ]);

const vitalsSection = (title: string, vitals: z.infer<typeof vitalSignsSchema> | null) =>
  section(title, vitals?.readings ?? [], { empty: "No vitals recorded with it." });

const nursingAssessment = z
  .object({
    triage_priority: maybeText,
    staff_info: maybePerson,
    created_at: maybeDate,
    notes: maybeText,
    vital_signs_info: vitalSignsSchema.nullish().catch(null),
  })
  .transform((assessment) => [
    section(
      "Nursing assessment",
      fields([
        ["Recorded by", assessment.staff_info],
        ["Recorded on", when(assessment.created_at)],
        ["Notes", assessment.notes],
      ]),
      {
        status: statusOf(
          assessment.triage_priority,
          { routine: "success", urgent: "warning", emergency: "error" },
          " priority",
        ),
      },
    ),
    vitalsSection("Vital signs taken with it", assessment.vital_signs_info ?? null),
  ]);

/** `VitalSignsRead`; one without its time isn't read as vitals. */
const vitalSigns = z
  .object({ notes: maybeText, note: maybeText })
  .loose()
  .transform((record, context) => {
    const vitals = vitalSignsSchema.safeParse(record);
    if (!vitals.success) {
      context.addIssue({ code: "custom", message: "Not a set of vital signs" });
      return z.NEVER;
    }
    return [
      section(
        "Vital signs",
        [
          ...vitals.data.readings,
          ...fields([
            ["Taken", when(vitals.data.at)],
            ["Notes", record.notes ?? record.note],
          ]),
        ],
        { empty: "No readings recorded." },
      ),
    ];
  });

const soapNote = z
  .object({
    chief_complaint: maybeText,
    primary_diagnosis: maybeText,
    vital_signs_info: vitalSignsSchema.nullish().catch(null),
    ...Object.fromEntries(soapSectionLabels.map(([key]) => [key, noteText.catch("")])),
  })
  .transform((note) => {
    const record = note as unknown as Record<string, string>;
    return [
      section("Encounter note", [
        ...fields([
          ["Chief complaint", note.chief_complaint],
          ["Primary diagnosis", note.primary_diagnosis],
        ]),
        ...soapSectionLabels.flatMap(([key, label]) =>
          record[key] ? [{ label, value: record[key] }] : [],
        ),
      ]),
      ...(note.vital_signs_info ? [vitalsSection("Vital signs", note.vital_signs_info)] : []),
    ];
  });

/** `DrugRecordRead`. */
const drug = z.object({
  name: maybeText,
  strength: maybeText,
  dose_form: maybeText,
  route: maybeText,
  quantity: maybeNumber,
  unit: maybeText,
  frequency: maybeText,
  duration: durationSchema.catch(null),
  allergies: z.array(z.string()).catch([]),
  status: maybeText,
});

const drugSection = (record: z.infer<typeof drug>, status: string | null = record.status) =>
  section(
    [record.name, record.strength].filter(Boolean).join(" ") || "Medication",
    fields([
      [
        "Dose",
        [record.quantity, record.unit].filter((part) => part != null && part !== "").join(" "),
      ],
      ["Form", record.dose_form],
      ["Route", record.route],
      ["Frequency", frequencyOf(record.frequency)],
      ["Duration", durationOf(record.duration)],
      ["Allergies", record.allergies.join(", ")],
    ]),
    {
      status: statusOf(status, { dispensed: "success", pending: "warning", unavailable: "error" }),
    },
  );

const drugRecord = drug.transform((record) => [drugSection(record)]);

/** `DrugOrderRead`: the order, then each drug on it. */
const drugOrder = z
  .object({
    ordered_by_info: maybePerson,
    created_at: maybeDate,
    drugs_info: z.array(z.object({ status: maybeText, drug_record: drug.nullish().catch(null) })),
  })
  .transform((order) => [
    section(
      "Drug order",
      fields([
        ["Ordered by", order.ordered_by_info],
        ["Ordered on", when(order.created_at)],
      ]),
    ),
    ...order.drugs_info.flatMap((item) =>
      item.drug_record ? [drugSection(item.drug_record, item.status)] : [],
    ),
  ]);

/** The record types read field by field, under each name the API may give them. */
const typedRecords: Record<string, z.ZodType<RecordSection[], unknown>> = {
  admission,
  admission_request: admissionRequest,
  lab_order: labOrder,
  lab_test_order: labOrder,
  nursing_assessment: nursingAssessment,
  vital_signs: vitalSigns,
  soap_note: soapNote,
  drug_record: drugRecord,
  drug_order: drugOrder,
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * `GET /api/records/events/{sqid}`: the event's record, read as `type` (the timeline's
 * `record_type`) when it's a known one. The API sends the record itself; a `{record_type,
 * record}` wrapper is read too.
 */
export const recordEventSchema = (type: string) =>
  z.unknown().transform((body): RecordEventDetail => {
    const wrapped = isObject(body) && isObject(body.record) ? body : null;
    const record = wrapped ? (wrapped.record as Record<string, unknown>) : body;
    const named = [type, wrapped?.record_type, isObject(record) ? record.type : null].find(
      (value): value is string => typeof value === "string" && value !== "",
    );
    const parser = named ? typedRecords[typeKey(named)] : undefined;
    const typed = parser?.safeParse(record);
    if (typed?.success) return { typed: true, sections: typed.data };
    return {
      typed: false,
      sections: [section(null, isObject(record) ? recordDetails(record) : [])],
    };
  });

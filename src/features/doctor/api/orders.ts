import { useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { optionalText, text } from "@/lib/staff-profile";
import { doctorKeys } from "@/features/doctor/api/queries";
import { anyResponseSchema } from "@/features/doctor/api/schemas";

// What a doctor orders for a patient during a visit (lab tests, scans, drugs) and how they move
// them (admission, transfer, referral), on the real API. Every order belongs to exactly one visit:
// a check-in that's the doctor's, or an admission.

/** The visit an order belongs to. */
export type VisitRef = { kind: "check_in" | "admission"; id: string };

const visitFields = (visit: VisitRef) =>
  visit.kind === "check_in" ? { check_in: visit.id } : { admission: visit.id };

// ---------------------------------------------------------------------------------------------
// Pickers.

export type LabTest = { id: string; name: string; category: string | null; fasting: boolean };
export type Scan = { id: string; name: string };
export type DrugSuggestion = {
  /** The RxNorm code the order sends. */
  code: string;
  name: string;
  strength: string | null;
  form: string | null;
  route: string | null;
  label: string;
};
export type Hospital = { id: string; name: string };
export type Ward = {
  id: string;
  name: string;
  /** Beds free to take, in number order. */
  freeBeds: { id: string; number: number }[];
};

const labCategoriesSchema = z.object({
  results: z.array(z.object({ sqid: z.string(), name: text })),
});

const labTestsSchema = z.object({
  results: z.array(
    z
      .object({
        sqid: z.string(),
        name: text,
        category: z.object({ name: text }).nullish(),
        fasting_required: z.boolean().nullish(),
      })
      .transform((test): LabTest => ({
        id: test.sqid,
        name: test.name,
        category: test.category?.name || null,
        fasting: !!test.fasting_required,
      })),
  ),
});

/** `GET /api/radiology/scans`: a plain list (not a page). */
const scansSchema = z.array(
  z
    .object({ sqid: z.string(), name: text })
    .transform((scan): Scan => ({ id: scan.sqid, name: scan.name })),
);

/** `GET /api/pharmacy/drugs/autocomplete`: a plain list (not a page). */
const drugSuggestionsSchema = z.array(
  z
    .object({
      rxcui: z.string(),
      name: text,
      strength: optionalText,
      dose_form: optionalText,
      route: optionalText,
      display_name: optionalText,
    })
    .transform((drug): DrugSuggestion => ({
      code: drug.rxcui,
      name: drug.name,
      strength: drug.strength,
      form: drug.dose_form,
      route: drug.route,
      label:
        drug.display_name ?? [drug.name, drug.strength, drug.dose_form].filter(Boolean).join(" "),
    })),
);

const hospitalsSchema = z.object({
  results: z.array(
    z.object({ sqid: z.string(), name: text }).transform((hospital): Hospital => ({
      id: hospital.sqid,
      name: hospital.name,
    })),
  ),
});

const wardsSchema = z.object({
  results: z.array(
    z
      .object({
        sqid: z.string(),
        name: text,
        beds: z
          .array(z.object({ sqid: z.string(), bed_number: z.coerce.number(), status: text }))
          .catch([]),
      })
      .transform((ward): Ward => ({
        id: ward.sqid,
        name: ward.name,
        freeBeds: ward.beds
          .filter(({ status }) => status === "available")
          .map((bed) => ({ id: bed.sqid, number: bed.bed_number }))
          .sort((a, b) => a.number - b.number),
      })),
  ),
});

const pickerKeys = {
  labCategories: () => [...doctorKeys.all, "lab-categories"] as const,
  labTests: (category: string, search: string) =>
    [...doctorKeys.all, "lab-tests", category, search] as const,
  scans: (query: string) => [...doctorKeys.all, "scans", query] as const,
  drugs: (query: string) => [...doctorKeys.all, "drugs", query] as const,
  hospitals: () => [...doctorKeys.all, "hospitals"] as const,
  wards: () => [...doctorKeys.all, "wards"] as const,
};

export const labCategoriesQuery = () =>
  queryOptions({
    queryKey: pickerKeys.labCategories(),
    queryFn: async () =>
      (
        await request(labCategoriesSchema, {
          url: "/api/lab/test-categories",
          params: { size: 100 },
        })
      ).results,
    staleTime: Infinity,
  });

/** Lab tests in a category ("" for any), or matching a search across them all. */
export const labTestsQuery = (category: string, search: string) =>
  queryOptions({
    queryKey: pickerKeys.labTests(category, search),
    queryFn: async () =>
      (
        await request(labTestsSchema, {
          url: "/api/lab/lab-tests",
          params: { category: category || undefined, search: search || undefined, size: 100 },
        })
      ).results,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

/** Scans matching what's typed (2 letters or more). */
export const scanSearchQuery = (query: string) =>
  queryOptions({
    queryKey: pickerKeys.scans(query),
    queryFn: () =>
      request(scansSchema, { url: "/api/radiology/scans", params: { query, size: 20 } }),
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

/** Drugs (RxNorm) matching what's typed (2 letters or more). */
export const drugSearchQuery = (query: string) =>
  queryOptions({
    queryKey: pickerKeys.drugs(query),
    queryFn: () =>
      request(drugSuggestionsSchema, {
        url: "/api/pharmacy/drugs/autocomplete",
        params: { query, size: 10 },
      }),
    enabled: query.length >= 2,
    staleTime: 5 * 60_000,
  });

/** Hospitals on DocuHealth, to refer to. */
export const hospitalsQuery = () =>
  queryOptions({
    queryKey: pickerKeys.hospitals(),
    queryFn: async () =>
      (
        await request(hospitalsSchema, {
          url: "/api/auth/facilities/hospitals",
          params: { size: 100 },
        })
      ).results,
    staleTime: 5 * 60_000,
  });

/** The hospital's wards and their free beds. */
export const wardsQuery = () =>
  queryOptions({
    queryKey: pickerKeys.wards(),
    queryFn: async () =>
      (await request(wardsSchema, { url: "/api/hospital-ops/wards", params: { size: 100 } }))
        .results,
  });

// ---------------------------------------------------------------------------------------------
// Orders and moves.

/** After an order or a move: the patient's tests, notes and lists may all change. */
function useOrdered() {
  const queryClient = useQueryClient();
  // Every query, not just the doctor's: the patient lists and visit records move too.
  return () => queryClient.invalidateQueries();
}

/**
 * Order lab tests. The API warns (400 `duplicate_warning`) when the same test was ordered
 * lately; `anyway` sends it regardless.
 */
export function useOrderLabTests() {
  return useMutation({
    mutationFn: ({
      visit,
      hin,
      testIds,
      note,
      anyway = false,
    }: {
      visit: VisitRef;
      hin: string;
      testIds: string[];
      note: string;
      anyway?: boolean;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/lab/test-orders/create",
        data: {
          patient: hin,
          ...visitFields(visit),
          items: testIds.map((test) => ({ test })),
          note: note || undefined,
          ignore_duplicate_warning: anyway,
        },
      }),
    onSuccess: useOrdered(),
  });
}

export function useOrderScans() {
  return useMutation({
    mutationFn: ({ visit, hin, scanIds }: { visit: VisitRef; hin: string; scanIds: string[] }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/radiology/orders",
        data: { patient: hin, ...visitFields(visit), items: scanIds.map((scan) => ({ scan })) },
      }),
    onSuccess: useOrdered(),
  });
}

/** One drug on a prescription: from the catalogue (`code`) or typed in (`name`, `route`). */
export type PrescribedDrug = {
  code: string | null;
  name: string;
  strength: string;
  form: string;
  route: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: { value: number; rate: "days" | "weeks" | "months" };
};

/** Prescribe drugs; the pharmacy sees them as a prescription to dispense. */
export function useOrderDrugs() {
  return useMutation({
    mutationFn: ({
      visit,
      hin,
      drugs,
      allergies,
    }: {
      visit: VisitRef;
      hin: string;
      drugs: PrescribedDrug[];
      allergies: string[];
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/pharmacy/orders/create",
        data: {
          patient: hin,
          ...visitFields(visit),
          drugs: drugs.map((drug) => ({
            ...(drug.code
              ? { catalog_drug: drug.code }
              : {
                  manual_drug: {
                    name: drug.name,
                    route: drug.route,
                    strength: drug.strength || undefined,
                    dose_form: drug.form || undefined,
                  },
                }),
            dosage: {
              quantity: drug.quantity,
              unit: drug.unit,
              frequency: drug.frequency,
              duration: drug.duration,
              allergies,
            },
          })),
        },
      }),
    onSuccess: useOrdered(),
  });
}

/** Ask for the patient to be admitted to a free bed; the front desk accepts it. */
export function useRequestAdmission() {
  return useMutation({
    mutationFn: ({ checkInId, hin, bedId }: { checkInId: string; hin: string; bedId: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/admissions/requests/create",
        data: { patient: hin, bed: bedId, check_in: checkInId },
      }),
    onSuccess: useOrdered(),
  });
}

/** Move an admitted patient to another bed. */
export function useTransferPatient() {
  return useMutation({
    mutationFn: ({ admissionId, bedId }: { admissionId: string; bedId: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/admissions/transfer",
        data: { admission: admissionId, new_bed: bedId },
      }),
    onSuccess: useOrdered(),
  });
}

/** Refer the patient to another hospital on DocuHealth. */
export function useReferPatient() {
  return useMutation({
    mutationFn: ({
      visit,
      hospitalId,
      reason,
    }: {
      visit: VisitRef;
      hospitalId: string;
      reason: string;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/referrals",
        data: { ...visitFields(visit), hospital_to_id: hospitalId, reason },
      }),
    onSuccess: useOrdered(),
  });
}

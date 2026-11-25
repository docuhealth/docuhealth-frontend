import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";

// TODO(api): the patient's Sharing & privacy screens have no API yet. docs/api/openapi.json has
// no record sharing, access codes, access logs or consent settings for patients (only the
// clinicians' SOAP-note sharing and staff audit logs). Everything here is waiting on it:
// shares and their access codes, who viewed what, privacy settings, and the people a patient
// can share with at a facility. On the mock dev server (`npm run dev`) it comes from
// src/mocks/patient-sharing.ts and the actions work there; on staging and live the lists are
// empty and the actions fail with "… isn't available yet". When the endpoints land, point
// these at the real paths.

const PENDING = "/api/pending/patient/sharing";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** An action on the mock server in dev; everywhere else it fails, saying `what` can't be done yet. */
function pendingAction<T extends z.ZodType>(schema: T, what: string, path: string, data: unknown) {
  if (!mocked()) return Promise.reject(new NotAvailableYetError(what));
  return request(schema, { method: "POST", url: `${PENDING}${path}`, data });
}

const sharingKeys = {
  all: ["patient", "pending", "sharing"] as const,
  of: (what: string) => [...sharingKeys.all, what] as const,
};

/** The parts of a record a patient can share. */
export const recordParts = [
  "allergies",
  "immunizations",
  "radiology",
  "lab_results",
  "visit_summaries",
  "documents",
  "medications",
  "health_summary",
] as const;
const recordPartSchema = z.enum(recordParts);
export type RecordPart = z.output<typeof recordPartSchema>;

/** How long a share lasts. */
export const shareDurations = ["24h", "7d", "30d", "90d"] as const;
export type ShareDuration = (typeof shareDurations)[number];

/** Why the patient is sharing. */
export const shareReasons = [
  "second_opinion",
  "referral",
  "insurance",
  "personal",
  "other",
] as const;
export type ShareReason = (typeof shareReasons)[number];

const shareSchema = z.object({
  id: z.string(),
  recipient: z.object({ name: z.string(), role: z.string().nullable() }),
  facility: z.object({ name: z.string(), area: z.string().nullable() }),
  items: z.array(recordPartSchema),
  createdAt: z.string(),
  expiresAt: z.string(),
  /** When the patient stopped it; `null` while it runs (until it expires). */
  stoppedAt: z.string().nullable(),
});
export type Share = z.output<typeof shareSchema>;

/** Every share the patient has made, running, stopped or expired. */
export const sharesQuery = () =>
  queryOptions({
    queryKey: sharingKeys.of("shares"),
    queryFn: () => pendingRequest(z.array(shareSchema), "/shares", []),
  });

const accessEventSchema = z.object({
  id: z.string(),
  viewer: z.object({ name: z.string(), role: z.string().nullable() }),
  facility: z.string().nullable(),
  item: recordPartSchema,
  at: z.string(),
});
export type AccessEvent = z.output<typeof accessEventSchema>;

/** Who opened which part of the record, and when. */
export const accessHistoryQuery = () =>
  queryOptions({
    queryKey: sharingKeys.of("history"),
    queryFn: () => pendingRequest(z.array(accessEventSchema), "/history", []),
  });

const privacySettingsSchema = z.object({
  /** Clinicians may open the record in an emergency, without a code. */
  emergencyAccess: z.boolean(),
  /** The care teams the patient is seen by get access without a code each time. */
  careTeams: z.boolean(),
  /** Anonymised data may be used for research. */
  research: z.boolean(),
});
export type PrivacySettings = z.output<typeof privacySettingsSchema>;

const noSettings: PrivacySettings = { emergencyAccess: false, careTeams: false, research: false };

/** The patient's consent choices. */
export const privacySettingsQuery = () =>
  queryOptions({
    queryKey: sharingKeys.of("privacy"),
    queryFn: () => pendingRequest(privacySettingsSchema, "/privacy", noSettings),
  });

const sharingPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  facility: z.string(),
  facilityArea: z.string().nullable(),
});
export type SharingPerson = z.output<typeof sharingPersonSchema>;

/** The clinicians the patient can share with, at every facility. */
export const sharingPeopleQuery = () =>
  queryOptions({
    queryKey: sharingKeys.of("people"),
    queryFn: () => pendingRequest(z.array(sharingPersonSchema), "/people", []),
    staleTime: 5 * 60_000,
  });

export type ShareRequest = {
  facility: string;
  personId: string;
  items: RecordPart[];
  duration: ShareDuration;
  reason: ShareReason | null;
};

const startedSchema = z.object({
  /** The share waiting for the patient's code. */
  requestId: z.string(),
  /** Where the code went, e.g. "+234 ••• ••• 4821". */
  sentTo: z.string(),
});
export type StartedShare = z.output<typeof startedSchema>;

const readySchema = z.object({
  share: shareSchema,
  /** "7K492Q": what the clinician types in. */
  accessCode: z.string(),
  /** The secure link to the same access. */
  link: z.string(),
});
export type ReadyShare = z.output<typeof readySchema>;

/** Ask to share: sends the patient a one-time code to confirm it's them. */
export function useStartShare() {
  return useMutation({
    mutationFn: (share: ShareRequest) => pendingAction(startedSchema, "Sharing", "/shares", share),
  });
}

/** Send the one-time code again. */
export function useResendShareCode() {
  return useMutation({
    mutationFn: (requestId: string) =>
      pendingAction(
        startedSchema,
        "Sending the code again",
        `/requests/${encodeURIComponent(requestId)}/resend`,
        {},
      ),
  });
}

/** Confirm with the one-time code: the share starts and its access code comes back. */
export function useVerifyShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, code }: { requestId: string; code: string }) =>
      pendingAction(readySchema, "Sharing", `/requests/${encodeURIComponent(requestId)}/verify`, {
        code,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sharingKeys.of("shares") }),
  });
}

/** End a share now. */
export function useStopShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      pendingAction(shareSchema, "Stopping a share", `/shares/${encodeURIComponent(id)}/stop`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sharingKeys.of("shares") }),
  });
}

/** Save the patient's consent choices. */
export function useSavePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: PrivacySettings) =>
      pendingAction(privacySettingsSchema, "Changing privacy settings", "/privacy", settings),
    onSuccess: (saved) => queryClient.setQueryData(sharingKeys.of("privacy"), saved),
  });
}

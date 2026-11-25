import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { z } from "zod";
import { paginated, request } from "@/lib/api";

// The patient's family on the real API: the dependants they're a guardian of
// (`/api/patients/dependants`), the proxies they let act for them (`/api/patients/proxies`) and
// the grants that let them act for others (`/api/patients/proxies/held`). Nobody can act for
// someone else in the app yet (the onboarding guide, section 6), so only the grants are built.

const PAGE = { page: 1, size: 100 } as const;

const familyKeys = {
  all: ["patient", "family"] as const,
  dependants: () => [...familyKeys.all, "dependants"] as const,
  proxies: () => [...familyKeys.all, "proxies"] as const,
  held: () => [...familyKeys.all, "held"] as const,
};

const genderSchema = z.enum(["male", "female", "other", "unknown"]);
export type Gender = z.output<typeof genderSchema>;

/** `SubaccountFullInfo`: a dependant, with no login of their own. */
const dependantSchema = z
  .object({
    hin: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    middlename: z.string().nullish(),
    dob: z.string(),
    gender: genderSchema,
  })
  .transform(({ hin, firstname, lastname, middlename, dob, gender }) => ({
    hin,
    firstName: firstname,
    name: [firstname, lastname].filter(Boolean).join(" "),
    middleName: middlename ?? null,
    dob,
    gender,
  }));
export type Dependant = z.output<typeof dependantSchema>;

/** `PatientBasicInfo`. */
const personSchema = z
  .object({
    hin: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    gender: genderSchema,
    dob: z.string(),
  })
  .transform(({ hin, firstname, lastname, gender, dob }) => ({
    hin,
    firstName: firstname,
    name: [firstname, lastname].filter(Boolean).join(" "),
    gender,
    dob,
  }));

export const POWERS = ["view", "book", "message", "pay", "manage", "share"] as const;
export type Power = (typeof POWERS)[number];
const isPower = (value: unknown): value is Power => POWERS.includes(value as Power);

const grantStatusSchema = z.enum(["pending", "accepted", "declined", "ended", "expired"]);

/** `ProxyGrant`: someone allowed to act for a patient, for a while, once they accept. */
const proxyGrantSchema = z
  .object({
    sqid: z.string(),
    patient_info: personSchema,
    proxy_info: personSchema,
    granted_by_info: personSchema,
    relationship: z.string(),
    // Untyped in the API schema: a list of the powers' names.
    powers: z.array(z.unknown()),
    duration_days: z.number(),
    status: grantStatusSchema,
    created_at: z.string(),
    accepted_at: z.string().nullable(),
    ends_at: z.string().nullable(),
  })
  .transform((grant) => ({
    id: grant.sqid,
    /** Who the grant is over: the patient, or one of their dependants. */
    patient: grant.patient_info,
    proxy: grant.proxy_info,
    grantedBy: grant.granted_by_info,
    relationship: grant.relationship,
    powers: grant.powers.filter(isPower),
    durationDays: grant.duration_days,
    status: grant.status,
    createdAt: grant.created_at,
    acceptedAt: grant.accepted_at,
    endsAt: grant.ends_at,
  }));
export type ProxyGrant = z.output<typeof proxyGrantSchema>;

/** The dependants the patient is a guardian of. */
export const dependantsQuery = () =>
  queryOptions({
    queryKey: familyKeys.dependants(),
    queryFn: () =>
      request(paginated(dependantSchema), { url: "/api/patients/dependants", params: PAGE }),
    select: (page) => page.items,
  });

/** The grants the patient gave: proxies over them or their dependants. */
export const proxiesQuery = () =>
  queryOptions({
    queryKey: familyKeys.proxies(),
    queryFn: () =>
      request(paginated(proxyGrantSchema), { url: "/api/patients/proxies", params: PAGE }),
    select: (page) => page.items,
  });

/** The grants that let the patient act for others, including requests waiting for an answer. */
export const heldProxiesQuery = () =>
  queryOptions({
    queryKey: familyKeys.held(),
    queryFn: () =>
      request(paginated(proxyGrantSchema), { url: "/api/patients/proxies/held", params: PAGE }),
    select: (page) => page.items,
  });

function useRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: familyKeys.all });
}

export type NewDependant = {
  firstName: string;
  lastName: string;
  /** "YYYY-MM-DD". */
  dob: string;
  gender: Gender;
  relationship: string;
  isPrimaryContact: boolean;
  canConsent: boolean;
};

/** Add a child (or another dependant): the reply carries their new HIN. */
export function useAddDependant() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (dependant: NewDependant) =>
      request(dependantSchema, {
        method: "POST",
        url: "/api/patients/dependants",
        data: {
          firstname: dependant.firstName,
          lastname: dependant.lastName,
          dob: dependant.dob,
          gender: dependant.gender,
          relationship: dependant.relationship,
          is_primary_contact: dependant.isPrimaryContact,
          can_consent: dependant.canConsent,
        },
      }),
    onSuccess: refresh,
  });
}

export type NewProxy = {
  /** The proxy's HIN, digits only. */
  hin: string;
  relationship: string;
  powers: Power[];
  durationDays: number;
};

/**
 * Ask someone to be the patient's proxy. A 404 means no patient with a login has that HIN
 * (the API has no HIN lookup for patients, so this is how the form finds out).
 */
export function useAddProxy() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (proxy: NewProxy) =>
      request(proxyGrantSchema, {
        method: "POST",
        url: "/api/patients/proxies",
        data: {
          proxy: proxy.hin,
          relationship: proxy.relationship,
          powers: proxy.powers,
          duration_days: proxy.durationDays,
        },
      }),
    onSuccess: refresh,
  });
}

/** Asking someone to be a proxy failed because no patient with a login has that HIN. */
export const isUnknownHin = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

/** Accept or decline a request to be someone's proxy, or end a grant (given or held). */
export function useProxyAction() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" | "end" }) =>
      request(proxyGrantSchema, {
        method: "POST",
        url: `/api/patients/proxies/${encodeURIComponent(id)}/${action}`,
      }),
    onSuccess: refresh,
  });
}

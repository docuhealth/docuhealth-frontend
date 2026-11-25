import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

// The demo patient's family (src/features/patient/api/family.ts, pending-family.ts): one child,
// Damilola Adeyemi (6), no proxies yet, and a request from Grace Adeyemi to be her proxy, so every
// flow can be tried. Asking HIN 123-456-789-01 to be a proxy finds no one (404); any other HIN
// finds Folake Adeyemi. Changes live in memory until the page reloads.

const DAY = 24 * 60 * 60 * 1000;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const yearsAgo = (years: number, days = 40) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return isoDate(new Date(date.getTime() - days * DAY));
};

type Person = { hin: string; firstname: string; lastname: string; gender: string; dob: string };
type Dependant = Person & { middlename: string | null; id_card_generated: boolean };
type Grant = {
  sqid: string;
  patient_info: Person;
  proxy_info: Person;
  granted_by_info: Person;
  relationship: string;
  powers: string[];
  duration_days: number;
  status: "pending" | "accepted" | "declined" | "ended" | "expired";
  created_at: string;
  accepted_at: string | null;
  ends_at: string | null;
};

const me: Person = {
  hin: "1234567890123",
  firstname: "Chinonso",
  lastname: "Okafor",
  gender: "male",
  dob: "1988-04-12",
};
const grace: Person = {
  hin: "55190221",
  firstname: "Grace",
  lastname: "Adeyemi",
  gender: "female",
  dob: "1962-09-03",
};
const folake = (hin: string): Person => ({
  hin,
  firstname: "Folake",
  lastname: "Adeyemi",
  gender: "female",
  dob: "1990-02-14",
});

/** The HIN that finds no one, digits only. */
const UNKNOWN_HIN = "12345678901";

const growth = {
  weight: { unit: "kg", percentile: 50, values: [9, 11, 13, 16.1, 18.2, 20.4] },
  height: { unit: "cm", percentile: 55, values: [74, 86, 95, 102, 109, 116] },
  bmi: { unit: "kg/m²", percentile: 45, values: [16.4, 14.9, 14.4, 15.5, 15.3, 15.2] },
};
const points = (values: number[]) => values.map((value, index) => ({ ageYears: index + 1, value }));

function seed() {
  const damilola: Dependant = {
    hin: "55120934",
    firstname: "Damilola",
    lastname: "Adeyemi",
    middlename: null,
    gender: "male",
    dob: yearsAgo(6),
    id_card_generated: false,
  };
  const request: Grant = {
    sqid: "grant-grace",
    patient_info: grace,
    proxy_info: me,
    granted_by_info: grace,
    relationship: "Mother",
    powers: ["view", "book", "message"],
    duration_days: 180,
    status: "pending",
    created_at: new Date().toISOString(),
    accepted_at: null,
    ends_at: null,
  };
  return {
    dependants: [damilola],
    given: [] as Grant[],
    held: [request],
    extras: [
      {
        hin: damilola.hin,
        photoUrl: null,
        vaccinesDue: [
          {
            name: "MMR booster",
            dueBy: isoDate(new Date(Date.now() + 30 * DAY)),
            where: "Any DocuHealth clinic",
          },
        ],
        growth: Object.fromEntries(
          Object.entries(growth).map(([key, { unit, percentile, values }]) => [
            key,
            { unit, percentile, points: points(values) },
          ]),
        ),
      },
    ],
  };
}

let state = seed();

/** Back to the demo data, e.g. between tests. */
export function resetFamilyMocks() {
  state = seed();
}

const page = <T>(results: T[]) =>
  HttpResponse.json({ count: results.length, next: null, previous: null, results });

const findGrant = (sqid: string) =>
  state.given.find((grant) => grant.sqid === sqid) ??
  state.held.find((grant) => grant.sqid === sqid);

let nextId = 1;

export const patientFamilyHandlers = [
  http.get(api("/api/patients/dependants"), () => page(state.dependants)),

  http.post(api("/api/patients/dependants"), async ({ request }) => {
    const body = (await request.json()) as Partial<Record<string, string>>;
    const dependant: Dependant = {
      hin: String(55190000 + nextId++ * 117),
      firstname: body.firstname ?? "",
      lastname: body.lastname ?? "",
      middlename: null,
      gender: body.gender ?? "unknown",
      dob: body.dob ?? "",
      id_card_generated: false,
    };
    state.dependants = [dependant, ...state.dependants];
    return HttpResponse.json(dependant, { status: 201 });
  }),

  http.get(api("/api/patients/proxies/held"), () => page(state.held)),
  http.get(api("/api/patients/proxies"), () => page(state.given)),

  http.post(api("/api/patients/proxies"), async ({ request }) => {
    const body = (await request.json()) as {
      proxy?: string;
      relationship?: string;
      powers?: string[];
      duration_days?: number;
    };
    const hin = (body.proxy ?? "").replace(/\D/g, "");
    if (hin === UNKNOWN_HIN) {
      return HttpResponse.json({ detail: "No patient matches the given query." }, { status: 404 });
    }
    const grant: Grant = {
      sqid: `grant-${nextId++}`,
      patient_info: me,
      proxy_info: folake(hin),
      granted_by_info: me,
      relationship: body.relationship ?? "",
      powers: body.powers ?? [],
      duration_days: Number(body.duration_days ?? 30),
      status: "pending",
      created_at: new Date().toISOString(),
      accepted_at: null,
      ends_at: null,
    };
    state.given = [grant, ...state.given];
    return HttpResponse.json(grant, { status: 201 });
  }),

  http.post(api("/api/patients/proxies/:sqid/:action"), ({ params }) => {
    const grant = findGrant(String(params.sqid));
    if (!grant) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    const action = String(params.action);
    if (action === "accept") {
      grant.status = "accepted";
      grant.accepted_at = new Date().toISOString();
      grant.ends_at = new Date(Date.now() + grant.duration_days * DAY).toISOString();
    } else if (action === "decline") {
      grant.status = "declined";
    } else if (action === "end") {
      grant.status = "ended";
      grant.ends_at = new Date().toISOString();
    } else {
      return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    }
    return HttpResponse.json(grant);
  }),

  // TODO(api): pending data (src/features/patient/api/pending-family.ts).
  http.get(api("/api/pending/patient/family/dependants"), () => HttpResponse.json(state.extras)),

  http.post(
    api("/api/pending/patient/family/proxies/:sqid/powers"),
    async ({ params, request }) => {
      const grant = state.given.find((candidate) => candidate.sqid === params.sqid);
      if (!grant) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
      const body = (await request.json()) as { powers?: unknown };
      grant.powers = Array.isArray(body.powers) ? body.powers.map(String) : grant.powers;
      return HttpResponse.json(grant);
    },
  ),
];

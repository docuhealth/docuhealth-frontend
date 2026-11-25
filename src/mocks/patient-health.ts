import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient${path}`;

// TODO(api): demo data for the Health Trends, Healthcare facilities and Immunization screens
// (src/features/patient/api/pending-health.ts, pending-immunizations.ts). Only the mock dev
// server asks for these. Facilities match the demo patient's in src/mocks/patient.ts.

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

// Earlier lab values, before the ones on the demo visits (HbA1c and creatinine 12 days ago,
// haemoglobin 5 days ago), for the trends.
const lab = (
  id: string,
  name: string,
  value: number,
  unit: string,
  days: number,
  facility: string,
  flag: "normal" | "low" | "high" = "normal",
) => ({ id: `lab-${id}`, name, value, unit, flag, at: daysAgo(days), facility });

const labHistory = [
  lab("hb-2024", "Haemoglobin", 11.9, "g/dL", 400, "ABC Hospital", "low"),
  lab("a1c-2024", "HbA1c", 6.1, "%", 400, "ABC Hospital", "high"),
  lab("cr-2024", "Creatinine", 92, "µmol/L", 400, "ABC Hospital"),
  lab("hb-2023", "Haemoglobin", 12.4, "g/dL", 800, "ABC Hospital"),
  lab("a1c-2023", "HbA1c", 5.9, "%", 800, "ABC Hospital", "high"),
  lab("cr-2023", "Creatinine", 85, "µmol/L", 800, "ABC Hospital"),
  lab("hb-2021", "Haemoglobin", 11.2, "g/dL", 1500, "LUTH", "low"),
  lab("a1c-2021", "HbA1c", 6.4, "%", 1500, "LUTH", "high"),
  lab("cr-2021", "Creatinine", 95, "µmol/L", 1500, "LUTH"),
];

const facilities = [
  { name: "ABC Hospital", location: "Ikeja, Lagos", photoUrl: null },
  { name: "LUTH", location: "Idi-Araba, Lagos", photoUrl: null },
  { name: "Reddington Lab", location: "Victoria Island, Lagos", photoUrl: null },
  { name: "Reddington Hospital", location: "Victoria Island, Lagos", photoUrl: null },
];

const dose = (fields: Partial<typeof blankDose>) => ({ ...blankDose, ...fields });
const blankDose = {
  kind: "dose" as "dose" | "booster" | "series",
  number: null as number | null,
  count: 1,
  at: null as string | null,
  brand: null as string | null,
  facility: null as string | null,
  givenBy: null as string | null,
  batch: null as string | null,
  childhood: false,
  fromCard: false,
};

const immunizations = [
  {
    id: "td",
    name: "Tetanus-diphtheria (Td)",
    facility: "ABC Hospital",
    updatedAt: "2024-06-14T10:00:00Z",
    dosesTotal: null,
    lifelong: false,
    // About ten weeks away.
    due: { at: daysAgo(-70), kind: "booster", reminder: "2 weeks before" },
    protectsAgainst: "Tetanus and diphtheria",
    doses: [
      dose({ kind: "booster", at: "2017-01-12T10:00:00Z", facility: "LUTH" }),
      dose({ kind: "series", count: 3, childhood: true, fromCard: true }),
    ],
  },
  {
    id: "hepatitis-b",
    name: "Hepatitis B",
    facility: "ABC Hospital",
    updatedAt: "2024-06-14T10:00:00Z",
    dosesTotal: 3,
    lifelong: false,
    due: null,
    protectsAgainst: "Hepatitis B",
    doses: [3, 2, 1].map((number) =>
      dose({
        number,
        at: { 3: "2024-06-14", 2: "2024-02-12", 1: "2024-01-10" }[number] + "T10:00:00Z",
        brand: "Engerix-B 20 mcg",
        facility: "ABC Hospital",
        givenBy: "Nurse Ngozi Eze",
        batch: number === 3 ? "AHBVB412AB" : `AHBVB40${number}AB`,
      }),
    ),
  },
  {
    id: "covid-19",
    name: "COVID-19",
    facility: "LUTH",
    updatedAt: "2022-11-03T10:00:00Z",
    dosesTotal: null,
    lifelong: false,
    due: null,
    protectsAgainst: "COVID-19",
    doses: [
      dose({
        kind: "booster",
        at: "2022-11-03T10:00:00Z",
        brand: "Comirnaty",
        facility: "LUTH",
        givenBy: "Nurse Bisi Ade",
        batch: "FN7934",
      }),
      dose({ number: 2, at: "2021-10-01T10:00:00Z", brand: "Vaxzevria", facility: "LUTH" }),
      dose({ number: 1, at: "2021-07-20T10:00:00Z", brand: "Vaxzevria", facility: "LUTH" }),
    ],
  },
  {
    id: "yellow-fever",
    name: "Yellow fever",
    facility: "Garki Hospital",
    updatedAt: "2019-05-20T10:00:00Z",
    dosesTotal: null,
    lifelong: true,
    due: null,
    protectsAgainst: "Yellow fever",
    doses: [
      dose({
        number: 1,
        at: "2019-05-20T10:00:00Z",
        brand: "Stamaril",
        facility: "Garki Hospital",
      }),
    ],
  },
  {
    id: "typhoid",
    name: "Typhoid",
    facility: "Reddington Hospital",
    updatedAt: "2025-03-02T10:00:00Z",
    dosesTotal: null,
    lifelong: false,
    due: null,
    protectsAgainst: "Typhoid fever",
    doses: [
      dose({
        number: 1,
        at: "2025-03-02T10:00:00Z",
        brand: "Typbar-TCV",
        facility: "Reddington Hospital",
        givenBy: "Nurse Amaka Obi",
        batch: "TCV2203",
      }),
    ],
  },
  {
    id: "mmr",
    name: "Measles, mumps, rubella (MMR)",
    facility: null,
    updatedAt: "2024-06-14T10:00:00Z",
    dosesTotal: null,
    lifelong: false,
    due: null,
    protectsAgainst: "Measles, mumps and rubella",
    doses: [dose({ kind: "series", count: 2, childhood: true, fromCard: true })],
  },
];

export const patientHealthHandlers = [
  http.get(api("/lab-history"), () => HttpResponse.json(labHistory)),
  http.get(api("/facilities"), () => HttpResponse.json(facilities)),
  http.get(api("/immunizations"), () => HttpResponse.json(immunizations)),
];

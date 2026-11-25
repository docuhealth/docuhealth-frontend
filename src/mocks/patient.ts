import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

// The signed-in patient's own records, in the API's shapes (docs/api/openapi.json): visit
// summaries, appointments, drug records and vital signs. The demo patient (any non-staff email on
// the main site's login) is Chinonso Okafor, HIN 1234567890123. Records the API doesn't serve
// patients yet are in src/mocks/patient-pending.ts, keyed to the ids here.

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const daysAhead = (days: number, hour = 10) => daysAgo(-days, hour);
/** An hour and a half from now, on the half hour: always the next appointment. */
const soon = () => {
  const date = new Date(Date.now() + 90 * 60 * 1000);
  date.setMinutes(date.getMinutes() < 30 ? 0 : 30, 0, 0);
  return date.toISOString();
};

const abc = { name: "ABC Hospital", sqid: "hosp-abc", email: "info@abc.example.com" };
const luth = { name: "LUTH", sqid: "hosp-luth", email: "info@luth.example.com" };
const reddingtonLab = { name: "Reddington Lab", sqid: "hosp-rlab", email: "lab@red.example.com" };
const reddington = { name: "Reddington Hospital", sqid: "hosp-red", email: "info@red.example.com" };

const okafor = {
  sqid: "staff-okafor",
  firstname: "Adaeze",
  lastname: "Okafor",
  role: "doctor",
  specialization: "Internal Medicine",
};
const bello = {
  sqid: "staff-bello",
  firstname: "Tunde",
  lastname: "Bello",
  role: "doctor",
  specialization: "General Medicine",
};
const nurse = { sqid: "staff-nurse", firstname: "Grace", lastname: "Udo", role: "nurse" };

const patient = {
  hin: "1234567890123",
  firstname: "Chinonso",
  lastname: "Okafor",
  gender: "male",
  dob: "1990-05-14",
};

type Facility = typeof abc;

const reading = (
  id: string,
  at: string,
  hospital: Facility,
  values: {
    bp: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
    resp?: number;
  },
) => ({
  sqid: `vitals-${id}`,
  created_at: at,
  last_updated: at,
  blood_pressure: values.bp,
  temp: values.temp ?? 36.8,
  resp_rate: values.resp ?? 16,
  heart_rate: values.pulse ?? 72,
  height: 175,
  weight: values.weight ?? 78,
  spo2: values.spo2 ?? 98,
  pain_score: null,
  notes: null,
  bmi: Math.round(((values.weight ?? 78) / 1.75 ** 2) * 10) / 10,
  staff_info: nurse,
  hospital_info: hospital,
  patient_info: patient,
});

// Every set of vital signs, newest first: the latest visits' and a few years of blood pressure
// for the Trends chart.
const readings = [
  reading("7", daysAgo(5), abc, { bp: "128/80", weight: 78 }),
  reading("6", daysAgo(12), reddingtonLab, { bp: "130/82", weight: 81 }),
  reading("5", daysAgo(40), luth, { bp: "136/86", pulse: 88, temp: 38.4, weight: 80 }),
  reading("4", daysAgo(46), luth, { bp: "138/88", pulse: 92, temp: 37.9, weight: 80 }),
  reading("2024", daysAgo(400), abc, { bp: "136/86", weight: 81 }),
  reading("2023", daysAgo(800), abc, { bp: "140/90", weight: 83 }),
  reading("2021", daysAgo(1500), luth, { bp: "160/100", weight: 85 }),
  reading("2019", daysAgo(2200), reddington, { bp: "150/100", weight: 84 }),
];
const vitalsOf = (id: string) => readings.find((entry) => entry.sqid === `vitals-${id}`) ?? null;

const summary = (
  id: number,
  at: string,
  hospital: Facility,
  staff: typeof okafor | null,
  fields: {
    complaint?: string;
    diagnosis?: string;
    plan?: string;
    labs?: { name: string; status: string }[];
    scans?: { name: string; status: string }[];
    drugs?: string[];
  },
) => ({
  id,
  created_at: at,
  chief_complaint: fields.complaint ?? null,
  primary_diagnosis: fields.diagnosis ?? null,
  treatment_plan: fields.plan ?? null,
  care_instructions: null,
  patient_info: patient,
  staff_info: staff,
  hospital_info: hospital,
  vital_signs_info: vitalsOf(String(id)),
  lab_tests_info: fields.labs ?? [],
  scans_info: fields.scans ?? [],
  drug_orders_info: (fields.drugs ?? []).map((name) => ({ name })),
  additional_notes: [],
});

const summaries = [
  summary(8, daysAgo(0, 9), reddington, okafor, {
    complaint: "Heart check · Cardiology",
    scans: [{ name: "Echocardiogram", status: "in_progress" }],
  }),
  summary(7, daysAgo(5), abc, okafor, {
    complaint: "Follow-up · Internal Medicine",
    diagnosis: "High blood pressure",
    plan: "Blood pressure is now within target on the higher dose. Haemoglobin is slightly low but improving: keep taking iron-rich foods. Repeat bloods in 3 months.",
    labs: [
      { name: "Full Blood Count", status: "result_ready" },
      { name: "Lipid Profile", status: "result_ready" },
    ],
    scans: [{ name: "Chest X-ray (PA view)", status: "completed" }],
    drugs: ["Amlodipine 10 mg"],
  }),
  summary(6, daysAgo(12), reddingtonLab, null, {
    labs: [
      { name: "Creatinine", status: "result_ready" },
      { name: "HbA1c", status: "result_ready" },
    ],
  }),
  summary(5, daysAgo(40), luth, bello, {
    complaint: "Admission · General medicine",
    diagnosis: "Malaria",
    plan: "Treated with IV artesunate, then oral tablets. Finish the full course and come back if the fever returns.",
    labs: [{ name: "Malaria Parasite Test", status: "result_ready" }],
    drugs: ["Artemether/Lumefantrine"],
  }),
  summary(4, daysAgo(46), luth, bello, {
    complaint: "Emergency",
    diagnosis: "Urinary tract infection",
    scans: [{ name: "Abdominal ultrasound", status: "completed" }],
    drugs: ["Nitrofurantoin 100 mg"],
  }),
  summary(3, daysAgo(400), abc, okafor, {
    complaint: "Fever and body aches",
    diagnosis: "Malaria",
    drugs: ["Artemether/Lumefantrine"],
  }),
  summary(2, daysAgo(1000), abc, okafor, {
    complaint: "Fever and stomach pain",
    diagnosis: "Typhoid fever",
    drugs: ["Ciprofloxacin 500 mg"],
  }),
  summary(1, daysAgo(1250), reddington, null, {
    complaint: "Abdominal pain",
    diagnosis: "Gastroenteritis",
    scans: [{ name: "Echocardiogram", status: "completed" }],
  }),
];

const appointments = [
  {
    id: 1,
    sqid: "appt-1",
    status: "confirmed",
    scheduled_time: soon(),
    type: "Follow-up",
    note: null,
    staff: {
      sqid: "staff-isaac",
      firstname: "Isaac",
      lastname: "Adeyemi",
      role: "doctor",
      specialization: "Internal Medicine",
    },
    hospital_info: abc,
    closed_at: null,
  },
  {
    id: 2,
    sqid: "appt-2",
    status: "confirmed",
    scheduled_time: daysAhead(20, 10),
    type: "Follow-up",
    note: null,
    staff: okafor,
    hospital_info: abc,
    closed_at: null,
  },
];

const drug = (
  sqid: string,
  name: string,
  strength: string,
  days: number,
  fields: { status: string; quantity: number; frequency: string; duration: number },
) => ({
  sqid,
  name,
  strength,
  route: "oral",
  dose_form: "tablet",
  quantity: fields.quantity,
  unit: "tablets",
  frequency: fields.frequency,
  duration: { value: fields.duration, rate: "days" },
  status: fields.status,
  created_at: daysAgo(days),
  fulfillment_status: "dispensed",
  dispensed_at: daysAgo(days, 11),
});

const drugs = [
  drug("drug-1", "Amlodipine", "10 mg", 5, {
    status: "ongoing",
    quantity: 90,
    frequency: "od",
    duration: 90,
  }),
  drug("drug-2", "Artemether/Lumefantrine", "80/480 mg", 40, {
    status: "completed",
    quantity: 6,
    frequency: "bd",
    duration: 3,
  }),
  drug("drug-3", "Nitrofurantoin", "100 mg", 46, {
    status: "completed",
    quantity: 14,
    frequency: "bd",
    duration: 7,
  }),
  drug("drug-4", "Amlodipine", "5 mg", 200, {
    status: "stopped",
    quantity: 90,
    frequency: "od",
    duration: 90,
  }),
  drug("drug-5", "Ferrous sulphate", "200 mg", 220, {
    status: "completed",
    quantity: 90,
    frequency: "od",
    duration: 90,
  }),
  drug("drug-6", "Artemether/Lumefantrine", "80/480 mg", 400, {
    status: "completed",
    quantity: 6,
    frequency: "bd",
    duration: 3,
  }),
  drug("drug-7", "Ciprofloxacin", "500 mg", 1000, {
    status: "completed",
    quantity: 14,
    frequency: "bd",
    duration: 7,
  }),
];

const page = <T>(items: T[]) => ({
  count: items.length,
  next: null,
  previous: null,
  results: items,
});

export const patientHandlers = [
  // Only the patient's own HIN (or a dependant's) answers; any other is a 404, as the API does.
  http.get(api("/api/records/summaries/:hin"), ({ params }) =>
    params.hin === patient.hin
      ? HttpResponse.json(page(summaries))
      : HttpResponse.json({ detail: "Not found." }, { status: 404 }),
  ),
  http.get(api("/api/hospital-ops/appointments/mine"), () => HttpResponse.json(page(appointments))),
  http.get(api("/api/pharmacy/patients/drug-records"), () => HttpResponse.json(page(drugs))),
  http.get(api("/api/records/vital-signs/mine"), () => HttpResponse.json(page(readings))),
];

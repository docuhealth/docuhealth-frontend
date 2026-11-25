import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

// The signed-in patient's own records, in the API's shapes (docs/api/openapi.json): visit
// summaries, appointments and drug records. The demo patient (any non-staff email on the main
// site's login) is Chinonso Okafor, HIN 1234567890123.

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const daysAhead = (days: number, hour = 10) => daysAgo(-days, hour);

const abc = { name: "ABC Hospital", sqid: "hosp-abc", email: "info@abc.example.com" };
const luth = { name: "LUTH", sqid: "hosp-luth", email: "info@luth.example.com" };
const okafor = {
  sqid: "staff-okafor",
  firstname: "Adaeze",
  lastname: "Okafor",
  role: "doctor",
  specialization: "Internal Medicine",
};
const patient = {
  hin: "1234567890123",
  firstname: "Chinonso",
  lastname: "Okafor",
  gender: "male",
  dob: "1990-05-14",
};

const vitals = (at: string, bp: string, weight: number, bmi: number) => ({
  sqid: `vitals-${at}`,
  created_at: at,
  last_updated: at,
  blood_pressure: bp,
  temp: 36.8,
  resp_rate: 16,
  heart_rate: 72,
  height: 175,
  weight,
  spo2: 98,
  pain_score: null,
  notes: null,
  bmi,
});

const summaries = [
  {
    id: 3,
    created_at: daysAgo(5),
    chief_complaint: "Follow-up · Internal Medicine",
    primary_diagnosis: "High blood pressure",
    treatment_plan: null,
    care_instructions: null,
    patient_info: patient,
    staff_info: okafor,
    hospital_info: abc,
    vital_signs_info: vitals(daysAgo(5), "128/82", 74, 25),
    lab_tests_info: [
      { name: "Full Blood Count", status: "result_ready" },
      { name: "Lipid Profile", status: "result_ready" },
    ],
    scans_info: [{ name: "Chest X-ray (PA view)", status: "completed" }],
    drug_orders_info: [{ name: "Amlodipine 10 mg" }],
    additional_notes: [],
  },
  {
    id: 2,
    created_at: daysAgo(40),
    chief_complaint: "Fever and body aches",
    primary_diagnosis: "Malaria",
    patient_info: patient,
    staff_info: okafor,
    hospital_info: luth,
    vital_signs_info: vitals(daysAgo(40), "136/86", 77, 25.9),
    lab_tests_info: [{ name: "Malaria Parasite Test", status: "result_ready" }],
    scans_info: [],
    drug_orders_info: [{ name: "Artemether/Lumefantrine" }],
    additional_notes: [],
  },
  {
    id: 1,
    created_at: daysAgo(120),
    chief_complaint: "Abdominal pain",
    primary_diagnosis: "Gastroenteritis",
    patient_info: patient,
    staff_info: okafor,
    hospital_info: luth,
    vital_signs_info: null,
    lab_tests_info: [],
    scans_info: [{ name: "Abdominal ultrasound", status: "completed" }],
    drug_orders_info: [],
    additional_notes: [],
  },
];

const appointments = [
  {
    id: 1,
    sqid: "appt-1",
    status: "confirmed",
    scheduled_time: daysAhead(0, 16),
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
];

const drugs = [
  {
    sqid: "drug-1",
    name: "Amlodipine",
    strength: "10 mg",
    route: "oral",
    dose_form: "tablet",
    quantity: 90,
    unit: "tablets",
    frequency: "od",
    duration: { value: 90, rate: "days" },
    status: "ongoing",
    created_at: daysAgo(5),
    fulfillment_status: "dispensed",
    dispensed_at: daysAgo(5, 11),
  },
  {
    sqid: "drug-2",
    name: "Artemether/Lumefantrine",
    strength: "80/480 mg",
    route: "oral",
    dose_form: "tablet",
    quantity: 6,
    unit: "tablets",
    frequency: "bd",
    duration: { value: 3, rate: "days" },
    status: "completed",
    created_at: daysAgo(40),
    fulfillment_status: "dispensed",
    dispensed_at: daysAgo(40, 12),
  },
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
];

import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient${path}`;

// TODO(api): demo data for the patient records the API doesn't serve yet
// (src/features/patient/api/pending.ts). Only the mock dev server asks for these, so the
// populated screens can be seen; ids match the demo patient's in src/mocks/patient.ts (visits
// "1"–"8", scans "{visit}-{index}", drugs "drug-1"…).

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const daysAhead = (days: number, hour = 10) => daysAgo(-days, hour);

const profile = {
  bloodGroup: "O positive",
  genotype: "AA",
  documents: 14,
  immunizations: { doses: 9, due: 1 },
  outstandingBill: 40000,
  glucose: { value: 5.4, at: daysAgo(12), context: "pre-meal" },
};

const allergies = [
  {
    id: "allergy-peanuts",
    name: "Peanuts",
    kind: "food",
    reaction: "Swelling, trouble breathing",
    severity: "severe",
    active: true,
    facility: "LUTH",
    recordedBy: "Dr. Tunde Bello",
    at: daysAgo(40),
    avoid:
      "Peanuts and anything made with them: groundnut oil, some sauces and snacks. Read labels and ask when eating out.",
    note: "Carry your adrenaline pen at all times.",
  },
  {
    id: "allergy-penicillin",
    name: "Penicillin",
    kind: "medicine",
    reaction: "Hives (urticaria)",
    severity: "moderate",
    active: true,
    facility: "ABC Hospital, Ikeja",
    recordedBy: "Dr. Adaeze Okafor",
    at: daysAgo(620),
    avoid:
      "Penicillin and related antibiotics such as amoxicillin and ampicillin. Your doctor can choose a safe alternative.",
    note: "Rash appeared 2 days after starting amoxicillin for a throat infection. Settled after stopping the medicine.",
  },
  {
    id: "allergy-latex",
    name: "Latex",
    kind: "material",
    reaction: "Skin rash",
    severity: "mild",
    active: true,
    facility: "ABC Hospital",
    recordedBy: "Dr. Adaeze Okafor",
    at: daysAgo(620),
    avoid: "Latex gloves and balloons. Tell staff before any procedure.",
    note: null,
  },
];

const carePlans = [
  {
    id: "plan-hypertension",
    name: "Hypertension plan",
    status: "active",
    facility: "ABC Hospital",
    setBy: "Dr. Adaeze Okafor",
    startedAt: daysAgo(980),
    updatedAt: daysAgo(5),
    nextReview: daysAhead(20),
    endedAt: null,
    careTeam: "Internal Medicine, ABC Hospital",
    conditionId: "7",
    goal: { target: "128/80", unit: "mmHg", latest: "128/80", latestAt: daysAgo(5), onTrack: true },
    items: [
      { kind: "medication", title: "Amlodipine 10 mg", detail: "Dose increased from 5 mg" },
      {
        kind: "monitoring",
        title: "Check blood pressure at home",
        detail: "Twice a week · log readings with your nurse",
      },
      { kind: "visit", title: "Follow-up visit", detail: "Booked" },
    ],
  },
  {
    id: "plan-malaria",
    name: "Post-malaria recovery",
    status: "completed",
    facility: "LUTH",
    setBy: "Dr. Tunde Bello",
    startedAt: daysAgo(40),
    updatedAt: daysAgo(30),
    nextReview: null,
    endedAt: daysAgo(30),
    careTeam: "General Medicine, LUTH",
    conditionId: "5",
    goal: null,
    items: [
      { kind: "medication", title: "Artemether/Lumefantrine", detail: "Finish the full course" },
      { kind: "test", title: "Malaria parasite test", detail: "Two weeks after discharge" },
    ],
  },
];

const scanReports = [
  {
    scanId: "8-0",
    stage: "reviewing",
    scannedAt: daysAgo(0, 9),
    capturedAt: daysAgo(0, 10),
    images: 0,
    bodyPart: "Heart",
    type: "Echocardiogram",
    reportedBy: null,
    reportedAt: null,
    impression: null,
    findings: null,
  },
  {
    scanId: "7-0",
    stage: "ready",
    scannedAt: daysAgo(5, 9),
    capturedAt: daysAgo(5, 9),
    images: 2,
    bodyPart: "Chest",
    type: "X-ray",
    reportedBy: "Dr. Tunde Bello, Radiologist",
    reportedAt: daysAgo(4, 11),
    impression:
      "No acute cardiopulmonary abnormality. Heart size is within normal limits. Lungs are clear.",
    findings:
      "The lungs are clear bilaterally with no focal consolidation, effusion or pneumothorax. The cardiomediastinal silhouette is within normal limits. No bony abnormality is seen.",
  },
  {
    scanId: "4-0",
    stage: "ready",
    scannedAt: daysAgo(46),
    capturedAt: daysAgo(46),
    images: 6,
    bodyPart: "Abdomen",
    type: "Ultrasound",
    reportedBy: "Dr. Kemi Lawal, Radiologist",
    reportedAt: daysAgo(45),
    impression: "Normal kidneys and bladder. No stones or obstruction.",
    findings:
      "Both kidneys are normal in size and echotexture with no hydronephrosis or calculi. The bladder is well filled with a smooth wall.",
  },
  {
    scanId: "1-0",
    stage: "ready",
    scannedAt: daysAgo(1250),
    capturedAt: daysAgo(1250),
    images: 0,
    bodyPart: "Heart",
    type: "Echocardiogram",
    reportedBy: "Dr. Femi Ade, Cardiologist",
    reportedAt: daysAgo(1249),
    impression: "Normal heart structure and function.",
    findings: "Normal left ventricular size and function. No valve disease.",
  },
];

const labResults = [
  {
    visitId: "7",
    test: "Full Blood Count",
    values: [
      { name: "Haemoglobin", value: "13.8", unit: "g/dL", flag: "normal" },
      { name: "White Blood Cells", value: "11.8", unit: "×10⁹/L", flag: "high" },
      { name: "Platelet", value: "245", unit: "×10⁹/L", flag: "normal" },
    ],
  },
  {
    visitId: "7",
    test: "Lipid Profile",
    values: [
      { name: "Total cholesterol", value: "4.9", unit: "mmol/L", flag: "normal" },
      { name: "LDL", value: "3.1", unit: "mmol/L", flag: "normal" },
    ],
  },
  {
    visitId: "6",
    test: "Creatinine",
    values: [{ name: "Creatinine", value: "88", unit: "µmol/L", flag: "normal" }],
  },
  {
    visitId: "6",
    test: "HbA1c",
    values: [{ name: "HbA1c", value: "5.6", unit: "%", flag: "normal" }],
  },
  {
    visitId: "5",
    test: "Malaria Parasite Test",
    values: [{ name: "Malaria parasites", value: "Seen", unit: "", flag: "high" }],
  },
];

const visitDetails = [
  { visitId: "8", type: "outpatient", nights: null, discharged: false, nextSteps: [] },
  {
    visitId: "7",
    type: "outpatient",
    nights: null,
    discharged: false,
    nextSteps: [
      { kind: "visit", title: "Follow-up visit", detail: "Booked" },
      { kind: "test", title: "Repeat blood tests", detail: "Before your next visit" },
    ],
  },
  { visitId: "6", type: "lab", nights: null, discharged: false, nextSteps: [] },
  { visitId: "5", type: "admission", nights: 4, discharged: true, nextSteps: [] },
  { visitId: "4", type: "emergency", nights: null, discharged: false, nextSteps: [] },
  { visitId: "3", type: "outpatient", nights: null, discharged: false, nextSteps: [] },
  { visitId: "2", type: "outpatient", nights: null, discharged: false, nextSteps: [] },
  { visitId: "1", type: "outpatient", nights: null, discharged: false, nextSteps: [] },
];

const medicationDetails = [
  {
    drugId: "drug-1",
    prescribedBy: "Dr. Adaeze Okafor",
    facility: "ABC Hospital",
    pharmacy: "ABC Hospital Pharmacy",
    dispensedBy: "Pharm. Ngozi Eze",
    refills: "None",
    paymentStatus: "paid",
    instructions: "Take one tablet every morning. Don’t stop without talking to your doctor.",
    endsAt: daysAhead(85),
  },
  {
    drugId: "drug-2",
    prescribedBy: "Dr. Tunde Bello",
    facility: "LUTH",
    pharmacy: "LUTH Pharmacy",
    dispensedBy: "Pharm. Bayo Ade",
    refills: "None",
    paymentStatus: "paid",
    instructions: "Take with food, twice a day for three days.",
    endsAt: daysAgo(37),
  },
];

export const patientPendingHandlers = [
  http.get(api("/profile"), () => HttpResponse.json(profile)),
  http.get(api("/allergies"), () => HttpResponse.json(allergies)),
  http.get(api("/care-plans"), () => HttpResponse.json(carePlans)),
  http.get(api("/scan-reports"), () => HttpResponse.json(scanReports)),
  http.get(api("/lab-results"), () => HttpResponse.json(labResults)),
  http.get(api("/visit-details"), () => HttpResponse.json(visitDetails)),
  http.get(api("/medication-details"), () => HttpResponse.json(medicationDetails)),
];

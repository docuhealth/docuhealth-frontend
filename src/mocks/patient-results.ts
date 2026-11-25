import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient/results${path}`;

// TODO(api): demo lab reports for the Test results pages (src/features/patient/api/
// pending-results.ts), keyed to the demo patient's visits in src/mocks/patient.ts: Full Blood
// Count and Lipid Profile at visit 7 (ABC Hospital), Creatinine and HbA1c at visit 6 (Reddington
// Lab), a malaria RDT at visit 5 and a urinalysis at visit 4 (LUTH).

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const blood = {
  laboratory: null,
  specimen: "Blood",
  method: null,
  orderedBy: null,
  receivedAt: null,
  about: null,
  qualitative: null,
  amendment: null,
};

const value = (
  name: string,
  reading: string,
  unit: string,
  low: string | null,
  high: string | null,
  flag: "normal" | "low" | "high" = "normal",
  extra: { about?: string; history?: { at: string; value: number }[] } = {},
) => ({
  name,
  value: reading,
  unit,
  flag,
  low,
  high,
  about: extra.about ?? null,
  history: extra.history ?? [],
});

const negative = (name: string) => value(name, "Negative", "", null, null);

const reports = [
  {
    ...blood,
    visitId: "7",
    test: "Full Blood Count",
    stage: "ready",
    laboratory: "ABC Hospital Laboratory",
    collectedAt: daysAgo(5, 8, 12),
    receivedAt: daysAgo(5, 8, 40),
    resultedAt: daysAgo(5, 14, 40),
    values: [
      value("Haemoglobin", "12.8", "g/dL", "13.0", "17.0", "low", {
        about:
          "Haemoglobin helps carry oxygen around your body. Your levels have been rising over your last few tests. Your doctor will check them at your next visit.",
        history: [
          { at: daysAgo(620), value: 10.2 },
          { at: daysAgo(390), value: 11.4 },
        ],
      }),
      value("White cell count", "6.2", "×10⁹/L", "4.0", "11.0"),
      value("Platelets", "245", "×10⁹/L", "150", "400"),
      value("Red cell count", "4.6", "×10¹²/L", "4.5", "5.9"),
      value("Haematocrit", "0.41", "L/L", "0.40", "0.52"),
      value("MCV", "88", "fL", "80", "100"),
    ],
  },
  {
    ...blood,
    visitId: "7",
    test: "Lipid Profile",
    stage: "testing",
    laboratory: "ABC Hospital Laboratory",
    specimen: "Blood (fasting)",
    collectedAt: daysAgo(0, 8, 40),
    receivedAt: daysAgo(0, 9, 15),
    resultedAt: null,
    about:
      "Total cholesterol, LDL, HDL and triglycerides to assess your cholesterol levels and overall heart health.",
    values: [],
  },
  {
    ...blood,
    visitId: "6",
    test: "Creatinine",
    stage: "ready",
    laboratory: "Reddington Lab",
    orderedBy: "Dr. Adaeze Okafor",
    collectedAt: daysAgo(12, 9, 5),
    resultedAt: daysAgo(12, 15, 30),
    values: [
      value("Creatinine", "88", "µmol/L", "62", "106", "normal", {
        about: "Creatinine shows how well your kidneys clear waste from your blood.",
        history: [{ at: daysAgo(400), value: 92 }],
      }),
    ],
  },
  {
    ...blood,
    visitId: "6",
    test: "HbA1c",
    stage: "ready",
    laboratory: "Reddington Lab",
    orderedBy: "Dr. Adaeze Okafor",
    collectedAt: daysAgo(12, 9, 5),
    resultedAt: daysAgo(12, 16),
    values: [
      value("HbA1c", "5.6", "%", "4.0", "5.6", "normal", {
        about:
          "HbA1c shows your average blood sugar over the last 2–3 months. Yours is in the normal range.",
        history: [
          { at: daysAgo(800), value: 6.1 },
          { at: daysAgo(400), value: 5.9 },
        ],
      }),
    ],
  },
  {
    ...blood,
    visitId: "5",
    test: "Malaria parasite (RDT)",
    stage: "ready",
    laboratory: "LUTH Laboratory",
    method: "Rapid diagnostic test",
    collectedAt: daysAgo(36, 10, 2),
    resultedAt: daysAgo(36, 10, 30),
    values: [],
    qualitative: {
      result: "Negative",
      finding: "Not detected",
      normal: true,
      explanation:
        "No malaria parasites were found in your blood sample. A negative result is the expected result.",
    },
  },
  {
    ...blood,
    visitId: "4",
    test: "Urinalysis",
    stage: "ready",
    laboratory: "LUTH Laboratory",
    specimen: "Urine",
    collectedAt: daysAgo(46, 11),
    resultedAt: daysAgo(46, 15),
    values: [negative("Protein"), negative("Glucose"), negative("Leucocytes"), negative("Blood")],
    amendment: {
      at: daysAgo(30, 12),
      summary: "The lab updated one value after a re-check. You’re seeing the latest version.",
      changes: [{ name: "Protein", from: "Trace", to: "Negative" }],
      reason: "Sample re-tested",
      by: "Dr. Ife Okoro, LUTH",
    },
  },
];

export const patientResultHandlers = [http.get(api("/reports"), () => HttpResponse.json(reports))];

import { HttpResponse, http } from "msw";
import { env } from "@/env";

// Download audit logs, faked with the real API's path and shapes (as staging returns them).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

const person = (sqid: string, firstname: string, lastname: string, role: string) => ({
  sqid,
  firstname,
  lastname,
  role,
  specialization: null,
});
const tola = person("staff-5", "Tola", "Bello", "lab_scientist");
const raphael = person("staff-1", "Raphael", "Jonnas", "doctor");
const emeka = person("staff-6", "Emeka", "Obi", "radiologist");

const glory = {
  hin: "2078622761625",
  firstname: "Glory",
  lastname: "Kotin",
  gender: "male",
  dob: "2003-06-24",
};
const amina = {
  hin: "3379185230273",
  firstname: "Amina",
  lastname: "Yusuf",
  gender: "female",
  dob: "1990-02-11",
};
const hospital = { name: "Lagos University Teaching Hospital", email: null, sqid: "pm9XGQd" };

function labLog(
  index: number,
  hours: number,
  staff: typeof tola,
  patient: typeof glory,
  test: string,
  value: string,
  unit: string | null,
) {
  return {
    sqid: `lab-log-${index}`,
    created_at: hoursAgo(hours),
    staff_info: staff,
    patient_info: patient,
    hospital_info: hospital,
    type: "laboratory",
    action: "test_result_downloaded",
    action_display: "Test Result Downloaded",
    before_state: null,
    after_state: {
      status: "accepted",
      interpretation: "Within normal limits.",
      clinical_correlation: "None",
      comments: null,
      parameters_info: [{ value, parameter_info: { name: test, unit } }],
    },
    field_changed: null,
    target_type: "lab_test_result",
    target_sqid: `result-${index}`,
  };
}

const logs = {
  laboratory: [
    labLog(1, 2, tola, glory, "Fasting Blood Glucose", "5.2", "mmol/L"),
    labLog(2, 26, raphael, amina, "Haemoglobin", "13.4", "g/dL"),
    labLog(3, 50, tola, amina, "HIV Screening", "Non-reactive", null),
  ],
  radiology: [
    {
      sqid: "rad-log-1",
      created_at: hoursAgo(5),
      staff_info: emeka,
      patient_info: amina,
      hospital_info: hospital,
      type: "radiology",
      action: "scan_result_downloaded",
      action_display: "Scan Result Downloaded",
      before_state: null,
      after_state: {
        status: "completed",
        clinical_indication: "Chest pain, rule out pneumonia",
        findings: "Clear lung fields.",
        impression: "No acute findings.",
      },
      field_changed: null,
      target_type: "scan_result",
      target_sqid: "scan-result-1",
    },
  ],
};

export const auditLogHandlers = [
  http.get(api("/api/audits/audit-logs"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    if (type !== "laboratory" && type !== "radiology") {
      return HttpResponse.json({ type: ["This field is required."] }, { status: 400 });
    }
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    const list: unknown[] = logs[type];
    return HttpResponse.json({
      count: list.length,
      next: null,
      previous: null,
      results: list.slice((page - 1) * size, page * size),
    });
  }),
];

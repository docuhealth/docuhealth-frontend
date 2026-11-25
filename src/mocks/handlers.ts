import type { RequestHandler } from "msw";
import { admissionHandlers } from "@/mocks/admissions";
import { patientHandlers } from "@/mocks/patient";
import { patientAppointmentHandlers } from "@/mocks/patient-appointments";
import { patientPendingHandlers } from "@/mocks/patient-pending";
import { patientHealthHandlers } from "@/mocks/patient-health";
import { patientResultHandlers } from "@/mocks/patient-results";
import { patientMessageHandlers } from "@/mocks/patient-messages";
import { patientRecordHandlers } from "@/mocks/patient-records";
import { auditLogHandlers } from "@/mocks/audit-logs";
import { authHandlers } from "@/mocks/auth";
import { careTaskHandlers } from "@/mocks/care-tasks";
import { clinicalHandlers } from "@/mocks/clinical";
import { dhAdminHandlers } from "@/mocks/dh-admin";
import { doctorHandlers } from "@/mocks/doctor";
import { doctorOrderHandlers } from "@/mocks/doctor-orders";
import { hospitalAdminHandlers } from "@/mocks/hospital-admin";
import { labScientistHandlers } from "@/mocks/lab-scientist";
import { noteHandlers } from "@/mocks/notes";
import { nurseHandlers } from "@/mocks/nurse";
import { pharmacyHandlers } from "@/mocks/pharmacy";
import { radiologistHandlers } from "@/mocks/radiologist";
import { receptionistHandlers } from "@/mocks/receptionist";
import { staffHandlers } from "@/mocks/staff";

// Fake API endpoints for dev mode (VITE_ENABLE_MOCKS=true) and tests. Add one per endpoint
// with `http.get(\`${env.VITE_API_URL}/path\`, () => HttpResponse.json(...))`.
export const handlers: RequestHandler[] = [
  ...authHandlers,
  ...admissionHandlers,
  ...auditLogHandlers,
  ...careTaskHandlers,
  ...clinicalHandlers,
  ...dhAdminHandlers,
  ...hospitalAdminHandlers,
  ...doctorHandlers,
  ...doctorOrderHandlers,
  ...receptionistHandlers,
  ...radiologistHandlers,
  ...labScientistHandlers,
  ...nurseHandlers,
  ...noteHandlers,
  ...pharmacyHandlers,
  ...patientHandlers,
  ...patientAppointmentHandlers,
  ...patientPendingHandlers,
  ...patientHealthHandlers,
  ...patientResultHandlers,
  ...patientMessageHandlers,
  ...patientRecordHandlers,
  ...staffHandlers,
];

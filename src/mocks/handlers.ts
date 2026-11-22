import type { RequestHandler } from "msw";
import { admissionHandlers } from "@/mocks/admissions";
import { auditLogHandlers } from "@/mocks/audit-logs";
import { authHandlers } from "@/mocks/auth";
import { clinicalHandlers } from "@/mocks/clinical";
import { hospitalAdminHandlers } from "@/mocks/hospital-admin";
import { labScientistHandlers } from "@/mocks/lab-scientist";
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
  ...clinicalHandlers,
  ...hospitalAdminHandlers,
  ...receptionistHandlers,
  ...radiologistHandlers,
  ...labScientistHandlers,
  ...nurseHandlers,
  ...pharmacyHandlers,
  ...staffHandlers,
];

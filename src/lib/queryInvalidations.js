import { queryClient as defaultQueryClient } from "./queryClient";

/**
 * DocuHealth Unified Query Invalidation Utilities
 * 
 * WHY THIS DOES NOT OVERLOAD THE BACKEND:
 * In TanStack Query, `invalidateQueries({ queryKey })` does NOT eagerly trigger HTTP requests
 * for inactive or unmounted queries.
 * 1. TanStack Query simply marks matching queries in the cache as "stale".
 * 2. ONLY queries that are currently ACTIVE (rendered/mounted on the active screen right now)
 *    are refetched.
 * 3. Inactive queries (other pages, unopened tabs, background sections) are NOT refetched until
 *    the user actually navigates to them, ensuring zero wasted network traffic.
 * 4. Deduplication: If two components watch the same key, TanStack Query batches them into
 *    a single HTTP request.
 */

const getClient = (client) => client || defaultQueryClient;

/**
 * Invalidate all queries affected when a patient is discharged (by Nurse or Doctor)
 */
export const invalidatePatientDischarge = (client, { hin, patientHin, admissionSqid } = {}) => {
  const qc = getClient(client);
  const targetHin = hin || patientHin;

  // Inpatient & Discharged Lists across all clinical & administrative roles
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-receptionist"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-admin"] });

  // Ward & Bed Management (bed released)
  qc.invalidateQueries({ queryKey: ["hospital-wards"] });
  qc.invalidateQueries({ queryKey: ["ward-beds"] });
  qc.invalidateQueries({ queryKey: ["patients-in-ward"] });

  // Hospital & Doctor Dashboard Metrics (total discharged increases, active admissions decreases)
  qc.invalidateQueries({ queryKey: ["hospital-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["doctors-dashboard-metrics"] });

  // Care tasks and patient info
  qc.invalidateQueries({ queryKey: ["inpatient-tasks"] });
  if (admissionSqid) {
    qc.invalidateQueries({ queryKey: ["inpatient-tasks", admissionSqid] });
    qc.invalidateQueries({ queryKey: ["admission-task-occurrences", admissionSqid] });
    qc.invalidateQueries({ queryKey: ["inpatient-discharge-summary", admissionSqid] });
  }
  qc.invalidateQueries({ queryKey: ["inpatient-discharge-summary"] });
  qc.invalidateQueries({ queryKey: ["discharged-patients"] });

  if (targetHin) {
    qc.invalidateQueries({ queryKey: ["patient-info", targetHin] });
    qc.invalidateQueries({ queryKey: ["patient-admission-notes", targetHin] });
    qc.invalidateQueries({ queryKey: ["patient-med-records", targetHin] });
    qc.invalidateQueries({ queryKey: ["patient-lab-records", targetHin] });
    qc.invalidateQueries({ queryKey: ["patient-soap-notes", targetHin] });
  }
};

/**
 * Invalidate all queries affected when an admission is requested, accepted, or rejected
 */
export const invalidatePatientAdmission = (client, { hin, admissionSqid } = {}) => {
  const qc = getClient(client);

  // Receptionist admission requests queue
  qc.invalidateQueries({ queryKey: ["hospital-admission-requests"] });

  // Inpatient and Outpatient lists across all roles
  qc.invalidateQueries({ queryKey: ["hospital-patients-receptionist"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-admin"] });

  // Ward and Bed occupancy
  qc.invalidateQueries({ queryKey: ["hospital-wards"] });
  qc.invalidateQueries({ queryKey: ["ward-beds"] });
  qc.invalidateQueries({ queryKey: ["patients-in-ward"] });

  // Metrics
  qc.invalidateQueries({ queryKey: ["hospital-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["doctors-dashboard-metrics"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-info", hin] });
  }
};

/**
 * Invalidate all queries affected when a patient is transferred to another ward or bed
 */
export const invalidateWardTransfer = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-receptionist"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-admin"] });
  qc.invalidateQueries({ queryKey: ["hospital-wards"] });
  qc.invalidateQueries({ queryKey: ["ward-beds"] });
  qc.invalidateQueries({ queryKey: ["patients-in-ward"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-info", hin] });
  }
};

/**
 * Invalidate all appointment lists and KPI metrics across all roles
 */
export const invalidateAppointment = (client, { listKey } = {}) => {
  const qc = getClient(client);

  if (listKey) {
    qc.invalidateQueries({ queryKey: [listKey] });
  }
  qc.invalidateQueries({ queryKey: ["doctor-appointments"] });
  qc.invalidateQueries({ queryKey: ["nurse-appointments"] });
  qc.invalidateQueries({ queryKey: ["receptionist-appointments"] });
  qc.invalidateQueries({ queryKey: ["pharmacist-appointments"] });
  qc.invalidateQueries({ queryKey: ["lab-appointments"] });
  qc.invalidateQueries({ queryKey: ["radiology-appointments"] });
  qc.invalidateQueries({ queryKey: ["hospital-appointments"] });
  qc.invalidateQueries({ queryKey: ["hospital-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["doctors-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["appointments"] });
};

/**
 * Invalidate queries affected by check-ins, triage assessments, and outpatient closures
 */
export const invalidateCheckIn = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["receptionist-recent-patients"] });
  qc.invalidateQueries({ queryKey: ["doctor-active-check-ins"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-receptionist"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-admin"] });
  qc.invalidateQueries({ queryKey: ["hospital-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["doctors-dashboard-metrics"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-info", hin] });
  }
};

/**
 * Invalidate queries affected when vitals are recorded, requested, or processed
 */
export const invalidateVitals = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["nurse-patient-vitals-history"] });
  qc.invalidateQueries({ queryKey: ["vitals-history"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["inpatient-tasks"] });
  qc.invalidateQueries({ queryKey: ["assigned-for-vitals"] });
  qc.invalidateQueries({ queryKey: ["doctor-vitals-requests"] });
  qc.invalidateQueries({ queryKey: ["vital-signs"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-info", hin] });
  }
};

/**
 * Invalidate queries affected when nursing case notes are added
 */
export const invalidateCaseNotes = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["nurse-patient-case-notes-history"] });
  qc.invalidateQueries({ queryKey: ["patient-case-notes"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["nurse-patient-case-notes-history", hin] });
    qc.invalidateQueries({ queryKey: ["patient-case-notes", hin] });
  }
};

/**
 * Invalidate queries affected when a doctor records a consultation / SOAP note
 */
export const invalidateSoapNote = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["patient-soap-notes"] });
  qc.invalidateQueries({ queryKey: ["nurse-patient-case-notes-history"] });
  qc.invalidateQueries({ queryKey: ["doctor-active-check-ins"] });
  qc.invalidateQueries({ queryKey: ["doctor-appointments"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
  qc.invalidateQueries({ queryKey: ["hospital-patients-nurse"] });
  qc.invalidateQueries({ queryKey: ["medicalRecords"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-soap-notes", hin] });
    qc.invalidateQueries({ queryKey: ["patient-med-records", hin] });
    qc.invalidateQueries({ queryKey: ["patient-info", hin] });
  }
};

/**
 * Invalidate queries affected when medication is prescribed or dispensed
 */
export const invalidatePrescription = (client, { hin, sqid } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["pharmacist-prescriptions"] });
  qc.invalidateQueries({ queryKey: ["pharmacists-dashboard-metrics"] });
  qc.invalidateQueries({ queryKey: ["patient-prescriptions"] });
  qc.invalidateQueries({ queryKey: ["patient-med-records"] });
  qc.invalidateQueries({ queryKey: ["drugRecords"] });

  if (sqid) {
    qc.invalidateQueries({ queryKey: ["prescription-detail", sqid] });
  }
  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-med-records", hin] });
  }
};

/**
 * Invalidate queries affected when a lab test is ordered, processed, or uploaded
 */
export const invalidateLabOrder = (client, { hin, orderSqid } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["lab-requests"] });
  qc.invalidateQueries({ queryKey: ["lab-dashboard"] });
  qc.invalidateQueries({ queryKey: ["lab-appointments"] });
  qc.invalidateQueries({ queryKey: ["doctor-lab-records"] });
  qc.invalidateQueries({ queryKey: ["patient-lab-records"] });
  qc.invalidateQueries({ queryKey: ["lab-audit-logs"] });

  if (orderSqid) {
    qc.invalidateQueries({ queryKey: ["lab-order", orderSqid] });
    qc.invalidateQueries({ queryKey: ["lab-order-item"] });
  }
  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-lab-records", hin] });
    qc.invalidateQueries({ queryKey: ["doctor-lab-records", hin] });
  }
};

/**
 * Invalidate queries affected when a scan is ordered or uploaded
 */
export const invalidateRadiologyScan = (client, { hin } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["radiology-scan-requests"] });
  qc.invalidateQueries({ queryKey: ["radiology-scans"] });
  qc.invalidateQueries({ queryKey: ["radiology-appointments"] });
  qc.invalidateQueries({ queryKey: ["patient-radiology-records"] });
  qc.invalidateQueries({ queryKey: ["doctor-radiology-records"] });

  if (hin) {
    qc.invalidateQueries({ queryKey: ["patient-radiology-records", hin] });
    qc.invalidateQueries({ queryKey: ["doctor-radiology-records", hin] });
  }
};

/**
 * Invalidate ward & bed management queries
 */
export const invalidateWardManagement = (client, { wardSqid } = {}) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["hospital-wards"] });
  qc.invalidateQueries({ queryKey: ["patients-in-ward"] });

  if (wardSqid) {
    qc.invalidateQueries({ queryKey: ["ward-beds", wardSqid] });
  }
};

/**
 * Invalidate hospital staff queries
 */
export const invalidateStaffManagement = (client) => {
  const qc = getClient(client);

  qc.invalidateQueries({ queryKey: ["hospital-staffs"] });
  qc.invalidateQueries({ queryKey: ["hospital-staffs-lab-admin-check"] });
};

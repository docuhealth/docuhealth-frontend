/**
 * Lab/pharmacy/admission order-creation UI is mounted from several
 * different "currently selected patient" sources depending on where the
 * doctor is in the app, and each source has a different shape with no
 * explicit "type" field to switch on:
 *   - Appointment  → legacy shape: `.patient` (see AppointmentsList.jsx)
 *   - CheckIn      → `.patient_info`, no ward/bed/admission info (see
 *                    `api/doctors/check-ins`: `created_at`, `escalated_at`,
 *                    `claimed_by`, no ward/bed info)
 *   - Admission    → `.patient_info` + `.ward_info` / `.bed_info` /
 *                    `.requested_by_info` (nurse admissions and the doctor's
 *                    `api/hospitals/patients?status=inpatient` list; the old
 *                    `.admission_date` was renamed to `created_at`)
 *
 * Orders, vitals requests, bed requests and refer-out are saved against
 * exactly one visit: a `check_in` or an `admission`. An appointment is no
 * longer a visit, so `hasVisit` is false for it and callers block the action.
 * This inspects the object's shape once so call sites don't have to
 * duplicate the sniffing logic.
 *
 * If an admission is ever misread as a CheckIn, the *admission's* sqid goes
 * out as `check_in` and 400s with "Object with sqid=... does not exist.".
 */
export const NO_VISIT_MESSAGE =
  "This needs a check-in or an admission. Check the patient in first.";

export const resolveOrderContext = (details) => {
  const hin =
    details?.patient_info?.hin ||
    details?.patient?.hin ||
    details?.patient_hin ||
    "";

  const context = { hin, checkIn: null, admission: null, appointment: null };

  if (details) {
    if (details.ward_info || details.bed_info || details.requested_by_info) {
      // Admission (ward) context.
      context.admission = details.sqid || details.id || null;
    } else if (details.patient_info && !details.scheduled_time) {
      // CheckIn context: has patient_info but no ward/bed/admission info.
      context.checkIn = details.sqid || details.id || null;
    } else {
      // Appointment context: kept so callers can recognise it, but it is not a visit.
      context.appointment = details.sqid || details.id || null;
    }
  }

  return { ...context, hasVisit: !!(context.checkIn || context.admission) };
};

// The visit field an order, vitals request or refer-out sends: exactly one of check_in / admission.
export const visitPayload = ({ checkIn, admission }) =>
  admission ? { admission } : checkIn ? { check_in: checkIn } : {};

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
 * Each context needs a different `order_source` and a different (or no)
 * `check_in` link on lab/pharmacy/admission requests. This inspects the
 * object's shape once and resolves all three so call sites don't have to
 * duplicate the sniffing logic (or, worse, assume `.patient` and silently
 * send nothing when it's actually a check-in/admission object).
 *
 * If an admission is ever misread as a CheckIn, the *admission's* sqid goes
 * out as `check_in` and 400s with "Object with sqid=... does not exist.".
 */
export const resolveOrderContext = (
  details,
  { fallbackOrderSource = "staff_appointment_order" } = {},
) => {
  const hin =
    details?.patient_info?.hin ||
    details?.patient?.hin ||
    details?.patient_hin ||
    "";

  if (!details) {
    return {
      hin,
      orderSource: fallbackOrderSource,
      checkIn: null,
      admission: null,
      appointment: null,
    };
  }

  // Admission (ward) context.
  if (details.ward_info || details.bed_info || details.requested_by_info) {
    return {
      hin,
      orderSource: "staff_admission_order",
      checkIn: null,
      admission: details.sqid || details.id || null,
      appointment: null,
    };
  }

  // CheckIn context: has patient_info but no ward/bed/admission info.
  if (details.patient_info && !details.scheduled_time) {
    return {
      hin,
      orderSource: "staff_check_in_order",
      checkIn: details.sqid || details.id || null,
      admission: null,
      appointment: null,
    };
  }

  // Appointment (legacy/standard) context
  return {
    hin,
    orderSource: fallbackOrderSource,
    checkIn: null,
    admission: null,
    appointment: details.sqid || details.id || null,
  };
};

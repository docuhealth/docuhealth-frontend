/**
 * Lab/pharmacy/admission order-creation UI is mounted from several
 * different "currently selected patient" sources depending on where the
 * doctor is in the app, and each source has a different shape with no
 * explicit "type" field to switch on:
 *   - Appointment  → legacy shape: `.patient` (see AppointmentsList.jsx)
 *   - CheckIn      → `.patient_info`, no ward/bed info (see backend "Check-In Object Shape")
 *   - Admission    → `.patient_info` + `.ward_info` / `.bed_info` (see backend "Admission Response Shape")
 *
 * Each context needs a different `order_source` and a different (or no)
 * `check_in` link on lab/pharmacy/admission requests. This inspects the
 * object's shape once and resolves all three so call sites don't have to
 * duplicate the sniffing logic (or, worse, assume `.patient` and silently
 * send nothing when it's actually a check-in/admission object).
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
    return { hin, orderSource: fallbackOrderSource, checkIn: null };
  }

  // Admission (ward) context: only Admission objects carry ward/bed info.
  if (details.ward_info || details.bed_info) {
    return { hin, orderSource: "staff_admission_order", checkIn: null };
  }

  // CheckIn context: has patient_info but no ward/bed info.
  if (details.patient_info) {
    return {
      hin,
      orderSource: "staff_check_in_order",
      checkIn: details.sqid || null,
    };
  }

  // Appointment (legacy) context — the `appointment` field itself no
  // longer exists on any order serializer, so there's nothing to link;
  // callers should not send a check_in/appointment field here.
  return { hin, orderSource: fallbackOrderSource, checkIn: null };
};

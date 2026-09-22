// NOTE: reverted to dummy data 2026-09-18. `GET api/appointments/staff` (the
// endpoint this tab used to call, reused from the doctor/pharmacist queries)
// is scoped to whichever staff member holds the token — a radiologist is
// never the assigned attending staff on a hospital appointment, so it always
// returns `count: 0` for this role. The hospital-wide `GET api/appointments`
// is receptionist/admin-only (403 for radiologist). Neither gives a
// radiologist a way to browse appointments, so there's nothing real to call
// here yet — see BACKEND_RADIOLOGY_ISSUES.md (R4 update, 2026-09-17) for the
// full writeup and the backend/product options being considered.
//
// Shape mirrors the real `api/appointments/staff` response closely enough
// for RadiologyAppointmentsList's rendering to carry over unchanged once a
// real endpoint exists: { results: [...], count }.

// hoursFromNow is relative to "now" at render time — negative is in the
// past, positive is in the future — so entries land in the Today /
// Upcoming / Past buckets naturally without hardcoded dates going stale.
const DUMMY_APPOINTMENTS = [
  // Today
  { id: "rad-appt-1", name: "Amara Chukwu", hin: "1029384756102", requestedBy: "Dr. Lois David", scanType: "Chest X-Ray", note: "Follow-up on persistent cough.", hoursFromNow: -3 },
  { id: "rad-appt-2", name: "Tunde Bakare", hin: "5739102647385", requestedBy: "Dr. Kenechukwu Umeh", scanType: "MRI Brain", note: "Pre-op imaging.", hoursFromNow: 2 },
  { id: "rad-appt-3", name: "Ngozi Eze", hin: "8827364950182", requestedBy: "Dr. Aisha Bello", scanType: "Abdominal Ultrasound", note: "Routine antenatal scan.", hoursFromNow: 6 },

  // Upcoming
  { id: "rad-appt-4", name: "Ibrahim Musa", hin: "3746195028374", requestedBy: "Dr. Tobenna Nwachukwu", scanType: "Nuclear Medicine — Head", note: "Post-trauma review.", hoursFromNow: 30 },
  { id: "rad-appt-5", name: "Chiamaka Okafor", hin: "6650192837465", requestedBy: "Dr. Grace Adelaja", scanType: "Lumbar Spine X-Ray", note: "Chronic lower back pain.", hoursFromNow: 54 },
  { id: "rad-appt-6", name: "Femi Adeyemi", hin: "2934857610293", requestedBy: "Dr. Lois David", scanType: "Knee MRI", note: "Suspected ligament injury.", hoursFromNow: 78 },
  { id: "rad-appt-7", name: "Blessing Nwosu", hin: "7462839105726", requestedBy: "Dr. Aisha Bello", scanType: "Pelvic Ultrasound", note: "", hoursFromNow: 120 },
  { id: "rad-appt-8", name: "Yusuf Abdullahi", hin: "4109283746510", requestedBy: "Dr. Kenechukwu Umeh", scanType: "Chest X-Ray", note: "Annual occupational screening.", hoursFromNow: 168 },
  { id: "rad-appt-9", name: "Chinwe Obi", hin: "9273465810294", requestedBy: "Dr. Grace Adelaja", scanType: "Mammography", note: "Routine screening.", hoursFromNow: 216 },
  { id: "rad-appt-10", name: "Segun Owolabi", hin: "1857392640173", requestedBy: "Dr. Tobenna Nwachukwu", scanType: "Nuclear Medicine — Chest", note: "", hoursFromNow: 264 },
  { id: "rad-appt-11", name: "Halima Sani", hin: "6392847510628", requestedBy: "Dr. Lois David", scanType: "Doppler Ultrasound", note: "Vascular assessment.", hoursFromNow: 340 },

  // Past
  { id: "rad-appt-12", name: "Emeka Nnamdi", hin: "3081726459384", requestedBy: "Dr. Aisha Bello", scanType: "Chest X-Ray", note: "Cleared, no follow-up needed.", hoursFromNow: -48 },
  { id: "rad-appt-13", name: "Folake Ogundipe", hin: "8746103928475", requestedBy: "Dr. Grace Adelaja", scanType: "MRI Brain", note: "", hoursFromNow: -96 },
  { id: "rad-appt-14", name: "Aliyu Garba", hin: "2758391046273", requestedBy: "Dr. Kenechukwu Umeh", scanType: "Abdominal Ultrasound", note: "Reviewed with referring physician.", hoursFromNow: -160 },
  { id: "rad-appt-15", name: "Uche Iheanacho", hin: "5920184736251", requestedBy: "Dr. Tobenna Nwachukwu", scanType: "Nuclear Medicine — Head", note: "", hoursFromNow: -220 },
  { id: "rad-appt-16", name: "Kolawole Adisa", hin: "4837261950182", requestedBy: "Dr. Lois David", scanType: "Knee MRI", note: "Patient rescheduled once before attending.", hoursFromNow: -310 },
  { id: "rad-appt-17", name: "Grace Effiong", hin: "1746392850637", requestedBy: "Dr. Aisha Bello", scanType: "Lumbar Spine X-Ray", note: "", hoursFromNow: -420 },
  { id: "rad-appt-18", name: "Suleiman Bello", hin: "6284917305928", requestedBy: "Dr. Grace Adelaja", scanType: "Chest X-Ray", note: "", hoursFromNow: -560 },
  { id: "rad-appt-19", name: "Adaeze Umeh", hin: "9057382641950", requestedBy: "Dr. Kenechukwu Umeh", scanType: "Pelvic Ultrasound", note: "No abnormality detected.", hoursFromNow: -700 },
  { id: "rad-appt-20", name: "Chidi Onyekwere", hin: "3629481750293", requestedBy: "Dr. Tobenna Nwachukwu", scanType: "MRI Brain", note: "", hoursFromNow: -900 },
];

const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const classify = (scheduledTime, now) => {
  const d = new Date(scheduledTime);
  if (isSameDay(d, now)) return "today";
  return d > now ? "upcoming" : "history";
};

const PAYMENT_CATEGORIES = ["HMO Patient", "Private Patient", "Insurance Patient"];

const toRecord = ({ id, name, hin, requestedBy, scanType, note, hoursFromNow }, index) => {
  const [firstname, ...rest] = name.split(" ");
  const lastname = rest.join(" ");
  const [reqFirst, ...reqRest] = requestedBy.replace(/^Dr\.\s*/, "").split(" ");

  // Deterministic (not random) demographic filler for the appointment's
  // "Patient's details" -> General information view.
  const dobYear = 1960 + ((index * 7) % 45);
  const dobMonth = String(1 + (index % 12)).padStart(2, "0");
  const dobDay = String(1 + (index % 27)).padStart(2, "0");
  const phoneSeed = String(80000000 + index * 137).padStart(8, "0").slice(-8);

  return {
    id,
    sqid: id,
    patient: {
      firstname,
      lastname,
      hin,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      email: `${firstname.toLowerCase()}.${lastname.toLowerCase()}@gmail.com`,
      phone_num: `0${phoneSeed}`,
      street: "No.14 house, health centre street, iwofe",
      city: "Port Harcourt",
      state: "Rivers",
      country: "Nigeria",
      payment_category: PAYMENT_CATEGORIES[index % PAYMENT_CATEGORIES.length],
      gender: index % 2 === 0 ? "female" : "male",
    },
    staff: { firstname: reqFirst, lastname: reqRest.join(" "), role: "doctor" },
    scan_type: scanType,
    note,
    scheduled_time: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString(),
  };
};

export const fetchRadiologyAppointments = async ({ queryKey }) => {
  const [_key, appointmentType, page = 1, search = "", dateFrom = "", dateTo = ""] = queryKey;
  const now = new Date();
  const term = search.trim().toLowerCase();
  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

  const matching = DUMMY_APPOINTMENTS.filter((a) => {
    const scheduled = new Date(Date.now() + a.hoursFromNow * 60 * 60 * 1000);
    if (classify(scheduled, now) !== appointmentType) return false;
    if (term && !a.name.toLowerCase().includes(term)) return false;
    if (from && scheduled < from) return false;
    if (to && scheduled > to) return false;
    return true;
  });

  const count = matching.length;
  const pageSize = 8;
  const start = (page - 1) * pageSize;
  const results = matching.slice(start, start + pageSize).map((a, i) => toRecord(a, start + i));

  return { results, count };
};

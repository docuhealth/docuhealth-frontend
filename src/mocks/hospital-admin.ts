import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { permissionLabels } from "@/features/hospital-admin/api/schemas";
import type {
  DashboardOverview,
  FacilityType,
  HospitalProfile,
  PatientDetail,
  PatientFilterOptions,
  PatientList,
  PatientQueue,
  PatientStats,
  PatientTab,
  PatientVisit,
  StaffDetail,
  StaffList,
  StaffMemberChange,
} from "@/features/hospital-admin/api/schemas";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const profile: HospitalProfile = {
  name: "Lagos University Teaching Hospital",
  bannerUrl: null,
  admin: {
    firstName: "Folake",
    lastName: "Adeyemi",
    title: "Dr.",
    email: "folake.adeyemi@luth.example.com",
    avatarUrl: null,
  },
  unreadNotifications: 1,
  unreadMessages: 3,
};

const overview: DashboardOverview = {
  stats: {
    totalStaff: 48,
    addedThisMonth: 12,
    addedLastMonth: 9,
    administrators: 4,
    facilities: 3,
  },
  staffByRole: [
    { role: "doctor", count: 3 },
    { role: "nurse", count: 5 },
    { role: "pharmacist", count: 1 },
    { role: "lab_scientist", count: 1 },
    { role: "receptionist", count: 1 },
    { role: "records_officer", count: 0 },
  ],
};

const queue: PatientQueue["items"] = (
  [
    ["Chinonso Okafor", "DH-28491", "pending", 12],
    ["Tunde Adeyemi", "DH-28492", "completed", 24],
    ["Amina Yusuf", "DH-28493", "in_progress", 18],
    ["Chioma Nwosu", "DH-39172", "completed", 32],
    ["Emeka Uche", "DH-28495", "completed", 38],
  ] as const
).map(([name, hin, status, waitMinutes], index) => ({
  id: `queue-${index + 1}`,
  patient: { name, hin, avatarUrl: null },
  status,
  waitMinutes,
}));

const DAY = 24 * 60 * 60 * 1000;

const staff: StaffList["items"] = (
  [
    ["Esther Ibe", "doctor", "female", 3, "on_team", true],
    ["Chioma Nwosu", "nurse", "female", 5, "on_team", false],
    ["Emeka Uche", "lab_scientist", "male", 9, "on_team", false],
    ["Tunde Adeyemi", "doctor", "male", 18, "removed", false],
    ["Dr. Hauwa Garba", "pharmacist", "female", 60, "on_team", true],
    ["Kemi Adewale", "receptionist", "female", 120, "on_team", false],
    ["Dr. Ibrahim Sani", "doctor", "male", 150, "removed", false],
    ["Chidinma Okeke", "nurse", "female", 210, "on_team", false],
    ["Dr. Tola Bello", "nurse", "male", 335, "on_team", true],
    ["Ngozi Eze", "doctor", "female", 340, "on_team", true],
    ["Aisha Bello", "nurse", "female", 345, "on_team", false],
    ["Blessing Okon", "nurse", "female", 350, "on_team", false],
    ["Funmi Ade", "nurse", "female", 355, "removed", false],
    ["Grace Udo", "nurse", "female", 360, "on_team", false],
    ["Halima Sani", "nurse", "female", 365, "on_team", false],
    ["Segun Ojo", "pharmacist", "male", 370, "on_team", false],
    ["Yetunde Ogun", "lab_scientist", "female", 380, "on_team", false],
    ["Chidi Obi", "receptionist", "male", 390, "on_team", false],
    ["Bola Ajayi", "receptionist", "female", 400, "on_team", false],
    ["Musa Danjuma", "records_officer", "male", 410, "removed", false],
  ] as const
).map(([name, role, sex, daysAgo, status, isAdmin], index) => ({
  id: `staff-${index + 1}`,
  name,
  email: `${name.replace("Dr. ", "").toLowerCase().replace(" ", ".")}@luth.example.com`,
  phone: `0906040${String(6069 + index).padStart(4, "0")}`,
  role,
  avatarUrl: null,
  addedAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
  status,
  sex,
  isAdmin,
}));

type Permission = StaffDetail["permissions"][number]["permission"];

const roleAccess: Record<StaffList["items"][number]["role"], Permission[]> = {
  doctor: ["patient_records", "clinical_notes", "prescriptions", "lab_tests", "appointments"],
  nurse: ["patient_records", "clinical_notes", "appointments", "patient_registration"],
  pharmacist: ["patient_records", "prescriptions"],
  lab_scientist: ["patient_records", "lab_tests"],
  receptionist: ["appointments", "patient_registration"],
  records_officer: ["patient_records", "patient_registration"],
};

const periodScale = { today: 0.05, week: 0.25, month: 1 } as const;

/** A few days out, on the hour or half hour between 9 AM and 4:30 PM. */
function nextAppointment(index: number) {
  const date = new Date();
  date.setDate(date.getDate() + 1 + (index % 6));
  date.setHours(9 + (index % 8), index % 2 ? 30 : 0, 0, 0);
  return date.toISOString();
}

/** A staff member's profile, made up from their place in the list so it stays the same. */
function staffDetail(member: StaffList["items"][number], period: keyof typeof periodScale) {
  const index = staff.indexOf(member);
  const scale = (n: number) => Math.round(n * periodScale[period]);
  const access = roleAccess[member.role];
  return {
    ...member,
    staffCode: `STF-${String(200 + index + 1).padStart(5, "0")}`,
    dateOfBirth: `${1975 + (index % 20)}-${String((index % 12) + 1).padStart(2, "0")}-14`,
    addedBy: "Dr. Folake Adeyemi",
    stats: {
      patientsSeen: scale(60 + index * 7),
      appointmentsCompleted: scale(30 + index * 3),
      appointments: scale(3 + (index % 5)),
      nextAppointmentAt: member.status === "on_team" ? nextAppointment(index) : null,
      followUpsRequested: scale(5 + (index % 4)),
      followUpsPending: Math.min(scale(5 + (index % 4)), 2),
    },
    permissions: (Object.keys(permissionLabels) as Permission[]).map((permission) => ({
      permission,
      granted: access.includes(permission),
    })),
  } satisfies StaffDetail;
}

const patientStats: PatientStats = {
  totalCheckIns: 2418,
  newCheckIns: 64,
  newCheckInsChange: 12,
  checkInsThisMonth: 96,
  checkInsThisMonthChange: 24,
  returningPatients: 32,
};

const patientFilterOptions: PatientFilterOptions = {
  wards: [
    { id: "general", name: "General ward" },
    { id: "emergency", name: "Emergency ward" },
    { id: "maternity", name: "Maternity ward" },
    { id: "icu", name: "ICU ward" },
    { id: "surgical", name: "Surgical ward" },
  ],
  doctors: [
    { id: "doctor-1", name: "Dr. Ibrahim Sani" },
    { id: "doctor-2", name: "Dr. Raphael Jonnas" },
    { id: "doctor-3", name: "Dr. Sarah Adeyemi" },
    { id: "doctor-4", name: "Dr. Tola Bello" },
  ],
};
const { wards, doctors } = patientFilterOptions;

const patients: PatientVisit["patient"][] = (
  [
    ["Yemi Ojo", "male", 52],
    ["Chioma Nwosu", "female", 48],
    ["Emeka Uche", "male", 52],
    ["Tunde Adeyemi", "male", 29],
    ["Hauwa Garba", "female", 25],
    ["Chidinma Okeke", "female", 32],
    ["Precious Obi", "male", 52],
    ["Victor Udo", "male", 48],
    ["John Ekwueme", "male", 52],
    ["Michael Oluwaseun", "male", 24],
    ["Joyce Sarah", "female", 32],
    ["Ibrahim Musa", "male", 32],
    ["Amina Yusuf", "female", 41],
    ["Kelechi Nnamdi", "male", 37],
    ["Folasade Ojo", "female", 58],
    ["Bisi Akande", "female", 63],
    ["Uche Okafor", "male", 45],
    ["Zainab Bello", "female", 19],
    ["Femi Adebayo", "male", 66],
    ["Ngozi Eze", "female", 35],
    // Chose not to say, so their lines show only HIN and age.
    ["Sola Ogunleye", "prefer_not_to_say", 28],
    ["Halima Abubakar", "female", 44],
    ["Obinna Chukwu", "male", 50],
    ["Ruth Etim", "female", 30],
    // Registered but never seen, so their profile shows its empty states.
    ["Adebayo Johnson", "male", 42],
  ] as const
).map(([name, sex, age], index) => {
  // A birthday a month before today's date, so the age shown stays `age`.
  const birth = new Date(Date.now() - 30 * DAY);
  birth.setFullYear(birth.getFullYear() - age);
  return {
    id: `patient-${index + 1}`,
    name,
    hin: String(541_370_000 + index * 2_791_337),
    dateOfBirth: birth.toISOString().slice(0, 10),
    sex,
    avatarUrl: null,
  };
});

const HOUR = 60 * 60 * 1000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();
const visitTypes = ["appointment", "emergency", "walk_in", "follow_up"] as const;

/** A visit plus the doctor in charge, which only the mock's doctor filter needs. */
type MockVisit = { visit: PatientVisit; doctorId: string };

/** `list[index]`, wrapping round to the start; the lists here are never empty. */
function pick<T>(list: readonly T[], index: number): T {
  const item = list[index % list.length];
  if (item === undefined) throw new Error("pick() needs a non-empty list");
  return item;
}

const doctorName = (index: number) => pick(doctors, index).name;
const doctorId = (index: number) => pick(doctors, index).id;

const visits: MockVisit[] = [
  // Admitted: the first few match the design, the rest are spread over the past few weeks.
  ...[2, 26, 43, 50, 52, 75, ...Array.from({ length: 18 }, (_, i) => 90 + i * 19)].map(
    (hours, index) => ({
      doctorId: doctorId(index),
      visit: {
        id: `admitted-${index + 1}`,
        patient: pick(patients, index),
        status: "admitted" as const,
        ward: pick(wards, index % 3).name,
        bed: String(((index * 7) % 20) + 1),
        admittedBy: doctorName(index),
        admittedAt: hoursAgo(hours),
      },
    }),
  ),
  ...[1, 3, 20, 50, 160, 300, 500, 700].map((hours, index) => ({
    doctorId: doctorId(index + 1),
    visit: {
      id: `checked-in-${index + 1}`,
      patient: pick(patients, 6 + index),
      status: "checked_in" as const,
      visitType: pick(visitTypes, index),
      ward: index % 3 === 2 ? null : pick(wards, index % 2).name,
      bed: index % 3 === 2 ? null : String(13 - index),
      checkedInBy: "Receptionist",
      checkedInAt: hoursAgo(hours),
      waitMinutes: pick([10, 34, 20, 40, 15, 60, 25, 45], index),
    },
  })),
  // [hours since check-out, hours the visit took]
  ...(
    [
      [5, 96],
      [30, 168],
      [80, 24],
      [120, 0.67],
      [200, 144],
      [260, 24],
      [330, 2],
      [400, 72],
      [470, 0.5],
      [560, 120],
      [640, 24],
      [720, 48],
    ] as const
  ).map(([hours, took], index) => ({
    doctorId: doctorId(index + 2),
    visit: {
      id: `checked-out-${index + 1}`,
      patient: pick(patients, 6 + index),
      status: "checked_out" as const,
      visitType: pick(visitTypes, index),
      checkedOutBy: doctorName(index + 2),
      checkedInAt: hoursAgo(hours + took),
      checkedOutAt: hoursAgo(hours),
    },
  })),
  // [ward, hours since discharge, hours the stay took]
  ...(
    [
      ["ICU ward", 70, 107],
      ["General ward", 290, 93],
      ["Emergency ward", 410, 63],
      ["Surgical ward", 580, 219],
    ] as const
  ).map(([ward, hours, took], index) => ({
    doctorId: doctorId(index + 1),
    visit: {
      id: `discharged-${index + 1}`,
      patient: pick(patients, pick([6, 7, 8, 11], index)),
      status: "discharged" as const,
      ward,
      bed: String(pick([5, 13, 11, 4], index)),
      dischargedBy: doctorName(index + 1),
      admittedAt: hoursAgo(hours + took),
      dischargedAt: hoursAgo(hours),
    },
  })),
] satisfies MockVisit[];

/** The date a visit's tab sorts and filters by. */
function visitDate(visit: PatientVisit) {
  switch (visit.status) {
    case "admitted":
      return new Date(visit.admittedAt);
    case "checked_in":
      return new Date(visit.checkedInAt);
    case "checked_out":
      return new Date(visit.checkedOutAt);
    case "discharged":
      return new Date(visit.dischargedAt);
  }
}

function withinDate(date: Date, range: string | null) {
  if (range === "today") return date.toDateString() === new Date().toDateString();
  if (range === "week") return Date.now() - date.getTime() < 7 * DAY;
  if (range === "month") return Date.now() - date.getTime() < 30 * DAY;
  return true;
}

const addresses = [
  "24 Allen Avenue, Ikeja, Lagos",
  "8 Admiralty Way, Lekki, Lagos",
  "15 Herbert Macaulay Way, Yaba, Lagos",
  "3 Awolowo Road, Ikoyi, Lagos",
];
const coverages = ["hmo", "private", "nhis"] as const;

/** A patient's profile, made up from their visits and place in the list so it stays the same. */
function patientDetail(patient: PatientVisit["patient"]) {
  const index = patients.indexOf(patient);
  const theirs = visits.filter(({ visit }) => visit.patient.id === patient.id);
  const checkIns: PatientDetail["visits"] = theirs.map(({ visit, doctorId: doctor }) => ({
    id: `${visit.id}-check-in`,
    kind: "check_in",
    visitType: "visitType" in visit ? visit.visitType : "emergency",
    at:
      visit.status === "admitted" || visit.status === "discharged"
        ? visit.admittedAt
        : visit.checkedInAt,
    seenBy: doctors.find(({ id }) => id === doctor)?.name ?? null,
  }));
  // Every other patient who has been in also booked an appointment beforehand.
  const appointments: PatientDetail["visits"] =
    theirs.length > 0 && index % 2 === 0
      ? [
          {
            id: `appointment-${patient.id}`,
            kind: "appointment",
            visitType: "follow_up",
            at: hoursAgo(400 + index * 30),
            seenBy: doctorName(index),
          },
        ]
      : [];
  const history = [...checkIns, ...appointments].sort((a, b) => b.at.localeCompare(a.at));
  const upcoming = new Date(Date.now() + (2 + (index % 5)) * DAY);
  upcoming.setHours(10, 30, 0, 0);
  const seen = history.length > 0;

  return {
    ...patient,
    coverage: pick(coverages, index),
    phone: `0803${String(4_567_890 + index * 1_111).padStart(7, "0")}`,
    email: `${patient.name.toLowerCase().replace(" ", ".")}@email.com`,
    address: pick(addresses, index),
    assignedDoctor: doctorName(index + 2),
    lastVisitAt: history[0]?.at ?? null,
    lastCheckInAt:
      checkIns
        .map(({ at }) => at)
        .sort()
        .at(-1) ?? null,
    upcomingAppointmentAt: seen && index % 3 !== 1 ? upcoming.toISOString() : null,
    visits: history,
  } satisfies PatientDetail;
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

export const hospitalAdminHandlers = [
  http.get(api("/hospital/profile"), () => HttpResponse.json(profile)),
  http.put(api("/hospital/banner"), async ({ request }) => {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      return HttpResponse.json({ message: "Choose a photo to upload" }, { status: 400 });
    }
    // Lives until the page reloads, like the rest of the mock data.
    profile.bannerUrl = URL.createObjectURL(file);
    return HttpResponse.json(profile);
  }),
  http.delete(api("/hospital/banner"), () => {
    profile.bannerUrl = null;
    return HttpResponse.json(profile);
  }),
  http.get(api("/hospital/dashboard"), () => HttpResponse.json(overview)),
  http.post(api("/hospital/facilities"), async ({ request }) => {
    const { type } = (await request.json()) as { type: FacilityType };
    overview.stats.facilities += 1;
    return HttpResponse.json(
      { id: `facility-${overview.stats.facilities}`, type },
      { status: 201 },
    );
  }),
  http.get(api("/hospital/queue"), ({ request }) => {
    const search = new URL(request.url).searchParams.get("search");
    return HttpResponse.json({
      items: queue.filter((entry) => matches(search, entry.patient.name, entry.patient.hin)),
    } satisfies PatientQueue);
  }),
  http.get(api("/hospital/staff"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 10);
    const filter = params.get("filter") ?? "all";
    const matching = staff.filter(
      (member) =>
        matches(params.get("search"), member.name, member.email) &&
        (filter === "all" || (filter === "admins" ? member.isAdmin : member.status === filter)),
    );
    return HttpResponse.json({
      total: matching.length,
      summary: { staff: staff.length, admins: staff.filter((member) => member.isAdmin).length },
      page,
      pageSize,
      items: matching.slice((page - 1) * pageSize, page * pageSize),
    } satisfies StaffList);
  }),
  http.post(api("/hospital/staff"), async ({ request }) => {
    const body = (await request.json()) as Pick<
      StaffList["items"][number],
      "phone" | "role" | "isAdmin" | "email"
    > & { firstName: string; lastName: string };
    const member: StaffList["items"][number] = {
      id: `staff-${staff.length + 1}`,
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      role: body.role,
      avatarUrl: null,
      addedAt: new Date().toISOString(),
      status: "on_team",
      sex: null,
      isAdmin: body.isAdmin,
    };
    staff.unshift(member);
    overview.stats.totalStaff += 1;
    overview.stats.addedThisMonth += 1;
    return HttpResponse.json(member, { status: 201 });
  }),
  http.get(api("/hospital/patients/stats"), ({ request }) => {
    const period = new URL(request.url).searchParams.get("period");
    const scale = periodScale[period === "today" || period === "week" ? period : "month"];
    const scaled = (n: number) => Math.round(n * scale);
    return HttpResponse.json({
      ...patientStats,
      newCheckIns: scaled(patientStats.newCheckIns),
      newCheckInsChange: scaled(patientStats.newCheckInsChange),
      returningPatients: scaled(patientStats.returningPatients),
    } satisfies PatientStats);
  }),
  http.get(api("/hospital/patients/filter-options"), () => HttpResponse.json(patientFilterOptions)),
  http.get(api("/hospital/patients"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const tab = (params.get("tab") ?? "admitted") as PatientTab;
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 6);
    const ward = wards.find(({ id }) => id === params.get("ward"))?.name;
    const doctor = params.get("doctor") ?? "all";
    const visitType = params.get("visitType") ?? "all";
    const sort = params.get("sort");

    const matching = visits
      .filter(
        ({ visit, doctorId }) =>
          visit.status === tab &&
          matches(params.get("search"), visit.patient.name, visit.patient.hin) &&
          (!ward || ("ward" in visit && visit.ward === ward)) &&
          (doctor === "all" || doctorId === doctor) &&
          (visitType === "all" || ("visitType" in visit && visit.visitType === visitType)) &&
          withinDate(visitDate(visit), params.get("date")),
      )
      .map(({ visit }) => visit)
      .sort((a, b) =>
        sort === "name"
          ? a.patient.name.localeCompare(b.patient.name)
          : (visitDate(b).getTime() - visitDate(a).getTime()) * (sort === "oldest" ? -1 : 1),
      );
    const count = (status: PatientTab) =>
      visits.filter(({ visit }) => visit.status === status).length;

    return HttpResponse.json({
      total: matching.length,
      counts: {
        admitted: count("admitted"),
        checked_in: count("checked_in"),
        checked_out: count("checked_out"),
        discharged: count("discharged"),
      },
      page,
      pageSize,
      items: matching.slice((page - 1) * pageSize, page * pageSize),
    } satisfies PatientList);
  }),
  http.get(api("/hospital/patients/:id"), ({ params }) => {
    const patient = patients.find(({ id }) => id === params.id);
    if (!patient) return HttpResponse.json({ message: "Patient not found" }, { status: 404 });
    return HttpResponse.json(patientDetail(patient));
  }),
  http.get(api("/hospital/staff/:id"), ({ params, request }) => {
    const member = staff.find(({ id }) => id === params.id);
    if (!member) return HttpResponse.json({ message: "Staff member not found" }, { status: 404 });
    const period = new URL(request.url).searchParams.get("period");
    return HttpResponse.json(
      staffDetail(member, period === "today" || period === "week" ? period : "month"),
    );
  }),
  http.patch(api("/hospital/staff/:id"), async ({ params, request }) => {
    const member = staff.find(({ id }) => id === params.id);
    if (!member) return HttpResponse.json({ message: "Staff member not found" }, { status: 404 });
    Object.assign(member, (await request.json()) as StaffMemberChange);
    return HttpResponse.json(member);
  }),
];

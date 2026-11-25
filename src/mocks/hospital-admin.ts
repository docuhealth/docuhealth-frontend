import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { readMultipart } from "@/mocks/multipart";
import { colleagues, hospitalTheme } from "@/mocks/staff";

// The hospital admin's endpoints, faked with the real API's paths and shapes (as staging returns
// them, or as docs/backend-handoff-2026-11-25-dashboards.md shows them). The team lives in the
// staff mock, check-ins (`?status=outpatient` and `/patients-check-ins`) in the receptionist's,
// and patients' visits and guardians in the patient records mock.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const DAY = 24 * 60 * 60_000;
const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

/** `list[index]`, wrapping round to the start; the lists here are never empty. */
function pick<T>(list: readonly T[], index: number): T {
  const item = list[index % list.length];
  if (item === undefined) throw new Error("pick() needs a non-empty list");
  return item;
}

type MockBed = { sqid: string; bed_number: number; status: "available" | "occupied" | "requested" };
type MockWard = { sqid: string; name: string; beds: MockBed[] };

/** `count` beds for a ward, the first `taken` of them occupied. */
const bedsFor = (ward: string, count: number, taken = 0): MockBed[] =>
  Array.from({ length: count }, (_, index) => ({
    sqid: `${ward}-bed-${index + 1}`,
    bed_number: index + 1,
    status: index < taken ? "occupied" : "available",
  }));

const wards: MockWard[] = (
  [
    ["general", "General ward", 20, 6],
    ["emergency", "Emergency ward", 12, 11],
    ["maternity", "Maternity ward", 16, 3],
    ["icu", "ICU ward", 8, 8],
    // No one in it, so it can be deleted.
    ["surgical", "Surgical ward", 14, 0],
  ] as const
).map(([sqid, name, count, taken]) => ({ sqid, name, beds: bedsFor(sqid, count, taken) }));

/** `Ward`, as the API returns it. */
const readWard = (ward: MockWard) => ({
  sqid: ward.sqid,
  name: ward.name,
  total_beds: ward.beds.length,
  available_beds: ward.beds.filter((bed) => bed.status === "available").length,
  beds: ward.beds,
});

/** Someone named on a record (`*_by_info`). */
const person = (sqid: string, firstname: string, lastname: string, role: string) => ({
  sqid,
  firstname,
  lastname,
  role,
  specialization: null,
});
const doctors = [
  person("staff-1", "Raphael", "Jonnas", "doctor"),
  person("staff-2", "Sarah", "Adeyemi", "doctor"),
  person("staff-10", "Grace", "Effiong", "doctor"),
];
const receptionist = person("y4vRDgE", "Kemi", "Adewale", "receptionist");

/** `patient_info`, as the API returns it. */
const adults = (
  [
    ["Yemi", "Ojo", "male", 52, "hmo"],
    ["Chioma", "Nwosu", "female", 48, "private"],
    ["Emeka", "Uche", "male", 52, "company"],
    ["Tunde", "Adeyemi", "male", 29, "private"],
    ["Hauwa", "Garba", "female", 25, "hmo"],
    ["Chidinma", "Okeke", "female", 32, "private"],
    ["Precious", "Obi", "male", 52, "private"],
    ["Victor", "Udo", "male", 48, "hmo"],
    ["John", "Ekwueme", "male", 52, "private"],
    ["Michael", "Oluwaseun", "male", 24, "private"],
    ["Joyce", "Sarah", "female", 32, "hmo"],
    // Chose not to say, so their lines show only HIN and age.
    ["Sola", "Ogunleye", "unknown", 28, "private"],
  ] as const
).map(([firstname, lastname, gender, age, coverage], index) => {
  // A birthday a month before today's date, so the age shown stays `age`.
  const birth = new Date(Date.now() - 30 * DAY);
  birth.setFullYear(birth.getFullYear() - age);
  return {
    dob: birth.toISOString().slice(0, 10),
    gender,
    phone_num: `0803${String(4_567_890 + index * 1_111).padStart(7, "0")}`,
    firstname,
    lastname,
    middlename: null,
    hin: String(5_413_700_000_000 + index * 2_791_337),
    street: "24 Allen Avenue",
    city: "Ikeja",
    state: "Lagos",
    country: "Nigeria",
    email: `${firstname}.${lastname}@email.com`.toLowerCase(),
    contact_email: null,
    payment_provider: { type: coverage, provider: null, member_id: null, updated_at: null },
  };
});

/** `patient_info`; a dependant's has no `email` key. */
type MockPatientInfo = {
  dob: string;
  gender: string;
  phone_num: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  hin: string;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  email?: string;
  contact_email: string | null;
  payment_provider: { type: string; provider: null; member_id: null; updated_at: string | null };
};

/** `dob` for someone `age` years old, with a birthday a month ago so the age shown stays `age`. */
function bornYearsAgo(age: number) {
  const birth = new Date(Date.now() - 30 * DAY);
  birth.setFullYear(birth.getFullYear() - age);
  return birth.toISOString().slice(0, 10);
}

/**
 * Every patient on record: the adults, then Yemi Ojo's son, a dependant. A dependant has no login,
 * so their `patient_info` has no `email` key at all.
 */
export const patients: MockPatientInfo[] = [
  ...adults,
  {
    dob: bornYearsAgo(8),
    gender: "male",
    phone_num: "",
    firstname: "Tobi",
    lastname: "Ojo",
    middlename: null,
    hin: "7894623012343",
    street: null,
    city: null,
    state: null,
    country: null,
    contact_email: null,
    payment_provider: { type: "private", provider: null, member_id: null, updated_at: null },
  },
];

const wardInfo = (index: number) => {
  const ward = pick(wards, index);
  return { sqid: ward.sqid, name: ward.name };
};
const bedInfo = (index: number, status: string) => ({
  bed_number: ((index * 7) % 12) + 1,
  status,
  sqid: `bed-${index + 1}`,
});

/** A nurse's latest vitals for `patient`, as admissions and open check-ins carry them. */
const vitals = (at: string, patient: MockPatientInfo) => ({
  sqid: `vitals-${patient.hin}`,
  created_at: at,
  blood_pressure: "120/80",
  temp: 36.8,
  resp_rate: 16,
  heart_rate: 88,
  height: null,
  weight: null,
  spo2: 98,
  pain_score: null,
  notes: null,
  bmi: null,
  patient_info: { ...patient, payment_provider: null },
  staff_info: person("staff-3", "Heritech", "Riel", "nurse"),
  hospital_info: { name: hospitalTheme.name, email: null, sqid: "pm9XGQd" },
});
const paracetamol = {
  name: "Paracetamol",
  route: "Oral",
  quantity: 10,
  frequency: "bd",
  duration: { value: 5, rate: "days" },
  allergies: [],
  unit: null,
};

/** Rows of each list, latest first, as `GET /api/hospital-ops/patients?status=…` returns them. */
const rows: Record<string, Record<string, unknown>[]> = {
  inpatient: [2, 26, 43, 50, 75, 120, 200, 260].map((hours, index) => ({
    sqid: `admission-${index + 1}`,
    status: "active",
    patient_info: pick(patients, index),
    requested_by_info: pick(doctors, index),
    ward_info: wardInfo(index % 3),
    bed_info: bedInfo(index, "occupied"),
    processed_by_info: receptionist,
    created_at: hoursAgo(hours),
    discharge_date: null,
    latest_vitals: index % 3 === 2 ? null : vitals(hoursAgo(hours / 2), pick(patients, index)),
    ongoing_medications: index % 2 === 0 ? [paracetamol] : [],
    admission_note_info: null,
  })),
  outpatient_discharge: [
    ...[5, 30, 80, 120, 200, 330, 470].map((hours, index) => ({
      sqid: `check-in-closed-${index + 1}`,
      patient_info: pick(patients, 4 + index),
      closed_by_info: pick(doctors, index + 1),
      closed_at: hoursAgo(hours),
    })),
    // A dependant's check-in, closed by the overnight job rather than a person.
    {
      sqid: "check-in-closed-8",
      patient_info: pick(patients, 12),
      closed_by_info: null,
      closed_at: hoursAgo(520),
    },
  ],
  inpatient_discharge: (
    [
      [70, 107],
      [290, 93],
      [410, 63],
    ] as const
  ).map(([hours, took], index) => ({
    sqid: `discharge-${index + 1}`,
    patient_info: pick(patients, 6 + index),
    status: "discharged",
    created_at: hoursAgo(hours + took),
    discharged_by_info: pick(doctors, index),
    discharge_date: hoursAgo(hours),
    ward_info: wardInfo(index + 2),
    bed_info: bedInfo(index + 3, "available"),
    doctor_discharge_form: {
      sqid: `discharge-form-${index + 1}`,
      primary_diagnosis: "Malaria",
      secondary_diagnosis: null,
      comorbidities: null,
      hospital_course_note: "Treated with antimalarials",
      chief_complaint: "Fever",
      treatment_plan: "Rest",
      care_instructions: "Review in a week",
      condition_at_discharge: "stable",
      follow_up_clinic: "General Medicine",
      follow_up_date: null,
      follow_up_time: null,
      follow_up_instructions: "Return if fever recurs",
      pending_investigations: [],
      completed_investigations: [],
      discharged_by_info: pick(doctors, index),
      created_at: hoursAgo(hours),
    },
    nurse_discharge_form: null,
  })),
};

function page<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams;
  const pageNumber = Number(params.get("page") ?? 1);
  const size = Number(params.get("size") ?? 10);
  return {
    count: items.length,
    next: pageNumber * size < items.length ? `${request.url}&page=${pageNumber + 1}` : null,
    previous: null,
    results: items.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

/**
 * When the current `period` (`day`, `week` from Monday, or `month`) began, in UTC as the API
 * counts it; `undefined` for all time (or a period the API doesn't know).
 */
function periodStart(period: string | null) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  if (period === "day") return start;
  if (period === "week") {
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
    return start;
  }
  if (period === "month") {
    start.setUTCDate(1);
    return start;
  }
  return undefined;
}

/** Each list's `period` filters on its own date. */
const periodField: Record<string, string> = {
  inpatient: "created_at",
  outpatient_discharge: "closed_at",
  inpatient_discharge: "discharge_date",
};

/** Figures for `period` (`none` for all time, when there's no change to report). */
type ByPeriod<T> = Record<"day" | "week" | "month" | "none", T>;
const byPeriod = <T>(figures: ByPeriod<T>, period: string | null): T =>
  figures[period === "day" || period === "week" || period === "month" ? period : "none"];

/** `GET /api/hospital-ops/patient-management/metrics`. */
const checkInMetrics: ByPeriod<object> = {
  day: {
    total_checkins: 1_284,
    new_checkins: { count: 6, change: 2 },
    checkins_this_period: { count: 18, change: -3 },
    returning_patients: 11,
  },
  week: {
    total_checkins: 1_284,
    new_checkins: { count: 31, change: 12 },
    checkins_this_period: { count: 96, change: 14 },
    returning_patients: 58,
  },
  month: {
    total_checkins: 1_284,
    new_checkins: { count: 120, change: -8 },
    checkins_this_period: { count: 412, change: 37 },
    returning_patients: 236,
  },
  none: {
    total_checkins: 1_284,
    new_checkins: { count: 702, change: null },
    checkins_this_period: { count: 1_284, change: null },
    returning_patients: 389,
  },
};

/** Staff added in each timeframe, and the change on the one before. */
const staffAdded: ByPeriod<{ count: number; change: number | null } | null> = {
  day: { count: 0, change: -1 },
  week: { count: 2, change: 1 },
  month: { count: 4, change: 2 },
  // All time: `count` is the whole team.
  none: null,
};

/** The signed-in admin's own account, who added most of the team. */
const admin = {
  firstname: "Folake",
  lastname: "Adeyemi",
  email: "folake.adeyemi@luth.example.com",
};

/** The team on the API's `staff/{sqid}` endpoint: activity in `period`, and who added them. */
function staffDetail(member: (typeof colleagues)[number], index: number, period: string | null) {
  const scale = byPeriod({ day: 1, week: 4, month: 12, none: 40 }, period);
  const clinical = member.role === "doctor" || member.role === "nurse";
  return {
    total_patients_seen: clinical ? scale * (2 + (index % 3)) : 0,
    appointments_completed: member.role === "doctor" ? scale * (1 + (index % 2)) : 0,
    follow_ups_requested: member.role === "doctor" ? Math.ceil(scale / 2) : 0,
    staff_info: {
      sqid: member.sqid,
      firstname: member.firstname,
      lastname: member.lastname,
      role: member.role,
      gender: member.gender,
      joined_at: new Date(Date.now() - (30 + index * 23) * DAY).toISOString(),
      email: member.email,
      // The first was added before this was recorded; one by a DH admin, who has no name.
      added_by_info:
        index === 0
          ? null
          : index === 4
            ? { firstname: null, lastname: null, email: "support@docuhealth.example.com" }
            : admin,
    },
  };
}

const required = (...fields: string[]) =>
  Object.fromEntries(fields.map((field) => [field, ["This field is required."]]));

/** Staff ids sent to remove or reactivate. */
async function staffIds(request: Request) {
  const { staff_ids } = (await request.json()) as { staff_ids?: string[] };
  return staff_ids ?? [];
}

const plan = (sqid: string, name: string, price: number, interval: string, code: string) => ({
  id: sqid === "plan-monthly" ? 2 : 1,
  sqid,
  name,
  price,
  interval,
  description: `The ${interval} plan, with everything a hospital needs to get started.`,
  features: ["Unlimited staff", "Patient records and admissions", "Lab and radiology"],
  paystack_plan_code: code,
  role: "hospital",
  created_at: "2026-06-02T03:27:43.518050Z",
  updated_at: "2026-06-02T03:37:58.107261Z",
});
const plans = [
  plan("plan-monthly", "Monthly Plan", 10_000, "monthly", "PLN_monthly"),
  plan("plan-annual", "Annual Plan", 117_000, "annually", "PLN_annual"),
];

/** The hospital's subscription; none (the free plan) until one is paid for. */
let subscription: { plan_name: string; status: string } | null = null;

export const hospitalAdminHandlers = [
  // Open check-ins are the front desk's queue; the receptionist's mock answers those.
  http.get(api("/api/hospital-ops/patients"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get("status") ?? "";
    const list = rows[status];
    if (!list) return undefined;
    const since = periodStart(params.get("period"));
    const matching = list.filter((row) => {
      const info = row.patient_info as (typeof patients)[number];
      const at = row[periodField[status] ?? ""];
      return (
        matches(params.get("search"), `${info.firstname} ${info.lastname}`, info.hin) &&
        (!since || (typeof at === "string" && new Date(at) >= since))
      );
    });
    return HttpResponse.json(page(matching, request));
  }),
  http.get(api("/api/hospital-ops/patient-management/metrics"), ({ request }) =>
    HttpResponse.json(byPeriod(checkInMetrics, new URL(request.url).searchParams.get("period"))),
  ),
  http.get(api("/api/hospital-ops/administration-metrics"), ({ request }) => {
    // The team plus the signed-in admin.
    const totalStaff = colleagues.filter((member) => member.is_active).length + 1;
    const added = byPeriod(staffAdded, new URL(request.url).searchParams.get("timeframe"));
    return HttpResponse.json({
      total_staff: totalStaff,
      added_this_duration: added ?? { count: totalStaff, change: null },
      administrators: 1,
      // The hospital, and its lab, pharmacy and radiology unit.
      total_facilities: 4,
    });
  }),
  // Active staff per role, sorted by role, leaving out roles no one holds.
  http.get(api("/api/hospital-ops/staff-role-counts"), () => {
    const counts = new Map<string, number>([["doctor", 1]]); // The signed-in admin is a doctor.
    for (const member of colleagues) {
      if (member.is_active) counts.set(member.role, (counts.get(member.role) ?? 0) + 1);
    }
    return HttpResponse.json(
      [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([role, count]) => ({ role, count })),
    );
  }),
  http.get(api("/api/hospital-ops/staff/:sqid"), ({ params, request }) => {
    const index = colleagues.findIndex(({ sqid }) => sqid === params.sqid);
    const member = colleagues[index];
    if (!member) {
      return HttpResponse.json(
        { detail: "No StaffMembership matches the given query." },
        { status: 404 },
      );
    }
    return HttpResponse.json(
      staffDetail(member, index, new URL(request.url).searchParams.get("period")),
    );
  }),
  http.get(api("/api/patients/:hin/info"), ({ params }) => {
    const patient = patients.find(({ hin }) => hin === params.hin);
    if (!patient) {
      return HttpResponse.json(
        { detail: "No PatientProfile matches the given query." },
        { status: 404 },
      );
    }
    return HttpResponse.json({ patient_info: patient, latest_vitals: null, ongoing_drugs: [] });
  }),
  http.get(api("/api/hospital-ops/wards/manage"), ({ request }) =>
    HttpResponse.json(page(wards.map(readWard), request)),
  ),
  http.post(api("/api/hospital-ops/wards/manage"), async ({ request }) => {
    const { name, total_beds } = (await request.json()) as { name?: string; total_beds?: number };
    if (!name?.trim()) return HttpResponse.json(required("name"), { status: 400 });
    const sqid = `ward-${wards.length + 1}`;
    const ward = { sqid, name, beds: bedsFor(sqid, Number(total_beds ?? 0)) };
    wards.push(ward);
    return HttpResponse.json(readWard(ward), { status: 201 });
  }),
  http.patch(api("/api/hospital-ops/wards/manage/:sqid"), async ({ params, request }) => {
    const ward = wards.find(({ sqid }) => sqid === params.sqid);
    if (!ward) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    const { name, total_beds } = (await request.json()) as { name?: string; total_beds?: number };
    const taken = ward.beds.filter((bed) => bed.status !== "available").length;
    if (total_beds !== undefined && total_beds < taken) {
      return HttpResponse.json(
        { total_beds: [`Cannot be less than the ${taken} beds in use.`] },
        { status: 400 },
      );
    }
    if (name) ward.name = name;
    if (total_beds !== undefined) {
      const kept = ward.beds.filter((bed) => bed.status !== "available");
      const free = bedsFor(ward.sqid, total_beds)
        .slice(kept.length)
        .map((bed, index) => ({
          ...bed,
          bed_number: kept.length + index + 1,
        }));
      ward.beds = [...kept, ...free];
    }
    return HttpResponse.json(readWard(ward));
  }),
  http.delete(api("/api/hospital-ops/wards/manage/:sqid"), ({ params }) => {
    const index = wards.findIndex(({ sqid }) => sqid === params.sqid);
    const ward = wards[index];
    if (!ward) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    if (ward.beds.some((bed) => bed.status !== "available")) {
      return HttpResponse.json(
        { ward: ["A ward with occupied or requested beds can't be deleted."] },
        { status: 400 },
      );
    }
    wards.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(api("/api/hospital-ops/wards/:sqid/beds"), ({ params }) => {
    const ward = wards.find(({ sqid }) => sqid === params.sqid);
    if (!ward) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    return HttpResponse.json(ward.beds);
  }),
  http.get(api("/api/auth/facility"), () =>
    HttpResponse.json({
      id: "pm9XGQd",
      email: "admin@luth.example.com",
      hospital_profile: { name: hospitalTheme.name, subscription, theme: hospitalTheme },
    }),
  ),
  http.get(api("/api/payments/plans/role/:role"), ({ params }) =>
    HttpResponse.json(params.role === "hospital" ? plans : []),
  ),
  http.post(api("/api/payments/subscribe"), async ({ request }) => {
    const body = (await request.json()) as { plan?: string };
    const chosen = plans.find(({ paystack_plan_code }) => paystack_plan_code === body.plan);
    if (!chosen) return HttpResponse.json({ plan: ["Invalid plan."] }, { status: 400 });
    // Paystack would take the payment; here it goes straight through.
    subscription = { plan_name: chosen.name, status: "active" };
    return HttpResponse.json(
      {
        sqid: "sub-1",
        plan: body.plan,
        status: "pending",
        authorization_url: "https://checkout.paystack.com/mock",
      },
      { status: 201 },
    );
  }),
  http.patch(api("/api/auth/facility/branding"), async ({ request }) => {
    // In the browser the photo itself shows; under jsdom (tests) only its name can be read.
    const photo = await request
      .clone()
      .formData()
      .then((form) => form.get("bg_image"))
      .catch(() => null);
    const [name] = (await readMultipart(request)).fileNames("bg_image");
    if (!name) {
      return HttpResponse.json({ bg_image: ["No file was submitted."] }, { status: 400 });
    }
    // Lives until the page reloads, like the rest of the mock data.
    hospitalTheme.bg_image =
      photo instanceof File ? URL.createObjectURL(photo) : `https://example.com/banners/${name}`;
    return HttpResponse.json({ name: hospitalTheme.name, bg_image: hospitalTheme.bg_image });
  }),
  http.post(api("/api/auth/facility/branding/remove"), async ({ request }) => {
    const { fields } = (await request.json()) as { fields: string[] };
    if (fields.includes("bg_image")) hospitalTheme.bg_image = null;
    return HttpResponse.json({ fields });
  }),
  // As the API does: an arm needs a name and an address, which the design's dialog doesn't ask for.
  http.post(api("/api/auth/facility/arms"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = ["name", "street", "city", "state", "country"].filter((field) => !body[field]);
    if (missing.length > 0) return HttpResponse.json(required(...missing), { status: 400 });
    return HttpResponse.json(
      { sqid: "arm-1", type: body.facility_type, name: body.name, status: "active" },
      { status: 201 },
    );
  }),
  http.post(api("/api/auth/staff/create"), async ({ request }) => {
    const { email, profile } = (await request.json()) as {
      email: string;
      profile: { firstname: string; lastname: string; phone_num?: string; role: string };
    };
    if (colleagues.some((member) => member.email === email)) {
      return HttpResponse.json(
        { email: ["A staff member with this email already exists."] },
        { status: 400 },
      );
    }
    colleagues.unshift({
      sqid: `staff-${colleagues.length + 1}`,
      firstname: profile.firstname,
      lastname: profile.lastname,
      phone_num: profile.phone_num ?? "",
      role: profile.role,
      email,
      gender: "unknown",
      is_active: true,
    });
    return HttpResponse.json({ email, profile }, { status: 201 });
  }),
  http.post(api("/api/auth/staff/remove"), async ({ request }) => {
    const ids = await staffIds(request);
    for (const member of colleagues) if (ids.includes(member.sqid)) member.is_active = false;
    return HttpResponse.json({ staff_ids: ids });
  }),
  http.post(api("/api/auth/staff/reactivate"), async ({ request }) => {
    const ids = await staffIds(request);
    for (const member of colleagues) if (ids.includes(member.sqid)) member.is_active = true;
    return HttpResponse.json({ staff_ids: ids });
  }),
];

import { HttpResponse, http } from "msw";
import { env } from "@/env";

// The pages every staff dashboard shares, faked with the real API's paths and shapes (as staging
// returns them, snake_case and all), so the app's schemas are exercised against the real format.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const hospital = {
  name: "Lagos University Teaching Hospital",
  email: "admin@luth.example.com",
  sqid: "pm9XGQd",
};

/** The hospital's look, which the admin can change; every dashboard's profile shows it. */
export const hospitalTheme = {
  theme_color: null,
  profile_image: null as string | null,
  bg_image: null as string | null,
  name: hospital.name,
};

/**
 * Who's signed in, per dashboard. In the browser the request's referrer says which dashboard is
 * asking; in tests there's none, so it's the receptionist.
 */
const people = {
  receptionist: ["y4vRDgE", "Kemi", "Adewale", "receptionist", "female"],
  radiologist: ["o4AjeJt", "Emeka", "Obi", "radiologist", "male"],
  "lab-scientist": ["h9b7ulb", "Emeka", "Obi", "lab_scientist", "male"],
  admin: ["t1sDDoW", "Folake", "Adeyemi", "doctor", "female"],
} as const;
type Dashboard = keyof typeof people;

const accounts = Object.fromEntries(
  Object.entries(people).map(([dashboard, [sqid, firstname, lastname, role, gender]]) => [
    dashboard,
    {
      sqid,
      firstname,
      lastname,
      phone_num: "09000000090",
      role,
      email: `${firstname}.${lastname}@luth.example.com`.toLowerCase(),
      gender,
      is_active: true,
    },
  ]),
) as Record<Dashboard, StaffAccount>;

type StaffAccount = {
  sqid: string;
  firstname: string;
  lastname: string;
  phone_num: string;
  role: string;
  email: string;
  gender: string;
  is_active: boolean;
};

function accountFor(request: Request): StaffAccount {
  const match = /\/(radiologist|lab-scientist|admin|receptionist)(?:[/?#]|$)/.exec(
    request.referrer ? new URL(request.referrer).pathname : "",
  );
  return accounts[(match?.[1] as Dashboard | undefined) ?? "receptionist"];
}

/** `GET /api/auth/staff/profile` as the API returns it. */
function profileOf(account: StaffAccount) {
  return { staff_info: account, hospital_info: hospital, hospital_theme: hospitalTheme };
}

const colleagues = (
  [
    ["Raphael", "Jonnas", "doctor", "male", true],
    ["Sarah", "Adeyemi", "doctor", "female", true],
    ["Heritech", "Riel", "nurse", "female", true],
    ["Ibrahim", "Sani", "nurse", "male", true],
    ["Tola", "Bello", "lab_scientist", "female", true],
    ["Emeka", "Obi", "radiologist", "male", true],
    ["Fola", "Tola", "radiographer", "male", false],
    ["Amaka", "Eze", "pharmacist", "female", true],
    ["Chidi", "Okafor", "nurse", "male", true],
    ["Grace", "Effiong", "doctor", "female", true],
    ["Yemi", "Ojo", "lab_scientist", "male", true],
  ] as const
).map(([firstname, lastname, role, gender, isActive], index) => ({
  sqid: `staff-${index + 1}`,
  firstname,
  lastname,
  phone_num: `0803${String(1_000_000 + index * 137).padStart(7, "0")}`,
  role,
  email: `${firstname}.${lastname}@luth.example.com`.toLowerCase(),
  gender,
  is_active: isActive,
}));

const DAY = 24 * 60 * 60_000;

/** `days` from today at `time` ("09:30"), as an ISO string. */
function at(days: number, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const appointments = (
  [
    [0, "10:00", "Daniel", "Martins", "consultation", "confirmed"],
    [0, "11:30", "Blessing", "Okoi", "follow_up", "pending"],
    [0, "08:00", "Ibrahim", "Lawal", "consultation", "completed"],
    [1, "09:00", "Olumide", "Ajayi", "consultation", "pending"],
    [3, "14:00", "Fatima", "Bello", "review", "confirmed"],
    [-1, "10:00", "Chinonso", "Okafor", "consultation", "completed"],
    [-4, "12:00", "Amina", "Yusuf", "follow_up", "cancelled"],
  ] as const
).map(([days, time, firstname, lastname, type, status], index) => ({
  id: 300 + index,
  sqid: `appointment-${index + 1}`,
  status,
  scheduled_time: at(days, time),
  staff: { sqid: "staff-1", firstname: "Raphael", lastname: "Jonnas", role: "doctor" },
  patient: {
    firstname,
    lastname,
    middlename: null,
    hin: String(3_379_185_230_273 + index * 9_117),
    phone_num: `+23480${String(12_345_678 + index).slice(0, 8)}`,
  },
  last_visited: null,
  note: null,
  type,
  hospital_info: hospital,
  closed_at: status === "completed" ? at(days, "13:00") : null,
  closed_by_info: null as null | {
    sqid: string;
    firstname: string;
    lastname: string;
    role: string;
  },
}));

function page<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams;
  const pageNumber = Number(params.get("page") ?? 1);
  const size = Number(params.get("size") ?? 10);
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

function inTimeframe(scheduled: string, timeframe: string | null) {
  const day = new Date(scheduled).toDateString();
  const today = new Date().toDateString();
  if (timeframe === "today") return day === today;
  if (timeframe === "upcoming") return new Date(scheduled) > new Date() && day !== today;
  return new Date(scheduled) < new Date() && day !== today;
}

function listAppointments({ request }: { request: Request }) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.toLowerCase() ?? "";
  const from = params.get("scheduled_time_gte");
  const to = params.get("scheduled_time_lte");
  const matching = appointments.filter(
    (appointment) =>
      inTimeframe(appointment.scheduled_time, params.get("timeframe")) &&
      (!search ||
        `${appointment.patient.firstname} ${appointment.patient.lastname} ${appointment.patient.hin}`
          .toLowerCase()
          .includes(search)) &&
      (!from || appointment.scheduled_time >= from) &&
      (!to || appointment.scheduled_time <= to),
  );
  return HttpResponse.json(page(matching, request));
}

/** Codes the mock always rejects, to try the error path. */
const WRONG_CODE = "000000";

export const staffHandlers = [
  http.get(api("/api/auth/staff/profile"), ({ request }) =>
    HttpResponse.json(profileOf(accountFor(request))),
  ),
  http.patch(api("/api/auth/staff/profile/update"), async ({ request }) => {
    const me = accountFor(request);
    const body = (await request.json()) as Partial<StaffAccount>;
    Object.assign(me, {
      firstname: body.firstname ?? me.firstname,
      lastname: body.lastname ?? me.lastname,
      phone_num: body.phone_num ?? me.phone_num,
    });
    return HttpResponse.json(body);
  }),
  http.post(api("/api/auth/email/send-otp"), async ({ request }) => {
    const { new_email } = (await request.json()) as { new_email: string };
    pendingEmail = new_email;
    return HttpResponse.json({ new_email });
  }),
  http.patch(api("/api/auth/email/verify-otp"), async ({ request }) => {
    const me = accountFor(request);
    const { otp } = (await request.json()) as { otp: string };
    if (otp === WRONG_CODE || !pendingEmail) {
      return HttpResponse.json({ detail: "Invalid OTP", status: "error" }, { status: 400 });
    }
    me.email = pendingEmail;
    pendingEmail = null;
    return HttpResponse.json({ otp });
  }),
  http.patch(api("/api/auth/password"), async ({ request }) => {
    const { old_password } = (await request.json()) as { old_password: string };
    if (old_password === "wrong-password") {
      return HttpResponse.json({ old_password: ["Wrong password."] }, { status: 400 });
    }
    return HttpResponse.json({ detail: "Password updated." });
  }),
  http.get(api("/api/auth/staff"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const search = params.get("search")?.toLowerCase() ?? "";
    const role = params.get("role");
    const matching = [accountFor(request), ...colleagues].filter(
      (member) =>
        (!role || member.role === role) &&
        (!search ||
          `${member.firstname} ${member.lastname} ${member.email}`.toLowerCase().includes(search)),
    );
    return HttpResponse.json(page(matching, request));
  }),
  http.get(api("/api/hospital-ops/appointments/staff"), listAppointments),
  http.get(api("/api/hospital-ops/appointments"), listAppointments),
  http.post(api("/api/hospital-ops/appointments/book"), async ({ request }) => {
    const body = (await request.json()) as {
      patient: string;
      staff: string;
      type?: string | null;
      note?: string | null;
      scheduled_time: string;
    };
    if (!body.patient || !body.staff || !body.scheduled_time) {
      return HttpResponse.json(
        { detail: "patient, staff and scheduled_time are required." },
        { status: 400 },
      );
    }
    const me = accountFor(request);
    appointments.push({
      id: 300 + appointments.length,
      sqid: `appointment-${appointments.length + 1}`,
      status: "pending",
      scheduled_time: body.scheduled_time,
      staff: { sqid: me.sqid, firstname: me.firstname, lastname: me.lastname, role: me.role },
      patient: {
        firstname: "Booked",
        lastname: "Patient",
        middlename: null,
        hin: body.patient,
        phone_num: null,
      },
      last_visited: null,
      note: body.note ?? null,
      type: body.type ?? null,
      hospital_info: hospital,
      closed_at: null,
      closed_by_info: null,
    } as unknown as (typeof appointments)[number]);
    return HttpResponse.json(
      {
        patient: body.patient,
        staff: body.staff,
        type: body.type,
        note: body.note,
        scheduled_time: body.scheduled_time,
      },
      { status: 201 },
    );
  }),
  http.post(api("/api/hospital-ops/appointments/:sqid/close"), ({ params, request }) => {
    const me = accountFor(request);
    const appointment = appointments.find(({ sqid }) => sqid === params.sqid);
    if (!appointment) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    Object.assign(appointment, {
      status: "completed",
      closed_at: new Date().toISOString(),
      closed_by_info: {
        sqid: me.sqid,
        firstname: me.firstname,
        lastname: me.lastname,
        role: me.role,
      },
    });
    return HttpResponse.json({ detail: "Appointment closed." });
  }),
];

let pendingEmail: string | null = null;

/** The profile the dashboard behind `request` gets, e.g. after the hospital's look changes. */
export function staffProfileResponse(request: Request) {
  return profileOf(accountFor(request));
}

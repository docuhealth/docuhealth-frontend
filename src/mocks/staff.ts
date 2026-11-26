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
  pharmacy: ["9mPhRm1", "Amaka", "Eze", "pharmacist", "female"],
  doctor: ["staff-1", "Raphael", "Jonnas", "doctor", "male"],
  nurse: ["staff-3", "Heritech", "Riel", "nurse", "female"],
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

/** The dashboard the request comes from, if its referrer says. */
function dashboardOf(request: Request) {
  const match =
    /\/(radiologist|lab-scientist|admin|receptionist|pharmacy|doctor|nurse)(?:[/?#]|$)/.exec(
      request.referrer ? new URL(request.referrer).pathname : "",
    );
  return match?.[1] as Dashboard | undefined;
}

function accountFor(request: Request): StaffAccount {
  return accounts[dashboardOf(request) ?? "receptionist"];
}

/** `GET /api/auth/staff/profile` as the API returns it. */
function profileOf(account: StaffAccount) {
  return { staff_info: account, hospital_info: hospital, hospital_theme: hospitalTheme };
}

/** The hospital's team (besides whoever is signed in), which the admin can add to and remove from. */
export const colleagues: StaffAccount[] = (
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
    // An older booking with no staff member: closing it is the API's 500.
    [2, "09:30", "Grace", "Okon", "consultation", "confirmed"],
  ] as const
).map(([days, time, firstname, lastname, type, status], index) => ({
  id: 300 + index,
  sqid: `appointment-${index + 1}`,
  status: status as string,
  scheduled_time: at(days, time),
  staff: (firstname === "Grace"
    ? null
    : { sqid: "staff-1", firstname: "Raphael", lastname: "Jonnas", role: "doctor" }) as {
    sqid: string;
    firstname: string;
    lastname: string;
    role: string;
  } | null,
  patient: {
    firstname,
    lastname,
    middlename: null,
    hin: String(3_379_185_230_273 + index * 9_117),
    phone_num: `+23480${String(12_345_678 + index).slice(0, 8)}`,
  },
  last_visited: null,
  note: null as string | null,
  type: type as string | null,
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

/** Appointments nurses have given to a doctor, by who gave them: they leave the nurse's list. */
const handedOver = new Map<string, string>();

function listAppointments({ request }: { request: Request }) {
  const params = new URL(request.url).searchParams;
  const timeframe = params.get("timeframe");
  // As the API does: a plain string, not a list, and no `tomorrow` here.
  if (!timeframe || !["today", "upcoming", "history"].includes(timeframe)) {
    return HttpResponse.json({ timeframe: "This query parameter is required." }, { status: 400 });
  }
  const me = accountFor(request);
  const search = params.get("search")?.toLowerCase() ?? "";
  const from = params.get("scheduled_time_gte");
  const to = params.get("scheduled_time_lte");
  const matching = appointments.filter(
    (appointment) =>
      handedOver.get(appointment.sqid) !== me.sqid &&
      inTimeframe(appointment.scheduled_time, timeframe) &&
      // The patient's name (or email, which the mock doesn't have), not their HIN.
      (!search ||
        `${appointment.patient.firstname} ${appointment.patient.lastname}`
          .toLowerCase()
          .includes(search)) &&
      (!from || appointment.scheduled_time >= from) &&
      (!to || appointment.scheduled_time <= to),
  );
  return HttpResponse.json(page(matching, request));
}

const notFound = () =>
  HttpResponse.json({ detail: "No Appointment matches the given query." }, { status: 404 });

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
      return HttpResponse.json({ code: ["Invalid OTP"] }, { status: 400 });
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
  // The lab's and radiology's booking with themselves. TODO(api): the API lets only the front desk
  // book (a 403 for anyone else), so these dashboards' booking fails on staging.
  http.post(api("/api/hospital-ops/appointments/book"), async ({ request }) => {
    const body = (await request.json()) as {
      patient: string;
      staff: string;
      type?: string | null;
      note?: string | null;
      scheduled_time: string;
    };
    // As the API does: `staff` (who the appointment is with) is required.
    if (!body.staff)
      return HttpResponse.json({ staff: ["This field is required."] }, { status: 400 });
    if (!body.patient || !body.scheduled_time) {
      return HttpResponse.json(
        { detail: "patient and scheduled_time are required." },
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
  // Every field is optional; once given to a doctor, it leaves the nurse's list (a second call
  // from them is a 404).
  http.patch(api("/api/hospital-ops/appointments/:sqid/assign"), async ({ params, request }) => {
    const me = accountFor(request);
    const appointment = appointments.find(({ sqid }) => sqid === params.sqid);
    if (!appointment || handedOver.get(appointment.sqid) === me.sqid) return notFound();
    const body = (await request.json()) as {
      doctor_id?: string;
      scheduled_time?: string;
      note?: string | null;
      type?: string | null;
    };
    if (body.doctor_id) {
      const doctor = colleagues.find(({ sqid }) => sqid === body.doctor_id);
      if (!doctor) {
        return HttpResponse.json(
          { doctor_id: [`Object with sqid=${body.doctor_id} does not exist.`] },
          { status: 400 },
        );
      }
      if (doctor.role !== "doctor" || !doctor.is_active) {
        return HttpResponse.json(
          { doctor_id: ["Doctor not found at this hospital."] },
          { status: 400 },
        );
      }
      appointment.staff = {
        sqid: doctor.sqid,
        firstname: doctor.firstname,
        lastname: doctor.lastname,
        role: doctor.role,
      };
      handedOver.set(appointment.sqid, me.sqid);
    }
    if (body.scheduled_time) appointment.scheduled_time = body.scheduled_time;
    if ("note" in body) appointment.note = body.note ?? null;
    if ("type" in body) appointment.type = body.type ?? null;
    return HttpResponse.json({
      note: appointment.note,
      type: appointment.type,
      scheduled_time: appointment.scheduled_time,
    });
  }),
  // The API's errors, whose shapes vary. In tests no dashboard is asking, so anyone may close any
  // appointment there.
  http.post(api("/api/hospital-ops/appointments/:sqid/close"), ({ params, request }) => {
    const me = accountFor(request);
    const appointment = appointments.find(({ sqid }) => sqid === params.sqid);
    if (!appointment) return notFound();
    if (appointment.status === "completed") {
      return HttpResponse.json(
        { appointment: ["This appointment is already closed."] },
        { status: 400 },
      );
    }
    if (appointment.status === "cancelled") {
      return HttpResponse.json(
        { appointment: ["A cancelled appointment cannot be closed"] },
        { status: 400 },
      );
    }
    // TODO(api): the real API fails with a 500 and an HTML page here.
    if (!appointment.staff) {
      return new HttpResponse("<h1>Server Error (500)</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }
    if (dashboardOf(request) && appointment.staff.role !== me.role) {
      return HttpResponse.json(
        { detail: "Only staff of the same role can close this appointment." },
        { status: 403 },
      );
    }
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
    return HttpResponse.json({ detail: "Appointment closed successfully." });
  }),
];

let pendingEmail: string | null = null;

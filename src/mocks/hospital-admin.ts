import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { readMultipart } from "@/mocks/multipart";
import { colleagues, hospitalTheme } from "@/mocks/staff";

// The hospital admin's endpoints, faked with the real API's paths and shapes (as staging returns
// them). The team lives in the staff mock, open check-ins in the receptionist's.

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

const wards = (
  [
    ["general", "General ward", 20],
    ["emergency", "Emergency ward", 12],
    ["maternity", "Maternity ward", 16],
    ["icu", "ICU ward", 8],
    ["surgical", "Surgical ward", 14],
  ] as const
).map(([sqid, name, beds]) => ({ sqid, name, total_beds: beds }));

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
const patients = (
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

const wardInfo = (index: number) => {
  const ward = pick(wards, index);
  return { sqid: ward.sqid, name: ward.name };
};
const bedInfo = (index: number, status: string) => ({
  bed_number: ((index * 7) % 12) + 1,
  status,
  sqid: `bed-${index + 1}`,
});

/** Rows of each list, latest first, as `GET /api/hospital-ops/patients?status=…` returns them. */
const rows: Record<string, Record<string, unknown>[]> = {
  inpatient: [2, 26, 43, 50, 75, 120, 200, 260].map((hours, index) => ({
    sqid: `admission-${index + 1}`,
    status: "admitted",
    patient_info: pick(patients, index),
    requested_by_info: pick(doctors, index),
    ward_info: wardInfo(index % 3),
    bed_info: bedInfo(index, "occupied"),
    processed_by_info: receptionist,
    created_at: hoursAgo(hours),
    discharge_date: null,
  })),
  outpatient_discharge: [5, 30, 80, 120, 200, 330, 470].map((hours, index) => ({
    sqid: `check-in-closed-${index + 1}`,
    patient_info: pick(patients, 4 + index),
    closed_by_info: pick(doctors, index + 1),
    closed_at: hoursAgo(hours),
  })),
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

const required = (...fields: string[]) =>
  Object.fromEntries(fields.map((field) => [field, ["This field is required."]]));

/** Staff ids sent to remove or reactivate. */
async function staffIds(request: Request) {
  const { staff_ids } = (await request.json()) as { staff_ids?: string[] };
  return staff_ids ?? [];
}

export const hospitalAdminHandlers = [
  // Open check-ins are the front desk's queue; the receptionist's mock answers those.
  http.get(api("/api/hospital-ops/patients"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const list = rows[params.get("status") ?? ""];
    if (!list) return undefined;
    const matching = list.filter((row) => {
      const info = row.patient_info as (typeof patients)[number];
      return matches(params.get("search"), `${info.firstname} ${info.lastname}`, info.hin);
    });
    return HttpResponse.json(page(matching, request));
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
  http.get(api("/api/hospital-ops/wards"), ({ request }) =>
    HttpResponse.json(
      page(
        wards.map((ward) => ({ ...ward, available_beds: ward.total_beds - 2, beds: [] })),
        request,
      ),
    ),
  ),
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

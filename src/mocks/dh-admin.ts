import { HttpResponse, http } from "msw";
import { env } from "@/env";

// DocuHealth's own admin, faked with the real API's paths and shapes (as staging returns them).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const DAY = 24 * 60 * 60_000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

/** The last `count` months' keys ("2026-06"), oldest first. */
function lastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1),
    );
    return date.toISOString().slice(0, 7);
  });
}

/** A trend as staging sends it: only the buckets with something in them, each named `month`. */
function trend(period: string | null, values: number[]) {
  const months = lastMonths(values.length);
  if (period === "yearly") {
    const years = new Map<string, number>();
    months.forEach((month, index) => {
      const year = month.slice(0, 4);
      years.set(year, (years.get(year) ?? 0) + (values[index] ?? 0));
    });
    return [...years].map(([month, value]) => ({ month, value }));
  }
  if (period === "daily") {
    return [3, 1, 0, 2].flatMap((value, index) =>
      value ? [{ month: daysAgo(index * 2).slice(0, 10), value }] : [],
    );
  }
  return months.flatMap((month, index) => (values[index] ? [{ month, value: values[index] }] : []));
}

const registered = [24, 11, 13, 10, 8, 15, 5, 0, 2, 1, 0, 1];
const subscribed = [0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0];
const revenue = [0, 0, 0, 0, 0, 51600, 0, 3000, 0, 0, 0, 0];

const patients = (
  [
    ["Ada Okafor", "ada@example.com", "1990-04-12", "female", true],
    ["Bayo Adeleke", "bayo@example.com", "1985-09-30", "male", true],
    ["Chika Obi", null, "2001-01-05", "female", false],
    ["Dayo Bello", "dayo@example.com", "1978-11-22", "male", true],
  ] as const
).map(([full_name, email, dob, gender, is_active], index) => ({
  full_name,
  email,
  phone_num: `+23480${String(30_000_000 + index * 1_111).slice(0, 8)}`,
  dob,
  gender,
  hin: String(1_430_081_295_364 + index * 7_919),
  is_active,
}));

const hospitals = (
  [
    [
      "Lagos University Teaching Hospital",
      "info@luth.example.com",
      "Idi-Araba, Lagos",
      12,
      30,
      true,
    ],
    ["Ikeja General", "hello@ikejagh.example.com", "None, None, None, None", 3, 7, true],
    ["Sunrise Clinic", "sunrise@example.com", "4 Allen Avenue, Ikeja, Lagos", 0, 2, false],
  ] as const
).map(([name, email, address, doctors, other_personnel, is_active], index) => ({
  sqid: `hospital-${index + 1}`,
  name,
  profile_image: null,
  address,
  email,
  doctors,
  other_personnel,
  is_active,
}));

const applications = (
  [
    ["Mercy Hospital", "hospital", "admin@mercy.example.com", "in_review", 2],
    ["Clearview Diagnostics", "radiology", "hello@clearview.example.com", "in_review", 5],
    ["Swift Pharmacy", "pharmacy", "swift@example.com", "submitted", 9],
    ["Safe Haven Hospital", "hospital", "modupe@example.com", "approved", 40],
  ] as const
).map(([name, facility_type, official_email, status, days], index) => ({
  sqid: `application-${index + 1}`,
  facility_type,
  name,
  official_email,
  phone: "+2348119791637",
  message: "We'd like to keep our records on DocuHealth.",
  street: "12 Marina Road",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  documents:
    status === "submitted"
      ? []
      : [
          {
            id: `document-${index + 1}`,
            url: `https://files.example.com/licence-${index + 1}.pdf`,
            path: `hospital_verification_docs/licence-${index + 1}.pdf`,
            filename: "operating-licence.pdf",
            content_type: "application/pdf",
          },
        ],
  status: status as string,
  reviewed_by: status === "approved" ? "admin@docuhealthservices.net" : null,
  reviewed_at: status === "approved" ? daysAgo(days - 1) : null,
  rejection_reason: "",
  facility: status === "approved" ? `facility-${index + 1}` : "",
  created_at: daysAgo(days),
}));

const plans = [
  {
    id: 2,
    sqid: "plan-2",
    name: "Hospital Standard",
    price: 25000,
    interval: "monthly",
    role: "hospital",
    description: "For hospitals with up to 50 staff",
    features: ["Unlimited patient records", "Up to 50 staff"],
    paystack_plan_code: "PLN_standard",
    created_at: daysAgo(60),
    updated_at: daysAgo(10),
  },
  {
    id: 1,
    sqid: "plan-1",
    name: "Individual",
    price: 1000,
    interval: "monthly",
    role: "patient",
    description: "For individuals and their dependants",
    features: ["Share records with any hospital"],
    paystack_plan_code: null,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
];

function page<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams;
  const size = Number(params.get("size") ?? 10);
  const pageNumber = Number(params.get("page") ?? 1);
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

const required = (field: string) =>
  HttpResponse.json({ [field]: ["This field is required."] }, { status: 400 });

export const dhAdminHandlers = [
  http.get(api("/api/admin/dashboard"), () =>
    HttpResponse.json({
      summary: {
        total_users: 90,
        total_revenue: 54600,
        total_hospitals: 13,
        total_individuals: 87,
        total_subscribed_users: 3,
      },
      charts: {
        revenue_overview: trend("monthly", revenue),
        registered_users: trend("monthly", registered),
        subscribed_users: trend("monthly", subscribed),
        states: [
          { state: "lagos", value: 29 },
          { state: "osun", value: 27 },
          { state: "oyo", value: 9 },
        ],
        sub_account_stats: [
          { label: "With dependants", value: 3 },
          { label: "Without dependants", value: 84 },
        ],
      },
    }),
  ),
  http.get(api("/api/admin/dashboard/users"), ({ request }) =>
    HttpResponse.json(trend(new URL(request.url).searchParams.get("period"), registered)),
  ),
  http.get(api("/api/admin/dashboard/subscriptions"), ({ request }) =>
    HttpResponse.json(trend(new URL(request.url).searchParams.get("period"), subscribed)),
  ),
  http.get(api("/api/admin/dashboard/revenue"), ({ request }) =>
    HttpResponse.json(trend(new URL(request.url).searchParams.get("period"), revenue)),
  ),

  http.get(api("/api/admin/users/:role"), ({ params, request }) => {
    const search = new URL(request.url).searchParams.get("search")?.toLowerCase() ?? "";
    if (params.role === "hospital") {
      return HttpResponse.json(
        page(
          hospitals.filter((hospital) =>
            `${hospital.name} ${hospital.email}`.toLowerCase().includes(search),
          ),
          request,
        ),
      );
    }
    return HttpResponse.json(
      page(
        patients.filter((patient) =>
          `${patient.full_name} ${patient.email ?? ""}`.toLowerCase().includes(search),
        ),
        request,
      ),
    );
  }),
  http.post(api("/api/admin/:kind/:action"), async ({ params, request }) => {
    const { kind, action } = params;
    if (action !== "activate" && action !== "deactivate") return;
    const active = action === "activate";
    if (kind === "hospitals") {
      const { facilities } = (await request.json()) as { facilities?: string[] };
      if (!facilities?.length) return required("facilities");
      for (const hospital of hospitals) {
        if (facilities.includes(hospital.sqid)) Object.assign(hospital, { is_active: active });
      }
      return HttpResponse.json({ facilities });
    }
    if (kind === "patients") {
      const { hins } = (await request.json()) as { hins?: string[] };
      if (!hins?.length) return required("hins");
      for (const patient of patients) {
        if (hins.includes(patient.hin)) Object.assign(patient, { is_active: active });
      }
      return HttpResponse.json({ hins });
    }
    return undefined;
  }),

  http.get(api("/api/admin/facility-applications"), ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");
    return HttpResponse.json(
      page(
        applications.filter((application) => !status || application.status === status),
        request,
      ),
    );
  }),
  http.post(
    api("/api/admin/facility-applications/:sqid/:decision"),
    async ({ params, request }) => {
      const application = applications.find(({ sqid }) => sqid === params.sqid);
      if (!application) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
      const body = (await request.json()) as { login_url?: string; rejection_reason?: string };
      if (params.decision === "approve") {
        if (!body.login_url) return required("login_url");
        Object.assign(application, { status: "approved", reviewed_at: new Date().toISOString() });
      } else {
        if (!body.rejection_reason) return required("rejection_reason");
        Object.assign(application, {
          status: "rejected",
          rejection_reason: body.rejection_reason,
          reviewed_at: new Date().toISOString(),
        });
      }
      return HttpResponse.json(application);
    },
  ),

  http.get(api("/api/payments/plans/all"), () => HttpResponse.json(plans)),
  http.post(api("/api/payments/plans"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    for (const field of ["name", "price", "interval", "description", "features"]) {
      if (body[field] === undefined || body[field] === "") return required(field);
    }
    const plan = {
      ...(body as (typeof plans)[number]),
      id: plans.length + 1,
      sqid: `plan-${plans.length + 1}`,
      paystack_plan_code: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    plans.unshift(plan);
    return HttpResponse.json(plan, { status: 201 });
  }),
  http.patch(api("/api/payments/plans/:sqid"), async ({ params, request }) => {
    const plan = plans.find(({ sqid }) => sqid === params.sqid);
    if (!plan) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    Object.assign(plan, await request.json(), { updated_at: new Date().toISOString() });
    return HttpResponse.json(plan);
  }),
];

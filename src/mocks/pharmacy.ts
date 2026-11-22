import { HttpResponse, http } from "msw";
import { env } from "@/env";

// The pharmacy's endpoints, faked with the real API's paths and shapes (as staging returns them).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

const doctor = (sqid: string, firstname: string, lastname: string) => ({
  sqid,
  firstname,
  lastname,
  role: "doctor",
  specialization: null,
});
const amaka = {
  sqid: "9mPhRm1",
  firstname: "Amaka",
  lastname: "Eze",
  role: "pharmacist",
  specialization: null,
};
const hospital = {
  name: "Lagos University Teaching Hospital",
  email: "admin@luth.example.com",
  sqid: "pm9XGQd",
};

type DrugStatus = "pending" | "dispensed" | "unavailable";
type MockDrug = {
  sqid: string;
  status: DrugStatus;
  name: string;
  strength: string;
  dose_form: string;
  quantity: number;
  frequency: string;
  days: number;
  allergies: string[];
  dispensed_at: string | null;
  unavailable_reason: string | null;
};
type MockOrder = {
  sqid: string;
  created_at: string;
  patient: { hin: string; firstname: string; lastname: string; gender: string; dob: string };
  doctor: ReturnType<typeof doctor>;
  drugs: MockDrug[];
};

const patient = (
  hin: string,
  firstname: string,
  lastname: string,
  gender: string,
  dob: string,
) => ({
  hin,
  firstname,
  lastname,
  gender,
  dob,
});
const daniel = patient("7963242104452", "Daniel", "Martins", "male", "1995-05-15");
const blessing = patient("3379185230273", "Blessing", "Okoi", "female", "1988-11-02");
const ibrahim = patient("2078622761625", "Ibrahim", "Lawal", "male", "1972-03-14");
const fatima = patient("5413700000000", "Fatima", "Bello", "female", "2001-07-21");
const doctors = [doctor("staff-1", "Raphael", "Jonnas"), doctor("staff-2", "Sarah", "Adeyemi")];

const drug = (
  sqid: string,
  name: string,
  strength: string,
  frequency: string,
  status: DrugStatus = "pending",
  allergies: string[] = [],
): MockDrug => ({
  sqid,
  status,
  name,
  strength,
  dose_form: "tablet",
  quantity: Number.parseInt(strength, 10) || 1,
  frequency,
  days: 5,
  allergies,
  dispensed_at: status === "dispensed" ? hoursAgo(30) : null,
  unavailable_reason: status === "unavailable" ? "Out of stock" : null,
});

const orders: MockOrder[] = [
  {
    sqid: "rx-1",
    created_at: hoursAgo(2),
    patient: daniel,
    doctor: doctors[0]!,
    drugs: [
      drug("rx-1-a", "Amoxicillin", "500 mg", "tds", "pending", ["Penicillin"]),
      drug("rx-1-b", "Paracetamol", "1000 mg", "q6h"),
    ],
  },
  {
    sqid: "rx-2",
    created_at: hoursAgo(5),
    patient: blessing,
    doctor: doctors[1]!,
    drugs: [drug("rx-2-a", "Metformin", "500 mg", "bd")],
  },
  {
    sqid: "rx-3",
    created_at: hoursAgo(28),
    patient: ibrahim,
    doctor: doctors[0]!,
    drugs: [drug("rx-3-a", "Lisinopril", "10 mg", "od", "dispensed")],
  },
  {
    sqid: "rx-4",
    created_at: hoursAgo(50),
    patient: fatima,
    doctor: doctors[1]!,
    drugs: [
      drug("rx-4-a", "Ibuprofen", "400 mg", "tds", "dispensed"),
      drug("rx-4-b", "Omeprazole", "20 mg", "od", "unavailable"),
    ],
  },
];

/** `aggregate_status`, as the API words it. */
function aggregateOf(drugs: MockDrug[]) {
  if (drugs.some(({ status }) => status === "pending")) return "pending";
  if (drugs.every(({ status }) => status === "dispensed")) return "all_dispensed";
  if (drugs.every(({ status }) => status === "unavailable")) return "all_unavailable";
  return "partial";
}

/** `DrugOrderRead`, as the API returns it. */
function readOrder(order: MockOrder) {
  return {
    sqid: order.sqid,
    patient_info: order.patient,
    ordered_by_info: order.doctor,
    hospital_info: hospital,
    aggregate_status: aggregateOf(order.drugs),
    drugs_info: order.drugs.map((item) => ({
      sqid: item.sqid,
      drug_record: {
        sqid: `${item.sqid}-record`,
        name: item.name,
        strength: item.strength,
        route: "oral",
        dose_form: item.dose_form,
        quantity: item.quantity,
        unit: "mg",
        frequency: item.frequency,
        duration: { value: item.days, rate: "days" },
        allergies: item.allergies,
        rxnorm: null,
        status: "ongoing",
        created_at: order.created_at,
      },
      is_manual_entry: true,
      status: item.status,
      dispensed_by: item.status === "dispensed" ? amaka : null,
      dispensed_at: item.dispensed_at,
      unavailable_reason: item.unavailable_reason,
    })),
    created_at: order.created_at,
    latest_vitals: {
      sqid: `${order.sqid}-vitals`,
      created_at: order.created_at,
      blood_pressure: "120/80",
      temp: 36.8,
      resp_rate: 16,
      heart_rate: 72,
      height: null,
      weight: 70,
      spo2: 98,
      pain_score: null,
      notes: null,
      bmi: null,
    },
  };
}

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

/** Each dispensed drug's day, for the trend. */
const dispensedDates = () =>
  orders.flatMap(({ drugs }) =>
    drugs.flatMap(({ status, dispensed_at }) =>
      status === "dispensed" && dispensed_at ? [new Date(dispensed_at)] : [],
    ),
  );

function bucketStart(date: Date, period: string) {
  if (period === "yearly") return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  if (period === "monthly") return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (period === "weekly") day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day;
}

export const pharmacyHandlers = [
  http.get(api("/api/pharmacy/orders"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    // As the API does: pending while any drug is; "dispensed" is every other (settled) one.
    const matching = orders
      .filter((order) => {
        const pending = order.drugs.some((item) => item.status === "pending");
        if (status === "pending") return pending;
        if (status === "dispensed") return !pending;
        return true;
      })
      .sort((a, b) =>
        params.get("ordering") === "created_at"
          ? a.created_at.localeCompare(b.created_at)
          : b.created_at.localeCompare(a.created_at),
      );
    return HttpResponse.json(page(matching.map(readOrder), request));
  }),
  http.get(api("/api/pharmacy/orders/trend"), ({ request }) => {
    const period = new URL(request.url).searchParams.get("period") ?? "monthly";
    const counts = new Map<string, number>();
    for (const date of dispensedDates()) {
      const key = bucketStart(date, period).toISOString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return HttpResponse.json(
      [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
    );
  }),
  http.get(api("/api/pharmacy/orders/:sqid"), ({ params }) => {
    const order = orders.find(({ sqid }) => sqid === params.sqid);
    if (!order) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    return HttpResponse.json(readOrder(order));
  }),
  http.patch(api("/api/pharmacy/orders/dispense"), async ({ request }) => {
    const { order_items } = (await request.json()) as {
      order_items: { order_item: string; status: "dispensed" | "unavailable"; reason?: string }[];
    };
    const items = orders.flatMap(({ drugs }) => drugs);
    for (const { order_item, status, reason } of order_items) {
      const item = items.find(({ sqid }) => sqid === order_item);
      if (!item) return HttpResponse.json({ order_items: ["Invalid item."] }, { status: 400 });
      if (item.status !== "pending") {
        return HttpResponse.json(
          { order_items: [`${item.name} has already been settled.`] },
          { status: 400 },
        );
      }
      Object.assign(item, {
        status,
        dispensed_at: status === "dispensed" ? new Date().toISOString() : null,
        unavailable_reason: status === "unavailable" ? reason || "Unavailable" : null,
      });
    }
    return HttpResponse.json({ order_items });
  }),
  http.get(api("/api/pharmacy/patients/recent"), ({ request }) => {
    const days = Number(new URL(request.url).searchParams.get("days") ?? 7);
    const latest = new Map<string, { patient: MockOrder["patient"]; at: string }>();
    for (const order of orders) {
      for (const item of order.drugs) {
        if (!item.dispensed_at || Date.now() - Date.parse(item.dispensed_at) > days * DAY) continue;
        const seen = latest.get(order.patient.hin);
        if (!seen || seen.at < item.dispensed_at) {
          latest.set(order.patient.hin, { patient: order.patient, at: item.dispensed_at });
        }
      }
    }
    return HttpResponse.json(
      page(
        [...latest.values()].map(({ patient, at }) => ({ ...patient, last_dispensed_at: at })),
        request,
      ),
    );
  }),
];

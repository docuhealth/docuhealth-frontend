import { HttpResponse, http } from "msw";
import { env } from "@/env";

// The lab's endpoints, faked with the real API's paths and shapes (`LabTestOrder` with its
// `items_info`, one per test, each with the test's parameters; docs/api/openapi.json), so the
// app's parsers run against the real format.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const MINUTE = 60_000;

const hospital = {
  name: "Lagos University Teaching Hospital",
  email: "lab@luth.example.com",
  sqid: "pm9XGQd",
};

type Patient = { hin: string; firstname: string; lastname: string; gender: string; dob: string };

const patient = (index: number, name: string, dob: string, gender: string): Patient => {
  const [firstname = "", lastname = ""] = name.split(" ");
  return { hin: String(54_137_284_910 + index * 7_919_301), firstname, lastname, gender, dob };
};

type Parameter = [
  name: string,
  loinc: string,
  unit: string,
  low: number | null,
  high: number | null,
  text?: string,
];

/** The tests orders ask for, and each test's parameters. */
const catalogue: Record<string, Parameter[]> = {
  // A range given as text, so its results get no flag.
  "HIV screening": [["HIV 1/2 antibody", "7917-8", "", null, null, "Non-reactive"]],
  "Malaria/typhoid test": [
    ["Malaria parasite density", "51587-4", "/µL", 0, 0],
    ["Widal O antigen titre", "5763-8", "1:", 0, 80],
  ],
  "Full blood count": [
    ["Haemoglobin", "718-7", "g/dL", 13, 17],
    ["Packed cell volume", "4544-3", "%", 40, 54],
  ],
  Urinalysis: [["Urine specific gravity", "5811-5", "", 1.005, 1.03]],
  "Lipid profile": [
    ["Total cholesterol", "2093-3", "mg/dL", 125, 200],
    ["HDL cholesterol", "2085-9", "mg/dL", 40, 60],
  ],
  "Liver function test": [
    ["ALT", "1742-6", "U/L", 7, 56],
    ["AST", "1920-8", "U/L", 10, 40],
  ],
  "Fasting blood sugar": [["Fasting glucose", "1558-6", "mg/dL", 70, 100]],
};
const testNames = Object.keys(catalogue);

const recordPatients = [
  ["Yemi Ojo", "1974-03-02", "male"],
  ["Chioma Nwosu", "1978-06-14", "female"],
  ["Emeka Uche", "1974-01-20", "male"],
  ["Tunde Adeyemi", "1997-05-11", "male"],
  ["Hauwa Garba", "2001-02-08", "female"],
  ["Chidinma Okeke", "1994-09-30", "female"],
  ["Joyce Sarah", "2001-07-19", "female"],
  ["Adeyemi Samuel", "1997-04-03", "male"],
  ["Ngozi Eze", "1989-12-01", "female"],
  ["Ibrahim Musa", "1965-08-22", "male"],
  ["Fatima Bello", "1992-10-15", "female"],
  ["Segun Oladipo", "1983-11-27", "unknown"],
] as const;
const doctors = [
  ["Raphael", "Jonnas"],
  ["Sarah", "Adeyemi"],
  ["Ibrahim", "Sani"],
  ["Tola", "Bello"],
] as const;

type Stage = "pending" | "in_progress" | "completed" | "rejected";

/**
 * Hours ago each tab's orders were requested; how many there are sets the tab's count (each order
 * has one test, so it sits in one tab).
 */
const stageAges: Record<Stage, number[]> = {
  pending: [
    2, 20, 30, 54, 75, 98, 120, 126, 130, 134, 138, 142, 146, 150, 154, 158, 160, 162, 164, 166,
  ],
  in_progress: [3, 26, 50, 90],
  completed: Array.from({ length: 32 }, (_, index) => 4 + index * 5),
  rejected: [6, 40, 100],
};

type Result = {
  sqid: string;
  created_at: string;
  values: Record<string, string>;
  interpretation: string;
  clinical_correlation: string;
  status: "pending" | "accepted" | "rejected";
};

type Item = {
  sqid: string;
  test: string;
  status:
    | "pending"
    | "sample_collected"
    | "in_progress"
    | "result_ready"
    | "result_accepted_by_lab_admin"
    | "result_accepted_by_doctor"
    | "rejected";
  specimen_collected_at: string | null;
  rejection_reason: string | null;
  result: Result | null;
};

type Order = {
  sqid: string;
  patient: Patient;
  doctor: readonly [string, string];
  created_at: string;
  note: string;
  items: Item[];
};

const after = (from: string, minutes: number) =>
  new Date(new Date(from).getTime() + minutes * MINUTE).toISOString();

/** A healthy value for each parameter, as text, like the API stores them. */
function healthyValues(test: string) {
  return Object.fromEntries(
    (catalogue[test] ?? []).map(([, loinc, , low, high, text]) => [
      loinc,
      low !== null && high !== null ? String(Number(((low + high) / 2).toFixed(3))) : (text ?? ""),
    ]),
  );
}

let next = 0;
const orders: Order[] = (Object.entries(stageAges) as [Stage, number[]][]).flatMap(
  ([stage, ages]) =>
    ages.map((hoursAgo, index) => {
      const n = next++;
      const [name, dob, gender] = recordPatients[n % recordPatients.length]!;
      const created_at = new Date(Date.now() - hoursAgo * HOUR).toISOString();
      const test = testNames[n % testNames.length]!;
      const id = `test-order-${n + 1}`;
      // Every other test in progress has its sample in; a few results wait for the lab admin.
      const status: Item["status"] =
        stage === "in_progress"
          ? index % 2 === 0
            ? "sample_collected"
            : "in_progress"
          : stage === "completed"
            ? index % 5 === 1
              ? "result_ready"
              : "result_accepted_by_doctor"
            : stage;
      const collected = status !== "pending" && status !== "in_progress" && status !== "rejected";
      return {
        sqid: id,
        // Chidi Okafor (541-452-042-11) has a pending order, so the lab can find him to book.
        patient:
          n === 19
            ? patient(1, "Chidi Okafor", "1988-04-12", "male")
            : patient(100 + n, name, dob, gender),
        doctor: doctors[n % doctors.length]!,
        created_at,
        note:
          index % 2 === 0
            ? "Patient reports fatigue and intermittent fever for a week. Please flag anything outside the range."
            : "",
        items: [
          {
            sqid: `${id}-item-1`,
            test,
            status,
            specimen_collected_at: collected ? after(created_at, 60) : null,
            rejection_reason:
              stage === "rejected"
                ? "The sample was haemolysed and can’t be tested. Please collect a fresh sample and send a new request."
                : null,
            result:
              stage === "completed"
                ? {
                    sqid: `${id}-result`,
                    created_at: after(created_at, 240),
                    values: healthyValues(test),
                    interpretation:
                      "All values fall within their reference ranges.\nNo evidence of anaemia, infection or organ dysfunction.",
                    clinical_correlation:
                      "Normal results suggest the patient’s symptoms may have another cause.\nRepeat testing if symptoms persist.",
                    status: status === "result_ready" ? "pending" : "accepted",
                  }
                : null,
          },
        ],
      };
    }),
);

function parameterOf([name, loinc, unit, low, high, text]: Parameter, index: number) {
  return {
    sqid: `param-${loinc}`,
    name,
    unit,
    loinc_code: loinc,
    ref_low: low,
    ref_high: high,
    ref_text: text ?? "",
    order: index + 1,
  };
}

/** `LabTestOrder`, as the API returns it. */
function read(order: Order) {
  const patientInfo = order.patient;
  return {
    sqid: order.sqid,
    ordered_by_info: {
      sqid: `doctor-${order.doctor[1]}`,
      firstname: order.doctor[0],
      lastname: order.doctor[1],
      role: "doctor",
      specialization: null,
    },
    hospital_info: hospital,
    patient_info: patientInfo,
    aggregate_status: order.items[0]?.status ?? "pending",
    created_at: order.created_at,
    note: order.note,
    items_info: order.items.map((item) => {
      const parameters = (catalogue[item.test] ?? []).map(parameterOf);
      return {
        sqid: item.sqid,
        test: 1,
        test_info: {
          sqid: `test-${item.test}`,
          name: item.test,
          description: "",
          turnaround_hours: 4,
          fasting_required: false,
          special_instructions: "",
          category: { sqid: "category-1", name: "Haematology" },
          parameters,
          specimens: [],
          additional_details: null,
        },
        patient_info: patientInfo,
        status: item.status,
        specimen_collected_at: item.specimen_collected_at,
        rejection_reason: item.rejection_reason,
        result_info: item.result
          ? {
              sqid: item.result.sqid,
              created_at: item.result.created_at,
              item: item.sqid,
              parameters_info: parameters.map((parameter) => ({
                parameter_info: parameter,
                value: item.result!.values[parameter.loinc_code] ?? "",
              })),
              comments: "",
              interpretation: item.result.interpretation,
              clinical_correlation: item.result.clinical_correlation,
              submitted_by_info: null,
              status: item.result.status,
            }
          : null,
      };
    }),
  };
}

/** The order and item a request names, or a response saying why it can't be changed. */
function findItem(orderId: unknown, itemId: unknown, allowed: Item["status"][], message: string) {
  const order = orders.find(({ sqid }) => sqid === orderId);
  const item = order?.items.find(({ sqid }) => sqid === itemId);
  if (!order || !item)
    return { error: HttpResponse.json({ detail: "Not found." }, { status: 404 }) };
  if (!allowed.includes(item.status)) {
    return { error: HttpResponse.json({ detail: message }, { status: 400 }) };
  }
  return { order, item };
}

export const labScientistHandlers = [
  http.get(api("/api/lab/dashboard"), () => {
    const items = orders.flatMap((order) => order.items);
    const at = (...statuses: Item["status"][]) =>
      items.filter((item) => statuses.includes(item.status)).length;
    return HttpResponse.json({
      summary: {
        total_items: items.length,
        pending: at("pending"),
        in_progress: at("sample_collected", "in_progress"),
        result_ready: at("result_ready"),
        result_ready_change: 0,
      },
      lab_scientist: null,
      theme: null,
    });
  }),
  http.get(api("/api/lab/test-orders"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    // As the API does: an order is listed if any of its tests is at the status.
    const matching = orders
      .filter((order) => !status || order.items.some((item) => item.status === status))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json({
      count: matching.length,
      next: null,
      previous: null,
      results: matching.slice((page - 1) * size, page * size).map(read),
    });
  }),
  http.get(api("/api/lab/test-orders/:sqid"), ({ params }) => {
    const order = orders.find(({ sqid }) => sqid === params.sqid);
    if (!order) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    return HttpResponse.json(read(order));
  }),
  http.patch(api("/api/lab/test-orders/:sqid/items/:item/accept"), ({ params }) => {
    const found = findItem(
      params.sqid,
      params.item,
      ["pending"],
      "Only a pending test can be accepted.",
    );
    if (found.error) return found.error;
    found.item.status = "in_progress";
    return HttpResponse.json(
      read(found.order).items_info.find(({ sqid }) => sqid === found.item.sqid),
    );
  }),
  http.patch(api("/api/lab/test-orders/:sqid/items/:item/reject"), async ({ params, request }) => {
    const found = findItem(
      params.sqid,
      params.item,
      ["pending"],
      "Only a pending test can be rejected.",
    );
    if (found.error) return found.error;
    const { rejection_reason } = (await request.json()) as { rejection_reason: string };
    Object.assign(found.item, { status: "rejected", rejection_reason });
    return HttpResponse.json(read(found.order));
  }),
  http.patch(
    api("/api/lab/test-orders/:sqid/items/:item/specimen-collection-time"),
    async ({ params, request }) => {
      const found = findItem(
        params.sqid,
        params.item,
        ["in_progress", "sample_collected"],
        "Only an accepted test's sample can be logged.",
      );
      if (found.error) return found.error;
      const { specimen_collected_at } = (await request.json()) as { specimen_collected_at: string };
      Object.assign(found.item, { status: "sample_collected", specimen_collected_at });
      return HttpResponse.json({ sqid: found.item.sqid, specimen_collected_at });
    },
  ),
  http.post(
    api("/api/lab/test-orders/:sqid/items/:item/result/submit"),
    async ({ params, request }) => {
      const found = findItem(
        params.sqid,
        params.item,
        ["in_progress", "sample_collected"],
        "Only an accepted test takes a result.",
      );
      if (found.error) return found.error;
      const body = (await request.json()) as {
        parameters: { parameter: string; value: string }[];
        interpretation: string;
        clinical_correlation: string;
      };
      found.item.result = {
        sqid: `${found.item.sqid}-result`,
        created_at: new Date().toISOString(),
        values: Object.fromEntries(
          body.parameters.map(({ parameter, value }) => [parameter.replace(/^param-/, ""), value]),
        ),
        interpretation: body.interpretation,
        clinical_correlation: body.clinical_correlation,
        status: "pending",
      };
      found.item.status = "result_ready";
      return HttpResponse.json(read(found.order).items_info[0]?.result_info, { status: 201 });
    },
  ),
  // The lab admin's review, addressed by the test (item) alone.
  http.patch(api("/api/lab/test-orders/items/:item/result/approve-by-lab-admin"), ({ params }) => {
    const item = reviewable(params.item);
    if (!item) return reviewRefused();
    item.status = "result_accepted_by_lab_admin";
    if (item.result) item.result.status = "accepted";
    return new HttpResponse(null, { status: 200 });
  }),
  http.patch(
    api("/api/lab/test-orders/items/:item/result/reject-by-lab-admin"),
    async ({ params, request }) => {
      const item = reviewable(params.item);
      if (!item) return reviewRefused();
      const { rejection_reason } = (await request.json()) as { rejection_reason?: string };
      if (!rejection_reason?.trim()) {
        return HttpResponse.json(
          { rejection_reason: ["This field may not be blank."] },
          { status: 400 },
        );
      }
      // As the API does: the test goes back to in progress, for a new sample and result.
      Object.assign(item, { status: "in_progress", specimen_collected_at: null, result: null });
      return HttpResponse.json({ rejection_reason });
    },
  ),
];

/** A test whose result waits for the lab admin. */
function reviewable(itemId: unknown) {
  return orders
    .flatMap((order) => order.items)
    .find((item) => item.sqid === itemId && item.status === "result_ready");
}

const reviewRefused = () =>
  HttpResponse.json({ detail: "Only a result awaiting review can be reviewed." }, { status: 400 });

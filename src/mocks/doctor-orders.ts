import { HttpResponse, http } from "msw";
import { env } from "@/env";

// What a doctor orders and how they move patients, faked with the real API's paths and shapes
// (as staging returns them). Orders are kept, so tests can check what was sent.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const categories = [
  { sqid: "cat-haem", name: "Haematology" },
  { sqid: "cat-bio", name: "Biochemistry" },
];

const labTests = [
  ["test-fbc", "Full Blood Count", "cat-haem", false],
  ["test-esr", "ESR", "cat-haem", false],
  ["test-fbg", "Fasting Blood Glucose", "cat-bio", true],
  ["test-lft", "Liver Function Test", "cat-bio", false],
].map(([sqid, name, category, fasting]) => ({
  sqid,
  name,
  category: categories.find((c) => c.sqid === category),
  fasting_required: fasting,
  parameters: [],
  specimens: [],
}));

const scans = [
  { sqid: "scan-cxr", loinc_code: "36643-5", name: "XR Chest 2 Views", parts: [] },
  { sqid: "scan-ct-abd", loinc_code: "87863-7", name: "CT Abdomen W contrast IV", parts: [] },
  { sqid: "scan-us-abd", loinc_code: "24558-9", name: "US Abdomen", parts: [] },
];

const drugs = [
  ["308191", "Amoxicillin (Oral Pill)", "500 mg", "Cap", "Oral Pill"],
  ["308192", "Amoxicillin (Oral Pill)", "250 mg", "Cap", "Oral Pill"],
  ["313782", "Paracetamol (Oral Pill)", "500 mg", "Tab", "Oral Pill"],
].map(([rxcui, name, strength, dose_form, route]) => ({
  rxcui,
  name,
  strength,
  dose_form,
  route,
  display_name: `${name} ${strength} ${dose_form}`,
}));

const hospitals = [
  { sqid: "hosp-ekiti", name: "Ekiti State Teaching Hospital", email: null },
  { sqid: "hosp-unth", name: "UNTH Enugu", email: null },
];

/** A ward with its free and taken beds, by number. */
const ward = (sqid: string, name: string, free: number[], taken: number[]) => ({
  sqid,
  name,
  total_beds: free.length + taken.length,
  available_beds: free.length,
  beds: [
    ...free.map((n) => ({ sqid: `${sqid}-bed-${n}`, bed_number: n, status: "available" })),
    ...taken.map((n) => ({ sqid: `${sqid}-bed-${n}`, bed_number: n, status: "occupied" })),
  ],
});
const wards = [
  ward("ward-gen", "General ward", [1, 2, 3], [4]),
  ward("ward-icu", "ICU ward", [], [1, 2]),
];

/** What's been ordered, by kind, as sent. */
export const sentOrders: Record<string, Record<string, unknown>[]> = {
  lab: [],
  scan: [],
  drug: [],
  admission: [],
  transfer: [],
  referral: [],
};

function page<T>(items: T[]) {
  return { count: items.length, next: null, previous: null, results: items };
}

/** The visit an order must name: exactly one of a check-in and an admission. */
function visitMissing(body: Record<string, unknown>) {
  return !body.check_in === !body.admission;
}

const required = (field: string) =>
  HttpResponse.json({ [field]: ["This field is required."] }, { status: 400 });

export const doctorOrderHandlers = [
  http.get(api("/api/lab/test-categories"), () => HttpResponse.json(page(categories))),
  http.get(api("/api/lab/lab-tests"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const search = params.get("search")?.toLowerCase();
    const category = params.get("category");
    return HttpResponse.json(
      page(
        labTests.filter(
          (test) =>
            (!search || String(test.name).toLowerCase().includes(search)) &&
            (!category || test.category?.sqid === category),
        ),
      ),
    );
  }),
  http.get(api("/api/radiology/scans"), ({ request }) => {
    const query = new URL(request.url).searchParams.get("query")?.toLowerCase() ?? "";
    return HttpResponse.json(scans.filter(({ name }) => name.toLowerCase().includes(query)));
  }),
  http.get(api("/api/pharmacy/drugs/autocomplete"), ({ request }) => {
    const query = new URL(request.url).searchParams.get("query")?.toLowerCase() ?? "";
    return HttpResponse.json(
      drugs.filter(({ name }) => String(name).toLowerCase().includes(query)),
    );
  }),
  http.get(api("/api/auth/facilities/hospitals"), () => HttpResponse.json(page(hospitals))),
  http.get(api("/api/hospital-ops/wards"), () => HttpResponse.json(page(wards))),

  http.post(api("/api/lab/test-orders/create"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & {
      items?: { test: string }[];
      ignore_duplicate_warning?: boolean;
    };
    if (visitMissing(body)) return required("check_in");
    if (!body.items?.length) return required("items");
    // As the API does: a test ordered before for this patient needs confirming.
    const repeated = body.items.some(({ test }) =>
      sentOrders.lab?.some(
        (order) =>
          order.patient === body.patient &&
          (order.items as { test: string }[]).some((item) => item.test === test),
      ),
    );
    if (repeated && !body.ignore_duplicate_warning) {
      return HttpResponse.json(
        { duplicate_warning: "This test was ordered for this patient in the last 24 hours." },
        { status: 400 },
      );
    }
    sentOrders.lab?.push(body);
    return HttpResponse.json({ sqid: `lab-${Date.now()}` }, { status: 201 });
  }),
  http.post(api("/api/radiology/orders"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & { items?: unknown[] };
    if (visitMissing(body)) return required("check_in");
    if (!body.items?.length) return required("items");
    sentOrders.scan?.push(body);
    return HttpResponse.json({ sqid: `scan-order-${Date.now()}` }, { status: 201 });
  }),
  http.post(api("/api/pharmacy/orders/create"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & { drugs?: unknown[] };
    if (visitMissing(body)) return required("check_in");
    if (!body.drugs?.length) return required("drugs");
    sentOrders.drug?.push(body);
    return HttpResponse.json({ sqid: `drug-order-${Date.now()}` }, { status: 201 });
  }),
  http.post(api("/api/hospital-ops/admissions/requests/create"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.bed || !body.check_in) return required("bed");
    sentOrders.admission?.push(body);
    return HttpResponse.json(
      { sqid: `admission-request-${Date.now()}`, status: "pending" },
      { status: 201 },
    );
  }),
  http.post(api("/api/hospital-ops/admissions/transfer"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.new_bed || !body.admission) return required("new_bed");
    sentOrders.transfer?.push(body);
    return HttpResponse.json({ detail: "Patient transferred." });
  }),
  http.post(api("/api/hospital-ops/referrals"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.hospital_to_id || !body.reason) return required("reason");
    sentOrders.referral?.push(body);
    return HttpResponse.json(
      { detail: "Referral sent.", referral_sqid: `ref-${Date.now()}` },
      { status: 201 },
    );
  }),
];

import { HttpResponse, http } from "msw";
import { env } from "@/env";

// Doctors' admission requests, faked with the real API's paths and shapes (as staging returns them).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

const doctor = (sqid: string, firstname: string, lastname: string) => ({
  sqid,
  firstname,
  lastname,
  role: "doctor",
  specialization: null,
});
const receptionist = {
  sqid: "y4vRDgE",
  firstname: "Kemi",
  lastname: "Adewale",
  role: "receptionist",
  specialization: null,
};

type Status = "pending" | "accepted" | "rejected";

const requests = (
  [
    ["Daniel", "Martins", "General ward", 4, "pending", 1],
    ["Blessing", "Okoi", "Maternity ward", 2, "pending", 3],
    ["Ibrahim", "Lawal", "ICU ward", 1, "pending", 20],
    ["Chinonso", "Okafor", "Emergency ward", 7, "accepted", 30],
    ["Amina", "Yusuf", "General ward", 9, "rejected", 52],
  ] as const
).map(([firstname, lastname, ward, bed, status, hours], index) => ({
  sqid: `admission-request-${index + 1}`,
  created_at: hoursAgo(hours),
  patient_info: {
    hin: String(2_078_622_761_625 + index * 7_919),
    firstname,
    lastname,
    gender: index % 2 ? "female" : "male",
    dob: `${1970 + index * 6}-03-14`,
    payment_provider: null,
  },
  bed_info: {
    bed_number: bed,
    status: status === "accepted" ? "occupied" : "requested",
    sqid: `bed-${bed}`,
  },
  ward_info: { sqid: `ward-${index}`, name: ward },
  status: status as Status,
  processed_at: status === "pending" ? null : hoursAgo(hours - 1),
  rejection_reason: status === "rejected" ? "The ward is full; please pick another bed." : null,
  requested_by_info:
    index % 2 ? doctor("staff-2", "Sarah", "Adeyemi") : doctor("staff-1", "Raphael", "Jonnas"),
  processed_by_info: status === "pending" ? null : receptionist,
}));

export const admissionHandlers = [
  http.get(api("/api/hospital-ops/admissions/requests"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get("status") ?? "pending";
    const search = params.get("search")?.trim().toLowerCase() ?? "";
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    const matching = requests.filter(
      (entry) =>
        entry.status === status &&
        (!search ||
          `${entry.patient_info.firstname} ${entry.patient_info.lastname}`
            .toLowerCase()
            .includes(search)),
    );
    return HttpResponse.json({
      count: matching.length,
      next: null,
      previous: null,
      results: matching.slice((page - 1) * size, page * size),
    });
  }),
  http.patch(api("/api/hospital-ops/admissions/requests/:sqid/accept"), ({ params }) => {
    const entry = requests.find(({ sqid }) => sqid === params.sqid);
    if (!entry) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    if (entry.status !== "pending") {
      return HttpResponse.json(
        { detail: "This request has already been processed." },
        { status: 400 },
      );
    }
    Object.assign(entry, {
      status: "accepted",
      processed_at: new Date().toISOString(),
      processed_by_info: receptionist,
    });
    entry.bed_info.status = "occupied";
    return HttpResponse.json({ detail: "Patient admitted successfully." });
  }),
  http.patch(
    api("/api/hospital-ops/admissions/requests/:sqid/reject"),
    async ({ params, request }) => {
      const entry = requests.find(({ sqid }) => sqid === params.sqid);
      if (!entry) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
      const { rejection_reason } = (await request.json()) as { rejection_reason?: string };
      if (!rejection_reason?.trim()) {
        return HttpResponse.json(
          { rejection_reason: ["This field may not be blank."] },
          { status: 400 },
        );
      }
      Object.assign(entry, {
        status: "rejected",
        processed_at: new Date().toISOString(),
        processed_by_info: receptionist,
        rejection_reason,
      });
      return HttpResponse.json({ detail: "Admission request rejected." });
    },
  ),
];

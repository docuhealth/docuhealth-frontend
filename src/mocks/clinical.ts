import { HttpResponse, http } from "msw";
import { env } from "@/env";

// What the doctor and nurse dashboards share, faked with the real API's paths and shapes (as
// staging returns them). The patient lists come from the admin's and front desk's mocks.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

const raphael = {
  sqid: "staff-1",
  firstname: "Raphael",
  lastname: "Jonnas",
  role: "doctor",
  specialization: null,
};
const heritech = {
  sqid: "staff-3",
  firstname: "Heritech",
  lastname: "Riel",
  role: "nurse",
  specialization: null,
};

/** A visit's records, newest first, as `WorkflowRecordEvent`s. */
function recordsOf(visit: string) {
  return [
    {
      sqid: `${visit}-vitals`,
      record_type: "vital_signs",
      action: "create",
      created_at: hoursAgo(1),
      staff_info: heritech,
      record: {
        sqid: `${visit}-vitals-record`,
        created_at: hoursAgo(1),
        blood_pressure: "120/80",
        temp: 36.8,
        heart_rate: 72,
        notes: "Comfortable, no distress.",
      },
    },
    {
      sqid: `${visit}-note`,
      record_type: "progress_note",
      action: "create",
      created_at: hoursAgo(20),
      staff_info: raphael,
      record: {
        sqid: `${visit}-note-record`,
        subjective: "Feels better this morning.",
        objective: "Afebrile, chest clear.",
        assessments: "Improving community-acquired pneumonia.",
        plan: "Continue antibiotics; review tomorrow.",
      },
    },
  ];
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

/** The record behind one of a visit's events (`{visit}-vitals`, `{visit}-note`), as the API sends it. */
function eventRecord(sqid: string) {
  const visit = sqid.replace(/-(vitals|note)$/, "");
  const event = recordsOf(visit).find((record) => record.sqid === sqid);
  return event && { ...event.record, created_at: event.created_at, staff_info: event.staff_info };
}

export const clinicalHandlers = [
  http.get(api("/api/records/admissions/:sqid/records"), ({ params, request }) =>
    HttpResponse.json(page(recordsOf(String(params.sqid)), request)),
  ),
  http.get(api("/api/records/check-ins/:sqid/records"), ({ params, request }) =>
    HttpResponse.json(page(recordsOf(String(params.sqid)).slice(0, 1), request)),
  ),
  http.get(api("/api/records/events/:sqid"), ({ params }) => {
    const record = eventRecord(String(params.sqid));
    if (!record) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    return HttpResponse.json(record);
  }),
];

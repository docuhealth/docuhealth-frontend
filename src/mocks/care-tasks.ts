import { HttpResponse, http } from "msw";
import { env } from "@/env";

// Inpatient care tasks, faked with the real API's paths and shapes (as staging returns them).
// Yemi Ojo's admission (admission-1) has a few tasks; whoever acts is the nurse mock's Heritech
// Riel (staff-3).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

const doctor = {
  sqid: "staff-1",
  firstname: "Raphael",
  lastname: "Jonnas",
  role: "doctor",
  specialization: null,
};
const nurse = {
  sqid: "staff-3",
  firstname: "Heritech",
  lastname: "Riel",
  role: "nurse",
  specialization: null,
};
const yemi = {
  hin: "5413700000000",
  firstname: "Yemi",
  lastname: "Ojo",
  gender: "male",
  dob: "1974-10-22",
};

type Task = {
  sqid: string;
  admission: string;
  task_type: string;
  start_time: string;
  frequency: string;
  duration: { value: number; rate: string } | null;
  repeat_until: string;
  priority: string;
  instructions: string;
  status: string;
  effective_status: string;
  completion_time: string | null;
  created_by_info: typeof doctor;
  config: Record<string, unknown>;
};

type Occurrence = {
  sqid: string;
  task: Task;
  scheduled_for: string;
  status: string;
  claimed_by: string | null;
  record: Record<string, unknown> | null;
};

const tasks: Task[] = [];
const occurrences: Occurrence[] = [];
/** Chart entries by admission and chart. */
const charts = new Map<string, Record<string, unknown>[]>();

/** What a doctor sends to set a task. */
type NewTask = {
  task_type: string;
  start_time?: string;
  frequency?: string;
  duration?: Task["duration"];
  repeat_until?: string;
  priority?: string;
  instructions?: string;
  config?: Record<string, unknown>;
};

function addTask(admission: string, body: NewTask) {
  const task: Task = {
    sqid: `task-${tasks.length + 1}`,
    admission,
    task_type: body.task_type,
    start_time: body.start_time ?? at(0),
    frequency: body.frequency ?? "once",
    duration: body.duration ?? null,
    repeat_until: body.repeat_until ?? "discharge",
    priority: body.priority ?? "medium",
    instructions: body.instructions ?? "",
    status: "active",
    effective_status: "active",
    completion_time: null,
    created_by_info: doctor,
    config: body.config ?? {},
  };
  tasks.push(task);
  occurrences.push({
    sqid: `occ-${occurrences.length + 1}`,
    task,
    scheduled_for: task.start_time,
    status: "pending",
    claimed_by: null,
    record: null,
  });
  return task;
}

addTask("admission-1", {
  task_type: "vital_signs",
  start_time: at(-1),
  frequency: "q4h",
  priority: "high",
  instructions: "Watch the BP closely.",
  config: { parameters: ["blood_pressure", "temp", "heart_rate"] },
});
addTask("admission-1", {
  task_type: "medication",
  start_time: at(0.25),
  frequency: "tds",
  priority: "medium",
  config: {
    drugs: [
      {
        manual_drug: { name: "Paracetamol", route: "Oral" },
        dosage: { quantity: 1, unit: "g", frequency: "tds" },
      },
    ],
  },
});
addTask("admission-1", {
  task_type: "input_output",
  start_time: at(2),
  frequency: "q4h",
  priority: "low",
  config: { tracking_mode: "strict_24_hour_fluid_balance" },
});

/** `summary`, as the nurses' lists send it. */
function summaryOf(task: Task) {
  const config = task.config;
  switch (task.task_type) {
    case "vital_signs":
      return { parameters: config.parameters };
    case "medication": {
      const [drug] =
        (config.drugs as {
          manual_drug?: { name: string };
          catalog_drug?: string;
          dosage: Record<string, unknown>;
        }[]) ?? [];
      return drug
        ? { drug_name: drug.manual_drug?.name ?? drug.catalog_drug, ...drug.dosage }
        : null;
    }
    case "input_output":
      return { tracking_mode: config.tracking_mode };
    default:
      return config;
  }
}

function timingOf(scheduled: string) {
  const late = Date.now() - Date.parse(scheduled);
  if (late > 30 * 60_000) return "overdue";
  if (late >= 0) return "due";
  return "upcoming";
}

/** `NurseTaskOccurrenceList`. */
const readOccurrence = (occurrence: Occurrence) => ({
  sqid: occurrence.sqid,
  patient_info: yemi,
  task_type: occurrence.task.task_type,
  instructions: occurrence.task.instructions,
  priority: occurrence.task.priority,
  scheduled_for: occurrence.scheduled_for,
  timing_state: timingOf(occurrence.scheduled_for),
  status: occurrence.status,
  summary: summaryOf(occurrence.task),
});

const tabOf = (status: string) =>
  status === "pending" ? "pending" : status === "in_progress" ? "in_progress" : "history";

function list(request: Request, admission: string | null) {
  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  if (status !== "pending" && status !== "in_progress" && status !== "history") {
    return HttpResponse.json(
      { status: "status is required. Must be one of: pending, in_progress, history." },
      { status: 400 },
    );
  }
  const page = Number(params.get("page") ?? 1);
  const size = Number(params.get("size") ?? 10);
  const matching = occurrences
    .filter(
      (occurrence) =>
        (!admission || occurrence.task.admission === admission) &&
        tabOf(occurrence.status) === status,
    )
    .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for));
  return HttpResponse.json({
    count: matching.length,
    next: null,
    previous: null,
    results: matching.slice((page - 1) * size, page * size).map(readOccurrence),
  });
}

const refuse = (detail: string) => HttpResponse.json({ detail }, { status: 400 });

/** The occurrence, if it's claimed by me (as the API requires before recording). */
function mine(sqid: unknown) {
  const occurrence = occurrences.find((candidate) => candidate.sqid === sqid);
  if (!occurrence) return { error: HttpResponse.json({ detail: "Not found." }, { status: 404 }) };
  if (occurrence.status !== "in_progress" || occurrence.claimed_by !== nurse.sqid) {
    return { error: refuse("Only the nurse who claimed this task can do that.") };
  }
  return { occurrence };
}

const chartOf: Record<string, string> = {
  vital_signs: "vital-signs",
  medication: "medications",
  input_output: "fluid-balance",
  glucose: "glucose",
  iv_fluid: "iv-fluids",
  procedure: "procedures",
  seizure_event: "seizures",
};

function chart(occurrence: Occurrence, record: Record<string, unknown>) {
  const key = `${occurrence.task.admission}:${chartOf[occurrence.task.task_type] ?? ""}`;
  charts.set(key, [
    {
      sqid: `${occurrence.sqid}-entry`,
      recorded_at: new Date().toISOString(),
      recorded_by_info: nurse,
      ...record,
    },
    ...(charts.get(key) ?? []),
  ]);
}

const action = (name: string) => api(`/api/inpatients/task-occurrences/:sqid/${name}`);

export const careTaskHandlers = [
  http.post(api("/api/inpatients/admissions/:sqid/tasks"), async ({ params, request }) => {
    const body = (await request.json()) as NewTask;
    if (!body.task_type || !body.start_time || !body.config) {
      return HttpResponse.json({ config: ["This field is required."] }, { status: 400 });
    }
    const task = addTask(String(params.sqid), body);
    return HttpResponse.json({ ...body, sqid: task.sqid }, { status: 201 });
  }),
  http.get(api("/api/inpatients/tasks/:admission"), ({ params }) => {
    const theirs = tasks.filter((task) => task.admission === params.admission);
    return HttpResponse.json({
      count: theirs.length,
      next: null,
      previous: null,
      results: theirs.map(({ admission: _admission, config: _config, ...task }) => task),
    });
  }),
  http.get(api("/api/inpatients/task-occurrences"), ({ request }) => list(request, null)),
  http.get(api("/api/inpatients/admissions/:sqid/task-occurrences"), ({ params, request }) =>
    list(request, String(params.sqid)),
  ),
  http.post(action("claim"), ({ params }) => {
    const occurrence = occurrences.find((candidate) => candidate.sqid === params.sqid);
    if (!occurrence) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    if (occurrence.status !== "pending") return refuse("Someone has already claimed this task.");
    Object.assign(occurrence, { status: "in_progress", claimed_by: nurse.sqid });
    return HttpResponse.json({ sqid: occurrence.sqid, status: occurrence.status });
  }),
  http.post(action("release"), ({ params }) => {
    const found = mine(params.sqid);
    if (found.error) return found.error;
    Object.assign(found.occurrence, { status: "pending", claimed_by: null });
    return HttpResponse.json({ sqid: found.occurrence.sqid, status: "pending" });
  }),
  http.post(action("mark-missed"), ({ params }) => {
    const occurrence = occurrences.find((candidate) => candidate.sqid === params.sqid);
    if (!occurrence) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    occurrence.status = "missed";
    return HttpResponse.json({ sqid: occurrence.sqid, status: "missed" });
  }),
  http.post(action("escalate"), async ({ params, request }) => {
    const found = mine(params.sqid);
    if (found.error) return found.error;
    const { escalation_reason } = (await request.json()) as { escalation_reason?: string };
    if (!escalation_reason)
      return HttpResponse.json({ escalation_reason: ["This field is required."] }, { status: 400 });
    found.occurrence.status = "escalated";
    return HttpResponse.json({ escalation_reason });
  }),
  http.post(action("confirm-medication"), ({ params }) => {
    const found = mine(params.sqid);
    if (found.error) return found.error;
    if (found.occurrence.task.task_type !== "medication")
      return refuse("Only medication tasks are confirmed.");
    found.occurrence.status = "completed";
    chart(found.occurrence, { ...summaryOf(found.occurrence.task), status: "given" });
    return HttpResponse.json({ sqid: found.occurrence.sqid, status: "completed" });
  }),
  http.post(action("execute"), async ({ params, request }) => {
    const found = mine(params.sqid);
    if (found.error) return found.error;
    const body = (await request.json()) as Record<string, unknown>;
    const { task } = found.occurrence;
    if (task.task_type === "vital_signs") {
      const asked = task.config.parameters as string[];
      const extra = Object.keys(body).filter(
        (key) => body[key] !== undefined && !asked.includes(key),
      );
      if (extra.length) return refuse(`Not part of this task: ${extra.join(", ")}.`);
    }
    Object.assign(found.occurrence, { status: "completed", record: body });
    chart(found.occurrence, body);
    return HttpResponse.json({ sqid: found.occurrence.sqid, status: "completed" });
  }),
  http.get(api("/api/records/admissions/:sqid/charts/:chart"), ({ params }) => {
    const entries = charts.get(`${String(params.sqid)}:${String(params.chart)}`) ?? [];
    return HttpResponse.json({
      count: entries.length,
      next: null,
      previous: null,
      results: entries,
    });
  }),
  http.get(api("/api/records/admissions/:sqid/fluid-balance"), ({ params }) => {
    const entries = charts.get(`${String(params.sqid)}:fluid-balance`) ?? [];
    const sum = (part: "intake" | "output") =>
      entries.reduce(
        (total, entry) =>
          total + Number((entry[part] as { volume_ml?: number } | undefined)?.volume_ml ?? 0),
        0,
      );
    const intake = sum("intake");
    const output = sum("output");
    return HttpResponse.json({
      total_intake: intake,
      total_output: output,
      fluid_balance: intake - output,
    });
  }),
];

import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { type VitalParameter, vitalParameterLabels } from "@/lib/care-tasks";
import { frequencyOf } from "@/lib/clinical";
import { fullName, optionalText, text } from "@/lib/staff-profile";
import { anyResponseSchema } from "@/features/nurse/api/schemas";

// The nurses' care task occurrences on the real API: each run of a doctor's care task, claimed by
// a nurse, then recorded (or confirmed, for medication), released, marked missed or escalated.
// TODO(api): the lists need a `status` the schema doesn't show, and each task's record body is
// only described in words.

export const taskTabLabels = {
  pending: "To do",
  in_progress: "In progress",
  history: "Done",
} as const;
export type TaskTab = keyof typeof taskTabLabels;

export const timingLabels = { upcoming: "Upcoming", due: "Due", overdue: "Overdue" } as const;
type Timing = keyof typeof timingLabels;

export type TaskOccurrence = {
  id: string;
  type: string;
  patient: { name: string; hin: string };
  instructions: string | null;
  priority: string;
  scheduledFor: string;
  timing: Timing | null;
  /** pending, in_progress, completed, missed, escalated, cancelled */
  status: string;
  /** What the task asks for, in words, e.g. "Paracetamol 1 g, three times daily". */
  summary: string | null;
  /** The vital signs a vitals task asks for. */
  parameters: VitalParameter[];
  /** What an intake/output task tracks. */
  trackingMode: string | null;
};

export type TaskPage = { total: number; counts: Record<TaskTab, number>; items: TaskOccurrence[] };

const count = z.number().int().nonnegative();

const summarySchema = z
  .object({
    parameters: z.array(z.string()).nullish(),
    drug_name: optionalText,
    quantity: z.union([z.number(), z.string()]).nullish(),
    unit: optionalText,
    frequency: optionalText,
    tracking_mode: optionalText,
    procedure_name: optionalText,
    schedule: optionalText,
    solution_type: optionalText,
  })
  .loose()
  .nullish()
  .catch(null);

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

function summaryText(summary: z.infer<typeof summarySchema>): string | null {
  if (!summary) return null;
  if (summary.drug_name) {
    const dose = [summary.quantity, summary.unit].filter((part) => part != null && part !== "");
    return [summary.drug_name, dose.join(" "), frequencyOf(summary.frequency)]
      .filter(Boolean)
      .join(" · ");
  }
  if (summary.parameters?.length) {
    return summary.parameters
      .map((parameter) => vitalParameterLabels[parameter as VitalParameter] ?? parameter)
      .join(", ");
  }
  const named =
    summary.procedure_name ?? summary.tracking_mode ?? summary.schedule ?? summary.solution_type;
  return named ? sentence(named) : null;
}

const taskPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        task_type: text,
        patient_info: z.object({ hin: text, firstname: text, lastname: text }),
        instructions: optionalText,
        priority: text,
        scheduled_for: z.iso.datetime({ offset: true }),
        timing_state: optionalText,
        status: text,
        summary: summarySchema,
      })
      .transform((task): TaskOccurrence => ({
        id: task.sqid,
        type: task.task_type,
        patient: {
          name:
            fullName(task.patient_info.firstname, task.patient_info.lastname) ||
            task.patient_info.hin,
          hin: task.patient_info.hin,
        },
        instructions: task.instructions,
        priority: task.priority,
        scheduledFor: task.scheduled_for,
        timing:
          task.timing_state && task.timing_state in timingLabels
            ? (task.timing_state as Timing)
            : null,
        status: task.status,
        summary: summaryText(task.summary),
        parameters: (task.summary?.parameters ?? []).filter(
          (parameter): parameter is VitalParameter => parameter in vitalParameterLabels,
        ),
        trackingMode: task.summary?.tracking_mode ?? null,
      })),
  ),
});

const countOnly = z.object({ count: count }).transform(({ count }) => count);

const taskKeys = {
  all: ["nurse", "tasks"] as const,
  list: (admissionId: string | null, tab: TaskTab, page: number) =>
    [...taskKeys.all, admissionId ?? "all", tab, page] as const,
};

export const TASKS_PAGE_SIZE = 10;
const tabs = Object.keys(taskTabLabels) as TaskTab[];

const listUrl = (admissionId: string | null) =>
  admissionId
    ? `/api/inpatients/admissions/${encodeURIComponent(admissionId)}/task-occurrences`
    : "/api/inpatients/task-occurrences";

/**
 * A page of one tab's task occurrences (for one admission, or every patient), and every tab's
 * count. To do: overdue and due first. It refreshes every minute.
 */
export const taskListQuery = (admissionId: string | null, tab: TaskTab, page: number) =>
  queryOptions({
    queryKey: taskKeys.list(admissionId, tab, page),
    queryFn: async (): Promise<TaskPage> => {
      const url = listUrl(admissionId);
      const [list, ...counts] = await Promise.all([
        request(taskPageSchema, { url, params: { status: tab, page, size: TASKS_PAGE_SIZE } }),
        ...tabs.map((status) => request(countOnly, { url, params: { status, page: 1, size: 1 } })),
      ]);
      return {
        total: list.count,
        counts: { pending: counts[0] ?? 0, in_progress: counts[1] ?? 0, history: counts[2] ?? 0 },
        items: list.results,
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

const occurrenceUrl = (id: string, action: string) =>
  `/api/inpatients/task-occurrences/${encodeURIComponent(id)}/${action}`;

function useTasksChanged() {
  const queryClient = useQueryClient();
  // The charts and visit records change with what's recorded.
  return () => queryClient.invalidateQueries();
}

/** An action with no details: claim, release, mark missed, or confirm a medication given. */
export function useTaskAction() {
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "claim" | "release" | "mark-missed" | "confirm-medication";
    }) => request(anyResponseSchema, { method: "POST", url: occurrenceUrl(id, action), data: {} }),
    onSuccess: useTasksChanged(),
  });
}

/** Pass a task up, saying why. */
export function useEscalateTask() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: occurrenceUrl(id, "escalate"),
        data: { escalation_reason: reason },
      }),
    onSuccess: useTasksChanged(),
  });
}

/** Record what was done for a claimed task; the body depends on the task's type. */
export function useRecordTask() {
  return useMutation({
    mutationFn: ({ id, record }: { id: string; record: Record<string, unknown> }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: occurrenceUrl(id, "execute"),
        data: record,
      }),
    onSuccess: useTasksChanged(),
  });
}

import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { durationOf, frequencyOf, personSchema } from "@/lib/clinical";
import { optionalText, text } from "@/lib/staff-profile";
import { doctorKeys } from "@/features/doctor/api/queries";
import { anyResponseSchema } from "@/features/doctor/api/schemas";
import { type CareTaskValues, toCareTaskRequest } from "@/features/doctor/lib/care-task-schema";

// The care tasks a doctor sets for an admitted patient, which the nurses carry out
// (`/api/inpatients/admissions/{sqid}/tasks`, `/api/inpatients/tasks/{admission}`).

type CareTask = {
  id: string;
  type: string;
  startsAt: string;
  frequency: string | null;
  /** "Until discharge", or how long it runs. */
  runs: string;
  priority: string;
  instructions: string | null;
  /** `active`, `completed`, or `duration_completed` once its time is up. */
  status: string;
  setBy: string | null;
};

const careTaskPageSchema = z.object({
  count: z.number().int().nonnegative(),
  results: z.array(
    z
      .object({
        sqid: z.string(),
        task_type: text,
        start_time: z.iso.datetime({ offset: true }),
        frequency: optionalText,
        repeat_until: optionalText,
        duration: z.object({ value: z.coerce.number(), rate: text }).nullish().catch(null),
        priority: text,
        instructions: optionalText,
        status: text,
        effective_status: optionalText,
        created_by_info: personSchema,
      })
      .transform((task): CareTask => ({
        id: task.sqid,
        type: task.task_type,
        startsAt: task.start_time,
        frequency: frequencyOf(task.frequency),
        runs:
          task.repeat_until === "duration" && task.duration
            ? `For ${durationOf(task.duration)}`
            : "Until discharge",
        priority: task.priority,
        instructions: task.instructions,
        status: task.effective_status ?? task.status,
        setBy: task.created_by_info,
      })),
  ),
});

const careTaskKeys = {
  history: (admissionId: string, page: number) =>
    [...doctorKeys.all, "care-tasks", admissionId, page] as const,
};

export const CARE_TASKS_PAGE_SIZE = 10;

/** The care tasks set during this admission, as the doctor sees them. */
export const careTaskHistoryQuery = (admissionId: string, page: number) =>
  queryOptions({
    queryKey: careTaskKeys.history(admissionId, page),
    queryFn: async () => {
      const { count, results } = await request(careTaskPageSchema, {
        url: `/api/inpatients/tasks/${encodeURIComponent(admissionId)}`,
        params: { page, size: CARE_TASKS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });

/** Set a care task; its first occurrences go straight to the nurses. */
export function useCreateCareTask(admissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: CareTaskValues) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/inpatients/admissions/${encodeURIComponent(admissionId)}/tasks`,
        data: toCareTaskRequest(task),
      }),
    // The nurses' queues change too.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

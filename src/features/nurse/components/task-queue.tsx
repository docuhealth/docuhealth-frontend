import { DotsThreeIcon, WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type TaskOccurrence,
  type TaskTab,
  taskListQuery,
  TASKS_PAGE_SIZE,
  taskTabLabels,
  timingLabels,
  useEscalateTask,
  useTaskAction,
} from "@/features/nurse/api/tasks";
import { RecordTaskDialog } from "@/features/nurse/components/record-task-dialog";
import { getErrorMessage } from "@/lib/api";
import { careTaskTypeLabel, type Priority, priorityLabels, priorityTones } from "@/lib/care-tasks";
import { formatDayAndTime, maskHin } from "@/lib/format";

const tabs = Object.keys(taskTabLabels) as TaskTab[];

const timingTones = { upcoming: "neutral", due: "warning", overdue: "error" } as const;

const statusLabels: Record<
  string,
  { label: string; tone: "success" | "neutral" | "warning" | "error" | "info" }
> = {
  pending: { label: "To do", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Done", tone: "success" },
  missed: { label: "Missed", tone: "error" },
  escalated: { label: "Escalated", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const emptyIn = {
  pending: "No tasks waiting.",
  in_progress: "No tasks in progress.",
  history: "No tasks done yet.",
} as const satisfies Record<TaskTab, string>;

/**
 * Care task occurrences, for one admission or (on the Tasks page) every patient: to do (claim
 * one), in progress (record it, confirm a medication, release, escalate, mark missed), and done.
 * The API only lets the nurse who claimed a task act on it after that.
 */
export function TaskQueue({ admissionId = null }: { admissionId?: string | null }) {
  const [tab, setTab] = useState<TaskTab>("pending");
  const [page, setPage] = useState(1);
  const [recording, setRecording] = useState<TaskOccurrence | null>(null);
  const [escalating, setEscalating] = useState<TaskOccurrence | null>(null);
  const [missing, setMissing] = useState<TaskOccurrence | null>(null);
  const { data, isError } = useQuery(taskListQuery(admissionId, tab, page));
  const act = useTaskAction();
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());
  const showPatient = !admissionId;
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load the tasks. Try again in a moment."
    : data?.items.length === 0 && emptyIn[tab];

  function run(
    task: TaskOccurrence,
    action: "claim" | "release" | "confirm-medication",
    done: string,
  ) {
    act.mutate(
      { id: task.id, action },
      {
        onSuccess: () => toast.success(done),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const actions = (task: TaskOccurrence): ReactNode => {
    const name = careTaskTypeLabel(task.type).toLowerCase();
    if (tab === "history") return null;
    const more = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More for ${task.patient.name}’s ${name}`}
          >
            <DotsThreeIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {tab === "in_progress" && (
            <>
              <DropdownMenuItem onSelect={() => run(task, "release", "The task is back in To do.")}>
                Release
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEscalating(task)}>Escalate</DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem variant="destructive" onSelect={() => setMissing(task)}>
            Mark missed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    if (tab === "pending") {
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={act.isPending}
            aria-label={`Claim ${task.patient.name}’s ${name}`}
            onClick={() => run(task, "claim", `${task.patient.name}’s ${name} is yours.`)}
            className="bg-card type-caption-semibold font-sans text-fg-heading"
          >
            Claim
          </Button>
          {more}
        </div>
      );
    }
    const main =
      task.type === "medication" ? (
        <Button
          size="sm"
          disabled={act.isPending}
          aria-label={`Confirm ${task.patient.name}’s medication given`}
          onClick={() =>
            run(
              task,
              "confirm-medication",
              `${task.patient.name}’s medication is recorded as given.`,
            )
          }
          className="type-caption-semibold font-sans"
        >
          Confirm given
        </Button>
      ) : task.type === "nurse_in_patient_discharge" && !admissionId ? (
        // TODO(api): task rows don't say their admission, which the checklist needs.
        <span className="type-caption text-fg-caption">From the patient’s page</span>
      ) : (
        <Button
          size="sm"
          aria-label={`Record ${task.patient.name}’s ${name}`}
          onClick={() => setRecording(task)}
          className="type-caption-semibold font-sans"
        >
          Record
        </Button>
      );
    return (
      <div className="flex items-center justify-end gap-1">
        {main}
        {more}
      </div>
    );
  };

  return (
    <section aria-label="Care tasks" className="@container rounded-xl border bg-card p-4">
      <Tabs
        value={tab}
        onValueChange={(next) => {
          setTab(next as TaskTab);
          setPage(1);
        }}
        className="gap-0"
      >
        <CountTabsList className="-mx-4 w-auto px-4">
          {tabs.map((value) => (
            <CountTab key={value} value={value} count={data?.counts[value]}>
              {taskTabLabels[value]}
            </CountTab>
          ))}
        </CountTabsList>
      </Tabs>

      <div className="overflow-x-auto">
        <DashboardTable
          className="min-w-[46rem] type-body-sm-regular [&_tbody_tr:last-child]:border-b"
          columns={[
            { label: "Task", className: "type-body-sm-regular" },
            ...(showPatient
              ? [{ label: "Patient", className: "w-[20%] type-body-sm-regular" }]
              : []),
            { label: "When", className: "w-36 type-body-sm-regular" },
            { label: "Priority", className: "w-24 type-body-sm-regular" },
            {
              label: tab === "history" ? "Outcome" : "Status",
              className: "w-28 type-body-sm-regular",
            },
            { label: "Actions", hideLabel: true, className: "w-44" },
          ]}
          empty={empty}
        >
          {items.map((task) => {
            const { day, time } = formatDayAndTime(new Date(task.scheduledFor), now);
            const priority = task.priority as Priority;
            const status = statusLabels[task.status] ?? {
              label: task.status,
              tone: "info" as const,
            };
            return (
              <TableRow key={task.id}>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col">
                    <span className="text-fg-heading">{careTaskTypeLabel(task.type)}</span>
                    {task.summary && <span className="text-fg-body">{task.summary}</span>}
                    {task.instructions && (
                      <span className="text-fg-caption">{task.instructions}</span>
                    )}
                  </div>
                </TableCell>
                {showPatient && (
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-col">
                      <span className="text-fg-heading">{task.patient.name}</span>
                      <span className="text-fg-caption">HIN {maskHin(task.patient.hin)}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-fg-heading">
                      {day}, {time}
                    </span>
                    {task.timing && tab === "pending" && (
                      <StatusPill tone={timingTones[task.timing]}>
                        {timingLabels[task.timing]}
                      </StatusPill>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {priority in priorityLabels ? (
                    <StatusPill tone={priorityTones[priority]}>
                      {priorityLabels[priority]}
                    </StatusPill>
                  ) : (
                    task.priority
                  )}
                </TableCell>
                <TableCell>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </TableCell>
                <TableCell className="text-right">{actions(task)}</TableCell>
              </TableRow>
            );
          })}
        </DashboardTable>
      </div>

      {data && data.total > TASKS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={TASKS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <RecordTaskDialog
        task={recording}
        admissionId={admissionId}
        onClose={() => setRecording(null)}
      />
      {escalating && <EscalateDialog task={escalating} onClose={() => setEscalating(null)} />}
      {missing && <MissedDialog task={missing} onClose={() => setMissing(null)} />}
    </section>
  );
}

function EscalateDialog({ task, onClose }: { task: TaskOccurrence; onClose: () => void }) {
  const escalate = useEscalateTask();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <ConfirmDialog
      tone="danger"
      icon={<WarningIcon />}
      title="Escalate task"
      confirmLabel="Escalate"
      pending={escalate.isPending}
      onClose={() => !escalate.isPending && onClose()}
      onConfirm={() => {
        if (!reason.trim()) {
          setError("Say why it needs escalating");
          return;
        }
        escalate.mutate(
          { id: task.id, reason: reason.trim() },
          {
            onSuccess: () => {
              toast.success(`${task.patient.name}’s task is escalated.`);
              onClose();
            },
            onError: (failure) => toast.error(getErrorMessage(failure)),
          },
        );
      }}
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {careTaskTypeLabel(task.type)} for {task.patient.name} needs more than nursing can do?
      </DialogDescription>
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="escalateReason" className="gap-1">
          Reason <RequiredMark />
        </FieldLabel>
        <Textarea
          id="escalateReason"
          value={reason}
          maxLength={500}
          onChange={(event) => {
            setReason(event.target.value);
            setError(null);
          }}
          placeholder="e.g. BP 190/120 after two readings"
          aria-invalid={!!error}
          className="min-h-20 bg-card"
        />
        <FieldError errors={[error ? { message: error } : undefined]} />
      </Field>
    </ConfirmDialog>
  );
}

function MissedDialog({ task, onClose }: { task: TaskOccurrence; onClose: () => void }) {
  const act = useTaskAction();
  return (
    <ConfirmDialog
      tone="danger"
      icon={<WarningIcon />}
      title="Mark missed"
      confirmLabel="Mark missed"
      pending={act.isPending}
      onClose={() => !act.isPending && onClose()}
      onConfirm={() =>
        act.mutate(
          { id: task.id, action: "mark-missed" },
          {
            onSuccess: () => {
              toast.success(`${task.patient.name}’s task is marked missed.`);
              onClose();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          },
        )
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Record that {careTaskTypeLabel(task.type).toLowerCase()} for {task.patient.name} wasn’t
        done? This can’t be undone.
      </DialogDescription>
    </ConfirmDialog>
  );
}

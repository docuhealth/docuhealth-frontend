import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { TableCell, TableRow } from "@/components/ui/table";
import { CARE_TASKS_PAGE_SIZE, careTaskHistoryQuery } from "@/features/doctor/api/care-tasks";
import { careTaskTypeLabel, type Priority, priorityLabels, priorityTones } from "@/lib/care-tasks";
import { formatDateCommaTime } from "@/lib/format";

const statusLabels: Record<string, { label: string; tone: "success" | "neutral" | "info" }> = {
  active: { label: "Active", tone: "success" },
  duration_completed: { label: "Time’s up", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
};

/** The care tasks set during this admission: what, from when, how often, and whether they run. */
export function CareTaskHistory({ admissionId }: { admissionId: string }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(careTaskHistoryQuery(admissionId, page));

  const empty = isError
    ? "We couldn’t load the care tasks. Try again in a moment."
    : data?.items.length === 0 && "No care tasks set yet.";

  return (
    <section aria-label="Care tasks" className="@container rounded-xl border bg-card p-4">
      <div className="overflow-x-auto">
        <DashboardTable
          className="min-w-[44rem] type-body-sm-regular"
          columns={[
            { label: "Task", className: "type-body-sm-regular" },
            { label: "Starts", className: "w-40 type-body-sm-regular" },
            { label: "How often", className: "w-36 type-body-sm-regular" },
            { label: "Priority", className: "w-24 type-body-sm-regular" },
            { label: "Status", className: "w-28 type-body-sm-regular" },
          ]}
          empty={empty}
        >
          {data?.items.map((task) => {
            const status = statusLabels[task.status] ?? {
              label: task.status,
              tone: "info" as const,
            };
            const priority = task.priority as Priority;
            return (
              <TableRow key={task.id}>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col">
                    <span className="text-fg-heading">{careTaskTypeLabel(task.type)}</span>
                    <span className="text-fg-caption">
                      {[task.instructions, task.setBy && `Set by ${task.setBy}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {formatDateCommaTime(new Date(task.startsAt))}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col">
                    <span className="text-fg-heading">{task.frequency ?? "—"}</span>
                    <span className="text-fg-caption">{task.runs}</span>
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
              </TableRow>
            );
          })}
        </DashboardTable>
      </div>
      {data && data.total > CARE_TASKS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={CARE_TASKS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

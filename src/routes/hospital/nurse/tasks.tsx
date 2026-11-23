import { createFileRoute } from "@tanstack/react-router";
import { TaskQueue } from "@/features/nurse/components/task-queue";

export const Route = createFileRoute("/hospital/nurse/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Tasks · DocuHealth</title>
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Tasks</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Care tasks for every admitted patient, overdue and due first.
        </p>
      </div>
      <TaskQueue />
    </div>
  );
}

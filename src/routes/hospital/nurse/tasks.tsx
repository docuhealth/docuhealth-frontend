import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdmissionNotePrompt } from "@/features/clinical/components/admission-note-prompt";
import { TaskQueue } from "@/features/nurse/components/task-queue";

export const Route = createFileRoute("/hospital/nurse/tasks")({
  component: TasksPage,
});

function TasksPage() {
  // A claim refused for a missing admission note offers to write it.
  const [needsNote, setNeedsNote] = useState<{ hin: string; name: string } | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <title>Tasks · DocuHealth</title>
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Tasks</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Care tasks for every admitted patient, overdue and due first.
        </p>
      </div>
      <TaskQueue onAdmissionNoteNeeded={setNeedsNote} />
      <AdmissionNotePrompt patient={needsNote} onClose={() => setNeedsNote(null)} />
    </div>
  );
}

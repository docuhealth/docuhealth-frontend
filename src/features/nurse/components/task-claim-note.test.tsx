import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { AdmissionNotePrompt } from "@/features/clinical/components/admission-note-prompt";
import { TaskQueue } from "@/features/nurse/components/task-queue";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

// Yemi Ojo (admission-1) has care tasks but no admission note yet. Staging refuses a claim on
// such a patient's task; the refusal is mocked here, since the mock API's claim doesn't check.

/** The table row for the task called `task`. */
async function rowOf(task: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(task)).closest("tr")!;
}

describe("A task whose patient has no admission note yet", () => {
  it("offers to write the note when the API refuses the claim, and opens it", async () => {
    server.use(
      http.post(`${env.VITE_API_URL}/api/inpatients/task-occurrences/:sqid/claim`, () =>
        HttpResponse.json(
          { detail: "Add the nursing admission note before working on this patient's tasks." },
          { status: 400 },
        ),
      ),
    );
    const { user } = renderWithRouter(<TasksWithPrompt />);
    await user.click(within(await rowOf("Vital signs")).getByRole("button", { name: /Claim/ }));

    // The Tasks page doesn't know the admission, so the prompt finds it among the admitted.
    const prompt = await screen.findByRole("dialog", { name: "Add the nursing admission note" });
    expect(within(prompt).getByText(/Yemi Ojo was newly admitted/)).toBeInTheDocument();
    await user.click(within(prompt).getByRole("button", { name: "Write admission note" }));
    expect(await screen.findByRole("dialog", { name: "Admission note" })).toBeInTheDocument();
  });
});

/** As the Tasks page composes them. */
function TasksWithPrompt() {
  const [needsNote, setNeedsNote] = useState<{ hin: string; name: string } | null>(null);
  return (
    <>
      <TaskQueue onAdmissionNoteNeeded={setNeedsNote} />
      <AdmissionNotePrompt patient={needsNote} onClose={() => setNeedsNote(null)} />
    </>
  );
}

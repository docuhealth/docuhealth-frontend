import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Visit } from "@/features/clinical/api/schemas";
import { AdmissionNoteGate, NoteActions } from "@/features/clinical/components/note-actions";
import { renderWithRouter } from "@/test/render";

// Yemi Ojo (5413700000000) has no admission note in the notes mock. The API wants it before
// any nursing task, the discharge checklist included, so the nurse is asked for it until they've
// discharged the patient, not only while the admission is active.

describe("An admission the doctor has discharged, still with the nurses", () => {
  const awaitingDischarge = {
    id: "admission-1",
    list: "inpatient",
    kind: "admission",
    status: "awaiting_nurse_discharge",
    patient: { hin: "5413700000000", name: "Yemi Ojo" },
    ward: "General ward",
    bed: "1",
    requestedBy: null,
    startedAt: null,
    endedAt: null,
    endedBy: null,
  } as unknown as Visit;

  it("still asks the nurse for a missing admission note, with the button to write it", async () => {
    const { user } = renderWithRouter(
      <>
        <NoteActions staff="nurse" visit={awaitingDischarge} myId="staff-1" />
        <AdmissionNoteGate visit={awaitingDischarge}>
          <p>The task queue</p>
        </AdmissionNoteGate>
      </>,
    );
    const prompt = await screen.findByRole(
      "dialog",
      { name: "Add the nursing admission note" },
      { timeout: 10_000 },
    );
    await user.click(within(prompt).getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Write the admission note first")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Write admission note" })).toHaveLength(2);
  });
});

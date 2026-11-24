import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import type { NoteKind } from "@/features/clinical/api/notes";
import { HandoverHistory } from "@/features/clinical/components/handover-history";
import { AdmissionNoteGate, NoteActions } from "@/features/clinical/components/note-actions";
import { PatientNotes } from "@/features/clinical/components/patient-notes";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { server } from "@/mocks/node";
import { pickOption, renderWithRouter } from "@/test/render";

// The admitted patients are the hospital admin's mock data: Yemi Ojo (admission-1) has no
// admission note yet; Chioma Nwosu (admission-2) has one, a case note and a care plan.

function Admission({
  staff,
  visitId,
  kinds,
}: {
  staff: "doctor" | "nurse";
  visitId: string;
  kinds: NoteKind[];
}) {
  return (
    <PatientPage
      list="inpatient"
      visitId={visitId}
      actions={(visit) => <NoteActions staff={staff} visit={visit} myId="staff-1" />}
      tabs={(visit) => [
        {
          value: "tasks",
          label: "Nursing tasks",
          content: (
            <AdmissionNoteGate visit={visit}>
              <p>The task queue</p>
            </AdmissionNoteGate>
          ),
        },
        {
          value: "notes",
          label: "Notes",
          content: <PatientNotes hin={visit.patient.hin} kinds={kinds} />,
        },
      ]}
    />
  );
}

describe("Notes on an admission", () => {
  it("asks the nurse for the admission note before anything else", async () => {
    const { user } = renderWithRouter(
      <Admission staff="nurse" visitId="admission-1" kinds={["admission", "vitals"]} />,
    );
    // As in v1, opening a newly admitted patient asks for the note straight away.
    const prompt = await screen.findByRole("dialog", { name: "Add the nursing admission note" });
    expect(within(prompt).getByText(/Yemi Ojo was newly admitted/)).toBeInTheDocument();
    await user.click(within(prompt).getByRole("button", { name: "Cancel" }));

    await user.click(await screen.findByRole("tab", { name: "Nursing tasks" }));
    expect(await screen.findByText("Write the admission note first")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Record vitals" })).not.toBeInTheDocument();

    await user.click(
      within(screen.getByRole("tabpanel")).getByRole("button", { name: "Write admission note" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Admission note" });
    await user.click(within(dialog).getByRole("button", { name: "Save admission note" }));
    expect(await within(dialog).findByText("Enter the blood pressure")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the initial nursing concern")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Blood pressure/), "130/85");
    await user.type(within(dialog).getByLabelText(/Temperature/), "37.2");
    await user.type(within(dialog).getByLabelText(/Heart rate/), "88");
    await user.type(within(dialog).getByLabelText(/Respiratory rate/), "18");
    await user.type(within(dialog).getByLabelText(/Initial nursing concern/), "Chest pain at rest");
    await user.type(within(dialog).getByLabelText("Allergies"), "Penicillin\nLatex");
    await user.click(within(dialog).getByRole("radio", { name: "Walks with help" }));
    await user.click(within(dialog).getByRole("button", { name: "Save admission note" }));
    expect(await screen.findByText("Yemi Ojo’s admission note is saved.")).toBeInTheDocument();

    expect(await screen.findByText("The task queue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record vitals" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Notes" }));
    const notes = await screen.findByRole("region", { name: "Notes" });
    await user.click(await within(notes).findByRole("button", { name: /Chest pain at rest/ }));
    expect(within(notes).getByText(/Penicillin\s+Latex/)).toBeInTheDocument();
  });

  it("lets the nurse write a case note, which joins the notes", async () => {
    const { user } = renderWithRouter(
      <Admission staff="nurse" visitId="admission-2" kinds={["case", "admission"]} />,
    );
    await user.click(await screen.findByRole("button", { name: /Notes/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Case note" }));
    const dialog = await screen.findByRole("dialog", { name: "New case note" });
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await within(dialog).findByText("Enter the observation")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Observation/), "Vomited twice\nRefused lunch");
    await user.type(within(dialog).getByLabelText("Care given"), "Gave ondansetron");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await screen.findByText("The case note is saved.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Notes" }));
    const notes = await screen.findByRole("region", { name: "Notes" });
    await user.click(await within(notes).findByRole("button", { name: /Vomited twice/ }));
    expect(within(notes).getByText("Gave ondansetron")).toBeInTheDocument();
  });

  it("lets the doctor write a progress note, every part of it", async () => {
    const { user } = renderWithRouter(
      <Admission staff="doctor" visitId="admission-2" kinds={["progress"]} />,
    );
    await user.click(await screen.findByRole("button", { name: /Notes/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Progress note" }));
    const dialog = await screen.findByRole("dialog", { name: "New progress note" });
    await user.type(within(dialog).getByLabelText(/Subjective/), "Feels better");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await within(dialog).findByText("Enter the objective")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the plan")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Objective/), "Chest clear");
    await user.type(within(dialog).getByLabelText(/Assessment/), "Pneumonia resolving");
    await user.type(within(dialog).getByLabelText(/Plan/), "Discharge tomorrow");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await screen.findByText("The progress note is saved.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Notes" }));
    const notes = await screen.findByRole("region", { name: "Notes" });
    expect(await within(notes).findByText("Pneumonia resolving")).toBeInTheDocument();
  });

  it("explains notes the API won't show", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/patients/:hin/soap-notes/shared`, () =>
        HttpResponse.json({ detail: "Server error" }, { status: 500 }),
      ),
      http.get(`${env.VITE_API_URL}/api/records/patients/:hin/care-plans`, () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );
    const { user } = renderWithRouter(
      <PatientNotes hin="5413702791337" kinds={["shared", "care-plan"]} />,
    );
    expect(
      await screen.findByText("These notes aren’t available right now. Try again later."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Notes" }));
    await pickOption("Care plans");
    expect(await screen.findByText("You can’t see these notes yet.")).toBeInTheDocument();
  });
});

describe("Handovers", () => {
  it("hands a patient over to another doctor, then lists it as sent", async () => {
    const { user } = renderWithRouter(
      <>
        <Admission staff="doctor" visitId="admission-1" kinds={["progress"]} />
        <HandoverHistory staff="doctor" myId="staff-1" />
      </>,
    );
    const history = await screen.findByRole("region", { name: "Handovers" });
    const received = (await within(history).findByText("Chioma Nwosu")).closest("button")!;
    expect(within(received).getByText("Received")).toBeInTheDocument();
    expect(within(received).getByText(/From Dr\. Sarah Adeyemi/)).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: /Notes/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Hand over" }));
    const dialog = await screen.findByRole("dialog", { name: "Hand over" });
    await user.click(within(dialog).getByRole("button", { name: "Hand over" }));
    expect(
      await within(dialog).findByText("Choose the doctor you’re handing over to"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the working diagnosis")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox", { name: /Hand over to/ }));
    // The doctor handing over isn't offered.
    expect(screen.queryByRole("option", { name: "Dr. Raphael Jonnas" })).not.toBeInTheDocument();
    await pickOption("Dr. Sarah Adeyemi");
    await user.type(within(dialog).getByLabelText(/Working diagnosis/), "Acute asthma");
    await user.type(within(dialog).getByLabelText(/Current clinical status/), "Stable");
    await user.click(within(dialog).getByRole("button", { name: "Hand over" }));
    expect(
      await screen.findByText("Yemi Ojo is handed over to Dr. Sarah Adeyemi."),
    ).toBeInTheDocument();

    // The newest first: the one just sent, then the earlier one.
    await waitFor(() => expect(within(history).getAllByText("Sent")).toHaveLength(2));
    await user.click(within(history).getAllByText("Sent")[0]!.closest("button")!);
    expect(await within(history).findByText("Acute asthma")).toBeInTheDocument();
  });

  it("shows a nurse's received and sent handovers", async () => {
    const { user } = renderWithRouter(<HandoverHistory staff="nurse" myId="staff-3" />);
    const history = await screen.findByRole("region", { name: "Handovers" });
    expect(await within(history).findByText(/From Ibrahim Sani/)).toBeInTheDocument();
    await user.click(within(history).getByRole("combobox", { name: "Handovers" }));
    await pickOption("Sent");
    expect(await within(history).findByText("No handovers yet.")).toBeInTheDocument();
  });
});

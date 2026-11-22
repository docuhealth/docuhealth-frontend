import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DoctorPatientActions } from "@/features/doctor/components/doctor-patient-actions";
import { DoctorQueue } from "@/features/doctor/components/doctor-queue";
import { EncounterNotes } from "@/features/doctor/components/encounter-notes";
import { LabResults } from "@/features/doctor/components/lab-results";
import { renderWithRouter } from "@/test/render";

// The mock's queue: Tunde Bakare waiting; Ngozi Eze and Amina Yusuf in consultation with me
// (Raphael Jonnas, staff-1); Kelechi Nnamdi with a colleague; Zainab Bello seen. The queue test
// ends Amina's consultation, leaving Ngozi's for the patient-page tests.

const myId = "staff-1";

/** The table row for `name` (found even while a dialog hides the page from assistive tech). */
async function rowOf(name: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(name)).closest("tr")!;
}

describe("DoctorQueue", () => {
  it("shows whose consultation each is, and ends mine", async () => {
    const { user } = renderWithRouter(<DoctorQueue myId={myId} />);
    expect(within(await rowOf("Tunde Bakare")).getByText("Urgent")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /In consultation/ }));
    const amina = await rowOf("Amina Yusuf");
    expect(within(amina).getByText("You")).toBeInTheDocument();
    const kelechi = await rowOf("Kelechi Nnamdi");
    expect(within(kelechi).getByText("Sarah Adeyemi")).toBeInTheDocument();
    expect(within(kelechi).queryByRole("button")).not.toBeInTheDocument();

    await user.click(within(amina).getByRole("button", { name: "End Amina Yusuf’s consultation" }));
    expect(await screen.findByText("Amina Yusuf’s consultation is ended.")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Seen/ }));
    expect(await rowOf("Amina Yusuf")).toBeInTheDocument();
  });

  it("checks out a seen patient", async () => {
    const { user } = renderWithRouter(<DoctorQueue myId={myId} />);
    await user.click(await screen.findByRole("tab", { name: /Seen/ }));
    await user.click(
      within(await rowOf("Zainab Bello")).getByRole("button", { name: "Check out Zainab Bello" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Check out" });
    await user.click(within(dialog).getByRole("button", { name: "Check out" }));
    expect(await screen.findByText("Zainab Bello is checked out.")).toBeInTheDocument();
  });
});

describe("DoctorPatientActions", () => {
  const consultation = {
    checkInId: "dc-2",
    hin: "4200000000002",
    patientName: "Ngozi Eze",
    status: "doctor_active",
  };

  it("writes an encounter note in two steps, which then shows in the notes", async () => {
    const { user } = renderWithRouter(
      <>
        <DoctorPatientActions consultation={consultation} myId={myId} />
        <EncounterNotes hin={consultation.hin} />
      </>,
    );
    await user.click(await screen.findByRole("button", { name: "New encounter note" }));
    const dialog = await screen.findByRole("dialog", { name: "New encounter note" });
    await user.click(within(dialog).getByRole("button", { name: /Next/ }));
    expect(await within(dialog).findByText("Write the chief complaint")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Chief complaint/), "Fever for 2 days");
    await user.type(within(dialog).getByLabelText(/General examination/), "Febrile{Enter}Not pale");
    await user.click(within(dialog).getByRole("button", { name: /Next/ }));
    await user.type(await within(dialog).findByLabelText(/Primary diagnosis/), "Malaria");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(
      await within(dialog).findByText("Write at least one care instruction"),
    ).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/Care instructions/), "Complete the ACT course");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await screen.findByText("Ngozi Eze’s encounter note is saved.")).toBeInTheDocument();

    const notes = screen.getByRole("region", { name: "Encounter notes" });
    await user.click(await within(notes).findByRole("button", { name: /Malaria/ }));
    expect(await within(notes).findByText(/^Febrile\s+Not pale$/)).toBeInTheDocument();
  });

  it("asks a nurse for the patient's vitals", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions consultation={consultation} myId={myId} />,
    );
    await user.click(await screen.findByRole("button", { name: "Request vitals" }));
    const dialog = await screen.findByRole("dialog", { name: "Request vitals" });
    await user.type(within(dialog).getByLabelText("Note"), "Recheck temperature");
    await user.click(within(dialog).getByRole("button", { name: "Send request" }));
    expect(await screen.findByText("Vitals are requested for Ngozi Eze.")).toBeInTheDocument();
  });

  it("only offers to see the patient when the consultation isn't mine", async () => {
    renderWithRouter(
      <DoctorPatientActions
        consultation={{ ...consultation, checkInId: "dc-1", status: "doctor_idle" }}
        myId={myId}
      />,
    );
    expect(await screen.findByRole("button", { name: "See patient" })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "New encounter note" })).not.toBeInTheDocument(),
    );
  });
});

describe("EncounterNotes and LabResults", () => {
  it("adds to an earlier note, and shows lab results", async () => {
    const { user } = renderWithRouter(
      <>
        <EncounterNotes hin="4200000000002" />
        <LabResults hin="4200000000002" />
      </>,
    );
    await user.click(await screen.findByRole("button", { name: /Tension headache/ }));
    await user.type(await screen.findByLabelText("Add a note"), "Seen again, settled.");
    await user.click(screen.getByRole("button", { name: "Add note" }));
    expect(await screen.findByText("Seen again, settled.", { selector: "p" })).toBeInTheDocument();

    const lab = screen.getByRole("region", { name: "Lab results" });
    expect(await within(lab).findByText("13.2 g/dL")).toBeInTheDocument();
    expect(within(lab).getByText("Reviewed")).toBeInTheDocument();
  });
});

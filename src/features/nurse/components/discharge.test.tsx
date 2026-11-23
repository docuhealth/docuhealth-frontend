import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DoctorPatientActions } from "@/features/doctor/components/doctor-patient-actions";
import { TaskQueue } from "@/features/nurse/components/task-queue";
import { pickOption, renderWithRouter } from "@/test/render";

// Yemi Ojo's admission (admission-1): the doctor writes the discharge summary, which gives the
// nurses a discharge checklist task; the nurse completes it. The tests go in order.

const admission = {
  kind: "admission" as const,
  id: "admission-1",
  hin: "5413700000000",
  patientName: "Yemi Ojo",
  status: "active",
};

describe("Discharging an admitted patient", () => {
  it("lets the doctor write the discharge summary in two steps", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions visit={admission} myId="staff-1" ownHospital="LUTH" />,
    );
    await user.click(await screen.findByRole("button", { name: /More/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Discharge patient" }));
    const dialog = await screen.findByRole("dialog", { name: "Discharge patient" });
    expect(within(dialog).getByText("Step 1 of 2")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Continue" }));
    expect(await within(dialog).findByText("Enter the chief complaint")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the hospital course")).toBeInTheDocument();

    for (const [label, text] of [
      [/Chief complaint/, "Chest pain"],
      [/Primary diagnosis/, "Hypertensive urgency"],
      [/Secondary diagnosis/, "None"],
      [/Comorbidities/, "Type 2 diabetes"],
      [/Treatment plan/, "IV labetalol, then oral amlodipine"],
      [/Hospital course/, "BP settled over 48 hours"],
    ] as const) {
      await user.type(within(dialog).getByLabelText(label), text);
    }
    await user.click(within(dialog).getByRole("button", { name: "Continue" }));
    expect(await within(dialog).findByText("Step 2 of 2")).toBeInTheDocument();
    expect(within(dialog).getByText("No lab test has a result yet.")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Discharge patient" }));
    expect(
      await within(dialog).findByText("Choose the condition at discharge"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Choose the follow-up date")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("radio", { name: "Improved" }));
    await user.type(within(dialog).getByLabelText(/Care instructions/), "Low-salt diet");
    await user.click(within(dialog).getByRole("button", { name: "Add a drug" }));
    await user.type(within(dialog).getByPlaceholderText(/Search/), "Amlodipine");
    await user.type(within(dialog).getByLabelText(/Dose/), "5");
    await user.click(within(dialog).getByRole("combobox", { name: /How often/ }));
    await pickOption("Once daily");
    await user.type(within(dialog).getByLabelText(/For how long/), "30");
    await user.click(within(dialog).getByRole("radio", { name: "No follow-up" }));
    await user.click(within(dialog).getByRole("button", { name: "Discharge patient" }));
    expect(
      await screen.findByText(
        "Yemi Ojo’s discharge summary is saved. A nurse completes the discharge.",
      ),
    ).toBeInTheDocument();
  });

  it("lets the nurse complete the discharge checklist", async () => {
    const { user } = renderWithRouter(<TaskQueue admissionId="admission-1" />);
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Discharge checklist")).closest("tr")!;
    await user.click(within(row).getByRole("button", { name: /Claim/ }));
    await user.click(await screen.findByRole("tab", { name: /In progress/ }));
    const claimed = (await within(table).findByText("Discharge checklist")).closest("tr")!;
    await user.click(within(claimed).getByRole("button", { name: /Record/ }));

    const dialog = await screen.findByRole("dialog", { name: "Discharge checklist" });
    await user.click(within(dialog).getByRole("button", { name: "Discharge patient" }));
    expect(await within(dialog).findByText("Enter the blood pressure")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter what the patient was taught")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Blood pressure/), "128/82");
    await user.type(within(dialog).getByLabelText(/Temperature/), "36.8");
    await user.type(within(dialog).getByLabelText(/Heart rate/), "76");
    await user.type(within(dialog).getByLabelText(/Respiratory rate/), "16");
    await user.click(
      within(dialog).getByRole("checkbox", { name: "Peripheral IV cannula removed" }),
    );
    await user.click(within(dialog).getByRole("radio", { name: "Walks with help" }));
    await user.type(within(dialog).getByLabelText(/Education given/), "How to take amlodipine");
    await user.type(within(dialog).getByLabelText(/Follow-up instructions/), "GP in two weeks");
    await user.click(within(dialog).getByRole("button", { name: "Discharge patient" }));
    expect(await screen.findByText("Yemi Ojo is discharged.")).toBeInTheDocument();
  });

  it("sends the nurse to the patient's page for a checklist on the Tasks page", async () => {
    const { user } = renderWithRouter(<TaskQueue />);
    await user.click(await screen.findByRole("tab", { name: /Done/ }));
    expect(await screen.findByText("Discharge checklist")).toBeInTheDocument();
  });
});

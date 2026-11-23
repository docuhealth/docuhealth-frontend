import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareTaskHistory } from "@/features/doctor/components/care-task-history";
import { DoctorPatientActions } from "@/features/doctor/components/doctor-patient-actions";
import { pickOption, renderWithRouter } from "@/test/render";

// Yemi Ojo's admission (admission-1) is active, with three tasks in the care task mock.

const admission = {
  kind: "admission" as const,
  id: "admission-1",
  hin: "5413700000000",
  patientName: "Yemi Ojo",
  status: "active",
};

describe("Care tasks", () => {
  it("sets a glucose task for a week, which joins the task list", async () => {
    const { user } = renderWithRouter(
      <>
        <DoctorPatientActions visit={admission} myId="staff-1" ownHospital="LUTH" />
        <CareTaskHistory admissionId="admission-1" />
      </>,
    );
    const history = await screen.findByRole("region", { name: "Care tasks" });
    expect(await within(history).findByText("Vital signs")).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "New care task" }));
    const dialog = await screen.findByRole("dialog", { name: "New care task" });
    await user.click(within(dialog).getByRole("combobox", { name: /Task/ }));
    await pickOption("Blood glucose");
    await user.click(within(dialog).getByRole("button", { name: "Set task" }));
    expect(await within(dialog).findByText("Choose a schedule")).toBeInTheDocument();
    expect(within(dialog).getByText("Choose how often")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox", { name: /Schedule/ }));
    await pickOption("Fasting, early morning");
    await user.click(within(dialog).getByRole("combobox", { name: /How often/ }));
    await pickOption("Once daily");
    await user.click(within(dialog).getByRole("radio", { name: "For a set time" }));
    await user.type(within(dialog).getByLabelText(/For how long/), "7");
    await user.click(within(dialog).getByRole("button", { name: "Set task" }));
    expect(
      await screen.findByText("The blood glucose task is set for Yemi Ojo."),
    ).toBeInTheDocument();

    const row = (await within(history).findByText("Blood glucose")).closest("tr")!;
    expect(within(row).getByText("For 7 days")).toBeInTheDocument();
    expect(within(row).getByText("Once daily")).toBeInTheDocument();
  });

  it("asks a vitals task for at least one reading", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions visit={admission} myId="staff-1" ownHospital="LUTH" />,
    );
    await user.click(await screen.findByRole("button", { name: "New care task" }));
    const dialog = await screen.findByRole("dialog", { name: "New care task" });
    await user.click(within(dialog).getByRole("combobox", { name: /Task/ }));
    await pickOption("Vital signs");
    for (const name of ["Blood pressure", "Temperature", "Heart rate", "Respiratory rate"]) {
      await user.click(within(dialog).getByRole("checkbox", { name }));
    }
    await user.click(within(dialog).getByRole("button", { name: "Set task" }));
    expect(await within(dialog).findByText("Tick at least one vital sign")).toBeInTheDocument();
  });
});

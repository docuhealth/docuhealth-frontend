import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PatientManagement } from "@/features/hospital-admin/components/patient-management";
import { PatientProfile } from "@/features/hospital-admin/components/patient-profile";
import { pickOption, renderWithRouter } from "@/test/render";
import type { PatientTab } from "@/features/hospital-admin/api/schemas";

const renderTab = (tab: PatientTab) =>
  renderWithRouter(
    <PatientManagement period="month" onPeriodChange={() => {}} tab={tab} onTabChange={() => {}} />,
  );

describe("PatientManagement", () => {
  it("lists admitted patients with their ward, bed and doctor", async () => {
    renderTab("admitted");
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Yemi Ojo")).closest("tr")!;
    expect(within(row).getByText("General ward")).toBeInTheDocument();
    expect(within(row).getByText("Bed 1")).toBeInTheDocument();
    expect(within(row).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();
    // The check-in figures wait on the backend.
    expect(screen.getAllByText("Not available yet")).toHaveLength(2);
  });

  it("lists checked-out patients, with a dash for the visit length the API can't give", async () => {
    renderTab("checked_out");
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Hauwa Garba")).closest("tr")!;
    expect(within(row).getByText("Dr. Sarah Adeyemi")).toBeInTheDocument();
    expect(within(row).getByText("—")).toBeInTheDocument();
  });

  it("says filtering by ward isn't available yet", async () => {
    const { user } = renderTab("admitted");
    const table = await screen.findByRole("table");
    await within(table).findByText("Yemi Ojo");
    await user.click(screen.getByRole("combobox", { name: "Ward" }));
    await pickOption("ICU ward");
    expect(
      await within(table).findByText(
        "Filtering patients by ward isn’t available yet. It’s waiting on the backend.",
      ),
    ).toBeInTheDocument();
  });
});

describe("PatientProfile", () => {
  it("shows the patient's record, and that their visit history isn't available yet", async () => {
    renderWithRouter(<PatientProfile patientId="5413700000000" />);
    expect(await screen.findByRole("heading", { name: "Yemi Ojo" })).toBeInTheDocument();
    expect(screen.getByText("HMO Patient")).toBeInTheDocument();
    expect(screen.getByText("24 Allen Avenue, Ikeja, Lagos, Nigeria")).toBeInTheDocument();
    expect(screen.getByText("Visit history is waiting on the backend.")).toBeInTheDocument();
  });
});

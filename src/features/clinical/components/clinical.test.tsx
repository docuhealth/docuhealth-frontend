import { screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { VisitList } from "@/features/clinical/api/schemas";
import { ClinicalPatients } from "@/features/clinical/components/clinical-patients";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { renderWithRouter } from "@/test/render";

// The admitted and discharged patients are the hospital admin's mock data; Yemi Ojo is admitted
// (admission-1, General ward, bed 1).

function Patients() {
  const [list, setList] = useState<VisitList>("inpatient");
  return <ClinicalPatients dashboard="doctor" list={list} onListChange={setList} />;
}

describe("ClinicalPatients", () => {
  it("lists admitted patients, then those checked out", async () => {
    const { user } = renderWithRouter(<Patients />);
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Yemi Ojo")).closest("tr")!;
    expect(within(row).getByText("General ward")).toBeInTheDocument();
    expect(within(row).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "View Yemi Ojo" })).toHaveAttribute(
      "href",
      "/hospital/doctor/patients/admission-1?list=inpatient",
    );

    await user.click(screen.getByRole("tab", { name: /Checked out/ }));
    await waitFor(() => expect(within(table).queryByText("General ward")).not.toBeInTheDocument());
    expect(await within(table).findByText("Hauwa Garba")).toBeInTheDocument();
  });
});

describe("PatientPage", () => {
  it("shows the patient and the visit's records", async () => {
    const { user } = renderWithRouter(<PatientPage list="inpatient" visitId="admission-1" />);
    expect(await screen.findByRole("heading", { name: "Yemi Ojo" })).toBeInTheDocument();
    expect(screen.getByText("Admitted", { selector: "span *, span" })).toBeInTheDocument();
    expect(screen.getByText("24 Allen Avenue, Ikeja, Lagos, Nigeria")).toBeInTheDocument();
    expect(await screen.findByText("No vitals recorded.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Visit records" }));
    await user.click(await screen.findByRole("button", { name: /Progress note/ }));
    expect(await screen.findByText("Continue antibiotics; review tomorrow.")).toBeInTheDocument();
  });
});

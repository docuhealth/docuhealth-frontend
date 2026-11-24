import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DoctorPatientActions,
  type DoctorVisit,
} from "@/features/doctor/components/doctor-patient-actions";
import { renderWithRouter } from "@/test/render";

function renderActions(visit: Partial<DoctorVisit>) {
  return renderWithRouter(
    <DoctorPatientActions
      myId="staff-1"
      ownHospital="Lagos University Teaching Hospital"
      visit={{
        kind: "admission",
        id: "admission-1",
        hin: "5413700000000",
        patientName: "Yemi Ojo",
        status: "active",
        ...visit,
      }}
    />,
  );
}

describe("DoctorPatientActions", () => {
  it("still sets care tasks once the doctor has discharged, until the nurses do", async () => {
    const { user } = renderActions({ status: "awaiting_nurse_discharge" });
    expect(
      await screen.findByText("Discharged: waiting for the nurses’ discharge checklist."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Order/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "New care task" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("says why there's nothing to do instead of showing nothing", async () => {
    renderActions({ status: "discharged" });
    expect(await screen.findByText("Discharged: nothing more to order.")).toBeInTheDocument();
  });

  it("explains a check-in that's closed", async () => {
    renderActions({ kind: "check_in", id: "check-in-9", status: "closed" });
    expect(
      await screen.findByText("Checked out: nothing more to do on this visit."),
    ).toBeInTheDocument();
  });
});

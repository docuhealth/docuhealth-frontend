import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  DoctorPatientActions,
  type DoctorVisit,
} from "@/features/doctor/components/doctor-patient-actions";
import { sentOrders } from "@/mocks/doctor-orders";
import { pickOption, renderWithRouter } from "@/test/render";

// Ngozi Eze's check-in (dc-2) is in consultation with me (staff-1) in the doctor mock; Yemi Ojo's
// admission is active.

const myId = "staff-1";
const checkIn: DoctorVisit = {
  kind: "check_in",
  id: "dc-2",
  hin: "4200000000002",
  patientName: "Ngozi Eze",
  status: "doctor_active",
};
const admission: DoctorVisit = {
  kind: "admission",
  id: "admission-1",
  hin: "5413700000000",
  patientName: "Yemi Ojo",
  status: "active",
};

async function choose(user: UserEvent, menu: "Order" | "More", item: string) {
  await user.click(await screen.findByRole("button", { name: new RegExp(menu) }));
  await user.click(await screen.findByRole("menuitem", { name: item }));
}

describe("Doctor orders", () => {
  it("orders lab tests, confirming a repeat the API warns about", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions
        visit={checkIn}
        myId={myId}
        ownHospital="Lagos University Teaching Hospital"
      />,
    );
    await choose(user, "Order", "Lab tests");
    let dialog = await screen.findByRole("dialog", { name: "Order lab tests" });
    await user.type(within(dialog).getByRole("searchbox", { name: "Search tests" }), "blood");
    await user.click(await within(dialog).findByRole("checkbox", { name: /Full Blood Count/ }));
    await user.click(within(dialog).getByRole("button", { name: "Order 1 test" }));
    expect(await screen.findByText("The test is ordered for Ngozi Eze.")).toBeInTheDocument();
    expect(sentOrders.lab?.at(-1)).toMatchObject({
      patient: "4200000000002",
      check_in: "dc-2",
      items: [{ test: "test-fbc" }],
    });

    // The same test again: the API warns, and the doctor orders it anyway.
    await choose(user, "Order", "Lab tests");
    dialog = await screen.findByRole("dialog", { name: "Order lab tests" });
    await user.click(await within(dialog).findByRole("checkbox", { name: /Full Blood Count/ }));
    await user.click(within(dialog).getByRole("button", { name: "Order 1 test" }));
    const warning = await within(dialog).findByRole("alert");
    expect(warning).toHaveTextContent("ordered for this patient in the last 24 hours");
    await user.click(within(warning).getByRole("button", { name: "Order anyway" }));
    expect(await screen.findByText("The test is ordered for Ngozi Eze.")).toBeInTheDocument();
    expect(sentOrders.lab?.at(-1)).toMatchObject({ ignore_duplicate_warning: true });
  });

  it("orders scans found by searching", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions
        visit={checkIn}
        myId={myId}
        ownHospital="Lagos University Teaching Hospital"
      />,
    );
    await choose(user, "Order", "Scans");
    const dialog = await screen.findByRole("dialog", { name: "Order scans" });
    await user.type(within(dialog).getByRole("searchbox", { name: "Search scans" }), "chest");
    await user.click(await within(dialog).findByRole("button", { name: "Add XR Chest 2 Views" }));
    await user.click(within(dialog).getByRole("button", { name: "Order 1 scan" }));
    expect(await screen.findByText("The scan is ordered for Ngozi Eze.")).toBeInTheDocument();
    expect(sentOrders.scan?.at(-1)).toMatchObject({ items: [{ scan: "scan-cxr" }] });
  });

  it("prescribes a catalogue drug and a typed one", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions
        visit={checkIn}
        myId={myId}
        ownHospital="Lagos University Teaching Hospital"
      />,
    );
    await choose(user, "Order", "Prescribe drugs");
    const dialog = await screen.findByRole("dialog", { name: "Prescribe" });

    await user.type(within(dialog).getByLabelText(/^Drug/), "amox");
    await user.click(
      await within(dialog).findByRole("button", { name: /Amoxicillin \(Oral Pill\) 500 mg/ }),
    );
    expect(within(dialog).getByText("From the catalogue: 500 mg Cap.")).toBeInTheDocument();
    await user.type(within(dialog).getAllByLabelText(/^Dose/)[0]!, "500");
    await user.click(within(dialog).getAllByRole("combobox", { name: /How often/ })[0]!);
    await pickOption("Three times daily");
    await user.type(within(dialog).getAllByLabelText(/For how long/)[0]!, "5");

    await user.click(within(dialog).getByRole("button", { name: "Add another drug" }));
    await user.type(within(dialog).getAllByLabelText(/^Drug/)[1]!, "Zinc syrup");
    await user.type(within(dialog).getAllByLabelText(/^Dose/)[1]!, "10");
    await user.clear(within(dialog).getAllByLabelText(/^Unit/)[1]!);
    await user.type(within(dialog).getAllByLabelText(/^Unit/)[1]!, "ml");
    await user.click(within(dialog).getAllByRole("combobox", { name: /How often/ })[1]!);
    await pickOption("Once daily");
    await user.type(within(dialog).getAllByLabelText(/For how long/)[1]!, "10");
    await user.type(within(dialog).getByLabelText("Allergies"), "Penicillin");

    await user.click(within(dialog).getByRole("button", { name: "Send to pharmacy" }));
    expect(
      await screen.findByText("The prescription for Ngozi Eze is sent to the pharmacy."),
    ).toBeInTheDocument();
    expect(sentOrders.drug?.at(-1)).toMatchObject({
      check_in: "dc-2",
      drugs: [
        {
          catalog_drug: "308191",
          dosage: {
            quantity: 500,
            unit: "mg",
            frequency: "tds",
            duration: { value: 5, rate: "days" },
            allergies: ["Penicillin"],
          },
        },
        {
          manual_drug: { name: "Zinc syrup", route: "Oral" },
          dosage: { quantity: 10, unit: "ml", frequency: "od" },
        },
      ],
    });
  });

  it("requests admission to a free bed, and refers out", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions
        visit={checkIn}
        myId={myId}
        ownHospital="Lagos University Teaching Hospital"
      />,
    );
    await choose(user, "More", "Request admission");
    let dialog = await screen.findByRole("dialog", { name: "Request admission" });
    await user.click(within(dialog).getByRole("combobox", { name: /Ward/ }));
    await pickOption("General ward (3 free)");
    await user.click(within(dialog).getByRole("combobox", { name: /Bed/ }));
    await pickOption("Bed 2");
    await user.click(within(dialog).getByRole("button", { name: "Request admission" }));
    expect(await screen.findByText(/Admission is requested for Ngozi Eze/)).toBeInTheDocument();
    expect(sentOrders.admission?.at(-1)).toMatchObject({
      check_in: "dc-2",
      bed: "ward-gen-bed-2",
    });

    await choose(user, "More", "Refer out");
    dialog = await screen.findByRole("dialog", { name: "Refer out" });
    await user.click(within(dialog).getByRole("button", { name: "Refer" }));
    expect(await within(dialog).findByText("Choose the hospital")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("combobox", { name: /Hospital/ }));
    await pickOption("UNTH Enugu");
    await user.type(within(dialog).getByLabelText(/Reason/), "Needs a neurosurgeon");
    await user.click(within(dialog).getByRole("button", { name: "Refer" }));
    expect(await screen.findByText("Ngozi Eze is referred to UNTH Enugu.")).toBeInTheDocument();
  });

  it("orders and transfers for an admitted patient, without a consultation", async () => {
    const { user } = renderWithRouter(
      <DoctorPatientActions
        visit={admission}
        myId={myId}
        ownHospital="Lagos University Teaching Hospital"
      />,
    );
    expect(screen.queryByRole("button", { name: "New encounter note" })).not.toBeInTheDocument();
    await choose(user, "More", "Transfer to another bed");
    const dialog = await screen.findByRole("dialog", { name: "Transfer to another bed" });
    await user.click(within(dialog).getByRole("combobox", { name: /Ward/ }));
    await pickOption("General ward (3 free)");
    await user.click(within(dialog).getByRole("combobox", { name: /Bed/ }));
    await pickOption("Bed 3");
    await user.click(within(dialog).getByRole("button", { name: "Transfer" }));
    expect(await screen.findByText("Yemi Ojo is moved.")).toBeInTheDocument();
    expect(sentOrders.transfer?.at(-1)).toEqual({
      admission: "admission-1",
      new_bed: "ward-gen-bed-3",
    });
  });
});

import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NurseOverview } from "@/features/nurse/components/nurse-overview";
import { NursingEncounters } from "@/features/nurse/components/nursing-encounters";
import { renderWithRouter } from "@/test/render";

// The mock's queue: Adaeze Nwankwo waiting, Musa Bello claimed by me (Heritech Riel, staff-3),
// Grace Udo claimed by a colleague, Femi Ade with a doctor, Ruth Etim closed.

const me = { id: "staff-3", name: "Heritech Riel" };

/** The table row for `name` (found even while a dialog hides the page from assistive tech). */
async function rowOf(name: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(name)).closest("tr")!;
}

/** Fill in a full set of vitals in the open dialog. */
async function typeVitals(user: UserEvent, dialog: HTMLElement) {
  await user.type(within(dialog).getByLabelText(/Blood pressure/), "120/80");
  await user.type(within(dialog).getByLabelText(/Temperature/), "36.8");
  await user.type(within(dialog).getByLabelText(/Heart rate/), "72");
  await user.type(within(dialog).getByLabelText(/Respiratory rate/), "16");
}

describe("NursingEncounters", () => {
  it("shows who has each waiting check-in, and claims a free one", async () => {
    const { user } = renderWithRouter(<NursingEncounters me={me} />);
    expect(within(await rowOf("Musa Bello")).getByText("Claimed by you")).toBeInTheDocument();
    const grace = await rowOf("Grace Udo");
    expect(within(grace).getByText("With Chidi Okafor")).toBeInTheDocument();
    expect(within(grace).queryByRole("button")).not.toBeInTheDocument();

    await user.click(within(await rowOf("Adaeze Nwankwo")).getByRole("button", { name: /Claim/ }));
    expect(await screen.findByText("Adaeze Nwankwo is yours to assess.")).toBeInTheDocument();
    expect(
      await within(await rowOf("Adaeze Nwankwo")).findByRole("button", { name: /Assess/ }),
    ).toBeInTheDocument();
  });

  it("assesses a patient and sends them to the doctor", async () => {
    const { user } = renderWithRouter(<NursingEncounters me={me} />);
    await user.click(within(await rowOf("Musa Bello")).getByRole("button", { name: /Assess/ }));
    const dialog = await screen.findByRole("dialog", { name: "Nursing assessment" });

    await user.click(within(dialog).getByRole("button", { name: "Send to doctor" }));
    expect(await within(dialog).findByText("Enter the blood pressure")).toBeInTheDocument();
    expect(within(dialog).getByText("Choose how urgent it is")).toBeInTheDocument();

    await typeVitals(user, dialog);
    await user.click(within(dialog).getByRole("radio", { name: "Urgent" }));
    await user.click(within(dialog).getByRole("button", { name: "Send to doctor" }));
    expect(await screen.findByText("Musa Bello is sent to the doctor.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Sent to doctor/ }));
    const sent = await rowOf("Musa Bello");
    expect(within(sent).getByText("Urgent")).toBeInTheDocument();
    expect(within(sent).getByText("Waiting for a doctor")).toBeInTheDocument();
  });
});

describe("NurseOverview", () => {
  it("takes the vitals a doctor asked for", async () => {
    const { user } = renderWithRouter(<NurseOverview firstName="Heritech" />);
    const requests = await screen.findByRole("list", { name: "Vitals requests" });
    await user.click(within(requests).getByRole("button", { name: "Take Femi Ade’s vitals" }));
    const dialog = await screen.findByRole("dialog", { name: "Take vitals" });
    expect(within(dialog).getByText("Recheck BP before the next dose.")).toBeInTheDocument();

    await typeVitals(user, dialog);
    await user.type(within(dialog).getByLabelText(/Height/), "180");
    await user.type(within(dialog).getByLabelText(/Weight/), "81");
    expect(within(dialog).getByText("BMI: 25")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Send vitals" }));
    expect(
      await screen.findByText("Femi Ade’s vitals are sent to the doctor."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("No vitals requests waiting.")).toBeInTheDocument(),
    );
  });

  it("lists admitted patients, flagging those without an admission note", async () => {
    renderWithRouter(<NurseOverview firstName="Heritech" />);
    const admitted = await screen.findByRole("list", { name: "Admitted patients" });
    const yemi = within(admitted).getByRole("link", { name: "Yemi Ojo" });
    expect(yemi).toHaveAttribute("href", "/hospital/nurse/patients/admission-1?list=inpatient");
    expect(within(admitted).getByText("Needs admission note")).toBeInTheDocument();
  });
});

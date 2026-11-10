import { fireEvent, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RegisterPatientDialog } from "@/features/receptionist/components/register-patient-dialog";
import { renderWithProviders } from "@/test/render";

const navigate = vi.fn();
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useNavigate: () => navigate,
}));

/** Clears a field first: dev prefill may have filled it already. */
async function fill(user: UserEvent, label: RegExp, value: string) {
  const field = screen.getByLabelText(label);
  await user.clear(field);
  await user.type(field, value);
}

/** Picks from one of the dialog's selects. The list ignores the pointer while it opens. */
async function choose(user: UserEvent, label: RegExp, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

async function findGuardian(user: UserEvent, hin: string) {
  await screen.findByRole("dialog", { name: "Who is bringing the child?" });
  await fill(user, /Enter HIN/, hin);
  await screen.findByText("1 match");
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function linkAs(user: UserEvent, relationship: string) {
  await screen.findByRole("dialog", { name: "Link guardian and child" });
  await choose(user, /Relationship to child/, relationship);
  await user.click(screen.getByRole("radio", { name: "Verified" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

/** Opens and closes the dialog as the dashboard does. */
function Harness() {
  const [open, setOpen] = useState(true);
  return <RegisterPatientDialog open={open} onOpenChange={setOpen} />;
}

describe("RegisterPatientDialog", () => {
  it("registers a child, links a second adult, then checks the child in", async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole("radio", { name: /Kid \(Dependent\)/ }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Adeola Williams (36) brings the child.
    await findGuardian(user, "12334567890");

    await screen.findByRole("dialog", { name: "Who is the child?" });
    expect(screen.getByText("Guardian")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Register new child" }));
    await fill(user, /First name/, "Chidi");
    await fill(user, /Last name/, "Williams");
    await fill(user, /Date of birth/, "14032019");
    await choose(user, /Gender/, "Male");
    await user.click(screen.getByRole("button", { name: "Register child" }));

    await linkAs(user, "Mother");
    const registered = await screen.findByRole("dialog", { name: "Child registered!" });
    expect(registered).toHaveTextContent("Chidi Williams is linked to Adeola Williams.");
    expect(registered).toHaveTextContent(/Kid’s HIN: \d{3}-\d{3}-\d{3}-\d{2}/);

    // Tunde Williams links to the same child, straight from the guardian to the link.
    await user.click(within(registered).getByRole("button", { name: "Add second adult" }));
    await findGuardian(user, "12334567893");
    await linkAs(user, "Father");
    const linked = await screen.findByRole("dialog", { name: "Child linked!" });
    expect(linked).toHaveTextContent("Chidi Williams is linked to Tunde Williams.");

    await user.click(within(linked).getByRole("button", { name: "Check in" }));
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/hospital/receptionist/patients/$patientId" }),
    );
  });

  it("offers to create a guardian when nobody has the HIN", async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole("radio", { name: /Kid \(Dependent\)/ }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("dialog", { name: "Who is bringing the child?" });
    await fill(user, /Enter HIN/, "99999999999");
    expect(await screen.findByText("No guardian found")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create new guardian" }));
    await screen.findByRole("dialog", { name: "Guardian Information" });
    // The guardian's email is optional; their phone gets the code.
    expect(screen.getByLabelText(/Email/)).not.toBeRequired();
    await fill(user, /First name/, "Adaeze");
    await fill(user, /Last name/, "Okafor");
    await choose(user, /Gender/, "Female");
    await user.clear(screen.getByLabelText(/Email/));
    await fill(user, /Phone Number/, "0803 412 7781");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("dialog", { name: "Verify phone number" })).toHaveTextContent(
      "Enter the 6-digit code we sent to 0803 412 7781.",
    );
  });
});

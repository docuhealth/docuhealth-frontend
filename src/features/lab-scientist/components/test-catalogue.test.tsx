import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestCatalogue } from "@/features/lab-scientist/components/test-catalogue";
import { useAuthStore } from "@/stores/auth-store";
import { pickOption, renderWithRouter } from "@/test/render";

const signInAsLabAdmin = () =>
  useAuthStore.getState().setSession({
    accountType: "staff",
    actingAs: [
      { staff_role: "lab_scientist", is_admin: true, facility: { id: "lab", type: "laboratory" } },
    ],
    user: { id: "lab-admin", name: "Relam Triom", email: "relam@lab.example.com", role: "" },
  });

const row = (name: RegExp) => screen.getByRole("row", { name });

describe("TestCatalogue", () => {
  afterEach(() => useAuthStore.getState().clearSession());

  it("lists the catalogue's tests, read-only for a lab scientist", async () => {
    const { user } = renderWithRouter(<TestCatalogue />);

    expect(await screen.findByRole("heading", { name: "Test catalogue" })).toBeInTheDocument();
    expect(await screen.findByText("Showing 1 to 4 of 4 entries")).toBeInTheDocument();
    expect(row(/Full Blood Count/)).toHaveTextContent(/Numeric · g\/dL.*1 day.*Set up/);
    expect(row(/ESR/)).toHaveTextContent("Not set up");
    expect(screen.queryByRole("button", { name: "Add test" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^(Edit|Set up) / })).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search tests" }), "liver");
    expect(await screen.findByText("Showing 1 to 1 of 1 entries")).toBeInTheDocument();
    expect(row(/Liver Function Test/)).toBeInTheDocument();
  });

  it("lets the lab's admin add a test the lab hasn't set up", async () => {
    signInAsLabAdmin();
    const { user } = renderWithRouter(<TestCatalogue />);
    await screen.findByText("Showing 1 to 4 of 4 entries");

    await user.click(screen.getByRole("button", { name: "Add test" }));
    const dialog = await screen.findByRole("dialog", { name: "Add test" });
    await user.click(within(dialog).getByRole("button", { name: "Add test" }));
    expect(await within(dialog).findByText("Pick a test")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox", { name: "Category" }));
    await pickOption("Haematology");
    await user.click(within(dialog).getByRole("combobox", { name: /^Test/ }));
    // Full Blood Count is set up already, so only ESR is offered.
    expect(screen.queryByRole("option", { name: "Full Blood Count" })).not.toBeInTheDocument();
    await pickOption("ESR");

    await user.type(within(dialog).getByRole("textbox", { name: /Critical low/ }), "0");
    await user.type(within(dialog).getByRole("textbox", { name: /Critical high/ }), "100");
    await user.type(within(dialog).getByRole("textbox", { name: /Minimum/ }), "0");
    await user.type(within(dialog).getByRole("textbox", { name: /Maximum/ }), "20");
    await user.click(within(dialog).getByRole("button", { name: "Add test" }));

    expect(await screen.findByText("ESR is set up for your lab.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Edit ESR" })).toBeInTheDocument();
    expect(row(/ESR/)).toHaveTextContent(/Numeric · mg\/dL.*1 day.*Set up/);
  });

  it("lets the lab's admin edit a test's details", async () => {
    signInAsLabAdmin();
    const { user } = renderWithRouter(<TestCatalogue />);

    await user.click(await screen.findByRole("button", { name: "Edit Fasting Blood Glucose" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit Fasting Blood Glucose" });
    // It opens on the saved details.
    expect(within(dialog).getByRole("textbox", { name: /Turnaround time/ })).toHaveValue("4");
    expect(within(dialog).getByRole("textbox", { name: /Critical high/ })).toHaveValue("400");
    expect(within(dialog).getByRole("textbox", { name: /Maximum/ })).toHaveValue("100");

    const low = within(dialog).getByRole("textbox", { name: /Critical low/ });
    await user.clear(low);
    await user.type(low, "500");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(
      await within(dialog).findByText("Make this higher than the critical low"),
    ).toBeInTheDocument();

    await user.clear(low);
    await user.type(low, "50");
    const turnaround = within(dialog).getByRole("textbox", { name: /Turnaround time/ });
    await user.clear(turnaround);
    await user.type(turnaround, "6");
    await user.click(within(dialog).getByRole("button", { name: "Add range" }));
    const ranges = within(dialog).getAllByRole("listitem", { name: /Reference range/ });
    expect(ranges).toHaveLength(2);
    await user.click(within(dialog).getByRole("button", { name: "Remove range 2" }));
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Fasting Blood Glucose is updated.")).toBeInTheDocument();
    await screen.findByText("6 hours");
    expect(row(/Fasting Blood Glucose/)).toHaveTextContent(/6 hours.*Set up/);
  });
});

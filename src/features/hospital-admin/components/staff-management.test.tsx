import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffManagement } from "@/features/hospital-admin/components/staff-management";
import { pickOption, renderWithRouter } from "@/test/render";

/** The table row for `name` (found even while a dialog hides the page from assistive tech). */
async function rowOf(name: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(name)).closest("tr")!;
}

describe("StaffManagement", () => {
  it("filters the team by status, and says admins can't be picked out yet", async () => {
    const { user } = renderWithRouter(<StaffManagement />);
    const table = await screen.findByRole("table");
    expect(await within(table).findByText("Raphael Jonnas")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Show" }));
    await pickOption("Removed");
    await waitFor(() =>
      expect(within(table).queryByText("Raphael Jonnas")).not.toBeInTheDocument(),
    );
    expect(within(table).getByText("Fola Tola")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Show" }));
    await pickOption("Admins");
    expect(
      await within(table).findByText(
        "Showing only admins isn’t available yet. It’s waiting on the backend.",
      ),
    ).toBeInTheDocument();
  });

  it("removes a member, then puts them back with Undo", async () => {
    const { user } = renderWithRouter(<StaffManagement />);
    const row = await rowOf("Sarah Adeyemi");
    await user.click(within(row).getByRole("button", { name: "Actions for Sarah Adeyemi" }));
    await user.click(await screen.findByRole("menuitem", { name: /Remove from team/ }));
    const confirm = await screen.findByRole("dialog", { name: "Remove from team" });
    await user.click(within(confirm).getByRole("button", { name: "Remove" }));

    const done = await screen.findByRole("dialog", { name: "Member removed!" });
    expect(await within(await rowOf("Sarah Adeyemi")).findByText("Removed")).toBeInTheDocument();
    await user.click(within(done).getByRole("button", { name: "Undo" }));
    expect(await screen.findByText("Sarah Adeyemi is back on the team.")).toBeInTheDocument();
    expect(await within(await rowOf("Sarah Adeyemi")).findByText("On team")).toBeInTheDocument();
  });

  it("can't give admin access yet", async () => {
    const { user } = renderWithRouter(<StaffManagement />);
    const row = await rowOf("Heritech Riel");
    await user.click(within(row).getByRole("button", { name: "Actions for Heritech Riel" }));
    await user.click(await screen.findByRole("menuitem", { name: /Make Admin/ }));
    const confirm = await screen.findByRole("dialog", { name: "Make admin" });
    await user.click(within(confirm).getByRole("button", { name: "Grant admin access" }));
    expect(
      await screen.findByText(
        "Giving admin access isn’t available yet. It’s waiting on the backend.",
      ),
    ).toBeInTheDocument();
  });
});

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HealthPersonnel } from "@/features/staff/components/health-personnel";
import { pickOption, renderWithProviders } from "@/test/render";

describe("HealthPersonnel", () => {
  it("pages through the staff, and narrows them by role and search", async () => {
    const { user } = renderWithProviders(<HealthPersonnel />);
    const table = await screen.findByRole("table");
    expect(await within(table).findByText("Kemi Adewale")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 10 of 12 entries")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await pickOption("Nurse");
    expect(await screen.findByText("Showing 1 to 3 of 3 entries")).toBeInTheDocument();
    expect(within(table).queryByText("Kemi Adewale")).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search staff" }), "zzz");
    expect(await within(table).findByText("No one matches your search.")).toBeInTheDocument();
  });
});

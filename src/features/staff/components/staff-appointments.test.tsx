import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffAppointments } from "@/features/staff/components/staff-appointments";
import { renderWithProviders } from "@/test/render";

describe("StaffAppointments", () => {
  it("lists today's appointments and closes one, which leaves its row without a Close button", async () => {
    const { user } = renderWithProviders(<StaffAppointments scope="mine" />);
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Daniel Martins")).closest("tr")!;
    expect(within(row).getByText("Confirmed")).toBeInTheDocument();
    // The completed one has nothing to close.
    const done = within(table).getByText("Ibrahim Lawal").closest("tr")!;
    expect(within(done).queryByRole("button", { name: /Close/ })).not.toBeInTheDocument();

    await user.click(
      within(row).getByRole("button", { name: "Close Daniel Martins’s appointment" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Close appointment" });
    await user.click(within(dialog).getByRole("button", { name: "Close appointment" }));
    expect(await screen.findByText("Daniel Martins’s appointment is closed.")).toBeInTheDocument();
    expect(await within(row).findByText("Completed")).toBeInTheDocument();
  });

  it("switches to upcoming and past appointments", async () => {
    const { user } = renderWithProviders(<StaffAppointments scope="hospital" />);
    const table = await screen.findByRole("table");

    // The hospital's appointments (the front desk's mock data).
    await user.click(screen.getByRole("tab", { name: /Upcoming/ }));
    expect(await within(table).findByText("Halima Abubakar")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Past/ }));
    await waitFor(() =>
      expect(within(table).queryByText("Halima Abubakar")).not.toBeInTheDocument(),
    );
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  });
});

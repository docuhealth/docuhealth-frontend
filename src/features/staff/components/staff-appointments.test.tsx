import { screen, waitFor, within } from "@testing-library/react";
import { http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { StaffAppointments } from "@/features/staff/components/staff-appointments";
import { server } from "@/mocks/node";
import { pickOption, renderWithProviders } from "@/test/render";

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

  it("says why an appointment with no staff member can't be marked as seen", async () => {
    const { user } = renderWithProviders(<StaffAppointments scope="mine" />);
    await user.click(await screen.findByRole("tab", { name: /Upcoming/ }));
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Grace Okon")).closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Close Grace Okon’s appointment" }));
    const dialog = await screen.findByRole("dialog", { name: "Close appointment" });
    await user.click(within(dialog).getByRole("button", { name: "Close appointment" }));
    expect(
      await screen.findByText(/This appointment isn’t booked with anyone, so it can’t be marked/),
    ).toBeInTheDocument();
  });

  it("has no Tomorrow tab for a member's own, and one for the hospital's", async () => {
    const { user, unmount } = renderWithProviders(<StaffAppointments scope="mine" />);
    expect(await screen.findByRole("tab", { name: /Upcoming/ })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Tomorrow/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<StaffAppointments scope="hospital" />);
    const table = await screen.findByRole("table");
    // The hospital's appointments (the front desk's mock data): `upcoming` starts after tomorrow.
    await user.click(screen.getByRole("tab", { name: /Tomorrow/ }));
    expect(await within(table).findByText("Halima Abubakar")).toBeInTheDocument();
  });

  it("switches to upcoming and past appointments", async () => {
    const { user } = renderWithProviders(<StaffAppointments scope="hospital" />);
    const table = await screen.findByRole("table");

    await user.click(screen.getByRole("tab", { name: /Upcoming/ }));
    expect(await within(table).findByText("Precious Obi")).toBeInTheDocument();
    expect(within(table).queryByText("Halima Abubakar")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Past/ }));
    await waitFor(() => expect(within(table).queryByText("Precious Obi")).not.toBeInTheDocument());
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("lets the nurse give an appointment to a doctor, which then leaves their list", async () => {
    let sent: unknown = null;
    server.use(
      // Records the request, then lets the mock API answer it.
      http.patch(
        `${env.VITE_API_URL}/api/hospital-ops/appointments/:sqid/assign`,
        async ({ request }) => {
          sent = await request.clone().json();
        },
      ),
    );
    const { user } = renderWithProviders(<StaffAppointments scope="mine" canAssign />);
    await user.click(await screen.findByRole("tab", { name: /Upcoming/ }));
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Olumide Ajayi")).closest("tr")!;
    await user.click(
      within(row).getByRole("button", { name: "Assign Olumide Ajayi’s appointment to a doctor" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Assign to a doctor" });
    await user.click(within(dialog).getByRole("button", { name: "Assign" }));
    expect(await within(dialog).findByText("Choose the doctor")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox", { name: /Doctor/ }));
    await pickOption("Dr. Sarah Adeyemi");
    await user.click(within(dialog).getByRole("button", { name: "Assign" }));
    expect(
      await screen.findByText(
        "Olumide Ajayi’s appointment is with Dr. Sarah Adeyemi. It’s off your list now.",
      ),
    ).toBeInTheDocument();
    // Only the doctor: the time and note didn't change.
    expect(sent).toEqual({ doctor_id: "staff-2" });
    await waitFor(() => expect(within(table).queryByText("Olumide Ajayi")).not.toBeInTheDocument());
  });
});

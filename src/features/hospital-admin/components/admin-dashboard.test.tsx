import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { AdminDashboard } from "@/features/hospital-admin/components/admin-dashboard";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

// The overview, the profile and the cards' lists load together, which can take longer than the
// default second when the suite runs in parallel.
const OVERVIEW_LOAD = { timeout: 5000 };

/** The stat card labelled `label`. */
async function card(label: string) {
  return (await screen.findByText(label, {}, OVERVIEW_LOAD)).closest("div")!;
}

describe("AdminDashboard", () => {
  it("shows the team's size, who joined this period, admins and facilities", async () => {
    renderWithRouter(<AdminDashboard period="month" onPeriodChange={() => {}} />);
    // The signed-in admin plus the 10 colleagues still on the team.
    expect(await card("Total Staff")).toHaveTextContent("11");
    const added = await card("Added this month");
    expect(added).toHaveTextContent("4");
    expect(added).toHaveTextContent("+2 more vs last month");
    expect(await card("Administrators")).toHaveTextContent("1");
    expect(await card("Total Facilities")).toHaveTextContent("4");
  });

  it("counts staff by role in one call, with 0 for roles no one holds", async () => {
    renderWithRouter(<AdminDashboard period="today" onPeriodChange={() => {}} />);
    expect(await card("Added today")).toHaveTextContent("1 fewer vs yesterday");
    const roleCount = (role: string) =>
      screen.getByText(role).parentElement!.querySelector("span:last-child")!.textContent;
    // The admin and three colleagues are doctors; the one radiographer has left the team.
    expect(roleCount("Doctors")).toBe("4");
    expect(roleCount("Nurses")).toBe("3");
    expect(roleCount("Radiographers")).toBe("0");
  });

  it("queues the open check-ins, longest wait first, leaving out closed ones", async () => {
    const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
    const checkIn = (sqid: string, name: string, status: string, minutes: number) => {
      const [firstname, lastname] = name.split(" ");
      const patient_info = { sqid: `patient-${sqid}`, firstname, lastname, hin: `DH-${sqid}` };
      return { sqid, patient_info, status, created_at: minutesAgo(minutes) };
    };
    // Newest first, as the API lists them.
    server.use(
      http.get(`${env.VITE_API_URL}/api/hospital-ops/patients-check-ins`, () =>
        HttpResponse.json({
          count: 4,
          next: null,
          previous: null,
          results: [
            checkIn("1", "Tunde Adeyemi", "pending", 12),
            checkIn("2", "Hauwa Garba", "nursing_active", 30),
            checkIn("3", "John Ekwueme", "doctor_seen", 63),
            checkIn("4", "Michael Oluwaseun", "closed", 140),
          ],
        }),
      ),
    );
    renderWithRouter(<AdminDashboard period="month" onPeriodChange={() => {}} />);
    const queue = (await screen.findByText("Queue Management", {}, OVERVIEW_LOAD)).closest(
      "section",
    )!;
    const table = within(queue).getByRole("table");
    await within(table).findByText("John Ekwueme");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    // Waits are counted from check-in (a minute more if the suite runs slowly).
    expect(rows[0]).toHaveTextContent(/John Ekwueme.*Completed.*6\d mins/);
    expect(rows[1]).toHaveTextContent(/Hauwa Garba.*In-progress/);
    expect(rows[2]).toHaveTextContent(/Tunde Adeyemi.*Pending/);
    expect(within(table).queryByText("Michael Oluwaseun")).not.toBeInTheDocument();
  });

  it("uploads a banner photo, then deletes it", async () => {
    const { user } = renderWithRouter(<AdminDashboard period="month" onPeriodChange={() => {}} />);
    await screen.findByText("Total Staff", {}, OVERVIEW_LOAD);
    const photo = new File(["banner"], "ward.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Banner photo"), photo);
    expect(await screen.findByText("Banner photo updated.")).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector("img[src$='ward.png']")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Banner photo options" }));
    await user.click(await screen.findByRole("menuitem", { name: /Delete Photo/ }));
    expect(await screen.findByText("Banner photo deleted.")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector("img[src$='ward.png']")).not.toBeInTheDocument(),
    );
  });
});

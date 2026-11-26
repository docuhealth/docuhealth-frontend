import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { RadiologistDashboard } from "@/features/radiologist/components/radiologist-dashboard";
import { RecentUploadsCard } from "@/features/radiologist/components/recent-uploads-card";
import { server } from "@/mocks/node";
import { pickOption, renderWithProviders, renderWithRouter } from "@/test/render";

const api = (path: string) => `${env.VITE_API_URL}${path}`;
const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");

/** The value and note of the overview's "Completed Scan" card. */
async function completedScans() {
  const label = await screen.findByText("Completed Scan", { selector: "dt" });
  return label.closest("div")!;
}

describe("RadiologistDashboard", () => {
  it("counts this month's completed scans from the activity chart", async () => {
    server.use(
      http.get(api("/api/radiology/activity-chart-data"), () =>
        HttpResponse.json({ JAN: 3, [MONTHS[new Date().getMonth()]!]: 41 }),
      ),
    );
    renderWithRouter(<RadiologistDashboard period="month" onPeriodChange={() => {}} />);

    const card = await completedScans();
    expect(within(card).getByText("41")).toBeInTheDocument();
    expect(within(card).getByText("Carried out this month")).toBeInTheDocument();
  });

  it("counts every completed scan for the other periods", async () => {
    renderWithRouter(<RadiologistDashboard period="week" onPeriodChange={() => {}} />);

    const card = await completedScans();
    expect(within(card).getByText("32")).toBeInTheDocument();
    expect(within(card).getByText("All completed so far")).toBeInTheDocument();
  });
});

describe("RecentUploadsCard today", () => {
  it("lists the patients scanned in the last 24 hours, with their latest scan", async () => {
    const { user } = renderWithProviders(<RecentUploadsCard />);
    await screen.findByText("Chioma Nwosu");

    await user.click(screen.getByRole("combobox", { name: "Recent uploads period" }));
    await pickOption("Today");

    // Five reports went up in the last day; the second-newest is still with the doctor.
    const table = screen.getByRole("table");
    // The week's six rows stay until today's arrive.
    await waitFor(() => expect(within(table).getAllByRole("row").slice(1)).toHaveLength(5));
    expect(within(table).getByText("Hauwa Garba")).toBeInTheDocument();
    const row = within(table).getByText("Chioma Nwosu").closest("tr")!;
    expect(within(row).getByText("Processing")).toBeInTheDocument();
    expect(within(table).queryByText("Chidinma Okeke")).not.toBeInTheDocument();
  });

  it("shows a recent patient whose scan isn't among the latest completed ones", async () => {
    server.use(
      http.get(api("/api/radiology/patients/recents"), () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              hin: "99999999999",
              firstname: "Ada",
              lastname: "Obi",
              gender: "female",
              dob: "1990-02-01",
              scanned_at: new Date().toISOString(),
            },
          ],
        }),
      ),
    );
    const { user } = renderWithProviders(<RecentUploadsCard />);
    await screen.findByText("Chioma Nwosu");

    await user.click(screen.getByRole("combobox", { name: "Recent uploads period" }));
    await pickOption("Today");

    const row = (await screen.findByText("Ada Obi")).closest("tr")!;
    expect(within(row).getByText("Scan result")).toBeInTheDocument();
    expect(within(row).getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("Chioma Nwosu")).not.toBeInTheDocument();
  });
});

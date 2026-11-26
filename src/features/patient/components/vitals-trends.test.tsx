import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { TrendsPage } from "@/features/patient/components/trends-page";
import { VitalSignsPage } from "@/features/patient/components/vital-signs-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient's readings (src/mocks/patient.ts): the newest 128/80 at ABC Hospital, then
// Reddington Lab, two at LUTH, and one a year for four earlier years (160/100 the highest).

beforeEach(() => {
  useAuthStore.getState().setSession({
    accountType: "patient",
    actingAs: [{ as: "self" }],
    user: {
      id: "me",
      name: "Chinonso Okafor",
      email: "c@example.com",
      role: "patient",
      hin: "1234567890123",
    },
  });
});

const noReadings = () =>
  server.use(
    http.get(`${env.VITE_API_URL}/api/records/vital-signs/mine`, () =>
      HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
    ),
  );

describe("Vital signs", () => {
  it("shows the newest reading of each vital and earlier readings by day", async () => {
    const { user } = renderWithRouter(<VitalSignsPage />);
    const tiles = await screen.findByRole("list", { name: "Latest readings" });
    expect(within(tiles).getAllByRole("listitem")).toHaveLength(8);
    expect(within(tiles).getByText("128/80")).toBeInTheDocument();
    expect(within(tiles).getByText("Within target")).toBeInTheDocument();
    expect(within(tiles).getByText("Slightly high")).toBeInTheDocument();
    expect(within(tiles).getByText(/ kg since /)).toBeInTheDocument();
    expect(within(tiles).getByText(/^Recorded /)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trends" })).toHaveAttribute(
      "href",
      "/patient/health/vitals/trends",
    );

    const earlier = screen.getByRole("region", { name: "Earlier readings" });
    const rows = within(earlier).getAllByRole("button");
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveTextContent("Reddington Lab · 8 readings");

    await user.click(rows[0]!);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("130/82 mmHg")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Elevated").length).toBeGreaterThan(0);
  });

  it("says when there are no readings yet", async () => {
    noReadings();
    renderWithRouter(<VitalSignsPage />);
    expect(await screen.findByText("No vital signs yet")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Trends" })).not.toBeInTheDocument();
  });
});

describe("Trends", () => {
  it("charts blood pressure by year and lists its readings", async () => {
    const { user } = renderWithRouter(<TrendsPage />);
    const latest = await screen.findByRole("region", { name: "Latest reading" });
    expect(within(latest).getByText("128/80")).toBeInTheDocument();
    // The chart's table, one row per year with a reading.
    const table = within(latest).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(6);
    expect(within(table).getByRole("row", { name: /160 100/ })).toBeInTheDocument();
    expect(within(latest).getByText("Target range")).toBeInTheDocument();

    const readings = screen.getByRole("list", { name: "All readings" });
    expect(within(readings).getAllByRole("listitem")).toHaveLength(5);
    expect(within(readings).getAllByText("Normal").length).toBeGreaterThan(0);
    expect(within(readings).getAllByText("Elevated").length).toBeGreaterThan(0);

    // The last year, by month.
    await user.click(within(latest).getByRole("tab", { name: "1Y" }));
    expect(within(table).queryByRole("row", { name: /160 100/ })).not.toBeInTheDocument();

    // Another vital: one series, no legend of series.
    await user.click(screen.getByRole("button", { name: "Pulse" }));
    expect(within(readings).getAllByText("72 bpm").length).toBeGreaterThan(0);
    expect(within(latest).queryByText("Systolic")).not.toBeInTheDocument();
  });

  it("says when there is nothing to chart", async () => {
    noReadings();
    renderWithRouter(<TrendsPage />);
    expect(await screen.findByText("No trends yet")).toBeInTheDocument();
  });
});

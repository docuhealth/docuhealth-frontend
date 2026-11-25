import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { ReceptionistDashboard } from "@/features/receptionist/components/receptionist-dashboard";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** A row of `GET /api/hospital-ops/patients-check-ins`. */
const checkIn = (sqid: string, name: string, hin: string, status: string, createdAt: string) => {
  const [firstname, lastname] = name.split(" ");
  return {
    sqid,
    patient_info: { sqid: `p-${sqid}`, firstname, lastname, hin },
    status,
    created_at: createdAt,
  };
};

/** The value and note of the stat card labelled `label`. */
function statCard(label: string) {
  const term = screen.getByText(label, { selector: "dt" });
  return term.nextElementSibling as HTMLElement;
}

describe("ReceptionistDashboard", () => {
  it("shows the operation metrics for the period", async () => {
    let period: string | null = null;
    server.use(
      http.get(api("/api/hospital-ops/operation-metrics"), ({ request }) => {
        period = new URL(request.url).searchParams.get("period");
        return HttpResponse.json({
          total_checkins: 1240,
          pending_checkins: 5,
          check_ins_this_hour: { count: 6, change: 50.0 },
          this_period_appointments: { count: 20, percent_change: 11.11 },
        });
      }),
    );
    renderWithRouter(<ReceptionistDashboard period="week" onPeriodChange={() => {}} />);

    expect(await screen.findByText("Total Check-ins")).toBeInTheDocument();
    expect(period).toBe("week");
    expect(statCard("Total Check-ins")).toHaveTextContent("1,240All time");
    // The hour's change is already a percentage.
    expect(statCard("Waiting in Queue")).toHaveTextContent("6Up50%vs. last hour");
    expect(statCard("Checked In Today")).toHaveTextContent("5Waiting for a nurse");
    expect(statCard("Today’s Appointments")).toHaveTextContent("20Up11.11%vs. last week");
  });

  it("says when there's nothing to compare with", async () => {
    server.use(
      http.get(api("/api/hospital-ops/operation-metrics"), () =>
        HttpResponse.json({
          total_checkins: 0,
          pending_checkins: 0,
          check_ins_this_hour: { count: 0, change: null },
          this_period_appointments: { count: 3, percent_change: null },
        }),
      ),
    );
    renderWithRouter(<ReceptionistDashboard period="today" onPeriodChange={() => {}} />);

    expect(await screen.findByText("Total Check-ins")).toBeInTheDocument();
    expect(statCard("Waiting in Queue")).toHaveTextContent("0Not available yet");
    expect(statCard("Today’s Appointments")).toHaveTextContent("3Not available yet");
  });

  it("lists open check-ins longest wait first, leaving out closed ones, and checks one out", async () => {
    let closed: string | null = null;
    server.use(
      http.get(api("/api/hospital-ops/patients-check-ins"), () =>
        HttpResponse.json({
          count: 3,
          next: null,
          previous: null,
          results: [
            checkIn("KNm960Z", "Adeola Williams", "12334567890", "pending", minutesAgo(15)),
            checkIn("Qp2rT7a", "Amaka Okafor", "DH12345678", "nursing_active", minutesAgo(40)),
            checkIn("vbVwBaG", "Chidi Okafor", "7894623012343", "closed", minutesAgo(60 * 24)),
          ],
        }),
      ),
      http.post(api("/api/hospital-ops/check-ins/:sqid/close"), ({ params }) => {
        closed = String(params.sqid);
        return new HttpResponse(null, { status: 200 });
      }),
    );
    const { user } = renderWithRouter(
      <ReceptionistDashboard period="today" onPeriodChange={() => {}} />,
    );

    const queue = (await screen.findByText("Queue Management")).closest("section") ?? document.body;
    await within(queue).findByText("Amaka Okafor");
    const rows = within(queue).getAllByRole("row");
    // The header, then Amaka (40 mins) before Adeola (15 mins); Chidi's check-in is closed.
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent(/Amaka Okafor.*In-progress.*40 mins/);
    expect(rows[2]).toHaveTextContent(/Adeola Williams.*Pending.*15 mins/);
    expect(screen.queryByText("Chidi Okafor")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Check out Adeola Williams" }));
    await user.click(await screen.findByRole("button", { name: /Complete Check-out/ }));
    expect(await screen.findByText("Adeola Williams is checked out.")).toBeInTheDocument();
    // Checking out closes the check-in, by its sqid.
    expect(closed).toBe("KNm960Z");
  });
});

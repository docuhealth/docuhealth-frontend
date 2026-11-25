import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { ConditionDetails } from "@/features/patient/components/condition-details";
import { ConditionsPage } from "@/features/patient/components/conditions-page";
import { VisitSummaryPage } from "@/features/patient/components/visit-summary-page";
import { VisitsPage } from "@/features/patient/components/visits-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient (src/mocks/patient.ts). Tests run without the mock dev server's pending
// records, so visit types, lab values, next steps and care plans are empty here.

const empty = () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] });

beforeEach(() => {
  useAuthStore.getState().setSession({
    accessToken: "token",
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

describe("Visits", () => {
  it("lists booked and past visits under their dividers, each with its tag", async () => {
    const { user } = renderWithRouter(<VisitsPage />);
    const past = await screen.findByRole("list", { name: "Past visits" });
    // Eight visit summaries, and one check-in with no summary yet.
    expect(within(past).getAllByRole("listitem")).toHaveLength(9);
    expect(
      within(past).getByRole("link", { name: /Follow-up · Internal Medicine/ }),
    ).toHaveAttribute("href", "/patient/health/visits/7");
    // The Reddington Lab visit shared nothing, nor has the LUTH check-in been written up.
    expect(within(past).getAllByText("No summary")).toHaveLength(2);
    expect(within(past).getAllByText("Summary")).toHaveLength(7);

    const upcoming = screen.getByRole("list", { name: "Upcoming visits" });
    expect(within(upcoming).getAllByText("Booked").length).toBeGreaterThan(0);

    // Without visit types, a past visit shows only under "All visits".
    await user.click(screen.getByRole("button", { name: "Admissions" }));
    expect(await screen.findByText("No visits here")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All visits" }));
    await user.click(screen.getByRole("button", { name: "Filter by facility" }));
    await user.click(screen.getByRole("button", { name: "LUTH" }));
    expect(
      within(screen.getByRole("list", { name: "Past visits" })).getAllByRole("listitem"),
    ).toHaveLength(3); // Two visit summaries and the check-in with none.
  });

  it("switches to Upcoming / Past tabs", async () => {
    const { user } = renderWithRouter(<VisitsPage />);
    await screen.findByRole("list", { name: "Past visits" });
    await user.click(screen.getByRole("button", { name: "Upcoming and past tabs" }));
    expect(screen.queryByRole("button", { name: "Admissions" })).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Upcoming visits" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Past visits" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Past (9)" }));
    expect(
      within(screen.getByRole("list", { name: "Past visits" })).getAllByRole("listitem"),
    ).toHaveLength(9);
    // Back to the list for the other tests: the layout is remembered on this device.
    await user.click(screen.getByRole("button", { name: "One list, by type" }));
  });

  it("says there are no visits yet, keeping the chips", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, empty),
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments/mine`, empty),
      http.get(`${env.VITE_API_URL}/api/patients/visits`, empty),
    );
    renderWithRouter(<VisitsPage />);
    expect(await screen.findByText("No visits yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Outpatient" })).toBeInTheDocument();
  });

  it("shows a visit's reason, note and what came of it", async () => {
    renderWithRouter(<VisitSummaryPage visitId="7" />);
    const reason = await screen.findByRole("region", { name: "Reason" });
    expect(reason).toHaveTextContent("Follow-up · Internal Medicine");
    const note = screen.getByRole("region", { name: "Note" });
    expect(note).toHaveTextContent("Blood pressure is now within target");
    expect(note).toHaveTextContent("Dr. Adaeze Okafor");

    const from = screen.getByRole("list", { name: "From this visit" });
    expect(within(from).getByText("Full Blood Count")).toBeInTheDocument();
    expect(await within(from).findByText("Medication · once daily")).toBeInTheDocument();
    expect(within(from).getByRole("link", { name: /Vital signs/ })).toHaveTextContent(
      "BP 128/80 · Pulse 72 · 78 kg",
    );
    expect(screen.getByRole("button", { name: "Download visit summary" })).toBeInTheDocument();
  });

  it("says when a facility shared no summary, and still lists the tests", async () => {
    renderWithRouter(<VisitSummaryPage visitId="6" />);
    expect(await screen.findByText("No visit summary")).toBeInTheDocument();
    expect(
      screen.getByText(/Reddington Lab didn’t share notes for this visit\./),
    ).toBeInTheDocument();
    const from = screen.getByRole("list", { name: "From this visit" });
    expect(within(from).getByText("Creatinine")).toBeInTheDocument();
    expect(within(from).getByText("HbA1c")).toBeInTheDocument();
  });
});

describe("Conditions", () => {
  it("lists the newest diagnosis as active and the rest as past", async () => {
    const { user } = renderWithRouter(<ConditionsPage />);
    const list = await screen.findByRole("list", { name: "Conditions" });
    expect(within(list).getByRole("link", { name: /High blood pressure/ })).toHaveAttribute(
      "href",
      "/patient/health/conditions/7",
    );
    expect(within(list).getByText("Active")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Past (5)" }));
    expect(
      within(screen.getByRole("list", { name: "Conditions" })).getAllByText("Resolved"),
    ).toHaveLength(5);
    expect(screen.getByText("Report a change")).toBeInTheDocument();
  });

  it("says when no conditions are recorded", async () => {
    server.use(http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, empty));
    renderWithRouter(<ConditionsPage />);
    expect(await screen.findByText("No conditions recorded")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Active (0)" })).toBeInTheDocument();
  });

  it("shows a condition's details and what goes with it", async () => {
    renderWithRouter(<ConditionDetails conditionId="7" />);
    expect(await screen.findByRole("heading", { name: "High blood pressure" })).toBeInTheDocument();
    expect(screen.getByText("What this means")).toBeInTheDocument();
    expect(screen.getByText("Follow-up · Internal Medicine")).toBeInTheDocument();

    const related = screen.getByRole("list", { name: "Related" });
    expect(within(related).getByRole("link", { name: /Amlodipine 10 mg/ })).toHaveAttribute(
      "href",
      "/patient/health/medications",
    );
    expect(await within(related).findByText("Blood pressure 128/80")).toBeInTheDocument();
  });
});

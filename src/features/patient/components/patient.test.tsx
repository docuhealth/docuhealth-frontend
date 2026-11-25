import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { ConditionsPage } from "@/features/patient/components/conditions-page";
import { PatientHealth } from "@/features/patient/components/patient-health";
import { PatientHome } from "@/features/patient/components/patient-home";
import { MedicationsPage } from "@/features/patient/components/medications-page";
import { VisitsPage } from "@/features/patient/components/visits-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient (src/mocks/patient.ts): Chinonso Okafor, three visits (the latest at ABC
// Hospital with high blood pressure, a full blood count and a chest X-ray), an appointment
// today, and one current and one past medicine.

beforeEach(() => {
  // No proxy requests here (they'd open first in Needs Your Attention): see family.test.tsx.
  server.use(
    http.get(`${env.VITE_API_URL}/api/patients/proxies/held`, () =>
      HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
    ),
  );
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

describe("Patient home", () => {
  it("shows the next appointment, what needs attention and the health snapshot", async () => {
    renderWithRouter(<PatientHome />);
    const appointment = await screen.findByRole("region", { name: "Upcoming appointment" });
    expect(await within(appointment).findByText("Dr. Isaac Adeyemi")).toBeInTheDocument();

    expect(await screen.findByRole("tab", { name: /Recent Results/ })).toBeInTheDocument();
    // On its tab and in the results list.
    expect(screen.getAllByText("Full Blood Count")).toHaveLength(2);
    expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);

    const snapshot = screen.getByRole("region", { name: "Health Snapshot" });
    expect(within(snapshot).getByText("128/80")).toBeInTheDocument();
    expect(snapshot).toHaveTextContent("Higher than healthy");
    // TODO(api): no glucose readings.
    expect(within(snapshot).getByText("Blood glucose")).toBeInTheDocument();
  });
});

describe("Patient home, with nothing on record yet", () => {
  it("says nothing is booked, all is caught up and there are no readings", async () => {
    const empty = () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, empty),
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments/mine`, empty),
      http.get(`${env.VITE_API_URL}/api/pharmacy/patients/drug-records`, empty),
    );
    renderWithRouter(<PatientHome />);
    expect(await screen.findByText("Nothing booked")).toBeInTheDocument();
    expect(await screen.findByText("You’re all caught up")).toBeInTheDocument();
    const snapshot = screen.getByRole("region", { name: "Health Snapshot" });
    expect(within(snapshot).getAllByText("No reading yet")).toHaveLength(4);
  });
});

describe("Patient health", () => {
  it("counts each kind of record and links the ones with pages", async () => {
    renderWithRouter(<PatientHealth />);
    expect(await screen.findByText("5 results")).toBeInTheDocument();
    expect(screen.getByText("1 current · 6 past")).toBeInTheDocument();
    expect(screen.getByText(/^9 visits · last /)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Diagnoses & conditions/ })).toHaveAttribute(
      "href",
      "/patient/health/conditions",
    );
  });
});

describe("Patient records", () => {
  it("lists the latest diagnosis as active and earlier ones as past", async () => {
    const { user } = renderWithRouter(<ConditionsPage />);
    expect(await screen.findByText("High blood pressure")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Past (5)" }));
    expect((await screen.findAllByText("Malaria")).length).toBe(2);
    expect(screen.queryByText("High blood pressure")).not.toBeInTheDocument();
  });

  it("lists upcoming and past visits together", async () => {
    renderWithRouter(<VisitsPage />);
    expect((await screen.findAllByText("Booked")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Fever and body aches")).toBeInTheDocument();
  });

  it("opens a medicine's prescription", async () => {
    const { user } = renderWithRouter(<MedicationsPage />);
    expect(await screen.findByText("Amlodipine 10 mg")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Prescription" }));
    const dialog = await screen.findByRole("dialog", { name: "Prescription" });
    expect(within(dialog).getByText("90 days")).toBeInTheDocument();
    expect(within(dialog).getByText("Tablet · Oral · Once daily")).toBeInTheDocument();
  });
});

import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ConditionsPage } from "@/features/patient/components/condition-pages";
import { PatientHealth } from "@/features/patient/components/patient-health";
import { PatientHome } from "@/features/patient/components/patient-home";
import { MedicationsPage, VisitsPage } from "@/features/patient/components/visit-pages";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient (src/mocks/patient.ts): Chinonso Okafor, three visits (the latest at ABC
// Hospital with high blood pressure, a full blood count and a chest X-ray), an appointment
// today, and one current and one past medicine.

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
    expect(within(snapshot).getByText("128/82")).toBeInTheDocument();
    expect(within(snapshot).getByText("Higher than healthy")).toBeInTheDocument();
    // TODO(api): no glucose readings.
    expect(within(snapshot).getByText("Blood glucose")).toBeInTheDocument();
  });
});

describe("Patient health", () => {
  it("counts each kind of record and links the ones with pages", async () => {
    renderWithRouter(<PatientHealth />);
    expect(await screen.findByText("3 results")).toBeInTheDocument();
    expect(screen.getByText("1 current · 1 past")).toBeInTheDocument();
    expect(screen.getByText("3 visits")).toBeInTheDocument();
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
    await user.click(screen.getByRole("tab", { name: "Past (2)" }));
    expect(await screen.findByText("Malaria")).toBeInTheDocument();
    expect(screen.queryByText("High blood pressure")).not.toBeInTheDocument();
  });

  it("splits visits into upcoming and past", async () => {
    const { user } = renderWithRouter(<VisitsPage />);
    expect(await screen.findByText("Booked")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Past (3)" }));
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

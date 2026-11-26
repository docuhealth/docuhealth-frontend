import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as PendingHealth from "@/features/patient/api/pending-health";
import type { FacilityProfile, LabReading } from "@/features/patient/api/pending-health";
import type * as PendingImmunizations from "@/features/patient/api/pending-immunizations";
import type { Vaccine, VaccineDose } from "@/features/patient/api/pending-immunizations";
import { FacilityListPage } from "@/features/patient/components/facility-list-page";
import { HealthTrendsPage } from "@/features/patient/components/health-trends-page";
import { ImmunizationDetails } from "@/features/patient/components/immunization-details";
import { ImmunizationPage } from "@/features/patient/components/immunization-page";
import { PatientHealth } from "@/features/patient/components/patient-health";
import { TimelinePage } from "@/features/patient/components/timeline-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient's visits, readings and medicines (src/mocks/patient.ts) are on the mock API.
// Immunizations, earlier lab values and facility locations are TODO(api) records, empty off the
// mock dev server, so they're handed to the pending queries here.
const pending = vi.hoisted(() => ({
  vaccines: [] as unknown[],
  labHistory: [] as unknown[],
  facilities: [] as unknown[],
}));

vi.mock("@/features/patient/api/pending-immunizations", async (importOriginal) => {
  const actual = await importOriginal<typeof PendingImmunizations>();
  return {
    ...actual,
    immunizationsQuery: () => ({
      ...actual.immunizationsQuery(),
      queryFn: () => Promise.resolve(pending.vaccines as Vaccine[]),
    }),
  };
});

vi.mock("@/features/patient/api/pending-health", async (importOriginal) => {
  const actual = await importOriginal<typeof PendingHealth>();
  return {
    ...actual,
    labHistoryQuery: () => ({
      ...actual.labHistoryQuery(),
      queryFn: () => Promise.resolve(pending.labHistory as LabReading[]),
    }),
    facilityProfilesQuery: () => ({
      ...actual.facilityProfilesQuery(),
      queryFn: () => Promise.resolve(pending.facilities as FacilityProfile[]),
    }),
  };
});

const dose = (fields: Partial<VaccineDose>): VaccineDose => ({
  kind: "dose",
  number: null,
  count: 1,
  at: null,
  brand: null,
  facility: null,
  givenBy: null,
  batch: null,
  childhood: false,
  fromCard: false,
  ...fields,
});

const inTenWeeks = new Date(Date.now() + 70 * 24 * 60 * 60_000 + 60_000).toISOString();

const td: Vaccine = {
  id: "td",
  name: "Tetanus-diphtheria (Td)",
  facility: "ABC Hospital",
  updatedAt: "2024-06-14T10:00:00Z",
  dosesTotal: null,
  lifelong: false,
  due: { at: inTenWeeks, kind: "booster", reminder: "2 weeks before" },
  protectsAgainst: "Tetanus and diphtheria",
  doses: [
    dose({ kind: "booster", at: "2017-01-12T10:00:00Z", facility: "LUTH" }),
    dose({ kind: "series", count: 3, childhood: true, fromCard: true }),
  ],
};
const hepatitisB: Vaccine = {
  ...td,
  id: "hepatitis-b",
  name: "Hepatitis B",
  dosesTotal: 3,
  due: null,
  protectsAgainst: "Hepatitis B",
  doses: [
    dose({
      number: 3,
      at: "2024-06-14T10:00:00Z",
      brand: "Engerix-B 20 mcg",
      facility: "ABC Hospital",
      givenBy: "Nurse Ngozi Eze",
      batch: "AHBVB412AB",
    }),
    dose({ number: 2, at: "2024-02-12T10:00:00Z", facility: "ABC Hospital" }),
    dose({ number: 1, at: "2024-01-10T10:00:00Z", facility: "ABC Hospital" }),
  ],
};

const empty = () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] });

beforeEach(() => {
  pending.vaccines = [];
  pending.labHistory = [];
  pending.facilities = [];
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

describe("Timeline", () => {
  it("lists every record by month, each opening its page", async () => {
    const { user } = renderWithRouter(<TimelinePage />);
    const fbc = await screen.findByRole("link", { name: /Full Blood Count/ });
    expect(fbc).toHaveAttribute("href", "/patient/health/results/7-full-blood-count");
    expect(fbc).toHaveTextContent("Result ready · tap to view");
    expect(within(fbc).getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Blood pressure 128\/80 mmHg/ })).toHaveAttribute(
      "href",
      "/patient/health/vitals",
    );
    expect(screen.getByRole("link", { name: /Amlodipine 10 mg prescribed/ })).toHaveAttribute(
      "href",
      "/patient/health/medications",
    );
    expect(screen.getByRole("link", { name: /Follow-up · Internal Medicine/ })).toHaveAttribute(
      "href",
      "/patient/health/visits/7",
    );

    await user.click(screen.getByRole("button", { name: "Imaging" }));
    expect(screen.queryByRole("link", { name: /Full Blood Count/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chest X-ray/ })).toHaveAttribute(
      "href",
      "/patient/health/scans/7-0",
    );
  });

  it("says when there's nothing to show", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, empty),
      http.get(`${env.VITE_API_URL}/api/records/vital-signs/mine`, empty),
      http.get(`${env.VITE_API_URL}/api/pharmacy/patients/drug-records`, empty),
    );
    renderWithRouter(<TimelinePage />);
    expect(await screen.findByText("Nothing to show yet")).toBeInTheDocument();
  });
});

describe("Health trends", () => {
  it("charts blood pressure, then a lab value from its results", async () => {
    pending.labHistory = [
      {
        id: "hb-1",
        name: "Haemoglobin",
        value: 11.9,
        unit: "g/dL",
        flag: "low",
        at: "2025-10-20T10:00:00Z",
        facility: "ABC Hospital",
      },
    ];
    const { user } = renderWithRouter(<HealthTrendsPage />);
    const latest = await screen.findByRole("region", { name: "Latest reading" });
    expect(within(latest).getByText("128/80")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Haemoglobin" }));
    const readings = screen.getByRole("list", { name: "All readings" });
    expect(within(readings).getByText("11.9 g/dL")).toBeInTheDocument();
    expect(within(readings).getByText("Low")).toBeInTheDocument();

    // Off the mock server no creatinine was ever measured.
    await user.click(screen.getByRole("button", { name: "Creatinine" }));
    expect(screen.getByText("Not enough data yet")).toBeInTheDocument();
  });
});

describe("Healthcare facilities", () => {
  it("lists each facility with where it is, the last visit and records", async () => {
    pending.facilities = [{ name: "LUTH", location: "Idi-Araba, Lagos", photoUrl: null }];
    renderWithRouter(<FacilityListPage />);
    const list = await screen.findByRole("list", { name: "Healthcare facilities" });
    expect(within(list).getByText("LUTH")).toBeInTheDocument();
    expect(within(list).getByText("Idi-Araba, Lagos")).toBeInTheDocument();
    expect(within(list).getByText("ABC Hospital")).toBeInTheDocument();
    expect(within(list).getAllByText(/^Last visit /).length).toBeGreaterThan(0);
    expect(screen.getByText(/ facilities$/)).toBeInTheDocument();
  });

  it("says when there are none", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, empty),
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments/mine`, empty),
      http.get(`${env.VITE_API_URL}/api/patients/visits`, empty),
    );
    renderWithRouter(<FacilityListPage />);
    expect(await screen.findByText("No facilities yet")).toBeInTheDocument();
  });
});

describe("Immunization", () => {
  it("shows what's due and the completed vaccines", async () => {
    pending.vaccines = [td, hepatitisB];
    renderWithRouter(<ImmunizationPage />);
    const due = await screen.findByRole("link", { name: "Due by: Tetanus-diphtheria (Td)" });
    expect(due).toHaveAttribute("href", "/patient/health/immunizations/td");
    expect(within(due).getByText("In 10 weeks")).toBeInTheDocument();
    expect(screen.getByText("1 due soon")).toBeInTheDocument();
    const completed = screen.getByRole("list", { name: "Completed vaccines" });
    expect(within(completed).getByText("Hepatitis B")).toBeInTheDocument();
    expect(
      within(completed).getByText("3 of 3 doses · Last 14 Jun 2024 · ABC Hospital"),
    ).toBeInTheDocument();
  });

  it("shows a completed vaccine's protection and doses", async () => {
    pending.vaccines = [td, hepatitisB];
    renderWithRouter(<ImmunizationDetails vaccineId="hepatitis-b" />);
    const protection = await screen.findByRole("region", { name: "Protection" });
    expect(within(protection).getByText("Fully vaccinated")).toBeInTheDocument();
    expect(within(protection).getByText("3 of 3 doses given")).toBeInTheDocument();
    expect(screen.getByText("Dose 3 · 14 Jun 2024")).toBeInTheDocument();
    expect(screen.getByText("Nurse Ngozi Eze")).toBeInTheDocument();
    expect(screen.getByText("Batch (dose 3)")).toBeInTheDocument();
  });

  it("shows a due vaccine's date, reminder and history", async () => {
    pending.vaccines = [td];
    renderWithRouter(<ImmunizationDetails vaccineId="td" />);
    const dueBy = await screen.findByRole("region", { name: "Due by" });
    expect(within(dueBy).getByText("Last booster 12 Jan 2017 · LUTH")).toBeInTheDocument();
    expect(screen.getByText("Due soon")).toBeInTheDocument();
    expect(screen.getByText("2 weeks before")).toBeInTheDocument();
    const history = screen.getByRole("list", { name: "History" });
    expect(within(history).getAllByRole("listitem")).toHaveLength(3);
    expect(within(history).getByText("Primary series")).toBeInTheDocument();
  });

  it("says when there are no records", async () => {
    renderWithRouter(<ImmunizationPage />);
    expect(await screen.findByText("No records yet")).toBeInTheDocument();
  });
});

describe("Health page links", () => {
  it("opens Trends, Timeline, the facilities and immunizations", async () => {
    pending.vaccines = [td, hepatitisB];
    renderWithRouter(<PatientHealth />);
    expect(await screen.findByRole("link", { name: /Trends/ })).toHaveAttribute(
      "href",
      "/patient/health/trends",
    );
    expect(screen.getByRole("link", { name: /Timeline/ })).toHaveAttribute(
      "href",
      "/patient/health/timeline",
    );
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/patient/health/facilities",
    );
    const immunizations = await screen.findByRole("link", { name: /Immunizations/ });
    expect(immunizations).toHaveAttribute("href", "/patient/health/immunizations");
    expect(await within(immunizations).findByText("1 due")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Test results/ })).toHaveAttribute(
      "href",
      "/patient/health/results",
    );
  });
});

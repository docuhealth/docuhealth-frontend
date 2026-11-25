import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as PendingResults from "@/features/patient/api/pending-results";
import type { LabReport } from "@/features/patient/api/pending-results";
import { LabTestDetails } from "@/features/patient/components/lab-test-details";
import { ResultValueDetails } from "@/features/patient/components/result-value-details";
import { TestResultsPage } from "@/features/patient/components/test-results-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// Lab reports are TODO(api) records: off the mock dev server they're empty, so the populated
// screens are tested with reports handed to the pending query here. The tests themselves come
// from the demo patient's visits (src/mocks/patient.ts): a Full Blood Count and Lipid Profile at
// visit 7 (ABC Hospital), Creatinine and HbA1c at visit 6, a malaria test at visit 5 (LUTH).
const pending = vi.hoisted(() => ({ reports: [] as unknown[] }));

vi.mock("@/features/patient/api/pending-results", async (importOriginal) => {
  const actual = await importOriginal<typeof PendingResults>();
  return {
    ...actual,
    labReportsQuery: () => ({
      ...actual.labReportsQuery(),
      queryFn: () => Promise.resolve(pending.reports as LabReport[]),
    }),
  };
});

const report = (visitId: string, test: string, fields: Partial<LabReport> = {}): LabReport => ({
  visitId,
  test,
  stage: "ready",
  laboratory: "ABC Hospital Laboratory",
  specimen: "Blood",
  method: null,
  orderedBy: null,
  collectedAt: null,
  receivedAt: null,
  resultedAt: new Date().toISOString(),
  about: null,
  values: [],
  qualitative: null,
  amendment: null,
  ...fields,
});

const value = (name: string, reading: string, low: string, high: string, flag = "normal") => ({
  name,
  value: reading,
  unit: "g/dL",
  flag: flag as "normal" | "low" | "high",
  low,
  high,
  about: null,
  history: [],
});

const fbc = report("7", "Full Blood Count", {
  values: [
    {
      ...value("Haemoglobin", "12.8", "13.0", "17.0", "low"),
      about: "Haemoglobin helps carry oxygen around your body.",
      history: [
        { at: "2025-03-10T10:00:00Z", value: 10.2 },
        { at: "2025-11-10T10:00:00Z", value: 11.4 },
      ],
    },
    value("MCV", "88", "80", "100"),
  ],
});
const lipids = report("7", "Lipid Profile", {
  stage: "testing",
  specimen: "Blood (fasting)",
  collectedAt: new Date().toISOString(),
  resultedAt: null,
  about: "Total cholesterol, LDL, HDL and triglycerides.",
});
const malaria = report("5", "Malaria Parasite Test", {
  method: "Rapid diagnostic test",
  qualitative: {
    result: "Negative",
    finding: "Not detected",
    normal: true,
    explanation: "No malaria parasites were found in your blood sample.",
  },
});
const urinalysis = report("4", "Urinalysis", {
  values: [{ ...value("Protein", "Negative", "", ""), low: null, high: null, unit: "" }],
  amendment: {
    at: "2026-09-03T10:00:00Z",
    summary: "The lab updated one value after a re-check.",
    changes: [{ name: "Protein", from: "Trace", to: "Negative" }],
    reason: "Sample re-tested",
    by: "Dr. Ife Okoro, LUTH",
  },
});

beforeEach(() => {
  pending.reports = [];
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

describe("Test results", () => {
  it("says there are none yet", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderWithRouter(<TestResultsPage />);
    expect(await screen.findByText("No test results yet")).toBeInTheDocument();
    expect(
      screen.getByText("Your lab test results will appear here once they’re available."),
    ).toBeInTheDocument();
  });

  it("lists tests by day with what came back, and filters by facility", async () => {
    pending.reports = [fbc, lipids, malaria, urinalysis];
    const { user } = renderWithRouter(<TestResultsPage />);
    const today = await screen.findByRole("list", { name: "Tests on Today" });
    const lipidRow = within(today).getByRole("link", { name: /Lipid Profile/ });
    expect(lipidRow).toHaveTextContent(/ABC Hospital · Collected \d+:\d+ [AP]M/);
    expect(lipidRow).toHaveTextContent("Processing");

    const fbcRow = screen.getByRole("link", { name: /Full Blood Count/ });
    expect(fbcRow).toHaveTextContent("2 tests · ABC Hospital · Dr. Okafor");
    expect(fbcRow).toHaveTextContent("New");
    expect(fbcRow).toHaveAttribute("href", "/patient/health/results/7-full-blood-count");
    expect(screen.getByRole("link", { name: /Malaria Parasite Test/ })).toHaveTextContent(
      "Negative · LUTH",
    );
    expect(screen.getByRole("link", { name: /Urinalysis/ })).toHaveTextContent(
      "LUTH · Amended 3 Sep",
    );

    await user.click(screen.getByRole("button", { name: "LUTH" }));
    expect(screen.queryByRole("link", { name: /Full Blood Count/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Urinalysis/ })).toBeInTheDocument();
  });
});

describe("A lab test", () => {
  it("lists a panel's values against their ranges", async () => {
    pending.reports = [fbc];
    renderWithRouter(<LabTestDetails resultId="7-full-blood-count" />);
    const results = await screen.findByRole("list", { name: "Results" });
    const haemoglobin = within(results).getByRole("link", { name: /Haemoglobin/ });
    expect(haemoglobin).toHaveTextContent("12.8 g/dL · Normal 13.0–17.0");
    expect(haemoglobin).toHaveTextContent("Low");
    expect(haemoglobin).toHaveAttribute(
      "href",
      "/patient/health/results/7-full-blood-count/haemoglobin",
    );
    expect(screen.getByText("Dr. Adaeze Okafor")).toBeInTheDocument();
    expect(screen.getByText("Follow-up · Internal Medicine")).toBeInTheDocument();
  });

  it("shows how far along a processing test is", async () => {
    pending.reports = [lipids];
    renderWithRouter(<LabTestDetails resultId="7-lipid-profile" />);
    expect(await screen.findByText("Processing")).toBeInTheDocument();
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Testing in progress");
    expect(current).toHaveTextContent("Usually ready within 24 hours");
    expect(screen.getByRole("region", { name: "Test details" })).toHaveTextContent(
      "Total cholesterol",
    );
    expect(screen.getByText("Blood (fasting)")).toBeInTheDocument();
  });

  it("explains a corrected result", async () => {
    pending.reports = [urinalysis];
    renderWithRouter(<LabTestDetails resultId="4-urinalysis" />);
    expect(await screen.findByText("Corrected on 3 Sep")).toBeInTheDocument();
    const changed = screen.getByRole("region", { name: "What changed" });
    expect(changed).toHaveTextContent("Protein");
    expect(changed).toHaveTextContent("was Trace");
    expect(changed).toHaveTextContent("now Negative");
    expect(changed).toHaveTextContent("Reason: sample re-tested · Dr. Ife Okoro, LUTH");
    expect(screen.getByRole("button", { name: /View original version/ })).toBeInTheDocument();
  });

  it("shows a word result and how it was found", async () => {
    pending.reports = [malaria];
    renderWithRouter(<LabTestDetails resultId="5-malaria-parasite-test" />);
    const result = await screen.findByRole("region", { name: "Result" });
    expect(result).toHaveTextContent("Negative");
    expect(result).toHaveTextContent("Not detected");
    expect(screen.getByText("Rapid diagnostic test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Report it/ })).toBeInTheDocument();
  });

  it("says when a test isn't on record", async () => {
    renderWithRouter(<LabTestDetails resultId="nope" />);
    expect(await screen.findByText("Test not found")).toBeInTheDocument();
  });
});

describe("A test result", () => {
  it("shows the value against its range, and its trend", async () => {
    pending.reports = [fbc];
    renderWithRouter(<ResultValueDetails resultId="7-full-blood-count" valueId="haemoglobin" />);
    expect(await screen.findByText("Slightly below normal")).toBeInTheDocument();
    expect(screen.getByText("Normal 13.0 – 17.0")).toBeInTheDocument();
    expect(
      screen.getByText("Haemoglobin helps carry oxygen around your body."),
    ).toBeInTheDocument();
    const trend = screen.getByRole("region", { name: "Your trend" });
    expect(within(trend).getByRole("tab", { name: "All Time" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(trend).getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("ABC Hospital Laboratory")).toBeInTheDocument();
  });
});

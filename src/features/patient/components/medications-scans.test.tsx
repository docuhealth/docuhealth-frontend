import { fireEvent, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import type { MedicationDetail, ScanReport } from "@/features/patient/api/pending";
import { MedicationsPage } from "@/features/patient/components/medications-page";
import { ScanDetails } from "@/features/patient/components/scan-details";
import { ScanResultsPage } from "@/features/patient/components/scan-results-page";
import { ScanViewer } from "@/features/patient/components/scan-viewer";
import { downloadElementAsPdf } from "@/lib/export-element";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// The demo patient (src/mocks/patient.ts): one current medicine (Amlodipine 10 mg) and six past;
// scans "8-0" (an echocardiogram today, in progress) and "7-0" (a chest X-ray, completed), among
// others. The pending details and reports are empty off the mock dev server, so the tests that
// need them set them here.

const pending = vi.hoisted(() => ({
  medications: [] as MedicationDetail[],
  reports: [] as ScanReport[],
}));

vi.mock(import("@/features/patient/api/pending"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    medicationDetailsQuery: () => ({
      ...original.medicationDetailsQuery(),
      queryFn: () => Promise.resolve(pending.medications),
    }),
    scanReportsQuery: () => ({
      ...original.scanReportsQuery(),
      queryFn: () => Promise.resolve(pending.reports),
    }),
  };
});

vi.mock(import("@/lib/export-element"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadElementAsPdf: vi.fn(() => Promise.resolve()),
}));

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const amlodipine: MedicationDetail = {
  drugId: "drug-1",
  prescribedBy: "Dr. Adaeze Okafor",
  facility: "ABC Hospital",
  pharmacy: "ABC Hospital Pharmacy",
  dispensedBy: "Pharm. Ngozi Eze",
  refills: "None",
  paymentStatus: "paid",
  instructions: "Take one tablet every morning.",
  endsAt: null,
};

const chestXray: ScanReport = {
  scanId: "7-0",
  stage: "ready",
  scannedAt: hoursAgo(24 * 5),
  capturedAt: hoursAgo(24 * 5),
  images: 2,
  bodyPart: "Chest",
  type: "X-ray",
  reportedBy: "Dr. Tunde Bello, Radiologist",
  reportedAt: hoursAgo(24 * 4),
  impression: "No acute cardiopulmonary abnormality.",
  findings: "The lungs are clear bilaterally.",
};

const echo: ScanReport = {
  scanId: "8-0",
  stage: "reviewing",
  scannedAt: hoursAgo(1),
  capturedAt: hoursAgo(0.5),
  images: 0,
  bodyPart: "Heart",
  type: "Echocardiogram",
  reportedBy: null,
  reportedAt: null,
  impression: null,
  findings: null,
};

beforeEach(() => {
  pending.medications = [];
  pending.reports = [];
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

describe("Medications", () => {
  it("lists current medicines, with dashes where the details aren't known", async () => {
    const { user } = renderWithRouter(<MedicationsPage />);
    const list = await screen.findByRole("list", { name: "Medications" });
    expect(within(list).getByText("Amlodipine 10 mg")).toBeInTheDocument();
    expect(within(list).getByText("Tablet · Oral · Once daily")).toBeInTheDocument();
    expect(within(list).getByText("Active")).toBeInTheDocument();
    expect(within(list).getAllByText("—")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Current (1)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: "Past (6)" }));
    expect(
      within(screen.getByRole("list", { name: "Medications" })).getAllByRole("listitem"),
    ).toHaveLength(6);
  });

  it("shows the dispensing info and saves the prescription as a PDF", async () => {
    pending.medications = [amlodipine];
    const { user } = renderWithRouter(<MedicationsPage />);
    expect(await screen.findByText("Dr. Adaeze Okafor")).toBeInTheDocument();
    expect(screen.getByText("ABC Hospital")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dispensing info" }));
    let dialog = await screen.findByRole("dialog", { name: "Dispensing info" });
    expect(dialog).toHaveTextContent("Amlodipine 10 mg was given to you at the pharmacy.");
    expect(within(dialog).getByText("ABC Hospital Pharmacy")).toBeInTheDocument();
    expect(within(dialog).getByText("90 of 90 tablets")).toBeInTheDocument();
    expect(within(dialog).getByText("Paid")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: "Prescription" }));
    dialog = await screen.findByRole("dialog", { name: "Prescription" });
    expect(dialog).toHaveTextContent("Your prescription from ABC Hospital.");
    expect(within(dialog).getByText("Take one tablet every morning.")).toBeInTheDocument();
    expect(within(dialog).getByText("90 days")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Download PDF" }));
    expect(downloadElementAsPdf).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "amlodipine_10_mg_prescription.pdf",
    );
  });

  it("says when there are none", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/pharmacy/patients/drug-records`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderWithRouter(<MedicationsPage />);
    expect(await screen.findByText("No medications yet")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});

describe("Scan results", () => {
  it("lists scans by day, tagged from the order's status without reports", async () => {
    renderWithRouter(<ScanResultsPage />);
    const today = await screen.findByRole("region", { name: "Today" });
    const echoRow = within(today).getByRole("link", { name: /Echocardiogram/ });
    expect(echoRow).toHaveTextContent("Awaiting report");
    expect(echoRow).toHaveAttribute("href", "/patient/health/scans/8-0");
    expect(screen.getByRole("link", { name: /Chest X-ray/ })).toHaveTextContent("Final");
  });

  it("marks a newly reported scan and filters by facility", async () => {
    pending.reports = [chestXray, echo];
    const { user } = renderWithRouter(<ScanResultsPage />);
    const chest = await screen.findByRole("link", { name: /Chest X-ray/ });
    expect(chest).toHaveTextContent("New");
    expect(chest).toHaveTextContent("2 images");

    await user.click(screen.getByRole("button", { name: "ABC Hospital" }));
    expect(
      screen.queryByRole("link", { name: /Echocardiogram.*Awaiting/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chest X-ray/ })).toBeInTheDocument();
  });

  it("says when there are none", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/records/summaries/:hin`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderWithRouter(<ScanResultsPage />);
    expect(await screen.findByText("No scan results yet!")).toBeInTheDocument();
  });
});

describe("Scan details", () => {
  it("shows a ready report's images, impression and full report", async () => {
    pending.reports = [chestXray];
    const { user } = renderWithRouter(<ScanDetails scanId="7-0" />);
    expect(await screen.findByRole("heading", { name: "Chest X-ray (PA view)" })).toBeVisible();
    const images = screen.getByRole("region", { name: "Images (2)" });
    expect(within(images).getByRole("link", { name: "Open image 2" })).toHaveAttribute(
      "href",
      "/patient/health/scans/7-0/viewer?image=2",
    );
    expect(screen.getByText("No acute cardiopulmonary abnormality.")).toBeInTheDocument();
    expect(screen.getByText("Dr. Tunde Bello, Radiologist")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Read full report" }));
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("says a final scan's report isn't shared yet when there's no report record", async () => {
    renderWithRouter(<ScanDetails scanId="7-0" />);
    expect(
      await screen.findByText("Images and the report will show here once they’re shared with you."),
    ).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
  });

  it("shows how far along a scan awaiting its report is", async () => {
    pending.reports = [echo];
    renderWithRouter(<ScanDetails scanId="8-0" />);
    const progress = await screen.findByRole("region", { name: "Progress" });
    expect(within(progress).getByText("Specialist reviewing").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(within(progress).getByText("We’ll notify you")).toBeInTheDocument();
    expect(screen.getByText("Awaiting report")).toBeInTheDocument();
  });
});

describe("Scan viewer", () => {
  it("zooms the image and moves between images with the arrow keys", async () => {
    pending.reports = [chestXray];
    const onImage = vi.fn();
    const { user } = renderWithRouter(<ScanViewer scanId="7-0" image={1} onImage={onImage} />);
    expect(await screen.findByText("Image 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("X-ray image")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeInTheDocument();
    expect(screen.getByTestId("scan-image")).toHaveStyle({ transform: "scale(1.25)" });

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onImage).toHaveBeenCalledWith(2);
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    expect(onImage).toHaveBeenLastCalledWith(2);
  });

  it("has nothing to show before the report is ready", async () => {
    renderWithRouter(<ScanViewer scanId="8-0" image={1} onImage={() => {}} />);
    expect(await screen.findByText("No images to show")).toBeInTheDocument();
  });
});

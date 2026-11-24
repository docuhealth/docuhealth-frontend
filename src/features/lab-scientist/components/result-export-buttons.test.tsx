import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import { TestOrderDetails } from "@/features/lab-scientist/components/test-order-details";
import { downloadElementAsPdf, printElement } from "@/lib/export-element";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

// jsdom can't draw the report, so the export itself is faked; the file name helper stays real.
vi.mock(import("@/lib/export-element"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadElementAsPdf: vi.fn(() => Promise.resolve()),
  printElement: vi.fn(() => Promise.resolve()),
}));

// The mock's orders: 1–20 pending, 21–24 in progress, 25–56 completed, 57–59 rejected.

const auditUrl = `${env.VITE_API_URL}/api/lab/audit-logs/:resultSqid/downloads`;

/** The result sqids whose download gets logged, answering with `status`. */
function logAudits(status = 200) {
  const logged: string[] = [];
  server.use(
    http.post(auditUrl, ({ params }) => {
      logged.push(String(params.resultSqid));
      return status === 200
        ? new HttpResponse(null, { status })
        : HttpResponse.json({ detail: "Server error" }, { status });
    }),
  );
  return logged;
}

afterEach(() => vi.clearAllMocks());

describe("Printing and downloading a test order's results", () => {
  it("isn't offered before the results are in", async () => {
    renderWithRouter(<TestOrderDetails orderId="test-order-5" />);
    expect(await screen.findByRole("button", { name: "Accept request" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Print out" })).not.toBeInTheDocument();
  });

  it("is disabled, saying why, while a completed order has no results to show", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/lab/test-orders/:sqid`, () =>
        HttpResponse.json(orderWithoutResults),
      ),
    );
    renderWithRouter(<TestOrderDetails orderId="no-results" />);

    const download = await screen.findByRole("button", { name: "Download" });
    expect(download).toBeDisabled();
    expect(download).toHaveAccessibleDescription("The results aren’t in yet.");
    expect(screen.getByRole("button", { name: "Print out" })).toBeDisabled();
  });

  it("downloads the official report as a PDF, and logs the download", async () => {
    const logged = logAudits();
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-30" />);

    const download = await screen.findByRole("button", { name: "Download" });
    expect(download).toBeEnabled();
    await user.click(download);

    await waitFor(() => expect(downloadElementAsPdf).toHaveBeenCalledOnce());
    const [report, fileName] = vi.mocked(downloadElementAsPdf).mock.calls[0]!;
    expect(report).toHaveTextContent("Laboratory report");
    expect(report).toHaveTextContent("Interpretation");
    expect(fileName).toMatch(/^[a-z0-9_]+_lagos_university_teaching_hospital\.pdf$/);
    await waitFor(() => expect(logged).toEqual(["test-order-30-result"]));
    // The report is only there while it's made.
    await waitFor(() => expect(report).not.toBeInTheDocument());
  });

  it("prints the official report, and logs it as a download", async () => {
    const logged = logAudits();
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-31" />);

    await user.click(await screen.findByRole("button", { name: "Print out" }));

    expect(printElement).toHaveBeenCalledOnce();
    const [report, title] = vi.mocked(printElement).mock.calls[0]!;
    expect(report).toHaveTextContent("Laboratory report");
    expect(title).toMatch(/^Lab report · /);
    await waitFor(() => expect(logged).toEqual(["test-order-31-result"]));
  });

  it("still downloads when the download can't be logged", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logged = logAudits(500);
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-32" />);

    await user.click(await screen.findByRole("button", { name: "Download" }));

    await waitFor(() => expect(downloadElementAsPdf).toHaveBeenCalledOnce());
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(logged).toEqual(["test-order-32-result"]);
    expect(screen.queryByText(/Couldn’t make the PDF/)).not.toBeInTheDocument();
    warn.mockRestore();
  });

  it("says so when the PDF can't be made", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(downloadElementAsPdf).mockRejectedValueOnce(new Error("Canvas too large"));
    logAudits();
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-33" />);

    await user.click(await screen.findByRole("button", { name: "Download" }));

    expect(await screen.findByText("Couldn’t make the PDF. Try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeEnabled();
    error.mockRestore();
  });
});

/** `LabTestOrder` whose one test is approved but came back without its result. */
const orderWithoutResults = {
  sqid: "no-results",
  ordered_by_info: { sqid: "doctor-1", firstname: "Lois", lastname: "David" },
  hospital_info: { sqid: "hospital-1", name: "Lagos University Teaching Hospital", email: null },
  patient_info: {
    hin: "54137284910",
    firstname: "Ada",
    lastname: "Obi",
    gender: "female",
    dob: "1990-02-01",
  },
  created_at: "2026-11-20T09:00:00Z",
  note: "",
  items_info: [
    {
      sqid: "no-results-item-1",
      test: 1,
      test_info: { name: "Full blood count", parameters: [] },
      status: "result_accepted_by_doctor",
      specimen_collected_at: "2026-11-20T10:00:00Z",
      rejection_reason: null,
      result_info: null,
    },
  ],
};

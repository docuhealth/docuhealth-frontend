import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";
import { downloadElementAsPdf, printElement } from "@/lib/export-element";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

// jsdom can't draw the report, so the export itself is faked; the file name helper stays real.
vi.mock(import("@/lib/export-element"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadElementAsPdf: vi.fn(() => Promise.resolve()),
  printElement: vi.fn(() => Promise.resolve()),
}));

// The mock's orders: pending 1–20, in progress 21–24, completed 25–56, rejected 57–59. Of the
// completed ones, 26 (and every 7th after) waits for the doctor's review, and 28 (and every 7th
// after) was sent back by the doctor.

const auditUrl = `${env.VITE_API_URL}/api/radiology/audit-logs/:resultSqid/downloads`;

/** The report sqids whose download gets logged, answering with `status`. */
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

describe("Printing and downloading a scan report", () => {
  it("isn't offered for a scan in progress", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-22" />);
    expect(await screen.findByRole("button", { name: "Upload test result" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Print out" })).not.toBeInTheDocument();
  });

  it("is disabled, saying why, for a report the doctor sent back", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-28" />);

    const download = await screen.findByRole("button", { name: "Download" });
    expect(download).toBeDisabled();
    expect(download).toHaveAccessibleDescription("The doctor sent this report back.");
    expect(screen.getByRole("button", { name: "Print out" })).toBeDisabled();
  });

  it("downloads the official report as a PDF, and logs the download", async () => {
    const logged = logAudits();
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-27" />);

    const download = await screen.findByRole("button", { name: "Download" });
    expect(download).toBeEnabled();
    await user.click(download);

    await waitFor(() => expect(downloadElementAsPdf).toHaveBeenCalledOnce());
    const [report, fileName] = vi.mocked(downloadElementAsPdf).mock.calls[0]!;
    expect(report).toHaveTextContent("Radiology report");
    expect(report).toHaveTextContent("Dr. Emeka Obi");
    expect(report).toHaveTextContent("Impression");
    expect(fileName).toMatch(/^[a-z0-9_]+_lagos_university_teaching_hospital\.pdf$/);
    await waitFor(() => expect(logged).toEqual(["scan-order-27-result"]));
    await waitFor(() => expect(report).not.toBeInTheDocument());
  });

  it("prints a report still awaiting review, and logs it as a download", async () => {
    const logged = logAudits();
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-26" />);

    await user.click(await screen.findByRole("button", { name: "Print out" }));

    expect(printElement).toHaveBeenCalledOnce();
    const [report, title] = vi.mocked(printElement).mock.calls[0]!;
    expect(report).toHaveTextContent("Awaiting the doctor’s review");
    expect(title).toMatch(/^Radiology report · /);
    await waitFor(() => expect(logged).toEqual(["scan-order-26-result"]));
  });

  it("still downloads when the download can't be logged", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logged = logAudits(500);
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-29" />);

    await user.click(await screen.findByRole("button", { name: "Download" }));

    await waitFor(() => expect(downloadElementAsPdf).toHaveBeenCalledOnce());
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(logged).toEqual(["scan-order-29-result"]);
    expect(screen.queryByText(/Couldn’t make the PDF/)).not.toBeInTheDocument();
    warn.mockRestore();
  });
});

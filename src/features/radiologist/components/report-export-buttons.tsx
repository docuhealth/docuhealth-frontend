import { useId, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { toast } from "sonner";
import { PrinterIcon, UploadIcon } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLogReportDownload } from "@/features/radiologist/api/mutations";
import type { ScanOrder } from "@/features/radiologist/api/schemas";
import { RadiologyOfficialReport } from "@/features/radiologist/components/radiology-official-report";
import { reportExportBlocker, reportFileName } from "@/features/radiologist/lib/stage";
import { downloadElementAsPdf, printElement } from "@/lib/export-element";

/**
 * Print out and Download for a completed scan's report, as the official radiology report. Only
 * a finished report can leave (`reportExportBlocker`); each print or download is logged in the
 * audit trail, without waiting for it. The report is rendered off-screen while it's made.
 */
export function ReportExportButtons({
  order,
  printClassName,
  downloadClassName,
}: {
  order: ScanOrder;
  printClassName?: string;
  downloadClassName?: string;
}) {
  const blocker = reportExportBlocker(order);
  const reasonId = useId();
  const reportRef = useRef<HTMLDivElement>(null);
  // When the report was last made: it's mounted from then until it's printed or saved.
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);
  const [downloading, setDownloading] = useState(false);
  const logDownload = useLogReportDownload();

  /** Mounts the report and returns it, or null when there's nothing to export. */
  function renderReport() {
    if (blocker || !order.result) return null;
    flushSync(() => setIssuedAt(new Date()));
    logDownload.mutate(order.result.id);
    return reportRef.current;
  }

  function print() {
    const report = renderReport();
    if (!report) return;
    // The report is copied into the print view at once, so it can go straight away.
    printElement(report, `Radiology report · ${order.patient.name}`).catch(() =>
      toast.error("Couldn’t open the print dialog. Try again."),
    );
    setIssuedAt(null);
  }

  async function download() {
    if (downloading) return;
    setDownloading(true);
    try {
      const report = renderReport();
      if (!report) return;
      await downloadElementAsPdf(report, reportFileName(order));
    } catch (error) {
      console.error("The PDF failed", error);
      toast.error("Couldn’t make the PDF. Try again.");
    } finally {
      setDownloading(false);
      setIssuedAt(null);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className={printClassName}
        disabled={!!blocker}
        aria-describedby={blocker ? reasonId : undefined}
        onClick={print}
      >
        <PrinterIcon data-icon="inline-start" className="size-5" />
        Print out
      </Button>
      <Button
        className={downloadClassName}
        disabled={!!blocker || downloading}
        aria-busy={downloading}
        aria-describedby={blocker ? reasonId : undefined}
        onClick={download}
      >
        {downloading ? (
          <Spinner data-icon="inline-start" aria-hidden className="size-5" />
        ) : (
          <UploadIcon data-icon="inline-start" className="size-5" />
        )}
        Download
      </Button>
      {blocker && (
        <p id={reasonId} className="basis-full type-caption text-fg-caption sm:text-right">
          {blocker}
        </p>
      )}
      {issuedAt &&
        order.result &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] w-[794px]">
            <RadiologyOfficialReport
              ref={reportRef}
              order={order}
              result={order.result}
              issuedAt={issuedAt}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

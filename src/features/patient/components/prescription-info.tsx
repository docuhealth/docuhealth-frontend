import { DownloadSimpleIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { PrescriptionSummary } from "@/features/patient/components/prescription-summary";
import { notYet } from "@/features/patient/lib/not-yet";
import { downloadElementAsPdf, pdfFileName } from "@/lib/export-element";

/**
 * A medicine's prescription dialog body, with Share (TODO(api): nowhere to share it to yet) and
 * Download PDF, which saves the prescription panel, rendered off-screen at page width.
 */
export function PrescriptionInfo({
  drug,
  detail,
}: {
  drug: DrugRecord;
  detail: MedicationDetail | null;
}) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function download() {
    if (exporting) return;
    // Mount the page-width copy, then save it.
    flushSync(() => setExporting(true));
    try {
      await downloadElementAsPdf(pdfRef.current, pdfFileName(drug.name, "prescription"));
    } catch (error) {
      console.error("The PDF failed", error);
      toast.error("Couldn’t make the PDF. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <DialogHeader className="gap-1 pr-8">
        <DialogTitle className="type-h4 text-fg-heading">Prescription</DialogTitle>
        <DialogDescription className="type-caption text-fg-body">
          {detail?.facility ? `Your prescription from ${detail.facility}.` : "Your prescription."}
        </DialogDescription>
      </DialogHeader>
      <PrescriptionSummary drug={drug} detail={detail} />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-11" onClick={notYet("Sharing a prescription")}>
          <ShareNetworkIcon data-icon="inline-start" />
          Share
        </Button>
        <Button className="h-11" disabled={exporting} aria-busy={exporting} onClick={download}>
          {exporting ? (
            <Spinner data-icon="inline-start" aria-hidden />
          ) : (
            <DownloadSimpleIcon data-icon="inline-start" />
          )}
          Download PDF
        </Button>
      </div>
      {exporting &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] w-[794px]">
            <div ref={pdfRef} className="flex flex-col gap-6 bg-card p-12">
              <div className="flex flex-col gap-1">
                <p className="type-h3 text-fg-heading">Prescription</p>
                {detail?.facility && (
                  <p className="type-body-sm-regular text-fg-body">From {detail.facility}</p>
                )}
              </div>
              <PrescriptionSummary drug={drug} detail={detail} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

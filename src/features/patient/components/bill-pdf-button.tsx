import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { downloadElementAsPdf } from "@/lib/export-element";

/**
 * A button that saves `document` (an invoice, a receipt) as `fileName`, rendering it off-screen
 * at page width first, as the prescription dialog does.
 */
export function BillPdfButton({
  fileName,
  document: pdf,
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "children"> & {
  fileName: string;
  document: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function download() {
    if (exporting) return;
    flushSync(() => setExporting(true));
    try {
      await downloadElementAsPdf(ref.current, fileName);
    } catch (error) {
      console.error("The PDF failed", error);
      toast.error("Couldn’t make the PDF. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Button {...props} disabled={exporting} aria-busy={exporting} onClick={download}>
        {exporting ? (
          <Spinner data-icon="inline-start" aria-hidden />
        ) : (
          <DownloadSimpleIcon data-icon="inline-start" />
        )}
        {children}
      </Button>
      {exporting &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] w-[794px]">
            <div ref={ref} className="flex flex-col gap-6 bg-card p-12">
              {pdf}
            </div>
          </div>,
          globalThis.document.body,
        )}
    </>
  );
}

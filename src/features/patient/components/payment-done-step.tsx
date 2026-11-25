import { CheckIcon, ClockIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Bill, Paid } from "@/features/patient/api/pending-bills";
import { BillPdfButton } from "@/features/patient/components/bill-pdf-button";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { facilityLabel, formatBalance, methodWithCard } from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { pdfFileName } from "@/lib/export-element";
import { formatDateCommaTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * After paying: "Payment successful" with the receipt's details and downloading it. For a
 * transfer or POS payment the facility hasn't confirmed yet, "Payment noted" instead.
 */
export function PaymentDoneStep({ bill, paid }: { bill: Bill; paid: Paid }) {
  const { payment } = paid;
  const confirmed = payment.status === "paid";
  const to = facilityLabel(bill);
  const how = { card: "by card", bank_transfer: "by bank transfer", pos: "at the POS" }[
    payment.method
  ];
  const title = confirmed ? "Payment successful" : "Payment noted";
  const line = confirmed
    ? `${formatNaira(payment.amount)} was paid to ${to} ${how}.`
    : `We’ve told ${to} you paid ${formatNaira(payment.amount)} ${how}. Your balance updates once they confirm it.`;
  const rows: [string, string][] = [
    ["Reference", payment.reference ?? "—"],
    ["Date", formatDateCommaTime(new Date(payment.at))],
    ["Method", methodWithCard(payment)],
    ["Invoice", bill.invoice],
    ["Balance now", confirmed ? formatBalance(paid.balance) : "Awaiting confirmation"],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative flex flex-col items-center gap-3 px-6 pt-6 text-center">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute top-5 right-6 rounded-full bg-line hover:bg-divider"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        <span
          className={cn(
            "grid size-16 place-content-center rounded-full",
            confirmed ? "bg-success-100" : "bg-warning-100",
          )}
        >
          <span
            className={cn(
              "grid size-11 place-content-center rounded-full text-white",
              confirmed ? "bg-success-500" : "bg-warning-500",
            )}
          >
            {confirmed ? (
              <CheckIcon weight="bold" className="size-6" />
            ) : (
              <ClockIcon weight="bold" className="size-6" />
            )}
          </span>
        </span>
        <DialogTitle className="type-h4 text-fg-heading">{title}</DialogTitle>
        <DialogDescription className="max-w-90 type-body-sm-regular text-fg-caption">
          {line}
        </DialogDescription>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <DetailRows rows={rows} />
      </div>

      <footer className="flex flex-col gap-3 px-6 pb-6 *:h-11">
        <BillPdfButton
          className="type-heading-sm"
          fileName={pdfFileName(bill.facility, "receipt", payment.reference ?? bill.invoice)}
          document={
            <>
              <div className="flex flex-col gap-1">
                <p className="type-h3 text-fg-heading">
                  {confirmed ? "Payment receipt" : "Payment notice"}
                </p>
                <p className="type-body-sm-regular text-fg-body">{line}</p>
              </div>
              <DetailRows rows={[["Amount", formatNaira(payment.amount)], ...rows]} />
            </>
          }
        >
          Download
        </BillPdfButton>
        <DialogClose asChild>
          <Button type="button" variant="outline" className="type-heading-sm">
            Done
          </Button>
        </DialogClose>
      </footer>
    </div>
  );
}

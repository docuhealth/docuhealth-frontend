import { BuildingsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { Bill } from "@/features/patient/api/pending-bills";
import { BillInvoice } from "@/features/patient/components/bill-invoice";
import { BillPdfButton } from "@/features/patient/components/bill-pdf-button";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { facilityLabel, formatBalance, outstanding } from "@/features/patient/lib/bills";
import { usePatient } from "@/features/patient/lib/use-patient";
import { formatDate } from "@/lib/format";
import { pdfFileName } from "@/lib/export-element";

/** A bill's balance, where and when it's from, and downloading the invoice or paying it. */
export function BillSummaryCard({ bill, onPay }: { bill: Bill; onPay: () => void }) {
  const { name } = usePatient();
  const owed = outstanding(bill);
  return (
    <section
      aria-label="Outstanding balance"
      className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <SectionLabel>Outstanding balance</SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <p className="type-accent-h1 text-fg-heading">{formatBalance(owed)}</p>
          {owed === 0 && <Tag tone="success">Paid in full</Tag>}
        </div>
        <p className="flex items-center gap-2 type-caption text-fg-caption">
          <span className="grid size-5 shrink-0 place-content-center rounded-full bg-primary text-white">
            <BuildingsIcon aria-hidden className="size-3" />
          </span>
          {facilityLabel(bill)} · Invoice {bill.invoice} · {formatDate(new Date(bill.issuedAt))}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 *:h-11 *:flex-1 sm:*:flex-none">
        <BillPdfButton
          variant="outline"
          className="px-5 type-heading-sm"
          fileName={pdfFileName(bill.facility, "invoice", bill.invoice)}
          document={<BillInvoice bill={bill} patient={name || null} />}
        >
          Download invoice
        </BillPdfButton>
        {owed > 0 && (
          <Button className="px-5 type-heading-sm" onClick={onPay}>
            Continue to payment
          </Button>
        )}
      </div>
    </section>
  );
}

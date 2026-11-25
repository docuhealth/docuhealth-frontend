import type { Bill } from "@/features/patient/api/pending-bills";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { billSplit, facilityLabel } from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { formatDate } from "@/lib/format";

/** A bill as a printable invoice, for its PDF: who, what was charged, and how it's been paid. */
export function BillInvoice({ bill, patient }: { bill: Bill; patient: string | null }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="type-h3 text-fg-heading">Invoice {bill.invoice}</p>
        <p className="type-body-sm-regular text-fg-body">
          {facilityLabel(bill)} · {formatDate(new Date(bill.issuedAt))}
        </p>
        {patient && <p className="type-body-sm-regular text-fg-body">Billed to {patient}</p>}
      </div>
      <DetailRows
        rows={bill.services.map((service): [string, string] => [
          [service.name, service.department].filter(Boolean).join(" · "),
          formatNaira(service.amount),
        ])}
      />
      <DetailRows
        rows={[
          ["Amount billed", formatNaira(bill.billed)],
          ...billSplit(bill).map((part): [string, string] => [
            part.label,
            formatNaira(part.amount),
          ]),
        ]}
      />
    </>
  );
}

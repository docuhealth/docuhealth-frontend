import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { MedicationPanel } from "@/features/patient/components/medication-panel";
import { Tag } from "@/features/patient/components/tag";
import { dispensedQuantity, paymentTag } from "@/features/patient/lib/medications";
import { formatDateCommaTime } from "@/lib/format";

/**
 * A medicine's dispensing dialog body: what the pharmacy gave and when. TODO(api): pharmacy,
 * pharmacist, refills and payment only come from the pending medication details.
 */
export function DispensingInfo({
  drug,
  detail,
}: {
  drug: DrugRecord;
  detail: MedicationDetail | null;
}) {
  const payment = paymentTag(detail);
  return (
    <>
      <DialogHeader className="gap-1 pr-8">
        <DialogTitle className="type-h4 text-fg-heading">Dispensing info</DialogTitle>
        <DialogDescription className="type-caption text-fg-body">
          {drug.dispensedAt
            ? `${drug.name} was given to you at the pharmacy.`
            : `${drug.name} hasn’t been given to you at a pharmacy yet.`}
        </DialogDescription>
      </DialogHeader>
      <MedicationPanel
        rows={[
          ["Pharmacy", detail?.pharmacy ?? "—"],
          [
            "Dispensed on",
            drug.dispensedAt ? formatDateCommaTime(new Date(drug.dispensedAt)) : "—",
          ],
          ["Dispensed by", detail?.dispensedBy ?? "—"],
          ["Quantity", dispensedQuantity(drug) ?? "—"],
          ["Refills left", detail?.refills ?? "—"],
          [
            "Payment Status",
            payment ? (
              <Tag key="payment" tone={payment.tone}>
                {payment.label}
              </Tag>
            ) : (
              "—"
            ),
          ],
        ]}
      />
      <DialogClose asChild>
        <Button variant="outline" className="h-11 w-full">
          Done
        </Button>
      </DialogClose>
    </>
  );
}

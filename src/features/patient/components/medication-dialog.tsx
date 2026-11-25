import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { dated } from "@/features/patient/lib/dated";
import { formatAppointment } from "@/lib/format";

/** Which of a medicine's dialogs is open. */
export type MedicationView = "dispensing" | "prescription";

/** A medicine's dispensing info (what the pharmacy recorded) or its prescription. */
export function MedicationDialog({
  open,
  onClose,
}: {
  open: { drug: DrugRecord; view: MedicationView } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {open && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {open.view === "dispensing" ? "Dispensing info" : "Prescription"}
            </DialogTitle>
            <DialogDescription>
              {open.view === "dispensing"
                ? `What the pharmacy recorded for ${open.drug.name}.`
                : `Your prescription for ${open.drug.name}.`}
            </DialogDescription>
          </DialogHeader>
          <DetailRows
            rows={
              open.view === "dispensing"
                ? [
                    [
                      "Status",
                      open.drug.dispensing ? open.drug.dispensing.replaceAll("_", " ") : "—",
                    ],
                    [
                      "Dispensed on",
                      open.drug.dispensedAt
                        ? formatAppointment(new Date(open.drug.dispensedAt))
                        : "—",
                    ],
                    ["Quantity", open.drug.quantity],
                  ]
                : [
                    ["Medicine", open.drug.name],
                    ["How to take it", open.drug.how || "—"],
                    ["Quantity", open.drug.quantity],
                    ["Started", dated(open.drug.at)],
                    ["Duration", open.drug.duration],
                  ]
            }
          />
          <Button variant="outline" className="h-11 w-full" onClick={onClose}>
            Done
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { DispensingInfo } from "@/features/patient/components/dispensing-info";
import { PrescriptionInfo } from "@/features/patient/components/prescription-info";

/** Which of a medicine's dialogs is open. */
export type MedicationView = "dispensing" | "prescription";

/** A medicine's dispensing info (what the pharmacy recorded) or its prescription. */
export function MedicationDialog({
  open,
  onClose,
}: {
  open: { drug: DrugRecord; detail: MedicationDetail | null; view: MedicationView } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {open && (
        <DialogContent className="gap-5 p-5 sm:max-w-md">
          {open.view === "dispensing" ? (
            <DispensingInfo drug={open.drug} detail={open.detail} />
          ) : (
            <PrescriptionInfo drug={open.drug} detail={open.detail} />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

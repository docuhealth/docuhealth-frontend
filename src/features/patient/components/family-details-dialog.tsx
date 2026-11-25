import type { ReactNode } from "react";
import { FormDialog, FormDialogFooter, FormDialogHeader } from "@/components/dashboard/form-dialog";
import { DetailRows } from "@/features/patient/components/patient-ui";

/** A dependant's or proxy's details as label / value rows, from their profile card. */
export function FamilyDetailsDialog({
  title,
  description,
  rows,
  onClose,
}: {
  title: string;
  description: string;
  rows: [string, ReactNode][];
  onClose: () => void;
}) {
  return (
    <FormDialog open onOpenChange={(open) => !open && onClose()}>
      <FormDialogHeader title={title} description={description} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <DetailRows rows={rows} />
      </div>
      <FormDialogFooter closeLabel="Close" />
    </FormDialog>
  );
}

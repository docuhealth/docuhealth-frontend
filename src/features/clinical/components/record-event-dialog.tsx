import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import type { VisitRecord } from "@/features/clinical/api/schemas";
import { RecordEventDetails } from "@/features/clinical/components/record-event-details";
import { formatDateCommaTime } from "@/lib/format";

/** A timeline record opened in a dialog, fetched in full while it's open. */
export function RecordEventDialog({
  record,
  onClose,
}: {
  /** The record to show; `null` closes the dialog. */
  record: Pick<VisitRecord, "id" | "type" | "title" | "at" | "by"> | null;
  onClose: () => void;
}) {
  return (
    <FormDialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      {record && (
        <>
          <FormDialogHeader
            title={record.title}
            description={[record.by, formatDateCommaTime(new Date(record.at))]
              .filter(Boolean)
              .join(" · ")}
          />
          <FormDialogBody>
            <RecordEventDetails id={record.id} type={record.type} />
          </FormDialogBody>
          <FormDialogFooter closeLabel="Close" />
        </>
      )}
    </FormDialog>
  );
}

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { VitalStatusTag } from "@/features/patient/components/vital-status-tag";

import {
  type ReadingGroup,
  vitalKeys,
  vitalLabels,
  vitalStatus,
  vitalUnits,
  vitalValue,
} from "@/features/patient/lib/vitals";
import { formatDay } from "@/lib/format";

/** Every vital sign recorded on one day at one facility, with how each sits. */
export function VitalGroupDialog({
  group,
  onClose,
}: {
  group: ReadingGroup | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!group} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {group && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{formatDay(new Date(group.at))}</DialogTitle>
            <DialogDescription>
              {[
                group.facility,
                group.readings[0]?.recordedBy && `by ${group.readings[0].recordedBy}`,
              ]
                .filter(Boolean)
                .join(" · ") || "Vital signs"}
            </DialogDescription>
          </DialogHeader>
          <DetailRows
            rows={vitalKeys.flatMap((key): [string, ReactNode][] => {
              // The newest of the day's readings that has this vital.
              const reading = group.readings.find((entry) => vitalValue(entry, key) != null);
              if (!reading) return [];
              const status = vitalStatus(reading, key);
              return [
                [
                  vitalLabels[key],
                  <span key={key} className="inline-flex items-center gap-2">
                    {vitalValue(reading, key)} {vitalUnits[key]}
                    {status && <VitalStatusTag status={status} />}
                  </span>,
                ],
              ];
            })}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

import { PillIcon } from "@phosphor-icons/react";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import type { DrugRecord } from "@/features/patient/api/schemas";
import type { MedicationView } from "@/features/patient/components/medication-dialog";
import { dated } from "@/features/patient/lib/dated";

const statusLabels = { ongoing: "Active", stopped: "Stopped", completed: "Completed" };

/** One medicine: name, how to take it, status, when and how much, and its two dialogs. */
export function MedicationCard({
  drug,
  onOpen,
}: {
  drug: DrugRecord;
  onOpen: (view: MedicationView) => void;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-content-center rounded-md bg-line text-primary">
          <PillIcon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="type-body-sm-medium text-fg-heading">{drug.name}</p>
          <p className="type-caption text-fg-caption">{drug.how || "—"}</p>
        </div>
        <StatusPill tone={drug.status === "ongoing" ? "success" : "neutral"}>
          {statusLabels[drug.status ?? "completed"]}
        </StatusPill>
      </div>
      <div className="grid grid-cols-2 gap-3 border-y py-3">
        {/* TODO(api): drug records don't say who prescribed them or where. */}
        <div>
          <p className="type-caption text-fg-caption">Prescribed</p>
          <p className="type-body-sm-regular text-fg-heading">{dated(drug.at)}</p>
        </div>
        <div>
          <p className="type-caption text-fg-caption">Quantity</p>
          <p className="type-body-sm-regular text-fg-heading">{drug.quantity ?? "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-10" onClick={() => onOpen("dispensing")}>
          Dispensing info
        </Button>
        <Button className="h-10" onClick={() => onOpen("prescription")}>
          Prescription
        </Button>
      </div>
    </li>
  );
}

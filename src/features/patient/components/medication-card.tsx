import { InfoIcon, PillIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import type { MedicationView } from "@/features/patient/components/medication-dialog";
import { Tag } from "@/features/patient/components/tag";
import { medicationTag } from "@/features/patient/lib/medications";
import { notYet } from "@/features/patient/lib/not-yet";

/** One medicine: name, how to take it, status, who prescribed it where, and its two dialogs. */
export function MedicationCard({
  drug,
  detail,
  onOpen,
}: {
  drug: DrugRecord;
  detail: MedicationDetail | null;
  onOpen: (view: MedicationView) => void;
}) {
  const tag = medicationTag(drug);
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-3">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-content-center rounded-md bg-brand-50 text-primary">
          <PillIcon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate type-body-sm-medium text-fg-heading">{drug.name}</p>
          <p className="truncate type-caption text-fg-caption">{drug.how || "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tag tone={tag.tone}>{tag.label}</Tag>
          {/* TODO(api): no information sheet for a medicine yet. */}
          <button
            type="button"
            aria-label={`About ${drug.name}`}
            onClick={notYet("Medicine information")}
            className="grid size-6 place-content-center rounded-md text-fg-body hover:bg-surface"
          >
            <InfoIcon className="size-4" />
          </button>
        </div>
      </div>
      {/* TODO(api): drug records don't say who prescribed them or where (api/pending.ts). */}
      <dl className="flex items-stretch gap-3 border-y py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <dt className="type-caption text-fg-caption">Prescribed by</dt>
          <dd className="truncate type-caption-medium text-fg-heading">
            {detail?.prescribedBy ?? "—"}
          </dd>
        </div>
        <span aria-hidden className="w-px bg-divider" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <dt className="type-caption text-fg-caption">Facility</dt>
          <dd className="truncate type-caption-medium text-fg-heading">
            {detail?.facility ?? "—"}
          </dd>
        </div>
      </dl>
      <div className="grid grid-cols-[2fr_3fr] gap-2">
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

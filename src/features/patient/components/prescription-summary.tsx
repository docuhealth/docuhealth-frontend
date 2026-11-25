import type { Ref } from "react";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { MedicationPanel } from "@/features/patient/components/medication-panel";
import { Tag } from "@/features/patient/components/tag";
import { durationLabel, medicationTag } from "@/features/patient/lib/medications";
import { formatDay } from "@/lib/format";

/**
 * A prescription on its tinted panel: the medicine, who prescribed it where, how much, for how
 * long, and the instructions. Shown in the dialog and saved as the PDF.
 */
export function PrescriptionSummary({
  drug,
  detail,
  ref,
  className,
}: {
  drug: DrugRecord;
  detail: MedicationDetail | null;
  ref?: Ref<HTMLDivElement>;
  className?: string;
}) {
  const tag = medicationTag(drug);
  return (
    <div ref={ref} className={className}>
      <MedicationPanel
        header={
          <div className="flex items-start justify-between gap-3 pt-2 pb-1">
            <div className="flex min-w-0 flex-col">
              <p className="type-title-sm text-fg-heading">{drug.name}</p>
              <p className="type-body-sm-regular text-fg-body">{drug.how || "—"}</p>
            </div>
            <Tag tone={tag.tone}>{tag.label}</Tag>
          </div>
        }
        rows={[
          ["Prescribed by", detail?.prescribedBy ?? "—"],
          ["Facility", detail?.facility ?? "—"],
          ["Quantity", drug.quantity ?? "—"],
          ["Refills", detail?.refills ?? "—"],
          ["Started", formatDay(new Date(drug.at))],
          ["Duration", durationLabel(drug, detail) ?? "—"],
        ]}
        footer={
          detail?.instructions && (
            <p className="mb-2 rounded-md border border-warning-300/40 bg-warning-100 px-3 py-2 type-caption text-warning-700">
              {detail.instructions}
            </p>
          )
        }
      />
    </div>
  );
}

import { SealCheckIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { formatHin } from "@/lib/format";

/** The "Patient" box at the top of a front-desk dialog: name, then HIN and contact details. */
export function PatientSummary({
  patient,
  label = "Patient",
  verified = false,
  action,
}: {
  patient: { name: string; hin: string; phone?: string | null; email?: string | null };
  /** What they are to this dialog, e.g. "Guardian". */
  label?: string;
  /** Adds a green tick after the name, for an identity that's been checked (e.g. by NIN). */
  verified?: boolean;
  /** Sits on the right, e.g. a "Change" button. */
  action?: ReactNode;
}) {
  const details = [`HIN-${formatHin(patient.hin)}`, patient.phone, patient.email].filter(Boolean);
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-surface px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-label text-fg-caption">{label}</span>
        <span className="flex items-center gap-1.5 type-h5">
          {patient.name}
          {verified && (
            <SealCheckIcon
              weight="fill"
              aria-label="Verified"
              className="size-4 text-success-500"
            />
          )}
        </span>
        <span className="type-body-sm-regular wrap-anywhere text-fg-caption">
          {details.join(" · ")}
        </span>
      </div>
      {action}
    </div>
  );
}

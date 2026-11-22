import {
  AtIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  HospitalIcon,
  ProhibitIcon,
  StethoscopeIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDispenseDrugs } from "@/features/pharmacy/api/mutations";
import { prescriptionQuery } from "@/features/pharmacy/api/queries";
import type { Prescription } from "@/features/pharmacy/api/schemas";
import {
  DrugStatusPill,
  PrescriptionStatusPill,
} from "@/features/pharmacy/components/prescription-status";
import { getErrorMessage } from "@/lib/api";
import { ageOn, formatDateCommaTime } from "@/lib/format";

type Drug = Prescription["drugs"][number];

/**
 * One prescription: who it's for and who wrote it, its drugs (tick pending ones to dispense them
 * or mark them unavailable), the patient's allergies and latest vitals.
 */
export function PrescriptionDetails({ prescriptionId }: { prescriptionId: string }) {
  const { data: prescription } = useSuspenseQuery(prescriptionQuery(prescriptionId));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<"dispense" | "unavailable" | null>(null);
  // When the page opened, for the patient's age.
  const [now] = useState(() => new Date());

  const pending = prescription.drugs.filter(({ status }) => status === "pending");
  const chosen = pending.filter(({ id }) => selected.has(id));
  const allChosen = pending.length > 0 && chosen.length === pending.length;
  const { patient } = prescription;

  function toggle(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <title>{`${patient.name} · Prescription · DocuHealth`}</title>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={patient.name} src={null} size="xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-h4">{patient.name}</h1>
              <PrescriptionStatusPill status={prescription.status} />
            </div>
            <p className="type-body-sm-regular text-fg-caption">
              {[
                `HIN ${patient.hin}`,
                patient.dateOfBirth && `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
                patient.sex !== "prefer_not_to_say" && (patient.sex === "male" ? "Male" : "Female"),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      </div>

      <section aria-label="Medications" className="@container rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="type-h5">Medications</h2>
            <p className="type-body-sm-regular text-fg-caption">
              {pending.length > 0
                ? "Tick the drugs you’re dispensing, or that you don’t have."
                : "Every drug has been dispensed or marked unavailable."}
            </p>
          </div>
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={chosen.length === 0}
                onClick={() => setAction("unavailable")}
                className="h-11 gap-2 bg-card px-4 type-body-sm-medium text-error-500 hover:text-error-500"
              >
                <ProhibitIcon data-icon="inline-start" />
                Mark unavailable
              </Button>
              <Button
                disabled={chosen.length === 0}
                onClick={() => setAction("dispense")}
                className="h-11 gap-2 px-4 type-heading-sm"
              >
                <CheckCircleIcon data-icon="inline-start" />
                Mark dispensed
              </Button>
            </div>
          )}
        </div>

        <div className="mt-2 overflow-x-auto">
          <DashboardTable
            // Room for every column; narrower cards scroll it sideways.
            className="min-w-[46rem] type-body-sm-regular"
            columns={[
              ...(pending.length > 0
                ? [
                    {
                      label: "Select",
                      header: (
                        <Checkbox
                          aria-label="Select every pending drug"
                          checked={allChosen ? true : chosen.length > 0 ? "indeterminate" : false}
                          onCheckedChange={(checked) =>
                            setSelected(checked ? new Set(pending.map(({ id }) => id)) : new Set())
                          }
                        />
                      ),
                      className: "w-10",
                    },
                  ]
                : []),
              { label: "Drug", className: "type-body-sm-regular" },
              { label: "Dose", className: "w-24 type-body-sm-regular" },
              { label: "Route", className: "w-24 type-body-sm-regular" },
              { label: "Frequency", className: "w-32 type-body-sm-regular" },
              { label: "Duration", className: "w-24 type-body-sm-regular" },
              { label: "Status", className: "w-44 type-body-sm-regular" },
            ]}
            empty={prescription.drugs.length === 0 && "This prescription has no drugs."}
          >
            {prescription.drugs.map((drug) => (
              <TableRow key={drug.id}>
                {pending.length > 0 && (
                  <TableCell>
                    {drug.status === "pending" && (
                      <Checkbox
                        aria-label={`Select ${drug.name}`}
                        checked={selected.has(drug.id)}
                        onCheckedChange={(checked) => toggle(drug.id, checked === true)}
                      />
                    )}
                  </TableCell>
                )}
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col">
                    <span className="text-fg-heading">{drug.name}</span>
                    {drug.form && <span className="text-fg-caption">{drug.form}</span>}
                  </div>
                </TableCell>
                <TableCell>{drug.dose || "—"}</TableCell>
                <TableCell className="capitalize">{drug.route ?? "—"}</TableCell>
                <TableCell className="whitespace-normal">{drug.frequency ?? "—"}</TableCell>
                <TableCell>{drug.duration ?? "—"}</TableCell>
                <TableCell className="whitespace-normal">
                  <DrugOutcome drug={drug} />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard title="Prescription" description="Who prescribed it, and when.">
          <dl className="flex flex-col">
            <InfoRow icon={<StethoscopeIcon />} label="Prescribed by">
              {prescription.orderedBy ?? "—"}
            </InfoRow>
            <InfoRow icon={<CalendarBlankIcon />} label="Prescribed on">
              {formatDateCommaTime(new Date(prescription.createdAt))}
            </InfoRow>
            <InfoRow icon={<HospitalIcon />} label="Provider">
              {prescription.provider?.name ?? "—"}
            </InfoRow>
            <InfoRow icon={<AtIcon />} label="Provider email">
              {prescription.provider?.email ?? "—"}
            </InfoRow>
          </dl>
        </ProfileCard>

        <div className="flex flex-col gap-6">
          <ProfileCard title="Allergies" description="Noted by the prescriber.">
            {prescription.allergies.length === 0 ? (
              <p className="py-2 type-body-sm-regular text-fg-caption">No known allergies.</p>
            ) : (
              <ul className="flex flex-wrap gap-2 py-2">
                {prescription.allergies.map((allergy) => (
                  <li
                    key={allergy}
                    className="inline-flex items-center gap-1.5 rounded-md bg-error-100 px-2 py-1 type-body-sm-regular text-error-500"
                  >
                    <WarningIcon className="size-4" />
                    {allergy}
                  </li>
                ))}
              </ul>
            )}
          </ProfileCard>

          <ProfileCard
            title="Latest vitals"
            description={
              prescription.vitals
                ? `Recorded ${formatDateCommaTime(new Date(prescription.vitals.at))}`
                : "As recorded at the hospital."
            }
          >
            {!prescription.vitals || prescription.vitals.readings.length === 0 ? (
              <p className="py-2 type-body-sm-regular text-fg-caption">No vitals recorded.</p>
            ) : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-2 sm:grid-cols-3">
                {prescription.vitals.readings.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="type-caption text-fg-caption">{label}</dt>
                    <dd className="type-body-sm-medium text-fg-heading">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </ProfileCard>
        </div>
      </div>

      {action === "dispense" && (
        <DispenseDialog
          drugs={chosen}
          onClose={() => setAction(null)}
          onDone={() => setSelected(new Set())}
        />
      )}
      {action === "unavailable" && (
        <UnavailableDialog
          drugs={chosen}
          onClose={() => setAction(null)}
          onDone={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}

/** Its status, and who dispensed it when, or why it isn't available. */
function DrugOutcome({ drug }: { drug: Drug }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <DrugStatusPill status={drug.status} />
      {drug.status === "dispensed" && (drug.dispensedBy || drug.dispensedAt) && (
        <span className="type-caption text-fg-caption">
          {[drug.dispensedBy, drug.dispensedAt && formatDateCommaTime(new Date(drug.dispensedAt))]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
      {drug.status === "unavailable" && drug.unavailableReason && (
        <span className="type-caption text-fg-caption">{drug.unavailableReason}</span>
      )}
    </div>
  );
}

const names = (drugs: Drug[]) => drugs.map(({ name }) => name).join(", ");

function DispenseDialog({
  drugs,
  onClose,
  onDone,
}: {
  drugs: Drug[];
  onClose: () => void;
  onDone: () => void;
}) {
  const dispense = useDispenseDrugs();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<CheckCircleIcon />}
      title="Mark dispensed"
      confirmLabel="Mark dispensed"
      pending={dispense.isPending}
      onClose={() => !dispense.isPending && onClose()}
      onConfirm={() =>
        dispense.mutate(
          { drugIds: drugs.map(({ id }) => id), outcome: "dispensed" },
          {
            onSuccess: () => {
              toast.success(`${names(drugs)} ${drugs.length === 1 ? "is" : "are"} dispensed.`);
              onDone();
              onClose();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          },
        )
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Mark {names(drugs)} as given to the patient?
      </DialogDescription>
    </ConfirmDialog>
  );
}

function UnavailableDialog({
  drugs,
  onClose,
  onDone,
}: {
  drugs: Drug[];
  onClose: () => void;
  onDone: () => void;
}) {
  const dispense = useDispenseDrugs();
  const [reason, setReason] = useState("");
  return (
    <ConfirmDialog
      tone="danger"
      icon={<ProhibitIcon />}
      title="Mark unavailable"
      confirmLabel="Mark unavailable"
      pending={dispense.isPending}
      onClose={() => !dispense.isPending && onClose()}
      onConfirm={() =>
        dispense.mutate(
          {
            drugIds: drugs.map(({ id }) => id),
            outcome: "unavailable",
            reason: reason.trim(),
          },
          {
            onSuccess: () => {
              toast.success(
                `${names(drugs)} ${drugs.length === 1 ? "is" : "are"} marked unavailable.`,
              );
              onDone();
              onClose();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          },
        )
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Mark {names(drugs)} as unavailable? The prescriber will see it.
      </DialogDescription>
      <Field>
        <FieldLabel htmlFor="unavailableReason">Reason (optional)</FieldLabel>
        <Textarea
          id="unavailableReason"
          value={reason}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Out of stock until next week"
          className="min-h-24 bg-card"
        />
        <FieldDescription>Without one, it says “Unavailable”.</FieldDescription>
      </Field>
    </ConfirmDialog>
  );
}

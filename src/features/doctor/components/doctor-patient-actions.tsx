import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useClaimCheckIn,
  useEndEncounter,
  useRequestVitals,
} from "@/features/doctor/api/mutations";
import { myConsultationsQuery, nursesQuery } from "@/features/doctor/api/queries";
import { CareTaskDialog } from "@/features/doctor/components/care-task-dialog";
import { EncounterNoteDialog } from "@/features/doctor/components/encounter-note-dialog";
import { LabOrderDialog } from "@/features/doctor/components/lab-order-dialog";
import { BedDialog, ReferralDialog } from "@/features/doctor/components/move-dialogs";
import { PrescribeDialog } from "@/features/doctor/components/prescribe-dialog";
import { ScanOrderDialog } from "@/features/doctor/components/scan-order-dialog";
import { type VitalsRequestValues, vitalsRequestSchema } from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/** The visit a patient page is for, as the doctor's actions need it. */
export type DoctorVisit = {
  kind: "check_in" | "admission";
  /** The check-in's or admission's sqid. */
  id: string;
  hin: string;
  patientName: string;
  /** The visit's status, e.g. `doctor_active` or `active`. */
  status: string | null;
};

/** What the vitals request needs of a check-in. */
type Consultation = { checkInId: string; hin: string; patientName: string };

type Dialog =
  "note" | "vitals" | "lab" | "scan" | "drugs" | "admit" | "transfer" | "refer" | "task";

const outline = "h-12 gap-2 bg-card px-5 type-body-sm-medium";

/**
 * What a doctor can do from a patient's page.
 * - A check-in: before the consultation is theirs, see the patient (claim it). While it is,
 *   write an encounter note, order tests, scans and drugs, ask a nurse for vitals, request
 *   admission, refer out, end it.
 * - An active admission: set care tasks for the nurses, order, transfer to another bed, refer
 *   out.
 */
export function DoctorPatientActions({
  visit,
  myId,
  ownHospital,
}: {
  visit: DoctorVisit;
  myId: string;
  /** The doctor's hospital, which they can't refer to. */
  ownHospital: string;
}) {
  const isCheckIn = visit.kind === "check_in";
  const { data: mine } = useQuery({ ...myConsultationsQuery(myId), enabled: isCheckIn });
  const claim = useClaimCheckIn();
  const end = useEndEncounter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const { id, hin, patientName, status } = visit;
  const ref = { kind: visit.kind, id };
  const toggle = (which: Dialog) => (open: boolean) => setDialog(open ? which : null);

  if (isCheckIn) {
    if (status === "closed") return null;
    if (!mine?.has(id)) {
      if (status !== "doctor_idle" && status !== "doctor_seen") return null;
      return (
        <Button
          className="h-12 px-5 type-heading-sm"
          loading={claim.isPending}
          onClick={() =>
            claim.mutate(id, {
              onSuccess: () => toast.success(`You’re now seeing ${patientName}.`),
              onError: (error) => toast.error(getErrorMessage(error)),
            })
          }
        >
          {status === "doctor_seen" ? "Resume consultation" : "See patient"}
        </Button>
      );
    }
  } else if (status !== "active") {
    // Awaiting the nurse's discharge, or discharged: nothing more to order.
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={outline}>
            Order
            <CaretDownIcon data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("lab")}>Lab tests</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("scan")}>Scans</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("drugs")}>Prescribe drugs</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={outline}>
            More
            <CaretDownIcon data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCheckIn ? (
            <>
              <DropdownMenuItem onSelect={() => setDialog("vitals")}>
                Request vitals
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialog("admit")}>
                Request admission
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={() => setDialog("transfer")}>
              Transfer to another bed
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setDialog("refer")}>Refer out</DropdownMenuItem>
          {isCheckIn && (
            <DropdownMenuItem
              disabled={end.isPending}
              onSelect={() =>
                end.mutate(id, {
                  onSuccess: () => toast.success(`${patientName}’s consultation is ended.`),
                  onError: (error) => toast.error(getErrorMessage(error)),
                })
              }
            >
              End consultation
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isCheckIn ? (
        <Button className="h-12 px-5 type-heading-sm" onClick={() => setDialog("note")}>
          New encounter note
        </Button>
      ) : (
        <Button className="h-12 px-5 type-heading-sm" onClick={() => setDialog("task")}>
          New care task
        </Button>
      )}
      {!isCheckIn && (
        <CareTaskDialog
          open={dialog === "task"}
          onOpenChange={toggle("task")}
          admissionId={id}
          patientName={patientName}
        />
      )}

      {isCheckIn && (
        <EncounterNoteDialog
          open={dialog === "note"}
          onOpenChange={toggle("note")}
          hin={hin}
          checkInId={id}
          patientName={patientName}
        />
      )}
      <LabOrderDialog
        open={dialog === "lab"}
        onOpenChange={toggle("lab")}
        visit={ref}
        hin={hin}
        patientName={patientName}
      />
      <ScanOrderDialog
        open={dialog === "scan"}
        onOpenChange={toggle("scan")}
        visit={ref}
        hin={hin}
        patientName={patientName}
      />
      <PrescribeDialog
        open={dialog === "drugs"}
        onOpenChange={toggle("drugs")}
        visit={ref}
        hin={hin}
        patientName={patientName}
      />
      <BedDialog
        move={isCheckIn ? "admit" : "transfer"}
        open={dialog === "admit" || dialog === "transfer"}
        onOpenChange={toggle(isCheckIn ? "admit" : "transfer")}
        visitId={id}
        hin={hin}
        patientName={patientName}
      />
      <ReferralDialog
        open={dialog === "refer"}
        onOpenChange={toggle("refer")}
        visit={ref}
        patientName={patientName}
        ownHospital={ownHospital}
      />
      {isCheckIn && (
        <FormDialog open={dialog === "vitals"} onOpenChange={(open) => !open && setDialog(null)}>
          {dialog === "vitals" && (
            <VitalsRequestForm
              consultation={{ checkInId: id, hin, patientName }}
              onDone={() => setDialog(null)}
            />
          )}
        </FormDialog>
      )}
    </>
  );
}

const ANY_NURSE = "any";

function VitalsRequestForm({
  consultation,
  onDone,
}: {
  consultation: Consultation;
  onDone: () => void;
}) {
  const { data: nurses } = useQuery(nursesQuery());
  const requestVitals = useRequestVitals();
  const form = useForm<VitalsRequestValues>({
    resolver: zodResolver(vitalsRequestSchema),
    defaultValues: { nurse: ANY_NURSE, note: "" },
  });
  const { errors } = form.formState;
  const options = {
    [ANY_NURSE]: "Any nurse",
    ...Object.fromEntries((nurses ?? []).map(({ id, name }) => [id, name])),
  };

  function onSubmit({ nurse, note }: VitalsRequestValues) {
    requestVitals.mutate(
      {
        hin: consultation.hin,
        checkInId: consultation.checkInId,
        nurseId: nurse === ANY_NURSE ? null : nurse,
        note,
      },
      {
        onSuccess: () => {
          toast.success(`Vitals are requested for ${consultation.patientName}.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="Request vitals"
        description={`Ask a nurse to take ${consultation.patientName}’s vitals.`}
      />
      <FormDialogBody>
        <Controller
          name="nurse"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="vitalsNurse">Nurse</FieldLabel>
              <Select
                items={options}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? ANY_NURSE)}
              >
                <SelectTrigger id="vitalsNurse" className="w-full bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Field data-invalid={!!errors.note}>
          <FieldLabel htmlFor="vitalsRequestNote">Note</FieldLabel>
          <Textarea
            id="vitalsRequestNote"
            placeholder="e.g. Recheck BP before the next dose"
            aria-invalid={!!errors.note}
            className="min-h-20 bg-card"
            {...form.register("note")}
          />
          <FieldError errors={[errors.note]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="submit"
          loading={requestVitals.isPending}
          className="h-11 px-5 type-heading-sm"
        >
          Send request
        </Button>
      </FormDialogFooter>
    </form>
  );
}

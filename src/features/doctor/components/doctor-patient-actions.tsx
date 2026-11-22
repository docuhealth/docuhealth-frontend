import { zodResolver } from "@hookform/resolvers/zod";
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
import { EncounterNoteDialog } from "@/features/doctor/components/encounter-note-dialog";
import { type VitalsRequestValues, vitalsRequestSchema } from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/** The check-in a patient page is for, as the doctor's actions need it. */
export type Consultation = {
  checkInId: string;
  hin: string;
  patientName: string;
  /** The check-in's status, e.g. `doctor_idle` or `doctor_active`. */
  status: string | null;
};

/**
 * What a doctor can do from a checked-in patient's page. While the consultation is theirs:
 * write an encounter note, ask a nurse for vitals, end it. Before that: see the patient (claim).
 */
export function DoctorPatientActions({
  consultation,
  myId,
}: {
  consultation: Consultation;
  myId: string;
}) {
  const { data: mine } = useQuery(myConsultationsQuery(myId));
  const claim = useClaimCheckIn();
  const end = useEndEncounter();
  const [dialog, setDialog] = useState<"note" | "vitals" | null>(null);
  const { checkInId, patientName, status } = consultation;
  const isMine = !!mine?.has(checkInId);

  if (status === "closed") return null;
  if (!isMine) {
    if (status !== "doctor_idle" && status !== "doctor_seen") return null;
    return (
      <Button
        className="h-12 px-5 type-heading-sm"
        loading={claim.isPending}
        onClick={() =>
          claim.mutate(checkInId, {
            onSuccess: () => toast.success(`You’re now seeing ${patientName}.`),
            onError: (error) => toast.error(getErrorMessage(error)),
          })
        }
      >
        {status === "doctor_seen" ? "Resume consultation" : "See patient"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-12 bg-card px-5 type-body-sm-medium"
        loading={end.isPending}
        onClick={() =>
          end.mutate(checkInId, {
            onSuccess: () => toast.success(`${patientName}’s consultation is ended.`),
            onError: (error) => toast.error(getErrorMessage(error)),
          })
        }
      >
        End consultation
      </Button>
      <Button
        variant="outline"
        className="h-12 bg-card px-5 type-body-sm-medium"
        onClick={() => setDialog("vitals")}
      >
        Request vitals
      </Button>
      <Button className="h-12 px-5 type-heading-sm" onClick={() => setDialog("note")}>
        New encounter note
      </Button>

      <EncounterNoteDialog
        open={dialog === "note"}
        onOpenChange={(open) => setDialog(open ? "note" : null)}
        hin={consultation.hin}
        checkInId={checkInId}
        patientName={patientName}
      />
      <FormDialog open={dialog === "vitals"} onOpenChange={(open) => !open && setDialog(null)}>
        {dialog === "vitals" && (
          <VitalsRequestForm consultation={consultation} onDone={() => setDialog(null)} />
        )}
      </FormDialog>
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

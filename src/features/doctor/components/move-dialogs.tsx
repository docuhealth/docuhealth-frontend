import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
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
  hospitalsQuery,
  useReferPatient,
  useRequestAdmission,
  useTransferPatient,
  type VisitRef,
  wardsQuery,
} from "@/features/doctor/api/orders";
import {
  type BedValues,
  bedSchema,
  type ReferralValues,
  referralSchema,
} from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";

type Move = "admit" | "transfer";

/**
 * Pick a ward, then one of its free beds: to ask for the patient's admission (the front desk
 * accepts it), or to move an admitted patient.
 */
export function BedDialog({
  move,
  open,
  onOpenChange,
  visitId,
  hin,
  patientName,
}: {
  move: Move;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The check-in to admit from, or the admission to move. */
  visitId: string;
  hin: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <BedForm
          move={move}
          visitId={visitId}
          hin={hin}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function BedForm({
  move,
  visitId,
  hin,
  patientName,
  onDone,
}: {
  move: Move;
  visitId: string;
  hin: string;
  patientName: string;
  onDone: () => void;
}) {
  const { data: wards, isError } = useQuery(wardsQuery());
  const admit = useRequestAdmission();
  const transfer = useTransferPatient();
  const pending = admit.isPending || transfer.isPending;
  const form = useForm<BedValues>({
    resolver: zodResolver(bedSchema),
    defaultValues: { ward: "", bed: "" },
  });
  const wardId = useWatch({ control: form.control, name: "ward" });
  const ward = wards?.find(({ id }) => id === wardId);
  const wardOptions = Object.fromEntries(
    (wards ?? []).map(({ id, name, freeBeds }) => [id, `${name} (${freeBeds.length} free)`]),
  );
  const bedOptions = Object.fromEntries(
    (ward?.freeBeds ?? []).map(({ id, number }) => [id, `Bed ${number}`]),
  );

  function onSubmit({ bed }: BedValues) {
    const done = {
      onSuccess: () => {
        toast.success(
          move === "admit"
            ? `Admission is requested for ${patientName}. The front desk will confirm it.`
            : `${patientName} is moved.`,
        );
        onDone();
      },
      onError: (error: Error) => toast.error(getErrorMessage(error)),
    };
    if (move === "admit") admit.mutate({ checkInId: visitId, hin, bedId: bed }, done);
    else transfer.mutate({ admissionId: visitId, bedId: bed }, done);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={move === "admit" ? "Request admission" : "Transfer to another bed"}
        description={
          move === "admit"
            ? `Choose a free bed for ${patientName}.`
            : `Choose ${patientName}’s new bed.`
        }
      />
      <FormDialogBody>
        {isError && (
          <p className="type-body-sm-regular text-error-500">
            We couldn’t load the wards. Try again in a moment.
          </p>
        )}
        <Controller
          name="ward"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="moveWard" className="gap-1">
                Ward <RequiredMark />
              </FieldLabel>
              <Select
                items={wardOptions}
                value={field.value || null}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  form.setValue("bed", "");
                }}
              >
                <SelectTrigger
                  id="moveWard"
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder={wards ? "Choose a ward" : "Loading…"} />
                </SelectTrigger>
                <SelectContent>
                  {(wards ?? []).map(({ id, name, freeBeds }) => (
                    <SelectItem key={id} value={id} disabled={freeBeds.length === 0}>
                      {name} ({freeBeds.length} free)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="bed"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="moveBed" className="gap-1">
                Bed <RequiredMark />
              </FieldLabel>
              <Select
                items={bedOptions}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={!ward}
              >
                <SelectTrigger
                  id="moveBed"
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder={ward ? "Choose a bed" : "Choose a ward first"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(bedOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={pending} className="h-11 px-5 type-heading-sm">
          {move === "admit" ? "Request admission" : "Transfer"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** Refer the patient to another hospital on DocuHealth, saying why. */
export function ReferralDialog({
  open,
  onOpenChange,
  visit,
  patientName,
  ownHospital,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: VisitRef;
  patientName: string;
  /** The doctor's own hospital, left out of the list. */
  ownHospital: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ReferralForm
          visit={visit}
          patientName={patientName}
          ownHospital={ownHospital}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function ReferralForm({
  visit,
  patientName,
  ownHospital,
  onDone,
}: {
  visit: VisitRef;
  patientName: string;
  ownHospital: string;
  onDone: () => void;
}) {
  const { data: hospitals } = useQuery(hospitalsQuery());
  const refer = useReferPatient();
  const form = useForm<ReferralValues>({
    resolver: zodResolver(referralSchema),
    defaultValues: { hospital: "", reason: "" },
  });
  const { errors } = form.formState;
  const options = Object.fromEntries(
    (hospitals ?? []).filter(({ name }) => name !== ownHospital).map(({ id, name }) => [id, name]),
  );

  function onSubmit({ hospital, reason }: ReferralValues) {
    refer.mutate(
      { visit, hospitalId: hospital, reason },
      {
        onSuccess: () => {
          toast.success(`${patientName} is referred to ${options[hospital] ?? "the hospital"}.`);
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
        title="Refer out"
        description={`Refer ${patientName} to another hospital.`}
      />
      <FormDialogBody>
        <Controller
          name="hospital"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="referHospital" className="gap-1">
                Hospital <RequiredMark />
              </FieldLabel>
              <Select
                items={options}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="referHospital"
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder={hospitals ? "Choose a hospital" : "Loading…"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Field data-invalid={!!errors.reason}>
          <FieldLabel htmlFor="referReason" className="gap-1">
            Reason <RequiredMark />
          </FieldLabel>
          <Textarea
            id="referReason"
            placeholder="e.g. Needs cardiothoracic surgery, which we don’t offer"
            aria-invalid={!!errors.reason}
            className="min-h-24 bg-card"
            {...form.register("reason")}
          />
          <FieldError errors={[errors.reason]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={refer.isPending} className="h-11 px-5 type-heading-sm">
          Refer
        </Button>
      </FormDialogFooter>
    </form>
  );
}

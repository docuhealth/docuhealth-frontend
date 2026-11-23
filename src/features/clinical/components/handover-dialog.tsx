import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
  colleaguesQuery,
  type HandoverRole,
  handoverFields,
  useHandOver,
} from "@/features/clinical/api/handovers";
import { getErrorMessage } from "@/lib/api";

const handoverSchema = (role: HandoverRole) =>
  z.object(
    Object.fromEntries<z.ZodString>([
      ["to", z.string().min(1, `Choose the ${role} you’re handing over to`)] as const,
      ...handoverFields[role].map(([key, label, required]): [string, z.ZodString] => [
        key,
        required ? z.string().trim().min(1, `Enter the ${label.toLowerCase()}`) : z.string().trim(),
      ]),
    ]),
  );

/**
 * Hand a patient over to another doctor (or nurse) at the end of a shift: the patient's state
 * and what's still to do.
 */
export function HandoverDialog({
  staff: role,
  open,
  onOpenChange,
  hin,
  patientName,
  myId,
}: {
  staff: HandoverRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hin: string;
  patientName: string;
  /** Who's handing over, left out of the colleagues to hand over to. */
  myId: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <HandoverForm
          staff={role}
          hin={hin}
          patientName={patientName}
          myId={myId}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function HandoverForm({
  staff: role,
  hin,
  patientName,
  myId,
  onDone,
}: {
  staff: HandoverRole;
  hin: string;
  patientName: string;
  myId: string;
  onDone: () => void;
}) {
  const { data: colleagues } = useQuery(colleaguesQuery(role));
  const handOver = useHandOver(role);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(handoverSchema(role)),
    defaultValues: {
      to: "",
      ...Object.fromEntries(handoverFields[role].map(([key]) => [key, ""])),
    },
  });
  const { errors } = form.formState;
  const options = Object.fromEntries(
    (colleagues ?? []).filter(({ id }) => id !== myId).map(({ id, name }) => [id, name]),
  );

  function onSubmit({ to, ...fields }: Record<string, string>) {
    handOver.mutate(
      { to: to ?? "", hin, fields },
      {
        onSuccess: () => {
          toast.success(`${patientName} is handed over to ${options[to ?? ""] ?? "them"}.`);
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
        title="Hand over"
        description={`Hand ${patientName} over to another ${role} for the next shift.`}
      />
      <FormDialogBody>
        <Controller
          name="to"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="handover-to" className="gap-1">
                Hand over to <RequiredMark />
              </FieldLabel>
              <Select
                items={options}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="handover-to"
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder={colleagues ? `Choose a ${role}` : "Loading…"} />
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
        {handoverFields[role].map(([key, label, required]) => {
          const id = `handover-${key}`;
          return (
            <Field key={key} data-invalid={!!errors[key]}>
              <FieldLabel htmlFor={id} className="gap-1">
                {label} {required && <RequiredMark />}
              </FieldLabel>
              <Textarea
                id={id}
                aria-required={required}
                aria-invalid={!!errors[key]}
                className="min-h-16 bg-card"
                {...form.register(key)}
              />
              <FieldError errors={[errors[key]]} />
            </Field>
          );
        })}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={handOver.isPending} className="h-11 px-5 type-heading-sm">
          Hand over
        </Button>
      </FormDialogFooter>
    </form>
  );
}

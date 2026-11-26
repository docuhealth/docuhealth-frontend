import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { useUpdateLabDetails } from "@/features/lab-scientist/api/mutations";
import type { LabDetails } from "@/features/lab-scientist/api/schemas";
import { type LabDetailsValues, labDetailsSchema } from "@/features/lab-scientist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

const fields = [
  ["name", "Lab name", "e.g. Central Diagnostics Laboratory", true],
  ["street", "Street address", "e.g. 12 Idi-Araba Road", true],
  ["city", "City", "e.g. Ikeja", true],
  ["state", "State", "e.g. Lagos", true],
  ["country", "Country", "e.g. Nigeria", true],
  ["phone", "Phone number", "e.g. 08012345678", false],
] as const satisfies readonly [keyof LabDetailsValues, string, string, boolean][];

/**
 * The lab admin corrects the lab's name, address and phone. TODO(api): the facility's own email
 * and logo can be set (`PATCH /api/auth/facility/branding`) but not read back, so they're left out.
 */
export function LabDetailsDialog({
  lab,
  open,
  onOpenChange,
}: {
  lab: LabDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateLabDetails();
  const form = useForm<LabDetailsValues>({
    resolver: zodResolver(labDetailsSchema),
    values: {
      name: lab.name,
      street: lab.street,
      city: lab.city,
      state: lab.state,
      country: lab.country,
      phone: lab.phone ?? "",
    },
  });
  const { errors } = form.formState;

  function onSubmit(values: LabDetailsValues) {
    update.mutate(values, {
      onSuccess: () => {
        toast.success("Your lab’s details are updated.");
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Edit lab details"
          description="How your lab is named and reached on its results."
        />
        <FormDialogBody>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {fields.map(([name, label, placeholder, required]) => (
              <Field
                key={name}
                data-invalid={!!errors[name]}
                className={name === "name" || name === "street" ? "sm:col-span-2" : undefined}
              >
                <FieldLabel htmlFor={`lab-${name}`} className="gap-1">
                  {label} {required && <RequiredMark />}
                </FieldLabel>
                <Input
                  id={`lab-${name}`}
                  type={name === "phone" ? "tel" : "text"}
                  placeholder={placeholder}
                  aria-invalid={!!errors[name]}
                  className="bg-card"
                  {...form.register(name)}
                />
                <FieldError errors={[errors[name]]} />
              </Field>
            ))}
          </div>
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={update.isPending} className="h-11 px-5 type-heading-sm">
            Save changes
          </Button>
        </FormDialogFooter>
      </form>
    </FormDialog>
  );
}

import { CaretRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddFacility } from "@/features/hospital-admin/api/mutations";
import { facilityTypeLabels } from "@/features/hospital-admin/api/schemas";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { devPrefill } from "@/features/hospital-admin/lib/dev-prefill";
import {
  type AddFacilityInput,
  type AddFacilityValues,
  addFacilitySchema,
} from "@/features/hospital-admin/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { getLgasForState, NIGERIA_STATES } from "@/lib/locations";
import { DraftNotice } from "@/components/draft-notice";
import { useFormDraft } from "@/hooks/use-form-draft";

type AddedFacility = { facility: string; admin: string };

const stateItems = Object.fromEntries(NIGERIA_STATES.map((state) => [state, state]));

/**
 * "Add Facilities" modal: pick a facility, give its name and address, and the admin who will
 * manage it. Once it's added, the form closes and a "Facility Added!" confirmation takes its place.
 */
export function AddFacilityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [added, setAdded] = useState<AddedFacility>();

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        {/* The form mounts with the dialog, so every opening starts fresh. */}
        <AddFacilityForm
          onAdded={(facility) => {
            onOpenChange(false);
            setAdded(facility);
          }}
        />
      </FormDialog>
      <SuccessDialog
        open={!!added}
        onOpenChange={(isOpen) => !isOpen && setAdded(undefined)}
        title="Facility Added!"
        description={
          added &&
          `${added.facility} is set up, and ${added.admin} is its admin. They can now add and manage staff.`
        }
        primaryAction={{ label: "Done", onClick: () => setAdded(undefined) }}
      />
    </>
  );
}

function AddFacilityForm({ onAdded }: { onAdded: (facility: AddedFacility) => void }) {
  const addFacility = useAddFacility();
  const form = useForm<AddFacilityInput, unknown, AddFacilityValues>({
    resolver: zodResolver(addFacilitySchema),
    defaultValues: devPrefill?.addFacility ?? {
      type: "",
      name: "",
      state: "",
      city: "",
      street: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });
  const { errors } = form.formState;
  const draft = useFormDraft(form, {
    form: "hospital-admin:add-facility",
    fields: ["type", "name", "state", "city", "street", "firstName", "lastName", "phone", "email"],
  });
  const state = useWatch({ control: form.control, name: "state" });
  const cityItems = Object.fromEntries(getLgasForState(state).map((lga) => [lga, lga]));

  function onSubmit({ type, name, state, city, street, ...admin }: AddFacilityValues) {
    addFacility.mutate(
      { type, facility: { name, state, city, street }, admin },
      {
        onSuccess: () => {
          draft.clear();
          onAdded({
            facility: `${name} (${facilityTypeLabels[type]})`,
            admin: `${admin.firstName} ${admin.lastName}`,
          });
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
        title="Add Facilities"
        description="Choose a facility, where it is, and who will manage it."
      />

      <FormDialogBody>
        <DraftNotice restored={draft.restored} onDiscard={draft.discard} />
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="facility" className="gap-1">
                Facility <RequiredMark />
              </FieldLabel>
              <Select
                name={field.name}
                items={facilityTypeLabels}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="facility"
                  aria-required
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(facilityTypeLabels).map(([value, label]) => (
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

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="facilityName" className="gap-1">
            Facility name <RequiredMark />
          </FieldLabel>
          <Input
            id="facilityName"
            autoComplete="off"
            placeholder="E.g. LUTH Pharmacy"
            aria-required
            aria-invalid={!!errors.name}
            className="bg-card"
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="state"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="facilityState" className="gap-1">
                  State <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={stateItems}
                  value={field.value || null}
                  onValueChange={(value) => {
                    field.onChange(value ?? "");
                    form.setValue("city", "");
                  }}
                >
                  <SelectTrigger
                    id="facilityState"
                    aria-required
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIA_STATES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="facilityCity" className="gap-1">
                  City / LGA <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={cityItems}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  disabled={!state}
                >
                  <SelectTrigger
                    id="facilityCity"
                    aria-required
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue
                      placeholder={state ? "Select city / LGA" : "Select a state first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(cityItems).map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Field data-invalid={!!errors.street}>
          <FieldLabel htmlFor="facilityStreet" className="gap-1">
            Street address <RequiredMark />
          </FieldLabel>
          <Input
            id="facilityStreet"
            autoComplete="off"
            placeholder="E.g. 1-5 Ishaga Road"
            aria-required
            aria-invalid={!!errors.street}
            className="bg-card"
            {...form.register("street")}
          />
          <FieldError errors={[errors.street]} />
        </Field>

        <Field data-invalid={!!errors.firstName}>
          <FieldLabel htmlFor="adminFirstName" className="gap-1">
            Admin first name <RequiredMark />
          </FieldLabel>
          <Input
            id="adminFirstName"
            autoComplete="off"
            placeholder="E.g Joe"
            aria-required
            aria-invalid={!!errors.firstName}
            className="bg-card"
            {...form.register("firstName")}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="adminLastName" className="gap-1">
            Admin last name <RequiredMark />
          </FieldLabel>
          <Input
            id="adminLastName"
            autoComplete="off"
            placeholder="E.g Doe"
            aria-required
            aria-invalid={!!errors.lastName}
            className="bg-card"
            {...form.register("lastName")}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="adminPhone" className="gap-1">
            Admin phone number <RequiredMark />
          </FieldLabel>
          <Input
            id="adminPhone"
            type="tel"
            autoComplete="off"
            placeholder="000-000-000-00"
            aria-required
            aria-invalid={!!errors.phone}
            className="bg-card"
            {...form.register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="adminEmail" className="gap-1">
            Admin email address <RequiredMark />
          </FieldLabel>
          <InputGroup className="bg-card">
            <InputGroupAddon>
              <EnvelopeSimpleIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              id="adminEmail"
              type="email"
              autoComplete="off"
              placeholder="you@company.com"
              aria-required
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>
      </FormDialogBody>

      <FormDialogFooter>
        <Button type="submit" loading={addFacility.isPending} className="h-11 px-5 type-heading-sm">
          Add Facility
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}

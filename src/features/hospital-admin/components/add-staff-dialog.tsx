import { CaretRightIcon, EnvelopeSimpleIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAddStaff } from "@/features/hospital-admin/api/mutations";
import { hospitalProfileQuery } from "@/features/hospital-admin/api/queries";
import { staffRoles } from "@/features/hospital-admin/api/schemas";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { MessageEditor } from "@/features/hospital-admin/components/message-editor";
import { devPrefill } from "@/features/hospital-admin/lib/dev-prefill";
import {
  type AddStaffInput,
  type AddStaffValues,
  addStaffSchema,
  addStaffStepOne,
} from "@/features/hospital-admin/lib/schemas";
import { welcomeMessage } from "@/features/hospital-admin/lib/welcome-message";
import { getErrorMessage } from "@/lib/api";

const roleLabels = Object.fromEntries(
  Object.entries(staffRoles).map(([role, { one }]) => [role, one]),
);

/**
 * "Add a new team member" modal, in two steps: who they are, then their login and the welcome
 * email. Once they're added, a "Staff Added!" confirmation takes its place.
 */
export function AddStaffDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        {/* The form mounts with the dialog, so every opening starts fresh at step 1. */}
        <AddStaffForm
          onAdded={() => {
            onOpenChange(false);
            setAdded(true);
          }}
        />
      </FormDialog>
      <SuccessDialog
        open={added}
        onOpenChange={setAdded}
        title="Staff Added!"
        description="The member has been added. They’ll receive an email to get started."
        primaryAction={{ label: "Done", onClick: () => setAdded(false) }}
      />
    </>
  );
}

function AddStaffForm({ onAdded }: { onAdded: () => void }) {
  const { data: profile } = useSuspenseQuery(hospitalProfileQuery());
  const { title, firstName: adminFirst, lastName: adminLast } = profile.admin;
  const signature = [title, adminFirst, adminLast].filter(Boolean).join(" ");

  const addStaff = useAddStaff();
  const [step, setStep] = useState<1 | 2>(1);
  // Until they write their own, the message follows the template as the details change.
  const [messageEdited, setMessageEdited] = useState(false);

  const form = useForm<AddStaffInput, unknown, AddStaffValues>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: devPrefill?.addStaff ?? {
      firstName: "",
      lastName: "",
      phone: "",
      role: "",
      isAdmin: false,
      email: "",
      password: "",
      message: "",
    },
  });
  const { errors } = form.formState;
  const [firstName, email, password] = useWatch({
    control: form.control,
    name: ["firstName", "email", "password"],
  });

  useEffect(() => {
    if (messageEdited) return;
    form.setValue("message", welcomeMessage({ name: firstName, email, password, from: signature }));
  }, [form, messageEdited, firstName, email, password, signature]);

  async function continueToStepTwo() {
    if (await form.trigger([...addStaffStepOne])) setStep(2);
  }

  function onSubmit(member: AddStaffValues) {
    addStaff.mutate(member, {
      onSuccess: onAdded,
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <form
      // Enter on step 1 moves on (checking that step) rather than submitting the whole form.
      onSubmit={
        step === 1
          ? (event) => {
              event.preventDefault();
              void continueToStepTwo();
            }
          : form.handleSubmit(onSubmit)
      }
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="Add a new team member"
        description="Enter the new team member’s details."
        progress={{ step, total: 2 }}
      />

      {step === 1 ? (
        <FormDialogBody>
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="staffFirstName" className="gap-1">
              First name <RequiredMark />
            </FieldLabel>
            <Input
              id="staffFirstName"
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
            <FieldLabel htmlFor="staffLastName" className="gap-1">
              Last name <RequiredMark />
            </FieldLabel>
            <Input
              id="staffLastName"
              autoComplete="off"
              placeholder="E.g Dave"
              aria-required
              aria-invalid={!!errors.lastName}
              className="bg-card"
              {...form.register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="staffPhone" className="gap-1">
              Phone number <RequiredMark />
            </FieldLabel>
            <Input
              id="staffPhone"
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

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="staffRole" className="gap-1">
                  Role <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={roleLabels}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="staffRole"
                    aria-required
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
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

          <Controller
            name="isAdmin"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal" className="items-center! gap-3">
                <Checkbox
                  id="staffIsAdmin"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="size-4.5 border-fg-caption/50 bg-card"
                />
                <FieldLabel htmlFor="staffIsAdmin" className="font-normal! text-fg-heading">
                  Make {firstName.trim() || "them"} an admin
                </FieldLabel>
              </Field>
            )}
          />
        </FormDialogBody>
      ) : (
        <FormDialogBody>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="staffEmail" className="gap-1">
              Email address <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <EnvelopeSimpleIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="staffEmail"
                type="email"
                autoComplete="off"
                placeholder="you@email.com"
                aria-required
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
            </InputGroup>
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="staffPassword" className="gap-1">
              Password <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <LockSimpleIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="staffPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter password"
                aria-required
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
            </InputGroup>
            <FieldError errors={[errors.password]} />
          </Field>

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel id="staffMessageLabel" className="gap-1">
                  Message <RequiredMark />
                </FieldLabel>
                <MessageEditor
                  value={field.value}
                  onChange={(html) => {
                    setMessageEdited(true);
                    field.onChange(html);
                  }}
                  onBlur={field.onBlur}
                  labelledBy="staffMessageLabel"
                  invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FormDialogBody>
      )}

      <FormDialogFooter>
        {step === 1 ? (
          <Button
            key="continue"
            type="button"
            onClick={() => void continueToStepTwo()}
            className="h-11 px-5 type-heading-sm"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            loading={addStaff.isPending}
            className="h-11 px-5 type-heading-sm"
          >
            Add Staff
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

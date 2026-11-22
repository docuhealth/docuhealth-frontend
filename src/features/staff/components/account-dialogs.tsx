import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { InputGroup } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordGroupInput } from "@/components/password-group-input";
import {
  useChangePassword,
  useSendEmailChangeCode,
  useUpdateStaffProfile,
  useVerifyEmailChangeCode,
} from "@/features/staff/api/mutations";
import type { StaffMember } from "@/lib/staff-profile";
import {
  type ChangePasswordValues,
  changePasswordSchema,
  EMAIL_CODE_LENGTH,
  type EditProfileValues,
  type EmailCodeValues,
  editProfileSchema,
  emailCodeSchema,
  type NewEmailValues,
  newEmailSchema,
} from "@/features/staff/lib/schemas";
import { getErrorMessage } from "@/lib/api";

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

/** "Edit personal details": first and last name, and phone number. */
export function EditProfileDialog({
  member,
  open,
  onOpenChange,
}: DialogProps & { member: StaffMember }) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Mounted only while open, so it starts from the profile as it is now. */}
      {open && <EditProfileForm member={member} onDone={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

function EditProfileForm({ member, onDone }: { member: StaffMember; onDone: () => void }) {
  const update = useUpdateStaffProfile();
  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone ?? "",
    },
  });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit((values) =>
        update.mutate(values, {
          onSuccess: () => {
            toast.success("Your details are updated.");
            onDone();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
      )}
    >
      <FormDialogHeader
        title="Edit personal details"
        description="Your name shows to your colleagues and on records you create."
      />
      <FormDialogBody>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="profileFirstName" className="gap-1">
              First name <RequiredMark />
            </FieldLabel>
            <Input
              id="profileFirstName"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              className="bg-card"
              {...form.register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="profileLastName" className="gap-1">
              Last name <RequiredMark />
            </FieldLabel>
            <Input
              id="profileLastName"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              className="bg-card"
              {...form.register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="profilePhone" className="gap-1">
            Phone number <RequiredMark />
          </FieldLabel>
          <Input
            id="profilePhone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            className="bg-card"
            {...form.register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={update.isPending} className="h-11 px-5 type-heading-sm">
          Save changes
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** "Change email": the new address, then the code emailed to it. */
export function ChangeEmailDialog({ open, onOpenChange }: DialogProps) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && <ChangeEmailSteps onDone={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

function ChangeEmailSteps({ onDone }: { onDone: () => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  return sentTo ? (
    <EmailCodeForm email={sentTo} onBack={() => setSentTo(null)} onDone={onDone} />
  ) : (
    <NewEmailForm onSent={setSentTo} />
  );
}

function NewEmailForm({ onSent }: { onSent: (email: string) => void }) {
  const send = useSendEmailChangeCode();
  const form = useForm<NewEmailValues>({
    resolver: zodResolver(newEmailSchema),
    defaultValues: { email: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(({ email }) =>
        send.mutate(email, {
          onSuccess: () => onSent(email),
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
      )}
    >
      <FormDialogHeader
        title="Change email"
        description="We’ll send a code to the new address to check it’s yours."
        progress={{ step: 1, total: 2 }}
      />
      <FormDialogBody>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="newEmail" className="gap-1">
            New email address <RequiredMark />
          </FieldLabel>
          <Input
            id="newEmail"
            type="email"
            autoComplete="email"
            placeholder="you@facility.com"
            aria-invalid={!!errors.email}
            className="bg-card"
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={send.isPending} className="h-11 px-5 type-heading-sm">
          Send code
        </Button>
      </FormDialogFooter>
    </form>
  );
}

function EmailCodeForm({
  email,
  onBack,
  onDone,
}: {
  email: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const verify = useVerifyEmailChangeCode();
  const resend = useSendEmailChangeCode();
  const form = useForm<EmailCodeValues>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: { code: "" },
  });

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(({ code }) =>
        verify.mutate(code, {
          onSuccess: () => {
            toast.success(`Your email is now ${email}.`);
            onDone();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
      )}
    >
      <FormDialogHeader
        title="Enter the code"
        description={`We sent a ${EMAIL_CODE_LENGTH}-digit code to ${email}.`}
        progress={{ step: 2, total: 2 }}
      />
      <FormDialogBody>
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputOTP
                ref={field.ref}
                maxLength={EMAIL_CODE_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Verification code"
                aria-invalid={fieldState.invalid}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full gap-3">
                  {Array.from({ length: EMAIL_CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      placeholder="-"
                      aria-invalid={fieldState.invalid}
                      className="h-14 flex-1 rounded-md border bg-card type-h4 text-fg-heading first:rounded-l-md last:rounded-r-md"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <p className="type-body-sm-regular text-fg-caption">
          Didn’t get it?{" "}
          <button
            type="button"
            disabled={resend.isPending}
            onClick={() =>
              resend.mutate(email, {
                onSuccess: () => toast.success("We sent a new code."),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            className="text-primary underline underline-offset-2 disabled:opacity-50"
          >
            {resend.isPending ? "Sending…" : "Send it again"}
          </button>
        </p>
      </FormDialogBody>
      <FormDialogFooter onBack={onBack} backLabel="Change address">
        <Button type="submit" loading={verify.isPending} className="h-11 px-5 type-heading-sm">
          Confirm email
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** "Change password": the current one, then the new one twice. */
export function ChangePasswordDialog({ open, onOpenChange }: DialogProps) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && <ChangePasswordForm onDone={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

const passwordFields = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
] as const;

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const change = useChangePassword();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit((values) =>
        change.mutate(values, {
          onSuccess: () => {
            toast.success("Your password is changed.");
            onDone();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
      )}
    >
      <FormDialogHeader
        title="Change password"
        description="Use at least 8 characters. You’ll use it the next time you log in."
      />
      <FormDialogBody>
        {passwordFields.map(({ name, label, autoComplete }) => (
          <Field key={name} data-invalid={!!errors[name]}>
            <FieldLabel htmlFor={name} className="gap-1">
              {label} <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <PasswordGroupInput
                id={name}
                autoComplete={autoComplete}
                aria-invalid={!!errors[name]}
                {...form.register(name)}
              />
            </InputGroup>
            <FieldError errors={[errors[name]]} />
          </Field>
        ))}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={change.isPending} className="h-11 px-5 type-heading-sm">
          Change password
        </Button>
      </FormDialogFooter>
    </form>
  );
}

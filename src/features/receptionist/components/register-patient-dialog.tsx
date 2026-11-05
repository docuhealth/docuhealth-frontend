import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  InfoIcon,
  LockIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useRegisterPatient,
  useSendPatientCode,
  useVerifyPatientEmail,
} from "@/features/receptionist/api/mutations";
import { sexLabels } from "@/features/receptionist/api/schemas";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import {
  CODE_LENGTH,
  type RegisterPatientInput,
  type RegisterPatientValues,
  registerPatientSchema,
  registerPatientSteps,
} from "@/features/receptionist/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatHin } from "@/lib/format";

type Step = 1 | 2 | 3;

const steps = {
  1: { title: "Patient Information", description: "Tell us a little about the patient." },
  2: { title: "Verify account", description: "" },
  3: {
    title: "Contact & account details",
    description: "Add the patient’s contact info and create account.",
  },
};

// Every step's body is as tall as the first, so the dialog doesn't jump between them.
const bodyClass = "min-h-[28rem]";

/**
 * "Register patient" modal, in three steps: who the patient is, the code we email them, then
 * their NIN and password. Once they're registered, "Account Created!" shows their new HIN.
 */
export function RegisterPatientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [hin, setHin] = useState<string>();

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        {/* The form mounts with the dialog, so every opening starts fresh at step 1. */}
        <RegisterPatientForm
          onRegistered={(newHin) => {
            onOpenChange(false);
            setHin(newHin);
          }}
        />
      </FormDialog>
      {/* Only "Done" closes it, so the HIN can't be lost to a stray click. */}
      <SuccessDialog
        open={hin !== undefined}
        dismissible={false}
        title="Account Created!"
        description="Account created successfully. The patient can log in anytime using their email and password."
        primaryAction={{ label: "Done", onClick: () => setHin(undefined) }}
      >
        <div className="rounded-md border border-info-100 bg-info-100/40 px-3 py-2.5 text-left">
          <p className="type-heading-sm-regular text-fg-heading">
            Patient’s HIN: <strong className="text-primary">{formatHin(hin ?? "")}</strong>
          </p>
          <p className="mt-1 type-caption text-muted-foreground">
            Ask the patient to write down their HIN and keep it confidential.
          </p>
        </div>
      </SuccessDialog>
    </>
  );
}

function RegisterPatientForm({ onRegistered }: { onRegistered: (hin: string) => void }) {
  const sendCode = useSendPatientCode();
  const verifyEmail = useVerifyPatientEmail();
  const registerPatient = useRegisterPatient();
  const [step, setStep] = useState<Step>(1);
  const [verificationToken, setVerificationToken] = useState<string>();

  const form = useForm<RegisterPatientInput, unknown, RegisterPatientValues>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: devPrefill?.registerPatient ?? {
      firstName: "",
      lastName: "",
      otherName: "",
      gender: "",
      email: "",
      phone: "",
      code: "",
      nin: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { errors } = form.formState;
  const email = useWatch({ control: form.control, name: "email" });

  // The code is the only thing to do on step 2, so start typing straight away.
  useEffect(() => {
    if (step === 2) form.setFocus("code");
  }, [form, step]);

  async function continueToVerify() {
    if (!(await form.trigger([...registerPatientSteps[1]]))) return;
    sendCode.mutate(form.getValues("email"), {
      onSuccess: () => {
        form.resetField("code", { defaultValue: devPrefill?.registerPatient.code ?? "" });
        setStep(2);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  async function continueToAccount() {
    if (!(await form.trigger([...registerPatientSteps[2]]))) return;
    const { email, code } = form.getValues();
    verifyEmail.mutate(
      { email, code },
      {
        onSuccess: ({ verificationToken }) => {
          setVerificationToken(verificationToken);
          setStep(3);
        },
        onError: (error) => form.setError("code", { message: getErrorMessage(error) }),
      },
    );
  }

  function resendCode() {
    sendCode.mutate(email, {
      onSuccess: ({ email }) => toast.success(`We sent a new code to ${email}.`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function onSubmit(values: RegisterPatientValues) {
    if (!verificationToken) return;
    const { firstName, lastName, otherName, gender, email, phone, nin, password } = values;
    registerPatient.mutate(
      {
        firstName,
        lastName,
        otherName,
        sex: gender,
        email,
        phone,
        nin,
        password,
        verificationToken,
      },
      {
        onSuccess: ({ hin }) => onRegistered(hin),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      // Enter on steps 1 and 2 moves on (checking that step) rather than submitting the form.
      onSubmit={
        step === 3
          ? form.handleSubmit(onSubmit)
          : (event) => {
              event.preventDefault();
              void (step === 1 ? continueToVerify() : continueToAccount());
            }
      }
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={steps[step].title}
        description={
          step === 2
            ? `Enter the ${CODE_LENGTH} digit code sent to ${email}`
            : steps[step].description
        }
        progress={{ step, total: 3 }}
      />

      {step === 1 && (
        <FormDialogBody className={bodyClass}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="patientFirstName" className="gap-1">
                First name <RequiredMark />
              </FieldLabel>
              <Input
                id="patientFirstName"
                autoComplete="off"
                placeholder="E.g. John"
                aria-required
                aria-invalid={!!errors.firstName}
                className="bg-card"
                {...form.register("firstName")}
              />
              <FieldError errors={[errors.firstName]} />
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="patientLastName" className="gap-1">
                Last name <RequiredMark />
              </FieldLabel>
              <Input
                id="patientLastName"
                autoComplete="off"
                placeholder="E.g. Doe"
                aria-required
                aria-invalid={!!errors.lastName}
                className="bg-card"
                {...form.register("lastName")}
              />
              <FieldError errors={[errors.lastName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="patientOtherName">Other name</FieldLabel>
              <Input
                id="patientOtherName"
                autoComplete="off"
                placeholder="E.g. John"
                className="bg-card"
                {...form.register("otherName")}
              />
            </Field>

            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="patientGender" className="gap-1">
                    Gender <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={sexLabels}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id="patientGender"
                      aria-required
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sexLabels).map(([value, label]) => (
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
          </div>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="patientEmail" className="gap-1">
              Email <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <EnvelopeSimpleIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientEmail"
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

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="patientPhone" className="gap-1">
              Phone Number <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <PhoneIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientPhone"
                type="tel"
                autoComplete="off"
                placeholder="+234-000-000-0000"
                aria-required
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
            </InputGroup>
            <FieldError errors={[errors.phone]} />
          </Field>
        </FormDialogBody>
      )}

      {step === 2 && (
        <FormDialogBody className={bodyClass}>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <InputOTP
                  ref={field.ref}
                  maxLength={CODE_LENGTH}
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
                    {Array.from({ length: CODE_LENGTH }, (_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        placeholder="-"
                        aria-invalid={fieldState.invalid}
                        className="h-18 flex-1 rounded-md border bg-card type-accent-h2 text-fg-heading first:rounded-l-md last:rounded-r-md short:h-14"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <p className="text-center type-body-sm-regular text-muted-foreground">
            Didn’t receive the email?{" "}
            <button
              type="button"
              onClick={resendCode}
              disabled={sendCode.isPending}
              className="text-primary underline underline-offset-2 disabled:opacity-50"
            >
              Resend Code
            </button>
          </p>
        </FormDialogBody>
      )}

      {step === 3 && (
        <FormDialogBody className={bodyClass}>
          <Field data-invalid={!!errors.nin}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="patientNin" className="gap-1">
                NIN <RequiredMark />
              </FieldLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="What is a NIN?"
                    className="text-fg-caption transition-colors hover:text-fg-body"
                  >
                    <InfoIcon className="size-4.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  The patient’s 11-digit National Identification Number
                </TooltipContent>
              </Tooltip>
            </div>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <IdentificationCardIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientNin"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000-000-0000"
                aria-required
                aria-invalid={!!errors.nin}
                {...form.register("nin")}
              />
            </InputGroup>
            <FieldError errors={[errors.nin]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="patientPassword" className="gap-1">
              Password <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <LockIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientPassword"
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

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="patientConfirmPassword" className="gap-1">
              Confirm Password <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <LockIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientConfirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter password"
                aria-required
                aria-invalid={!!errors.confirmPassword}
                {...form.register("confirmPassword")}
              />
            </InputGroup>
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </FormDialogBody>
      )}

      <FormDialogFooter onBack={step === 2 ? () => setStep(1) : undefined}>
        {step === 1 && (
          <Button
            key="continue"
            type="button"
            loading={sendCode.isPending}
            onClick={() => void continueToVerify()}
            className="h-11 px-5 type-heading-sm"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
        {step === 2 && (
          <Button
            key="verify"
            type="button"
            loading={verifyEmail.isPending}
            onClick={() => void continueToAccount()}
            className="h-11 px-5 type-heading-sm"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
        {step === 3 && (
          <Button
            key="register"
            type="submit"
            loading={registerPatient.isPending}
            className="h-11 px-5 type-heading-sm"
          >
            Register
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

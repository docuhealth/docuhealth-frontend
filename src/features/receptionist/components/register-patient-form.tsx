import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  LockIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { NinHint } from "@/components/nin-hint";
import { RequiredMark } from "@/components/required-mark";
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
import {
  useRegisterGuardian,
  useRegisterPatient,
  useSendPatientCode,
  useSendPhoneCode,
  useVerifyPatientEmail,
  useVerifyPhone,
} from "@/features/receptionist/api/mutations";
import { sexLabels } from "@/features/receptionist/api/schemas";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import {
  CODE_LENGTH,
  type RegisterPatientInput,
  type RegisterPatientValues,
  registerGuardianSchema,
  registerPatientSchema,
  registerPatientSteps,
} from "@/features/receptionist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

type Step = 1 | 2 | 3;

type Variant = "patient" | "guardian";

const steps = {
  patient: {
    1: { title: "Patient Information", description: "Tell us a little about the patient." },
    2: { title: "Verify account", description: "" },
    3: {
      title: "Contact & account details",
      description: "Add the patient’s contact info and create account.",
    },
  },
  guardian: {
    1: { title: "Guardian Information", description: "Tell us a little about the guardian." },
    2: { title: "Verify phone number", description: "" },
    3: {
      title: "Contact & account details",
      description: "Verify the guardian’s NIN and set their password.",
    },
  },
} as const satisfies Record<Variant, Record<Step, { title: string; description: string }>>;

// Every step's body is as tall as the first, so the dialog doesn't jump between them.
const bodyClass = "min-h-[28rem]";

/** Who was just registered, for whatever comes next (e.g. booking them in). */
export type NewPatient = { id: string; hin: string; name: string; phone: string; email: string };

/**
 * The three Register Patient steps, for a `FormDialog`: the patient's details, the emailed code,
 * then NIN and password. `submitLabel` names the last button ("Register" by default).
 *
 * The `guardian` variant registers an adult bringing a child in: the code goes to their phone,
 * so their email is optional. `onExit` puts a "Go back" on the first step (to wherever the flow
 * came from), and `progress` shows how far through a longer flow each step is, along the footer.
 */
export function RegisterPatientForm({
  onRegistered,
  submitLabel = "Register",
  variant = "patient",
  onExit,
  progress,
}: {
  onRegistered: (patient: NewPatient) => void;
  submitLabel?: string;
  variant?: Variant;
  onExit?: () => void;
  progress?: (step: Step) => number;
}) {
  const guardian = variant === "guardian";
  const sendEmailCode = useSendPatientCode();
  const sendPhoneCode = useSendPhoneCode();
  const sendCode = guardian ? sendPhoneCode : sendEmailCode;
  const verifyEmail = useVerifyPatientEmail();
  const verifyPhone = useVerifyPhone();
  const verifyCode = guardian ? verifyPhone : verifyEmail;
  const registerPatient = useRegisterPatient();
  const registerGuardian = useRegisterGuardian();
  const pending = guardian ? registerGuardian.isPending : registerPatient.isPending;
  const [step, setStep] = useState<Step>(1);
  const [verificationToken, setVerificationToken] = useState<string>();

  const form = useForm<RegisterPatientInput, unknown, RegisterPatientValues>({
    resolver: zodResolver(guardian ? registerGuardianSchema : registerPatientSchema),
    defaultValues: (guardian ? devPrefill?.registerGuardian : devPrefill?.registerPatient) ?? {
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
  const phone = useWatch({ control: form.control, name: "phone" });
  // Where the code goes: the guardian's phone, or the patient's email.
  const codeSentTo = guardian ? phone : email;

  // The code is the only thing to do on step 2, so start typing straight away.
  useEffect(() => {
    if (step === 2) form.setFocus("code");
  }, [form, step]);

  async function continueToVerify() {
    if (!(await form.trigger([...registerPatientSteps[1]]))) return;
    sendCode.mutate(form.getValues(guardian ? "phone" : "email"), {
      onSuccess: () => {
        form.resetField("code", { defaultValue: devPrefill?.registerPatient.code ?? "" });
        setStep(2);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  async function continueToAccount() {
    if (!(await form.trigger([...registerPatientSteps[2]]))) return;
    const { email, phone, code } = form.getValues();
    const onVerified = {
      onSuccess: ({ verificationToken }: { verificationToken: string }) => {
        setVerificationToken(verificationToken);
        setStep(3);
      },
      onError: (error: Error) => form.setError("code", { message: getErrorMessage(error) }),
    };
    if (guardian) verifyPhone.mutate({ phone, code }, onVerified);
    else verifyEmail.mutate({ email, code }, onVerified);
  }

  function resendCode() {
    sendCode.mutate(codeSentTo, {
      onSuccess: () => toast.success(`We sent a new code to ${codeSentTo}.`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function onSubmit(values: RegisterPatientValues) {
    if (!verificationToken) return;
    const { firstName, lastName, otherName, gender, email, phone, nin, password } = values;
    const details = { firstName, lastName, otherName, sex: gender, phone, nin, password };
    const callbacks = {
      onSuccess: ({ id, hin }: { id: string; hin: string }) =>
        onRegistered({ id, hin, name: `${firstName} ${lastName}`, phone, email }),
      onError: (error: Error) => toast.error(getErrorMessage(error)),
    };
    if (guardian) {
      registerGuardian.mutate({ ...details, email: email || null, verificationToken }, callbacks);
    } else {
      registerPatient.mutate({ ...details, email, verificationToken }, callbacks);
    }
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
        title={steps[variant][step].title}
        description={
          step === 2
            ? guardian
              ? `Enter the ${CODE_LENGTH}-digit code we sent to ${phone}.`
              : `Enter the ${CODE_LENGTH} digit code sent to ${email}`
            : steps[variant][step].description
        }
        // A longer flow shows its own progress along the footer instead.
        progress={progress ? undefined : { step, total: 3 }}
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
              Email {!guardian && <RequiredMark />}
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
                aria-required={!guardian}
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
            {guardian ? "Didn’t get the SMS?" : "Didn’t receive the email?"}{" "}
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
              <NinHint />
            </div>
            <InputGroup className="bg-card">
              <InputGroupAddon>
                <IdentificationCardIcon className="size-5" />
              </InputGroupAddon>
              <InputGroupInput
                id="patientNin"
                inputMode="numeric"
                autoComplete="off"
                placeholder={guardian ? "000-000-000-00" : "000-000-0000"}
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

      <FormDialogFooter
        onBack={step === 1 ? onExit : step === 2 || guardian ? () => setStep(1) : undefined}
        backLabel={onExit ? "Go Back" : undefined}
        progress={progress?.(step)}
      >
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
            loading={verifyCode.isPending}
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
            loading={pending}
            className="h-11 px-5 type-heading-sm"
          >
            {submitLabel}
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

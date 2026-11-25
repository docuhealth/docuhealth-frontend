import {
  CalendarBlankIcon,
  CreditCardIcon,
  LockSimpleIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormDialogBody, FormDialogFooter } from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  type CardForm,
  cardSchema,
  formatCardNumber,
  formatExpiry,
} from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";

const empty: CardForm = { number: "", holder: "", expiry: "", cvv: "" };

type Name = keyof CardForm;

/**
 * Paying by card: number, holder, expiry and CVV, checked here before the pay request. What's
 * typed lives only in this form (gone when the dialog closes) and the request; it's never kept.
 */
export function PayCardForm({
  amount,
  pending,
  declined,
  onPay,
}: {
  amount: number;
  pending: boolean;
  /** Why the card was refused, from the last try. */
  declined: string | null;
  onPay: (card: CardForm) => void;
}) {
  const form = useForm<CardForm>({ resolver: zodResolver(cardSchema), defaultValues: empty });

  const field = (
    name: Name,
    label: string,
    input: {
      placeholder: string;
      autoComplete: string;
      icon: ReactNode;
      iconEnd?: boolean;
      inputMode?: "numeric";
      format?: (value: string) => string;
      type?: string;
    },
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field: control, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`pay-${name}`} className="gap-1">
            {label} <RequiredMark />
          </FieldLabel>
          <InputGroup className="bg-card">
            <InputGroupInput
              id={`pay-${name}`}
              name={control.name}
              ref={control.ref}
              value={control.value}
              onChange={(event) =>
                control.onChange(
                  input.format ? input.format(event.target.value) : event.target.value,
                )
              }
              onBlur={control.onBlur}
              type={input.type ?? "text"}
              inputMode={input.inputMode}
              autoComplete={input.autoComplete}
              placeholder={input.placeholder}
              aria-required
              aria-invalid={fieldState.invalid}
            />
            <InputGroupAddon align={input.iconEnd ? "inline-end" : "inline-start"}>
              {input.icon}
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  return (
    <form
      onSubmit={form.handleSubmit(onPay)}
      noValidate
      aria-label="Card details"
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogBody>
        {declined && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md bg-error-100 px-3 py-2 type-body-sm-regular text-error-700"
          >
            <WarningCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {declined}
          </p>
        )}
        {field("number", "Card Number", {
          placeholder: "0000 0000 0000 0000",
          autoComplete: "cc-number",
          inputMode: "numeric",
          icon: <CreditCardIcon />,
          format: formatCardNumber,
        })}
        {field("holder", "Card Holder", {
          placeholder: "E.g. John",
          autoComplete: "cc-name",
          icon: <UserIcon />,
        })}
        <div className="grid grid-cols-2 gap-4">
          {field("expiry", "Expiry Date", {
            placeholder: "MM/YY",
            autoComplete: "cc-exp",
            inputMode: "numeric",
            icon: <CalendarBlankIcon />,
            iconEnd: true,
            format: formatExpiry,
          })}
          {field("cvv", "CVV", {
            placeholder: "123",
            autoComplete: "cc-csc",
            inputMode: "numeric",
            type: "password",
            icon: <LockSimpleIcon />,
            iconEnd: true,
            format: (value) => value.replace(/\D/g, "").slice(0, 4),
          })}
        </div>
        <p className="flex items-center gap-1.5 type-caption text-fg-caption">
          <LockSimpleIcon aria-hidden className="size-3.5" />
          Payments are processed by DocuBill.
        </p>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="h-11 px-5 type-heading-sm"
        >
          {pending && <Spinner data-icon="inline-start" aria-hidden />}
          Pay {formatNaira(amount)}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

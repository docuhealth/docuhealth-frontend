import { CaretRightIcon, HospitalIcon, UserIcon, type Icon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AuthHeader } from "@/features/auth/components/auth-header";
import {
  accountTypeSchema,
  type AccountType,
  type AccountTypeValues,
} from "@/features/auth/lib/schemas";

const options: { value: AccountType; title: string; description: string; icon: Icon }[] = [
  {
    value: "individual",
    title: "Individual",
    description: "For people managing their personal health records and appointments.",
    icon: UserIcon,
  },
  {
    value: "provider",
    title: "Health Provider",
    description: "For hospitals, clinics, pharmacies and other healthcare organizations.",
    icon: HospitalIcon,
  },
];

/** First step of sign-up: pick who the account is for. */
export function AccountTypeForm({ onContinue }: { onContinue: (type: AccountType) => void }) {
  const form = useForm<AccountTypeValues>({ resolver: zodResolver(accountTypeSchema) });

  return (
    <form
      onSubmit={form.handleSubmit((values) => onContinue(values.accountType))}
      className="flex flex-col gap-10"
      noValidate
    >
      <AuthHeader
        title="Choose your account type"
        description="Select the option that best describes you."
      />

      <Controller
        name="accountType"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-3">
            <RadioGroup
              name={field.name}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              aria-label="Account type"
              aria-invalid={fieldState.invalid}
              className="gap-5"
            >
              {options.map(({ value, title, description, icon: OptionIcon }) => (
                <FieldLabel
                  key={value}
                  htmlFor={`account-type-${value}`}
                  className="bg-card has-data-checked:border-primary has-data-checked:bg-card"
                >
                  <Field orientation="horizontal" className="items-center! gap-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-content-center rounded-full bg-secondary text-fg-body transition-colors",
                        field.value === value && "bg-primary text-primary-foreground",
                      )}
                    >
                      <OptionIcon
                        weight={field.value === value ? "fill" : "regular"}
                        className="size-5"
                      />
                    </span>
                    <FieldContent>
                      <FieldTitle className="type-heading-sm text-fg-heading">{title}</FieldTitle>
                      <FieldDescription className="type-caption-tight text-fg-body">
                        {description}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={value} id={`account-type-${value}`} className="size-5" />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            <FieldError errors={[fieldState.error]} />
          </div>
        )}
      />

      <Button type="submit" className="h-12 w-full">
        Continue
        <CaretRightIcon data-icon="inline-end" />
      </Button>
    </form>
  );
}

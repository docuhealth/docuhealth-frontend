import { CaretRightIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { PROXY_RELATIONSHIPS } from "@/features/patient/lib/family";
import { HIN_DIGITS, formatHin } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProxyWho = { hin: string; relationship: string };

/**
 * "Add a Proxy", step 1 of 2: their HIN and how they're related. TODO(api): patients can't look
 * a HIN up, so the HIN is only checked when the request is sent; a 404 brings the patient back
 * here with `notFound`.
 */
export function AddProxyWhoStep({
  defaultValues,
  notFound,
  onContinue,
}: {
  defaultValues: ProxyWho | null;
  notFound: boolean;
  onContinue: (who: ProxyWho) => void;
}) {
  const [hin, setHin] = useState(formatHin(defaultValues?.hin ?? ""));
  const [relationship, setRelationship] = useState(defaultValues?.relationship ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [edited, setEdited] = useState(false);
  const digits = hin.replace(/\D/g, "");
  const hinError =
    notFound && !edited
      ? "No account found for this HIN. Check it and try again."
      : submitted && digits.length !== HIN_DIGITS
        ? `Enter all ${HIN_DIGITS} digits of their HIN.`
        : null;
  const relationshipError = submitted && !relationship ? "Choose how you’re related." : null;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (digits.length === HIN_DIGITS && relationship && !(notFound && !edited)) {
          onContinue({ hin: digits, relationship });
        }
      }}
    >
      <FormDialogHeader
        title="Add a Proxy"
        description="Who do you want to add?"
        progress={{ step: 1, total: 2 }}
      />
      <FormDialogBody minHeight="18rem" className="gap-6">
        <Field data-invalid={!!hinError}>
          <FieldLabel htmlFor="proxy-hin" className="gap-1">
            Enter HIN <RequiredMark />
          </FieldLabel>
          <InputGroup className="bg-card">
            <InputGroupInput
              id="proxy-hin"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000-000-000-00"
              aria-required
              aria-invalid={!!hinError}
              value={hin}
              onChange={(event) => {
                setHin(formatHin(event.target.value));
                setEdited(true);
              }}
            />
            {hinError && (
              <InputGroupAddon align="inline-end">
                <WarningCircleIcon className="size-5 text-error-500" aria-hidden />
              </InputGroupAddon>
            )}
          </InputGroup>
          {hinError ? (
            <FieldError>{hinError}</FieldError>
          ) : (
            <FieldDescription className="type-caption text-fg-caption">
              Search runs automatically at {HIN_DIGITS} digits.
            </FieldDescription>
          )}
        </Field>

        <fieldset className="flex flex-col gap-3" data-invalid={!!relationshipError}>
          <legend className="mb-3 flex items-center gap-1 type-body-sm-medium text-fg-heading">
            Relationship <RequiredMark />
          </legend>
          <div className="flex flex-wrap gap-2">
            {PROXY_RELATIONSHIPS.map((option) => (
              <label
                key={option}
                className={cn(
                  "cursor-pointer rounded-full border bg-card px-4 py-1.5 type-body-sm-regular text-fg-caption transition-colors hover:text-fg-heading has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  "has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary",
                )}
              >
                <input
                  type="radio"
                  name="proxy-relationship"
                  value={option}
                  checked={relationship === option}
                  onChange={() => setRelationship(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
          {relationshipError && <FieldError>{relationshipError}</FieldError>}
        </fieldset>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="submit"
          className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
        >
          Continue
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}

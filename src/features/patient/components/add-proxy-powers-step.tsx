import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import type { Power } from "@/features/patient/api/family";
import { ProxyPowerSwitches } from "@/features/patient/components/proxy-power-switches";
import { DURATIONS, REQUEST_POWERS, durationHint } from "@/features/patient/lib/family";
import { cn } from "@/lib/utils";

export type ProxyAccess = { powers: Power[]; durationDays: number };

/**
 * "Add a Proxy", step 2 of 2: what they may do and for how long. TODO(api): the HIN isn't looked
 * up before sending, so the title can't name them ("What can Folake do?").
 */
export function AddProxyPowersStep({
  defaultValues,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValues: ProxyAccess | null;
  pending: boolean;
  onBack: (access: ProxyAccess) => void;
  onSubmit: (access: ProxyAccess) => void;
}) {
  const [powers, setPowers] = useState<Power[]>(defaultValues?.powers ?? ["view", "book"]);
  const [durationDays, setDurationDays] = useState(defaultValues?.durationDays ?? 60);
  const [submitted, setSubmitted] = useState(false);
  const [now] = useState(() => new Date());
  const noPowers = submitted && powers.length === 0;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (powers.length) onSubmit({ powers, durationDays });
      }}
    >
      <FormDialogHeader
        title="What can they do?"
        description="You can change this any time."
        progress={{ step: 2, total: 2 }}
      />
      <FormDialogBody minHeight="18rem" className="gap-6">
        <div className="flex flex-col gap-2">
          <ProxyPowerSwitches
            powers={REQUEST_POWERS}
            value={powers}
            onChange={setPowers}
            wording="ask"
          />
          {noPowers && <FieldError>Choose at least one thing they can do.</FieldError>}
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 flex items-center gap-1 type-body-sm-medium text-fg-heading">
            How long? <RequiredMark />
          </legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {DURATIONS.map((option) => (
              <label
                key={option.days}
                className={cn(
                  "cursor-pointer rounded-full border bg-card px-3 py-1.5 text-center type-body-sm-regular text-fg-caption transition-colors hover:text-fg-heading has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  "has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary",
                )}
              >
                <input
                  type="radio"
                  name="proxy-duration"
                  value={option.days}
                  checked={durationDays === option.days}
                  onChange={() => setDurationDays(option.days)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="type-caption text-fg-caption">{durationHint(durationDays, now)}</p>
        </fieldset>
      </FormDialogBody>
      <FormDialogFooter onBack={() => onBack({ powers, durationDays })} backLabel="Go Back">
        <Button
          type="submit"
          loading={pending}
          className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
        >
          Send Request
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}

import { UserPlusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { FoundPatient } from "@/features/receptionist/api/schemas";
import { ADULT_AGE } from "@/features/receptionist/lib/schemas";
import type { PatientSearch } from "@/features/receptionist/lib/use-patient-search";
import { ageOn, formatHin } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The HIN field, then what it found: a card per match to pick from, or `noMatch` when nobody
 * has it. `hint` sits under the field.
 */
export function PatientSearchField({
  search,
  inputId,
  hint,
  noMatch,
}: {
  search: PatientSearch;
  inputId: string;
  hint?: string;
  noMatch: ReactNode;
}) {
  const { status, matches, picked } = search;

  return (
    <>
      <Field>
        <FieldLabel htmlFor={inputId} className="gap-1">
          Enter HIN <RequiredMark />
        </FieldLabel>
        <Input
          id={inputId}
          inputMode="numeric"
          autoComplete="off"
          placeholder="000-000-000-00"
          aria-required
          className="h-12 bg-card"
          value={search.hin}
          onChange={(event) => search.setHin(event.target.value)}
        />
        {hint && status === "typing" && (
          <FieldDescription className="type-caption text-fg-caption">{hint}</FieldDescription>
        )}
      </Field>

      {status === "searching" && <Spinner className="mx-auto mt-6 size-6 text-fg-caption" />}
      {status === "failed" && (
        <p className="text-center type-body-sm-regular text-error-500">
          We couldn’t look that HIN up. Try again in a moment.
        </p>
      )}
      {status === "none" && noMatch}
      {status === "found" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 type-caption-semibold text-fg-caption uppercase">
            {matches.length} {matches.length === 1 ? "match" : "matches"}
          </legend>
          {matches.map((patient) => (
            <MatchCard
              key={patient.id}
              name={`${inputId}-match`}
              patient={patient}
              picked={patient.id === picked?.id}
              onPick={() => search.pick(patient.id)}
            />
          ))}
        </fieldset>
      )}
    </>
  );
}

function MatchCard({
  name,
  patient,
  picked,
  onPick,
}: {
  name: string;
  patient: FoundPatient;
  picked: boolean;
  onPick: () => void;
}) {
  const adult = ageOn(new Date(patient.dateOfBirth)) >= ADULT_AGE;
  const details = [`HIN-${formatHin(patient.hin)}`, patient.email].filter(Boolean);

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        picked && "border-primary/40",
      )}
    >
      <input type="radio" name={name} checked={picked} onChange={onPick} className="sr-only" />
      <PersonAvatar name={patient.name} src={patient.avatarUrl} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="type-body text-fg-heading">{patient.name}</span>
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 type-caption-medium",
              adult ? "bg-success-100 text-success-700" : "bg-primary/10 text-primary",
            )}
          >
            {adult ? "Adult" : "Kid"}
          </span>
        </span>
        <span className="type-body-sm-regular wrap-anywhere text-fg-caption">
          {details.join(" · ")}
        </span>
      </span>
    </label>
  );
}

/** Nobody has the HIN: a grey card saying so, with a button to add them instead. */
export function NoMatchCard({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-surface px-6 py-7 text-center">
      <div className="mb-2 grid size-14 place-content-center rounded-full bg-line text-fg-caption">
        <UserPlusIcon className="size-6" />
      </div>
      <p className="type-h5">{title}</p>
      <p className="max-w-sm type-body-sm-regular text-fg-caption">{children}</p>
      <Button type="button" className="mt-3 h-11 px-5 type-heading-sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

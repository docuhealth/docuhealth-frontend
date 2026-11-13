import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLinkDependent } from "@/features/receptionist/api/mutations";
import {
  type DependentLinked,
  type GuardianVerification,
  guardianVerificationLabels,
  relationshipLabels,
  sexLabels,
} from "@/features/receptionist/api/schemas";
import { NoMatchCard, PatientSearchField } from "@/features/receptionist/components/patient-search";
import { PatientSummary } from "@/features/receptionist/components/patient-summary";
import { RegisterPatientForm } from "@/features/receptionist/components/register-patient-form";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import {
  ADULT_AGE,
  type ChildDetailsInput,
  type ChildDetailsValues,
  childDetailsSchema,
  type LinkGuardianInput,
  type LinkGuardianValues,
  linkGuardianSchema,
} from "@/features/receptionist/lib/schemas";
import { usePatientSearch } from "@/features/receptionist/lib/use-patient-search";
import { getErrorMessage } from "@/lib/api";
import { ageOn } from "@/lib/format";
import { cn } from "@/lib/utils";

type Guardian = { id: string; name: string; hin: string; phone: string | null };

/** The child being linked: someone already on record, or a new child to create with the link. */
type Child =
  | { kind: "existing"; id: string; name: string; hin: string }
  | { kind: "new"; details: ChildDetailsValues };

/**
 * How far through registering a child each step is, out of seven: choosing "Kid" (1, before
 * this flow), the guardian (2), creating a new guardian (3–5), the child (6), then the link (7).
 */
const STEPS = 7;
const progressAt = (step: number) => step / STEPS;

const verifications = Object.keys(guardianVerificationLabels) as GuardianVerification[];

/**
 * Registering a child, after "Kid (Dependent)": find (or create) the adult bringing them, find
 * or register the child, then record how the two are related. Given a `child` (adding a second
 * adult to one just registered), it skips straight from the adult to the link.
 */
export function RegisterChildFlow({
  child: lockedChild,
  onExit,
  onLinked,
}: {
  child?: { id: string; name: string; hin: string };
  onExit: () => void;
  onLinked: (link: DependentLinked, kind: "new" | "existing") => void;
}) {
  const [step, setStep] = useState<"guardian" | "newGuardian" | "child" | "link">("guardian");
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [child, setChild] = useState<Child | null>(
    lockedChild ? { kind: "existing", ...lockedChild } : null,
  );
  // What was typed for a new child, kept while going back and forth.
  const [childDraft, setChildDraft] = useState<ChildDetailsInput | null>(null);

  function chooseGuardian(next: Guardian) {
    setGuardian(next);
    setStep(lockedChild ? "link" : "child");
  }

  if (step === "newGuardian") {
    return (
      <RegisterPatientForm
        variant="guardian"
        submitLabel="Continue"
        onExit={() => setStep("guardian")}
        progress={(formStep) => progressAt(2 + formStep)}
        onRegistered={({ id, name, hin, phone }) => chooseGuardian({ id, name, hin, phone })}
      />
    );
  }

  if (step === "guardian" || !guardian) {
    return (
      <GuardianStep
        initialHin={guardian?.hin}
        onBack={onExit}
        onCreate={() => setStep("newGuardian")}
        onContinue={chooseGuardian}
      />
    );
  }

  const guardianSummary = (
    <PatientSummary
      label="Guardian"
      verified
      patient={guardian}
      action={
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("guardian")}
          className="h-9 shrink-0 bg-card px-4 type-body-sm-medium text-fg-heading"
        >
          Change
        </Button>
      }
    />
  );

  if (step === "child" || !child) {
    return (
      <ChildStep
        guardianSummary={guardianSummary}
        draft={childDraft}
        onBack={() => setStep("guardian")}
        onDraftChange={setChildDraft}
        onContinue={(next) => {
          setChild(next);
          setStep("link");
        }}
      />
    );
  }

  return (
    <LinkStep
      guardian={guardian}
      child={child}
      guardianSummary={guardianSummary}
      onBack={() => setStep(lockedChild ? "guardian" : "child")}
      onLinked={(link) => onLinked(link, child.kind)}
    />
  );
}

function GuardianStep({
  initialHin,
  onBack,
  onCreate,
  onContinue,
}: {
  initialHin?: string;
  onBack: () => void;
  onCreate: () => void;
  onContinue: (guardian: Guardian) => void;
}) {
  const search = usePatientSearch(initialHin ?? devPrefill?.guardianHin);
  const { picked, status } = search;
  // Only an adult can take responsibility for a child.
  const tooYoung = picked ? ageOn(new Date(picked.dateOfBirth)) < ADULT_AGE : false;

  return (
    <>
      <FormDialogHeader
        title="Who is bringing the child?"
        description="Enter the guardian’s HIN, or create a profile"
      />
      <FormDialogBody minHeight="20rem" className="gap-5">
        <PatientSearchField
          search={search}
          inputId="guardianHin"
          hint="Search runs automatically at 11 digits."
          noMatch={
            <NoMatchCard
              title="No guardian found"
              actionLabel="Create new guardian"
              onAction={onCreate}
            >
              No account matches HIN “{search.hin}”.
              <br />
              Check the number, or create a new guardian profile.
            </NoMatchCard>
          }
        />
        {status === "found" &&
          (tooYoung ? (
            <p className="type-body-sm-regular text-error-500">
              A guardian must be {ADULT_AGE} or over. Pick another adult, or{" "}
              <button type="button" onClick={onCreate} className="underline underline-offset-2">
                create a new guardian
              </button>
              .
            </p>
          ) : (
            <p className="type-body-sm-regular text-fg-caption">
              Not the right person?{" "}
              <button
                type="button"
                onClick={onCreate}
                className="text-primary underline underline-offset-2 hover:text-brand-hover"
              >
                Create a new guardian
              </button>
            </p>
          ))}
      </FormDialogBody>
      <FormDialogFooter onBack={onBack} backLabel="Go Back" progress={progressAt(2)}>
        {status !== "none" && (
          <Button
            type="button"
            disabled={!picked || tooYoung}
            onClick={() =>
              picked &&
              onContinue({ id: picked.id, name: picked.name, hin: picked.hin, phone: picked.phone })
            }
            className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </>
  );
}

function ChildStep({
  guardianSummary,
  draft,
  onBack,
  onDraftChange,
  onContinue,
}: {
  guardianSummary: ReactNode;
  draft: ChildDetailsInput | null;
  onBack: () => void;
  onDraftChange: (draft: ChildDetailsInput) => void;
  onContinue: (child: Child) => void;
}) {
  const [tab, setTab] = useState<"search" | "register">(draft ? "register" : "search");
  const search = usePatientSearch(devPrefill?.childHin);
  const { picked } = search;
  const [today] = useState(() => new Date());
  const form = useForm<ChildDetailsInput, unknown, ChildDetailsValues>({
    resolver: zodResolver(childDetailsSchema),
    defaultValues: draft ??
      devPrefill?.childDetails ?? { firstName: "", lastName: "", dateOfBirth: "", gender: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit((details) => {
        onDraftChange(form.getValues());
        onContinue({ kind: "new", details });
      })}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="Who is the child?"
        description="Search for an existing record, or register the child."
      >
        <Tabs value={tab} onValueChange={(next) => setTab(next as typeof tab)}>
          <TabsList variant="line" className="h-auto w-full justify-start gap-7 rounded-none p-0">
            {(
              [
                ["search", "Search existing"],
                ["register", "Register new child"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-auto flex-none rounded-none px-0 pt-1 pb-3 type-body-sm-regular text-fg-caption after:rounded-t-full after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-[3px] hover:text-fg-heading data-active:text-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FormDialogHeader>

      <FormDialogBody minHeight="20rem" className="gap-5">
        {guardianSummary}

        {tab === "search" ? (
          <PatientSearchField
            search={search}
            inputId="childHin"
            hint="Search runs automatically at 11 digits."
            noMatch={
              <NoMatchCard
                title="No child found"
                actionLabel="Register new child"
                onAction={() => setTab("register")}
              >
                No record matches HIN “{search.hin}”. Register them as a new child instead.
              </NoMatchCard>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="childFirstName" className="gap-1">
                First name <RequiredMark />
              </FieldLabel>
              <Input
                id="childFirstName"
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
              <FieldLabel htmlFor="childLastName" className="gap-1">
                Last name <RequiredMark />
              </FieldLabel>
              <Input
                id="childLastName"
                autoComplete="off"
                placeholder="E.g. Doe"
                aria-required
                aria-invalid={!!errors.lastName}
                className="bg-card"
                {...form.register("lastName")}
              />
              <FieldError errors={[errors.lastName]} />
            </Field>

            <Controller
              name="dateOfBirth"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="childDateOfBirth" className="gap-1">
                    Date of birth <RequiredMark />
                  </FieldLabel>
                  <DateInput
                    ref={field.ref}
                    id="childDateOfBirth"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    max={today}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="childGender" className="gap-1">
                    Gender <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={sexLabels}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id="childGender"
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
        )}
      </FormDialogBody>

      <FormDialogFooter onBack={onBack} backLabel="Go Back" progress={progressAt(6)}>
        {tab === "search" ? (
          <Button
            key="continue"
            type="button"
            disabled={!picked}
            onClick={() =>
              picked &&
              onContinue({ kind: "existing", id: picked.id, name: picked.name, hin: picked.hin })
            }
            className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            key="register"
            type="submit"
            className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
          >
            Register child
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

function LinkStep({
  guardian,
  child,
  guardianSummary,
  onBack,
  onLinked,
}: {
  guardian: Guardian;
  child: Child;
  guardianSummary: ReactNode;
  onBack: () => void;
  onLinked: (link: DependentLinked) => void;
}) {
  const link = useLinkDependent();
  const form = useForm<LinkGuardianInput, unknown, LinkGuardianValues>({
    resolver: zodResolver(linkGuardianSchema),
    defaultValues: devPrefill?.linkGuardian ?? {
      relationship: "",
      verification: "",
      primaryContact: true,
      canConsentToTreatment: true,
    },
  });

  function onSubmit(values: LinkGuardianValues) {
    link.mutate(
      {
        guardianId: guardian.id,
        child:
          child.kind === "existing"
            ? { id: child.id }
            : {
                firstName: child.details.firstName,
                lastName: child.details.lastName,
                dateOfBirth: child.details.dateOfBirth,
                sex: child.details.gender,
              },
        ...values,
      },
      { onSuccess: onLinked, onError: (error) => toast.error(getErrorMessage(error)) },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="Link guardian and child"
        description="Record how they are related and how you confirmed it."
      />
      <FormDialogBody minHeight="20rem" className="gap-5">
        {guardianSummary}

        <Controller
          name="relationship"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="guardianRelationship" className="gap-1">
                Relationship to child <RequiredMark />
              </FieldLabel>
              <Select
                name={field.name}
                items={relationshipLabels}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="guardianRelationship"
                  aria-required
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(relationshipLabels).map(([value, label]) => (
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
          name="verification"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend
                variant="label"
                className="mb-3 flex items-center gap-1 type-body-sm-medium text-fg-heading"
              >
                Verification status <RequiredMark />
              </FieldLegend>
              <div className="grid grid-cols-3 gap-3">
                {verifications.map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "cursor-pointer rounded-lg border bg-card px-3 py-2.5 text-center type-body-sm-regular text-fg-caption transition-colors hover:text-fg-heading has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      "has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary",
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={value}
                      checked={field.value === value}
                      onChange={() => field.onChange(value)}
                      onBlur={field.onBlur}
                      className="sr-only"
                    />
                    {guardianVerificationLabels[value]}
                  </label>
                ))}
              </div>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["primaryContact", "Primary contact"],
              ["canConsentToTreatment", "Can consent to treatment"],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 type-body text-fg-heading">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    className="size-5"
                  />
                  {label}
                </label>
              )}
            />
          ))}
        </div>
      </FormDialogBody>

      <FormDialogFooter onBack={onBack} backLabel="Go Back" progress={progressAt(7)}>
        <Button
          type="submit"
          loading={link.isPending}
          className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
        >
          Continue
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}

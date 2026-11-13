import { CaretRightIcon, UserIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { CopyHinButton } from "@/components/copy-hin-button";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import type { DependentLinked } from "@/features/receptionist/api/schemas";
import { RegisterChildFlow } from "@/features/receptionist/components/register-child-flow";
import { RegisterPatientForm } from "@/features/receptionist/components/register-patient-form";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import { formatHin } from "@/lib/format";
import { cn } from "@/lib/utils";

type Kind = "adult" | "kid";

const kinds = {
  adult: {
    title: "Adult",
    description:
      "Register a patient aged 18 or over with their own contact details and account to manage their care.",
  },
  kid: {
    title: "Kid (Dependent)",
    description:
      "Create the child and link a parent or guardian. No smartphone, email or account needed.",
  },
} as const satisfies Record<Kind, { title: string; description: string }>;

/**
 * "Register patient": first who's being registered. An adult goes through their own three
 * steps and ends on "Account Created!" with their new HIN; a kid is linked to the adult bringing
 * them and ends on "Child registered!", from where a second adult can be linked or the child
 * checked in.
 */
export function RegisterPatientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [adultHin, setAdultHin] = useState<string>();
  const [linked, setLinked] = useState<{ link: DependentLinked; kind: "new" | "existing" }>();
  // A child just registered, getting a second adult linked to them.
  const [secondAdultFor, setSecondAdultFor] = useState<DependentLinked["child"]>();
  const child = linked?.link.child;

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setSecondAdultFor(undefined);
          onOpenChange(next);
        }}
      >
        {/* Mounts with the dialog, so every opening starts fresh. */}
        {open && (
          <RegisterSteps
            // Starts over for a second adult, even if the dialog never closed in between.
            key={secondAdultFor?.id ?? "new"}
            secondAdultFor={secondAdultFor}
            onAdultRegistered={(hin) => {
              onOpenChange(false);
              setAdultHin(hin);
            }}
            onChildLinked={(link, kind) => {
              onOpenChange(false);
              setSecondAdultFor(undefined);
              setLinked({ link, kind });
            }}
          />
        )}
      </FormDialog>

      {/* Only "Done" closes it, so the HIN can't be lost to a stray click. */}
      <SuccessDialog
        open={adultHin !== undefined}
        dismissible={false}
        title="Account Created!"
        description="Account created successfully. The patient can log in anytime using their email and password."
        primaryAction={{ label: "Done", onClick: () => setAdultHin(undefined) }}
      >
        <HinBox
          label="Patient’s HIN"
          hin={adultHin ?? ""}
          note="Ask the patient to write down their HIN and keep it confidential."
        />
      </SuccessDialog>

      <SuccessDialog
        open={linked !== undefined}
        onOpenChange={(next) => !next && setLinked(undefined)}
        title={linked?.kind === "new" ? "Child registered!" : "Child linked!"}
        description={
          linked &&
          `${linked.link.child.name} is linked to ${linked.link.guardian.name}. The guardian can sign in to manage the account.`
        }
        secondaryAction={{
          label: "Add second adult",
          onClick: () => {
            setSecondAdultFor(child);
            setLinked(undefined);
            onOpenChange(true);
          },
        }}
        primaryAction={{
          label: "Check in",
          // Checking in happens from the child's profile.
          onClick: () => {
            setLinked(undefined);
            if (child) {
              void navigate({
                to: "/hospital/receptionist/patients/$patientId",
                params: { patientId: child.id },
              });
            }
          },
        }}
      >
        <HinBox
          label="Kid’s HIN"
          hin={child?.hin ?? ""}
          note="Ask the guardian to write down the child’s HIN and keep it safe. They will need it at check-in."
        />
      </SuccessDialog>
    </>
  );
}

function RegisterSteps({
  secondAdultFor,
  onAdultRegistered,
  onChildLinked,
}: {
  secondAdultFor?: DependentLinked["child"];
  onAdultRegistered: (hin: string) => void;
  onChildLinked: (link: DependentLinked, kind: "new" | "existing") => void;
}) {
  const [kind, setKind] = useState<Kind | null>(
    secondAdultFor ? "kid" : (devPrefill?.registerKind ?? null),
  );
  const [chosen, setChosen] = useState(secondAdultFor !== undefined);

  if (chosen && kind === "adult") {
    return (
      <RegisterPatientForm
        onExit={() => setChosen(false)}
        onRegistered={({ hin }) => onAdultRegistered(hin)}
      />
    );
  }
  if (chosen && kind === "kid") {
    return (
      <RegisterChildFlow
        child={secondAdultFor}
        onExit={() => setChosen(false)}
        onLinked={onChildLinked}
      />
    );
  }

  return (
    <>
      <FormDialogHeader title="Register patient" description="Who are you registering?" />
      <FormDialogBody minHeight="20rem" className="gap-4">
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Who are you registering?</legend>
          {(Object.keys(kinds) as Kind[]).map((value) => (
            <label
              key={value}
              className="group flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted has-checked:border-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <span className="flex items-start justify-between">
                <span className="grid size-10 place-content-center rounded-md bg-line text-fg-heading group-has-checked:bg-primary group-has-checked:text-primary-foreground">
                  <UserIcon className="size-5" />
                </span>
                <input
                  type="radio"
                  name="registerKind"
                  value={value}
                  checked={kind === value}
                  onChange={() => setKind(value)}
                  className="peer sr-only"
                />
                {/* The radio's look: a ring, filled in when chosen. */}
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 place-content-center rounded-full border-2 border-divider",
                    kind === value && "border-primary",
                  )}
                >
                  {kind === value && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="type-title-sm text-fg-heading">{kinds[value].title}</span>
                <span className="type-body-sm-regular text-fg-caption">
                  {kinds[value].description}
                </span>
              </div>
            </label>
          ))}
        </fieldset>
      </FormDialogBody>
      <FormDialogFooter progress={1 / 7}>
        <Button
          type="button"
          disabled={!kind}
          onClick={() => setChosen(true)}
          className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
        >
          Continue
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </>
  );
}

/** A new HIN in a tinted box, with a copy button and what to do with it. */
function HinBox({ label, hin, note }: { label: string; hin: string; note: string }) {
  return (
    <div className="rounded-md border border-info-100 bg-info-100/40 px-3 py-2.5 text-left">
      <p className="flex items-center gap-1 type-heading-sm-regular text-fg-heading">
        {label}: <strong className="text-primary">{formatHin(hin)}</strong>
        <CopyHinButton
          hin={formatHin(hin)}
          failureMessage="Couldn’t copy. Write the HIN down instead."
        />
      </p>
      <p className="mt-1 type-caption text-muted-foreground">{note}</p>
    </div>
  );
}

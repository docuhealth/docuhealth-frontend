import { CaretRightIcon, MagnifyingGlassIcon, UserPlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FormDialogBody } from "@/components/dashboard/form-dialog";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { patientLookupQuery } from "@/features/receptionist/api/queries";
import { type FoundPatient, sexLabels } from "@/features/receptionist/api/schemas";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import { ageOn, formatHin, HIN_DIGITS } from "@/lib/format";

/**
 * A HIN field and, once the HIN is complete, the patient it belongs to (a link to their
 * profile), or a prompt to register them if there's no one.
 */
export function PatientLookup({
  inputId,
  onRegisterPatient,
}: {
  inputId: string;
  onRegisterPatient: () => void;
}) {
  const [hin, setHin] = useState(devPrefill?.checkIn.hin ?? "");
  const digits = hin.replace(/\D/g, "");
  const complete = digits.length === HIN_DIGITS;
  const { data, isPending, isError } = useQuery({
    ...patientLookupQuery(digits),
    enabled: complete,
  });

  return (
    <FormDialogBody minHeight="28rem" className="gap-5">
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
          value={hin}
          onChange={(event) => setHin(formatHin(event.target.value))}
        />
      </Field>

      {complete &&
        (isPending ? (
          <Spinner className="mx-auto mt-6 size-6 text-fg-caption" />
        ) : isError ? (
          <p className="text-center type-body-sm-regular text-error-500">
            We couldn’t look that HIN up. Try again in a moment.
          </p>
        ) : data.items.length === 0 ? (
          <NoPatientFound hin={hin} onRegisterPatient={onRegisterPatient} />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.items.map((patient) => (
              <li key={patient.id}>
                <PatientRow patient={patient} />
              </li>
            ))}
          </ul>
        ))}
    </FormDialogBody>
  );
}

function PatientRow({ patient }: { patient: FoundPatient }) {
  const age = ageOn(new Date(patient.dateOfBirth));
  return (
    <Link
      to="/hospital/receptionist/patients/$patientId"
      params={{ patientId: patient.id }}
      className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-muted sm:grid-cols-[1fr_1fr_auto]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <PersonAvatar name={patient.name} src={patient.avatarUrl} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate type-body-sm-medium text-fg-heading">{patient.name}</span>
          <span className="type-body-sm-regular text-fg-caption">
            {age} yrs
            {patient.sex !== "prefer_not_to_say" && ` · ${sexLabels[patient.sex]}`}
            <span className="sm:hidden"> · {formatHin(patient.hin)}</span>
          </span>
        </span>
      </span>
      <span className="hidden type-body-sm-regular sm:block">{formatHin(patient.hin)}</span>
      <CaretRightIcon className="size-5 text-fg-caption" />
    </Link>
  );
}

function NoPatientFound({
  hin,
  onRegisterPatient,
}: {
  hin: string;
  onRegisterPatient: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="mb-4 grid size-14 place-content-center rounded-full bg-line text-fg-heading">
        <MagnifyingGlassIcon className="size-6" />
      </div>
      <p className="type-h5">No patients found</p>
      <p className="type-body-sm-regular text-fg-caption">
        We couldn’t find a patient with HIN “{hin}”.
        <br />
        Check the number, or register them as a new patient.
      </p>
      <Button className="mt-4 h-11 gap-2 px-4 type-heading-sm" onClick={onRegisterPatient}>
        <UserPlusIcon data-icon="inline-start" />
        Register Patient
      </Button>
    </div>
  );
}

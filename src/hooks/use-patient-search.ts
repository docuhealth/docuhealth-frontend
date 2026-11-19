import { type QueryKey, type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatHin, HIN_DIGITS } from "@/lib/format";

/**
 * A HIN being typed and the patients it matches, once it's whole. The only match is picked
 * already; with several, `pick` chooses one. `lookup` is the feature's own HIN lookup query.
 */
export function usePatientSearch<Patient extends { id: string }, Key extends QueryKey>(
  lookup: (hin: string) => UseQueryOptions<{ items: Patient[] }, Error, { items: Patient[] }, Key>,
  initialHin = "",
): PatientSearch<Patient> {
  const [hin, setHin] = useState(initialHin);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const digits = hin.replace(/\D/g, "");
  const complete = digits.length === HIN_DIGITS;
  const { data, isPending, isError } = useQuery({ ...lookup(digits), enabled: complete });

  const matches = complete ? (data?.items ?? []) : [];
  const picked =
    matches.find(({ id }) => id === pickedId) ?? (matches.length === 1 ? matches[0] : undefined);
  const status = !complete
    ? "typing"
    : isPending
      ? "searching"
      : isError
        ? "failed"
        : matches.length === 0
          ? "none"
          : "found";

  return {
    hin,
    setHin: (value: string) => {
      setHin(formatHin(value));
      setPickedId(null);
    },
    matches,
    picked,
    pick: setPickedId,
    status,
  };
}

export type PatientSearch<Patient> = {
  hin: string;
  setHin: (value: string) => void;
  matches: Patient[];
  picked: Patient | undefined;
  pick: (id: string) => void;
  status: "typing" | "searching" | "failed" | "none" | "found";
};

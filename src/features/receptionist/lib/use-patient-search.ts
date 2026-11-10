import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { patientLookupQuery } from "@/features/receptionist/api/queries";
import { formatHin, HIN_DIGITS } from "@/lib/format";

/**
 * A HIN being typed and the patients it matches, once it's whole. The only match is picked
 * already; with several, `pick` chooses one.
 */
export function usePatientSearch(initialHin = "") {
  const [hin, setHin] = useState(initialHin);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const digits = hin.replace(/\D/g, "");
  const complete = digits.length === HIN_DIGITS;
  const { data, isPending, isError } = useQuery({
    ...patientLookupQuery(digits),
    enabled: complete,
  });

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
  } as const;
}
export type PatientSearch = ReturnType<typeof usePatientSearch>;

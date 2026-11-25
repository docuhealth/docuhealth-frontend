import { useQuery } from "@tanstack/react-query";
import { visitsQuery } from "@/features/patient/api/queries";
import { usePatient } from "@/features/patient/lib/use-patient";

/** The signed-in patient's visit summaries, newest first. */
export function useVisits() {
  const { hin } = usePatient();
  return useQuery(visitsQuery(hin));
}

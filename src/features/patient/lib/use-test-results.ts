import { useQuery } from "@tanstack/react-query";
import { labResultsQuery } from "@/features/patient/api/pending";
import { labReportsQuery } from "@/features/patient/api/pending-results";
import { labTestsOf } from "@/features/patient/lib/results";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * The patient's lab tests with their values and reports, newest first (`undefined` while
 * loading). TODO(api): values and reports are pending records, empty outside the mock dev server.
 */
export function useTestResults() {
  const visits = useVisits();
  const results = useQuery(labResultsQuery());
  const reports = useQuery(labReportsQuery());
  const tests =
    visits.data && results.data && reports.data
      ? labTestsOf(visits.data, results.data, reports.data)
      : undefined;
  return { tests, isError: visits.isError || results.isError || reports.isError };
}

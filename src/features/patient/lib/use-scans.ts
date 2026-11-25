import { useQuery } from "@tanstack/react-query";
import { scanReportsQuery } from "@/features/patient/api/pending";
import { scansOf } from "@/features/patient/lib/records";
import { scanViews } from "@/features/patient/lib/scans";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * The patient's scans with their reports, newest first (`undefined` while loading). TODO(api):
 * reports come from the pending scan reports, empty outside the mock dev server.
 */
export function useScans() {
  const visits = useVisits();
  const reports = useQuery(scanReportsQuery());
  const scans =
    visits.data && reports.data ? scanViews(scansOf(visits.data), reports.data) : undefined;
  return { scans, isError: visits.isError || reports.isError };
}

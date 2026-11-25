import { ChartBarIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { labResultsQuery } from "@/features/patient/api/pending";
import { labHistoryQuery } from "@/features/patient/api/pending-health";
import { vitalsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { TrendLatestCard } from "@/features/patient/components/trend-latest-card";
import { TrendReadingsCard } from "@/features/patient/components/trend-readings-card";
import { VitalChips } from "@/features/patient/components/vital-chips";
import {
  type HealthTrendKey,
  healthTrend,
  healthTrendOptions,
} from "@/features/patient/lib/health-trends";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * The Health page's Trends: blood pressure and weight from the vital signs, and HbA1c,
 * haemoglobin and creatinine from lab results. TODO(api): lab values (and their history) are
 * pending records.
 */
export function HealthTrendsPage() {
  const vitals = useQuery(vitalsQuery());
  const visits = useVisits();
  const results = useQuery(labResultsQuery());
  const history = useQuery(labHistoryQuery());
  const [key, setKey] = useState<HealthTrendKey>("bloodPressure");

  const loading =
    (!vitals.data && !vitals.isError) ||
    (!visits.data && !visits.isError) ||
    (!results.data && !results.isError) ||
    (!history.data && !history.isError);
  const metric = healthTrend(key, {
    vitals: vitals.data ?? [],
    visits: visits.data ?? [],
    results: results.data ?? [],
    history: history.data ?? [],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Trends" back={{ to: "/patient/health", label: "Back to Health" }} />
      <VitalChips label="Trend" value={key} options={healthTrendOptions} onChange={setKey} />
      {loading ? (
        <ListSkeleton />
      ) : metric.points.length === 0 ? (
        <PatientEmpty
          icon={<ChartBarIcon />}
          title="Not enough data yet"
          description="Your health trends will appear as more readings and results are added."
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
          <TrendLatestCard metric={metric} />
          <TrendReadingsCard metric={metric} />
        </div>
      )}
    </div>
  );
}

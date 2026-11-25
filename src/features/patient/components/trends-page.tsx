import { ChartBarIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { vitalsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { TrendLatestCard } from "@/features/patient/components/trend-latest-card";
import { TrendReadingsCard } from "@/features/patient/components/trend-readings-card";
import { VitalChips } from "@/features/patient/components/vital-chips";
import type { VitalKey } from "@/features/patient/lib/vitals";

/** One vital sign over time: pick it, see its latest reading, chart and readings. */
export function TrendsPage() {
  const { data, isError } = useQuery(vitalsQuery());
  const [vital, setVital] = useState<VitalKey>("bloodPressure");

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Trends"
        back={{ to: "/patient/health/vitals", label: "Back to Vital signs" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !data?.length ? (
        <PatientEmpty
          icon={<ChartBarIcon />}
          title="No trends yet"
          description="Your readings will chart here once a nurse records your vital signs at a connected facility."
        />
      ) : (
        <>
          <VitalChips value={vital} onChange={setVital} />
          <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
            <TrendLatestCard readings={data} vital={vital} />
            <TrendReadingsCard readings={data} vital={vital} />
          </div>
        </>
      )}
    </div>
  );
}

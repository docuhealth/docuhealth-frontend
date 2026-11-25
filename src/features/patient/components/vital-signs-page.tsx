import { HeartbeatIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import trendsIconUrl from "@/assets/svgs/trends.svg";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { vitalsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { VitalEarlierReadings } from "@/features/patient/components/vital-earlier-readings";
import { VitalTile } from "@/features/patient/components/vital-tile";
import {
  groupReadings,
  vitalKeys,
  vitalLabels,
  vitalTile,
  vitalUnits,
} from "@/features/patient/lib/vitals";
import { formatDay } from "@/lib/format";

/** The newest reading of each vital sign, then earlier readings by day and facility. */
export function VitalSignsPage() {
  const { data, isError } = useQuery(vitalsQuery());
  const latest = data?.[0];
  // The newest day's readings are the tiles; the rest are earlier.
  const earlier = groupReadings(data ?? []).slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Vital signs"
        subtitle={
          !data
            ? null
            : latest
              ? `Last recorded ${formatDay(new Date(latest.at))}${latest.facility ? ` · ${latest.facility}` : ""}`
              : "No readings yet"
        }
        back={{ to: "/patient/health", label: "Back to Health" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !latest ? (
        <PatientEmpty
          icon={<HeartbeatIcon />}
          title="No vital signs yet"
          description="Your blood pressure, pulse, weight and other readings will show here after a nurse records them at a connected facility."
        />
      ) : (
        <>
          <div className="flex justify-end">
            <Link
              to="/patient/health/vitals/trends"
              aria-label="Trends"
              title="Trends"
              className="grid size-9 place-content-center rounded-md border bg-card transition-colors hover:border-primary/40"
            >
              <img src={trendsIconUrl} alt="" className="size-4.5" />
            </Link>
          </div>
          <ul aria-label="Latest readings" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {vitalKeys.map((key) => {
              const tile = vitalTile(data ?? [], key);
              return (
                <VitalTile
                  key={key}
                  vital={key}
                  label={vitalLabels[key]}
                  value={tile.value}
                  unit={vitalUnits[key]}
                  note={tile.note}
                />
              );
            })}
          </ul>
          {earlier.length > 0 && <VitalEarlierReadings groups={earlier} />}
        </>
      )}
    </div>
  );
}

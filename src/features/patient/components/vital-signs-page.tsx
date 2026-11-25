import { HeartbeatIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import type { Vitals } from "@/features/patient/api/schemas";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, RecordRow, SectionLabel } from "@/features/patient/components/patient-ui";
import { VitalTile } from "@/features/patient/components/vital-tile";
import { dated } from "@/features/patient/lib/dated";
import { bloodPressureNote, bmiNote, type ReadingNote } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";

const vitalTiles: {
  label: string;
  unit: string;
  read: (vitals: Vitals) => number | string | null;
  note?: (vitals: Vitals) => ReadingNote | null;
}[] = [
  {
    label: "Blood pressure",
    unit: "mmHg",
    read: (v) => v.bloodPressure,
    note: (v) => bloodPressureNote(v.bloodPressure),
  },
  { label: "Pulse", unit: "bpm", read: (v) => v.heartRate },
  { label: "Temperature", unit: "°C", read: (v) => v.temperature },
  { label: "Weight", unit: "kg", read: (v) => v.weight },
  { label: "BMI", unit: "kg/m²", read: (v) => v.bmi, note: (v) => bmiNote(v.bmi) },
];

/** The newest reading of each vital sign, and earlier sets by visit. */
export function VitalSignsPage() {
  const { data, isError } = useVisits();
  const withVitals = (data ?? []).filter((visit) => visit.vitals);
  const latest = withVitals[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Vital signs"
        subtitle={
          !data
            ? null
            : latest
              ? `Last recorded ${dated(latest.vitals!.at)}${latest.facility ? ` · ${latest.facility}` : ""}`
              : "No readings yet"
        }
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
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {vitalTiles.map((tile) => (
              <VitalTile
                key={tile.label}
                label={tile.label}
                value={tile.read(latest.vitals!)}
                unit={tile.unit}
                note={tile.note?.(latest.vitals!) ?? null}
              />
            ))}
          </ul>
          {withVitals.length > 1 && (
            <>
              <SectionLabel>Earlier readings</SectionLabel>
              <RecordList label="Earlier readings">
                {withVitals.slice(1).map((visit) => (
                  <RecordRow
                    key={visit.id}
                    title={dated(visit.vitals!.at)}
                    detail={[
                      visit.facility,
                      visit.vitals!.bloodPressure && `BP ${visit.vitals!.bloodPressure}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    to="/patient/health/visits/$visitId"
                    params={{ visitId: visit.id }}
                  />
                ))}
              </RecordList>
            </>
          )}
        </>
      )}
    </div>
  );
}

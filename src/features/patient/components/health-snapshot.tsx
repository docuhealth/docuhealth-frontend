import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  DropIcon,
  HeartbeatIcon,
  PersonSimpleIcon,
  ScalesIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import type { HealthProfile } from "@/features/patient/api/pending";
import type { VisitSummary } from "@/features/patient/api/schemas";
import { SnapshotCard } from "@/features/patient/components/snapshot-card";
import {
  bloodPressureNote,
  bmiNote,
  glucoseNote,
  latestVitals,
} from "@/features/patient/lib/records";
import { formatDayMonth } from "@/lib/format";

/** The patient's latest blood pressure, weight, BMI and glucose, from their visits' vitals. */
export function HealthSnapshot({
  visits,
  glucose,
}: {
  visits: VisitSummary[] | undefined;
  glucose: HealthProfile["glucose"];
}) {
  if (!visits) {
    return <CardSkeleton lines={8} className="rounded-xl border bg-card p-5" />;
  }
  const pressure = latestVitals(visits, (vitals) => vitals.bloodPressure).latest;
  const weight = latestVitals(visits, (vitals) => vitals.weight);
  const bmi = latestVitals(visits, (vitals) => vitals.bmi).latest;
  const weightChange =
    weight.latest?.weight != null && weight.previous?.weight != null
      ? Math.round((weight.latest.weight - weight.previous.weight) * 10) / 10
      : null;

  return (
    <section
      aria-labelledby="snapshot-heading"
      className="flex flex-col gap-4 self-start rounded-xl border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <h2 id="snapshot-heading" className="type-title-sm text-fg-heading">
          Health Snapshot
        </h2>
        <Link
          to="/patient/health/vitals"
          className="type-caption-semibold text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <SnapshotCard
        icon={<HeartbeatIcon weight="bold" />}
        tone="success"
        label="Blood pressure"
        value={pressure?.bloodPressure ?? null}
        unit="mmHg"
        at={pressure?.at ?? null}
        note={bloodPressureNote(pressure?.bloodPressure ?? null)}
      />
      <SnapshotCard
        icon={<ScalesIcon weight="bold" />}
        tone="info"
        label="Weight"
        value={weight.latest?.weight != null ? String(weight.latest.weight) : null}
        unit="kg"
        at={weight.latest?.at ?? null}
        note={
          weightChange != null && weight.previous
            ? {
                icon: !weightChange ? undefined : weightChange > 0 ? (
                  <ArrowCircleUpIcon weight="fill" />
                ) : (
                  <ArrowCircleDownIcon weight="fill" />
                ),
                lead: weightChange ? `${Math.abs(weightChange)}kg` : "No change",
                label: `${weightChange ? `${Math.abs(weightChange)}kg` : "No change"} since ${formatDayMonth(new Date(weight.previous.at))}`,
                tone: "brand",
              }
            : null
        }
      />
      <SnapshotCard
        icon={<PersonSimpleIcon weight="bold" />}
        tone="warning"
        label="BMI"
        value={bmi?.bmi != null ? String(bmi.bmi) : null}
        unit="kg/m²"
        at={bmi?.at ?? null}
        note={bmiNote(bmi?.bmi ?? null)}
      />
      {/* TODO(api): blood glucose isn't a vital sign the API records; it's in the pending profile. */}
      <SnapshotCard
        icon={<DropIcon weight="bold" />}
        tone="error"
        label="Blood glucose"
        value={glucose ? glucose.value.toFixed(1) : null}
        unit="mmol/L"
        at={glucose?.at ?? null}
        note={glucoseNote(glucose)}
      />
    </section>
  );
}

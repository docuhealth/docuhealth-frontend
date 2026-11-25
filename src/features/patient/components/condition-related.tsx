import { ChartLineUpIcon, ClipboardTextIcon, ListChecksIcon } from "@phosphor-icons/react";
import type { CarePlan } from "@/features/patient/api/pending";
import type { DrugRecord, VisitSummary, VitalReading } from "@/features/patient/api/schemas";
import { RecordList } from "@/features/patient/components/patient-ui";
import { RelatedRow } from "@/features/patient/components/related-row";
import {
  bloodPressureLine,
  carePlanLine,
  latestBloodPressure,
  tracksBloodPressure,
} from "@/features/patient/lib/conditions";
import { drugNamed, frequencyOfDrug } from "@/features/patient/lib/visits";

/**
 * What goes with a condition: the medicines from the visit it was diagnosed at, its care plan
 * and, for blood pressure, the latest reading.
 */
export function ConditionRelated({
  name,
  visit,
  drugs,
  plan,
  readings,
}: {
  name: string;
  visit: VisitSummary;
  drugs: DrugRecord[];
  plan: CarePlan | null;
  readings: VitalReading[];
}) {
  const reading = tracksBloodPressure(name, plan) ? latestBloodPressure(readings) : null;
  if (!visit.drugs.length && !plan && !reading) {
    return (
      <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
        Nothing else recorded with this diagnosis.
      </p>
    );
  }
  return (
    <RecordList label="Related">
      {visit.drugs.map((drug) => (
        <RelatedRow
          key={drug.name}
          icon={<ClipboardTextIcon />}
          title={drug.name}
          detail={["Medication", frequencyOfDrug(drugNamed(drugs, drug.name))]
            .filter(Boolean)
            .join(" · ")}
          to="/patient/health/medications"
        />
      ))}
      {plan && (
        <RelatedRow
          icon={<ListChecksIcon />}
          title={plan.name}
          detail={carePlanLine(plan)}
          to="/patient/health/care-plans/$planId"
          params={{ planId: plan.id }}
        />
      )}
      {reading && (
        <RelatedRow
          icon={<ChartLineUpIcon />}
          title={`Blood pressure ${reading.bloodPressure}`}
          detail={bloodPressureLine(reading, plan)}
          to="/patient/health/vitals"
        />
      )}
    </RecordList>
  );
}

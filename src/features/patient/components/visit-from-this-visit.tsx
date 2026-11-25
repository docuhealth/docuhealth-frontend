import { WaveformIcon } from "@phosphor-icons/react";
import labIconUrl from "@/assets/svgs/lab-result.svg";
import pillIconUrl from "@/assets/svgs/medication-pill.svg";
import type { LabResult } from "@/features/patient/api/pending";
import type { DrugRecord, VisitSummary } from "@/features/patient/api/schemas";
import { RecordList } from "@/features/patient/components/patient-ui";
import { RelatedRow } from "@/features/patient/components/related-row";
import { VisitLabFlag } from "@/features/patient/components/visit-lab-flag";
import { orderStatusLabel } from "@/features/patient/lib/records";
import {
  drugNamed,
  frequencyOfDrug,
  labHeadline,
  labResultFor,
} from "@/features/patient/lib/visits";

/**
 * The lab tests, medicines and vital signs recorded at a visit. Without a summary, each lab
 * value gets its own row (as a lab-only visit's results). TODO(api): no lab results page for
 * patients yet, so lab rows don't open anything.
 */
export function VisitFromThisVisit({
  visit,
  results,
  drugs,
  summary,
}: {
  visit: VisitSummary;
  results: LabResult[];
  drugs: DrugRecord[];
  summary: boolean;
}) {
  const labs = visit.labTests.map((test) => ({
    test,
    result: labResultFor(results, visit.id, test.name),
  }));
  if (!labs.length && !visit.drugs.length && !visit.vitals) {
    return (
      <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
        Nothing else was recorded.
      </p>
    );
  }
  return (
    <RecordList label="From this visit">
      {labs.flatMap(({ test, result }) => {
        if (!summary && result) {
          return result.values.map((value) => (
            <RelatedRow
              key={`lab-${test.name}-${value.name}`}
              title={value.name}
              detail={[value.value, value.unit].filter(Boolean).join(" ")}
              status={<VisitLabFlag flag={value.flag} />}
            />
          ));
        }
        const headline = labHeadline(result);
        return [
          <RelatedRow
            key={`lab-${test.name}`}
            icon={<img src={labIconUrl} alt="" />}
            tone="info"
            title={test.name}
            detail={headline?.line ?? orderStatusLabel(test.status) ?? "Lab test"}
            status={
              headline && headline.flag !== "normal" ? <VisitLabFlag flag={headline.flag} /> : null
            }
          />,
        ];
      })}
      {visit.drugs.map((drug) => (
        <RelatedRow
          key={`drug-${drug.name}`}
          icon={<img src={pillIconUrl} alt="" />}
          tone="success"
          title={drug.name}
          detail={["Medication", frequencyOfDrug(drugNamed(drugs, drug.name))]
            .filter(Boolean)
            .join(" · ")}
          to="/patient/health/medications"
        />
      ))}
      {visit.vitals && (
        <RelatedRow
          icon={<WaveformIcon />}
          tone="purple"
          title="Vital signs"
          detail={[
            visit.vitals.bloodPressure && `BP ${visit.vitals.bloodPressure}`,
            visit.vitals.heartRate != null && `Pulse ${visit.vitals.heartRate}`,
            visit.vitals.weight != null && `${visit.vitals.weight} kg`,
          ]
            .filter(Boolean)
            .join(" · ")}
          to="/patient/health/vitals"
        />
      )}
    </RecordList>
  );
}

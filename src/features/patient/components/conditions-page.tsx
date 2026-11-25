import { BookOpenIcon } from "@phosphor-icons/react";
import { useState } from "react";
import conditionIconUrl from "@/assets/svgs/condition-detail-icon.svg";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { ConditionStatusTag } from "@/features/patient/components/condition-status-tag";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import {
  RecordList,
  RecordRow,
  ReportChange,
  Segments,
} from "@/features/patient/components/patient-ui";
import { conditionLine } from "@/features/patient/lib/conditions";
import { conditionsOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";

/**
 * Diagnoses from the patient's visits. TODO(api): conditions have no status, so the newest
 * diagnosis counts as active and earlier ones as past.
 */
export function ConditionsPage() {
  const { data, isError } = useVisits();
  const [tab, setTab] = useState<"active" | "past">("active");
  const conditions = data ? conditionsOf(data) : [];
  const active = conditions.filter((condition) => condition.active);
  const past = conditions.filter((condition) => !condition.active);
  const shown = tab === "active" ? active : past;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Conditions"
        subtitle={data ? `${active.length} active · ${past.length} past` : null}
        back={{ to: "/patient/health", label: "Back to Health" }}
      />
      <Segments
        label="Conditions"
        value={tab}
        onChange={setTab}
        options={[
          { value: "active", label: `Active (${active.length})` },
          { value: "past", label: `Past (${past.length})` },
        ]}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<BookOpenIcon />}
          title="No conditions recorded"
          description="When a doctor records a diagnosis at a connected facility, you’ll see it here with the date and who recorded it."
        />
      ) : (
        <RecordList label="Conditions">
          {shown.map((condition) => (
            <RecordRow
              key={condition.id}
              icon={<img src={conditionIconUrl} alt="" className="size-5" />}
              title={condition.name}
              detail={conditionLine(condition)}
              meta={[condition.facility, condition.clinician].filter(Boolean).join(" · ")}
              status={<ConditionStatusTag active={condition.active} />}
              to="/patient/health/conditions/$conditionId"
              params={{ conditionId: condition.id }}
            />
          ))}
        </RecordList>
      )}
      <ReportChange />
    </div>
  );
}

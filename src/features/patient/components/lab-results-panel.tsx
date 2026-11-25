import { FlaskIcon } from "@phosphor-icons/react";
import type { LabResult } from "@/features/patient/api/pending";
import type { VisitSummary } from "@/features/patient/api/schemas";
import { AttentionPanel, AttentionRow } from "@/features/patient/components/attention-panel";
import { Tag } from "@/features/patient/components/tag";
import { dated } from "@/features/patient/lib/dated";
import { flagLabel, rangeSummary, resultFor } from "@/features/patient/lib/lab-results";
import { orderStatusLabel } from "@/features/patient/lib/records";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The home page's recent results: the latest test's values against their range when the facility
 * shared them ("13.8 g/dL · Normal"), otherwise the visit's tests and where each one is.
 */
export function LabResultsPanel({
  visit,
  results,
  fresh,
}: {
  visit: VisitSummary;
  results: LabResult[];
  fresh: boolean;
}) {
  const first = visit.labTests[0];
  const values = first ? resultFor(results, visit.id, first.name) : null;
  const summary = values ? rangeSummary(values.values) : null;
  const link = {
    to: "/patient/health/visits/$visitId" as const,
    params: { visitId: visit.id },
    label: "View result",
  };
  const badge = fresh ? <Tag tone="success">New</Tag> : undefined;

  if (first && values?.values.length) {
    return (
      <AttentionPanel
        icon={<FlaskIcon />}
        tone="warning"
        title={first.name}
        detail={
          <span className={cn(summary?.outside ? "text-warning-700" : "text-success-700")}>
            {summary?.label}
          </span>
        }
        badge={badge}
        link={link}
      >
        {values.values.map((value) => (
          <AttentionRow key={value.name} name={value.name}>
            <span className="type-body-sm-regular text-fg-caption">
              <span className="type-title-sm text-fg-heading">{value.value}</span> {value.unit}
            </span>
            <span className="w-24 text-right">
              <Tag tone={value.flag === "normal" ? "success" : "warning"}>
                {flagLabel(value.flag)}
              </Tag>
            </span>
          </AttentionRow>
        ))}
      </AttentionPanel>
    );
  }

  return (
    <AttentionPanel
      icon={<FlaskIcon />}
      tone="warning"
      title="Recent results"
      detail={`${plural(visit.labTests.length, "test")} from your visit on ${dated(visit.at)}`}
      badge={badge}
      link={link}
    >
      {visit.labTests.map((test) => (
        <AttentionRow key={test.name} name={test.name}>
          {/* TODO(api): result values only come with the pending lab-results endpoint. */}
          <Tag tone={test.status === "pending" ? "warning" : "success"}>
            {orderStatusLabel(test.status) ?? "—"}
          </Tag>
        </AttentionRow>
      ))}
    </AttentionPanel>
  );
}

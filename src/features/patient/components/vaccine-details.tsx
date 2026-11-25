import type { Vaccine } from "@/features/patient/api/pending-immunizations";
import { DetailRows, RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { VaccineHeaderCard } from "@/features/patient/components/vaccine-header-card";
import { VaccineReportLink } from "@/features/patient/components/vaccine-report-link";
import { VaccineRow } from "@/features/patient/components/vaccine-row";
import { VaccineStatusCard } from "@/features/patient/components/vaccine-status-card";
import {
  doseLine,
  doseTitle,
  dueIn,
  lastDoseLine,
  lastRecordedDose,
  protectionLine,
  vaccineStatus,
} from "@/features/patient/lib/immunizations";
import { notYet } from "@/features/patient/lib/not-yet";
import { formatDay } from "@/lib/format";

/** A vaccine's page body: its header, due date or protection, doses, and the last dose's details. */
export function VaccineDetails({ vaccine }: { vaccine: Vaccine }) {
  const status = vaccineStatus(vaccine);
  const recorded = lastRecordedDose(vaccine);
  const { due } = vaccine;
  const listLabel = due ? "History" : "Doses";

  return (
    <>
      <VaccineHeaderCard
        title={vaccine.name}
        tag={<Tag tone={status.tone}>{status.label}</Tag>}
        detail={[vaccine.facility, `Last updated ${formatDay(new Date(vaccine.updatedAt))}`]
          .filter(Boolean)
          .join(" · ")}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {due ? (
            <VaccineStatusCard
              kind="due"
              title={formatDay(new Date(due.at))}
              detail={lastDoseLine(vaccine)}
              tag={<Tag tone="warning">{dueIn(due.at)}</Tag>}
            />
          ) : (
            <VaccineStatusCard
              kind="protection"
              title="Fully vaccinated"
              detail={protectionLine(vaccine)}
              tag={<Tag tone="success">Up to date</Tag>}
            />
          )}
          <section className="flex flex-col gap-2">
            <SectionLabel>{listLabel}</SectionLabel>
            <RecordList label={listLabel}>
              {due && (
                <VaccineRow
                  due
                  title={due.kind === "booster" ? "Booster" : "Next dose"}
                  detail={`Due by ${formatDay(new Date(due.at))}`}
                />
              )}
              {vaccine.doses.map((dose, index) => (
                <VaccineRow
                  key={`${dose.kind}-${dose.at ?? index}`}
                  title={doseTitle(dose)}
                  detail={doseLine(dose)}
                />
              ))}
            </RecordList>
          </section>
        </div>
        <div className="flex flex-col gap-4">
          {due ? (
            <>
              <DetailRows
                rows={[
                  ["Reminder", due.reminder],
                  ["Protects against", vaccine.protectsAgainst],
                ]}
              />
              {/* TODO(api): patients can't ask a facility to add a dose yet. */}
              <p className="text-center type-caption text-fg-caption">
                Already had it?{" "}
                <button
                  type="button"
                  onClick={notYet("Asking a facility to add a vaccine")}
                  className="type-caption-medium text-primary hover:underline"
                >
                  Ask the facility to add it to your record.
                </button>
              </p>
            </>
          ) : (
            <>
              {recorded && (
                <DetailRows
                  rows={[
                    ["Given by", recorded.givenBy],
                    [recorded.number ? `Batch (dose ${recorded.number})` : "Batch", recorded.batch],
                  ]}
                />
              )}
              <VaccineReportLink />
            </>
          )}
        </div>
      </div>
    </>
  );
}

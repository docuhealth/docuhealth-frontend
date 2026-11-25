import { SyringeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { immunizationsQuery } from "@/features/patient/api/pending-immunizations";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { VaccineHeaderCard } from "@/features/patient/components/vaccine-header-card";
import { VaccineReportLink } from "@/features/patient/components/vaccine-report-link";
import { VaccineRow } from "@/features/patient/components/vaccine-row";
import { VaccineStatusCard } from "@/features/patient/components/vaccine-status-card";
import {
  dueIn,
  dueLine,
  sourcesLine,
  splitVaccines,
  vaccineLine,
} from "@/features/patient/lib/immunizations";

/**
 * The patient's vaccines: what's due next, then the completed ones. TODO(api): the records come
 * from api/pending-immunizations.ts.
 */
export function ImmunizationPage() {
  const { data, isError } = useQuery(immunizationsQuery());
  const vaccines = data ?? [];
  const { due, completed } = splitVaccines(vaccines);
  const loading = !data && !isError;
  const counts = [`${vaccines.length} recorded`, due.length ? `${due.length} due soon` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="Immunization"
        subtitle={loading ? null : vaccines.length ? counts : "No records yet"}
        back={{ to: "/patient/health", label: "Back to Health" }}
      />
      {loading ? (
        <ListSkeleton />
      ) : vaccines.length === 0 ? (
        <PatientEmpty
          icon={<SyringeIcon />}
          title="No records yet"
          description="Your vaccination records will appear here once they’re added to your health record."
        />
      ) : (
        <>
          <VaccineHeaderCard
            title="Your vaccines"
            tag={due.length > 0 && <Tag tone="warning">{due.length} due soon</Tag>}
            detail={[`${vaccines.length} recorded`, sourcesLine(vaccines)]
              .filter(Boolean)
              .join(" · ")}
          />
          {due.map((vaccine) => (
            <VaccineStatusCard
              key={vaccine.id}
              kind="due"
              title={vaccine.name}
              detail={dueLine(vaccine.due!)}
              tag={<Tag tone="warning">{dueIn(vaccine.due!.at)}</Tag>}
              to="/patient/health/immunizations/$vaccineId"
              params={{ vaccineId: vaccine.id }}
            />
          ))}
          {completed.length > 0 && (
            <section className="flex flex-col gap-2">
              <SectionLabel>Completed</SectionLabel>
              <RecordList label="Completed vaccines">
                {completed.map((vaccine) => (
                  <VaccineRow
                    key={vaccine.id}
                    title={vaccine.name}
                    detail={vaccineLine(vaccine)}
                    to="/patient/health/immunizations/$vaccineId"
                    params={{ vaccineId: vaccine.id }}
                  />
                ))}
              </RecordList>
            </section>
          )}
          <VaccineReportLink />
        </>
      )}
    </div>
  );
}

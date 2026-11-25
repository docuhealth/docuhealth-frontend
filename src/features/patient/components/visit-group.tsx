import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { VisitDivider } from "@/features/patient/components/visit-divider";
import { VisitStatusTag } from "@/features/patient/components/visit-status-tag";
import type { VisitRow } from "@/features/patient/lib/visits";

/** One group of the Visits list under its divider: upcoming or past. */
export function VisitGroup({ label, rows }: { label: string; rows: VisitRow[] }) {
  if (!rows.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <VisitDivider>{label}</VisitDivider>
      <RecordList label={`${label} visits`}>
        {rows.map((row) =>
          row.visitId ? (
            <RecordRow
              key={row.id}
              title={row.title}
              meta={row.line}
              status={<VisitStatusTag status={row.status} />}
              to="/patient/health/visits/$visitId"
              params={{ visitId: row.visitId }}
            />
          ) : (
            <RecordRow
              key={row.id}
              title={row.title}
              meta={row.line}
              status={<VisitStatusTag status={row.status} />}
              to="/patient/appointments"
            />
          ),
        )}
      </RecordList>
    </section>
  );
}

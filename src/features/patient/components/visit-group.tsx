import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { VisitDivider } from "@/features/patient/components/visit-divider";
import { VisitStatusTag } from "@/features/patient/components/visit-status-tag";
import type { VisitRow } from "@/features/patient/lib/visits";

/** One group of the Visits list, upcoming or past, under its divider (not in the tab layout). */
export function VisitGroup({
  label,
  rows,
  divider = true,
}: {
  label: string;
  rows: VisitRow[];
  divider?: boolean;
}) {
  if (!rows.length) return null;
  return (
    <section className="flex flex-col gap-3">
      {divider && <VisitDivider>{label}</VisitDivider>}
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
          ) : row.status === "booked" ? (
            <RecordRow
              key={row.id}
              title={row.title}
              meta={row.line}
              status={<VisitStatusTag status={row.status} />}
              to="/patient/appointments"
            />
          ) : (
            // A check-in with no summary: nothing more to open yet.
            <RecordRow
              key={row.id}
              title={row.title}
              meta={row.line}
              status={<VisitStatusTag status={row.status} />}
            />
          ),
        )}
      </RecordList>
    </section>
  );
}

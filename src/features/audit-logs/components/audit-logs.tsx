import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { type ReactNode, useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { AUDIT_LOGS_PAGE_SIZE, auditLogListQuery } from "@/features/audit-logs/api/queries";
import { type AuditLog, type AuditType, auditTypeLabels } from "@/features/audit-logs/api/schemas";
import { formatDayAndTime, maskHin } from "@/lib/format";

const types = Object.keys(auditTypeLabels) as AuditType[];

const recordLabel = { laboratory: "Test", radiology: "Scan report" } as const;

/**
 * Who downloaded lab results and scan reports, and when: a tab for each, with each download's
 * record a click away.
 */
export function AuditLogs({ description }: { description: string }) {
  const [type, setType] = useState<AuditType>("laboratory");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AuditLog | null>(null);
  const { data, error } = useQuery(auditLogListQuery(type, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];

  const empty = error
    ? isAxiosError(error) && error.response?.status === 403
      ? "Your account can’t see these logs yet."
      : "We couldn’t load the audit logs. Try again in a moment."
    : data?.items.length === 0 &&
      (type === "laboratory"
        ? "No lab results have been downloaded yet."
        : "No scan reports have been downloaded yet.");

  const viewButton = (log: AuditLog) => (
    <Button
      variant="outline"
      size="sm"
      aria-label={`View the download of ${log.record}`}
      onClick={() => setViewing(log)}
      className="bg-card type-caption-semibold font-sans text-fg-heading"
    >
      View
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Audit logs</h1>
        <p className="type-body-sm-regular text-fg-caption">{description}</p>
      </div>

      <section aria-label="Downloads" className="@container rounded-xl border bg-card p-4">
        <Tabs
          value={type}
          onValueChange={(next) => {
            setType(next as AuditType);
            setPage(1);
          }}
          className="gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            {types.map((value) => (
              <CountTab key={value} value={value} count={value === type ? data?.total : undefined}>
                {auditTypeLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @3xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Date & Time", className: "w-32 type-body-sm-regular" },
              { label: "Downloaded by", className: "w-[22%] type-body-sm-regular" },
              { label: "Patient", className: "w-[24%] type-body-sm-regular" },
              { label: recordLabel[type], className: "type-body-sm-regular" },
              { label: "Details", hideLabel: true, className: "w-24" },
            ]}
            empty={empty}
          >
            {items.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <When at={log.at} now={now} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Staff log={log} />
                </TableCell>
                <TableCell>
                  <Patient log={log} />
                </TableCell>
                <TableCell className="whitespace-normal">{log.record}</TableCell>
                <TableCell className="text-right">{viewButton(log)}</TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @3xl:hidden">
          {empty ? (
            <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
          ) : (
            <ul aria-label="Downloads">
              {items.map((log) => (
                <li key={log.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient log={log} />
                    </div>
                    {viewButton(log)}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-3">
                    <Detail label="Date & Time">
                      <When at={log.at} now={now} />
                    </Detail>
                    <Detail label="Downloaded by">
                      <Staff log={log} />
                    </Detail>
                    <Detail label={recordLabel[type]}>{log.record}</Detail>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={AUDIT_LOGS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      {viewing && <AuditLogDialog log={viewing} now={now} onClose={() => setViewing(null)} />}
    </div>
  );
}

/** One download: who, when, for whom, and the record as it was downloaded. */
function AuditLogDialog({ log, now, onClose }: { log: AuditLog; now: Date; onClose: () => void }) {
  const { day, time } = formatDayAndTime(new Date(log.at), now);
  const facts = [
    { label: "Action", value: log.action },
    { label: "When", value: `${day}, ${time}` },
    {
      label: "Done by",
      value: log.staff ? [log.staff.name, log.staff.role].filter(Boolean).join(" · ") : "—",
    },
    { label: "Patient", value: log.patient ? `${log.patient.name} · HIN ${log.patient.hin}` : "—" },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-lg">
        <header className="border-b px-6 py-5">
          <DialogTitle className="type-accent-h4 text-fg-heading">Download details</DialogTitle>
          <DialogDescription className="type-body-sm-regular text-fg-caption">
            {log.record}
          </DialogDescription>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <InfoList rows={facts} />
          {log.values.length > 0 && (
            <section aria-label="Result values" className="flex flex-col gap-2">
              <h3 className="type-body-sm-medium text-fg-heading">Result values</h3>
              <InfoList
                rows={log.values.map(({ name, value, unit }) => ({
                  label: name,
                  value: unit ? `${value} ${unit}` : value,
                }))}
              />
            </section>
          )}
          {log.details.length > 0 && (
            <section aria-label="Record" className="flex flex-col gap-2">
              <h3 className="type-body-sm-medium text-fg-heading">Record</h3>
              <InfoList rows={log.details} />
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col divide-y rounded-lg border">
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-2.5">
          <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
          <dd className="type-body-sm-regular break-words text-fg-heading">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Staff({ log }: { log: AuditLog }) {
  if (!log.staff) return <>—</>;
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{log.staff.name}</span>
      {log.staff.role && <span className="text-fg-caption">{log.staff.role}</span>}
    </div>
  );
}

function Patient({ log }: { log: AuditLog }) {
  if (!log.patient) return <>—</>;
  return (
    <PersonCell
      name={log.patient.name}
      avatarUrl={null}
      detail={`HIN ${maskHin(log.patient.hin)}`}
    />
  );
}

function When({ at, now }: { at: string; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(at), now);
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{day}</span>
      <span className="text-fg-caption">{time}</span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full type-caption text-fg-heading">{children}</dd>
    </div>
  );
}

import { CaretRightIcon, SignOutIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useClaimCheckIn, useCloseCheckIn, useEndEncounter } from "@/features/doctor/api/mutations";
import { DOCTOR_QUEUE_PAGE_SIZE, doctorQueueQuery } from "@/features/doctor/api/queries";
import {
  type DoctorQueueEntry,
  type DoctorQueueTab,
  doctorQueueTabLabels,
  triageLabels,
} from "@/features/doctor/api/schemas";
import { getErrorMessage } from "@/lib/api";
import { ageOn, formatDayAndTime, formatDuration, maskHin, minutesBetween } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const tabs = Object.keys(doctorQueueTabLabels) as DoctorQueueTab[];

const emptyIn = {
  doctor_idle: "No one is waiting for a doctor.",
  doctor_active: "No one is in consultation.",
  doctor_seen: "No one has been seen yet.",
} as const satisfies Record<DoctorQueueTab, string>;

const columnsOf = {
  doctor_idle: ["Sent by the nurse", "Waiting", "Triage"],
  doctor_active: ["Sent by the nurse", "Triage", "Doctor"],
  doctor_seen: ["Sent by the nurse", "Triage", "Doctor"],
} as const satisfies Record<DoctorQueueTab, readonly string[]>;

const triageTones = { routine: "neutral", urgent: "warning", emergency: "error" } as const;

/**
 * The doctors' queue: patients the nurses have sent on (see one to start a consultation), those
 * in consultation (end yours when you're done), and those seen (resume, or check them out). It
 * refreshes every minute.
 */
export function DoctorQueue({ myId }: { myId: string }) {
  const [tab, setTab] = useState<DoctorQueueTab>("doctor_idle");
  const [page, setPage] = useState(1);
  const [closing, setClosing] = useState<DoctorQueueEntry | null>(null);
  const { data, isError } = useQuery(doctorQueueQuery(tab, page));
  const claim = useClaimCheckIn();
  const end = useEndEncounter();
  const navigate = useNavigate();
  // When the page opened, for "Today" and ages.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];
  const columns = columnsOf[tab];
  const mine = (entry: DoctorQueueEntry) => entry.claimedBy?.id === myId;

  const empty = isError
    ? "We couldn’t load the queue. Try again in a moment."
    : data?.items.length === 0 && emptyIn[tab];

  function see(entry: DoctorQueueEntry) {
    claim.mutate(entry.id, {
      onSuccess: () =>
        void navigate({
          to: "/hospital/doctor/patients/$visitId",
          params: { visitId: entry.id },
          search: { list: "outpatient" },
        }),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function finish(entry: DoctorQueueEntry) {
    end.mutate(entry.id, {
      onSuccess: () => toast.success(`${entry.patient.name}’s consultation is ended.`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  const actions = (entry: DoctorQueueEntry): ReactNode => {
    const busy = claim.isPending || end.isPending;
    const name = entry.patient.name;
    if (tab === "doctor_idle") {
      return (
        <Button
          size="sm"
          disabled={busy}
          aria-label={`See ${name}`}
          onClick={() => see(entry)}
          className="type-caption-semibold font-sans"
        >
          See patient
        </Button>
      );
    }
    if (tab === "doctor_active") {
      if (!mine(entry)) return null;
      return (
        <div className="flex justify-end gap-2">
          <OpenButton entry={entry} />
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            aria-label={`End ${name}’s consultation`}
            onClick={() => finish(entry)}
            className="bg-card type-caption-semibold font-sans text-fg-heading"
          >
            End
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          aria-label={`Resume ${name}’s consultation`}
          onClick={() => see(entry)}
          className="bg-card type-caption-semibold font-sans text-fg-heading"
        >
          Resume
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          aria-label={`Check out ${name}`}
          onClick={() => setClosing(entry)}
          className="bg-card type-caption-semibold font-sans text-fg-heading"
        >
          Check out
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Doctor Encounter</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Patients the nurses have sent to the doctors.
        </p>
      </div>

      <section aria-label="Patients" className="@container rounded-xl border bg-card p-4">
        <Tabs
          value={tab}
          onValueChange={(next) => {
            setTab(next as DoctorQueueTab);
            setPage(1);
          }}
          className="gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            {tabs.map((value) => (
              <CountTab key={value} value={value} count={data?.counts[value]}>
                {doctorQueueTabLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @3xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Patient", className: "type-body-sm-regular" },
              ...columns.map((label) => ({ label, className: "w-[17%] type-body-sm-regular" })),
              { label: "Actions", hideLabel: true, className: "w-48" },
            ]}
            loading={!data}
            empty={empty}
          >
            {items.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Patient entry={entry} now={now} />
                </TableCell>
                {detailsOf(tab, entry, mine(entry), now).map((detail, index) => (
                  <TableCell key={columns[index]} className="whitespace-normal">
                    {detail}
                  </TableCell>
                ))}
                <TableCell className="text-right">{actions(entry)}</TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @3xl:hidden">
          {empty ? (
            <EmptyState compact description={empty} />
          ) : !data ? (
            <ListSkeleton className="py-4" />
          ) : (
            <ul aria-label="Patients">
              {items.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient entry={entry} now={now} />
                    </div>
                    {actions(entry)}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-3">
                    {detailsOf(tab, entry, mine(entry), now).map((detail, index) => (
                      <div key={columns[index]} className="flex min-w-0 flex-col items-start gap-1">
                        <dt className="type-caption text-fg-caption">{columns[index]}</dt>
                        <dd className="max-w-full type-caption text-fg-heading">{detail}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={DOCTOR_QUEUE_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      {closing && <CheckOutDialog entry={closing} onClose={() => setClosing(null)} />}
    </div>
  );
}

/** A patient's details, in the order of their tab's columns. */
function detailsOf(
  tab: DoctorQueueTab,
  entry: DoctorQueueEntry,
  mine: boolean,
  now: Date,
): ReactNode[] {
  const sent = (
    <div key="sent" className="flex flex-col">
      <When at={entry.sentAt ?? entry.checkedInAt} now={now} />
      {entry.sentBy && <span className="text-fg-caption">{entry.sentBy}</span>}
    </div>
  );
  const triage = entry.triage ? (
    <StatusPill key="triage" tone={triageTones[entry.triage]}>
      {triageLabels[entry.triage]}
    </StatusPill>
  ) : (
    "—"
  );
  if (tab === "doctor_idle") {
    const since = new Date(entry.sentAt ?? entry.checkedInAt);
    return [sent, formatDuration(minutesBetween(since, new Date())), triage];
  }
  return [sent, triage, mine ? "You" : (entry.claimedBy?.name ?? "—")];
}

function OpenButton({ entry }: { entry: DoctorQueueEntry }) {
  return (
    <Button asChild size="sm" className="gap-1 type-caption-semibold font-sans">
      <Link
        to="/hospital/doctor/patients/$visitId"
        params={{ visitId: entry.id }}
        search={{ list: "outpatient" }}
        aria-label={`Open ${entry.patient.name}`}
      >
        Open
        <CaretRightIcon data-icon="inline-end" className="size-3" />
      </Link>
    </Button>
  );
}

function CheckOutDialog({ entry, onClose }: { entry: DoctorQueueEntry; onClose: () => void }) {
  const close = useCloseCheckIn();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<SignOutIcon />}
      title="Check out"
      confirmLabel="Check out"
      pending={close.isPending}
      onClose={() => !close.isPending && onClose()}
      onConfirm={() =>
        close.mutate(entry.id, {
          onSuccess: () => {
            toast.success(`${entry.patient.name} is checked out.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Check {entry.patient.name} out? Their visit closes and leaves the queue.
      </DialogDescription>
    </ConfirmDialog>
  );
}

function Patient({ entry, now }: { entry: DoctorQueueEntry; now: Date }) {
  const { patient } = entry;
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={null}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        patient.dateOfBirth && `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
        patient.sex !== "prefer_not_to_say" && (patient.sex === "male" ? "Male" : "Female"),
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

function When({ at, now }: { at: string; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(at), now);
  return (
    <span className="text-fg-heading">
      {day}, {time}
    </span>
  );
}

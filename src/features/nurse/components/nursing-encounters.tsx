import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useReserveCheckIn } from "@/features/nurse/api/mutations";
import { QUEUE_PAGE_SIZE, nurseQueueQuery } from "@/features/nurse/api/queries";
import {
  type QueueEntry,
  type QueueTab,
  queueTabLabels,
  triageLabels,
} from "@/features/nurse/api/schemas";
import { AssessmentDialog } from "@/features/nurse/components/assessment-dialog";
import { getErrorMessage } from "@/lib/api";
import { ageOn, formatDayAndTime, formatDuration, maskHin, minutesBetween } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const tabs = Object.keys(queueTabLabels) as QueueTab[];

const emptyIn = {
  pending: "No one is waiting for a nurse.",
  sent_to_doctor: "No one has been sent to a doctor yet.",
  closed: "No visits have been closed yet.",
} as const satisfies Record<QueueTab, string>;

const columnsOf = {
  pending: ["Checked in", "Waiting", "Status"],
  sent_to_doctor: ["Sent", "Triage", "With the doctor"],
  closed: ["Closed", "Triage", "Seen by"],
} as const satisfies Record<QueueTab, readonly string[]>;

/** Where a sent-on patient is with the doctors. */
const doctorStatusLabels: Record<string, string> = {
  doctor_idle: "Waiting for a doctor",
  doctor_active: "With a doctor",
  doctor_seen: "Seen",
  closed: "Checked out",
};

const triageTones = { routine: "neutral", urgent: "warning", emergency: "error" } as const;

/** The signed-in nurse, to tell which check-ins are theirs. */
export type Me = { id: string; name: string };

const isMine = (entry: QueueEntry, me: Me) =>
  !!entry.reservedBy &&
  (entry.reservedBy.id ? entry.reservedBy.id === me.id : entry.reservedBy.name === me.name);

/**
 * The nursing encounter queue: patients checked in and waiting for a nurse (claim one, then
 * assess them), those sent on to a doctor, and visits closed. It refreshes every 30 seconds.
 */
export function NursingEncounters({ me }: { me: Me }) {
  const [tab, setTab] = useState<QueueTab>("pending");
  const [page, setPage] = useState(1);
  const [assessing, setAssessing] = useState<QueueEntry | null>(null);
  const { data, isError } = useQuery(nurseQueueQuery(tab, page));
  const reserve = useReserveCheckIn();
  // When the page opened, for "Today" and ages; waits use the time each render.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];
  const columns = columnsOf[tab];

  const empty = isError
    ? "We couldn’t load the queue. Try again in a moment."
    : data?.items.length === 0 && emptyIn[tab];

  function claim(entry: QueueEntry, reopening: boolean) {
    reserve.mutate(entry.id, {
      onSuccess: () => {
        toast.success(
          reopening
            ? `${entry.patient.name}’s visit is reopened and back in Pending.`
            : `${entry.patient.name} is yours to assess.`,
        );
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  const action = (entry: QueueEntry): ReactNode => {
    if (tab === "closed") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={reserve.isPending}
          aria-label={`Reopen ${entry.patient.name}’s visit`}
          onClick={() => claim(entry, true)}
          className="bg-card type-caption-semibold font-sans text-fg-heading"
        >
          Reopen
        </Button>
      );
    }
    if (tab !== "pending") return null;
    if (isMine(entry, me)) {
      return (
        <Button
          size="sm"
          aria-label={`Assess ${entry.patient.name}`}
          onClick={() => setAssessing(entry)}
          className="type-caption-semibold font-sans"
        >
          Assess
        </Button>
      );
    }
    if (entry.reservedBy) return null;
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={reserve.isPending}
        aria-label={`Claim ${entry.patient.name}`}
        onClick={() => claim(entry, false)}
        className="bg-card type-caption-semibold font-sans text-fg-heading"
      >
        Claim
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Nursing Encounter</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Checked-in patients waiting for a nurse. Claim one to assess them.
        </p>
      </div>

      <section aria-label="Check-ins" className="@container rounded-xl border bg-card p-4">
        <Tabs
          value={tab}
          onValueChange={(next) => {
            setTab(next as QueueTab);
            setPage(1);
          }}
          className="gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            {tabs.map((value) => (
              <CountTab key={value} value={value} count={data?.counts[value]}>
                {queueTabLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @3xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Patient", className: "type-body-sm-regular" },
              ...columns.map((label) => ({ label, className: "w-[18%] type-body-sm-regular" })),
              { label: "Actions", hideLabel: true, className: "w-28" },
            ]}
            loading={!data}
            empty={empty}
          >
            {items.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Patient entry={entry} now={now} />
                </TableCell>
                {detailsOf(tab, entry, me, now).map((detail, index) => (
                  <TableCell key={columns[index]} className="whitespace-normal">
                    {detail}
                  </TableCell>
                ))}
                <TableCell className="text-right">{action(entry)}</TableCell>
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
            <ul aria-label="Check-ins">
              {items.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient entry={entry} now={now} />
                    </div>
                    {action(entry)}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-3">
                    {detailsOf(tab, entry, me, now).map((detail, index) => (
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
            pageSize={QUEUE_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      <AssessmentDialog entry={assessing} onClose={() => setAssessing(null)} />
    </div>
  );
}

/** A check-in's details, in the order of its tab's columns. */
function detailsOf(tab: QueueTab, entry: QueueEntry, me: Me, now: Date): ReactNode[] {
  const triage = entry.triage ? (
    <StatusPill tone={triageTones[entry.triage]}>{triageLabels[entry.triage]}</StatusPill>
  ) : (
    "—"
  );
  switch (tab) {
    case "pending":
      return [
        <When key="in" at={entry.checkedInAt} now={now} />,
        formatDuration(minutesBetween(new Date(entry.checkedInAt), new Date())),
        entry.reservedBy ? (
          <StatusPill key="status" tone="info">
            {isMine(entry, me) ? "Claimed by you" : `With ${entry.reservedBy.name ?? "a nurse"}`}
          </StatusPill>
        ) : (
          <StatusPill key="status" tone="warning">
            Waiting
          </StatusPill>
        ),
      ];
    case "sent_to_doctor":
      return [
        <When key="sent" at={entry.sentToDoctorAt} now={now} />,
        triage,
        <div key="doctor" className="flex flex-col items-start gap-1">
          <StatusPill tone={entry.status === "doctor_idle" ? "warning" : "info"}>
            {doctorStatusLabels[entry.status] ?? "With the doctors"}
          </StatusPill>
          {entry.claimedBy?.name && (
            <span className="type-caption text-fg-caption">{entry.claimedBy.name}</span>
          )}
        </div>,
      ];
    case "closed":
      return [
        <When key="closed" at={entry.closedAt} now={now} />,
        triage,
        entry.reservedBy?.name ?? entry.claimedBy?.name ?? "—",
      ];
  }
}

function Patient({ entry, now }: { entry: QueueEntry; now: Date }) {
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

function When({ at, now }: { at: string | null; now: Date }) {
  if (!at) return <>—</>;
  const { day, time } = formatDayAndTime(new Date(at), now);
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{day}</span>
      <span className="text-fg-caption">{time}</span>
    </div>
  );
}

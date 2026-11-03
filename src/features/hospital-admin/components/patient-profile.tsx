import {
  AtIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarDotsIcon,
  CalendarXIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  SignInIcon,
  StethoscopeIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { patientDetailQuery } from "@/features/hospital-admin/api/queries";
import {
  coverageLabels,
  type PatientDetail,
  sexLabels,
  type VisitKind,
  visitKindLabels,
  visitTypeLabels,
} from "@/features/hospital-admin/api/schemas";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ageOn, formatDate, formatDayAndTime } from "@/lib/format";

const coverageTones = {
  hmo: "bg-success-100 text-success-500",
  nhis: "bg-info-100 text-info-500",
  private: "bg-line text-fg-body",
} as const satisfies Record<PatientDetail["coverage"], string>;

const DAY = 24 * 60 * 60 * 1000;

/** How far back the check-in history goes. */
const historyRanges = {
  anytime: { label: "All time", days: Infinity },
  week: { label: "Last 7 days", days: 7 },
  month: { label: "Last 30 days", days: 30 },
  quarter: { label: "Last 3 months", days: 91 },
};
type HistoryRange = keyof typeof historyRanges;
const historyRangeLabels = Object.fromEntries(
  Object.entries(historyRanges).map(([range, { label }]) => [range, label]),
) as Record<HistoryRange, string>;

/**
 * One patient's profile: who they are, their visits at a glance, contact details and their
 * past appointments and check-ins.
 */
export function PatientProfile({ patientId }: { patientId: string }) {
  const { data: patient } = useSuspenseQuery(patientDetailQuery(patientId));
  // When the page opened, for "Today" and the history's date range.
  const [now] = useState(() => new Date());
  const birth = new Date(patient.dateOfBirth);
  const counts = {
    appointment: patient.visits.filter(({ kind }) => kind === "appointment").length,
    check_in: patient.visits.filter(({ kind }) => kind === "check_in").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <title>{`${patient.name} · DocuHealth`}</title>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar name={patient.name} src={patient.avatarUrl} size="xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-h3">{patient.name}</h1>
              <span
                className={`rounded-[4px] px-2 py-0.5 type-body-sm-regular ${coverageTones[patient.coverage]}`}
              >
                {coverageLabels[patient.coverage]}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body-sm-regular text-fg-caption [&>span+span]:border-l [&>span+span]:border-divider [&>span+span]:pl-3">
              <span>HIN-{patient.hin}</span>
              <span>{ageOn(birth, now)} yrs</span>
              {patient.sex !== "prefer_not_to_say" && <span>{sexLabels[patient.sex]}</span>}
            </p>
          </div>
        </div>

        <Button
          className="h-12 w-full px-5 type-heading-sm sm:w-auto"
          // TODO(design): open appointment booking once it's designed.
          onClick={() => toast.info("Booking appointments isn’t built yet.")}
        >
          Book an appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={<UserIcon />}
          label="Total visits"
          value={patient.visits.length}
          note={
            patient.visits.length === 0
              ? "No visit records to display"
              : `${plural(counts.appointment, "appointment")} · ${plural(counts.check_in, "check-in")}`
          }
        />
        <DateStat
          icon={<CalendarBlankIcon />}
          label="Last Visit"
          at={patient.lastVisitAt}
          now={now}
          none="No visit records to display"
        />
        <DateStat
          icon={<ClockIcon />}
          label="Last Check-in"
          at={patient.lastCheckInAt}
          now={now}
          none="No records to display"
        />
        <DateStat
          icon={<CalendarCheckIcon />}
          label="Upcoming Appointment"
          at={patient.upcomingAppointmentAt}
          now={now}
          none="No records to display"
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard
          title="Patient Information"
          description="Personal and contact details for this patient."
        >
          <dl className="flex flex-col">
            <InfoRow icon={<CalendarBlankIcon />} label="Date of Birth">
              {formatDate(birth)} ({ageOn(birth, now)} years)
            </InfoRow>
            <InfoRow icon={<PhoneIcon />} label="Phone Number">
              {patient.phone ?? "—"}
            </InfoRow>
            <InfoRow icon={<AtIcon />} label="Email Address">
              {patient.email ?? "—"}
            </InfoRow>
            <InfoRow icon={<MapPinIcon />} label="Home Address">
              {patient.address ?? "—"}
            </InfoRow>
            <InfoRow icon={<StethoscopeIcon />} label="Assigned Doctor">
              {patient.assignedDoctor ?? "—"}
            </InfoRow>
          </dl>
        </ProfileCard>

        <CheckInHistory visits={patient.visits} counts={counts} now={now} />
      </div>
    </div>
  );
}

function plural(count: number, one: string) {
  return `${count} ${count === 1 ? one : `${one}s`}`;
}

/** A stat card for when something happened: the day, then the time (or `none`). */
function DateStat({
  icon,
  label,
  at,
  now,
  none,
}: {
  icon: ReactNode;
  label: string;
  at: string | null;
  now: Date;
  none: string;
}) {
  const when = at && formatDayAndTime(new Date(at), now);
  return (
    <StatCard
      icon={icon}
      label={label}
      value={when ? when.day : "N/A"}
      note={when ? `At ${when.time}` : none}
    />
  );
}

/** The patient's past appointments and check-ins, by kind and how far back. */
function CheckInHistory({
  visits,
  counts,
  now,
}: {
  visits: PatientDetail["visits"];
  counts: Record<VisitKind, number>;
  now: Date;
}) {
  const [kind, setKind] = useState<VisitKind | "all">("all");
  const [range, setRange] = useState<HistoryRange>("anytime");
  const since = now.getTime() - historyRanges[range].days * DAY;
  const shown = visits.filter(
    (visit) => (kind === "all" || visit.kind === kind) && new Date(visit.at).getTime() >= since,
  );

  return (
    <ProfileCard
      title="Check-in History"
      description="A record of the patient’s previous visits and check-ins."
      divider={false}
      action={
        <FilterSelect
          label="Date range"
          size="sm"
          icon={<CalendarDotsIcon className="size-4" />}
          value={range}
          options={historyRangeLabels}
          display={(chosen) => (chosen === "anytime" ? "Date Range" : historyRangeLabels[chosen])}
          onChange={setRange}
        />
      }
    >
      <Tabs value={kind} onValueChange={(next) => setKind(next as VisitKind | "all")}>
        <CountTabsList>
          <CountTab value="all" count={visits.length} className="pt-1 pb-3">
            All Visits
          </CountTab>
          {(Object.keys(visitKindLabels) as VisitKind[]).map((value) => (
            <CountTab key={value} value={value} count={counts[value]} className="pt-1 pb-3">
              {visitKindLabels[value]}
            </CountTab>
          ))}
        </CountTabsList>
      </Tabs>

      {shown.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center">
          <span className="mb-3 grid size-12 place-content-center rounded-full bg-line text-fg-caption">
            <CalendarXIcon className="size-6" />
          </span>
          <p className="type-h5">{visits.length === 0 ? "No visits yet" : "No visits found"}</p>
          <p className="type-body-sm-regular text-fg-caption">
            {visits.length === 0
              ? "No visit records to display"
              : "None match this tab and date range."}
          </p>
        </div>
      ) : (
        // TODO(design): only the empty history is designed; this list is a stand-in.
        <ul aria-label="Visits" className="flex flex-col divide-y">
          {shown.map((visit) => {
            const { day, time } = formatDayAndTime(new Date(visit.at), now);
            const Icon = visit.kind === "appointment" ? CalendarCheckIcon : SignInIcon;
            return (
              <li key={visit.id} className="flex items-center gap-3 py-3.5">
                <span className="grid size-8 shrink-0 place-content-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="type-body-sm-medium text-fg-heading">
                    {visitKindLabels[visit.kind]} · {visitTypeLabels[visit.visitType]}
                  </span>
                  <span className="truncate type-body-sm-regular text-fg-caption">
                    {visit.seenBy ?? "No doctor recorded"}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col text-right type-body-sm-regular">
                  <span className="text-fg-heading">{day}</span>
                  <span className="text-fg-caption">{time}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ProfileCard>
  );
}

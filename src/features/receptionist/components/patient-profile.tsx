import {
  AtIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarDotsIcon,
  CalendarXIcon,
  CaretRightIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  StethoscopeIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { patientProfileQuery } from "@/features/receptionist/api/queries";
import {
  coverageLabels,
  type LinkedPerson,
  type PatientProfile as Profile,
  sexLabels,
  type VisitKind,
  visitKindLabels,
  visitStatusLabels,
} from "@/features/receptionist/api/schemas";
import { BookAppointmentDialog } from "@/features/receptionist/components/book-appointment-dialog";
import {
  ageOn,
  formatDate,
  formatDateWithComma,
  formatDayAndTime,
  formatDayMonthTime,
} from "@/lib/format";

const coverageTones = {
  hmo: "bg-success-100 text-success-500",
  nhis: "bg-info-100 text-info-500",
  private: "bg-line text-fg-body",
} as const satisfies Record<Profile["coverage"], string>;

const DAY = 24 * 60 * 60 * 1000;
/** How far back "Total visits" counts. */
const RECENT_DAYS = 182;

/** How many visits the history shows at a time. */
const VISITS_PAGE_SIZE = 7;

/** How far back the visit history goes. */
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
 * A patient's profile at the front desk: who they are, their visits at a glance, contact
 * details, the people linked to their account and their visit history.
 */
export function PatientProfile({ patientId }: { patientId: string }) {
  const { data: patient } = useSuspenseQuery(patientProfileQuery(patientId));
  // When the page opened, for "Today" and the history's date range.
  const [now] = useState(() => new Date());
  const [booking, setBooking] = useState(false);
  const birth = new Date(patient.dateOfBirth);
  const isDependent = patient.proxies.length > 0;
  const recentVisits = patient.visits.filter(
    ({ checkedInAt }) => now.getTime() - new Date(checkedInAt).getTime() <= RECENT_DAYS * DAY,
  ).length;
  const lastVisit = patient.lastVisit && formatDayAndTime(new Date(patient.lastVisit.at), now);
  const lastCheckIn = patient.lastCheckIn && new Date(patient.lastCheckIn.at);
  const upcoming = patient.upcomingAppointment && new Date(patient.upcomingAppointment.at);

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
              {isDependent && (
                <span className="rounded-[4px] bg-warning-100 px-2 py-0.5 type-body-sm-regular text-warning-700">
                  Dependent
                </span>
              )}
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
          onClick={() => setBooking(true)}
        >
          Book an appointment
        </Button>
        <BookAppointmentDialog patient={patient} open={booking} onOpenChange={setBooking} />
      </div>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={<UserIcon />}
          label="Total visits"
          value={recentVisits}
          note="Visits in the last 6 months"
        />
        <StatCard
          icon={<CalendarBlankIcon />}
          label="Last Visit"
          value={lastVisit ? lastVisit.time : "N/A"}
          note={
            lastVisit && patient.lastVisit
              ? `${lastVisit.day} · ${patient.lastVisit.department}`
              : "No visit records to display"
          }
        />
        <StatCard
          icon={<ClockIcon />}
          label="Last Check-in"
          value={lastCheckIn ? formatDayMonthTime(lastCheckIn) : "N/A"}
          note={
            lastCheckIn && patient.lastCheckIn
              ? `${formatDayAndTime(lastCheckIn, now).day} · ${visitStatusLabels[patient.lastCheckIn.status]}`
              : "No records to display"
          }
        />
        <StatCard
          icon={<CalendarCheckIcon />}
          label="Upcoming Appointment"
          value={
            upcoming ? `${formatDate(upcoming)} · ${formatDayAndTime(upcoming, now).time}` : "N/A"
          }
          note={
            patient.upcomingAppointment
              ? `${patient.upcomingAppointment.department} Department`
              : "No records to display"
          }
        />
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
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

          {isDependent ? (
            <LinkedAccounts
              title="Proxy Account"
              description="A record of the proxy(s) managing this account"
              people={patient.proxies}
              second={{ label: "Relationship", value: (person) => person.relationship ?? "—" }}
            />
          ) : (
            <LinkedAccounts
              title="Dependent Account"
              description="A record of the dependent(s) linked to this account"
              people={patient.dependents}
              second={{
                label: "DOB",
                value: (person) => formatDateWithComma(new Date(person.dateOfBirth)),
              }}
              empty="No dependents are linked to this account."
            />
          )}
        </div>

        <VisitHistory visits={patient.visits} now={now} />
      </div>
    </div>
  );
}

/** Dependents or proxies: who they are, one detail about them, and a link to their profile. */
function LinkedAccounts({
  title,
  description,
  people,
  second,
  empty,
}: {
  title: string;
  description: string;
  people: LinkedPerson[];
  /** The column after Name. */
  second: { label: string; value: (person: LinkedPerson) => string };
  empty?: string;
}) {
  const lastVisit = (person: LinkedPerson) =>
    person.lastVisitAt ? formatDateWithComma(new Date(person.lastVisitAt)) : "-";

  return (
    <ProfileCard title={title} description={description} className="@container">
      {people.length === 0 && empty ? (
        <p className="py-6 text-center type-body-sm-regular text-fg-caption">{empty}</p>
      ) : (
        <>
          <div className="hidden @md:block">
            <DashboardTable
              className="mt-0 type-body-sm-regular"
              columns={[
                { label: "Name", className: "type-body-sm-regular" },
                { label: second.label, className: "w-28 type-body-sm-regular" },
                { label: "Gender", className: "w-16 type-body-sm-regular" },
                { label: "Last Visit", className: "w-28 type-body-sm-regular" },
                { label: "View", hideLabel: true, className: "w-10" },
              ]}
            >
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <PersonCell name={person.name} avatarUrl={person.avatarUrl} detail={null} />
                  </TableCell>
                  <TableCell>{second.value(person)}</TableCell>
                  <TableCell>{sexLabels[person.sex]}</TableCell>
                  <TableCell>{lastVisit(person)}</TableCell>
                  <TableCell>
                    <ViewLink person={person} />
                  </TableCell>
                </TableRow>
              ))}
            </DashboardTable>
          </div>

          {/* Narrow cards stack each person's details under their name instead. */}
          <ul aria-label={title} className="border-t @md:hidden">
            {people.map((person) => (
              <li key={person.id} className="flex flex-col gap-3 border-b py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 type-body-sm-regular">
                    <PersonCell name={person.name} avatarUrl={person.avatarUrl} detail={null} />
                  </div>
                  <ViewLink person={person} />
                </div>
                <DetailGrid
                  details={[
                    [second.label, second.value(person)],
                    ["Gender", sexLabels[person.sex]],
                    ["Last Visit", lastVisit(person)],
                  ]}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </ProfileCard>
  );
}

function ViewLink({ person }: { person: LinkedPerson }) {
  return (
    <Link
      to="/hospital/receptionist/patients/$patientId"
      params={{ patientId: person.id }}
      aria-label={`View ${person.name}`}
      className="grid size-8 shrink-0 place-content-center rounded-md text-fg-caption hover:bg-muted hover:text-fg-heading"
    >
      <CaretRightIcon className="size-4" />
    </Link>
  );
}

/** Labelled details in three columns, for a row of a narrow card's list. */
function DetailGrid({ details }: { details: [label: string, value: string][] }) {
  return (
    <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
      {details.map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-col gap-1">
          <dt className="type-caption text-fg-caption">{label}</dt>
          <dd className="type-caption text-fg-heading">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The patient's past appointments and check-ins, by kind and how far back. */
function VisitHistory({ visits, now }: { visits: Profile["visits"]; now: Date }) {
  const [kind, setKind] = useState<VisitKind | "all">("all");
  const [range, setRange] = useState<HistoryRange>("anytime");
  const since = now.getTime() - historyRanges[range].days * DAY;
  const [page, setPage] = useState(1);
  const matching = visits.filter(
    (visit) =>
      (kind === "all" || visit.kind === kind) && new Date(visit.checkedInAt).getTime() >= since,
  );
  const shown = matching.slice((page - 1) * VISITS_PAGE_SIZE, page * VISITS_PAGE_SIZE);
  const count = (of: VisitKind) => visits.filter((visit) => visit.kind === of).length;

  return (
    <ProfileCard
      title="Visit History"
      description="A record of the patient’s previous visits and check-ins."
      divider={false}
      className="@container"
      action={
        <FilterSelect
          label="Date range"
          size="sm"
          icon={<CalendarDotsIcon className="size-4" />}
          value={range}
          options={historyRangeLabels}
          display={(chosen) => (chosen === "anytime" ? "Date Range" : historyRangeLabels[chosen])}
          onChange={(next) => {
            setRange(next);
            setPage(1);
          }}
        />
      }
    >
      <Tabs
        value={kind}
        onValueChange={(next) => {
          setKind(next as VisitKind | "all");
          setPage(1);
        }}
      >
        <CountTabsList>
          <CountTab value="all" count={visits.length} className="pt-1 pb-3">
            All Visits
          </CountTab>
          {(Object.keys(visitKindLabels) as VisitKind[]).map((value) => (
            <CountTab key={value} value={value} count={count(value)} className="pt-1 pb-3">
              {visitKindLabels[value]}s
            </CountTab>
          ))}
        </CountTabsList>
      </Tabs>

      {matching.length === 0 ? (
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
        <>
          <div className="hidden @md:block">
            <DashboardTable
              className="mt-0 type-body-sm-regular"
              columns={[
                { label: "Date", className: "type-body-sm-regular" },
                { label: "Check-in", className: "w-20 type-body-sm-regular" },
                { label: "Check-Out", className: "w-20 type-body-sm-regular" },
                { label: "Visit Type", className: "w-28 type-body-sm-regular" },
                { label: "Status", className: "w-28 type-body-sm-regular" },
              ]}
            >
              {shown.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{formatDateWithComma(new Date(visit.checkedInAt))}</TableCell>
                  <TableCell>{timeOf(visit.checkedInAt)}</TableCell>
                  <TableCell>{timeOf(visit.checkedOutAt)}</TableCell>
                  <TableCell>{visitKindLabels[visit.kind]}</TableCell>
                  <TableCell>
                    <VisitStatus status={visit.status} />
                  </TableCell>
                </TableRow>
              ))}
            </DashboardTable>
          </div>

          {/* Narrow cards stack each visit's details under its date instead. */}
          <ul aria-label="Visits" className="border-t @md:hidden">
            {shown.map((visit) => (
              <li key={visit.id} className="flex flex-col gap-3 border-b py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="type-body-sm-medium text-fg-heading">
                    {formatDateWithComma(new Date(visit.checkedInAt))}
                  </span>
                  <VisitStatus status={visit.status} />
                </div>
                <DetailGrid
                  details={[
                    ["Check-in", timeOf(visit.checkedInAt)],
                    ["Check-Out", timeOf(visit.checkedOutAt)],
                    ["Visit Type", visitKindLabels[visit.kind]],
                  ]}
                />
              </li>
            ))}
          </ul>

          {matching.length > VISITS_PAGE_SIZE && (
            <TablePagination
              page={page}
              pageSize={VISITS_PAGE_SIZE}
              total={matching.length}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </ProfileCard>
  );
}

/** e.g. "9:42 AM", or "-" when it hasn't happened. */
function timeOf(at: string | null) {
  return at ? formatDayAndTime(new Date(at)).time : "-";
}

function VisitStatus({ status }: { status: Profile["visits"][number]["status"] }) {
  return (
    <StatusPill tone={status === "checked_in" ? "success" : "neutral"}>
      {visitStatusLabels[status]}
    </StatusPill>
  );
}

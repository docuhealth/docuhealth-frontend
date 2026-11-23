import { ArrowsLeftRightIcon, BedIcon, CalendarBlankIcon, UsersIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Trend } from "@/components/dashboard/trend";
import { Button } from "@/components/ui/button";
import {
  type MonthCount,
  type Total,
  doctorOverviewQuery,
  waitingCountQuery,
} from "@/features/doctor/api/overview";
import { greetingFor } from "@/lib/format";

const number = (value: number | undefined) =>
  value === undefined ? "…" : value.toLocaleString("en-GB");

/** The change on the period before, when the API says. TODO(api): which period isn't documented. */
function Change({ total }: { total: Total | undefined }) {
  if (!total) return " ";
  if (total.change === null) return "This period";
  return <Trend change={total.change} since="the period before" />;
}

/**
 * The doctor's home page: patients waiting, appointments, referrals and admissions, and the
 * admissions and discharges by month.
 */
export function DoctorOverview({
  firstName,
  bannerUrl,
}: {
  firstName: string;
  bannerUrl: string | null;
}) {
  const { data, isError } = useQuery(doctorOverviewQuery());
  const { data: waiting } = useQuery(waitingCountQuery());
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">
            {greetingFor(now)}, {firstName}!
          </h1>
          <p className="type-body-sm-regular text-fg-caption">
            Patients waiting for you, and how your work is going.
          </p>
        </div>
        <Button asChild className="h-12 w-full px-5 type-heading-sm sm:w-auto">
          <Link to="/hospital/doctor/encounters">See waiting patients</Link>
        </Button>
      </div>

      <StatBanner imageUrl={bannerUrl}>
        <StatCard
          icon={<UsersIcon />}
          label="Waiting patients"
          value={number(waiting)}
          note="Sent to the doctors"
        />
        <StatCard
          icon={<CalendarBlankIcon />}
          label="Appointments"
          value={number(data?.appointments.value)}
          note={<Change total={data?.appointments} />}
        />
        <StatCard
          icon={<ArrowsLeftRightIcon />}
          label="Referrals"
          value={number(data?.referrals.value)}
          note={<Change total={data?.referrals} />}
        />
        <StatCard
          icon={<BedIcon />}
          label="Admissions"
          value={number(data?.admissions.value)}
          note={<Change total={data?.admissions} />}
        />
      </StatBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthsCard
          title="Admissions"
          months={data?.admissionsByMonth}
          isError={isError}
          describe={(count) => `${count} ${count === 1 ? "admission" : "admissions"}`}
        />
        <MonthsCard
          title="Discharged patients"
          months={data?.dischargedByMonth}
          isError={isError}
          describe={(count) => `${count} discharged`}
        />
      </div>
    </div>
  );
}

function MonthsCard({
  title,
  months,
  isError,
  describe,
}: {
  title: string;
  months: MonthCount[] | undefined;
  isError: boolean;
  describe: (count: number) => string;
}) {
  const total = months?.reduce((sum, { value }) => sum + value, 0);
  return (
    <DashboardCard title={title}>
      <p className="mt-1 type-body-sm-regular text-fg-caption">
        {total === undefined ? " " : `${total.toLocaleString("en-GB")} this year`}
      </p>
      {isError ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">
          We couldn’t load the chart. Try again in a moment.
        </p>
      ) : !months ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">Loading…</p>
      ) : (
        <BarChart
          bars={months.map(({ label, value }) => ({ key: label, label, longLabel: label, value }))}
          describe={describe}
          caption={`${title} by month`}
          columns={["Month", title]}
        />
      )}
    </DashboardCard>
  );
}

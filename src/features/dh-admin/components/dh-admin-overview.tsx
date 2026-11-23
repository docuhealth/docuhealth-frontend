import {
  BuildingsIcon,
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Bar, BarChart } from "@/components/dashboard/bar-chart";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { adminOverviewQuery, type Trend, trendQuery } from "@/features/dh-admin/api/queries";
import {
  type TrendPeriod,
  type TrendPoint,
  trendPeriodLabels,
} from "@/features/dh-admin/api/schemas";

const DAY = 24 * 60 * 60_000;
const naira = (amount: number) => `₦${amount.toLocaleString("en-GB")}`;
const number = (value: number | undefined) =>
  value === undefined ? "…" : value.toLocaleString("en-GB");

/** A bucket's key as the API writes it: "2026-06", "2026" or "2026-06-01" (UTC). */
function keyOf(date: Date, period: TrendPeriod) {
  const iso = date.toISOString();
  return period === "monthly"
    ? iso.slice(0, 7)
    : period === "yearly"
      ? iso.slice(0, 4)
      : iso.slice(0, 10);
}

/**
 * The bars a trend shows: the API sends only buckets with something in them, so the last 12
 * months (or 14 days) fill in at zero; years show as sent.
 */
function barsFor(points: TrendPoint[], period: TrendPeriod, now: Date): Bar[] {
  const values = new Map(points.map(({ key, value }) => [key, value]));
  const dates =
    period === "yearly"
      ? points.map(({ key }) => new Date(Date.UTC(Number(key), 0, 1)))
      : Array.from({ length: period === "daily" ? 14 : 12 }, (_, index) => {
          const back = (period === "daily" ? 13 : 11) - index;
          return period === "daily"
            ? new Date(now.getTime() - back * DAY)
            : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
        });
  return dates.map((date) => {
    const key = keyOf(date, period);
    const options: Intl.DateTimeFormatOptions =
      period === "yearly"
        ? { year: "numeric", timeZone: "UTC" }
        : period === "monthly"
          ? { month: "short", timeZone: "UTC" }
          : { day: "numeric", month: "short", timeZone: "UTC" };
    const long: Intl.DateTimeFormatOptions =
      period === "monthly"
        ? { month: "long", year: "numeric", timeZone: "UTC" }
        : { ...options, ...(period === "daily" && { weekday: "short", month: "long" }) };
    return {
      key,
      label: date.toLocaleDateString("en-GB", options),
      longLabel: date.toLocaleDateString("en-GB", long),
      value: values.get(key) ?? 0,
    };
  });
}

/**
 * DocuHealth's own overview: users, hospitals, individuals, subscriptions and revenue; who
 * registered and subscribed, and what came in, over time; where users are, and who has
 * dependants.
 */
export function DhAdminOverview() {
  const { data, isError } = useQuery(adminOverviewQuery());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Overview</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Who uses DocuHealth, who pays for it, and how that’s changing.
        </p>
      </div>

      {isError ? (
        <p className="rounded-xl border bg-card py-10 text-center type-body-sm-regular text-fg-caption">
          We couldn’t load the overview. Try again in a moment.
        </p>
      ) : (
        <StatGrid className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            icon={<UsersThreeIcon />}
            label="Users"
            value={number(data?.users)}
            note="Active hospitals and individuals"
          />
          <StatCard
            icon={<BuildingsIcon />}
            label="Hospitals"
            value={number(data?.hospitals)}
            note="Registered"
          />
          <StatCard
            icon={<UserIcon />}
            label="Individuals"
            value={number(data?.individuals)}
            note="Registered patients"
          />
          <StatCard
            icon={<CreditCardIcon />}
            label="Subscribed"
            value={number(data?.subscribed)}
            note="With an active plan"
          />
          <StatCard
            icon={<CurrencyCircleDollarIcon />}
            label="Revenue"
            value={data ? naira(data.revenue) : "…"}
            note="All successful payments"
          />
        </StatGrid>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard
          trend="users"
          title="Registered users"
          describe={(count) => `${count} registered`}
        />
        <TrendCard
          trend="subscriptions"
          title="Subscriptions"
          describe={(count) => `${count} subscribed`}
        />
        <TrendCard trend="revenue" title="Revenue" describe={naira} />
        <DashboardCard title="Where users are">
          {!data ? (
            <p className="py-16 text-center type-body-sm-regular text-fg-caption">
              {isError ? "We couldn’t load this." : "Loading…"}
            </p>
          ) : (
            <Shares
              label="Users by state"
              rows={data.states.slice(0, 8).map(({ state, value }) => ({ label: state, value }))}
              empty="No users have a state yet."
            />
          )}
          {data && data.subAccounts.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="type-body-sm-medium text-fg-heading">Individuals with dependants</h3>
              <Shares
                label="Individuals with and without dependants"
                rows={data.subAccounts}
                empty=""
              />
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function TrendCard({
  trend,
  title,
  describe,
}: {
  trend: Trend;
  title: string;
  describe: (value: number) => string;
}) {
  const [period, setPeriod] = useState<TrendPeriod>("monthly");
  const { data, isError } = useQuery(trendQuery(trend, period));
  // When the page opened, for the last 12 months and 14 days.
  const [now] = useState(() => new Date());
  const bars = data ? barsFor(data, period, now) : [];
  const total = bars.reduce((sum, { value }) => sum + value, 0);

  return (
    <DashboardCard
      title={title}
      action={
        <FilterSelect
          label={`${title} period`}
          size="sm"
          value={period}
          options={trendPeriodLabels}
          onChange={setPeriod}
        />
      }
    >
      <p className="mt-1 type-body-sm-regular text-fg-caption">
        {data ? `${describe(total)} in this view` : " "}
      </p>
      {isError ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">
          We couldn’t load this. Try again in a moment.
        </p>
      ) : !data ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">Loading…</p>
      ) : bars.length === 0 ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">Nothing yet.</p>
      ) : (
        <BarChart
          key={period}
          bars={bars}
          describe={describe}
          caption={`${title}, ${trendPeriodLabels[period].toLowerCase()}`}
          columns={["Period", title]}
        />
      )}
    </DashboardCard>
  );
}

/** Rows of label, count and a bar of its share of the largest. */
function Shares({
  label,
  rows,
  empty,
}: {
  label: string;
  rows: { label: string; value: number }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center type-body-sm-regular text-fg-caption">{empty}</p>;
  }
  const max = Math.max(1, ...rows.map(({ value }) => value));
  return (
    <dl aria-label={label} className="mt-4 flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-3">
            <dt className="type-body-sm-regular text-fg-body">{row.label}</dt>
            <dd className="type-body-sm-medium text-fg-heading">
              {row.value.toLocaleString("en-GB")}
            </dd>
          </div>
          <div aria-hidden className="h-2 rounded-full bg-line">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}

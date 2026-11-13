import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowsClockwiseIcon,
  CalendarCheckIcon,
  PlusIcon,
  UserIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  patientFilterOptionsQuery,
  patientListQuery,
  patientStatsQuery,
} from "@/features/hospital-admin/api/queries";
import {
  type PatientTab,
  patientSortLabels,
  patientTabLabels,
  visitDateLabels,
  visitTypeLabels,
} from "@/features/hospital-admin/api/schemas";
import { type Period } from "@/lib/period";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { PatientList } from "@/features/hospital-admin/components/patient-list";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { SearchField } from "@/components/dashboard/search-field";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { formatLongDate } from "@/lib/format";
import {
  defaultPatientFilters,
  type PatientFilters,
  patientListParams,
  tabFilters,
} from "@/features/hospital-admin/lib/patient-filters";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

const tabs = Object.keys(patientTabLabels) as PatientTab[];

/**
 * The Patient Management page: check-in numbers for the period, then the hospital's patients
 * by stage of their visit (admitted, checked in, checked out, discharged), searchable and
 * filterable.
 */
export function PatientManagement({
  period,
  onPeriodChange,
  tab,
  onTabChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
  tab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
}) {
  // When the page opened; the date doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());
  const { data: stats } = useSuspenseQuery(patientStatsQuery(period));
  const { data: options } = useQuery(patientFilterOptionsQuery());

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PatientFilters>(defaultPatientFilters);
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim());
  const params = patientListParams(tab, { search: term, page, filters });
  const filtered =
    !!term ||
    params.ward !== "all" ||
    params.doctor !== "all" ||
    params.visitType !== "all" ||
    params.date !== "anytime";
  // Shares PatientList's query, for the tabs' counts.
  const { data } = useQuery(patientListQuery(params));
  const shown = tabFilters[tab];

  function filter<K extends keyof PatientFilters>(key: K, value: PatientFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Patient Management</h1>
          <p className="type-body-sm-regular text-fg-caption">{formatLongDate(now)}</p>
        </div>

        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <Button
            className="h-12 gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4"
            // TODO(design): open patient registration once it's designed.
            onClick={() => toast.info("Registering patients isn’t built yet.")}
          >
            <PlusIcon data-icon="inline-start" />
            Register Patient
          </Button>
        </div>
      </div>

      <StatGrid className="grid-cols-1 sm:grid-cols-2">
        <StatCard
          icon={<UserIcon />}
          label="Total check-in"
          value={stats.totalCheckIns.toLocaleString("en-GB")}
          note="All patients on record"
        />
        <StatCard
          icon={<UserPlusIcon />}
          label="New check-ins"
          value={stats.newCheckIns.toLocaleString("en-GB")}
          note={<Change by={stats.newCheckInsChange} since="last week" />}
        />
        <StatCard
          icon={<CalendarCheckIcon />}
          label="Check-ins this month"
          value={stats.checkInsThisMonth.toLocaleString("en-GB")}
          note={<Change by={stats.checkInsThisMonthChange} since="yesterday" />}
        />
        <StatCard
          icon={<ArrowsClockwiseIcon />}
          label="Returning Patients"
          value={stats.returningPatients.toLocaleString("en-GB")}
          note="Visited before today"
        />
      </StatGrid>

      <section aria-label="Patients" className="@container rounded-xl border bg-card">
        <Tabs
          value={tab}
          onValueChange={(next) => {
            // Each tab has its own filters; the search carries over.
            setFilters(defaultPatientFilters);
            setPage(1);
            onTabChange(next as PatientTab);
          }}
          className="gap-0"
        >
          <CountTabsList className="px-4">
            {tabs.map((value) => (
              <CountTab key={value} value={value} count={data?.counts[value]}>
                {patientTabLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>

          {tabs.map((value) => (
            <TabsContent key={value} value={value} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SearchField
                  size="lg"
                  label="Search patients"
                  placeholder="Search names, HIN, email..."
                  value={search}
                  onChange={(next) => {
                    setSearch(next);
                    setPage(1);
                  }}
                  className="@3xl:w-80"
                />
                <div className="flex w-full flex-wrap gap-4 *:flex-1 @3xl:w-auto @3xl:*:flex-none">
                  {shown.ward && (
                    <FilterSelect
                      label="Ward"
                      value={filters.ward}
                      options={{
                        all: "All Wards",
                        ...Object.fromEntries(options?.wards.map((w) => [w.id, w.name]) ?? []),
                      }}
                      onChange={(ward) => filter("ward", ward)}
                    />
                  )}
                  {shown.visitType && (
                    <FilterSelect
                      label="Visit type"
                      value={filters.visitType}
                      options={{ all: "All visit types", ...visitTypeLabels }}
                      display={(type) => (type === "all" ? "Visit Type" : visitTypeLabels[type])}
                      onChange={(visitType) => filter("visitType", visitType)}
                    />
                  )}
                  {shown.date && (
                    <FilterSelect
                      label={`${shown.date} date`}
                      value={filters.date}
                      options={visitDateLabels}
                      display={(date) => `${shown.date}: ${visitDateLabels[date]}`}
                      onChange={(date) => filter("date", date)}
                      // Wide enough for "Discharged: This Month", on a row of its own if need be.
                      className="min-w-52"
                    />
                  )}
                  <FilterSelect
                    label="Doctor"
                    value={filters.doctor}
                    options={{
                      all: "All doctors",
                      ...Object.fromEntries(options?.doctors.map((d) => [d.id, d.name]) ?? []),
                    }}
                    onChange={(doctor) => filter("doctor", doctor)}
                  />
                  <FilterSelect
                    label="Sort"
                    value={filters.sort}
                    options={patientSortLabels}
                    display={(sort) => `Sort: ${patientSortLabels[sort]}`}
                    onChange={(sort) => filter("sort", sort)}
                    highlight
                  />
                </div>
              </div>

              <PatientList params={params} filtered={filtered} onPageChange={setPage} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}

/** "+12 vs last week" in green with an up arrow, or the drop in red with a down arrow. */
function Change({ by, since }: { by: number; since: string }) {
  const Arrow = by >= 0 ? ArrowCircleUpIcon : ArrowCircleDownIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        by >= 0 ? "text-success-500" : "text-error-500",
      )}
    >
      <Arrow weight="fill" className="size-4" />
      {by >= 0 ? `+${by}` : `−${-by}`} vs {since}
    </span>
  );
}

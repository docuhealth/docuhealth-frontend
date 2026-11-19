import { ArrowCounterClockwiseIcon, TestTubeIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { CheckmarkCircleIcon, ClockFadingIcon } from "@/components/hugeicons";
import { labOverviewQuery, labProfileQuery } from "@/features/lab-scientist/api/queries";
import { AwaitingApprovalCard } from "@/features/lab-scientist/components/awaiting-approval-card";
import { TestAppointmentsCard } from "@/features/lab-scientist/components/test-appointments-card";
import { TestOrderActions } from "@/features/lab-scientist/components/test-order-actions";
import { greetingName } from "@/features/lab-scientist/lib/names";
import { greetingFor } from "@/lib/format";
import type { Period } from "@/lib/period";

/** The stat cards' notes say which period their numbers cover. */
const inPeriod = { today: "today", week: "this week", month: "this month" } as const;

/** The lab scientist's home page: the period's numbers, upcoming tests and results to approve. */
export function LabDashboard({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const { data: profile } = useSuspenseQuery(labProfileQuery());
  const { data: overview } = useSuspenseQuery(labOverviewQuery(period));
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());
  const span = inPeriod[period];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">
            {greetingFor(now)}, {greetingName(profile.user)}!
          </h1>
          <p className="type-body-sm-regular text-fg-caption">
            A summary of your tests, pending approvals, and updates.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <TestOrderActions />
        </div>
      </div>

      {/* Changing the photo is the admin's job, so there's no edit button here. */}
      <StatBanner imageUrl={profile.hospital.bannerUrl}>
        <StatCard
          icon={<TestTubeIcon />}
          label="Total Lab Tests"
          value={overview.totalTests.toLocaleString("en-GB")}
          note={`All lab tests ${span}`}
        />
        <StatCard
          icon={<ClockFadingIcon />}
          label="Pending Tests"
          value={overview.pendingTests.toLocaleString("en-GB")}
          note="Awaiting processing"
        />
        <StatCard
          icon={<CheckmarkCircleIcon />}
          label="Approved Results"
          value={overview.approvedResults.toLocaleString("en-GB")}
          note={capitalize(span)}
        />
        <StatCard
          icon={<ArrowCounterClockwiseIcon />}
          label="Returning Patients"
          value={overview.returningPatients.toLocaleString("en-GB")}
          note="Visited before today"
        />
      </StatBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <TestAppointmentsCard />
        <AwaitingApprovalCard />
      </div>
    </div>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

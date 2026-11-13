import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  radiologistProfileQuery,
  radiologyOverviewQuery,
} from "@/features/radiologist/api/queries";
import {
  CheckmarkCircleIcon,
  ClockFadingIcon,
  ClockIcon,
  XRayIcon,
} from "@/features/radiologist/components/icons";
import { RecentUploadsCard } from "@/features/radiologist/components/recent-uploads-card";
import { ScanOrderActions } from "@/features/radiologist/components/scan-order-actions";
import { ScanRecords } from "@/features/radiologist/components/scan-records";
import { ScanScheduleCard } from "@/features/radiologist/components/scan-schedule-card";
import { greetingName } from "@/features/radiologist/lib/names";
import { greetingFor } from "@/lib/format";
import type { Period } from "@/lib/period";

/** The stat cards' notes say which period their numbers cover. */
const inPeriod = { today: "today", week: "this week", month: "this month" } as const;

/** The radiologist's home page: the period's numbers, the scan schedule, uploads and orders. */
export function RadiologistDashboard({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const { data: profile } = useSuspenseQuery(radiologistProfileQuery());
  const { data: overview } = useSuspenseQuery(radiologyOverviewQuery(period));
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
            Your scan orders, pending reviews, and recent results.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <ScanOrderActions />
        </div>
      </div>

      {/* Changing the photo is the admin's job, so there's no edit button here. */}
      <StatBanner imageUrl={profile.hospital.bannerUrl}>
        <StatCard
          icon={<XRayIcon />}
          label="Imaging Requests"
          value={overview.imagingRequests.toLocaleString("en-GB")}
          note={`All requests ${span}`}
        />
        <StatCard
          icon={<ClockFadingIcon />}
          label="Pending Orders"
          value={overview.pendingOrders.toLocaleString("en-GB")}
          note="Currently being handled"
        />
        <StatCard
          icon={<CheckmarkCircleIcon />}
          label="Completed Scan"
          value={overview.completedScans.toLocaleString("en-GB")}
          note={capitalize(span)}
        />
        <StatCard
          icon={<ClockIcon />}
          label="Scans In Progress"
          value={overview.scansInProgress.toLocaleString("en-GB")}
          note={capitalize(span)}
        />
      </StatBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <ScanScheduleCard />
        <RecentUploadsCard />
      </div>

      <ScanRecords title="Scan Records" />
    </div>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

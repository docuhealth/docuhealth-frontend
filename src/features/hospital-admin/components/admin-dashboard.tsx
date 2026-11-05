import { useSuspenseQuery } from "@tanstack/react-query";
import {
  dashboardOverviewQuery,
  hospitalProfileQuery,
} from "@/features/hospital-admin/api/queries";
import type { Period } from "@/lib/period";
import { DashboardHeader } from "@/features/hospital-admin/components/dashboard-header";
import { OverviewBanner } from "@/features/hospital-admin/components/overview-banner";
import { QueueCard } from "@/features/hospital-admin/components/queue-card";
import { StaffByRoleCard } from "@/features/hospital-admin/components/staff-by-role-card";
import { StaffCard } from "@/features/hospital-admin/components/staff-card";

/** The hospital admin's home page. */
export function AdminDashboard({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const { data: profile } = useSuspenseQuery(hospitalProfileQuery());
  const { data: overview } = useSuspenseQuery(dashboardOverviewQuery(period));
  const { title, firstName, lastName } = profile.admin;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={title ? `${title} ${lastName}` : firstName}
        period={period}
        onPeriodChange={onPeriodChange}
      />
      <OverviewBanner stats={overview.stats} bannerUrl={profile.bannerUrl} />
      <div className="grid gap-6 xl:grid-cols-2">
        <StaffByRoleCard roles={overview.staffByRole} />
        <QueueCard />
      </div>
      <StaffCard />
    </div>
  );
}

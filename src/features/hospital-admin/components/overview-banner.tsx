import { BuildingsIcon, ShieldCheckIcon, UserPlusIcon, UsersIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { DashboardOverview } from "@/features/hospital-admin/api/schemas";
import { BannerPhotoMenu } from "@/features/hospital-admin/components/banner-photo-menu";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { Figure } from "@/components/dashboard/figure";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  previousPeriodLabels,
  thisPeriodLabels,
} from "@/features/hospital-admin/lib/period-labels";
import type { Period } from "@/lib/period";

/**
 * The hospital's banner photo (the default one until the admin uploads their own) with the
 * headline staff and facility numbers over it; staff added are counted over `period`.
 */
export function OverviewBanner({
  stats,
  period,
  bannerUrl,
}: {
  stats: DashboardOverview["stats"];
  period: Period;
  bannerUrl: string | null;
}) {
  const change = stats.addedChange;

  const cards: { icon: ReactNode; label: string; value: number | null; note: ReactNode }[] = [
    {
      icon: <UsersIcon />,
      label: "Total Staff",
      value: stats.totalStaff,
      note: "All staff added",
    },
    {
      icon: <UserPlusIcon />,
      label: `Added ${thisPeriodLabels[period]}`,
      value: stats.added,
      note:
        change === null ? (
          "Not available yet"
        ) : (
          <>
            {change >= 0 ? (
              <span className="text-success-500">+{change} more</span>
            ) : (
              <span className="text-error-500">{-change} fewer</span>
            )}{" "}
            vs {previousPeriodLabels[period]}
          </>
        ),
    },
    {
      icon: <ShieldCheckIcon />,
      label: "Administrators",
      value: stats.administrators,
      note: "Staff with admin access",
    },
    {
      icon: <BuildingsIcon />,
      label: "Total Facilities",
      value: stats.facilities,
      note: "Added facilities",
    },
  ];

  return (
    <StatBanner imageUrl={bannerUrl} action={<BannerPhotoMenu hasCustomPhoto={!!bannerUrl} />}>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} value={<Figure value={card.value} />} />
      ))}
    </StatBanner>
  );
}

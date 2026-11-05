import { BuildingsIcon, ShieldCheckIcon, UserPlusIcon, UsersIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { DashboardOverview } from "@/features/hospital-admin/api/schemas";
import { BannerPhotoMenu } from "@/features/hospital-admin/components/banner-photo-menu";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";

/**
 * The hospital's banner photo (the default one until the admin uploads their own) with the
 * headline staff and facility numbers over it.
 */
export function OverviewBanner({
  stats,
  bannerUrl,
}: {
  stats: DashboardOverview["stats"];
  bannerUrl: string | null;
}) {
  const change = stats.addedThisMonth - stats.addedLastMonth;

  const cards: { icon: ReactNode; label: string; value: number; note: ReactNode }[] = [
    {
      icon: <UsersIcon />,
      label: "Total Staff",
      value: stats.totalStaff,
      note: "All staff added",
    },
    {
      icon: <UserPlusIcon />,
      label: "Added this month",
      value: stats.addedThisMonth,
      note: (
        <>
          {change >= 0 ? (
            <span className="text-success-500">+{change} more</span>
          ) : (
            <span className="text-error-500">{-change} fewer</span>
          )}{" "}
          vs last month
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
        <StatCard key={card.label} {...card} />
      ))}
    </StatBanner>
  );
}

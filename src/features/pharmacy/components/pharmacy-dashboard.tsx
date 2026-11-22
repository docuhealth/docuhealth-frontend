import { CheckCircleIcon, ClockIcon, PillIcon, UsersIcon } from "@phosphor-icons/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import {
  dispensedTrendQuery,
  pharmacyOverviewQuery,
  pharmacyProfileQuery,
} from "@/features/pharmacy/api/queries";
import { DispensedTrendCard } from "@/features/pharmacy/components/dispensed-trend-card";
import { RecentPatientsCard } from "@/features/pharmacy/components/recent-patients-card";
import { greetingFor } from "@/lib/format";

/** The pharmacist's home page: prescriptions waiting, drugs given out, and who got them. */
export function PharmacyDashboard() {
  const { data: profile } = useSuspenseQuery(pharmacyProfileQuery());
  const { data: overview } = useSuspenseQuery(pharmacyOverviewQuery());
  // Every year's count, summed: the drugs dispensed so far.
  const { data: years } = useQuery(dispensedTrendQuery("yearly"));
  const dispensed = years?.reduce((sum, { count }) => sum + count, 0);
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">
            {greetingFor(now)}, {profile.user.firstName}!
          </h1>
          <p className="type-body-sm-regular text-fg-caption">
            Prescriptions waiting for you, and the drugs you’ve given out.
          </p>
        </div>
        <Button asChild className="h-12 w-full px-5 type-heading-sm sm:w-auto">
          <Link to="/hospital/pharmacy/prescriptions">View prescriptions</Link>
        </Button>
      </div>

      <StatBanner imageUrl={profile.hospital.bannerUrl}>
        <StatCard
          icon={<ClockIcon />}
          label="Pending prescriptions"
          value={overview.pending.toLocaleString("en-GB")}
          note="Waiting to be dispensed"
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Settled prescriptions"
          value={overview.settled.toLocaleString("en-GB")}
          note="Dispensed or unavailable"
        />
        <StatCard
          icon={<PillIcon />}
          label="Drugs dispensed"
          value={dispensed === undefined ? "…" : dispensed.toLocaleString("en-GB")}
          note="All so far"
        />
        <StatCard
          icon={<UsersIcon />}
          label="Recent patients"
          value={overview.recentPatients.toLocaleString("en-GB")}
          note="Given drugs in the last 7 days"
        />
      </StatBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <DispensedTrendCard />
        <RecentPatientsCard />
      </div>
    </div>
  );
}

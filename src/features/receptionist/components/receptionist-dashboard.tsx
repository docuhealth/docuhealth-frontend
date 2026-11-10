import {
  CalendarCheckIcon,
  CalendarDotsIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { StatBanner } from "@/components/dashboard/stat-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Trend } from "@/components/dashboard/trend";
import { Button } from "@/components/ui/button";
import {
  receptionistProfileQuery,
  receptionOverviewQuery,
} from "@/features/receptionist/api/queries";
import { AppointmentsCard } from "@/features/receptionist/components/appointments-card";
import { CheckInDialog } from "@/features/receptionist/components/check-in-dialog";
import { ReceptionQueueCard } from "@/features/receptionist/components/reception-queue-card";
import { RegisterPatientDialog } from "@/features/receptionist/components/register-patient-dialog";
import { greetingFor } from "@/lib/format";
import type { Period } from "@/lib/period";

/** What the total check-ins are compared with, for each period. */
const previousPeriod = { today: "yesterday", week: "last 7 days", month: "last 30 days" };

/** The receptionist's home page: today's numbers, appointments and the queue. */
export function ReceptionistDashboard({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const { data: profile } = useSuspenseQuery(receptionistProfileQuery());
  const { data: overview } = useSuspenseQuery(receptionOverviewQuery(period));
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [registering, setRegistering] = useState(false);
  const registerPatient = () => setRegistering(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">
            {greetingFor(now)}, {profile.user.firstName}
          </h1>
          <p className="type-body-sm-regular text-fg-caption">
            Here’s what’s happening at{" "}
            <strong className="font-semibold text-fg-heading">{profile.hospital.shortName}</strong>{" "}
            today.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <Button
            variant="outline"
            className="h-12 bg-card px-4 type-body-sm-medium text-fg-heading"
            onClick={() => setCheckingIn(true)}
          >
            Check-in patient
          </Button>
          <Button
            className="h-12 gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4"
            onClick={registerPatient}
          >
            <PlusIcon data-icon="inline-start" />
            Register patient
          </Button>
        </div>
      </div>

      {/* Changing the photo is the admin's job, so there's no edit button here. */}
      <StatBanner imageUrl={profile.hospital.bannerUrl}>
        <StatCard
          icon={<UserIcon />}
          label="Total Check-ins"
          value={overview.totalCheckIns.toLocaleString("en-GB")}
          note={<Trend change={overview.totalCheckInsChange} since={previousPeriod[period]} />}
        />
        <StatCard
          icon={<ClockIcon />}
          label="Waiting in Queue"
          value={overview.waitingInQueue}
          // A shorter queue is the good news here.
          note={<Trend change={overview.waitingInQueueChange} since="last hour" goodWhen="down" />}
        />
        <StatCard
          icon={<CalendarCheckIcon />}
          label="Checked In Today"
          value={overview.checkedInToday}
          note={<Trend change={overview.checkedInTodayChange} since="yesterday" />}
        />
        <StatCard
          icon={<CalendarDotsIcon />}
          label="Today’s Appointments"
          value={overview.appointmentsToday}
          note={<Trend change={overview.appointmentsTodayChange} since="yesterday" />}
        />
      </StatBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <AppointmentsCard />
        <ReceptionQueueCard />
      </div>

      <CheckInDialog
        open={checkingIn}
        onOpenChange={setCheckingIn}
        onRegisterPatient={registerPatient}
      />
      <RegisterPatientDialog open={registering} onOpenChange={setRegistering} />
    </div>
  );
}

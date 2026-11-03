import { PlusIcon, UserPlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Period } from "@/lib/period";
import { AddFacilityDialog } from "@/features/hospital-admin/components/add-facility-dialog";
import { AddStaffDialog } from "@/features/hospital-admin/components/add-staff-dialog";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { formatLongDate, greetingFor } from "@/lib/format";

/** Greeting with today's date, the period picker and the dashboard's main actions. */
export function DashboardHeader({
  name,
  period,
  onPeriodChange,
}: {
  /** How to address the admin, e.g. "Dr. Adeyemi". */
  name: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());
  const [addingFacility, setAddingFacility] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">
          {greetingFor(now)}, {name}
        </h1>
        <p className="type-body-sm-regular text-fg-caption">{formatLongDate(now)}</p>
      </div>

      <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
        <PeriodSelect value={period} onChange={onPeriodChange} />
        <Button
          variant="outline"
          className="h-12 gap-2 bg-white px-4 type-body-sm-medium text-fg-heading has-data-[icon=inline-start]:pl-4"
          onClick={() => setAddingFacility(true)}
        >
          <PlusIcon data-icon="inline-start" />
          Add Facility
        </Button>
        <Button
          className="h-12 gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4"
          onClick={() => setAddingStaff(true)}
        >
          <UserPlusIcon data-icon="inline-start" />
          Add Staff
        </Button>
      </div>
      <AddFacilityDialog open={addingFacility} onOpenChange={setAddingFacility} />
      <AddStaffDialog open={addingStaff} onOpenChange={setAddingStaff} />
    </div>
  );
}

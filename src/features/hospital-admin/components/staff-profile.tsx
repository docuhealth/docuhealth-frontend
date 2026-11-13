import {
  AtIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarPlusIcon,
  CheckIcon,
  GenderIntersexIcon,
  MinusIcon,
  PhoneIcon,
  UserCheckIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { staffDetailQuery } from "@/features/hospital-admin/api/queries";
import { permissionLabels, sexLabels, staffRoles } from "@/features/hospital-admin/api/schemas";
import { type Period, periodLabels } from "@/lib/period";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import {
  StaffChangeDialogs,
  type StaffChangeStep,
} from "@/features/hospital-admin/components/staff-change-dialogs";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { StatusPill } from "@/components/dashboard/status-pill";
import { ageOn, firstName, formatAppointment, formatDate } from "@/lib/format";

/**
 * One staff member's profile: who they are, their activity in `period`, and what their role
 * lets them do. The header's red button removes them (or their admin access, or adds them back),
 * through the same confirmations as the staff list's ⋯ menu.
 */
export function StaffProfile({
  staffId,
  period,
  onPeriodChange,
}: {
  staffId: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const { data: member } = useSuspenseQuery(staffDetailQuery(staffId, period));
  const [step, setStep] = useState<StaffChangeStep>();
  const role = staffRoles[member.role].one;
  // "This Month" → "This month", as a note under a number.
  const periodName = periodLabels[period][0] + periodLabels[period].slice(1).toLowerCase();
  const { stats } = member;

  // Admins must lose admin access before they can leave the team.
  const teamAction = member.isAdmin
    ? { label: "Remove admin access", step: "confirm-revoke-admin" as const, tone: "danger" }
    : member.status === "on_team"
      ? { label: "Remove from team", step: "confirm-remove" as const, tone: "danger" }
      : { label: "Add back to team", step: "confirm-restore" as const, tone: "brand" };

  return (
    <div className="flex flex-col gap-6">
      <title>{`${member.name} · DocuHealth`}</title>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar name={member.name} src={member.avatarUrl} size="xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-h3">{member.name}</h1>
              <StatusPill tone={member.status === "on_team" ? "success" : "neutral"}>
                {member.status === "on_team" ? "Active" : "Removed"}
              </StatusPill>
              {member.isAdmin && (
                <span className="rounded-[4px] bg-primary/10 px-1.5 py-0.5 type-caption-medium text-primary">
                  Admin
                </span>
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body-sm-regular text-fg-caption [&>span+span]:border-l [&>span+span]:border-divider [&>span+span]:pl-3">
              <span>Staff ID: {member.staffCode}</span>
              <span>{role}</span>
              {member.sex && member.sex !== "prefer_not_to_say" && (
                <span>{sexLabels[member.sex]}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <Button
            variant="outline"
            onClick={() => setStep(teamAction.step)}
            className={
              teamAction.tone === "danger"
                ? "h-12 border-error-500 bg-card px-5 type-body-sm-medium text-error-500 hover:bg-error-100 hover:text-error-500"
                : "h-12 border-primary bg-card px-5 type-body-sm-medium text-primary hover:bg-primary/10 hover:text-primary"
            }
          >
            {teamAction.label}
          </Button>
          <Button
            className="h-12 px-5 type-heading-sm"
            // TODO(design): open the change-role flow once it's designed.
            onClick={() => toast.info("Changing roles isn’t built yet.")}
          >
            Change role
          </Button>
        </div>
      </div>

      <StatGrid>
        <StatCard
          icon={<UsersIcon />}
          label="Total patients seen"
          value={stats.patientsSeen}
          note={periodName}
        />
        <StatCard
          icon={<UserCheckIcon />}
          label="Appointments completed"
          value={stats.appointmentsCompleted}
          note="Under their ongoing care"
        />
        <StatCard
          icon={<CalendarCheckIcon />}
          label={`Appointments ${period === "today" ? "today" : periodName.toLowerCase()}`}
          value={stats.appointments}
          note={
            stats.nextAppointmentAt
              ? `Next at ${formatAppointment(new Date(stats.nextAppointmentAt))}`
              : "None coming up"
          }
        />
        <StatCard
          icon={<CalendarBlankIcon />}
          label="Follow-ups requested"
          value={stats.followUpsRequested}
          note={`${stats.followUpsPending} still pending`}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard
          title="Staff Information"
          description="Personal and contact details for this staff member."
        >
          <dl className="flex flex-col">
            <InfoRow icon={<UserIcon />} label="Full name">
              {member.name}
            </InfoRow>
            <InfoRow icon={<GenderIntersexIcon />} label="Sex">
              {member.sex ? sexLabels[member.sex] : "—"}
            </InfoRow>
            <InfoRow icon={<PhoneIcon />} label="Phone Number">
              {member.phone}
            </InfoRow>
            <InfoRow icon={<CalendarBlankIcon />} label="Date of Birth">
              {member.dateOfBirth
                ? `${formatDate(new Date(member.dateOfBirth))} (${ageOn(new Date(member.dateOfBirth))} years)`
                : "—"}
            </InfoRow>
            <InfoRow icon={<AtIcon />} label="Email Address">
              {member.email}
            </InfoRow>
            <InfoRow icon={<CalendarPlusIcon />} label="Joined at">
              {formatDate(new Date(member.addedAt))}
            </InfoRow>
            <InfoRow icon={<UserPlusIcon />} label="Added by">
              {member.addedBy ?? "—"}
            </InfoRow>
          </dl>
        </ProfileCard>

        <ProfileCard
          title="Role and access"
          description={`What ${firstName(member.name)} can do in DocuHealth as a ${role.toLowerCase()}`}
        >
          <ul className="flex flex-col divide-y">
            {member.permissions.map(({ permission, granted }) => {
              const { label, description } = permissionLabels[permission];
              return (
                <li key={permission} className="flex items-center gap-3 py-4">
                  <span
                    className={
                      granted
                        ? "grid size-8 shrink-0 place-content-center rounded-full bg-success-100 text-success-500"
                        : "grid size-8 shrink-0 place-content-center rounded-full bg-line text-fg-caption"
                    }
                  >
                    {granted ? (
                      <CheckIcon weight="bold" className="size-4" />
                    ) : (
                      <MinusIcon weight="bold" className="size-4" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="type-body-sm-medium text-fg-heading">{label}</span>
                    <span className="type-body-sm-regular text-fg-caption">{description}</span>
                  </div>
                  {/* Comes from their role; changed with "Change role", not one by one. */}
                  <Switch
                    checked={granted}
                    disabled
                    aria-label={`${label}: ${granted ? "allowed" : "not allowed"}`}
                    // Read-only, but still readable: no fading, a visible "off" track.
                    className="data-checked:bg-primary/60 data-unchecked:bg-divider data-disabled:cursor-default data-disabled:opacity-100"
                  />
                </li>
              );
            })}
          </ul>
        </ProfileCard>
      </div>

      <StaffChangeDialogs member={member} step={step} onStepChange={setStep} />
    </div>
  );
}

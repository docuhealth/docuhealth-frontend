import {
  AtIcon,
  BuildingsIcon,
  GenderIntersexIcon,
  IdentificationBadgeIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { Button } from "@/components/ui/button";
import { staffProfileQuery } from "@/features/staff/api/queries";
import { staffRoleLabels } from "@/lib/staff-profile";
import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  EditProfileDialog,
} from "@/features/staff/components/account-dialogs";

const outlineButton = "h-10 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading";

/**
 * Settings for any staff member: their details (name and phone can be edited), their email
 * (changed with a code sent to the new address) and their password.
 */
export function StaffSettings() {
  const { data: profile } = useSuspenseQuery(staffProfileQuery());
  const { user, hospital } = profile;
  const [dialog, setDialog] = useState<"details" | "email" | "password" | null>(null);
  const openOrClose = (which: typeof dialog) => (open: boolean) => setDialog(open ? which : null);
  const role = user.role ? staffRoleLabels[user.role] : "Administrator";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Settings</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Manage your personal details, email and password.
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <PersonAvatar name={user.name} src={null} size="xl" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate type-h4">{user.name}</p>
          <p className="type-body-sm-regular text-fg-caption">
            {role}
            {hospital.name && ` · ${hospital.name}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileCard
          title="Personal details"
          description="How your colleagues see you across DocuHealth."
          action={
            <Button
              variant="outline"
              className={outlineButton}
              onClick={() => setDialog("details")}
            >
              <PencilSimpleIcon data-icon="inline-start" />
              Edit
            </Button>
          }
        >
          <dl className="divide-y">
            <InfoRow icon={<UserIcon />} label="First name">
              {user.firstName || "—"}
            </InfoRow>
            <InfoRow icon={<UserIcon />} label="Last name">
              {user.lastName || "—"}
            </InfoRow>
            <InfoRow icon={<PhoneIcon />} label="Phone number">
              {user.phone ?? "—"}
            </InfoRow>
            <InfoRow icon={<GenderIntersexIcon />} label="Gender">
              <span className="capitalize">{user.gender ?? "—"}</span>
            </InfoRow>
            <InfoRow icon={<IdentificationBadgeIcon />} label="Role">
              {role}
            </InfoRow>
            <InfoRow icon={<BuildingsIcon />} label="Facility">
              {hospital.name || "—"}
            </InfoRow>
          </dl>
        </ProfileCard>

        <div className="flex flex-col gap-6">
          <ProfileCard
            title="Email address"
            description="Where we send sign-in and account emails."
            action={
              <Button
                variant="outline"
                className={outlineButton}
                onClick={() => setDialog("email")}
              >
                <AtIcon data-icon="inline-start" />
                Change email
              </Button>
            }
          >
            <dl>
              <InfoRow icon={<AtIcon />} label="Email">
                {user.email}
              </InfoRow>
            </dl>
          </ProfileCard>

          <ProfileCard
            title="Password"
            description="Change the password you log in with."
            action={
              <Button
                variant="outline"
                className={outlineButton}
                onClick={() => setDialog("password")}
              >
                <LockKeyIcon data-icon="inline-start" />
                Change password
              </Button>
            }
          >
            <dl>
              <InfoRow icon={<LockKeyIcon />} label="Password">
                ••••••••
              </InfoRow>
            </dl>
          </ProfileCard>
        </div>
      </div>

      <EditProfileDialog
        member={user}
        open={dialog === "details"}
        onOpenChange={openOrClose("details")}
      />
      <ChangeEmailDialog open={dialog === "email"} onOpenChange={openOrClose("email")} />
      <ChangePasswordDialog open={dialog === "password"} onOpenChange={openOrClose("password")} />
    </div>
  );
}

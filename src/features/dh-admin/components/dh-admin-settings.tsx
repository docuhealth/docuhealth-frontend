import { LockKeyIcon, AtIcon } from "@phosphor-icons/react";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

/**
 * The admin's account: who they're signed in as, and a way to change the password. TODO(api):
 * there's no admin profile to show or edit.
 */
export function DhAdminSettings({ onChangePassword }: { onChangePassword: () => void }) {
  const email = useAuthStore((state) => state.session?.user.email);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Settings</h1>
        <p className="type-body-sm-regular text-fg-caption">Your DocuHealth admin account.</p>
      </div>
      <div className="max-w-2xl">
        <ProfileCard title="Account" description="How you sign in.">
          <dl className="flex flex-col">
            <InfoRow icon={<AtIcon />} label="Email address">
              {email || "—"}
            </InfoRow>
            <InfoRow icon={<LockKeyIcon />} label="Password">
              <Button
                variant="outline"
                size="sm"
                onClick={onChangePassword}
                className="bg-card type-caption-semibold font-sans text-fg-heading"
              >
                Change password
              </Button>
            </InfoRow>
          </dl>
        </ProfileCard>
      </div>
    </div>
  );
}

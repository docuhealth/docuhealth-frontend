import { InfoIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Switch } from "@/components/ui/switch";
import {
  type PrivacySettings,
  privacySettingsQuery,
  useSavePrivacySettings,
} from "@/features/patient/api/pending-sharing";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { getErrorMessage } from "@/lib/api";

// TODO(design): no design for this tab yet; it follows the record lists' style.
// TODO(api): no consent settings for patients yet; see `pending-sharing.ts`.

const choices: { key: keyof PrivacySettings; title: string; text: string }[] = [
  {
    key: "emergencyAccess",
    title: "Allow emergency access",
    text: "Doctors treating you in an emergency can see your allergies, medications and conditions without a code. Every view shows in your access history.",
  },
  {
    key: "careTeams",
    title: "Share with my care teams automatically",
    text: "Doctors at facilities where you’re being treated can see your record while your care continues.",
  },
  {
    key: "research",
    title: "Use my data for research",
    text: "Your record may be used, with your name and details removed, to help improve care.",
  },
];

/** "Privacy & consent": switches for who may see the record without a share. */
export function PrivacyConsentTab() {
  const { data: settings, isError } = useQuery(privacySettingsQuery());
  const save = useSavePrivacySettings();

  if (!settings && !isError) return <ListSkeleton />;
  // Shown off until the saved choices load; a failed load leaves them off.
  const current = settings ?? { emergencyAccess: false, careTeams: false, research: false };

  return (
    <section aria-label="Privacy and consent" className="flex flex-col gap-2">
      <SectionLabel>Consent</SectionLabel>
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {choices.map((choice) => {
          const id = `privacy-${choice.key}`;
          // While a change saves, show where it's going.
          const on =
            save.isPending && save.variables ? save.variables[choice.key] : current[choice.key];
          return (
            <li key={choice.key} className="flex items-start gap-4 px-4 py-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={id} className="type-body-sm-medium text-fg-heading">
                  {choice.title}
                </label>
                <p id={`${id}-text`} className="type-caption text-fg-caption">
                  {choice.text}
                </p>
              </div>
              <Switch
                id={id}
                aria-describedby={`${id}-text`}
                checked={on}
                disabled={save.isPending}
                onCheckedChange={(checked) =>
                  save.mutate(
                    { ...current, [choice.key]: checked },
                    {
                      onSuccess: () => toast.success("Your privacy settings are saved."),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    },
                  )
                }
                className="mt-0.5"
              />
            </li>
          );
        })}
      </ul>
      <p className="flex items-start gap-2 type-caption text-fg-caption">
        <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        These choices never stop the facility treating you from seeing what it recorded itself. You
        can change them at any time.
      </p>
    </section>
  );
}

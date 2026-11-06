import {
  FingerprintSimpleIcon,
  LockKeyIcon,
  SealIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserIcon,
} from "@phosphor-icons/react";
import dataPrivacyImageUrl from "@/assets/images/data-privacy.png";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { cn } from "@/lib/utils";

function RoleBadgeIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex items-center justify-center", className)}>
      <SealIcon className="size-full" />
      <UserIcon weight="bold" className="absolute size-2.5" />
    </span>
  );
}

const securityFeatures = [
  {
    title: "End-to-end encryption",
    icon: LockKeyIcon,
    badgeClassName: "size-10 bg-violet-100 text-primary",
  },
  {
    title: "Role-based data access",
    icon: RoleBadgeIcon,
    badgeClassName: "size-10 bg-teal-100/70 text-teal-700",
  },
  {
    title: "Secure authentication",
    icon: FingerprintSimpleIcon,
    badgeClassName: "size-11 bg-blue-100 text-blue-700 [&>svg]:size-6",
  },
  {
    title: "Patient-permission-based access",
    icon: UserCheckIcon,
    badgeClassName: "size-10 bg-success-100 text-success-500",
  },
  {
    title: "NDPR compliant under the National Data Protection Commission (NDPC)",
    icon: ShieldCheckIcon,
    badgeClassName: "size-10 bg-orange-100 text-warning-700",
  },
] as const;

export function DataPrivacySection() {
  return (
    <LandingContainer className="pt-20 lg:pt-40">
      <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:gap-10">
        <div className="w-full lg:max-w-132.5">
          <h2 className="type-section text-fg-heading">
            Data <strong>Privacy & Security</strong>
          </h2>

          <p className="mt-4 type-lead text-fg-body">
            At DocuHealth we follow global healthcare security standards. Every record is encrypted,
            access is limited by role, and nothing is shared without the patient’s permission.
          </p>

          <ul className="mt-5.5">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.title}
                  className="flex items-center gap-3 border-b border-line py-5"
                >
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-md",
                      feature.badgeClassName,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="type-accent-h4 text-fg-heading">{feature.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <img
          src={dataPrivacyImageUrl}
          alt="Patient record access permissions and approval prompt"
          width={610}
          height={568}
          className="w-full lg:w-152.5 lg:shrink-0"
        />
      </div>
    </LandingContainer>
  );
}

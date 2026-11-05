import {
  FingerprintIcon,
  LockSimpleIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "@phosphor-icons/react";
import dataPrivacyImageUrl from "@/assets/images/data-privacy.png";

const securityFeatures = [
  {
    title: "End-to-end encryption",
    icon: LockSimpleIcon,
    badgeClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Role-based data access",
    icon: SealCheckIcon,
    badgeClassName: "bg-success-100 text-success-700",
  },
  {
    title: "Secure authentication",
    icon: FingerprintIcon,
    badgeClassName: "bg-info-100 text-info-500",
  },
  {
    title: "Patient-permission-based access",
    icon: UserCheckIcon,
    badgeClassName: "bg-success-100 text-success-500",
  },
  {
    title: "NDPR compliant under the National Data Protection Commission (NDPC)",
    icon: ShieldCheckIcon,
    badgeClassName: "bg-warning-100 text-warning-700",
  },
] as const;

export function DataPrivacySection() {
  return (
    <section className="mx-auto w-full max-w-11/12 px-4 py-16 sm:py-20 lg:py-28 xl:px-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column: Heading + checklist */}
        <div>
          <h2 className="type-accent-h1 md:type-h2">
            <span className="font-normal">Data</span>{" "}
            <span className="font-bold">Privacy & Security</span>
          </h2>

          <p className="mt-4 max-w-lg type-body-sm-regular text-fg-body sm:type-body">
            At DocuHealth we follow global healthcare security standards. Every record is encrypted,
            access is limited by role, and nothing is shared without the patient’s permission.
          </p>

          <ul className="mt-8 max-w-lg divide-y divide-line">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex items-center gap-4 py-4">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${feature.badgeClassName}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="type-body-sm text-fg-heading">{feature.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right column: Composite privacy illustration */}
        <div className="overflow-hidden rounded-2xl">
          <img
            src={dataPrivacyImageUrl}
            alt="Patient record access permissions and approval prompt"
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

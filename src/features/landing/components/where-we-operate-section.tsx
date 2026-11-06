import { MapPinAreaIcon } from "@phosphor-icons/react";
import locationMapImageUrl from "@/assets/images/location-map.png";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { cn } from "@/lib/utils";

const offices = [
  {
    title: "Head Office, Lagos",
    address: "[Head office address]",
  },
  {
    title: "Osun State Branch",
    address: "MDS Under Bridge, After Justrite",
  },
] as const;

const legendItems = [
  { label: "Active now", swatchClassName: "bg-primary" },
  { label: "Coming soon", swatchClassName: "bg-warning-500" },
  { label: "Expanding to more states", swatchClassName: "bg-primary/15" },
] as const;

export function WhereWeOperateSection() {
  return (
    <LandingContainer className="pt-20 lg:pt-40">
      <div className="mx-auto flex max-w-310 flex-col items-start justify-between gap-12 lg:flex-row lg:gap-10">
        <div className="w-full lg:max-w-120">
          <h2 className="type-section text-fg-heading">
            Where we <strong>operate</strong>
          </h2>

          <p className="mt-4 type-lead text-fg-body">
            DocuHealth is active in Lagos, Ogun and Osun states, with our head office in Lagos. We
            are growing steadily, and more states are coming soon.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {offices.map((office) => (
              <div key={office.title} className="rounded-lg bg-card px-3 py-2.5 shadow-card">
                <p className="type-title-sm text-fg-heading">{office.title}</p>
                <p className="mt-1 flex items-center gap-1.5 type-body-sm-regular text-fg-body">
                  <MapPinAreaIcon className="size-4 shrink-0" />
                  <span>{office.address}</span>
                </p>
              </div>
            ))}
          </div>

          <ul className="mt-10 flex flex-col gap-3">
            {legendItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className={cn("size-4 shrink-0 rounded-[3px]", item.swatchClassName)} />
                <span className="type-accent-h4 text-fg-heading">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <img
          src={locationMapImageUrl}
          alt="Map of Nigeria highlighting active DocuHealth states in Lagos, Ogun, and Osun"
          width={620}
          height={564}
          className="w-full lg:w-155 lg:shrink-0"
        />
      </div>
    </LandingContainer>
  );
}

import { MapPinIcon } from "@phosphor-icons/react";
import locationMapImageUrl from "@/assets/images/location-map.png";

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
  { label: "Expanding to more states", swatchClassName: "bg-primary/20" },
] as const;

export function WhereWeOperateSection() {
  return (
    <section className="mx-auto w-full max-w-11/12 px-4 py-16 sm:py-20 lg:py-28 xl:px-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column: Heading, office cards, and map legend */}
        <div>
          <h2 className="type-accent-h1 md:type-h2">
            <span className="font-normal">Where we</span> <span className="font-bold">operate</span>
          </h2>

          <p className="mt-4 max-w-md type-body-sm-regular text-fg-body sm:type-body">
            DocuHealth is active in Lagos, Ogun and Osun states, with our head office in Lagos. We
            are growing steadily, and more states are coming soon.
          </p>

          <div className="mt-8 flex max-w-md flex-col gap-4">
            {offices.map((office) => (
              <div
                key={office.title}
                className="rounded-xl border border-line bg-card px-5 py-4 shadow-xs"
              >
                <p className="type-body-sm text-fg-heading">{office.title}</p>
                <p className="mt-1.5 flex items-center gap-1.5 type-caption text-fg-body">
                  <MapPinIcon className="size-3.5 shrink-0 text-fg-caption" />
                  <span>{office.address}</span>
                </p>
              </div>
            ))}
          </div>

          <ul className="mt-8 flex flex-col gap-3">
            {legendItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className={`size-3.5 shrink-0 rounded-xs ${item.swatchClassName}`} />
                <span className="type-body-sm-regular text-fg-heading">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column: Nigeria map with state callouts */}
        <div>
          <img
            src={locationMapImageUrl}
            alt="Map of Nigeria highlighting active DocuHealth states in Lagos, Ogun, and Osun"
            className="w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

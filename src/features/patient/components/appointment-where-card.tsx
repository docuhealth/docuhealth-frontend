import { BuildingsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { notYet } from "@/features/patient/lib/not-yet";
import { type AppointmentView, placeLine } from "@/features/patient/lib/appointments";

/** Where to go: the facility's photo, name, clinic and address, and directions to it. */
export function AppointmentWhereCard({ appointment }: { appointment: AppointmentView }) {
  const { facilityAddress: address, facilityPhoto: photo } = appointment;
  const place = placeLine(appointment) ?? "Facility not given";
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-2 pb-3">
      {/* TODO(api): no facility photos yet, so this is a placeholder. */}
      {photo ? (
        <img src={photo} alt="" className="aspect-[2.6/1] w-full rounded-lg object-cover" />
      ) : (
        <span
          aria-hidden
          className="grid aspect-[2.6/1] w-full place-content-center rounded-lg bg-brand-50 text-primary/60"
        >
          <BuildingsIcon className="size-12" />
        </span>
      )}
      <div className="flex items-center gap-3 px-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate type-body-sm-medium text-fg-heading">{place}</p>
          {address && <p className="truncate type-caption text-fg-caption">{address}</p>}
        </div>
        {address ? (
          <Button variant="outline" asChild className="h-10 shrink-0 px-4 type-heading-sm">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </Button>
        ) : (
          // TODO(api): no facility address on appointments.
          <Button
            variant="outline"
            className="h-10 shrink-0 px-4 type-heading-sm"
            onClick={notYet("Directions")}
          >
            Get directions
          </Button>
        )}
      </div>
    </div>
  );
}

import { UserIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { Button } from "@/components/ui/button";
import type { AppointmentView } from "@/features/patient/lib/appointments";

/** Who the patient will see, and a button to message them; or that no one is assigned yet. */
export function AppointmentClinicianCard({ appointment }: { appointment: AppointmentView }) {
  const { clinician } = appointment;
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      {clinician ? (
        <>
          <PersonAvatar name={clinician.name} src={clinician.photo} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate type-body-sm-medium text-fg-heading">{clinician.name}</p>
            <p className="truncate type-caption text-fg-caption">
              {/* TODO(api): no clinician role ("Consultant Physician") on appointments. */}
              {[clinician.role, clinician.specialty ?? appointment.department]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Button variant="outline" asChild className="h-10 px-4 type-heading-sm">
            <Link to="/patient/messages">Message</Link>
          </Button>
        </>
      ) : (
        <>
          <span className="grid size-8 shrink-0 place-content-center rounded-full bg-line text-fg-caption">
            <UserIcon aria-hidden className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="type-body-sm-medium text-fg-heading">Not assigned yet</p>
            <p className="type-caption text-fg-caption">
              The facility will choose a clinician when it confirms your appointment.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

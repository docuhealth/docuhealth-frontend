import { CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import { useConfirmAttendance } from "@/features/patient/api/pending-appointments";
import { AppointmentCard } from "@/features/patient/components/appointment-card";
import { BookDoctorBanner } from "@/features/patient/components/book-doctor-banner";
import { BookingDialog, type RescheduleTarget } from "@/features/patient/components/booking-dialog";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { Segments, SectionLabel } from "@/features/patient/components/patient-ui";
import { matchesSearch, splitAppointments } from "@/features/patient/lib/appointments";
import { useAppointments } from "@/features/patient/lib/use-appointments";
import { getErrorMessage } from "@/lib/api";

type Tab = "upcoming" | "past";

/** The patient's appointments, upcoming and past, and booking a new one. */
export function AppointmentsPage() {
  const { data, isError } = useAppointments();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState<{ reschedule?: RescheduleTarget } | null>(null);
  const confirm = useConfirmAttendance();

  const { upcoming, past } = splitAppointments(data ?? []);
  const shown = (tab === "upcoming" ? upcoming : past).filter((appointment) =>
    matchesSearch(appointment, search),
  );
  const loading = !data && !isError;
  const none = !loading && upcoming.length + past.length === 0;
  const book = () => setBooking({});

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Appointments"
        subtitle={loading ? null : none ? "No appointments yet" : `${upcoming.length} upcoming`}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segments
          label="Appointments"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: `Upcoming (${upcoming.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
        />
        <div className="flex gap-3">
          <SearchField
            label="Search appointments"
            placeholder="Search appointments"
            value={search}
            onChange={setSearch}
            size="lg"
            className="h-10 sm:w-72"
          />
          <Button className="h-10 shrink-0 px-4 type-heading-sm" onClick={book}>
            <PlusIcon data-icon="inline-start" />
            Book appointment
          </Button>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center pb-10">
          <PatientEmpty
            icon={<CalendarBlankIcon />}
            title={
              search
                ? "No appointments match your search"
                : none
                  ? "No appointments yet"
                  : tab === "upcoming"
                    ? "No upcoming appointments"
                    : "No past appointments"
            }
            description={
              search
                ? "Try a doctor’s name, a facility or a department."
                : tab === "upcoming"
                  ? "Your upcoming appointments will appear here once you book one."
                  : "Appointments you’ve been to or cancelled will appear here."
            }
          />
          {!search && tab === "upcoming" && (
            <Button className="h-10 px-5 type-heading-sm" onClick={book}>
              Book an appointment
            </Button>
          )}
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          <SectionLabel>{tab === "upcoming" ? "Upcoming" : "Past"}</SectionLabel>
          <div className="grid gap-4 lg:grid-cols-2">
            {shown.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                confirming={confirm.isPending && confirm.variables === appointment.id}
                onReschedule={() =>
                  setBooking({
                    reschedule: { id: appointment.id, facility: appointment.facility },
                  })
                }
                onConfirm={() =>
                  confirm.mutate(appointment.id, {
                    onSuccess: () =>
                      toast.success(
                        `Thanks. We’ve told ${appointment.facility ?? "the facility"} you’re coming.`,
                      ),
                    onError: (error) => toast.error(getErrorMessage(error)),
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !none && <BookDoctorBanner onBook={book} />}

      <BookingDialog
        open={!!booking}
        onOpenChange={(open) => !open && setBooking(null)}
        reschedule={booking?.reschedule}
      />
    </div>
  );
}

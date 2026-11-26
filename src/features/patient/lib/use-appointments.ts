import { useQuery } from "@tanstack/react-query";
import { appointmentExtrasQuery } from "@/features/patient/api/pending-appointments";
import { appointmentsQuery } from "@/features/patient/api/queries";
import { type AppointmentView, mergeAppointments } from "@/features/patient/lib/appointments";

/**
 * The patient's appointments with their extra details, soonest first: `undefined` while they
 * load. TODO(api): the extras come from `pending-appointments.ts`.
 */
export function useAppointments(): { data: AppointmentView[] | undefined; isError: boolean } {
  const appointments = useQuery(appointmentsQuery());
  const extras = useQuery(appointmentExtrasQuery());
  const isError = appointments.isError;
  if (!appointments.data) return { data: undefined, isError };
  // Without the extras (still loading, or failed) the API's appointments still show.
  if (!extras.data && !extras.isError) return { data: undefined, isError };
  return {
    data: mergeAppointments(appointments.data, extras.data ?? { details: [] }),
    isError,
  };
}

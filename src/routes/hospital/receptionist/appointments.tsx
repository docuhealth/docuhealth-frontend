import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { appointmentCalendarQuery } from "@/features/receptionist/api/queries";
import { AppointmentsCalendar } from "@/features/receptionist/components/appointments-calendar";
import {
  calendarViewSchema,
  parseCalendarDate,
  rangeFor,
} from "@/features/receptionist/lib/calendar";
import { toIsoDate } from "@/lib/date-input";

export const Route = createFileRoute("/hospital/receptionist/appointments")({
  validateSearch: z.object({
    view: calendarViewSchema.default("day").catch("day"),
    /** "YYYY-MM-DD"; today when left out. */
    date: z.string().optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ view: search.view, date: search.date }),
  loader: ({ context: { queryClient }, deps }) => {
    const { from, to } = rangeFor(deps.view, parseCalendarDate(deps.date));
    return queryClient.ensureQueryData(
      appointmentCalendarQuery(from.toISOString(), to.toISOString()),
    );
  },
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Appointments · DocuHealth</title>
      <AppointmentsCalendar
        view={search.view}
        date={parseCalendarDate(search.date)}
        onNavigate={({ view = search.view, date }) =>
          void navigate({
            search: {
              view,
              date: date === undefined ? search.date : date ? toIsoDate(date) : undefined,
            },
          })
        }
      />
    </>
  );
}

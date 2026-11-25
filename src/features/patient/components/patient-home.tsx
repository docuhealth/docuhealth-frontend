import { useQuery } from "@tanstack/react-query";
import { appointmentsQuery, drugsQuery, visitsQuery } from "@/features/patient/api/queries";
import { HealthSnapshot } from "@/features/patient/components/health-snapshot";
import { NeedsAttention } from "@/features/patient/components/needs-attention";
import { PageHeading } from "@/features/patient/components/page-heading";
import { UpcomingAppointmentCard } from "@/features/patient/components/upcoming-appointment-card";
import { attentionItems } from "@/features/patient/lib/attention";
import { nextAppointment } from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";

/** The patient's home: their next appointment, what needs attention, and a health snapshot. */
export function PatientHome() {
  const { firstName, hin } = usePatient();
  const visits = useQuery(visitsQuery(hin));
  const appointments = useQuery(appointmentsQuery());
  const drugs = useQuery(drugsQuery());

  // A list that failed to load counts as empty, so the rest of the page still shows.
  const visitList = visits.data ?? (visits.isError ? [] : undefined);
  const drugList = drugs.data ?? (drugs.isError ? [] : undefined);
  const appointmentList = appointments.data ?? (appointments.isError ? [] : undefined);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
      <PageHeading title={`Welcome, ${firstName}`} subtitle={hin ? `HIN · ${hin}` : null} />
      <div className="flex min-w-0 flex-col gap-6">
        <UpcomingAppointmentCard
          appointment={appointmentList ? nextAppointment(appointmentList) : undefined}
        />
        <NeedsAttention
          items={visitList && drugList ? attentionItems(visitList, drugList) : undefined}
        />
      </div>
      <HealthSnapshot visits={visitList} />
    </div>
  );
}

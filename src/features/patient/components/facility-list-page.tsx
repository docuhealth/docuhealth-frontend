import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { facilityProfilesQuery } from "@/features/patient/api/pending-health";
import { appointmentsQuery, checkInsQuery } from "@/features/patient/api/queries";
import { FacilityEmpty } from "@/features/patient/components/facility-empty";
import { FacilityRow } from "@/features/patient/components/facility-row";
import { PageHeading } from "@/features/patient/components/page-heading";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { facilityViews } from "@/features/patient/lib/facilities";
import { useVisits } from "@/features/patient/lib/use-visits";
import { plural } from "@/lib/format";

/**
 * The hospitals and clinics that hold the patient's records, most recently visited first.
 * TODO(api): a facility's location and photo are pending (api/pending-health.ts).
 */
export function FacilityListPage() {
  const visits = useVisits();
  const appointments = useQuery(appointmentsQuery());
  const checkIns = useQuery(checkInsQuery());
  const profiles = useQuery(facilityProfilesQuery()).data ?? [];

  const loading =
    (!visits.data && !visits.isError) ||
    (!appointments.data && !appointments.isError) ||
    (!checkIns.data && !checkIns.isError);
  const facilities = facilityViews(
    visits.data ?? [],
    appointments.data ?? [],
    checkIns.data ?? [],
    profiles,
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="Healthcare facilities"
        back={{ to: "/patient/health", label: "Back to Health" }}
      />
      {loading ? (
        <ListSkeleton />
      ) : facilities.length === 0 ? (
        <FacilityEmpty />
      ) : (
        <>
          <p className="type-body-sm-regular text-fg-body">
            Hospitals and clinics that hold your records. Your care history stays linked to your
            HIN.
          </p>
          <section className="flex flex-col gap-2">
            <SectionLabel>{plural(facilities.length, "facility", "facilities")}</SectionLabel>
            <RecordList label="Healthcare facilities">
              {facilities.map((facility) => (
                <FacilityRow key={facility.name} facility={facility} />
              ))}
            </RecordList>
          </section>
        </>
      )}
    </div>
  );
}

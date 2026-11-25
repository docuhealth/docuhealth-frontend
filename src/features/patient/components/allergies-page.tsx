import { WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { allergiesQuery } from "@/features/patient/api/pending";
import { AllergyRow } from "@/features/patient/components/allergy-row";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, ReportChange, SectionLabel } from "@/features/patient/components/patient-ui";
import { splitAllergies } from "@/features/patient/lib/allergies";

const back = { to: "/patient/health", label: "Back to Health" } as const;

const groupLabel = (count: number, which: string) =>
  `${count} ${which} ${count === 1 ? "allergy" : "allergies"}`;

/** The patient's allergies, the most severe first. TODO(api): they come from `pending.ts`. */
export function AllergiesPage() {
  const { data, isError } = useQuery(allergiesQuery());
  const { active, past } = splitAllergies(data ?? []);
  const loading = !data && !isError;
  const empty = !loading && active.length + past.length === 0;
  const groups = [
    { label: groupLabel(active.length, "active"), list: active },
    { label: groupLabel(past.length, "past"), list: past },
  ].filter((group) => group.list.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Allergies"
        subtitle={
          loading
            ? null
            : empty
              ? "No allergies recorded"
              : `${active.length} active · ${past.length} past`
        }
        back={back}
      />
      {loading ? (
        <ListSkeleton />
      ) : empty ? (
        <PatientEmpty
          icon={<WarningCircleIcon />}
          title="No allergies recorded"
          description="None of your facilities have recorded an allergy for you yet."
        />
      ) : (
        <>
          {groups.map((group) => (
            <section key={group.label} className="flex flex-col gap-2">
              <SectionLabel>{group.label}</SectionLabel>
              <RecordList label={group.label}>
                {group.list.map((allergy) => (
                  <AllergyRow key={allergy.id} allergy={allergy} />
                ))}
              </RecordList>
            </section>
          ))}
          <ReportChange />
        </>
      )}
    </div>
  );
}

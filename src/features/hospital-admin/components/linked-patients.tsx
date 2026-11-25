import { Link } from "@tanstack/react-router";
import {
  type LinkedPatient,
  type PatientDetail,
  sexLabels,
} from "@/features/hospital-admin/api/schemas";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { ageOn, formatDayAndTime, maskHin } from "@/lib/format";

const titles = {
  guardians: {
    title: "Guardians",
    description: "Who looks after this patient’s account, and when they last visited.",
  },
  dependants: {
    title: "Dependants",
    description: "Patients on this patient’s account, and when they last visited.",
  },
} as const satisfies Record<PatientDetail["linked"]["relation"], object>;

/**
 * A patient's guardians (if they're a dependant) or their dependants, each linking to their own
 * profile. TODO(design): not in the designs; laid out like the check-in history's list.
 */
export function LinkedPatients({
  relation,
  patients,
  now,
}: {
  relation: PatientDetail["linked"]["relation"];
  patients: LinkedPatient[];
  /** When the page opened, for "Today". */
  now: Date;
}) {
  const { title, description } = titles[relation];

  return (
    <ProfileCard title={title} description={description}>
      <ul aria-label={title} className="flex flex-col divide-y">
        {patients.map((patient) => {
          const age = patient.dateOfBirth && ageOn(new Date(patient.dateOfBirth), now);
          const last = patient.lastVisitAt && formatDayAndTime(new Date(patient.lastVisitAt), now);
          return (
            <li key={patient.hin} className="flex items-center gap-3 py-3.5">
              <PersonAvatar name={patient.name} src={null} />
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to="/hospital/admin/patients/$patientId"
                  params={{ patientId: patient.id }}
                  className="truncate type-body-sm-medium text-fg-heading hover:underline"
                >
                  {patient.name}
                </Link>
                <span className="truncate type-body-sm-regular text-fg-caption">
                  {[
                    `HIN ${maskHin(patient.hin)}`,
                    age !== null && `${age} yrs`,
                    patient.sex !== "prefer_not_to_say" && sexLabels[patient.sex],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              <div className="flex shrink-0 flex-col text-right type-body-sm-regular">
                <span className="text-fg-heading">{last ? last.day : "No visits yet"}</span>
                {last && <span className="text-fg-caption">{last.time}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </ProfileCard>
  );
}

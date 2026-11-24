import {
  AtIcon,
  BedIcon,
  CalendarBlankIcon,
  MapPinIcon,
  PhoneIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patientInfoQuery, visitQuery } from "@/features/clinical/api/queries";
import type { Visit, VisitList } from "@/features/clinical/api/schemas";
import { VisitStatus } from "@/features/clinical/components/clinical-patients";
import { VisitRecords } from "@/features/clinical/components/visit-records";
import { ageOn, formatDate, formatDateCommaTime } from "@/lib/format";
import { CardSkeleton } from "@/components/dashboard/skeletons";

const coverageLabels = { hmo: "HMO Patient", private: "Private Patient" } as const;

/** A tab a dashboard adds to the patient page, e.g. the doctor's encounter notes. */
export type PatientTab = { value: string; label: string; content: ReactNode };

/**
 * One visit's patient page: who they are and where the visit stands, then tabs. Every dashboard
 * gets the patient's details (with latest vitals and ongoing drugs) and the visit's records;
 * `tabs` and `actions` add what the doctor or nurse does from here.
 */
export function PatientPage({
  list,
  visitId,
  actions,
  tabs,
}: {
  list: VisitList;
  visitId: string;
  /** Buttons beside the patient's name, given the visit. */
  actions?: (visit: Visit) => ReactNode;
  tabs?: (visit: Visit) => PatientTab[];
}) {
  const { data: visit } = useSuspenseQuery(visitQuery(list, visitId));
  const [tab, setTab] = useState("patient");
  // When the page opened, for the patient's age.
  const [now] = useState(() => new Date());
  const { patient } = visit;
  const extra = tabs ? tabs(visit) : [];

  return (
    <div className="flex flex-col gap-6">
      <title>{`${patient.name} · DocuHealth`}</title>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={patient.name} src={null} size="xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-h4">{patient.name}</h1>
              <VisitStatus status={visit.status} />
              {patient.coverage && (
                <span className="rounded-sm bg-success-100 px-2 py-0.5 type-body-sm-regular text-success-700">
                  {coverageLabels[patient.coverage]}
                </span>
              )}
            </div>
            <p className="type-body-sm-regular text-fg-caption">
              {[
                `HIN ${patient.hin}`,
                `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
                patient.sex !== "prefer_not_to_say" && (patient.sex === "male" ? "Male" : "Female"),
                visit.ward &&
                  [visit.ward, visit.bed && `Bed ${visit.bed}`].filter(Boolean).join(" · "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex w-full flex-wrap gap-3 *:flex-1 sm:w-auto sm:*:flex-none">
            {actions(visit)}
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="patient">Patient</TabsTrigger>
          {extra.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="records">Visit records</TabsTrigger>
        </TabsList>

        <TabsContent value="patient">
          <PatientDetails visit={visit} now={now} />
        </TabsContent>
        {extra.map(({ value, content }) => (
          <TabsContent key={value} value={value}>
            {content}
          </TabsContent>
        ))}
        <TabsContent value="records">
          <section aria-label="Visit records" className="rounded-xl border bg-card px-4 py-2">
            <VisitRecords visit={visit} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Contact details and the visit, beside the latest vitals and the drugs they're on. */
function PatientDetails({ visit, now }: { visit: Visit; now: Date }) {
  const { patient } = visit;
  const { data: info, isError } = useQuery(patientInfoQuery(patient.hin));
  const birth = new Date(patient.dateOfBirth);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ProfileCard title="Patient" description="Contact details and this visit.">
        <dl className="flex flex-col">
          <InfoRow icon={<CalendarBlankIcon />} label="Date of birth">
            {formatDate(birth)} ({ageOn(birth, now)} years)
          </InfoRow>
          <InfoRow icon={<PhoneIcon />} label="Phone number">
            {patient.phone ?? "—"}
          </InfoRow>
          <InfoRow icon={<AtIcon />} label="Email address">
            {patient.email ?? "—"}
          </InfoRow>
          <InfoRow icon={<MapPinIcon />} label="Home address">
            {patient.address ?? "—"}
          </InfoRow>
          {visit.kind === "admission" && (
            <InfoRow icon={<BedIcon />} label="Ward · Bed">
              {[visit.ward, visit.bed && `Bed ${visit.bed}`].filter(Boolean).join(" · ") || "—"}
            </InfoRow>
          )}
          <InfoRow
            icon={<StethoscopeIcon />}
            label={visit.kind === "admission" ? "Admitted" : "Checked in"}
          >
            {visit.startedAt ? formatDateCommaTime(new Date(visit.startedAt)) : "—"}
          </InfoRow>
          {visit.requestedBy && (
            <InfoRow icon={<StethoscopeIcon />} label="Admission requested by">
              {visit.requestedBy}
            </InfoRow>
          )}
        </dl>
      </ProfileCard>

      <div className="flex flex-col gap-6">
        <ProfileCard
          title="Latest vitals"
          description={
            info?.latestVitals
              ? `Recorded ${formatDateCommaTime(new Date(info.latestVitals.at))}`
              : "As recorded at the hospital."
          }
        >
          {isError ? (
            <p className="py-2 type-body-sm-regular text-fg-caption">
              We couldn’t load the vitals. Try again in a moment.
            </p>
          ) : !info ? (
            <CardSkeleton lines={3} />
          ) : !info.latestVitals || info.latestVitals.readings.length === 0 ? (
            <p className="py-2 type-body-sm-regular text-fg-caption">No vitals recorded.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-2 sm:grid-cols-3">
              {info.latestVitals.readings.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="type-caption text-fg-caption">{label}</dt>
                  <dd className="type-body-sm-medium text-fg-heading">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </ProfileCard>

        <ProfileCard title="Ongoing medication" description="Drugs the patient is currently on.">
          {!info ? (
            <CardSkeleton lines={3} />
          ) : info.ongoingDrugs.length === 0 ? (
            <p className="py-2 type-body-sm-regular text-fg-caption">No ongoing medication.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {info.ongoingDrugs.map((drug) => (
                <li
                  key={`${drug.name}-${drug.dose}-${drug.frequency}`}
                  className="flex flex-col py-2.5"
                >
                  <span className="type-body-sm-medium text-fg-heading">
                    {drug.name} {drug.dose && `· ${drug.dose}`}
                  </span>
                  <span className="type-caption text-fg-caption">
                    {[drug.route, drug.frequency, drug.duration && `for ${drug.duration}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}

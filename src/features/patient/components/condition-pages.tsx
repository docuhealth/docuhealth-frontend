import {
  BookOpenIcon,
  FirstAidKitIcon,
  HammerIcon,
  HeartIcon,
  PlusIcon,
  ScanIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { visitsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/patient-shell";
import {
  DetailRows,
  RecordList,
  RecordRow,
  ReportChange,
  Segments,
  SectionLabel,
} from "@/features/patient/components/patient-ui";
import { conditionsOf, orderStatusLabel, scansOf } from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";
import { formatDate } from "@/lib/format";

/** A page's "nothing here": a round icon, a title and a line. */
export function PatientEmpty({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-16 place-content-center rounded-full bg-line text-fg-caption [&_svg]:size-7">
        {icon}
      </span>
      <p className="type-title-sm text-fg-heading">{title}</p>
      <p className="max-w-110 type-body-sm-regular text-fg-caption">{description}</p>
    </div>
  );
}

function useVisits() {
  const { hin } = usePatient();
  return useQuery(visitsQuery(hin));
}

const dated = (at: string) => formatDate(new Date(at));

/**
 * Diagnoses from the patient's visits. TODO(api): conditions have no status, so the latest
 * visit's diagnosis counts as active and earlier ones as past.
 */
export function ConditionsPage() {
  const { data, isError } = useVisits();
  const [tab, setTab] = useState<"active" | "past">("active");
  const conditions = data ? conditionsOf(data) : [];
  const active = conditions.filter((condition) => condition.active);
  const past = conditions.filter((condition) => !condition.active);
  const shown = tab === "active" ? active : past;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Conditions"
        subtitle={data ? `${active.length} active · ${past.length} past` : null}
      />
      <Segments
        label="Conditions"
        value={tab}
        onChange={setTab}
        options={[
          { value: "active", label: `Active (${active.length})` },
          { value: "past", label: `Past (${past.length})` },
        ]}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<BookOpenIcon />}
          title="No conditions recorded"
          description="When a doctor records a diagnosis at a connected facility, you’ll see it here with the date and who recorded it."
        />
      ) : (
        <RecordList label="Conditions">
          {shown.map((condition) => (
            <RecordRow
              key={condition.id}
              icon={<FirstAidKitIcon />}
              title={condition.name}
              detail={dated(condition.at)}
              meta={[condition.facility, condition.clinician].filter(Boolean).join(" · ")}
              status={
                <StatusPill tone={condition.active ? "error" : "success"}>
                  {condition.active ? "Active" : "Resolved"}
                </StatusPill>
              }
              to="/patient/health/conditions/$conditionId"
              params={{ conditionId: condition.id }}
            />
          ))}
        </RecordList>
      )}
      <ReportChange />
    </div>
  );
}

/** One diagnosis: when and where it was recorded, by whom, and at which visit. */
export function ConditionDetails({ conditionId }: { conditionId: string }) {
  const { data } = useVisits();
  const visit = data?.find((candidate) => candidate.id === conditionId);
  const condition = data ? conditionsOf(data).find((c) => c.id === conditionId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="View details"
        back={{ to: "/patient/health/conditions", label: "Back to Conditions" }}
      />
      {!data ? (
        <ListSkeleton />
      ) : !condition || !visit ? (
        <PatientEmpty
          icon={<BookOpenIcon />}
          title="Condition not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3">
            <p className="type-title-sm text-fg-heading">{condition.name}</p>
            <StatusPill tone={condition.active ? "success" : "neutral"}>
              {condition.active ? "Active" : "Resolved"}
            </StatusPill>
          </div>
          {/* TODO(api): no plain-language explanation of a diagnosis yet. */}
          <div className="rounded-xl bg-info-100 px-4 py-3">
            <p className="type-body-sm-medium text-info-500">What this means</p>
            <p className="type-body-sm-regular text-fg-body">
              Ask your doctor to explain this diagnosis at your next visit.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <SectionLabel>Details</SectionLabel>
              <DetailRows
                rows={[
                  ["Diagnosed", dated(visit.at)],
                  ["Facility", visit.facility],
                  ["Clinician", visit.clinician?.name],
                  ["Visit", visit.complaint],
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>Related</SectionLabel>
              {visit.drugs.length ? (
                <RecordList label="Related">
                  {visit.drugs.map((drug) => (
                    <RecordRow key={drug.name} title={drug.name} detail="Medication" />
                  ))}
                </RecordList>
              ) : (
                <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
                  Nothing else recorded with this diagnosis.
                </p>
              )}
            </div>
          </div>
        </>
      )}
      <ReportChange />
    </div>
  );
}

/** TODO(api): no allergy records for patients yet, so this is always the empty state. */
export function AllergiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Allergies" subtitle="No allergies recorded" />
      <PatientEmpty
        icon={<WarningCircleIcon />}
        title="No allergies recorded"
        description="Allergies your facilities record will show here once DocuHealth can share them with you."
      />
    </div>
  );
}

/** TODO(api): care plans can't be read by patients yet, so this is always the empty state. */
export function CarePlansPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Care plans" subtitle="No care plans yet" />
      <PatientEmpty
        icon={
          <span className="relative">
            <HeartIcon />
            <PlusIcon className="absolute inset-0 m-auto size-3!" />
          </span>
        }
        title="No care plans yet"
        description="Any care plans created by your healthcare team will appear here."
      />
    </div>
  );
}

/**
 * Scans ordered at the patient's visits, by facility. TODO(api): no report status, images or
 * report text for patients; a scan shows what was ordered and where.
 */
export function ScanResultsPage() {
  const { data, isError } = useVisits();
  const scans = data ? scansOf(data) : [];
  const facilities = [...new Set(scans.map((scan) => scan.facility).filter(Boolean))] as string[];
  const [facility, setFacility] = useState<string | null>(null);
  const shown = facility ? scans.filter((scan) => scan.facility === facility) : scans;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Scan results"
        subtitle={data ? (scans.length ? `${scans.length} scans` : "No scans yet") : null}
      />
      <div className="flex flex-wrap gap-2">
        {[null, ...facilities].map((name) => (
          <button
            key={name ?? "all"}
            type="button"
            onClick={() => setFacility(name)}
            aria-pressed={facility === name}
            className={
              facility === name
                ? "rounded-full bg-fg-heading px-4 py-2 type-body-sm-medium text-white"
                : "rounded-full bg-card px-4 py-2 type-body-sm-regular text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
            }
          >
            {name ?? "All facilities"}
          </button>
        ))}
      </div>
      {!data && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="No scan results yet!"
          description="Your imaging and scan results will appear here once they’re available."
        />
      ) : (
        <RecordList label="Scan results">
          {shown.map((scan) => (
            <RecordRow
              key={scan.id}
              title={scan.name}
              detail={[dated(scan.at), scan.facility].filter(Boolean).join(" · ")}
              status={
                scan.status && <StatusPill tone="info">{orderStatusLabel(scan.status)}</StatusPill>
              }
              to="/patient/health/scans/$scanId"
              params={{ scanId: scan.id }}
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}

/** One scan: what was ordered, where, by whom. TODO(api): images and the report aren't shared. */
export function ScanDetails({ scanId }: { scanId: string }) {
  const { data } = useVisits();
  const scan = data ? scansOf(data).find((candidate) => candidate.id === scanId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Scan details"
        back={{ to: "/patient/health/scans", label: "Back to Scan Results" }}
      />
      {!data ? (
        <ListSkeleton />
      ) : !scan ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="Scan not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="type-title text-fg-heading">{scan.name}</p>
            <p className="type-caption text-fg-caption">
              {[dated(scan.at), scan.facility].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-xl border bg-card p-5">
              <p className="type-body-sm-medium text-fg-heading">Report</p>
              <p className="mt-2 rounded-lg bg-info-100 px-3 py-2 type-body-sm-regular text-info-500">
                Images and the radiologist’s report will show here once they’re shared with you.
                Your doctor will go through them with you.
              </p>
            </div>
            <DetailRows
              rows={[
                ["Scan", scan.name],
                ["Ordered by", scan.orderedBy],
                ["Facility", scan.facility],
                ["Ordered", dated(scan.at)],
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** A section whose screens aren't built yet. */
export function PatientComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={title} />
      <PatientEmpty
        icon={<HammerIcon />}
        title="This section is on its way"
        description="It will appear here once its design is ready."
      />
    </div>
  );
}

import {
  CaretRightIcon,
  ChartBarIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  DnaIcon,
  DropIcon,
  FileTextIcon,
  FlaskIcon,
  HeartbeatIcon,
  HospitalIcon,
  ListChecksIcon,
  MagnifyingGlassIcon,
  PillIcon,
  ScanIcon,
  StethoscopeIcon,
  SyringeIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, type LinkProps } from "@tanstack/react-router";
import { type ComponentType, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { appointmentsQuery, drugsQuery, visitsQuery } from "@/features/patient/api/queries";
import { PageHeading } from "@/features/patient/components/patient-shell";
import { conditionsOf, facilitiesOf, latestVitals, scansOf } from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";
import { formatDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const notYet = (what: string) => () => toast.info(`${what} isn’t available yet.`);

type RecordCard = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  /** The line under the label; null for "No record to display". */
  detail: string | null;
  to?: LinkProps["to"];
};

/** The patient's health: documents, facilities, a summary, and every kind of record. */
export function PatientHealth() {
  const { hin } = usePatient();
  const visits = useQuery(visitsQuery(hin)).data;
  const appointments = useQuery(appointmentsQuery()).data;
  const drugs = useQuery(drugsQuery()).data;
  const [search, setSearch] = useState("");

  const conditions = visits ? conditionsOf(visits) : [];
  const facilities = facilitiesOf(visits ?? [], appointments ?? []);
  const labCount = visits?.reduce((total, visit) => total + visit.labTests.length, 0) ?? 0;
  const scanCount = visits ? scansOf(visits).length : 0;
  const lastVitals = visits ? latestVitals(visits, (vitals) => vitals.at).latest : null;
  const current = drugs?.filter((drug) => drug.status === "ongoing").length ?? 0;
  const past = (drugs?.length ?? 0) - current;
  const activeConditions = conditions.filter((condition) => condition.active).length;

  const records: RecordCard[] = [
    {
      label: "Test results",
      icon: FlaskIcon,
      iconClass: "text-info-500",
      detail: labCount ? plural(labCount, "result") : null,
    },
    {
      label: "Scan results",
      icon: ScanIcon,
      iconClass: "text-info-500",
      detail: scanCount ? plural(scanCount, "report") : null,
      to: "/patient/health/scans",
    },
    {
      label: "Vital signs",
      icon: HeartbeatIcon,
      iconClass: "text-info-500",
      detail: lastVitals ? `Last: ${formatDate(new Date(lastVitals.at))}` : null,
      to: "/patient/health/vitals",
    },
    {
      label: "Medications",
      icon: PillIcon,
      iconClass: "text-success-500",
      detail: drugs?.length ? `${current} current · ${past} past` : null,
      to: "/patient/health/medications",
    },
    // TODO(api): no immunization records for patients yet.
    { label: "Immunizations", icon: SyringeIcon, iconClass: "text-success-500", detail: null },
    {
      label: "Diagnoses & conditions",
      icon: StethoscopeIcon,
      iconClass: "text-primary",
      detail: conditions.length
        ? `${activeConditions} active · ${conditions.length - activeConditions} past`
        : null,
      to: "/patient/health/conditions",
    },
    {
      label: "Allergies",
      icon: WarningIcon,
      iconClass: "text-error-500",
      detail: null,
      to: "/patient/health/allergies",
    },
    {
      label: "Care plans",
      icon: ListChecksIcon,
      iconClass: "text-primary",
      detail: null,
      to: "/patient/health/care-plans",
    },
    {
      label: "Visits",
      icon: ClipboardTextIcon,
      iconClass: "text-primary",
      detail: visits?.length ? plural(visits.length, "visit") : null,
      to: "/patient/health/visits",
    },
  ];
  const term = search.trim().toLowerCase();
  const shown = term
    ? records.filter((record) => record.label.toLowerCase().includes(term))
    : records;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Health" subtitle={hin ? `HIN · ${hin}` : null} />

      <div className="flex flex-col gap-3 md:flex-row">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border bg-card px-4">
          <MagnifyingGlassIcon className="size-4 text-fg-caption" />
          <span className="sr-only">Search your records</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your records"
            className="w-full bg-transparent type-body-sm-regular outline-none placeholder:text-fg-caption"
          />
        </label>
        <div className="grid grid-cols-2 gap-3 md:w-80">
          {/* TODO(design): Trends comes with the next batch of screens. */}
          <Button variant="outline" className="h-11 bg-card" onClick={notYet("Trends")}>
            <ChartBarIcon data-icon="inline-start" />
            Trends
          </Button>
          <Button variant="outline" className="h-11 bg-card" onClick={notYet("Timeline")}>
            <ClockCounterClockwiseIcon data-icon="inline-start" />
            Timeline
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopCard
          icon={<FileTextIcon className="size-6 text-info-500" />}
          iconClass="bg-info-100"
          title="Documents"
          // TODO(api): patients can't upload or list documents yet.
          detail="No files yet - upload reports, prescriptions or scans"
          action={
            <Button variant="outline" className="h-10 px-5" onClick={notYet("Uploading documents")}>
              Upload
            </Button>
          }
        />
        <TopCard
          icon={<HospitalIcon className="size-6 text-success-500" />}
          iconClass="bg-success-100"
          title="Healthcare facilities"
          detail={
            facilities.length
              ? `${facilities.length} connected · ${facilities.slice(0, 3).join(", ")}`
              : "No facilities connected yet"
          }
          action={
            <Button variant="outline" className="h-10 px-5" onClick={notYet("The facilities list")}>
              View all
            </Button>
          }
        />
      </div>

      <section aria-labelledby="summary-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-t-lg bg-card px-4 py-3">
          <h2 id="summary-heading" className="type-title-sm text-fg-heading">
            Health summary
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* TODO(api): blood group, genotype and allergies aren't in any patient endpoint. */}
          <SummaryTile icon={DropIcon} label="Blood group" value={null} />
          <SummaryTile icon={DnaIcon} label="Genotype" value={null} />
          <SummaryTile
            icon={FileTextIcon}
            label="Conditions"
            value={conditions.length ? `${activeConditions} Active` : null}
          />
          <SummaryTile icon={WarningIcon} label="Allergies" value={null} alert />
        </div>
      </section>

      <section aria-labelledby="records-heading" className="flex flex-col gap-3">
        <h2 id="records-heading" className="type-title-sm text-fg-heading">
          Your Records
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((record) => (
            <li key={record.label}>
              <RecordTile record={record} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TopCard({
  icon,
  iconClass,
  title,
  detail,
  action,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  detail: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <span className={cn("grid size-12 shrink-0 place-content-center rounded-lg", iconClass)}>
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="type-body-sm-medium text-fg-heading">{title}</p>
        <p className="truncate type-caption text-fg-caption">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  alert = false,
}: {
  icon: ComponentType<{ className?: string; weight?: "fill" }>;
  label: string;
  value: string | null;
  alert?: boolean;
}) {
  return (
    <div
      className={cn("flex items-center gap-3 rounded-lg p-4", alert ? "bg-error-100" : "bg-line")}
    >
      <Icon
        weight="fill"
        className={cn("size-5 shrink-0", alert ? "text-error-500" : "text-primary")}
      />
      <div className="flex min-w-0 flex-col">
        <p className="type-body-sm-medium text-fg-heading">{label}</p>
        <p className={cn("truncate type-caption", alert ? "text-error-500" : "text-primary")}>
          {value ?? "No record"}
        </p>
      </div>
    </div>
  );
}

function RecordTile({ record }: { record: RecordCard }) {
  const Icon = record.icon;
  const body = (
    <>
      <Icon className={cn("size-6 shrink-0", record.iconClass)} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-body-sm-medium text-fg-heading">{record.label}</span>
        <span className="truncate type-caption text-fg-caption">
          {record.detail ?? "No record to display"}
        </span>
      </span>
      <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
    </>
  );
  const className =
    "flex h-full items-center gap-3 rounded-xl border bg-card px-4 py-5 transition-colors";
  return record.to ? (
    <Link to={record.to} className={cn(className, "hover:border-primary/40")}>
      {body}
    </Link>
  ) : (
    <button
      type="button"
      onClick={notYet(record.label)}
      className={cn(className, "w-full text-left hover:border-fg-caption/40")}
    >
      {body}
    </button>
  );
}

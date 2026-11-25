import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import allergiesRecordIconUrl from "@/assets/svgs/allergies-record.svg";
import carePlansIconUrl from "@/assets/svgs/careplans.svg";
import diagnosisIconUrl from "@/assets/svgs/diagnosis.svg";
import documentsIconUrl from "@/assets/svgs/documents.svg";
import healthcareIconUrl from "@/assets/svgs/healthcare.svg";
import immunizationIconUrl from "@/assets/svgs/immunization.svg";
import labResultIconUrl from "@/assets/svgs/lab-result.svg";
import medicationIconUrl from "@/assets/svgs/medication-pill.svg";
import radiologyIconUrl from "@/assets/svgs/radiology.svg";
import visitsIconUrl from "@/assets/svgs/visits.svg";
import vitalSignsIconUrl from "@/assets/svgs/vital-signs.svg";
import { Button } from "@/components/ui/button";
import { allergiesQuery, carePlansQuery, healthProfileQuery } from "@/features/patient/api/pending";
import { appointmentsQuery, drugsQuery } from "@/features/patient/api/queries";
import { HealthSummary } from "@/features/patient/components/health-summary";
import { HealthToolbar } from "@/features/patient/components/health-toolbar";
import { HealthTopCard } from "@/features/patient/components/health-top-card";
import { PageHeading } from "@/features/patient/components/page-heading";
import { type RecordKind, RecordTile } from "@/features/patient/components/record-tile";
import { attentionItems } from "@/features/patient/lib/attention";
import { dated } from "@/features/patient/lib/dated";
import { notYet } from "@/features/patient/lib/not-yet";
import { conditionsOf, facilitiesOf, latestVitals, scansOf } from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";
import { useVisits } from "@/features/patient/lib/use-visits";
import { plural } from "@/lib/format";

/** The patient's health: documents, facilities, a summary, and every kind of record. */
export function PatientHealth() {
  const { hin } = usePatient();
  const visits = useVisits().data;
  const appointments = useQuery(appointmentsQuery()).data;
  const drugs = useQuery(drugsQuery()).data;
  // TODO(api): blood group, genotype, documents, immunizations, allergies and care plans are
  // pending records (api/pending.ts): demo data on the mock server, empty elsewhere.
  const profile = useQuery(healthProfileQuery()).data;
  const allergies = (useQuery(allergiesQuery()).data ?? []).filter((allergy) => allergy.active);
  const carePlans = useQuery(carePlansQuery()).data ?? [];
  const activePlans = carePlans.filter((plan) => plan.status === "active");
  const [search, setSearch] = useState("");

  const conditions = visits ? conditionsOf(visits) : [];
  const facilities = facilitiesOf(visits ?? [], appointments ?? []);
  const labCount = visits?.reduce((total, visit) => total + visit.labTests.length, 0) ?? 0;
  const newResults = visits
    ? (attentionItems(visits, []).find((item) => item.key === "results")?.newCount ?? 0)
    : 0;
  const scanCount = visits ? scansOf(visits).length : 0;
  const lastVitals = visits ? latestVitals(visits, (vitals) => vitals.at).latest : null;
  const current = drugs?.filter((drug) => drug.status === "ongoing").length ?? 0;
  const past = (drugs?.length ?? 0) - current;
  const activeConditions = conditions.filter((condition) => condition.active).length;

  const records: RecordKind[] = [
    {
      label: "Test results",
      icon: labResultIconUrl,
      detail: labCount ? plural(labCount, "result") : null,
      badge: newResults ? { label: `${newResults} new`, tone: "success" } : null,
    },
    {
      label: "Scan results",
      icon: radiologyIconUrl,
      detail: scanCount ? plural(scanCount, "report") : null,
      to: "/patient/health/scans",
    },
    {
      label: "Vital signs",
      icon: vitalSignsIconUrl,
      detail: lastVitals ? `Last: ${dated(lastVitals.at)}` : null,
      to: "/patient/health/vitals",
    },
    {
      label: "Medications",
      icon: medicationIconUrl,
      detail: drugs?.length ? `${current} current · ${past} past` : null,
      to: "/patient/health/medications",
    },
    {
      label: "Immunizations",
      icon: immunizationIconUrl,
      detail: profile?.immunizations.doses ? plural(profile.immunizations.doses, "dose") : null,
      badge: profile?.immunizations.due
        ? { label: `${profile.immunizations.due} due`, tone: "warning" }
        : null,
    },
    {
      label: "Diagnoses & conditions",
      icon: diagnosisIconUrl,
      detail: conditions.length
        ? `${activeConditions} active · ${conditions.length - activeConditions} past`
        : null,
      to: "/patient/health/conditions",
    },
    {
      label: "Allergies",
      icon: allergiesRecordIconUrl,
      detail: allergies.length ? `${allergies.length} recorded` : null,
      to: "/patient/health/allergies",
    },
    {
      label: "Care plans",
      icon: carePlansIconUrl,
      detail:
        activePlans.length === 1
          ? activePlans[0]!.name
          : carePlans.length
            ? `${activePlans.length} active · ${carePlans.length - activePlans.length} ended`
            : null,
      to: "/patient/health/care-plans",
    },
    {
      label: "Visits",
      icon: visitsIconUrl,
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
      <HealthToolbar search={search} onSearch={setSearch} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HealthTopCard
          icon={<img src={documentsIconUrl} alt="" className="size-5.5" />}
          iconClass="bg-info-100"
          title="Documents"
          // TODO(api): patients can't upload or list documents yet; the count is pending.
          detail={
            profile?.documents
              ? `${plural(profile.documents, "file")} · reports, prescriptions and scans`
              : "No files yet · upload reports, prescriptions or scans"
          }
          action={
            <Button variant="outline" className="h-10 px-5" onClick={notYet("Uploading documents")}>
              Upload
            </Button>
          }
        />
        <HealthTopCard
          icon={<img src={healthcareIconUrl} alt="" className="size-5.5" />}
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

      <HealthSummary
        bloodGroup={profile?.bloodGroup ?? null}
        genotype={profile?.genotype ?? null}
        activeConditions={activeConditions}
        allergies={
          allergies.length
            ? allergies.length === 1
              ? allergies[0]!.name
              : `${allergies[0]!.name}, +${allergies.length - 1} more`
            : null
        }
      />

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

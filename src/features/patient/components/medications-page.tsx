import { PillIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { medicationDetailsQuery } from "@/features/patient/api/pending";
import { drugsQuery } from "@/features/patient/api/queries";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { MedicationCard } from "@/features/patient/components/medication-card";
import {
  MedicationDialog,
  type MedicationView,
} from "@/features/patient/components/medication-dialog";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { Segments } from "@/features/patient/components/patient-ui";
import { detailFor, splitMedications } from "@/features/patient/lib/medications";

/** The patient's medicines: current (ongoing) and past, each with dispensing and prescription. */
export function MedicationsPage() {
  const { data, isError } = useQuery(drugsQuery());
  // TODO(api): prescriber, facility, pharmacy, refills, payment and instructions (pending).
  const { data: details = [] } = useQuery(medicationDetailsQuery());
  const [tab, setTab] = useState<"current" | "past">("current");
  const [open, setOpen] = useState<{ drug: DrugRecord; view: MedicationView } | null>(null);
  const { current, past } = splitMedications(data ?? []);
  const shown = tab === "current" ? current : past;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Medications"
        back={{ to: "/patient/health", label: "Back to Health" }}
        subtitle={
          !data
            ? null
            : data.length
              ? `${current.length} current · ${past.length} past`
              : "No medications yet"
        }
      />
      {data && data.length > 0 && (
        <Segments
          label="Medications"
          value={tab}
          onChange={setTab}
          options={[
            { value: "current", label: `Current (${current.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
        />
      )}
      {!data && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<PillIcon />}
          title={data?.length ? `No ${tab} medications` : "No medications yet"}
          description="Your prescribed medications will appear here once they’re added to your record."
        />
      ) : (
        <ul aria-label="Medications" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shown.map((drug) => (
            <MedicationCard
              key={drug.id}
              drug={drug}
              detail={detailFor(details, drug)}
              onOpen={(view) => setOpen({ drug, view })}
            />
          ))}
        </ul>
      )}
      <MedicationDialog
        open={open && { ...open, detail: detailFor(details, open.drug) }}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}

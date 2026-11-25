import {
  CalendarBlankIcon,
  ClipboardTextIcon,
  FlaskIcon,
  HeartbeatIcon,
  NoteIcon,
  PillIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appointmentsQuery, drugsQuery, visitsQuery } from "@/features/patient/api/queries";
import type { DrugRecord, Vitals } from "@/features/patient/api/schemas";
import { PatientEmpty } from "@/features/patient/components/condition-pages";
import { PageHeading } from "@/features/patient/components/page-heading";
import {
  DetailRows,
  RecordList,
  RecordRow,
  SectionLabel,
  Segments,
} from "@/features/patient/components/patient-ui";
import { bloodPressureNote, bmiNote } from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";
import { formatAppointment, formatDate } from "@/lib/format";

const dated = (at: string) => formatDate(new Date(at));

/**
 * Upcoming appointments and past visits (one per visit summary). TODO(api): no visit type
 * (outpatient, admission, emergency), so the design's type filter isn't offered.
 */
export function VisitsPage() {
  const { hin } = usePatient();
  const visits = useQuery(visitsQuery(hin));
  const appointments = useQuery(appointmentsQuery());
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  // When the page opened: what counts as still to come.
  const [now] = useState(() => new Date());
  const upcoming = (appointments.data ?? []).filter(
    (a) => new Date(a.at) >= now && a.status !== "cancelled" && a.status !== "completed",
  );
  const past = visits.data ?? [];
  const loading =
    (!visits.data && !visits.isError) || (!appointments.data && !appointments.isError);
  const nothing = !loading && upcoming.length === 0 && past.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Visits"
        subtitle={
          loading
            ? null
            : nothing
              ? "No visits yet"
              : `${upcoming.length} upcoming · ${past.length} past`
        }
      />
      {!nothing && (
        <Segments
          label="Visits"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: `Upcoming (${upcoming.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
        />
      )}
      {loading ? (
        <ListSkeleton />
      ) : nothing ? (
        <PatientEmpty
          icon={<CalendarBlankIcon />}
          title="No visits yet"
          description="Your visits will show here after you are seen at a connected facility."
        />
      ) : tab === "upcoming" ? (
        upcoming.length ? (
          <RecordList label="Upcoming visits">
            {upcoming.map((appointment) => (
              <RecordRow
                key={appointment.id}
                title={
                  [appointment.type, appointment.clinician?.specialty]
                    .filter(Boolean)
                    .join(" · ") || "Appointment"
                }
                detail={[formatAppointment(new Date(appointment.at)), appointment.facility]
                  .filter(Boolean)
                  .join(" · ")}
                status={<StatusPill tone="info">Booked</StatusPill>}
              />
            ))}
          </RecordList>
        ) : (
          <PatientEmpty
            icon={<CalendarBlankIcon />}
            title="Nothing booked"
            description="Your next visit will show here once it’s booked."
          />
        )
      ) : past.length ? (
        <RecordList label="Past visits">
          {past.map((visit) => (
            <RecordRow
              key={visit.id}
              title={visit.complaint ?? "Visit"}
              detail={[dated(visit.at), visit.facility, visit.clinician?.name]
                .filter(Boolean)
                .join(" · ")}
              status={<StatusPill tone="neutral">Summary</StatusPill>}
              to="/patient/health/visits/$visitId"
              params={{ visitId: visit.id }}
            />
          ))}
        </RecordList>
      ) : (
        <PatientEmpty
          icon={<ClipboardTextIcon />}
          title="No past visits"
          description="Your visits will show here after you are seen at a connected facility."
        />
      )}
    </div>
  );
}

/** One visit's summary: why they came, the doctor's note, and what came of it. */
export function VisitSummaryPage({ visitId }: { visitId: string }) {
  const { hin } = usePatient();
  const { data } = useQuery(visitsQuery(hin));
  const visit = data?.find((candidate) => candidate.id === visitId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Visit summary"
        back={{ to: "/patient/health/visits", label: "Back to Visits" }}
      />
      {!data ? (
        <ListSkeleton />
      ) : !visit ? (
        <PatientEmpty
          icon={<ClipboardTextIcon />}
          title="Visit not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="type-title text-fg-heading">{visit.complaint ?? "Visit"}</p>
            <p className="type-caption text-fg-caption">
              {[formatAppointment(new Date(visit.at)), visit.facility, visit.clinician?.name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border bg-card p-4">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 type-caption-semibold text-white">
                  <StethoscopeIcon className="size-3.5" />
                  Reason
                </span>
                <p className="mt-3 type-body-sm-regular text-fg-body">{visit.complaint ?? "—"}</p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <span className="inline-flex items-center gap-1 rounded-md bg-success-500 px-2 py-0.5 type-caption-semibold text-white">
                  <NoteIcon className="size-3.5" />
                  Diagnosis
                </span>
                <p className="mt-3 type-body-sm-regular text-fg-body">{visit.diagnosis ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>From this visit</SectionLabel>
              {visit.labTests.length + visit.drugs.length === 0 && !visit.vitals ? (
                <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
                  Nothing else was recorded.
                </p>
              ) : (
                <RecordList label="From this visit">
                  {visit.labTests.map((test) => (
                    <RecordRow
                      key={`lab-${test.name}`}
                      icon={<FlaskIcon />}
                      title={test.name}
                      detail="Lab test"
                    />
                  ))}
                  {visit.drugs.map((drug) => (
                    <RecordRow
                      key={`drug-${drug.name}`}
                      icon={<PillIcon />}
                      title={drug.name}
                      detail="Medication"
                    />
                  ))}
                  {visit.vitals && (
                    <RecordRow
                      icon={<HeartbeatIcon />}
                      title="Vital signs"
                      detail={[
                        visit.vitals.bloodPressure && `BP ${visit.vitals.bloodPressure}`,
                        visit.vitals.heartRate != null && `Pulse ${visit.vitals.heartRate}`,
                        visit.vitals.weight != null && `${visit.vitals.weight} kg`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      to="/patient/health/vitals"
                    />
                  )}
                </RecordList>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const vitalTiles: {
  label: string;
  unit: string;
  read: (vitals: Vitals) => number | string | null;
}[] = [
  { label: "Blood pressure", unit: "mmHg", read: (v) => v.bloodPressure },
  { label: "Pulse", unit: "bpm", read: (v) => v.heartRate },
  { label: "Temperature", unit: "°C", read: (v) => v.temperature },
  { label: "Weight", unit: "kg", read: (v) => v.weight },
  { label: "BMI", unit: "kg/m²", read: (v) => v.bmi },
];

/** The newest reading of each vital sign, and earlier sets by visit. */
export function VitalSignsPage() {
  const { hin } = usePatient();
  const { data, isError } = useQuery(visitsQuery(hin));
  const withVitals = (data ?? []).filter((visit) => visit.vitals);
  const latest = withVitals[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Vital signs"
        subtitle={
          !data
            ? null
            : latest
              ? `Last recorded ${dated(latest.vitals!.at)}${latest.facility ? ` · ${latest.facility}` : ""}`
              : "No readings yet"
        }
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !latest ? (
        <PatientEmpty
          icon={<HeartbeatIcon />}
          title="No vital signs yet"
          description="Your blood pressure, pulse, weight and other readings will show here after a nurse records them at a connected facility."
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {vitalTiles.map((tile) => {
              const value = tile.read(latest.vitals!);
              const note =
                tile.label === "Blood pressure"
                  ? bloodPressureNote(latest.vitals!.bloodPressure)
                  : tile.label === "BMI"
                    ? bmiNote(latest.vitals!.bmi)
                    : null;
              return (
                <li key={tile.label} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                  <span className="type-caption text-fg-caption">{tile.label}</span>
                  <p className="type-title-lg text-fg-heading">
                    {value ?? "-"} <span className="type-caption text-fg-caption">{tile.unit}</span>
                  </p>
                  {note && (
                    <span
                      className={
                        note.tone === "good"
                          ? "type-caption text-success-500"
                          : "type-caption text-warning-500"
                      }
                    >
                      • {note.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {withVitals.length > 1 && (
            <>
              <SectionLabel>Earlier readings</SectionLabel>
              <RecordList label="Earlier readings">
                {withVitals.slice(1).map((visit) => (
                  <RecordRow
                    key={visit.id}
                    title={dated(visit.vitals!.at)}
                    detail={[
                      visit.facility,
                      visit.vitals!.bloodPressure && `BP ${visit.vitals!.bloodPressure}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    to="/patient/health/visits/$visitId"
                    params={{ visitId: visit.id }}
                  />
                ))}
              </RecordList>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** The patient's drug records: current (ongoing) and past, with dispensing and prescription. */
export function MedicationsPage() {
  const { data, isError } = useQuery(drugsQuery());
  const [tab, setTab] = useState<"current" | "past">("current");
  const [open, setOpen] = useState<{
    drug: DrugRecord;
    view: "dispensing" | "prescription";
  } | null>(null);
  const current = (data ?? []).filter((drug) => drug.status === "ongoing");
  const past = (data ?? []).filter((drug) => drug.status !== "ongoing");
  const shown = tab === "current" ? current : past;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Medications"
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
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shown.map((drug) => (
            <li key={drug.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-content-center rounded-md bg-line text-primary">
                  <PillIcon className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="type-body-sm-medium text-fg-heading">{drug.name}</p>
                  <p className="type-caption text-fg-caption">{drug.how || "—"}</p>
                </div>
                <StatusPill tone={drug.status === "ongoing" ? "success" : "neutral"}>
                  {drug.status === "ongoing"
                    ? "Active"
                    : drug.status === "stopped"
                      ? "Stopped"
                      : "Completed"}
                </StatusPill>
              </div>
              <div className="grid grid-cols-2 gap-3 border-y py-3">
                {/* TODO(api): drug records don't say who prescribed them or where. */}
                <div>
                  <p className="type-caption text-fg-caption">Prescribed</p>
                  <p className="type-body-sm-regular text-fg-heading">{dated(drug.at)}</p>
                </div>
                <div>
                  <p className="type-caption text-fg-caption">Quantity</p>
                  <p className="type-body-sm-regular text-fg-heading">{drug.quantity ?? "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => setOpen({ drug, view: "dispensing" })}
                >
                  Dispensing info
                </Button>
                <Button className="h-10" onClick={() => setOpen({ drug, view: "prescription" })}>
                  Prescription
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!open} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        {open && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {open.view === "dispensing" ? "Dispensing info" : "Prescription"}
              </DialogTitle>
              <DialogDescription>
                {open.view === "dispensing"
                  ? `What the pharmacy recorded for ${open.drug.name}.`
                  : `Your prescription for ${open.drug.name}.`}
              </DialogDescription>
            </DialogHeader>
            <DetailRows
              rows={
                open.view === "dispensing"
                  ? [
                      [
                        "Status",
                        open.drug.dispensing ? open.drug.dispensing.replaceAll("_", " ") : "—",
                      ],
                      [
                        "Dispensed on",
                        open.drug.dispensedAt
                          ? formatAppointment(new Date(open.drug.dispensedAt))
                          : "—",
                      ],
                      ["Quantity", open.drug.quantity],
                    ]
                  : [
                      ["Medicine", open.drug.name],
                      ["How to take it", open.drug.how || "—"],
                      ["Quantity", open.drug.quantity],
                      ["Started", dated(open.drug.at)],
                      ["Duration", open.drug.duration],
                    ]
              }
            />
            <Button variant="outline" className="h-11 w-full" onClick={() => setOpen(null)}>
              Done
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

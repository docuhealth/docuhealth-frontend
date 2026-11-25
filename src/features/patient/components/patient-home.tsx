import {
  CalendarBlankIcon,
  CaretRightIcon,
  CheckCircleIcon,
  DropIcon,
  FlaskIcon,
  HeartbeatIcon,
  PillIcon,
  ReceiptIcon,
  ScalesIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { Button } from "@/components/ui/button";
import { appointmentsQuery, drugsQuery, visitsQuery } from "@/features/patient/api/queries";
import type { Appointment, VisitSummary } from "@/features/patient/api/schemas";
import { PageHeading } from "@/features/patient/components/patient-shell";
import {
  bloodPressureNote,
  bmiNote,
  latestVitals,
  nextAppointment,
  orderStatusLabel,
} from "@/features/patient/lib/records";
import { usePatient } from "@/features/patient/lib/use-patient";
import { formatDate, formatDayAndTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const notYet = (what: string) => () => toast.info(`${what} isn’t available yet.`);

/** The patient's home: their next appointment, what needs attention, and a health snapshot. */
export function PatientHome() {
  const { firstName, hin } = usePatient();
  const visits = useQuery(visitsQuery(hin));
  const appointments = useQuery(appointmentsQuery());
  const drugs = useQuery(drugsQuery());

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
      <PageHeading title={`Welcome, ${firstName}`} subtitle={hin ? `HIN · ${hin}` : null} />
      <div className="flex min-w-0 flex-col gap-6">
        <UpcomingAppointment
          appointment={appointments.data ? nextAppointment(appointments.data) : undefined}
        />
        <NeedsAttention
          loading={!visits.data && !visits.isError}
          labTests={visits.data?.[0]?.labTests ?? []}
          labAt={visits.data?.[0]?.at ?? null}
          drugs={drugs.data ?? []}
        />
      </div>
      <HealthSnapshot visits={visits.data} />
    </div>
  );
}

function UpcomingAppointment({ appointment }: { appointment: Appointment | null | undefined }) {
  const when = appointment ? formatDayAndTime(new Date(appointment.at)) : null;
  return (
    <section
      aria-label="Upcoming appointment"
      className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 type-caption text-white/80">
          <CalendarBlankIcon className="size-4" />
          Upcoming Appointment
        </p>
        {when && (
          <span className="rounded-full bg-warning-500 px-3 py-0.5 type-caption-semibold text-fg-heading">
            {when.day}
          </span>
        )}
      </div>
      {appointment === undefined ? (
        <div className="relative mt-4 h-24 animate-pulse rounded-lg bg-white/10" />
      ) : appointment ? (
        <div className="relative mt-3 flex flex-col gap-5">
          <p className="type-accent-h1 text-white">{when?.time}</p>
          <div className="flex items-center gap-3">
            <PersonAvatar name={appointment.clinician?.name ?? "DocuHealth"} src={null} size="sm" />
            <div className="flex flex-col">
              <span className="type-body-sm-medium">{appointment.clinician?.name ?? "—"}</span>
              <span className="type-caption text-white/70">
                {[appointment.clinician?.specialty, appointment.facility]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-10 bg-card px-5 text-fg-heading"
              onClick={notYet("Appointment details")}
            >
              View details
              <CaretRightIcon data-icon="inline-end" />
            </Button>
            {/* TODO(api): patients can't reschedule yet. */}
            <Button
              variant="outline"
              className="h-10 border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white"
              onClick={notYet("Rescheduling")}
            >
              Reschedule
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative mt-3 flex flex-col gap-4">
          <p className="type-accent-h1 text-white">Nothing booked</p>
          <p className="type-body-sm-regular text-white/80">
            Need to see a doctor? Book a visit in minutes.
          </p>
          {/* TODO(api): patients can't book yet. */}
          <Button
            variant="outline"
            className="h-10 w-full max-w-66 bg-card text-primary"
            onClick={notYet("Booking")}
          >
            <CalendarBlankIcon data-icon="inline-start" />
            Book Appointment
          </Button>
        </div>
      )}
    </section>
  );
}

type AttentionKey = "results" | "medications" | "bill" | "prescription";

function NeedsAttention({
  loading,
  labTests,
  labAt,
  drugs,
}: {
  loading: boolean;
  labTests: { name: string; status: string | null }[];
  labAt: string | null;
  drugs: { id: string; name: string; status: string | null; at: string }[];
}) {
  const current = drugs.filter((drug) => drug.status === "ongoing");
  const newest = drugs[0];
  const items: { key: AttentionKey; label: string; value: string; icon: typeof FlaskIcon }[] = [
    ...(labTests.length
      ? [
          {
            key: "results" as const,
            label: "Recent Results",
            value: labTests[0]!.name,
            icon: FlaskIcon,
          },
        ]
      : []),
    ...(current.length
      ? [
          {
            key: "medications" as const,
            label: "Medications",
            value: current[0]!.name,
            icon: PillIcon,
          },
        ]
      : []),
    ...(newest
      ? [
          {
            key: "prescription" as const,
            label: "New Prescription",
            value: newest.name,
            icon: ReceiptIcon,
          },
        ]
      : []),
  ];
  const [chosen, setChosen] = useState<AttentionKey | null>(null);
  const selected = items.find((item) => item.key === chosen) ?? items[0];

  return (
    <section aria-labelledby="attention-heading" className="flex flex-col gap-4">
      <h2 id="attention-heading" className="type-title-sm text-fg-heading">
        Needs Your Attention
      </h2>
      {loading ? (
        <CardSkeleton lines={4} className="rounded-xl border bg-card p-6" />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center">
          <span className="grid size-16 place-content-center rounded-full bg-success-100">
            <CheckCircleIcon weight="fill" className="size-10 text-success-500" />
          </span>
          <p className="type-title-sm text-fg-heading">You’re all caught up</p>
          <p className="max-w-80 type-body-sm-regular text-fg-caption">
            New results, medications and bills will show up here as soon as a facility shares them.
          </p>
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Needs your attention"
            className="flex gap-3 overflow-x-auto"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const active = item.key === selected?.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setChosen(item.key)}
                  className={cn(
                    "flex min-w-40 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors",
                    active ? "border-primary" : "hover:border-fg-caption/40",
                  )}
                >
                  <Icon className="size-5 shrink-0 text-fg-body" />
                  <span className="flex min-w-0 flex-col">
                    <span className="type-caption text-fg-caption">{item.label}</span>
                    <span className="truncate type-caption-medium text-fg-heading">
                      {item.value}
                    </span>
                  </span>
                </button>
              );
            })}
            {/* TODO(api): no billing for patients yet. */}
            <div className="flex min-w-40 items-center gap-2 rounded-lg border border-dashed bg-card px-3 py-2">
              <ReceiptIcon className="size-5 shrink-0 text-fg-caption" />
              <span className="flex flex-col">
                <span className="type-caption text-fg-caption">Outstanding bill</span>
                <span className="type-caption-medium text-fg-caption">Not available yet</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            {selected?.key === "results" ? (
              <>
                <p className="type-title-sm text-fg-heading">Recent results</p>
                <p className="type-caption text-fg-caption">
                  {labAt ? `From your visit on ${formatDate(new Date(labAt))}` : ""}
                </p>
                <ul className="mt-3 flex flex-col divide-y">
                  {labTests.map((test) => (
                    <li key={test.name} className="flex items-center justify-between gap-3 py-3">
                      <span className="type-body-sm-regular text-fg-heading">{test.name}</span>
                      {/* TODO(api): no result values for patients yet. */}
                      <span className="type-caption text-fg-caption">
                        {orderStatusLabel(test.status) ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="type-title-sm text-fg-heading">
                  {selected?.key === "medications" ? "Current medications" : "Latest prescription"}
                </p>
                <ul className="mt-3 flex flex-col divide-y">
                  {(selected?.key === "medications" ? current : drugs.slice(0, 1)).map((drug) => (
                    <li key={drug.id} className="flex items-center justify-between gap-3 py-3">
                      <span className="type-body-sm-regular text-fg-heading">{drug.name}</span>
                      <span className="type-caption text-fg-caption">
                        {formatDate(new Date(drug.at))}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function SnapshotCard({
  icon,
  label,
  value,
  unit,
  at,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit: string;
  at: string | null;
  note: { label: string; tone: "good" | "watch" } | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 type-caption text-fg-caption [&_svg]:size-4">
          {icon}
          {label}
        </span>
        <span className="type-caption text-fg-caption">
          {at ? formatDate(new Date(at)).slice(0, 6) : "-"}
        </span>
      </div>
      <p className="type-title-lg text-fg-heading">
        {value ?? "-"} <span className="type-caption text-fg-caption">{unit}</span>
      </p>
      <p
        className={cn(
          "flex items-center gap-1.5 type-caption",
          note?.tone === "good"
            ? "text-success-500"
            : note
              ? "text-warning-500"
              : "text-fg-caption",
        )}
      >
        {note?.tone === "good" ? (
          <CheckCircleIcon weight="fill" className="size-4" />
        ) : note ? (
          <WarningCircleIcon weight="fill" className="size-4" />
        ) : (
          <span className="size-3.5 rounded-full border" />
        )}
        {note?.label ?? "No reading yet"}
      </p>
    </div>
  );
}

function HealthSnapshot({ visits }: { visits: VisitSummary[] | undefined }) {
  if (!visits) {
    return <CardSkeleton lines={8} className="rounded-xl border bg-card p-5" />;
  }
  const pressure = latestVitals(visits, (vitals) => vitals.bloodPressure).latest;
  const weight = latestVitals(visits, (vitals) => vitals.weight);
  const bmi = latestVitals(visits, (vitals) => vitals.bmi).latest;
  const weightChange =
    weight.latest?.weight != null && weight.previous?.weight != null
      ? Math.round((weight.latest.weight - weight.previous.weight) * 10) / 10
      : null;

  return (
    <section
      aria-labelledby="snapshot-heading"
      className="flex flex-col gap-4 self-start rounded-xl border bg-card p-5"
    >
      <h2 id="snapshot-heading" className="border-b pb-3 type-title-sm text-fg-heading">
        Health Snapshot
      </h2>
      <SnapshotCard
        icon={<HeartbeatIcon className="text-success-500" />}
        label="Blood pressure"
        value={pressure?.bloodPressure ?? null}
        unit="mmHg"
        at={pressure?.at ?? null}
        note={bloodPressureNote(pressure?.bloodPressure ?? null)}
      />
      <SnapshotCard
        icon={<ScalesIcon className="text-info-500" />}
        label="Weight"
        value={weight.latest?.weight != null ? String(weight.latest.weight) : null}
        unit="kg"
        at={weight.latest?.at ?? null}
        note={
          weightChange != null && weight.previous
            ? {
                label: `${weightChange > 0 ? "+" : ""}${weightChange}kg since ${formatDate(new Date(weight.previous.at)).slice(0, 6)}`,
                tone: "good",
              }
            : null
        }
      />
      <SnapshotCard
        icon={<DropIcon className="text-warning-500" />}
        label="BMI"
        value={bmi?.bmi != null ? String(bmi.bmi) : null}
        unit="kg/m²"
        at={bmi?.at ?? null}
        note={bmiNote(bmi?.bmi ?? null)}
      />
      {/* TODO(api): blood glucose isn't one of the vital signs the API records. */}
      <SnapshotCard
        icon={<DropIcon className="text-error-500" />}
        label="Blood glucose"
        value={null}
        unit="mmol/L"
        at={null}
        note={null}
      />
    </section>
  );
}

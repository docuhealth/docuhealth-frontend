import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { PersonCell } from "@/components/dashboard/dashboard-table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { VitalsFields } from "@/components/dashboard/vitals-fields";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useProcessVitalsRequest } from "@/features/nurse/api/mutations";
import {
  ADMISSIONS_PAGE_SIZE,
  admissionsQuery,
  VITALS_REQUESTS_PAGE_SIZE,
  vitalsRequestsQuery,
} from "@/features/nurse/api/queries";
import type { VitalsRequest } from "@/features/nurse/api/schemas";
import { type VitalsRequestValues, vitalsRequestSchema } from "@/features/nurse/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatDayAndTime, greetingFor, maskHin } from "@/lib/format";
import { emptyVitals } from "@/lib/vitals-form";

/** The nurse's home page: vitals the doctors have asked for, and who's admitted. */
export function NurseOverview({ firstName }: { firstName: string }) {
  // When the page opened; the greeting doesn't need to tick over while it stays open.
  const [now] = useState(() => new Date());
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">
          {greetingFor(now)}, {firstName}!
        </h1>
        <p className="type-body-sm-regular text-fg-caption">
          Vitals the doctors have asked for, and the patients admitted now.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <VitalsRequestsCard now={now} />
        <AdmittedCard now={now} />
      </div>
    </div>
  );
}

function VitalsRequestsCard({ now }: { now: Date }) {
  const [page, setPage] = useState(1);
  const [taking, setTaking] = useState<VitalsRequest | null>(null);
  const { data, isError } = useQuery(vitalsRequestsQuery("", page));

  const empty = isError
    ? "We couldn’t load the vitals requests. Try again in a moment."
    : data?.items.length === 0 && "No vitals requests waiting.";

  return (
    <DashboardCard title={`Vitals requests${data ? ` (${data.total})` : ""}`}>
      {empty || !data ? (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          {empty || "Loading…"}
        </p>
      ) : (
        <ul aria-label="Vitals requests" className="mt-3 border-t">
          {data.items.map((request) => {
            const { day, time } = formatDayAndTime(new Date(request.requestedAt), now);
            return (
              <li key={request.id} className="flex items-center gap-3 border-b py-3">
                <div className="min-w-0 flex-1 type-body-sm-regular">
                  <PersonCell
                    name={request.patient.name}
                    avatarUrl={null}
                    detail={[
                      `HIN ${maskHin(request.patient.hin)}`,
                      request.assignedTo && `For ${request.assignedTo}`,
                      `${day}, ${time}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </div>
                <Button
                  size="sm"
                  aria-label={`Take ${request.patient.name}’s vitals`}
                  onClick={() => setTaking(request)}
                  className="type-caption-semibold font-sans"
                >
                  Take vitals
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {data && data.total > VITALS_REQUESTS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={VITALS_REQUESTS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
      <FormDialog open={!!taking} onOpenChange={(open) => !open && setTaking(null)}>
        {taking && <TakeVitalsForm request={taking} onDone={() => setTaking(null)} />}
      </FormDialog>
    </DashboardCard>
  );
}

function TakeVitalsForm({ request, onDone }: { request: VitalsRequest; onDone: () => void }) {
  const process = useProcessVitalsRequest();
  const form = useForm<VitalsRequestValues>({
    resolver: zodResolver(vitalsRequestSchema),
    defaultValues: { vitals: emptyVitals, notes: "" },
  });
  const { errors } = form.formState;

  function onSubmit({ vitals, notes }: VitalsRequestValues) {
    process.mutate(
      { id: request.id, vitals, notes },
      {
        onSuccess: () => {
          toast.success(`${request.patient.name}’s vitals are sent to the doctor.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Take vitals"
          description={`${request.patient.name}, as the doctor asked.`}
        />
        <FormDialogBody>
          {request.note && (
            <div className="rounded-lg bg-line px-4 py-3">
              <p className="type-caption text-fg-caption">The doctor’s note</p>
              <p className="type-body-sm-regular text-fg-heading">{request.note}</p>
            </div>
          )}
          <VitalsFields idPrefix="request" />
          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="vitalsNotes">Notes</FieldLabel>
            <Textarea
              id="vitalsNotes"
              placeholder="Anything the doctor should know about these readings"
              aria-invalid={!!errors.notes}
              className="min-h-20 bg-card"
              {...form.register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={process.isPending} className="h-11 px-5 type-heading-sm">
            Send vitals
          </Button>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}

function AdmittedCard({ now }: { now: Date }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(admissionsQuery(page));

  const empty = isError
    ? "We couldn’t load the admitted patients. Try again in a moment."
    : data?.items.length === 0 && "No one is admitted right now.";

  return (
    <DashboardCard title={`Admitted patients${data ? ` (${data.total})` : ""}`}>
      {empty || !data ? (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          {empty || "Loading…"}
        </p>
      ) : (
        <ul aria-label="Admitted patients" className="mt-3 border-t">
          {data.items.map((admission) => {
            const { day } = formatDayAndTime(new Date(admission.admittedAt), now);
            return (
              <li key={admission.id} className="relative flex items-center gap-3 border-b py-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to="/hospital/nurse/patients/$visitId"
                    params={{ visitId: admission.id }}
                    search={{ list: "inpatient" }}
                    // The whole row opens the patient.
                    className="truncate type-body-sm-medium text-fg-heading after:absolute after:inset-0 hover:underline"
                  >
                    {admission.patient.name}
                  </Link>
                  <span className="truncate type-caption text-fg-caption">
                    {[
                      [admission.ward, admission.bed && `Bed ${admission.bed}`]
                        .filter(Boolean)
                        .join(" · "),
                      admission.requestedBy,
                      `Admitted ${day}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                {!admission.hasAdmissionNote && (
                  <span className="shrink-0 rounded-sm bg-warning-100 px-2 py-0.5 type-caption text-warning-700">
                    Needs admission note
                  </span>
                )}
                <CaretRightIcon className="size-4 shrink-0 text-fg-caption" />
              </li>
            );
          })}
        </ul>
      )}
      {data && data.total > ADMISSIONS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={ADMISSIONS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </DashboardCard>
  );
}

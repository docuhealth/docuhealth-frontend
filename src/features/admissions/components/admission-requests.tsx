import { zodResolver } from "@hookform/resolvers/zod";
import { BedIcon, XCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAcceptAdmission, useRejectAdmission } from "@/features/admissions/api/mutations";
import { ADMISSIONS_PAGE_SIZE, admissionRequestsQuery } from "@/features/admissions/api/queries";
import {
  type AdmissionRequest,
  type AdmissionStatus,
  admissionStatusLabels,
} from "@/features/admissions/api/schemas";
import {
  type RejectAdmissionValues,
  rejectAdmissionSchema,
} from "@/features/admissions/lib/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";
import { ageOn, formatDayAndTime, maskHin } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const statuses = Object.keys(admissionStatusLabels) as AdmissionStatus[];

const statusTones = {
  pending: "warning",
  accepted: "success",
  rejected: "neutral",
} as const satisfies Record<AdmissionStatus, string>;

const emptyIn = {
  pending: "No admission requests waiting.",
  accepted: "No one has been admitted yet.",
  rejected: "No requests have been rejected.",
} as const satisfies Record<AdmissionStatus, string>;

const columns = { bed: "w-[18%]", by: "w-[18%]", when: "w-32", outcome: "w-[20%]", action: "w-44" };

/**
 * The front desk's admission requests: doctors asking for a patient to be admitted to a ward bed
 * they've picked. Pending ones are admitted or rejected (with a reason for the doctor); the
 * other tabs show what was decided, by whom and when.
 */
export function AdmissionRequests() {
  const [status, setStatus] = useState<AdmissionStatus>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [admitting, setAdmitting] = useState<AdmissionRequest | null>(null);
  const [rejecting, setRejecting] = useState<AdmissionRequest | null>(null);
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(admissionRequestsQuery(status, term, page));
  // When the page opened, for "Today" and ages.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load the admission requests. Try again in a moment."
    : data?.items.length === 0 && (term ? "No requests match your search." : emptyIn[status]);

  const actions = (request: AdmissionRequest) =>
    request.status === "pending" && (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label={`Reject ${request.patient.name}’s admission`}
          onClick={() => setRejecting(request)}
          className="bg-card type-caption-semibold font-sans text-error-500 hover:text-error-500"
        >
          Reject
        </Button>
        <Button
          size="sm"
          aria-label={`Admit ${request.patient.name}`}
          onClick={() => setAdmitting(request)}
          className="type-caption-semibold font-sans"
        >
          Admit
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Admission Requests</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Doctors’ requests to admit a patient to a ward bed.
        </p>
      </div>

      <section aria-label="Admission requests" className="@container rounded-xl border bg-card p-4">
        <header className="flex flex-wrap items-center gap-4">
          <SearchField
            size="lg"
            label="Search admission requests"
            placeholder="Search by patient name"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="@3xl:w-80"
          />
        </header>

        <Tabs
          value={status}
          onValueChange={(next) => {
            setStatus(next as AdmissionStatus);
            setPage(1);
          }}
          className="mt-2 gap-0"
        >
          {/* Ruled edge to edge, past the card's padding. */}
          <CountTabsList className="-mx-4 w-auto px-4">
            {statuses.map((value) => (
              <CountTab key={value} value={value} count={data?.counts[value]}>
                {admissionStatusLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @4xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Patient", className: "type-body-sm-regular" },
              { label: "Bed requested", className: `${columns.bed} type-body-sm-regular` },
              { label: "Requested by", className: `${columns.by} type-body-sm-regular` },
              { label: "Requested", className: `${columns.when} type-body-sm-regular` },
              ...(status === "pending"
                ? [{ label: "Actions", hideLabel: true, className: columns.action }]
                : [{ label: "Outcome", className: `${columns.outcome} type-body-sm-regular` }]),
            ]}
            loading={!data}
            empty={empty}
          >
            {items.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Patient request={request} now={now} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <BedRequested request={request} />
                </TableCell>
                <TableCell className="whitespace-normal">{request.requestedBy ?? "—"}</TableCell>
                <TableCell>
                  <When at={request.requestedAt} now={now} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  {request.status === "pending" ? (
                    actions(request)
                  ) : (
                    <Outcome request={request} now={now} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @4xl:hidden">
          {empty ? (
            <EmptyState compact description={empty} />
          ) : !data ? (
            <ListSkeleton className="py-4" />
          ) : (
            <ul aria-label="Admission requests">
              {items.map((request) => (
                <li key={request.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient request={request} now={now} />
                    </div>
                    {actions(request)}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-4">
                    <Detail label="Bed requested">
                      <BedRequested request={request} />
                    </Detail>
                    <Detail label="Requested by">{request.requestedBy ?? "—"}</Detail>
                    <Detail label="Requested">
                      <When at={request.requestedAt} now={now} />
                    </Detail>
                    {request.status !== "pending" && (
                      <Detail label="Outcome">
                        <Outcome request={request} now={now} />
                      </Detail>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={ADMISSIONS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      {admitting && <AdmitDialog request={admitting} onClose={() => setAdmitting(null)} />}
      {rejecting && <RejectDialog request={rejecting} onClose={() => setRejecting(null)} />}
    </div>
  );
}

/** "Emergency ward · Bed 4". */
const bedName = (request: AdmissionRequest) =>
  [request.ward, request.bed && `Bed ${request.bed}`].filter(Boolean).join(" · ") || "—";

function AdmitDialog({ request, onClose }: { request: AdmissionRequest; onClose: () => void }) {
  const accept = useAcceptAdmission();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<BedIcon />}
      title="Admit patient"
      confirmLabel="Admit"
      pending={accept.isPending}
      onClose={() => !accept.isPending && onClose()}
      onConfirm={() =>
        accept.mutate(request.id, {
          onSuccess: () => {
            toast.success(`${request.patient.name} is admitted to ${bedName(request)}.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Admit {request.patient.name} to {bedName(request)}, as {request.requestedBy ?? "the doctor"}{" "}
        asked?
      </DialogDescription>
    </ConfirmDialog>
  );
}

function RejectDialog({ request, onClose }: { request: AdmissionRequest; onClose: () => void }) {
  const reject = useRejectAdmission();
  const form = useForm<RejectAdmissionValues>({
    resolver: zodResolver(rejectAdmissionSchema),
    defaultValues: { reason: "" },
  });
  const { errors } = form.formState;

  function onSubmit({ reason }: RejectAdmissionValues) {
    reject.mutate(
      { id: request.id, reason },
      {
        onSuccess: () => {
          toast.success(`${request.patient.name}’s admission request is rejected.`);
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <ConfirmDialog
      tone="danger"
      icon={<XCircleIcon />}
      title="Reject admission"
      confirmLabel="Reject request"
      pending={reject.isPending}
      onClose={() => !reject.isPending && onClose()}
      onConfirm={() => void form.handleSubmit(onSubmit)()}
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {request.patient.name} · {bedName(request)}.{" "}
        {request.requestedBy ?? "The requesting doctor"} will see your reason.
      </DialogDescription>
      <Field data-invalid={!!errors.reason}>
        <FieldLabel htmlFor="admissionRejectReason" className="gap-1">
          Reason <RequiredMark />
        </FieldLabel>
        <Textarea
          id="admissionRejectReason"
          placeholder="e.g. The ward is full; please pick another bed"
          aria-required
          aria-invalid={!!errors.reason}
          className="min-h-32 bg-card"
          {...form.register("reason")}
        />
        <FieldError errors={[errors.reason]} />
      </Field>
    </ConfirmDialog>
  );
}

function Patient({ request, now }: { request: AdmissionRequest; now: Date }) {
  const { patient } = request;
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={null}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        patient.dateOfBirth && `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

function BedRequested({ request }: { request: AdmissionRequest }) {
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{request.ward ?? "—"}</span>
      {request.bed && <span className="text-fg-caption">Bed {request.bed}</span>}
    </div>
  );
}

/** Who admitted or rejected it and when, and why it was rejected. */
function Outcome({ request, now }: { request: AdmissionRequest; now: Date }) {
  const when = request.processedAt && formatDayAndTime(new Date(request.processedAt), now);
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusPill tone={statusTones[request.status]}>
        {admissionStatusLabels[request.status]}
      </StatusPill>
      {(request.processedBy || when) && (
        <span className="text-fg-caption">
          {[request.processedBy, when && `${when.day}, ${when.time}`].filter(Boolean).join(" · ")}
        </span>
      )}
      {request.status === "rejected" && (
        <span className="text-fg-caption">
          Reason: {request.rejectionReason ?? "none recorded"}
        </span>
      )}
    </div>
  );
}

function When({ at, now }: { at: string; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(at), now);
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{day}</span>
      <span className="text-fg-caption">{time}</span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full type-caption text-fg-heading">{children}</dd>
    </div>
  );
}

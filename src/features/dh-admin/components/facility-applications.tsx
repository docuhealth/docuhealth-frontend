import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, FileIcon, XCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { RequiredMark } from "@/components/required-mark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApproveApplication, useRejectApplication } from "@/features/dh-admin/api/mutations";
import {
  APPLICATIONS_PAGE_SIZE,
  applicationCountQuery,
  applicationsQuery,
} from "@/features/dh-admin/api/queries";
import {
  type ApplicationStatus,
  applicationStatusLabels,
  type FacilityApplication,
} from "@/features/dh-admin/api/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatDateCommaTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const statuses = Object.keys(applicationStatusLabels) as ApplicationStatus[];

/** Applications the admin can still decide on: the email is verified, the documents are in. */
const decidable = (status: ApplicationStatus) =>
  status === "in_review" || status === "email_verified";

const emptyIn: Record<ApplicationStatus, string> = {
  in_review: "No applications are waiting for review.",
  email_verified: "No applications are waiting for their documents.",
  submitted: "No applications are waiting for their email to be verified.",
  approved: "No applications approved yet.",
  rejected: "No applications rejected.",
};

/**
 * Facilities asking to join DocuHealth, by where their application stands. One in review can be
 * approved (the facility's admin is emailed a login link) or rejected with a reason.
 */
export function FacilityApplications() {
  const [status, setStatus] = useState<ApplicationStatus>("in_review");
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(applicationsQuery(status, page));

  const empty = isError
    ? "We couldn’t load the applications. Try again in a moment."
    : data?.items.length === 0 && emptyIn[status];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Facility applications</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Hospitals, labs, pharmacies and radiology centres asking to join DocuHealth.
        </p>
      </div>

      <section aria-label="Applications" className="rounded-xl border bg-card p-4">
        <Tabs
          value={status}
          onValueChange={(next) => {
            setStatus(next as ApplicationStatus);
            setPage(1);
          }}
          className="gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            {statuses.map((value) => (
              <StatusTab key={value} status={value} />
            ))}
          </CountTabsList>
        </Tabs>

        {empty || !data ? (
          <div>
            {empty ? <EmptyState compact description={empty} /> : <ListSkeleton className="py-4" />}
          </div>
        ) : (
          <Accordion type="multiple" className="flex flex-col">
            {data.items.map((application) => (
              <ApplicationItem key={application.id} application={application} />
            ))}
          </Accordion>
        )}
        {data && data.total > APPLICATIONS_PAGE_SIZE && (
          <TablePagination
            page={page}
            pageSize={APPLICATIONS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function StatusTab({ status }: { status: ApplicationStatus }) {
  const { data: count } = useQuery(applicationCountQuery(status));
  return (
    <CountTab value={status} count={count}>
      {applicationStatusLabels[status]}
    </CountTab>
  );
}

const typeLabel = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1).replaceAll("_", " ");

function ApplicationItem({ application }: { application: FacilityApplication }) {
  const [deciding, setDeciding] = useState<"approve" | "reject" | null>(null);
  const details: [string, string | null][] = [
    ["Type", typeLabel(application.type)],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Address", application.address],
    ["Message", application.message],
    [
      "Reviewed",
      application.reviewedAt
        ? [formatDateCommaTime(new Date(application.reviewedAt)), application.reviewedBy]
            .filter(Boolean)
            .join(" · ")
        : null,
    ],
    ["Reason for rejection", application.rejectionReason],
  ];

  return (
    <AccordionItem value={application.id}>
      <AccordionTrigger className="gap-3 py-3.5 hover:no-underline">
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
          <span className="type-body-sm-medium text-fg-heading">{application.name}</span>
          <span className="type-caption text-fg-caption">
            {typeLabel(application.type)} · {application.email} · Applied{" "}
            {formatDateCommaTime(new Date(application.submittedAt))}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3">
        <dl className="flex flex-col divide-y rounded-lg border">
          {details
            .filter((detail): detail is [string, string] => !!detail[1])
            .map(([label, value]) => (
              <div key={label} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
                <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
                <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
                  {value}
                </dd>
              </div>
            ))}
        </dl>
        <div className="flex flex-col gap-2">
          <h3 className="type-body-sm-medium text-fg-heading">Documents</h3>
          {application.documents.length === 0 ? (
            <p className="type-body-sm-regular text-fg-caption">No documents uploaded.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {application.documents.map((document) => (
                <li key={document.url}>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 type-body-sm-regular text-primary hover:bg-muted"
                  >
                    <FileIcon className="size-4" />
                    {document.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {decidable(application.status) && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label={`Reject ${application.name}’s application`}
              onClick={() => setDeciding("reject")}
              className="bg-card type-caption-semibold font-sans text-fg-heading"
            >
              Reject
            </Button>
            <Button
              size="sm"
              aria-label={`Approve ${application.name}’s application`}
              onClick={() => setDeciding("approve")}
              className="type-caption-semibold font-sans"
            >
              Approve
            </Button>
          </div>
        )}
        {deciding === "approve" && (
          <ApproveDialog application={application} onClose={() => setDeciding(null)} />
        )}
        {deciding === "reject" && (
          <RejectDialog application={application} onClose={() => setDeciding(null)} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function ApproveDialog({
  application,
  onClose,
}: {
  application: FacilityApplication;
  onClose: () => void;
}) {
  const approve = useApproveApplication();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<CheckCircleIcon />}
      title="Approve application"
      confirmLabel="Approve"
      pending={approve.isPending}
      onClose={() => !approve.isPending && onClose()}
      onConfirm={() =>
        approve.mutate(application.id, {
          onSuccess: () => {
            toast.success(`${application.name} is approved. We’ve emailed them a login link.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {application.name} joins DocuHealth, and {application.email} gets an email with a link to
        log in.
      </DialogDescription>
    </ConfirmDialog>
  );
}

const rejectSchema = z.object({
  reason: z.string().trim().min(1, "Say why the application is rejected"),
});

function RejectDialog({
  application,
  onClose,
}: {
  application: FacilityApplication;
  onClose: () => void;
}) {
  const reject = useRejectApplication();
  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });
  const { errors } = form.formState;

  return (
    <ConfirmDialog
      tone="danger"
      icon={<XCircleIcon />}
      title="Reject application"
      confirmLabel="Reject"
      pending={reject.isPending}
      onClose={() => !reject.isPending && onClose()}
      onConfirm={() =>
        void form.handleSubmit(({ reason }) =>
          reject.mutate(
            { id: application.id, reason },
            {
              onSuccess: () => {
                toast.success(`${application.name}’s application is rejected.`);
                onClose();
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          ),
        )()
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {application.name} is told their application was rejected, with your reason.
      </DialogDescription>
      <Field data-invalid={!!errors.reason}>
        <FieldLabel htmlFor={`reject-${application.id}`} className="gap-1">
          Reason <RequiredMark />
        </FieldLabel>
        <Textarea
          id={`reject-${application.id}`}
          placeholder="e.g. The licence uploaded has expired"
          aria-required
          aria-invalid={!!errors.reason}
          className="min-h-24 bg-card"
          {...form.register("reason")}
        />
        <FieldError errors={[errors.reason]} />
      </Field>
    </ConfirmDialog>
  );
}

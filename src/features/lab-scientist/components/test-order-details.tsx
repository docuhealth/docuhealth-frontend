import { HeartIcon, TestTubeIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { DetailRow, OrderCard } from "@/components/dashboard/order-card";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import {
  CalendarIcon,
  CancelIcon,
  Clock01Icon,
  HospitalIcon,
  MailIcon,
  NoteIcon,
  PencilEditIcon,
  PrinterIcon,
  StethoscopeIcon,
  TickIcon,
  UnarchiveIcon,
  UploadIcon,
  ViewIcon,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { testOrderQuery } from "@/features/lab-scientist/api/queries";
import { sexLabel, type TestOrder } from "@/features/lab-scientist/api/schemas";
import { AcceptOrderFlow } from "@/features/lab-scientist/components/accept-order-flow";
import { RejectOrderFlow } from "@/features/lab-scientist/components/reject-order-flow";
import {
  ApproveResultsDialog,
  ReturnResultsDialog,
} from "@/features/lab-scientist/components/review-results-flow";
import { SampleCollectionDialog } from "@/features/lab-scientist/components/sample-collection-dialog";
import {
  RejectionReason,
  TestOrderProgress,
} from "@/features/lab-scientist/components/test-order-progress";
import { TestOrderResult } from "@/features/lab-scientist/components/test-order-result";
import { UploadResultFlow } from "@/features/lab-scientist/components/upload-result-flow";
import {
  resultsAwaitingReview,
  stageStatusLabels,
  stageTones,
  testNames,
} from "@/features/lab-scientist/lib/stage";
import { ageOn, formatDateCommaTime, formatDay, formatTime } from "@/lib/format";
import { useIsFacilityAdmin } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

/**
 * One test order: who it's for, what was asked, and where it stands. A pending, in-progress or
 * rejected order shows its details and progress; a completed one, its results.
 */
export function TestOrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = useSuspenseQuery(testOrderQuery(orderId));
  // When the page opened, for the patient's age.
  const [now] = useState(() => new Date());
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const openOrClose = (which: Dialog) => (open: boolean) => setDialog(open ? which : null);
  // The lab's admin reviews results before the requesting doctor sees them.
  const reviewing = useIsFacilityAdmin() && resultsAwaitingReview(order).length > 0;

  return (
    <div className="flex flex-col gap-6">
      <title>{`${order.patient.name} · Test order · DocuHealth`}</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PatientHeading patient={order.patient} now={now} />
        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          {reviewing && <ReviewButtons onOpen={setDialog} />}
          {/* Once every test has a result, the review is all there is to do. */}
          {!(reviewing && order.stage === "completed") && (
            <StageButtons order={order} onOpen={setDialog} />
          )}
        </div>
      </div>

      <SummaryCards order={order} />

      {order.stage === "completed" && order.result ? (
        <TestOrderResult order={order} result={order.result} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <TestInformation order={order} onEditSample={() => setDialog("sample")} />
          <TestOrderProgress order={order} />
        </div>
      )}

      {/* Mounted whatever the stage, so their last step outlasts the order moving on. */}
      <AcceptOrderFlow
        order={order}
        open={dialog === "accept"}
        onOpenChange={openOrClose("accept")}
      />
      <RejectOrderFlow
        order={order}
        open={dialog === "reject"}
        onOpenChange={openOrClose("reject")}
      />
      <SampleCollectionDialog
        order={order}
        open={dialog === "sample"}
        onOpenChange={openOrClose("sample")}
      />
      <UploadResultFlow
        order={order}
        open={dialog === "upload"}
        onOpenChange={openOrClose("upload")}
      />
      {dialog === "approve" && (
        <ApproveResultsDialog order={order} onClose={() => setDialog(null)} />
      )}
      {dialog === "return" && <ReturnResultsDialog order={order} onClose={() => setDialog(null)} />}
    </div>
  );
}

/** The dialogs the order's buttons open. */
type Dialog = "accept" | "reject" | "sample" | "upload" | "approve" | "return";

function PatientHeading({ patient, now }: { patient: TestOrder["patient"]; now: Date }) {
  const details = [
    maskedHin(patient.hin),
    `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
    sexLabel(patient.sex),
  ].filter(Boolean);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <PersonAvatar name={patient.name} src={patient.avatarUrl} size="xl" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="type-h4">{patient.name}</h1>
          {patient.hmo && (
            <span className="rounded-sm bg-success-100 px-2 py-0.5 type-body-sm-regular text-success-700">
              HMO Patient
            </span>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-3 type-body-sm-regular text-fg-caption">
          {details.map((detail, index) => (
            <span key={detail} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden className="h-3.5 w-px bg-divider" />}
              {detail}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/** "HIN-12456••••••": the first five digits, the rest hidden. */
function maskedHin(hin: string) {
  return `HIN-${hin.slice(0, 5)}${"•".repeat(Math.max(0, hin.length - 5))}`;
}

const buttonBase = "h-12 gap-2 px-4 has-data-[icon=inline-start]:pl-4";
const outlineButton = cn(buttonBase, "bg-card type-body-sm-medium text-fg-heading");
const primaryButton = cn(buttonBase, "type-heading-sm");

/** The lab admin's verdict on results waiting for them. */
function ReviewButtons({ onOpen }: { onOpen: (dialog: Dialog) => void }) {
  return (
    <>
      <Button
        variant="outline"
        className={cn(outlineButton, "text-error-500 hover:text-error-700")}
        onClick={() => onOpen("return")}
      >
        <CancelIcon data-icon="inline-start" className="size-5" />
        Return results
      </Button>
      <Button className={primaryButton} onClick={() => onOpen("approve")}>
        <TickIcon data-icon="inline-start" className="size-5" />
        Approve results
      </Button>
    </>
  );
}

/** What the lab can do with the order at its stage. */
function StageButtons({ order, onOpen }: { order: TestOrder; onOpen: (dialog: Dialog) => void }) {
  // TODO(design): the rest of these open dialogs or flows that aren't designed yet.
  const notBuilt = (what: string) => () => toast.info(`${what} isn’t built yet.`);

  switch (order.stage) {
    case "pending":
      return (
        <>
          <Button
            variant="outline"
            className={cn(outlineButton, "text-error-500 hover:text-error-700")}
            onClick={() => onOpen("reject")}
          >
            <CancelIcon data-icon="inline-start" className="size-5" />
            Reject request
          </Button>
          <Button className={primaryButton} onClick={() => onOpen("accept")}>
            <TickIcon data-icon="inline-start" className="size-5" />
            Accept request
          </Button>
        </>
      );
    case "in_progress":
      return (
        <>
          <Button variant="outline" className={outlineButton} onClick={() => onOpen("sample")}>
            {order.sampleCollectedAt ? "Edit sample collection info" : "Log sample collection"}
          </Button>
          <Button className={primaryButton} onClick={() => onOpen("upload")}>
            <UploadIcon data-icon="inline-start" className="size-5" />
            Upload test result
          </Button>
        </>
      );
    case "completed":
      return (
        <>
          <Button
            variant="outline"
            className={outlineButton}
            onClick={notBuilt("The original preview")}
          >
            <ViewIcon data-icon="inline-start" className="size-5" />
            View original preview
          </Button>
          <Button variant="outline" className={outlineButton} onClick={notBuilt("Printing")}>
            <PrinterIcon data-icon="inline-start" className="size-5" />
            Print out
          </Button>
          <Button className={primaryButton} onClick={notBuilt("Downloading the results")}>
            <UploadIcon data-icon="inline-start" className="size-5" />
            Download
          </Button>
        </>
      );
    case "rejected":
      return (
        <>
          <Button variant="outline" className={outlineButton} onClick={notBuilt("Printing")}>
            <PrinterIcon data-icon="inline-start" className="size-5" />
            Print out
          </Button>
          <Button
            variant="outline"
            className={outlineButton}
            onClick={notBuilt("Downloading the order")}
          >
            <UploadIcon data-icon="inline-start" className="size-5" />
            Download
          </Button>
          <Button className={primaryButton} onClick={notBuilt("Re-uploading results")}>
            <UnarchiveIcon data-icon="inline-start" className="size-5" />
            Re-upload result
          </Button>
        </>
      );
  }
}

const statusText = {
  warning: "text-warning-700",
  info: "text-info-500",
  success: "text-success-500",
  error: "text-error-500",
} as const;

/** The four headline facts: status, what was ordered, when it was asked for and sampled. */
function SummaryCards({ order }: { order: TestOrder }) {
  const requested = new Date(order.requestedAt);
  const collected = order.sampleCollectedAt ? new Date(order.sampleCollectedAt) : null;
  const tone = stageTones[order.stage];
  const [first] = order.tests;

  const statusNote = {
    pending: "Waiting for you to accept",
    in_progress: collected ? "Sample collected, awaiting result" : "Waiting for the sample",
    completed: order.result
      ? `Result uploaded ${formatDateCommaTime(new Date(order.result.uploadedAt))}`
      : "Result uploaded",
    rejected: order.rejection?.at ? formatDateCommaTime(new Date(order.rejection.at)) : "",
  }[order.stage];

  return (
    // One per row on phones: the values here are dates and names, too long to sit two across.
    <StatGrid aria-label="Summary" className="grid-cols-1 sm:grid-cols-2">
      <StatCard
        icon={<Clock01Icon />}
        label="Test Status"
        value={
          <span className={cn("flex items-center gap-2", statusText[tone])}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-current" />
            {stageStatusLabels[order.stage]}
          </span>
        }
        note={statusNote}
      />
      <StatCard
        icon={<TestTubeIcon />}
        label="Test requested"
        value={order.tests.length === 1 && first ? first.name : `${order.tests.length} tests`}
        note={order.tests.length === 1 && first ? `LOINC ${first.loinc}` : testNames(order.tests)}
      />
      <StatCard
        icon={<CalendarIcon />}
        label="Requested on"
        value={formatDay(requested)}
        note={`${formatTime(requested)} · ${order.requestedBy}`}
      />
      <StatCard
        icon={<TestTubeIcon />}
        label="Sample collected on"
        value={collected ? formatDay(collected) : <span className="text-fg-caption">N/A</span>}
        note={
          collected
            ? order.stage === "in_progress"
              ? `${formatTime(collected)} · Edit if this is wrong`
              : formatTime(collected)
            : order.stage === "rejected"
              ? "No sample was collected"
              : "Not collected yet"
        }
      />
    </StatGrid>
  );
}

/** What the doctor asked for, and who to contact about it. */
function TestInformation({ order, onEditSample }: { order: TestOrder; onEditSample: () => void }) {
  const collected = order.sampleCollectedAt ? new Date(order.sampleCollectedAt) : null;

  return (
    <OrderCard title="Test information" description="The details of this request.">
      <dl className="flex flex-col gap-6">
        <DetailRow icon={<TestTubeIcon />} label="Test requested">
          {order.tests.map((test) => `${test.name} · LOINC ${test.loinc}`).join(", ")}
        </DetailRow>
        {order.pregnancyStatus && (
          <DetailRow icon={<HeartIcon />} label="Pregnancy status">
            {order.pregnancyStatus}
          </DetailRow>
        )}
        <DetailRow icon={<StethoscopeIcon />} label="Requested by">
          {order.requestedBy}
        </DetailRow>
        <DetailRow icon={<HospitalIcon />} label="Provider">
          {order.provider.name}
        </DetailRow>
        <DetailRow icon={<MailIcon />} label="Provider email">
          <a
            href={`mailto:${order.provider.email}`}
            className="min-w-0 break-all hover:text-primary hover:underline"
          >
            {order.provider.email}
          </a>
        </DetailRow>
        <DetailRow icon={<CalendarIcon />} label="Sample collected">
          {collected ? formatDateCommaTime(collected) : "Not collected yet"}
          {order.stage === "in_progress" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                collected ? "Change the sample collection time" : "Log the sample collection"
              }
              onClick={onEditSample}
              className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            >
              <PencilEditIcon className="size-4" />
            </Button>
          )}
        </DetailRow>
        {order.note && (
          <div className="flex flex-col gap-3">
            <dt className="flex items-center gap-2 type-body-sm-regular text-fg-caption">
              <NoteIcon className="size-4" />
              Note from the doctor
            </dt>
            <dd className="rounded-lg border bg-background px-4 py-3 type-body-sm-regular text-fg-heading">
              {order.note}
            </dd>
          </div>
        )}
      </dl>
      {order.rejection && <RejectionReason reason={order.rejection.reason} />}
    </OrderCard>
  );
}

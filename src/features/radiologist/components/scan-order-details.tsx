import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { scanOrderQuery } from "@/features/radiologist/api/queries";
import { type ScanOrder, sexLabel } from "@/features/radiologist/api/schemas";
import {
  CalendarIcon,
  CancelIcon,
  Clock01Icon,
  HospitalIcon,
  MailIcon,
  NoteIcon,
  PencilEditIcon,
  PrinterIcon,
  ScanIcon,
  StethoscopeIcon,
  TickIcon,
  UnarchiveIcon,
  UploadIcon,
  UserIcon,
  ViewIcon,
} from "@/features/radiologist/components/icons";
import { DetailRow, OrderCard } from "@/features/radiologist/components/scan-order-parts";
import {
  RejectionReason,
  ScanOrderProgress,
} from "@/features/radiologist/components/scan-order-progress";
import { ScanOrderResult } from "@/features/radiologist/components/scan-order-result";
import { AcceptOrderFlow } from "@/features/radiologist/components/accept-order-flow";
import { ImagingTimeDialog } from "@/features/radiologist/components/imaging-time-dialog";
import { RejectOrderFlow } from "@/features/radiologist/components/reject-order-flow";
import { UploadResultFlow } from "@/features/radiologist/components/upload-result-flow";
import { stageStatusLabels, stageTones } from "@/features/radiologist/lib/stage";
import { ageOn, formatDateCommaTime, formatDay, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * One scan order: who it's for, what was asked, and where it stands. A pending or in-progress
 * order shows its details and progress; a completed one, its report.
 */
export function ScanOrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = useSuspenseQuery(scanOrderQuery(orderId));
  // When the page opened, for the patient's age.
  const [now] = useState(() => new Date());
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const openOrClose = (which: Dialog) => (open: boolean) => setDialog(open ? which : null);

  return (
    <div className="flex flex-col gap-6">
      <title>{`${order.patient.name} · Scan order · DocuHealth`}</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PatientHeading patient={order.patient} now={now} />
        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <StageButtons order={order} onOpen={setDialog} />
        </div>
      </div>

      <SummaryCards order={order} />

      {order.stage === "completed" && order.result ? (
        <ScanOrderResult result={order.result} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <ScanInformation order={order} onEditImaging={() => setDialog("imaging")} />
          <div className="flex min-w-0 flex-col gap-6">
            <ScanOrderProgress order={order} className="flex-1" />
            {order.rejection && <RejectionReason reason={order.rejection.reason} />}
          </div>
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
      <ImagingTimeDialog
        order={order}
        open={dialog === "imaging"}
        onOpenChange={openOrClose("imaging")}
        onSaved={({ edited }) => {
          setDialog(null);
          toast.success(edited ? "Imaging time updated." : "Imaging time saved.");
        }}
      />
      <UploadResultFlow
        orderId={order.id}
        open={dialog === "upload"}
        onOpenChange={openOrClose("upload")}
      />
    </div>
  );
}

/** The dialogs the order's buttons open. */
type Dialog = "accept" | "reject" | "imaging" | "upload";

function PatientHeading({ patient, now }: { patient: ScanOrder["patient"]; now: Date }) {
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

/** What the radiologist can do with the order at its stage. */
function StageButtons({ order, onOpen }: { order: ScanOrder; onOpen: (dialog: Dialog) => void }) {
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
          <Button variant="outline" className={outlineButton} onClick={() => onOpen("imaging")}>
            <PencilEditIcon data-icon="inline-start" className="size-5" />
            Edit Imaging log
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
          <Button className={primaryButton} onClick={notBuilt("Downloading the report")}>
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

/** The four headline facts: status, what was ordered, and two dates or people by stage. */
function SummaryCards({ order }: { order: ScanOrder }) {
  const requested = new Date(order.requestedAt);
  const tone = stageTones[order.stage];

  const statusNote = {
    pending: "Waiting for you to accept",
    in_progress: "Sample collected, awaiting result",
    completed: order.result
      ? `Result uploaded ${formatDateCommaTime(new Date(order.result.uploadedAt))}`
      : "Result uploaded",
    rejected: order.rejection ? formatDateCommaTime(new Date(order.rejection.at)) : "",
  }[order.stage];

  const imaging = order.scheduledAt ? new Date(order.scheduledAt) : null;
  const notYet = <span className="text-fg-caption">N/A</span>;

  return (
    // One per row on phones: the values here are dates and names, too long to sit two across.
    <StatGrid aria-label="Summary" className="grid-cols-1 sm:grid-cols-2">
      <StatCard
        icon={<Clock01Icon />}
        label="Status"
        value={
          <span className={cn("flex items-center gap-2", statusText[tone])}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-current" />
            {stageStatusLabels[order.stage]}
          </span>
        }
        note={statusNote}
      />
      <StatCard
        icon={<ScanIcon />}
        label="Imaging order"
        value={order.modality}
        note={[order.bodyPart, order.contrast].filter(Boolean).join(" · ")}
      />

      {order.stage === "completed" ? (
        <>
          <StatCard
            icon={<CalendarIcon />}
            label="Imaging time & date"
            value={imaging ? formatDay(imaging) : notYet}
            note={imaging ? `${formatTime(imaging)} · ${order.requestedBy}` : order.requestedBy}
          />
          <StatCard
            icon={<UserIcon />}
            label="Reported by"
            value={order.result?.reportedBy.name ?? notYet}
            note={
              order.result
                ? `${order.result.reportedBy.specialty} · ${formatDateCommaTime(new Date(order.result.uploadedAt))}`
                : ""
            }
          />
        </>
      ) : (
        <>
          <StatCard
            icon={<CalendarIcon />}
            label="Requested on"
            value={formatDay(requested)}
            note={`${formatTime(requested)} · ${order.requestedBy}`}
          />
          <StatCard
            icon={<CalendarIcon />}
            label="Imaging time & date"
            value={imaging ? formatDay(imaging) : notYet}
            note={imaging ? formatTime(imaging) : "Not scheduled yet"}
          />
        </>
      )}
    </StatGrid>
  );
}

/** What the doctor asked for, and who to contact about it. */
function ScanInformation({
  order,
  onEditImaging,
}: {
  order: ScanOrder;
  onEditImaging: () => void;
}) {
  const imaging = order.scheduledAt ? new Date(order.scheduledAt) : null;

  return (
    <OrderCard title="Scan information" description="The details of this request.">
      <dl className="flex flex-col gap-6">
        <DetailRow icon={<ScanIcon />} label="Imaging order">
          {order.modality}
          {order.contrast && ` (${order.contrast})`}
        </DetailRow>
        <DetailRow icon={<UserIcon />} label="Body part">
          {order.bodyPart}
        </DetailRow>
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
        <DetailRow icon={<CalendarIcon />} label="Imaging time & date">
          {imaging ? formatDateCommaTime(imaging) : "Not scheduled yet"}
          {order.stage === "in_progress" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={imaging ? "Change the imaging time" : "Log the imaging time"}
              onClick={onEditImaging}
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
    </OrderCard>
  );
}

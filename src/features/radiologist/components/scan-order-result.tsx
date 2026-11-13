import { FilePdfIcon, ImageIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "@/features/radiologist/api/schemas";
import {
  CalendarIcon,
  ScanIcon,
  UploadIcon,
  UserIcon,
  ViewIcon,
} from "@/features/radiologist/components/icons";
import { DetailRow, OrderCard } from "@/features/radiologist/components/scan-order-parts";
import { formatDateCommaTime, formatDay, formatFileSize } from "@/lib/format";

/** A completed order's report, its files, and the radiologist's conclusions. */
export function ScanOrderResult({ result }: { result: ScanResult }) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6">
        <OrderCard title="Report">
          <div className="flex flex-col gap-5">
            <ReportSection label="Examination">{result.examination}</ReportSection>
            <ReportSection label="Clinical indication">{result.clinicalIndication}</ReportSection>
            {result.technique && (
              <ReportSection label="Technique">{result.technique}</ReportSection>
            )}
            <ReportSection label="Findings">
              <ol className="list-decimal pl-5">
                {result.findings.map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ol>
            </ReportSection>
            {result.comment && <ReportSection label="Comment">{result.comment}</ReportSection>}
          </div>
        </OrderCard>

        <OrderCard title="Images and documents">
          {result.files.length === 0 ? (
            <p className="type-body-sm-regular text-fg-caption">No files were uploaded.</p>
          ) : (
            // On a narrow card the buttons get a row of their own under the file, sharing its
            // width, so the name and details aren't squeezed; side by side once there's room.
            <ul aria-label="Images and documents" className="@container -mt-4 flex flex-col">
              {result.files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-col gap-3 border-b py-4 last:border-b-0 last:pb-0 @md:flex-row @md:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <FileTypeIcon kind={file.kind} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="type-body-sm-medium wrap-anywhere text-fg-heading @md:truncate">
                        {file.name}
                      </p>
                      <p className="type-body-sm-regular whitespace-nowrap text-fg-caption">
                        {formatDay(new Date(file.uploadedAt))} · {formatFileSize(file.sizeBytes)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 @md:flex">
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 gap-2 border-primary bg-card px-4 type-body-sm-medium text-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${file.name}`}
                      >
                        <ViewIcon className="size-4" />
                        View
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading"
                    >
                      <a href={file.url} download aria-label={`Download ${file.name}`}>
                        <UploadIcon className="size-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </OrderCard>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <OrderCard title="Impression" tone="primary">
          <p className="type-body-sm-regular text-fg-heading">{result.impression}</p>
        </OrderCard>
        <OrderCard title="Recommendations">
          <p className="type-body-sm-regular text-fg-heading">{result.recommendations}</p>
        </OrderCard>
        <OrderCard title="Report details">
          <dl className="flex flex-col gap-5">
            <DetailRow icon={<UserIcon />} label="Reported by">
              {result.reportedBy.name}
            </DetailRow>
            <DetailRow icon={<ScanIcon />} label="Specialty">
              {result.reportedBy.specialty}
            </DetailRow>
            <DetailRow icon={<CalendarIcon />} label="Date & time of report">
              {formatDateCommaTime(new Date(result.uploadedAt))}
            </DetailRow>
          </dl>
        </OrderCard>
      </div>
    </div>
  );
}

function ReportSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="type-caption-medium text-fg-caption uppercase">{label}</h3>
      <div className="type-body-sm-regular text-fg-heading">{children}</div>
    </div>
  );
}

// TODO(design): swap for the design's own image and PDF file icons once they're exported.
function FileTypeIcon({ kind }: { kind: ScanResult["files"][number]["kind"] }) {
  return kind === "images" ? (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-content-center rounded-lg bg-success-500 text-white"
    >
      <ImageIcon weight="fill" className="size-6" />
    </span>
  ) : (
    <span aria-hidden className="grid size-10 shrink-0 place-content-center text-error-500">
      <FilePdfIcon weight="fill" className="size-10" />
    </span>
  );
}

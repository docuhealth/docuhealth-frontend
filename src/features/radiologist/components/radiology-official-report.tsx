import { FilePdfIcon, ImageIcon } from "@phosphor-icons/react";
import type { ReactNode, Ref } from "react";
import logoUrl from "@/assets/logos/logo.svg";
import { type ScanOrder, type ScanResult, sexLabel } from "@/features/radiologist/api/schemas";
import { maskedHin } from "@/features/radiologist/lib/names";
import { ageOn, formatDateCommaTime, formatDay, initials } from "@/lib/format";

/** The requesting doctor's review of the report, as the report states it. */
const reviewLabels: Record<string, string> = {
  approved: "Approved by the doctor",
  pending: "Awaiting the doctor’s review",
};

/**
 * The branded radiology report a completed scan prints and downloads as: the hospital and
 * patient, the imaging order, the radiologist's findings and conclusions, who reported it and
 * the files attached. Laid out for an A4 page, 794px wide; `data-pdf-unit` marks where pages may
 * break.
 */
export function RadiologyOfficialReport({
  ref,
  order,
  result,
  issuedAt,
}: {
  ref?: Ref<HTMLDivElement>;
  order: ScanOrder;
  result: ScanResult;
  /** When it's printed or downloaded, for the patient's age and the footer. */
  issuedAt: Date;
}) {
  const { patient, provider } = order;
  const ageAndSex = [
    `${ageOn(new Date(patient.dateOfBirth), issuedAt)} yrs`,
    sexLabel(patient.sex),
  ].filter(Boolean);
  const imaging = order.scheduledAt ? new Date(order.scheduledAt) : null;
  const lines = (text: string | null) =>
    (text ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  return (
    <div ref={ref} className="flex w-full flex-col bg-card type-body text-fg-body">
      <header data-pdf-unit className="flex flex-col gap-5 bg-primary px-8 pt-7 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-14 shrink-0 place-content-center rounded-2xl bg-card type-h4 text-primary">
              {initials(provider.name)}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="type-h3 text-primary-foreground">{provider.name}</p>
              {provider.email && (
                <p className="type-caption text-primary-foreground/75">{provider.email}</p>
              )}
            </div>
          </div>
          <p className="shrink-0 type-heading-sm text-primary-foreground">Radiology report</p>
        </div>
        <dl className="grid grid-cols-4 border-t border-primary-foreground/20 pt-5">
          <HeaderFact label="Patient name">{patient.name}</HeaderFact>
          <HeaderFact label="HIN">{maskedHin(patient.hin)}</HeaderFact>
          <HeaderFact label="Age / sex">{ageAndSex.join(" · ")}</HeaderFact>
          <HeaderFact label="Requested by">{order.requestedBy || "—"}</HeaderFact>
        </dl>
      </header>

      <div className="flex flex-col gap-4 px-8 pt-5 pb-6">
        <dl data-pdf-unit className="grid grid-cols-4 gap-6 rounded-2xl border p-5">
          <Fact label="Requested on">{formatDateCommaTime(new Date(order.requestedAt))}</Fact>
          <Fact label="Imaging done">{imaging ? formatDateCommaTime(imaging) : "—"}</Fact>
          <Fact label="Reported on">{formatDateCommaTime(new Date(result.reportedAt))}</Fact>
          <Fact label="Review">{reviewLabels[result.status] ?? "—"}</Fact>
        </dl>

        <section className="flex flex-col gap-5 rounded-2xl border p-6">
          <div data-pdf-unit className="flex flex-col gap-1">
            <p className="type-label text-fg-caption">Imaging order</p>
            <h2 className="type-h5 text-fg-heading">{result.examination}</h2>
            <p className="type-body-sm-regular text-fg-caption">
              {[order.modality, order.bodyPart, order.contrast].filter(Boolean).join(" · ")}
            </p>
          </div>
          <ReportText label="Clinical indication" lines={lines(result.clinicalIndication)} />
          <ReportText label="Technique" lines={lines(result.technique)} />
          <ReportText label="Findings" lines={result.findings} numbered />
          <ReportText label="Impression" lines={lines(result.impression)} />
          <ReportText label="Recommendations" lines={lines(result.recommendations)} />
          <ReportText label="Comment" lines={lines(result.comment)} />
        </section>

        <section data-pdf-unit className="flex flex-col gap-4 rounded-2xl border p-6">
          <h2 className="type-h5 text-fg-heading">Reported by</h2>
          <dl className="grid grid-cols-3 gap-6">
            <Fact label="Reporter">{result.reportedBy.name || "—"}</Fact>
            <Fact label="Specialty">{result.reportedBy.specialty || "—"}</Fact>
            <Fact label="Reported on">{formatDateCommaTime(new Date(result.reportedAt))}</Fact>
          </dl>
        </section>

        {result.files.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border p-6">
            <h2 data-pdf-unit className="type-h5 text-fg-heading">
              Images and documents
            </h2>
            <ul className="flex flex-col gap-2">
              {result.files.map((file) => (
                <li
                  key={file.id}
                  data-pdf-unit
                  className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                >
                  <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary">
                    {file.kind === "pdf" ? (
                      <FilePdfIcon className="size-4" />
                    ) : (
                      <ImageIcon className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 type-body-sm-medium wrap-anywhere text-fg-heading">
                    {file.name}
                  </span>
                  <span className="shrink-0 type-caption text-fg-caption">
                    {formatDay(new Date(file.uploadedAt))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer
          data-pdf-unit
          className="mt-2 flex items-center justify-between border-t pt-5 type-caption text-fg-caption"
        >
          <span className="flex items-center gap-1.5">
            <img src={logoUrl} alt="" className="size-4 object-contain" />
            Powered by DocuHealth
          </span>
          <span>Issued {formatDay(issuedAt)}</span>
        </footer>
      </div>
    </div>
  );
}

function HeaderFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-r border-primary-foreground/20 px-3 first:pl-0 last:border-r-0">
      <dt className="type-label text-primary-foreground/70">{label}</dt>
      <dd className="type-body-sm-tight-semibold wrap-anywhere text-primary-foreground">
        {children}
      </dd>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="type-label text-fg-caption">{label}</dt>
      <dd className="type-body-sm-medium text-fg-heading">{children}</dd>
    </div>
  );
}

/** One part of the report, its lines numbered or as paragraphs; nothing when it's empty. */
function ReportText({
  label,
  lines,
  numbered,
}: {
  label: string;
  lines: string[];
  numbered?: boolean;
}) {
  if (lines.length === 0) return null;
  return (
    <div data-pdf-unit className="flex flex-col gap-1.5 border-t pt-4">
      <p className="type-label text-fg-caption">{label}</p>
      {numbered && lines.length > 1 ? (
        <ol className="flex list-decimal flex-col gap-1 pl-5 type-body-sm-regular text-fg-heading">
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ol>
      ) : (
        lines.map((line, index) => (
          <p key={index} className="type-body-sm-regular text-fg-heading">
            {line}
          </p>
        ))
      )}
    </div>
  );
}

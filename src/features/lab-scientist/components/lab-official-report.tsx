import type { ReactNode, Ref } from "react";
import logoUrl from "@/assets/logos/logo.svg";
import { sexLabel, type TestOrder } from "@/features/lab-scientist/api/schemas";
import { FlagTag } from "@/features/lab-scientist/components/status-tag";
import { maskedHin } from "@/features/lab-scientist/lib/names";
import { flagFor, referenceRange, resultReviewLabels } from "@/features/lab-scientist/lib/stage";
import { ageOn, formatDateCommaTime, formatDay, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Result = NonNullable<TestOrder["result"]>;

/**
 * The branded lab report a completed order prints and downloads as: the hospital and patient,
 * then each test's values against their reference ranges, the interpretation and clinical
 * correlation. Laid out for an A4 page, 794px wide; `data-pdf-unit` marks where pages may break.
 */
export function LabOfficialReport({
  ref,
  order,
  result,
  issuedAt,
}: {
  ref?: Ref<HTMLDivElement>;
  order: TestOrder;
  result: Result;
  /** When it's printed or downloaded, for the patient's age and the footer. */
  issuedAt: Date;
}) {
  const { patient, provider } = order;
  const ageAndSex = [
    `${ageOn(new Date(patient.dateOfBirth), issuedAt)} yrs`,
    sexLabel(patient.sex),
  ].filter(Boolean);
  const tests = order.items
    .filter((item) => item.status !== "rejected")
    .map((item) => ({
      ...item,
      parameters: order.tests.filter((test) => test.itemId === item.id),
    }));

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
          <p className="shrink-0 type-heading-sm text-primary-foreground">Laboratory report</p>
        </div>
        <dl className="grid grid-cols-4 border-t border-primary-foreground/20 pt-5">
          <HeaderFact label="Patient name">{patient.name}</HeaderFact>
          <HeaderFact label="HIN">{maskedHin(patient.hin)}</HeaderFact>
          <HeaderFact label="Age / sex">{ageAndSex.join(" · ")}</HeaderFact>
          <HeaderFact label="Requested on">
            {formatDateCommaTime(new Date(order.requestedAt))}
          </HeaderFact>
        </dl>
      </header>

      <div className="flex flex-col gap-4 px-8 pt-5 pb-6">
        <dl data-pdf-unit className="grid grid-cols-3 gap-6 rounded-2xl border p-5">
          <Fact label="Requested by">{order.requestedBy || "—"}</Fact>
          <Fact label="Sample collected">
            {order.sampleCollectedAt ? formatDateCommaTime(new Date(order.sampleCollectedAt)) : "—"}
          </Fact>
          <Fact label="Result uploaded">{formatDateCommaTime(new Date(result.uploadedAt))}</Fact>
        </dl>

        {tests.map((test, index) => (
          <section key={test.id} className="flex flex-col rounded-2xl border px-6 pt-5 pb-2">
            <div data-pdf-unit className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <h2 className="type-h5 text-fg-heading">
                  {tests.length > 1 ? `Test ${index + 1} – ${test.name}` : test.name}
                </h2>
                <span className="type-caption-semibold text-success-700">
                  {resultReviewLabels[test.status] ?? "Result ready"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_9rem_11rem_8rem] gap-4 border-b pb-2 type-label text-fg-caption">
                <span>Test</span>
                <span>Result</span>
                <span>Reference range</span>
                <span>Flag</span>
              </div>
            </div>
            {test.parameters.map((parameter) => {
              const value = result.values.find(({ loinc }) => loinc === parameter.loinc)?.value;
              const flag = typeof value === "number" ? flagFor(parameter, value) : null;
              return (
                <div
                  key={parameter.id}
                  data-pdf-unit
                  className="grid grid-cols-[1fr_9rem_11rem_8rem] items-center gap-4 border-b py-3 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="type-body-sm-medium text-fg-heading">{parameter.name}</span>
                    <span className="type-caption text-fg-caption">LOINC {parameter.loinc}</span>
                  </div>
                  <span className="type-body-sm-regular">
                    {value === undefined || value === "" ? (
                      "—"
                    ) : (
                      <>
                        <span
                          className={cn(
                            "type-body-sm-tight-semibold",
                            flag && flag !== "normal" ? "text-error-700" : "text-fg-heading",
                          )}
                        >
                          {value}
                        </span>{" "}
                        <span className="text-fg-caption">{parameter.unit}</span>
                      </>
                    )}
                  </span>
                  <span className="type-body-sm-regular">{referenceRange(parameter)}</span>
                  <span>{flag && <FlagTag flag={flag} />}</span>
                </div>
              );
            })}
          </section>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <NumberedText label="Interpretation" text={result.interpretation} />
          <NumberedText label="Clinical correlation" text={result.clinicalCorrelation} />
        </div>

        <ReportFooter issuedAt={issuedAt} />
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

/** A titled block whose text is numbered line by line; nothing when it has no text. */
function NumberedText({ label, text }: { label: string; text: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div data-pdf-unit className="flex flex-col gap-2 rounded-2xl border p-5">
      <p className="type-label text-fg-caption">{label}</p>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 type-body-sm-regular text-fg-heading">
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
    </div>
  );
}

function ReportFooter({ issuedAt }: { issuedAt: Date }) {
  return (
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
  );
}

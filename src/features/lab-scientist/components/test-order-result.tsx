import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { OrderCard } from "@/components/dashboard/order-card";
import { TableCell, TableRow } from "@/components/ui/table";
import type { LabTest, TestOrder } from "@/features/lab-scientist/api/schemas";
import { FlagTag } from "@/features/lab-scientist/components/status-tag";
import { TestName } from "@/features/lab-scientist/components/test-name";
import { flagFor, referenceRange } from "@/features/lab-scientist/lib/stage";
import { formatDateCommaTime } from "@/lib/format";

type Result = NonNullable<TestOrder["result"]>;

// On narrow cards the reference range moves under the result.
const columns = {
  test: "",
  result: "w-[24%]",
  range: "hidden w-[26%] @md:table-cell",
  flag: "w-32",
};

/** A completed order's results, then the interpretation and clinical correlation beside it. */
export function TestOrderResult({ order, result }: { order: TestOrder; result: Result }) {
  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="test-results"
        className="@container flex flex-col rounded-xl border bg-card p-4 sm:p-5"
      >
        <h2 id="test-results" className="type-body-sm-tight-semibold text-fg-heading">
          Results
        </h2>
        <p className="type-body-sm-regular text-fg-caption">
          Uploaded {formatDateCommaTime(new Date(result.uploadedAt))}
        </p>
        <DashboardTable
          className="type-body-sm-regular"
          columns={[
            { label: "Test", className: `${columns.test} type-body-sm-regular` },
            { label: "Result", className: `${columns.result} type-body-sm-regular` },
            { label: "Reference range", className: `${columns.range} type-body-sm-regular` },
            { label: "Flag", className: `${columns.flag} type-body-sm-regular` },
          ]}
        >
          {order.tests.map((test) => {
            const value = result.values.find(({ loinc }) => loinc === test.loinc)?.value;
            return (
              <TableRow key={test.loinc}>
                <TableCell className={columns.test}>
                  <TestName test={test} />
                </TableCell>
                <TableCell className={columns.result}>
                  {value === undefined ? (
                    <span className="text-fg-caption">—</span>
                  ) : (
                    <div className="flex flex-col">
                      <span>
                        <span className="type-body-sm-tight-semibold text-fg-heading">{value}</span>{" "}
                        <span className="text-fg-caption">{test.unit}</span>
                      </span>
                      <span className="text-fg-caption @md:hidden">{referenceRange(test)}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className={columns.range}>{referenceRange(test)}</TableCell>
                <TableCell className={columns.flag}>
                  <ResultFlagTag test={test} value={value} />
                </TableCell>
              </TableRow>
            );
          })}
        </DashboardTable>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <NumberedCard title="Interpretation" text={result.interpretation} />
        <NumberedCard title="Clinical correlation" text={result.clinicalCorrelation} />
      </div>
    </div>
  );
}

/** A titled card whose text is numbered line by line. */
function NumberedCard({ title, text }: { title: string; text: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <OrderCard title={title}>
      <ol className="flex list-decimal flex-col gap-3 pl-5 type-body-sm-regular text-fg-body">
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
    </OrderCard>
  );
}

/** A numeric result's flag against its range; nothing for text results or text ranges. */
function ResultFlagTag({ test, value }: { test: LabTest; value: number | string | undefined }) {
  const flag = typeof value === "number" ? flagFor(test, value) : null;
  return flag ? <FlagTag flag={flag} /> : null;
}

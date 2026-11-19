import { TestOrderActions } from "@/features/lab-scientist/components/test-order-actions";
import { TestRecords } from "@/features/lab-scientist/components/test-records";
import type { Period } from "@/lib/period";

/** The Test orders page: every order sent to the lab in the period, by stage. */
export function TestOrders({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Test Records</h1>
          <p className="type-body-sm-regular text-fg-caption">
            Manage test orders, track progress, and view results.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <TestOrderActions />
        </div>
      </div>

      <TestRecords period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}

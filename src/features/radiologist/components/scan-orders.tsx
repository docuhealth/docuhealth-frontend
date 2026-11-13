import { SCAN_ORDERS_PAGE_SIZES } from "@/features/radiologist/api/queries";
import { scanOrderTabLabels } from "@/features/radiologist/api/schemas";
import { ScanOrderActions } from "@/features/radiologist/components/scan-order-actions";
import { ScanRecords } from "@/features/radiologist/components/scan-records";
import type { Period } from "@/lib/period";

/** The Scan Orders page: every order sent to radiology in the period, by stage. */
export function ScanOrders({
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
          <h1 className="type-h4">Scan Orders</h1>
          <p className="type-body-sm-regular text-fg-caption">
            Manage test orders, track progress, and view results.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-4 *:flex-1 sm:w-auto sm:*:flex-none">
          <ScanOrderActions />
        </div>
      </div>

      <ScanRecords
        tabLabels={scanOrderTabLabels}
        pageSizes={SCAN_ORDERS_PAGE_SIZES}
        period={period}
        onPeriodChange={onPeriodChange}
      />
    </div>
  );
}

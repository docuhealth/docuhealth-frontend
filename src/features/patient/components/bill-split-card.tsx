import type { Bill } from "@/features/patient/api/pending-bills";
import { billSplit, type SplitKey, splitTicks } from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { cn } from "@/lib/utils";

const colours: Record<SplitKey, string> = {
  paid: "bg-success-500",
  hmo: "bg-info-500",
  outstanding: "bg-warning-500",
};

/** How many ticks the bar is drawn with. */
const TICKS = 40;

/**
 * "Amount billed": the total, a bar of ticks split into paid by you (green), the HMO's share
 * (blue) and what's outstanding (amber), and a legend with each amount.
 */
export function BillSplitCard({ bill }: { bill: Bill }) {
  const parts = billSplit(bill);
  const ticks = splitTicks(parts, TICKS);
  return (
    <section
      aria-label="Amount billed"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-3 border-b pb-4">
        <div className="flex items-center justify-between gap-4">
          <p className="type-body-sm-regular text-fg-body">Amount billed</p>
          <p className="type-body-sm-medium text-fg-heading">{formatNaira(bill.billed)}</p>
        </div>
        <div aria-hidden className="flex h-6 gap-1">
          {ticks.map((key, index) => (
            <span key={index} className={cn("flex-1 rounded-full", colours[key])} />
          ))}
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {parts.map((part) => (
          <li key={part.key} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2.5 shrink-0 rounded-xs", colours[part.key])} />
            <span className="flex-1 type-caption text-fg-body">{part.label}</span>
            <span className="type-body-sm-medium text-fg-heading">{formatNaira(part.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

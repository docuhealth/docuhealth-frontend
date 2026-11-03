import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Period, periodLabels } from "@/lib/period";

/** "Today / This Week / This Month" picker for a page's numbers (48px, 14px medium text). */
export function PeriodSelect({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <Select items={periodLabels} value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger
        aria-label="Period"
        className="min-w-32 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading [&_svg]:text-fg-heading"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(periodLabels).map(([period, label]) => (
          <SelectItem key={period} value={period}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

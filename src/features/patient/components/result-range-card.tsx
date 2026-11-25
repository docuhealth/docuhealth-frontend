import { RangeBar } from "@/features/patient/components/range-bar";
import {
  rangeLabel,
  rangePosition,
  rangeVerdict,
  type ResultValue,
} from "@/features/patient/lib/results";

/** Where a value sits against its normal range, as words and a bar, and what it means. */
export function ResultRangeCard({ value }: { value: ResultValue }) {
  const verdict = rangeVerdict(value);
  const position = rangePosition(value);
  const range = rangeLabel(value, " ");
  if (!verdict && !value.about) return null;
  return (
    <section
      aria-label="Normal range"
      className="flex flex-col gap-3 rounded-xl border bg-card p-4"
    >
      {verdict && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="type-body-sm-medium text-fg-heading">{verdict}</h2>
          {range && <p className="type-caption text-fg-caption">Normal {range}</p>}
        </div>
      )}
      {position != null && <RangeBar position={position} flag={value.flag} />}
      {value.about && <p className="type-caption text-fg-body">{value.about}</p>}
    </section>
  );
}

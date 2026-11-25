import { cn } from "@/lib/utils";

/** The Trends chart's small All / 1Y / 5Y switch, one chosen. */
export function TrendPeriodSwitch<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Period"
      className="inline-flex min-w-48 rounded-md bg-line p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-sm px-3 py-1 type-caption whitespace-nowrap transition-colors",
            option.value === value
              ? "bg-card text-fg-heading shadow-sm"
              : "text-fg-caption hover:text-fg-heading",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

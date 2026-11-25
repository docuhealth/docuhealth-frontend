import { cn } from "@/lib/utils";

/** One fact in the Health page's summary (Blood group, Genotype ...); `alert` tints it red. */
export function SummaryTile({
  icon,
  label,
  value,
  alert = false,
}: {
  /** The fact's colored icon, an SVG's URL from `src/assets/svgs`. */
  icon: string;
  label: string;
  value: string | null;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-4",
        alert ? "bg-error-100" : "bg-brand-50",
      )}
    >
      <img src={icon} alt="" className="size-5 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <p className="type-body-sm-medium text-fg-heading">{label}</p>
        <p className={cn("truncate type-caption", alert ? "text-error-500" : "text-primary")}>
          {value ?? "No record"}
        </p>
      </div>
    </div>
  );
}

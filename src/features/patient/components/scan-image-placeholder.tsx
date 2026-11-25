import { ScanIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Where a scan image goes: the scan icon on the viewer's dark ground, with an optional label.
 * TODO(api): no image URLs for patients yet, so every image is this placeholder.
 */
export function ScanImagePlaceholder({
  label,
  className,
  iconClassName,
}: {
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn("flex flex-col items-center justify-center gap-2 text-white/70", className)}
    >
      <ScanIcon aria-hidden className={cn("size-6", iconClassName)} />
      {label && <span className="type-caption">{label}</span>}
    </span>
  );
}

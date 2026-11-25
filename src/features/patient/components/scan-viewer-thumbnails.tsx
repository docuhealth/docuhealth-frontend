import { SectionLabel } from "@/features/patient/components/patient-ui";
import { ScanImagePlaceholder } from "@/features/patient/components/scan-image-placeholder";
import { cn } from "@/lib/utils";

/** The viewer's image list: a dark tile per image, the open one outlined in brand. */
export function ScanViewerThumbnails({
  count,
  value,
  onChange,
}: {
  count: number;
  value: number;
  onChange: (image: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Images ({count})</SectionLabel>
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {Array.from({ length: count }, (_, index) => {
          const image = index + 1;
          return (
            <li key={image}>
              <button
                type="button"
                aria-pressed={image === value}
                onClick={() => onChange(image)}
                className={cn(
                  "flex h-25 w-full items-center justify-center rounded-lg border-2 bg-fg-heading",
                  image === value ? "border-primary" : "border-transparent hover:border-white/30",
                )}
              >
                <ScanImagePlaceholder label={`Image ${image}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

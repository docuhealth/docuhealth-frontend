import { Link } from "@tanstack/react-router";
import { ScanCard } from "@/features/patient/components/scan-card";
import { ScanImagePlaceholder } from "@/features/patient/components/scan-image-placeholder";
import { plural } from "@/lib/format";

/** A ready scan's images as dark thumbnails, each opening the viewer on it. */
export function ScanImagesCard({ scanId, images }: { scanId: string; images: number }) {
  return (
    <ScanCard title={`Images (${images})`}>
      <ul className="flex flex-wrap gap-2">
        {Array.from({ length: images }, (_, index) => (
          <li key={index}>
            <Link
              to="/patient/health/scans/$scanId/viewer"
              params={{ scanId }}
              search={{ image: index + 1 }}
              aria-label={`Open image ${index + 1}`}
              className="grid size-19 place-content-center rounded-lg bg-fg-heading transition-opacity hover:opacity-90"
            >
              <ScanImagePlaceholder />
            </Link>
          </li>
        ))}
      </ul>
      <p className="type-caption text-fg-caption">
        {plural(images, "image")} · Tap to open the viewer
      </p>
    </ScanCard>
  );
}

import { ScanIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { ScanNote } from "@/features/patient/components/scan-note";
import { ScanViewerStage } from "@/features/patient/components/scan-viewer-stage";
import { ScanViewerThumbnails } from "@/features/patient/components/scan-viewer-thumbnails";
import { useScans } from "@/features/patient/lib/use-scans";
import { formatDay } from "@/lib/format";

/**
 * A ready scan's images, one at a time, with zoom; ← and → move between them. TODO(api): no
 * image URLs for patients yet, so each image is a placeholder.
 */
export function ScanViewer({
  scanId,
  image,
  onImage,
}: {
  scanId: string;
  /** The open image, from 1. */
  image: number;
  onImage: (image: number) => void;
}) {
  const { scans, isError } = useScans();
  const scan = scans?.find((candidate) => candidate.id === scanId);
  const count = scan?.state === "ready" ? (scan.report?.images ?? 0) : 0;
  const current = Math.min(Math.max(1, image), Math.max(1, count));

  useEffect(() => {
    if (count < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select"))
        return;
      if (event.key === "ArrowRight") onImage(current === count ? 1 : current + 1);
      if (event.key === "ArrowLeft") onImage(current === 1 ? count : current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, current, onImage]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={scan?.name ?? "Scan viewer"}
        back={{
          to: "/patient/health/scans/$scanId",
          params: { scanId },
          label: "Back to Scan details",
        }}
      />
      {!scans && !isError ? (
        <ListSkeleton />
      ) : !scan || count === 0 ? (
        <PatientEmpty
          icon={<ScanIcon />}
          title="No images to show"
          description="Images are shared once the scan’s report is ready."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_12.5rem]">
          <ScanViewerStage
            key={current}
            index={current}
            count={count}
            label={`${scan.report?.type ?? "Scan"} image`}
          />
          <div className="flex flex-col gap-4">
            <ScanViewerThumbnails count={count} value={current} onChange={onImage} />
            <dl className="flex flex-col divide-y rounded-xl border bg-card px-3">
              {[
                ["Scan", scan.name],
                ["Date", formatDay(new Date(scan.scannedAt))],
                ["Facility", scan.facility ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5 py-3">
                  <dt className="type-caption text-fg-caption">{label}</dt>
                  <dd className="type-body-sm-medium text-fg-heading">{value}</dd>
                </div>
              ))}
            </dl>
            <ScanNote title="For reference only">
              Viewer images are for reference. Your doctor uses the full-quality originals.
            </ScanNote>
          </div>
        </div>
      )}
    </div>
  );
}

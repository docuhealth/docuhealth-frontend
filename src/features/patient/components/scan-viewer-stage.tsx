import { ArrowsOutIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ScanImagePlaceholder } from "@/features/patient/components/scan-image-placeholder";

const MIN_ZOOM = 50;
const MAX_ZOOM = 300;
const STEP = 25;
const clamp = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

/**
 * The viewer's dark panel: one image, which of how many, and zoom (buttons or the scroll wheel)
 * and fullscreen. Remount it (`key`) to start a new image at 100%. TODO(api): the image is a
 * placeholder until scans have image URLs.
 */
export function ScanViewerStage({
  index,
  count,
  label,
}: {
  index: number;
  count: number;
  label: string;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState(100);

  // React's wheel listener is passive, so it can't stop the page scrolling while zooming.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((current) => clamp(current + (event.deltaY < 0 ? STEP : -STEP)));
    };
    panel.addEventListener("wheel", onWheel, { passive: false });
    return () => panel.removeEventListener("wheel", onWheel);
  }, []);

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void panelRef.current?.requestFullscreen?.();
  }

  const control =
    "grid size-6 place-content-center rounded-md text-white hover:bg-white/10 disabled:opacity-40";

  return (
    <section
      ref={panelRef}
      aria-label="Image viewer"
      className="relative flex min-h-96 flex-1 flex-col overflow-hidden rounded-xl bg-fg-heading lg:min-h-[28rem]"
    >
      <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/10 px-2.5 py-1 type-caption text-white">
          Image {index} of {count}
        </span>
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom(clamp(zoom - STEP))}
            className={control}
          >
            <MinusIcon className="size-3.5" />
          </button>
          <span aria-live="polite" className="w-10 text-center type-caption text-white">
            {zoom}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom(clamp(zoom + STEP))}
            className={control}
          >
            <PlusIcon className="size-3.5" />
          </button>
          <button type="button" aria-label="Full screen" onClick={fullscreen} className={control}>
            <ArrowsOutIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid flex-1 place-content-center overflow-hidden">
        <div
          data-testid="scan-image"
          className="transition-transform duration-150"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <ScanImagePlaceholder label={label} iconClassName="size-12" />
        </div>
      </div>
      <p className="pb-3 text-center type-caption text-white/60">
        Scroll to zoom · Use ← → for next image
      </p>
    </section>
  );
}

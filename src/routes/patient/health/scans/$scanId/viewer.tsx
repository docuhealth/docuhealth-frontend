import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ScanViewer } from "@/features/patient/components/scan-viewer";

export const Route = createFileRoute("/patient/health/scans/$scanId/viewer")({
  // Which image is open, from 1.
  validateSearch: z.object({ image: z.number().int().min(1).optional().catch(undefined) }),
  component: Page,
});

function Page() {
  const { scanId } = Route.useParams();
  const { image } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ScanViewer
      scanId={scanId}
      image={image ?? 1}
      onImage={(next) => void navigate({ search: { image: next }, replace: true })}
    />
  );
}

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import type { Share } from "@/features/patient/api/pending-sharing";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { ShareDialog } from "@/features/patient/components/share-dialog";
import { ShareTable } from "@/features/patient/components/share-table";
import { SharingBanner } from "@/features/patient/components/sharing-banner";
import { SharingHowItWorks } from "@/features/patient/components/sharing-how-it-works";
import { ShareStopDialog } from "@/features/patient/components/share-stop-dialog";

/**
 * "Share my record": the banner that starts a share, how sharing works, and the shares that
 * still run ("View all" adds the ended ones). `running` is `undefined` while they load.
 */
export function ShareRecordTab({ running, ended }: { running?: Share[]; ended?: Share[] }) {
  const [sharing, setSharing] = useState(false);
  const [stopping, setStopping] = useState<Share | null>(null);
  const [all, setAll] = useState(false);
  const shown = all ? [...(running ?? []), ...(ended ?? [])] : (running ?? []);

  return (
    <>
      <SharingBanner onShare={() => setSharing(true)} />
      <SharingHowItWorks />

      <section aria-label="Active shares" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>{all ? "All shares" : "Active shares"}</SectionLabel>
          {!!ended?.length && (
            <button
              type="button"
              onClick={() => setAll(!all)}
              className="type-body-sm-medium text-primary hover:underline"
            >
              {all ? "Active only" : "View all"}
            </button>
          )}
        </div>
        {!running ? (
          <ListSkeleton />
        ) : shown.length === 0 ? (
          <div className="rounded-xl border bg-card">
            <PatientEmpty
              icon={<ShareNetworkIcon />}
              title="You’re not sharing your record"
              description="When you share your record with a doctor or facility, it shows here until the access ends or you stop it."
            />
          </div>
        ) : (
          <ShareTable shares={shown} onStop={setStopping} />
        )}
      </section>

      <ShareDialog open={sharing} onOpenChange={setSharing} onStop={setStopping} />
      {stopping && <ShareStopDialog share={stopping} onClose={() => setStopping(null)} />}
    </>
  );
}

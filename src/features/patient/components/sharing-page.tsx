import { useQuery } from "@tanstack/react-query";
import { sharesQuery } from "@/features/patient/api/pending-sharing";
import { AccessHistoryTab } from "@/features/patient/components/access-history-tab";
import { PageHeading } from "@/features/patient/components/page-heading";
import { Segments } from "@/features/patient/components/patient-ui";
import { PrivacyConsentTab } from "@/features/patient/components/privacy-consent-tab";
import { ShareRecordTab } from "@/features/patient/components/share-record-tab";
import { type SharingTab, sortShares } from "@/features/patient/lib/sharing";
import { plural } from "@/lib/format";

/**
 * Sharing & privacy: sharing the record with a doctor, who has looked at it, and consent.
 * TODO(api): all of it comes from `pending-sharing.ts` until the API has sharing.
 */
export function SharingPage({ tab, onTab }: { tab: SharingTab; onTab: (tab: SharingTab) => void }) {
  const { data: shares, isError } = useQuery(sharesQuery());
  const sorted = shares ? sortShares(shares) : isError ? sortShares([]) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Sharing & privacy"
        subtitle={
          !sorted
            ? null
            : sorted.running.length === 0
              ? "Not sharing your record"
              : `${plural(sorted.running.length, "active share")}`
        }
      />
      <Segments
        label="Sharing & privacy"
        value={tab}
        onChange={onTab}
        options={[
          { value: "share", label: "Share my record" },
          { value: "history", label: "Access history" },
          { value: "privacy", label: "Privacy & consent" },
        ]}
      />
      {tab === "share" && <ShareRecordTab running={sorted?.running} ended={sorted?.ended} />}
      {tab === "history" && <AccessHistoryTab />}
      {tab === "privacy" && <PrivacyConsentTab />}
    </div>
  );
}

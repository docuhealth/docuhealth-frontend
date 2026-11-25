import { EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import healthcareIconUrl from "@/assets/svgs/healthcare.svg";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { accessHistoryQuery } from "@/features/patient/api/pending-sharing";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { RelatedRow } from "@/features/patient/components/related-row";
import { accessEventTitle } from "@/features/patient/lib/sharing";
import { formatDateCommaTime } from "@/lib/format";

// TODO(design): no design for this tab yet; it follows the record lists' style.
// TODO(api): no access log for patients yet; see `pending-sharing.ts`.

/** "Access history": who opened which part of the record, newest first. */
export function AccessHistoryTab() {
  const { data: events, isError } = useQuery(accessHistoryQuery());

  if (!events && !isError) return <ListSkeleton />;
  const sorted = [...(events ?? [])].sort((a, b) => b.at.localeCompare(a.at));
  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <PatientEmpty
          icon={<EyeIcon />}
          title="No one has viewed your record yet"
          description="When someone opens your record through a share, you’ll see who, what and when here."
        />
      </div>
    );
  }

  return (
    <section aria-label="Access history" className="flex flex-col gap-2">
      <SectionLabel>Who viewed your record</SectionLabel>
      <RecordList label="Who viewed your record">
        {sorted.map((event) => (
          <RelatedRow
            key={event.id}
            tone="success"
            icon={<img src={healthcareIconUrl} alt="" />}
            title={accessEventTitle(event)}
            detail={[formatDateCommaTime(new Date(event.at)), event.facility]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </RecordList>
      <p className="type-caption text-fg-caption">
        Something here you don’t recognise? Stop the share it came through on the Share my record
        tab.
      </p>
    </section>
  );
}

import { BuildingsIcon, MapPinIcon, PencilSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { InfoRow, ProfileCard } from "@/components/dashboard/profile-card";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { labDetailsQuery } from "@/features/lab-scientist/api/queries";
import { LabDetailsDialog } from "@/features/lab-scientist/components/lab-details-dialog";

/** The lab's name, address and phone, as its reports print them; the lab's admin corrects them. */
export function LabDetailsCard() {
  const { data, isError } = useQuery(labDetailsQuery());
  const [editing, setEditing] = useState(false);
  const address = data
    ? [data.street, data.city, data.state, data.country].filter(Boolean).join(", ")
    : "";

  return (
    <ProfileCard
      title="Lab details"
      description="Your lab’s name, address and phone, as patients and doctors see them on results."
      action={
        data && (
          <Button
            variant="outline"
            className="h-10 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading"
            onClick={() => setEditing(true)}
          >
            <PencilSimpleIcon data-icon="inline-start" />
            Edit
          </Button>
        )
      }
    >
      {isError ? (
        <EmptyState
          compact
          description="We couldn’t load your lab’s details. Try again in a moment."
        />
      ) : !data ? (
        <CardSkeleton lines={3} />
      ) : (
        <dl className="divide-y">
          <InfoRow icon={<BuildingsIcon />} label="Name">
            {data.name || "—"}
          </InfoRow>
          <InfoRow icon={<MapPinIcon />} label="Address">
            {address || "—"}
          </InfoRow>
          <InfoRow icon={<PhoneIcon />} label="Phone">
            {data.phone ?? "—"}
          </InfoRow>
        </dl>
      )}
      {data && <LabDetailsDialog lab={data} open={editing} onOpenChange={setEditing} />}
    </ProfileCard>
  );
}

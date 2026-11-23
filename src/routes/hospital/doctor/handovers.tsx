import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { HandoverHistory } from "@/features/clinical/components/handover-history";

export const Route = createFileRoute("/hospital/doctor/handovers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(clinicalProfileQuery()),
  component: HandoversPage,
});

function HandoversPage() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <div className="flex flex-col gap-6">
      <title>Handover notes · DocuHealth</title>
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Handover notes</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Patients handed over between shifts, to you and by you.
        </p>
      </div>
      <HandoverHistory staff="doctor" myId={profile.user.id} />
    </div>
  );
}

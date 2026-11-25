import { BellIcon, UserIcon, UserMinusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import {
  POWERS,
  type Power,
  type ProxyGrant,
  proxiesQuery,
  useProxyAction,
} from "@/features/patient/api/family";
import { useUpdateProxyPowers } from "@/features/patient/api/pending-family";
import { FamilyDetailsDialog } from "@/features/patient/components/family-details-dialog";
import { FamilyProfileCard } from "@/features/patient/components/family-profile-card";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { ProxyPowerSwitches } from "@/features/patient/components/proxy-power-switches";
import { accessLine, liveGrants } from "@/features/patient/lib/family";
import { getErrorMessage } from "@/lib/api";
import { formatDay } from "@/lib/format";

const back = { to: "/patient/family" as const, label: "Back to Family & proxy" };

/** A proxy's access: what they may do (switches), saving changes, and removing their access. */
export function ProxyAccessPage({ proxyId }: { proxyId: string }) {
  const { data, isError } = useQuery(proxiesQuery());
  const [now] = useState(() => new Date());
  const grant = data && liveGrants(data, now).find((candidate) => candidate.id === proxyId);

  if (!data && !isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeading title="Proxy access" back={back} />
        <ListSkeleton />
      </div>
    );
  }
  if (!grant) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeading title="Proxy access" back={back} />
        <PatientEmpty
          icon={<UserIcon />}
          title="Proxy not found"
          description="Their access may have ended, or the request expired."
        />
      </div>
    );
  }
  // Remounts when the saved powers change, so the switches start from them.
  return <ProxyAccess key={grant.powers.join()} grant={grant} now={now} />;
}

function ProxyAccess({ grant, now }: { grant: ProxyGrant; now: Date }) {
  const navigate = useNavigate();
  const save = useUpdateProxyPowers();
  const end = useProxyAction();
  const [powers, setPowers] = useState<Power[]>(grant.powers);
  const [removing, setRemoving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const first = grant.proxy.firstName;
  const changed =
    powers.length !== grant.powers.length || powers.some((power) => !grant.powers.includes(power));
  const pending = grant.status === "pending";

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={`${first}’s access`} back={back} />
      <FamilyProfileCard
        name={grant.proxy.name}
        detail={[
          grant.relationship,
          `${pending ? "Asked" : "Added"} ${formatDay(new Date(grant.createdAt))}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        onOpen={() => setShowDetails(true)}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2">
          <SectionLabel>What can {first} do?</SectionLabel>
          <ProxyPowerSwitches
            powers={POWERS}
            value={powers}
            onChange={setPowers}
            wording="detail"
          />
        </section>
        <div className="flex flex-col gap-3 lg:mt-6">
          <p className="flex items-center gap-2 rounded-lg bg-warning-100 px-4 py-2.5 type-caption text-warning-700">
            <BellIcon className="size-4 shrink-0" aria-hidden />
            You’ll get a security alert whenever proxy access changes.
          </p>
          <Button
            type="button"
            className="h-11 w-full type-heading-sm"
            disabled={!changed || powers.length === 0}
            loading={save.isPending}
            onClick={() =>
              save.mutate(
                { id: grant.id, powers },
                {
                  onSuccess: () => toast.success(`${first}’s access is updated`),
                  onError: (error) => toast.error(getErrorMessage(error)),
                },
              )
            }
          >
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-error-500 type-heading-sm text-error-500 hover:bg-error-100 hover:text-error-500"
            onClick={() => setRemoving(true)}
          >
            Remove access
          </Button>
        </div>
      </div>

      {removing && (
        <ConfirmDialog
          tone="danger"
          icon={<UserMinusIcon />}
          title={`Remove ${first}’s access?`}
          confirmLabel="Remove access"
          pending={end.isPending}
          onClose={() => setRemoving(false)}
          onConfirm={() =>
            end.mutate(
              { id: grant.id, action: "end" },
              {
                onSuccess: () => {
                  toast.success(`${first} no longer has access`);
                  void navigate({ to: "/patient/family" });
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              },
            )
          }
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            {first} loses access to your account straight away. To let them help again, you’ll need
            to send a new request.
          </DialogDescription>
        </ConfirmDialog>
      )}
      {showDetails && (
        <FamilyDetailsDialog
          title={grant.proxy.name}
          description="Your proxy’s details."
          rows={[
            ["HIN", grant.proxy.hin],
            ["Relationship", grant.relationship || null],
            ["Status", pending ? "Waiting for them to accept" : "Active"],
            [pending ? "Asked" : "Added", formatDay(new Date(grant.createdAt))],
            ["Access", accessLine(grant, now)],
          ]}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}

import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import {
  dependantsQuery,
  heldProxiesQuery,
  type ProxyGrant,
  proxiesQuery,
} from "@/features/patient/api/family";
import { dependantExtrasQuery } from "@/features/patient/api/pending-family";
import { AddDependantDialog } from "@/features/patient/components/add-dependant-dialog";
import { AddProxyDialog } from "@/features/patient/components/add-proxy-dialog";
import { FamilyEmpty } from "@/features/patient/components/family-empty";
import { FamilyPersonRow } from "@/features/patient/components/family-person-row";
import { FamilyPlaceholderCard } from "@/features/patient/components/family-placeholder-card";
import { PageHeading } from "@/features/patient/components/page-heading";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { ProxyReviewDialog } from "@/features/patient/components/proxy-review-dialog";
import { Tag } from "@/features/patient/components/tag";
import { ageShort, familySubtitle, grantLine, liveGrants } from "@/features/patient/lib/family";
import { plural } from "@/lib/format";

/**
 * Family & proxy: the patient's dependants and the proxies they've asked to help them (left),
 * and the people who've made them their proxy (right), with both ways to add someone.
 */
export function FamilyPage() {
  const dependants = useQuery(dependantsQuery());
  const proxies = useQuery(proxiesQuery());
  const held = useQuery(heldProxiesQuery());
  // TODO(api): photos and due vaccines are pending data (api/pending-family.ts).
  const extras = useQuery(dependantExtrasQuery()).data ?? [];
  const [adding, setAdding] = useState<"dependant" | "proxy" | null>(null);
  const [reviewing, setReviewing] = useState<ProxyGrant | null>(null);
  const [now] = useState(() => new Date());

  // A list that failed to load counts as empty, so the rest of the page still shows.
  const dependantList = dependants.data ?? (dependants.isError ? [] : undefined);
  const proxyList = proxies.data ?? (proxies.isError ? [] : undefined);
  const heldList = held.data ?? (held.isError ? [] : undefined);
  const loading = !dependantList || !proxyList || !heldList;
  const given = proxyList ? liveGrants(proxyList, now) : [];
  const helping = heldList ? liveGrants(heldList, now) : [];
  const nobody = !loading && !dependantList.length && !given.length && !helping.length;

  const addDependant = () => setAdding("dependant");
  const addProxy = () => setAdding("proxy");

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Family & proxy"
        subtitle={loading ? null : familySubtitle(dependantList.length, given)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-body-sm-regular text-fg-body">
          Manage care for your dependents, or let someone you trust help with yours. Access is never
          unlimited by default.
        </p>
        <div className="flex shrink-0 gap-3 *:flex-1 sm:*:flex-none">
          <Button
            variant="outline"
            onClick={addDependant}
            className="h-10 px-4 type-body-sm-medium text-primary"
          >
            <PlusIcon data-icon="inline-start" />
            Add a dependent
          </Button>
          <Button onClick={addProxy} className="h-10 px-4 type-body-sm-medium">
            <PlusIcon data-icon="inline-start" />
            Add a proxy
          </Button>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : nobody ? (
        <FamilyEmpty onAddDependant={addDependant} onAddProxy={addProxy} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <SectionLabel>Dependents</SectionLabel>
              {dependantList.length ? (
                <RecordList label="Dependents">
                  {dependantList.map((dependant) => {
                    const extra = extras.find((each) => each.hin === dependant.hin);
                    const due = extra?.vaccinesDue.length ?? 0;
                    return (
                      <FamilyPersonRow
                        key={dependant.hin}
                        name={dependant.name}
                        photoUrl={extra?.photoUrl}
                        detail={`${ageShort(dependant.dob, now)} · HIN ${dependant.hin}`}
                        status={
                          due > 0 ? <Tag tone="warning">{plural(due, "vaccine")} due</Tag> : null
                        }
                        to="/patient/family/dependants/$hin"
                        params={{ hin: dependant.hin }}
                      />
                    );
                  })}
                </RecordList>
              ) : (
                <FamilyPlaceholderCard
                  title="Add a child"
                  description="Manage their records, visits and vaccines."
                  onAdd={addDependant}
                />
              )}
            </section>
            <section className="flex flex-col gap-2">
              <SectionLabel>Proxies</SectionLabel>
              {given.length ? (
                <RecordList label="Proxies">
                  {given.map((grant) => (
                    <FamilyPersonRow
                      key={grant.id}
                      name={grant.proxy.name}
                      detail={grantLine(grant)}
                      status={
                        grant.status === "pending" ? (
                          <Tag tone="warning">Pending</Tag>
                        ) : (
                          <Tag tone="success">Active</Tag>
                        )
                      }
                      to="/patient/family/proxies/$proxyId"
                      params={{ proxyId: grant.id }}
                    />
                  ))}
                </RecordList>
              ) : (
                <FamilyPlaceholderCard
                  title="Add someone you trust"
                  description="They can view, book or pay for you."
                  onAdd={addProxy}
                />
              )}
            </section>
          </div>
          <section className="flex flex-col gap-2">
            <SectionLabel>People you help</SectionLabel>
            {helping.length ? (
              <RecordList label="People you help">
                {helping.map((grant) => (
                  <FamilyPersonRow
                    key={grant.id}
                    name={grant.grantedBy.name}
                    detail={grantLine(grant)}
                    status={grant.status === "pending" ? <Tag tone="brand">Request</Tag> : null}
                    onOpen={() => setReviewing(grant)}
                  />
                ))}
              </RecordList>
            ) : (
              <FamilyPlaceholderCard
                title="No one yet"
                description="When someone adds you as their proxy, they’ll appear here. You’ll only have the access they choose to give you."
              />
            )}
          </section>
        </div>
      )}

      <AddDependantDialog
        open={adding === "dependant"}
        onOpenChange={(open) => setAdding(open ? "dependant" : null)}
      />
      <AddProxyDialog
        open={adding === "proxy"}
        onOpenChange={(open) => setAdding(open ? "proxy" : null)}
      />
      {reviewing && <ProxyReviewDialog grant={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}

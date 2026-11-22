import { CheckIcon, CreditCardIcon, WalletIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Figure } from "@/components/dashboard/figure";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { useSubscribe } from "@/features/hospital-admin/api/mutations";
import { subscriptionQuery } from "@/features/hospital-admin/api/queries";
import type { CurrentSubscription, SubscriptionPlan } from "@/features/hospital-admin/api/schemas";
import { getErrorMessage } from "@/lib/api";

const naira = (amount: number) => `₦${amount.toLocaleString("en-GB")}`;

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll(/[_-]/g, " ");

/** Statuses during which the plan is still the hospital's. */
const liveStatuses = new Set(["active", "non_renewing", "non-renewing", "attention"]);

const isCurrent = (plan: SubscriptionPlan, current: CurrentSubscription) =>
  !!current?.planName && current.planName === plan.name && liveStatuses.has(current.status ?? "");

/**
 * The hospital's money with DocuHealth: its wallet (waiting on the backend) and its
 * subscription, where the admin picks a plan and pays for it on Paystack.
 */
export function Wallet() {
  const { data, isError } = useQuery(subscriptionQuery());
  const [choosing, setChoosing] = useState<SubscriptionPlan | null>(null);
  const current = data?.current ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Wallet</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Your hospital’s balance and DocuHealth subscription.
        </p>
      </div>

      <StatGrid className="grid-cols-1 sm:grid-cols-2">
        {/* TODO(api): no wallet endpoints yet. */}
        <StatCard
          icon={<WalletIcon />}
          label="Wallet balance"
          value={<Figure value={null} />}
          note="Not available yet"
        />
        <StatCard
          icon={<CreditCardIcon />}
          label="Current plan"
          value={current?.planName ?? (data ? "Free plan" : "…")}
          note={current?.status ? sentence(current.status) : "No paid plan"}
        />
      </StatGrid>

      <section aria-label="Subscription plans" className="rounded-xl border bg-card p-4">
        <h2 className="type-h5">Subscription plans</h2>
        {isError ? (
          <p className="py-10 text-center type-caption text-fg-caption">
            We couldn’t load the plans. Try again in a moment.
          </p>
        ) : data?.plans.length === 0 ? (
          <p className="py-10 text-center type-caption text-fg-caption">
            There are no plans to choose from yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data?.plans.map((plan) => {
              const mine = isCurrent(plan, current);
              return (
                <li key={plan.id} className="flex flex-col gap-4 rounded-lg border p-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-heading-sm text-fg-heading">{plan.name}</h3>
                      {mine && <StatusPill tone="success">Current plan</StatusPill>}
                    </div>
                    <p className="type-h4">
                      {naira(plan.price)}
                      <span className="type-body-sm-regular text-fg-caption"> / {plan.per}</span>
                    </p>
                  </div>
                  {plan.description && (
                    <p className="type-body-sm-regular text-fg-body">{plan.description}</p>
                  )}
                  {plan.features.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 type-body-sm-regular">
                          <CheckIcon
                            weight="bold"
                            className="mt-0.5 size-4 shrink-0 text-success-500"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="mt-auto h-11 type-heading-sm"
                    disabled={mine || !plan.code}
                    onClick={() => setChoosing(plan)}
                  >
                    {mine ? "Current plan" : `Choose ${plan.name}`}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {choosing && <SubscribeDialog plan={choosing} onClose={() => setChoosing(null)} />}
    </div>
  );
}

function SubscribeDialog({ plan, onClose }: { plan: SubscriptionPlan; onClose: () => void }) {
  const subscribe = useSubscribe();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<CreditCardIcon />}
      title={`Choose ${plan.name}`}
      confirmLabel="Continue to payment"
      pending={subscribe.isPending}
      onClose={() => !subscribe.isPending && onClose()}
      onConfirm={() =>
        subscribe.mutate(plan, {
          onSuccess: ({ authorization_url }) => {
            if (authorization_url) {
              // Paystack's checkout, in a tab of its own so this page stays put.
              window.open(authorization_url, "_blank", "noopener");
              toast.success("Finish paying on Paystack. Your plan starts once it’s paid.");
            } else {
              toast.info("Your subscription is being set up. Check back shortly.");
            }
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Subscribe to {plan.name} for {naira(plan.price)} a {plan.per}? You’ll pay on Paystack, and
        the plan renews each {plan.per} until you cancel.
      </DialogDescription>
    </ConfirmDialog>
  );
}

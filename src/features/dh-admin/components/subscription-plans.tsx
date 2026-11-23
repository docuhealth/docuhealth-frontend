import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { StatusPill } from "@/components/dashboard/status-pill";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSavePlan } from "@/features/dh-admin/api/mutations";
import { plansQuery } from "@/features/dh-admin/api/queries";
import { type Plan, planIntervalLabels, planRoleLabels } from "@/features/dh-admin/api/schemas";
import { type PlanValues, planSchema } from "@/features/dh-admin/lib/schemas";
import { getErrorMessage } from "@/lib/api";

const naira = (amount: number) => `₦${amount.toLocaleString("en-GB")}`;

/**
 * The plans hospitals and individuals subscribe to, which the admin adds and changes.
 * TODO(api): plans can't be retired or removed.
 */
export function SubscriptionPlans() {
  const { data, isError } = useQuery(plansQuery());
  // The plan being edited, `"new"` for a new one.
  const [editing, setEditing] = useState<Plan | "new" | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Subscription plans</h1>
          <p className="type-body-sm-regular text-fg-caption">
            What hospitals and individuals pay for, and what they get.
          </p>
        </div>
        <Button
          className="h-12 w-full gap-2 px-5 type-heading-sm sm:w-auto"
          onClick={() => setEditing("new")}
        >
          <PlusIcon data-icon="inline-start" />
          New plan
        </Button>
      </div>

      {isError || !data || data.length === 0 ? (
        <p className="rounded-xl border bg-card py-10 text-center type-body-sm-regular text-fg-caption">
          {isError
            ? "We couldn’t load the plans. Try again in a moment."
            : data
              ? "No plans yet."
              : "Loading…"}
        </p>
      ) : (
        <ul aria-label="Plans" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((plan) => (
            <li key={plan.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="type-h5">{plan.name}</h2>
                  <p className="type-body-sm-regular text-fg-caption">{plan.description}</p>
                </div>
                <StatusPill tone={plan.role === "test" ? "neutral" : "info"}>
                  {planRoleLabels[plan.role]}
                </StatusPill>
              </div>
              <p className="type-h4">
                {naira(plan.price)}
                <span className="type-body-sm-regular text-fg-caption">
                  {" "}
                  · {planIntervalLabels[plan.interval]}
                </span>
              </p>
              {plan.features.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 type-body-sm-regular text-fg-body">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                <span className="type-caption text-fg-caption">
                  {/* TODO(api): a plan without a Paystack code can't be bought online. */}
                  {plan.code ? "On Paystack" : "Not on Paystack yet"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Edit the ${plan.name} plan`}
                  onClick={() => setEditing(plan)}
                  className="bg-card type-caption-semibold font-sans text-fg-heading"
                >
                  Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormDialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && (
          <PlanForm plan={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        )}
      </FormDialog>
    </div>
  );
}

function PlanForm({ plan, onDone }: { plan: Plan | null; onDone: () => void }) {
  const save = useSavePlan();
  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          price: String(plan.price),
          interval: plan.interval,
          role: plan.role,
          description: plan.description,
          features: plan.features.join("\n"),
        }
      : {
          name: "",
          price: "",
          interval: "monthly",
          role: "hospital",
          description: "",
          features: "",
        },
  });
  const { errors } = form.formState;

  function onSubmit(values: PlanValues) {
    save.mutate(
      {
        id: plan?.id ?? null,
        plan: {
          ...values,
          price: Number(values.price),
          features: values.features
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            plan ? `The ${values.name} plan is updated.` : `The ${values.name} plan is added.`,
          );
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const selects = [
    ["interval", "Billed", planIntervalLabels],
    ["role", "For", planRoleLabels],
  ] as const;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={plan ? "Edit plan" : "New plan"}
        description={
          plan ? `Change the ${plan.name} plan.` : "A plan hospitals or individuals can pay for."
        }
      />
      <FormDialogBody>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="plan-name" className="gap-1">
            Name <RequiredMark />
          </FieldLabel>
          <Input
            id="plan-name"
            placeholder="e.g. Hospital Standard"
            aria-invalid={!!errors.name}
            className="bg-card"
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="plan-price" className="gap-1">
            Price (₦) <RequiredMark />
          </FieldLabel>
          <Input
            id="plan-price"
            inputMode="numeric"
            placeholder="e.g. 25000"
            aria-invalid={!!errors.price}
            className="bg-card"
            {...form.register("price")}
          />
          <FieldError errors={[errors.price]} />
        </Field>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          {selects.map(([name, label, options]) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`plan-${name}`}>{label}</FieldLabel>
                  <Select
                    items={options}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                  >
                    <SelectTrigger id={`plan-${name}`} className="w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(options).map(([value, text]) => (
                        <SelectItem key={value} value={value}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          ))}
        </div>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="plan-description" className="gap-1">
            Description <RequiredMark />
          </FieldLabel>
          <Textarea
            id="plan-description"
            placeholder="e.g. For hospitals with up to 50 staff"
            aria-invalid={!!errors.description}
            className="min-h-16 bg-card"
            {...form.register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="plan-features">Features</FieldLabel>
          <Textarea
            id="plan-features"
            placeholder="e.g. Unlimited patient records"
            aria-describedby="plan-features-hint"
            className="min-h-24 bg-card"
            {...form.register("features")}
          />
          <p id="plan-features-hint" className="type-caption text-fg-caption">
            One per line.
          </p>
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={save.isPending} className="h-11 px-5 type-heading-sm">
          {plan ? "Save changes" : "Add plan"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

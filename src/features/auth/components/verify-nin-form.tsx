import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useVerifyOwnNin } from "@/features/auth/api/mutations";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  type VerifyNinInput,
  type VerifyNinValues,
  verifyNinSchema,
} from "@/features/auth/lib/schemas";
import { useLogOut } from "@/hooks/use-log-out";
import { getErrorMessage } from "@/lib/api";
import { getPostLoginDestination, useAuthStore } from "@/stores/auth-store";

/**
 * Post-login gate screen for existing patients whose accounts do not yet have a verified NIN
 * (`next_step === "nin_not_verified"`).
 */
export function VerifyNinForm() {
  const navigate = useNavigate();
  const logOut = useLogOut();
  const verifyNinMutation = useVerifyOwnNin();

  const form = useForm<VerifyNinInput, unknown, VerifyNinValues>({
    resolver: zodResolver(verifyNinSchema),
    defaultValues: devPrefill?.verifyNin ?? { nin: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: VerifyNinValues) {
    try {
      await verifyNinMutation.mutateAsync({ nin: values.nin });
      useAuthStore.getState().setNextStep(null);
      toast.success("NIN verified successfully.");
      const destination = getPostLoginDestination(useAuthStore.getState().session);
      await navigate({ to: destination });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <AuthHeader
        title="Verify your NIN"
        description="To protect your health records and complete your account migration, please verify your 11-digit National Identification Number (NIN)."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.nin}>
            <FieldLabel htmlFor="nin" className="gap-1">
              National Identification Number (NIN) <RequiredMark />
            </FieldLabel>
            <Input
              id="nin"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter your 11-digit NIN"
              aria-required
              aria-invalid={!!errors.nin}
              className="bg-card"
              {...form.register("nin")}
            />
            <FieldDescription>
              Dial <span className="font-medium text-fg-body">*346#</span> on your registered phone
              line to check your NIN.
            </FieldDescription>
            <FieldError errors={[errors.nin]} />
          </Field>

          <div className="mt-3 flex flex-col gap-3">
            <Button
              type="submit"
              loading={isSubmitting || verifyNinMutation.isPending}
              className="h-12 w-full"
            >
              Verify NIN
              <CaretRightIcon data-icon="inline-end" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void logOut()}
              className="h-10 w-full"
            >
              Use a different account
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

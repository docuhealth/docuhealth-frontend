import { CaretRightIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompleteFirstLogin } from "@/features/auth/api/mutations";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  firstLoginRoleLabels,
  firstLoginSchema,
  type FirstLoginValues,
  genderLabels,
} from "@/features/auth/lib/schemas";
import { useLogOut } from "@/hooks/use-log-out";
import { getErrorMessage } from "@/lib/api";
import { getPostLoginDestination, useAuthStore } from "@/stores/auth-store";

/**
 * Post-login gate screen for migrated hospital accounts whose personal admin details
 * have not yet been captured (`next_step === "admin_details_required"`).
 */
export function FirstLoginForm() {
  const navigate = useNavigate();
  const logOut = useLogOut();
  const firstLoginMutation = useCompleteFirstLogin();

  const form = useForm<FirstLoginValues>({
    resolver: zodResolver(firstLoginSchema),
    defaultValues: devPrefill?.firstLogin ?? {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FirstLoginValues) {
    try {
      await firstLoginMutation.mutateAsync({
        firstname: values.firstName.trim(),
        lastname: values.lastName.trim(),
        phone_num: values.phone.trim(),
        gender: values.gender,
        role: values.role,
      });
      useAuthStore.getState().setNextStep(null);
      toast.success("Admin profile completed.");
      const destination = getPostLoginDestination(useAuthStore.getState().session);
      await navigate({ to: destination });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <AuthHeader
        title="Complete your admin profile"
        description="Welcome to the upgraded DocuHealth platform. Please provide your personal details to finish setting up your administrator account."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName" className="gap-1">
                First name <RequiredMark />
              </FieldLabel>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="E.g. Folake"
                aria-required
                aria-invalid={!!errors.firstName}
                className="bg-card"
                {...form.register("firstName")}
              />
              <FieldError errors={[errors.firstName]} />
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName" className="gap-1">
                Last name <RequiredMark />
              </FieldLabel>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="E.g. Adeyemi"
                aria-required
                aria-invalid={!!errors.lastName}
                className="bg-card"
                {...form.register("lastName")}
              />
              <FieldError errors={[errors.lastName]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className="gap-1">
              Phone number <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234-000-000-0000"
                aria-required
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              <InputGroupAddon>
                <PhoneIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.phone]} />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="gender" className="gap-1">
                    Gender <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={genderLabels}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id="gender"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(genderLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role" className="gap-1">
                    Role <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={firstLoginRoleLabels}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id="role"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(firstLoginRoleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <Button
              type="submit"
              loading={isSubmitting || firstLoginMutation.isPending}
              className="h-12 w-full"
            >
              Continue to dashboard
              <CaretRightIcon data-icon="inline-end" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void logOut()}
              className="h-10 w-full"
            >
              Log out
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

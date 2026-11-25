import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { appointmentsQuery } from "@/features/patient/api/queries";
import {
  recordParts,
  type ShareRequest,
  shareDurations,
  shareReasons,
  sharingPeopleQuery,
} from "@/features/patient/api/pending-sharing";
import { ShareItemsField } from "@/features/patient/components/share-items-field";
import { SharePersonPicker } from "@/features/patient/components/share-person-picker";
import { ShareSelect } from "@/features/patient/components/share-select";
import { ShareSelectAll } from "@/features/patient/components/share-select-all";
import { facilitiesOf } from "@/features/patient/lib/records";
import { durationLabels, reasonLabels, sharingFacilities } from "@/features/patient/lib/sharing";
import { useVisits } from "@/features/patient/lib/use-visits";

const shareSchema = z.object({
  facility: z.string().min(1, "Choose a facility"),
  personId: z.string().min(1, "Choose who you’re sharing with"),
  items: z.array(z.enum(recordParts)).min(1, "Choose at least one part of your record"),
  duration: z.enum(shareDurations, { error: "Choose how long they can see it" }),
  reason: z.enum(shareReasons).nullable(),
});
type ShareValues = z.input<typeof shareSchema>;

/** Sharing, step 1 of 2: where, who, what, for how long and why. */
export function ShareDetailsStep({
  defaultValues,
  pending,
  onSubmit,
}: {
  defaultValues: ShareRequest | null;
  pending: boolean;
  onSubmit: (share: ShareRequest) => void;
}) {
  const { data: visits = [] } = useVisits();
  const { data: appointments = [] } = useQuery(appointmentsQuery());
  const { data: people = [] } = useQuery(sharingPeopleQuery());
  const form = useForm<ShareValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: defaultValues ?? { facility: "", personId: "", items: [], reason: null },
  });
  const facility = useWatch({ control: form.control, name: "facility" });
  const facilities = sharingFacilities(facilitiesOf(visits, appointments), people);

  return (
    <>
      <FormDialogHeader
        title="Share my record"
        description="Choose who can see your record, what they see and for how long."
        progress={{ step: 1, total: 2 }}
      />
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(shareSchema.parse(values)))}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogBody>
          <Controller
            name="facility"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="share-facility" className="gap-1">
                  What facility are you sharing with? <RequiredMark />
                </FieldLabel>
                <ShareSelect
                  id="share-facility"
                  items={Object.fromEntries(facilities.map((name) => [name, name]))}
                  value={field.value}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("personId", "");
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="personId"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label" className="flex gap-1">
                  Who are you sharing with? <RequiredMark />
                </FieldLegend>
                <SharePersonPicker
                  people={people}
                  facility={facility}
                  value={field.value}
                  invalid={fieldState.invalid}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            name="items"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLegend variant="label" className="mb-0 flex gap-1">
                    What do you want to share? <RequiredMark />
                  </FieldLegend>
                  <ShareSelectAll value={field.value} onChange={field.onChange} />
                </div>
                <ShareItemsField
                  value={field.value}
                  invalid={fieldState.invalid}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="share-duration" className="gap-1">
                  How long should they have access? <RequiredMark />
                </FieldLabel>
                <ShareSelect
                  id="share-duration"
                  items={durationLabels}
                  value={field.value ?? ""}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="share-reason">Reason for sharing</FieldLabel>
                <ShareSelect
                  id="share-reason"
                  items={reasonLabels}
                  value={field.value ?? ""}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={(value) => field.onChange(value || null)}
                />
              </Field>
            )}
          />
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={pending} className="h-11 px-5 type-heading-sm">
            Share record
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FormDialogFooter>
      </form>
    </>
  );
}

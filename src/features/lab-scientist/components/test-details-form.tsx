import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSaveTestDetails } from "@/features/lab-scientist/api/mutations";
import { testCategoriesQuery, testCatalogueQuery } from "@/features/lab-scientist/api/queries";
import {
  type CatalogueTest,
  resultFormatLabels,
  turnaroundFromHours,
  unitLabels,
} from "@/features/lab-scientist/api/schemas";
import { ReferenceRangeFields } from "@/features/lab-scientist/components/reference-range-fields";
import { SelectField } from "@/features/lab-scientist/components/select-field";
import {
  newReferenceRange,
  parseTurnaround,
  type TestDetailsValues,
  testDetailsSchema,
  turnaroundUnitLabels,
} from "@/features/lab-scientist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/** The test's saved details, or a fresh start (with the catalogue's usual turnaround). */
function defaultsFor(test: CatalogueTest | null): TestDetailsValues {
  const details = test?.details;
  if (test && details) {
    const turnaround = parseTurnaround(details.turnaround);
    return {
      category: test.category?.id ?? "",
      testId: test.id,
      resultFormat: details.resultFormat,
      unit: details.unit,
      turnaround: turnaround.value,
      turnaroundUnit: turnaround.unit,
      criticalLow: String(details.criticalLow),
      criticalHigh: String(details.criticalHigh),
      references: details.references.length
        ? details.references.map((range) => ({
            age: range.age,
            gender: range.gender,
            pregnancy: range.pregnancy,
            min: String(range.min),
            max: String(range.max),
          }))
        : [newReferenceRange()],
    };
  }
  const turnaround = usualTurnaround(test);
  return {
    category: test?.category?.id ?? "",
    testId: test?.id ?? "",
    resultFormat: "numeric",
    unit: "milligrams_per_deciliter",
    turnaround: turnaround.value,
    turnaroundUnit: turnaround.unit,
    criticalLow: "",
    criticalHigh: "",
    references: [newReferenceRange()],
  };
}

const usualTurnaround = (test: CatalogueTest | null | undefined) =>
  test?.defaultTurnaroundHours
    ? parseTurnaround(turnaroundFromHours(test.defaultTurnaroundHours))
    : { value: "1", unit: "days" as const };

/**
 * How the lab reports a test: its result format and unit, turnaround, panic limits and reference
 * ranges. With no `test` (Add test), the admin first picks one the lab hasn't set up, by category.
 */
export function TestDetailsForm({
  test,
  onDone,
}: {
  test: CatalogueTest | null;
  onDone: () => void;
}) {
  const save = useSaveTestDetails();
  const form = useForm<TestDetailsValues>({
    resolver: zodResolver(testDetailsSchema),
    defaultValues: defaultsFor(test),
  });
  const { errors } = form.formState;
  const picking = !test;
  const category = useWatch({ control: form.control, name: "category" });
  const { data: categories } = useQuery({ ...testCategoriesQuery(), enabled: picking });
  const { data: inCategory, isFetching: loadingTests } = useQuery({
    ...testCatalogueQuery({ search: "", category, page: 1, pageSize: 100 }),
    enabled: picking && !!category,
  });
  // Only tests the lab hasn't set up; the rest are edited from their row.
  const choices = (inCategory?.items ?? []).filter((entry) => !entry.details);

  function onSubmit(values: TestDetailsValues) {
    const name = test?.name ?? choices.find(({ id }) => id === values.testId)?.name ?? "The test";
    save.mutate(
      { detailsId: test?.details?.id ?? null, values },
      {
        onSuccess: () => {
          toast.success(test?.details ? `${name} is updated.` : `${name} is set up for your lab.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={picking ? "Add test" : test.details ? `Edit ${test.name}` : `Set up ${test.name}`}
        description={
          test?.details
            ? "Your changes replace the saved details, reference ranges included."
            : "How your lab reports this test: its result, turnaround and normal ranges."
        }
      />
      <FormDialogBody>
        {picking && (
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <SelectField
                  id="test-category"
                  label="Category"
                  value={field.value}
                  options={Object.fromEntries((categories ?? []).map(({ id, name }) => [id, name]))}
                  placeholder={categories ? "Select a category" : "Loading…"}
                  onChange={(next) => {
                    field.onChange(next);
                    form.setValue("testId", "");
                  }}
                />
              )}
            />
            <Controller
              name="testId"
              control={form.control}
              render={({ field }) => (
                <SelectField
                  id="test-name"
                  label="Test"
                  required
                  value={field.value}
                  options={Object.fromEntries(choices.map(({ id, name }) => [id, name]))}
                  placeholder={
                    !category
                      ? "Pick a category first"
                      : loadingTests
                        ? "Loading…"
                        : choices.length === 0
                          ? "All set up already"
                          : "Select a test"
                  }
                  disabled={!category || choices.length === 0}
                  error={errors.testId}
                  onChange={(next) => {
                    field.onChange(next);
                    const usual = usualTurnaround(choices.find(({ id }) => id === next));
                    form.setValue("turnaround", usual.value);
                    form.setValue("turnaroundUnit", usual.unit);
                  }}
                />
              )}
            />
          </div>
        )}

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Controller
            name="resultFormat"
            control={form.control}
            render={({ field }) => (
              <SelectField
                id="test-result-format"
                label="Result format"
                required
                value={field.value}
                options={resultFormatLabels}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="unit"
            control={form.control}
            render={({ field }) => (
              <SelectField
                id="test-unit"
                label="Unit"
                required
                value={field.value}
                options={unitLabels}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.turnaround}>
            <FieldLabel htmlFor="test-turnaround" className="gap-1">
              Turnaround time <RequiredMark />
            </FieldLabel>
            <Input
              id="test-turnaround"
              inputMode="numeric"
              placeholder="e.g. 2"
              aria-invalid={!!errors.turnaround}
              className="bg-card"
              {...form.register("turnaround")}
            />
            <FieldError errors={[errors.turnaround]} />
          </Field>
          <Controller
            name="turnaroundUnit"
            control={form.control}
            render={({ field }) => (
              <SelectField
                id="test-turnaround-unit"
                label="In"
                value={field.value}
                options={turnaroundUnitLabels}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          {(
            [
              ["criticalLow", "Critical low", "Flag results below", "e.g. 1.0"],
              ["criticalHigh", "Critical high", "Flag results above", "e.g. 10.0"],
            ] as const
          ).map(([name, label, hint, placeholder]) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={`test-${name}`} className="gap-1">
                {label} <RequiredMark />
              </FieldLabel>
              <Input
                id={`test-${name}`}
                inputMode="decimal"
                placeholder={placeholder}
                aria-invalid={!!errors[name]}
                aria-describedby={`test-${name}-hint`}
                className="bg-card"
                {...form.register(name)}
              />
              <p id={`test-${name}-hint`} className="type-caption text-fg-caption">
                {hint} (panic limit).
              </p>
              <FieldError errors={[errors[name]]} />
            </Field>
          ))}
        </div>

        <ReferenceRangeFields form={form} />
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={save.isPending} className="h-11 px-5 type-heading-sm">
          {test?.details ? "Save changes" : picking ? "Add test" : "Set up test"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

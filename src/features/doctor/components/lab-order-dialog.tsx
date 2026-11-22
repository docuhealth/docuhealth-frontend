import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { FilterSelect } from "@/components/dashboard/filter-select";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  type LabTest,
  labCategoriesQuery,
  labTestsQuery,
  useOrderLabTests,
  type VisitRef,
} from "@/features/doctor/api/orders";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";

const ALL = "all";

/** The API's warning that a test was ordered lately, if that's why it refused. */
function duplicateWarning(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 400) return null;
  const data = error.response.data as Record<string, unknown> | undefined;
  const warning = data?.duplicate_warning;
  if (!warning) return null;
  return typeof warning === "string"
    ? warning
    : "Some of these tests were ordered for this patient lately.";
}

/** Order lab tests: pick a category or search them all, tick the tests, add a note. */
export function LabOrderDialog({
  open,
  onOpenChange,
  visit,
  hin,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: VisitRef;
  hin: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <LabOrderForm
          visit={visit}
          hin={hin}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function LabOrderForm({
  visit,
  hin,
  patientName,
  onDone,
}: {
  visit: VisitRef;
  hin: string;
  patientName: string;
  onDone: () => void;
}) {
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const [chosen, setChosen] = useState<Map<string, LabTest>>(new Map());
  const [note, setNote] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const { data: categories } = useQuery(labCategoriesQuery());
  // A search looks across every category.
  const { data: tests, isError } = useQuery(
    labTestsQuery(term || category === ALL ? "" : category, term),
  );
  const order = useOrderLabTests();

  function toggle(test: LabTest, checked: boolean) {
    const next = new Map(chosen);
    if (checked) next.set(test.id, test);
    else next.delete(test.id);
    setChosen(next);
    setWarning(null);
  }

  function send(anyway: boolean) {
    if (chosen.size === 0) {
      toast.error("Tick at least one test.");
      return;
    }
    order.mutate(
      { visit, hin, testIds: [...chosen.keys()], note: note.trim(), anyway },
      {
        onSuccess: () => {
          toast.success(
            `${chosen.size === 1 ? "The test is" : "The tests are"} ordered for ${patientName}.`,
          );
          onDone();
        },
        onError: (error) => {
          const duplicate = duplicateWarning(error);
          if (duplicate) setWarning(duplicate);
          else toast.error(getErrorMessage(error));
        },
      },
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send(false);
      }}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader title="Order lab tests" description={`Tests for ${patientName}.`} />
      <FormDialogBody>
        <div className="flex flex-wrap gap-3">
          <SearchField
            label="Search tests"
            placeholder="Search every test"
            value={search}
            onChange={setSearch}
            className="min-w-48 flex-1"
          />
          <FilterSelect
            label="Category"
            value={category}
            options={{
              [ALL]: "All categories",
              ...Object.fromEntries((categories ?? []).map(({ sqid, name }) => [sqid, name])),
            }}
            onChange={setCategory}
            className={term ? "pointer-events-none opacity-50" : undefined}
          />
        </div>

        <ul
          aria-label="Tests"
          className="flex max-h-72 flex-col divide-y overflow-y-auto rounded-lg border"
        >
          {isError ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              We couldn’t load the tests. Try again in a moment.
            </li>
          ) : !tests ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">Loading…</li>
          ) : tests.length === 0 ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              No tests match.
            </li>
          ) : (
            tests.map((test) => {
              const id = `test-${test.id}`;
              return (
                <li key={test.id}>
                  <Field orientation="horizontal" className="px-4 py-2.5">
                    <Checkbox
                      id={id}
                      checked={chosen.has(test.id)}
                      onCheckedChange={(checked) => toggle(test, checked === true)}
                    />
                    <FieldLabel
                      htmlFor={id}
                      className="flex flex-1 flex-col items-start gap-0 font-normal"
                    >
                      <span className="type-body-sm-regular text-fg-heading">{test.name}</span>
                      <span className="type-caption text-fg-caption">
                        {[test.category, test.fasting && "Fasting"].filter(Boolean).join(" · ")}
                      </span>
                    </FieldLabel>
                  </Field>
                </li>
              );
            })
          )}
        </ul>
        <p className="type-body-sm-regular text-fg-caption">
          {chosen.size === 0
            ? "No tests ticked yet."
            : `Ordering: ${[...chosen.values()].map(({ name }) => name).join(", ")}`}
        </p>

        <Field>
          <FieldLabel htmlFor="labOrderNote">Note for the lab</FieldLabel>
          <Textarea
            id="labOrderNote"
            value={note}
            maxLength={1000}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Suspected malaria; urgent"
            className="min-h-20 bg-card"
          />
        </Field>

        {warning && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg bg-warning-100 px-4 py-3">
            <p className="type-body-sm-regular text-fg-heading">{warning}</p>
            <Button
              type="button"
              variant="outline"
              loading={order.isPending}
              onClick={() => send(true)}
              className="self-start bg-card type-body-sm-medium"
            >
              Order anyway
            </Button>
          </div>
        )}
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="submit"
          loading={order.isPending && !warning}
          className="h-11 px-5 type-heading-sm"
        >
          Order {chosen.size > 0 ? chosen.size : ""} {chosen.size === 1 ? "test" : "tests"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

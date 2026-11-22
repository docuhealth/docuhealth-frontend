import { XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import {
  type Scan,
  scanSearchQuery,
  useOrderScans,
  type VisitRef,
} from "@/features/doctor/api/orders";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";

/** Order scans: search the catalogue, add each scan, then send them to radiology. */
export function ScanOrderDialog({
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
        <ScanOrderForm
          visit={visit}
          hin={hin}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function ScanOrderForm({
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
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const [chosen, setChosen] = useState<Scan[]>([]);
  const { data: scans, isError, isFetching } = useQuery(scanSearchQuery(term));
  const order = useOrderScans();

  function send() {
    if (chosen.length === 0) {
      toast.error("Add at least one scan.");
      return;
    }
    order.mutate(
      { visit, hin, scanIds: chosen.map(({ id }) => id) },
      {
        onSuccess: () => {
          toast.success(
            `${chosen.length === 1 ? "The scan is" : "The scans are"} ordered for ${patientName}.`,
          );
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const results = (scans ?? []).filter(({ id }) => !chosen.some((scan) => scan.id === id));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader title="Order scans" description={`Imaging for ${patientName}.`} />
      <FormDialogBody>
        <SearchField
          label="Search scans"
          placeholder="e.g. Chest X-ray, CT abdomen"
          value={search}
          onChange={setSearch}
        />
        <ul
          aria-label="Scans found"
          className="flex max-h-64 flex-col divide-y overflow-y-auto rounded-lg border"
        >
          {term.length < 2 ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              Type at least 2 letters to search.
            </li>
          ) : isError ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              We couldn’t search the scans. Try again in a moment.
            </li>
          ) : !scans || (isFetching && results.length === 0) ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-4 py-6 text-center type-body-sm-regular text-fg-caption">
              No scans match.
            </li>
          ) : (
            results.map((scan) => (
              <li key={scan.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex-1 type-body-sm-regular text-fg-heading">{scan.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Add ${scan.name}`}
                  onClick={() => setChosen([...chosen, scan])}
                  className="bg-card type-caption-semibold font-sans"
                >
                  Add
                </Button>
              </li>
            ))
          )}
        </ul>

        <section aria-label="Scans to order" className="flex flex-col gap-2">
          <h3 className="type-body-sm-medium text-fg-heading">To order ({chosen.length})</h3>
          {chosen.length === 0 ? (
            <p className="type-body-sm-regular text-fg-caption">No scans added yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {chosen.map((scan) => (
                <li
                  key={scan.id}
                  className="flex items-center gap-3 rounded-md bg-line px-3 py-2 type-body-sm-regular"
                >
                  <span className="flex-1 text-fg-heading">{scan.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${scan.name}`}
                    onClick={() => setChosen(chosen.filter(({ id }) => id !== scan.id))}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={order.isPending} className="h-11 px-5 type-heading-sm">
          Order {chosen.length > 0 ? chosen.length : ""} {chosen.length === 1 ? "scan" : "scans"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

import { SyringeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { dated } from "@/features/patient/lib/dated";
import { notYet } from "@/features/patient/lib/not-yet";

/**
 * A vaccine a dependant is due: "MMR booster due", by when and where, and "Book vaccination".
 * TODO(api): booking is for the signed-in patient only (nobody can act for a dependant yet).
 */
export function DependantVaccineDue({
  name,
  dueBy,
  where,
}: {
  name: string;
  dueBy: string;
  where: string | null;
}) {
  return (
    <section aria-label={`${name} due`} className="flex flex-col rounded-xl border bg-card">
      <div className="mx-4 flex items-center gap-3 border-b py-4">
        <span className="grid size-9 shrink-0 place-content-center rounded-md bg-error-100 text-error-500">
          <SyringeIcon className="size-5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="type-body-sm-medium text-error-500">{name} due</span>
          <span className="type-caption text-fg-caption">
            {[`Due by ${dated(dueBy)}`, where].filter(Boolean).join(" · ")}
          </span>
        </span>
      </div>
      <div className="p-4">
        <Button
          type="button"
          variant="outline"
          onClick={notYet("Booking a vaccination for a dependent")}
          className="h-10 w-full border-primary type-body-sm-medium text-primary"
        >
          Book vaccination
        </Button>
      </div>
    </section>
  );
}
